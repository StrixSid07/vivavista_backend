const Hotel = require("../models/Hotel");
const { fetchTripAdvisorData } = require("../services/tripAdvisorService");
const IMAGE_STORAGE = process.env.IMAGE_STORAGE || "local";
const { uploadToS3,deleteFromS3 } = require("../middleware/imageUpload");
// ✅ Create a New Hotel and Fetch Initial Data from TripAdvisor
const createHotel = async (req, res) => {
  try {
    const parsedData = JSON.parse(req.body.data);
    const { name, about, facilities, location, locationId, externalBookingLink, images } = parsedData;
console.log(req.body);
    if (!locationId) {
      console.log("this id is require ");
      return res.status(400).json({ message: "TripAdvisor `locationId` is required." });
    }
    console.log("this is hotle",name);
     // Extract image URLs from the request
     let imageUrls = [];
     // if (req.files && req.files.length > 0) {
     //   imageUrls = req.files.map((file) =>
     //     IMAGE_STORAGE === "s3" ? file.location : `/uploads/${file.filename}`
     //   );
     // }
     if (req.files && req.files.length > 0) {
       if (IMAGE_STORAGE === "s3") {
         imageUrls = await Promise.all(
           req.files.map((file) => uploadToS3(file))
         );
       } else {
         imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
       }
     }
 

    // ✅ Save the hotel first (without TripAdvisor data)
    const newHotel = new Hotel({
      name,
      about,
      facilities,
      location,
      locationId,
      externalBookingLink,
      images:imageUrls,
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
    let newImageUrls = [];

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      if (IMAGE_STORAGE === "s3") {
        newImageUrls = await Promise.all(
          req.files.map((file) => uploadToS3(file))
        );
      } else {
        newImageUrls = req.files.map((file) => `/uploads/${file.filename}`);
      }
    }

    // Fetch existing hotel
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    // Merge old and new images
    const updatedImageList = [...(hotel.images || []), ...newImageUrls];

    // Prepare updated data
    const updateData = {
      ...req.body,
      images: updatedImageList
    };

    // Update hotel
    const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({ message: "Hotel updated successfully", hotel: updatedHotel });
  } catch (error) {
    console.error("Update Hotel Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteHotelImage= async(req,res)=>{
  const { hotelId } = req.params;
  const { imageUrl } = req.body;
  try{
    console.log(imageUrl);
  await deleteFromS3(imageUrl);


   // Remove image URL from MongoDB
   await Hotel.findByIdAndUpdate(hotelId, {
     $pull: { images: imageUrl },
   });
console.log("Image deleted successfully");
   res.status(200).json({ message: 'Image deleted successfully' });
  }
  catch(error){
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
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

module.exports = { createHotel, getHotels, getHotelById, updateHotel, deleteHotel ,deleteHotelImage};
