// const cron = require("node-cron");
// const axios = require("axios");
// const Hotel = require("../models/Hotel");

// const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY;

// // ✅ Scheduled Task to Fetch Updated TripAdvisor Data Weekly
// const updateHotelRatings = async () => {
//   try {
//     const hotels = await Hotel.find();

//     for (let hotel of hotels) {
//       if (!hotel.locationId) continue; // Skip hotels without a location ID

//       try {
//         // Fetch updated TripAdvisor data
//         const response = await axios.get(`https://api.tripadvisor.com/v2/location/${hotel.locationId}/details`, {
//           headers: { Authorization: `Bearer ${TRIPADVISOR_API_KEY}` },
//         });

//         const tripAdvisorData = response.data;

//         // Fetch latest reviews (max 5)
//         const reviewsResponse = await axios.get(`https://api.tripadvisor.com/v2/location/${hotel.locationId}/reviews`, {
//           headers: { Authorization: `Bearer ${TRIPADVISOR_API_KEY}` },
//         });

//         const latestReviews = reviewsResponse.data.reviews.slice(0, 5).map((review) => ({
//           review: review.text,
//           rating: review.rating,
//         }));

//         // Fetch photos (max 5)
//         const photosResponse = await axios.get(`https://api.tripadvisor.com/v2/location/${hotel.locationId}/photos`, {
//           headers: { Authorization: `Bearer ${TRIPADVISOR_API_KEY}` },
//         });

//         const latestPhotos = photosResponse.data.photos.slice(0, 5).map((photo) => photo.images.large.url);

//         // Update the hotel with new data
//         await Hotel.findByIdAndUpdate(hotel._id, {
//           tripAdvisorRating: tripAdvisorData.rating,
//           tripAdvisorReviews: tripAdvisorData.num_reviews,
//           tripAdvisorLatestReviews: latestReviews,
//           tripAdvisorPhotos: latestPhotos,
//           tripAdvisorLink: tripAdvisorData.web_url,
//         });

//         console.log(`✅ Updated TripAdvisor data for: ${hotel.name}`);
//       } catch (error) {
//         console.error(`❌ Failed to fetch data for ${hotel.name}:`, error.message);
//       }
//     }
//   } catch (error) {
//     console.error("❌ Error updating hotels:", error.message);
//   }
// };

// // ✅ Run Cron Job Weekly (Every Monday at Midnight)
// cron.schedule("0 0 * * 1", () => {
//   console.log("🔄 Running TripAdvisor data update...");
//   updateHotelRatings();
// });

// module.exports = updateHotelRatings;

const cron = require("node-cron");
const axios = require("axios");
const Hotel = require("../models/Hotel");

const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY;

// ✅ Scheduled Task to Fetch Updated TripAdvisor Data Weekly
const updateHotelRatings = async () => {
  try {
    const hotels = await Hotel.find();

    for (let hotel of hotels) {
      if (!hotel.locationId) continue;

      const baseUrl = `https://api.content.tripadvisor.com/api/v1/location/${hotel.locationId}`;

      try {
        const detailsResponse = await axios.get(`${baseUrl}/details`, {
          params: {
            key: TRIPADVISOR_API_KEY,
            language: "en",
          },
        });

        const reviewsResponse = await axios.get(`${baseUrl}/reviews`, {
          params: {
            key: TRIPADVISOR_API_KEY,
            language: "en",
            limit: 5,
          },
        });

        const photosResponse = await axios.get(`${baseUrl}/photos`, {
          params: {
            key: TRIPADVISOR_API_KEY,
            language: "en",
            limit: 5,
          },
        });

        const tripAdvisorData = detailsResponse.data;

        const latestReviews = reviewsResponse.data.data.map((review) => ({
          review: review.text,
          rating: review.rating,
        }));

        const latestPhotos = photosResponse.data.data.map(
          (photo) => photo.images.original.url
        );

        await Hotel.findByIdAndUpdate(hotel._id, {
          tripAdvisorRating: tripAdvisorData.rating,
          tripAdvisorReviews: tripAdvisorData.num_reviews,
          tripAdvisorLatestReviews: latestReviews,
          tripAdvisorPhotos: latestPhotos,
          tripAdvisorLink: tripAdvisorData.web_url,
        });

        console.log(`✅ Updated TripAdvisor data for: ${hotel.name}`);
      } catch (error) {
        console.error(
          `❌ Failed to fetch data for ${hotel.name}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error("❌ Error updating hotels:", error.message);
  }
};

// ✅ Run Cron Job Weekly (Every Monday at Midnight)
cron.schedule("0 0 * * 1", () => {
  console.log("🔄 Running TripAdvisor data update...");
  updateHotelRatings();
});

module.exports = updateHotelRatings;
