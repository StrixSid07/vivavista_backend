// const axios = require("axios");
// const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY;

// // ✅ Function to Fetch TripAdvisor Data
// const fetchTripAdvisorData = async (locationId) => {
//   if (!locationId) return null;

//   try {
//     // Fetch basic hotel details
//     const detailsResponse = await axios.get(`https://api.tripadvisor.com/v2/location/${locationId}/details`, {
//       headers: { Authorization: `Bearer ${TRIPADVISOR_API_KEY}` },
//     });

//     const hotelData = detailsResponse.data;

//     // Fetch latest reviews (max 5)
//     const reviewsResponse = await axios.get(`https://api.tripadvisor.com/v2/location/${locationId}/reviews`, {
//       headers: { Authorization: `Bearer ${TRIPADVISOR_API_KEY}` },
//     });

//     const latestReviews = reviewsResponse.data.reviews.slice(0, 5).map((review) => ({
//       review: review.text,
//       rating: review.rating,
//     }));

//     // Fetch photos (max 5)
//     const photosResponse = await axios.get(`https://api.tripadvisor.com/v2/location/${locationId}/photos`, {
//       headers: { Authorization: `Bearer ${TRIPADVISOR_API_KEY}` },
//     });

//     const latestPhotos = photosResponse.data.photos.slice(0, 5).map((photo) => photo.images.large.url);

//     return {
//       rating: hotelData.rating,
//       reviews: hotelData.num_reviews,
//       latestReviews,
//       photos: latestPhotos,
//       link: hotelData.web_url,
//     };
//   } catch (error) {
//     console.error(`❌ Failed to fetch TripAdvisor data for locationId ${locationId}:`, error.message);
//     return null;
//   }
// };

// module.exports = { fetchTripAdvisorData };

//hello this is test commit

const axios = require("axios");
const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY;

// ✅ Function to Fetch TripAdvisor Data
const fetchTripAdvisorData = async (locationId) => {
  if (!locationId) return null;

  try {
    const baseUrl = `https://api.content.tripadvisor.com/api/v1/location/${locationId}`;

    // Fetch basic hotel details
    const detailsResponse = await axios.get(`${baseUrl}/details`, {
      params: {
        key: TRIPADVISOR_API_KEY,
        language: "en",
      },
    });

    const hotelData = detailsResponse.data;

    // Fetch latest reviews (max 5)
    const reviewsResponse = await axios.get(`${baseUrl}/reviews`, {
      params: {
        key: TRIPADVISOR_API_KEY,
        language: "en",
        limit: 5,
      },
    });

    const latestReviews = reviewsResponse.data.data.map((review) => ({
      review: review.text,
      rating: review.rating,
    }));

    // Fetch photos (max 5)
    const photosResponse = await axios.get(`${baseUrl}/photos`, {
      params: {
        key: TRIPADVISOR_API_KEY,
        language: "en",
        limit: 5,
      },
    });

    const latestPhotos = photosResponse.data.data.map(
      (photo) => photo.images.original.url
    );

    return {
      rating: hotelData.rating,
      reviews: hotelData.num_reviews,
      latestReviews,
      photos: latestPhotos,
      link: hotelData.web_url,
    };
  } catch (error) {
    console.error(
      `❌ Failed to fetch TripAdvisor data for locationId ${locationId}:`,
      error.message
    );
    return null;
  }
};

module.exports = { fetchTripAdvisorData };
