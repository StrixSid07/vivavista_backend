const Hotel = require("../models/Hotel");
const { fetchTripAdvisorData } = require("../services/tripAdvisorService");

// ✅ Create a New Hotel and Fetch Initial Data from TripAdvisor
const createHotel = async (req, res) => {
  try {
    const { namehotel, about, facilities, location, locationId, externalBookingLink, images } = req.body;

    if (!locationId) {
      return res.status(400).json({ message: "TripAdvisor `locationId` is required." });
    }
    console.log("this is hotle",namehotel);

    // ✅ Save the hotel first (without TripAdvisor data)
    const newHotel = new Hotel({
      name:namehotel,
      about,
      facilities,
      location,
      locationId,
      externalBookingLink,
      images,
    });

    await newHotel.save();

    res.status(201).json({ message: "Hotel added successfully. TripAdvisor data will be updated shortly.", hotel: newHotel });

    // ✅ Fetch TripAdvisor data in the background
    fetchTripAdvisorData(locationId).then(async (tripAdvisorData) => {
      if (tripAdvisorData) {
        await Hotel.findByIdAndUpdate(newHotel._id, {
          tripAdvisorRating: tripAdvisorData.rating,
          tripAdvisorReviews: tripAdvisorData.reviews,
          tripAdvisorLatestReviews: tripAdvisorData.latestReviews,
          tripAdvisorPhotos: tripAdvisorData.photos,
          tripAdvisorLink: tripAdvisorData.link,
        });

        console.log(`✅ TripAdvisor data updated for: ${name}`);
      }
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Hotels
const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Single Hotel by ID
const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update Hotel
const updateHotel = async (req, res) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedHotel) return res.status(404).json({ message: "Hotel not found" });

    res.json({ message: "Hotel updated successfully", hotel: updatedHotel });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete Hotel
const deleteHotel = async (req, res) => {
  try {
    const deletedHotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!deletedHotel) return res.status(404).json({ message: "Hotel not found" });

    res.json({ message: "Hotel deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createHotel, getHotels, getHotelById, updateHotel, deleteHotel };
