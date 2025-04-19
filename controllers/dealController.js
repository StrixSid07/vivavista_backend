const Deal = require("../models/Deal");
const Hotel = require("../models/Hotel");
const Destination = require("../models/Destination");
const IMAGE_STORAGE = process.env.IMAGE_STORAGE || "local";
const { uploadToS3,deleteFromS3 } = require("../middleware/imageUpload");

// ✅ Create a New Deal with Image Upload
const createDeal = async (req, res) => {
  try {
    const parsedData = JSON.parse(req.body.data);

    const {
      title,
      description,
      availableCountries,
      destination,
      prices,
      hotels,
      holidaycategories,
      itinerary,
      boardBasis,
      isTopDeal,
      isHotdeal,
      isFeatured,
      distanceToCenter,
      distanceToBeach,
      days,
      whatsIncluded,
      exclusiveAdditions,
      termsAndConditions,
      rooms,
      guests,
      tag,
      LowDeposite,
    } = parsedData; // Now you can access properties directly
    console.log("this is req body", req.body.data);
    console.log("this is country", availableCountries);
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required." });
    }
    if (!Array.isArray(availableCountries) || availableCountries.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one country must be selected." });
    }
    if (!Array.isArray(hotels) || hotels.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one hotel must be added." });
    }
    if (!Array.isArray(prices) || prices.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one price entry is required." });
    }
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

    const newDeal = new Deal({
      title,
      description,
      images: imageUrls,
      availableCountries,
      prices,
      boardBasis,
      isTopDeal,
      isHotdeal,
      isFeatured,
      destination,
      hotels,
      holidaycategories,
      rooms,
      itinerary,
      guests,
      days,
      distanceToCenter,
      distanceToBeach,
      whatsIncluded,
      exclusiveAdditions,
      termsAndConditions,
      tag,
      LowDeposite,
    });

    await newDeal.save();

    if (destination) {
      const updatedDestination = await Destination.findByIdAndUpdate(
        destination,
        { $addToSet: { deals: newDeal._id } },
        { new: true }
      );
      console.log("Updated Destination:", updatedDestination);
    }

    res
      .status(201)
      .json({ message: "Deal created successfully", deal: newDeal });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Deals (Restricted to User's Selected Country)
const getAllDeals = async (req, res) => {
  try {
    const {
      country,
      airport,
      fromdate,
      todate,
      minPrice,
      destination,
      maxPrice,
      boardBasis,
      rating,
      holidayType,
      facilities,
      rooms,
      guests,
      sort,
      search,
    } = req.query;

    let query = {};

    // ✅ Filter by Country
    if (country) query.availableCountries = country;
    if (destination) query["destination"] = destination;
    // ✅ Filter by Airport
    if (airport) query["prices.airport"] = airport;
    // ✅ Filter by Date Range
    if (fromdate && todate) {
      query["prices"] = {
        $elemMatch: {
          startdate: { $gte: new Date(fromdate), $lte: new Date(todate) },
        },
      };
    }
    // ✅ Filter by Price Range
    if (minPrice || maxPrice) {
      query["prices.price"] = {};
      if (minPrice) query["prices.price"].$gte = Number(minPrice);
      if (maxPrice) query["prices.price"].$lte = Number(maxPrice);
    }

    // ✅ Filter by Board Basis
    if (boardBasis) query.boardBasis = boardBasis;

    // ✅ Filter by Rating
    if (rating) query["hotels.tripAdvisorRating"] = { $gte: Number(rating) };

    // ✅ Filter by Holiday Type
    if (holidayType)
      query["hotels.facilities"] = { $in: holidayType.split(",") };

    // ✅ Filter by Facilities
    if (facilities)
      query["hotels.facilities"] = { $all: facilities.split(",") };

    // ✅ Search by Hotel Name
    if (search) query["hotels.name"] = { $regex: search, $options: "i" };

    // ✅ Filter by Rooms & Guests
    if (rooms) query.rooms = Number(rooms);
    if (guests) query.guests = Number(guests);

    // ✅ Apply Sorting
    // let sortOption = {};
    // if (sort === "lowest-price") sortOption["prices.price"] = 1;
    // if (sort === "highest-price") sortOption["prices.price"] = -1;
    // if (sort === "best-rating") sortOption["hotels.tripAdvisorRating"] = -1;
    let sortOption = { "prices.price": 1 };

    if (sort === "highest-price") {
      sortOption = { "prices.price": -1 };
    } else if (sort === "best-rating") {
      sortOption = { "hotels.tripAdvisorRating": -1 };
    }

    // ✅ Fetch Deals with Filters & Sorting
    let deals = await Deal.find(query)
      .populate("destination")
      .populate("hotels", "name tripAdvisorRating facilities location images")
      .populate({
        path: "prices.hotel",
        select: "name tripAdvisorRating tripAdvisorReviews",
      })
      .select(
        "title tag LowDeposite availableCountries description rooms guests prices boardBasis distanceToCenter distanceToBeach days images isTopDeal isHotdeal isFeatured holidaycategories itinerary whatsIncluded exclusiveAdditions termsAndConditions"
      )
      .sort(sortOption)
      .limit(50) // Limit to 50 results for performance
      .lean();

    console.log("🚀 ~ getAllDeals ~ deals:", deals);
    // ✅ Filter flight details based on the selected airport
    deals = deals
      .map((deal) => {
        const relevantPrices = deal.prices.filter((p) => {
          const matchAirport = !airport || p.airport === airport;
          // const matchDate = (!fromdate || new Date(p.date) >= new Date(fromdate)) &&
          //                   (!enddate || new Date(p.date) <= new Date(enddate));
          return matchAirport;
        });

        return relevantPrices.length > 0
          ? { ...deal, prices: relevantPrices }
          : null;
      })
      .filter(Boolean);

    // ✅ Sort prices inside each deal
    deals = deals.map((deal) => {
      if (sort === "highest-price") {
        deal.prices.sort((a, b) => b.price - a.price);
      } else {
        deal.prices.sort((a, b) => a.price - b.price);
      }
      return deal;
    });

    console.log("🚀 ~ getAllDeals ~ deals:", deals);
    res.json(deals);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Deals for Admin
const getAllDealsAdmin = async (req, res) => {
  try {
    const {
      country,
      airport,
      minPrice,
      maxPrice,
      boardBasis,
      rating,
      holidayType,
      facilities,
      rooms,
      guests,
      sort,
      search,
    } = req.query;

    let query = {};

    // ✅ Filter by Country
    if (country) query.availableCountries = country;

    // ✅ Filter by Airport
    if (airport) query["prices.airport"] = airport;

    // ✅ Filter by Price Range
    if (minPrice || maxPrice) {
      query["prices.price"] = {};
      if (minPrice) query["prices.price"].$gte = Number(minPrice);
      if (maxPrice) query["prices.price"].$lte = Number(maxPrice);
    }

    // ✅ Filter by Board Basis
    if (boardBasis) query.boardBasis = boardBasis;

    // ✅ Filter by Rating
    if (rating) query["hotels.tripAdvisorRating"] = { $gte: Number(rating) };

    // ✅ Filter by Holiday Type
    if (holidayType) {
      query["hotels.facilities"] = { $in: holidayType.split(",") };
    }

    // ✅ Filter by Facilities
    if (facilities) {
      query["hotels.facilities"] = { $all: facilities.split(",") };
    }

    // ✅ Search by Hotel Name
    if (search) {
      query["hotels.name"] = { $regex: search, $options: "i" };
    }

    // ✅ Filter by Rooms & Guests
    if (rooms) query.rooms = Number(rooms);
    if (guests) query.guests = Number(guests);

    // ✅ Apply Sorting
    let sortOption = {};
    if (sort === "lowest-price") sortOption["prices.price"] = 1;
    if (sort === "highest-price") sortOption["prices.price"] = -1;
    if (sort === "best-rating") sortOption["hotels.tripAdvisorRating"] = -1;

    // ✅ Fetch Deals with Filters & Sorting
    let deals = await Deal.find(query)
      .populate("destination") // Populate destination details
      .populate("hotels", "name tripAdvisorRating facilities location images") // Populate hotel details
      .select("title prices boardBasis distanceToCenter distanceToBeach images") // Select relevant fields
      .sort(sortOption)
      .limit(50) // Limit to 50 results for performance
      .lean();

    console.log("🚀 ~ getAllDealsAdmin ~ deals:", deals);

    res.json(deals);
  } catch (error) {
    console.error("Error fetching deals for admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get a Single Deal (Only If Available in User's Selected Country)
// const getDealById = async (req, res) => {
//   try {
//     const deal = await Deal.findById(req.params.id)
//       .populate("destination", "name isPopular")
//       .populate("prices.hotel")
//       .populate("hotels");

//     if (!deal) return res.status(404).json({ message: "Deal not found" });

//     // If the user is NOT an admin, apply country restriction
//     if (!req.user || req.user.role !== "admin") {
//       const userCountry = req.session.country || "UK";
//       if (!deal.availableCountries.includes(userCountry)) {
//         return res.status(403).json({
//           message: "This deal is not available in your selected country.",
//         });
//       }

//       // Filter price for the selected country
//       // const countryPrice = deal.prices.find((p) => p.country === userCountry);
//       const countryPrices = deal.prices.filter(
//         (p) => p.country === userCountry
//       );

//       // if (!countryPrice) {
//       //   return res.status(404).json({
//       //     message: "Pricing not available for your selected country.",
//       //   });
//       // }

//       if (!countryPrices) {
//         return res.status(404).json({
//           message: "Pricing not available for your selected country.",
//         });
//       }

//       return res.json({
//         ...deal._doc,
//         // prices: [countryPrice], // Only return the price for user's country
//         prices: countryPrices,
//       });
//     }

//     // Admin gets full deal data
//     res.json(deal);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate("destination", "name isPopular")
      .populate("prices.hotel")
      .populate("hotels");

    if (!deal) return res.status(404).json({ message: "Deal not found" });

    // Get today's date and the date three days from now
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    // If the user is NOT an admin, apply country restriction
    if (!req.user || req.user.role !== "admin") {
      const userCountry = req.session.country || "UK";
      if (!deal.availableCountries.includes(userCountry)) {
        return res.status(403).json({
          message: "This deal is not available in your selected country.",
        });
      }

      // Filter prices for the selected country and with startdate more than 3 days from today
      const countryPrices = deal.prices.filter((p) => {
        const startDate = new Date(p.startdate);
        return p.country === userCountry && startDate > threeDaysFromNow;
      });

      // Set prices to an empty array if no valid prices are found
      deal.prices = countryPrices.length > 0 ? countryPrices : [];
    }

    // Return the deal with the filtered prices (which may be empty)
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update a Deal (Admin Only)
// const updateDeal = async (req, res) => {
//   try {
//     const dealId = req.params.id;
//     const deal = await Deal.findById(dealId);

//     if (!deal) {
//       return res.status(404).json({ message: "Deal not found" });
//     }

//     // Validate availableCountries if provided
//     if (
//       req.body.availableCountries &&
//       (!Array.isArray(req.body.availableCountries) ||
//         req.body.availableCountries.length === 0)
//     ) {
//       return res
//         .status(400)
//         .json({ message: "At least one country must be selected." });
//     }

//     // Extract image URLs from the request
//     let imageUrls = [];
//     // if (req.files && req.files.length > 0) {
//     //   imageUrls = req.files.map((file) =>
//     //     IMAGE_STORAGE === "s3" ? file.location : `/uploads/${file.filename}`
//     //   );
//     // }

//     // Parse the JSON data from req.body.data

//     if (req.files && req.files.length > 0) {
//       if (IMAGE_STORAGE === "s3") {
//         imageUrls = await Promise.all(
//           req.files.map((file) => uploadToS3(file))
//         );
//       } else {
//         imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
//       }
//     }

//     const parsedData = JSON.parse(req.body.data);

//     // Validate itinerary if provided
//     if (parsedData.itinerary) {
//       if (!Array.isArray(parsedData.itinerary)) {
//         return res.status(400).json({ message: "Itinerary must be an array." });
//       }
//       for (let i = 0; i < parsedData.itinerary.length; i++) {
//         const item = parsedData.itinerary[i];
//         if (typeof item !== "object" || !item.title || !item.description) {
//           return res.status(400).json({
//             message: `Itinerary item at index ${i} must have both title and description.`,
//           });
//         }
//       }
//     }

//     // Prepare the updated data
//     const updatedData = {
//       ...parsedData,
//       images:
//         imageUrls.length > 0 ? [...deal.images, ...imageUrls] : deal.images,
//     };

//     // Handle destination change
//     if (
//       parsedData.destination &&
//       parsedData.destination !== deal.destination?.toString()
//     ) {
//       console.log("Destination changed. Updating references.");

//       // Remove deal from old destination
//       if (deal.destination) {
//         await Destination.findByIdAndUpdate(deal.destination, {
//           $pull: { deals: deal._id },
//         });
//         console.log("Removed from old destination:", deal.destination);
//       }

//       // Add deal to new destination
//       await Destination.findByIdAndUpdate(parsedData.destination, {
//         $addToSet: { deals: deal._id },
//       });
//       console.log("Added to new destination:", parsedData.destination);
//     }

//     console.log("Updating deal with data:", updatedData);

//     // Update the deal with the new data
//     const updatedDeal = await Deal.findByIdAndUpdate(dealId, updatedData, {
//       new: true,
//       runValidators: true,
//     });

//     res.json({ message: "Deal updated successfully", deal: updatedDeal });
//   } catch (error) {
//     console.error("Error updating deal:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
const updateDeal = async (req, res) => {
  try {
    const dealId = req.params.id;
    const deal = await Deal.findById(dealId);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Validate availableCountries if provided
    if (
      req.body.availableCountries &&
      (!Array.isArray(req.body.availableCountries) ||
        req.body.availableCountries.length === 0)
    ) {
      return res
        .status(400)
        .json({ message: "At least one country must be selected." });
    }

    // Extract image URLs from the request
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      if (IMAGE_STORAGE === "s3") {
        imageUrls = await Promise.all(
          req.files.map((file) => uploadToS3(file))
        );
      } else {
        imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
      }
    }

    const parsedData = JSON.parse(req.body.data);

    // Validate itinerary if provided
    if (parsedData.itinerary) {
      if (!Array.isArray(parsedData.itinerary)) {
        return res.status(400).json({ message: "Itinerary must be an array." });
      }
      for (let i = 0; i < parsedData.itinerary.length; i++) {
        const item = parsedData.itinerary[i];
        if (typeof item !== "object" || !item.title || !item.description) {
          return res.status(400).json({
            message: `Itinerary item at index ${i} must have both title and description.`,
          });
        }
      }
    }

    // Prepare the updated data
    const updatedData = {
      ...parsedData,
      images:
        imageUrls.length > 0 ? [...deal.images, ...imageUrls] : deal.images, // Keep existing images if no new images
    };

    // Handle destination change
    if (
      parsedData.destination &&
      parsedData.destination !== deal.destination?.toString()
    ) {
      console.log("Destination changed. Updating references.");

      // Remove deal from old destination
      if (deal.destination) {
        await Destination.findByIdAndUpdate(deal.destination, {
          $pull: { deals: deal._id },
        });
        console.log("Removed from old destination:", deal.destination);
      }

      // Add deal to new destination
      await Destination.findByIdAndUpdate(parsedData.destination, {
        $addToSet: { deals: deal._id },
      });
      console.log("Added to new destination:", parsedData.destination);
    }

    console.log("Updating deal with data:", updatedData);

    // Update the deal with the new data
    const updatedDeal = await Deal.findByIdAndUpdate(dealId, updatedData, {
      new: true,
      runValidators: true,
    });

    res.json({ message: "Deal updated successfully", deal: updatedDeal });
  } catch (error) {
    console.error("Error updating deal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const deleteDealImage= async(req,res)=>{
  const { dealId } = req.params;
  const { imageUrl } = req.body;
  try{
    console.log(imageUrl);
  await deleteFromS3(imageUrl);


   // Remove image URL from MongoDB
   await Deal.findByIdAndUpdate(dealId, {
     $pull: { images: imageUrl },
   });
console.log("Image deleted successfully !  !");
   res.status(200).json({ message: 'Image deleted successfully' });
  }
  catch(error){
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
// ✅ Delete a Deal (Admin Only)
const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }
    res.json({ message: "Deal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDealsByDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;

    const deals = await Deal.find({ destination: destinationId })
      .populate("destination")
      .populate("hotels");

    res.json(deals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching deals by destination", error });
  }
};

// ✅ Search Deals with Filters (Airport, Destination, Date)
const searchDeals = async (req, res) => {
  try {
    const { airport, destination, date } = req.query;

    let query = {};

    // ✅ Filter by Airport
    if (airport) query["prices.airport"] = airport;

    // ✅ Filter by Destination (if provided)
    if (destination) {
      query["destination.name"] = { $regex: destination, $options: "i" };
    }

    // ✅ If Date is Provided, Ensure Availability (Future Feature)
    if (date) {
      // Placeholder for future availability filter (if dates are stored)
      console.log("Filtering deals for date:", date);
    }

    // ✅ Fetch Deals with Filters
    let deals = await Deal.find(query)
      .populate("destination", "name")
      .populate("hotels", "name tripAdvisorRating facilities location")
      .select("title prices boardBasis distanceToCenter distanceToBeach")
      .limit(50)
      .lean();

    // ✅ Filter Flight Details Based on Selected Airport
    deals = deals
      .map((deal) => {
        const relevantPrices = deal.prices.filter((p) => p.airport === airport);
        return relevantPrices.length > 0
          ? { ...deal, prices: relevantPrices }
          : null;
      })
      .filter(Boolean);

    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createDeal,
  getAllDeals,
  getDealById,
  updateDeal,
  deleteDeal,
  getAllDealsAdmin,
  getDealsByDestination,
  searchDeals,
  deleteDealImage
};
