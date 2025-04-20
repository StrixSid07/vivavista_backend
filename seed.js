require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Hotel = require("./models/Hotel");
const Deal = require("./models/Deal");
const Booking = require("./models/Booking");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });

    console.log("✅ Connected to MongoDB");

    // ✅ Clear Existing Data
    // await User.deleteMany();
    // await Hotel.deleteMany();
    // await Deal.deleteMany();
    // await Booking.deleteMany();
    console.log("🗑 Database Cleared");

    const users = await User.insertMany([
      { name: "Admin User", email: "admin@example.com", password: "$2a$10$Pd.Goh1DHLzjNqD9z0ZHb.r2pbR2kOHcNImd0jCj3oDVD/edtoxb2", role: "admin" },
      { name: "Test User", email: "user@example.com", password: "$2a$10$Pd.Goh1DHLzjNqD9z0ZHb.r2pbR2kOHcNImd0jCj3oDVD/edtoxb2", role: "user" },
    ]);
    console.log("✅ Users Seeded");

    const hotels = await Hotel.insertMany([
      {
        name: "Beachfront Paradise",
        about: "A relaxing getaway at the beach.",
        facilities: ["Pool", "Spa", "Free Wi-Fi"],
        location: "Maldives",
        locationId: "123456789",
        tripAdvisorRating: 4.7,
        tripAdvisorReviews: 1000,
        tripAdvisorPhotos: [
          "https://source.unsplash.com/featured/?beach",
          "https://source.unsplash.com/featured/?resort"
        ],
        tripAdvisorLatestReviews: [{ review: "Fantastic service!", rating: 5 }],
        tripAdvisorLink: "https://tripadvisor.com/hotel/beachfront",
        externalBookingLink: "https://beachresort.com/book",
        images: ["https://source.unsplash.com/featured/?hotel"]
      },
      {
        name: "Dubai Grand Hotel",
        about: "Experience luxury in Dubai.",
        facilities: ["Gym", "Pool", "Free Parking"],
        location: "Dubai",
        locationId: "234567890",
        tripAdvisorRating: 4.5,
        tripAdvisorReviews: 1200,
        tripAdvisorPhotos: [
          "https://source.unsplash.com/featured/?dubai",
          "https://source.unsplash.com/featured/?luxury"
        ],
        tripAdvisorLatestReviews: [{ review: "Amazing view!", rating: 4 }],
        tripAdvisorLink: "https://tripadvisor.com/hotel/dubai-grand",
        externalBookingLink: "https://dubaigrand.com/book",
        images: ["https://source.unsplash.com/featured/?hotel,dubai"]
      },
      {
        name: "Barcelona Seaside Resort",
        about: "Relax by the beach in Barcelona.",
        facilities: ["Beach Access", "Pool", "Bar"],
        location: "Spain",
        locationId: "345678901",
        tripAdvisorRating: 4.8,
        tripAdvisorReviews: 900,
        tripAdvisorPhotos: [
          "https://source.unsplash.com/featured/?spain",
          "https://source.unsplash.com/featured/?resort"
        ],
        tripAdvisorLatestReviews: [{ review: "Loved the ambiance!", rating: 5 }],
        tripAdvisorLink: "https://tripadvisor.com/hotel/barcelona-seaside",
        externalBookingLink: "https://barcelonaseaside.com/book",
        images: ["https://source.unsplash.com/featured/?hotel,spain"]
      },
      {
        name: "Paris Eiffel Tower View",
        about: "Stay near the iconic Eiffel Tower.",
        facilities: ["Free Wi-Fi", "Restaurant", "Bar"],
        location: "France",
        locationId: "456789012",
        tripAdvisorRating: 4.6,
        tripAdvisorReviews: 850,
        tripAdvisorPhotos: [
          "https://source.unsplash.com/featured/?paris",
          "https://source.unsplash.com/featured/?eiffel"
        ],
        tripAdvisorLatestReviews: [{ review: "Romantic stay!", rating: 5 }],
        tripAdvisorLink: "https://tripadvisor.com/hotel/paris-eiffel",
        externalBookingLink: "https://pariseiffel.com/book",
        images: ["https://source.unsplash.com/featured/?hotel,paris"]
      },
      {
        name: "Bali Sunset Villas",
        about: "Enjoy tropical paradise in Bali.",
        facilities: ["Private Pool", "Spa", "Yoga"],
        location: "Indonesia",
        locationId: "567890123",
        tripAdvisorRating: 4.9,
        tripAdvisorReviews: 1500,
        tripAdvisorPhotos: [
          "https://source.unsplash.com/featured/?bali",
          "https://source.unsplash.com/featured/?villa"
        ],
        tripAdvisorLatestReviews: [{ review: "Peaceful and serene.", rating: 5 }],
        tripAdvisorLink: "https://tripadvisor.com/hotel/bali-villas",
        externalBookingLink: "https://balisunset.com/book",
        images: ["https://source.unsplash.com/featured/?hotel,bali"]
      }
    ]);
    console.log("✅ Hotels Seeded");

    const deals = await Deal.insertMany([
      {
        title: "Maldives Luxury Package",
        description: "Stay at the best resorts with an all-inclusive package.",
        images: ["https://source.unsplash.com/featured/?maldives"],
        availableCountries: ["UK", "USA"],
        boardBasis: "All Inclusive",
        isTopDeal: true,
        hotels: [hotels[0]._id],
        prices: [
          {
            country: "UK",
            airport: "LHR",
            hotel: hotels[0]._id,
            date: new Date("2025-04-10"),
            price: 999,
            flightDetails: {
              outbound: { departureTime: "14:30", arrivalTime: "19:00", airline: "Emirates", flightNumber: "EK101" },
              returnFlight: { departureTime: "21:00", arrivalTime: "02:30", airline: "Emirates", flightNumber: "EK102" },
            },
          },
        ],
        distanceToCenter: "500m",
        distanceToBeach: "100m",
      },
      {
        title: "Dubai Adventure Package",
        description: "Explore Dubai with luxury accommodations and desert safari.",
        images: ["https://source.unsplash.com/featured/?dubai"],
        availableCountries: ["UAE", "UK", "USA"],
        boardBasis: "Half Board",
        isTopDeal: true,
        hotels: [hotels[1]._id],
        prices: [
          {
            country: "UAE",
            airport: "DXB",
            hotel: hotels[1]._id,
            date: new Date("2025-05-15"),
            price: 1200,
            flightDetails: {
              outbound: { departureTime: "09:00", arrivalTime: "13:00", airline: "Etihad", flightNumber: "EY301" },
              returnFlight: { departureTime: "15:00", arrivalTime: "19:00", airline: "Etihad", flightNumber: "EY302" },
            },
          },
        ],
        distanceToCenter: "2km",
        distanceToBeach: "5km",
      },
      {
        title: "Spain Beach Getaway",
        description: "Relax at the sunny beaches of Spain with exclusive resorts.",
        images: ["https://source.unsplash.com/featured/?spain"],
        availableCountries: ["UK", "Spain", "France"],
        boardBasis: "All Inclusive",
        isTopDeal: false,
        hotels: [hotels[2]._id],
        prices: [
          {
            country: "Spain",
            airport: "BCN",
            hotel: hotels[2]._id,
            date: new Date("2025-06-20"),
            price: 850,
            flightDetails: {
              outbound: { departureTime: "10:00", arrivalTime: "13:30", airline: "Iberia", flightNumber: "IB501" },
              returnFlight: { departureTime: "14:30", arrivalTime: "18:00", airline: "Iberia", flightNumber: "IB502" },
            },
          },
        ],
        distanceToCenter: "1km",
        distanceToBeach: "200m",
      },
      {
        title: "Paris Romantic Escape",
        description: "Enjoy a romantic getaway in the city of love.",
        images: ["https://source.unsplash.com/featured/?paris"],
        availableCountries: ["France", "UK"],
        boardBasis: "Breakfast Only",
        isTopDeal: false,
        hotels: [hotels[3]._id],
        prices: [
          {
            country: "France",
            airport: "CDG",
            hotel: hotels[3]._id,
            date: new Date("2025-07-15"),
            price: 1300,
            flightDetails: {
              outbound: { departureTime: "11:00", arrivalTime: "14:30", airline: "Air France", flightNumber: "AF101" },
              returnFlight: { departureTime: "16:00", arrivalTime: "19:30", airline: "Air France", flightNumber: "AF102" },
            },
          },
        ],
        distanceToCenter: "800m",
        distanceToBeach: "N/A",
      },
      {
        title: "Thailand Tropical Escape",
        description: "Experience tropical bliss in Thailand.",
        images: ["https://source.unsplash.com/featured/?thailand"],
        availableCountries: ["Thailand", "UK"],
        boardBasis: "Full Board",
        isTopDeal: true,
        hotels: [hotels[4]._id],
        prices: [
          {
            country: "Thailand",
            airport: "BKK",
            hotel: hotels[4]._id,
            date: new Date("2025-08-10"),
            price: 1100,
            flightDetails: {
              outbound: { departureTime: "08:00", arrivalTime: "12:30", airline: "Thai Airways", flightNumber: "TG101" },
              returnFlight: { departureTime: "14:00", arrivalTime: "18:30", airline: "Thai Airways", flightNumber: "TG102" },
            },
          },
        ],
        distanceToCenter: "1.5km",
        distanceToBeach: "300m",
      },
      {
        title: "Italy Culinary Tour",
        description: "Taste the best cuisines in Italy with guided tours.",
        images: ["https://source.unsplash.com/featured/?italy"],
        availableCountries: ["Italy", "Germany"],
        boardBasis: "Breakfast Only",
        isTopDeal: true,
        hotels: [hotels[5]._id],
        prices: [
          {
            country: "Italy",
            airport: "FCO",
            hotel: hotels[5]._id,
            date: new Date("2025-09-20"),
            price: 950,
            flightDetails: {
              outbound: { departureTime: "10:00", arrivalTime: "14:00", airline: "Lufthansa", flightNumber: "LH101" },
              returnFlight: { departureTime: "16:00", arrivalTime: "20:00", airline: "Lufthansa", flightNumber: "LH102" },
            },
          },
        ],
        distanceToCenter: "2km",
        distanceToBeach: "N/A",
      },
      {
        title: "New York City Break",
        description: "Explore the Big Apple with luxury accommodations.",
        images: ["https://source.unsplash.com/featured/?newyork"],
        availableCountries: ["USA", "Canada"],
        boardBasis: "Room Only",
        isTopDeal: true,
        hotels: [hotels[6]._id],
        prices: [
          {
            country: "USA",
            airport: "JFK",
            hotel: hotels[6]._id,
            date: new Date("2025-10-15"),
            price: 1400,
            flightDetails: {
              outbound: { departureTime: "12:00", arrivalTime: "16:00", airline: "Delta", flightNumber: "DL201" },
              returnFlight: { departureTime: "18:00", arrivalTime: "22:00", airline: "Delta", flightNumber: "DL202" },
            },
          },
        ],
        distanceToCenter: "3km",
        distanceToBeach: "N/A",
      },
      {
        title: "Bali Adventure",
        description: "Enjoy Bali's beaches and culture.",
        images: ["https://source.unsplash.com/featured/?bali"],
        availableCountries: ["Indonesia", "Australia"],
        boardBasis: "All Inclusive",
        isTopDeal: true,
        hotels: [hotels[7]._id],
        prices: [
          {
            country: "Indonesia",
            airport: "DPS",
            hotel: hotels[7]._id,
            date: new Date("2025-11-10"),
            price: 1150,
            flightDetails: {
              outbound: { departureTime: "09:00", arrivalTime: "13:00", airline: "Garuda", flightNumber: "GA301" },
              returnFlight: { departureTime: "15:00", arrivalTime: "19:00", airline: "Garuda", flightNumber: "GA302" },
            },
          },
        ],
        distanceToCenter: "2km",
        distanceToBeach: "150m",
      }
    ]);
    console.log("✅ Deals Seeded");

    // const bookings = await Booking.insertMany([
    //     {
    //         userId: users[1]._id, // Registered user (or null for guests)
    //         dealId: deals[0]._id,
    //         name: "John Doe",
    //         email: "john@example.com",
    //         phone: "+44 123456789",
    //         country: "UK",
    //         airport: "LHR",
    //         selectedDate: new Date("2025-04-10"),
    //         returnDate: new Date("2025-04-17"),
    //         adults: 2,
    //         children: 1,
    //         selectedHotel: hotels[0]._id,
    //         selectedPrice: deals[0].prices[0], // Selecting first price option
    //         status: "confirmed"
    //     },
    //     {
    //         userId: null, // Guest user
    //         dealId: deals[0]._id,
    //         name: "Alice Johnson",
    //         email: "alice@example.com",
    //         phone: "+1 987654321",
    //         country: "USA",
    //         airport: "JFK",
    //         selectedDate: new Date("2025-05-05"),
    //         returnDate: new Date("2025-05-12"),
    //         adults: 1,
    //         children: 0,
    //         selectedHotel: hotels[0]._id,
    //         selectedPrice: deals[0].prices[0],
    //         status: "pending"
    //     }
    // ]);

    
    console.log("✅ Bookings Seeded");
    console.log("🚀 Seeding Complete! Exiting...");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding Failed:", error);
    process.exit(1);
  }
};

seedDatabase();
