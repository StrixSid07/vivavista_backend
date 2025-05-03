const Booking = require("../models/Booking");
const Deal = require("../models/Deal");

// ✅ Create a Booking (User or Guest)
// const createBooking = async (req, res) => {
//   try {
//     const {
//       dealId,
//       name,
//       email,
//       phone,
//       message,
//       selectedDate,
//       airport,
//       adults,
//       children = 0,
//     } = req.body;

//     // Convert selectedDate from DD/MM/YYYY to YYYY-MM-DD
//     const [day, month, year] = selectedDate.split("/");
//     const formattedDate = `${year}-${month}-${day}`;

//     // Validate the formatted date
//     const selectedDateObj = new Date(formattedDate);
//     if (isNaN(selectedDateObj.getTime())) {
//       return res.status(400).json({ message: "Invalid date provided" });
//     }

//     const selectedDateOnly = selectedDateObj.toISOString().split("T")[0];
//     const airportCode = airport.toUpperCase();

//     // Fetch the deal
//     const deal = await Deal.findById(dealId).populate("prices.hotel");
//     if (!deal) {
//       return res.status(404).json({ message: "Deal not found" });
//     }

//     // Find the matching price object based on airport and selected date
//     const matchedPrice = deal.prices.find((p) => {
//       const priceStart = new Date(p.startdate).toISOString().split("T")[0];
//       const priceEnd = new Date(p.enddate).toISOString().split("T")[0];
//       const priceAirport = p.airport.toUpperCase();

//       return (
//         priceAirport === airportCode &&
//         selectedDateOnly >= priceStart &&
//         selectedDateOnly <= priceEnd
//       );
//     });

//     if (!matchedPrice) {
//       return res.status(404).json({
//         message: "No available pricing for selected airport and date",
//       });
//     }

//     // Create booking with populated fields
//     const booking = new Booking({
//       dealId,
//       userId: req.user ? req.user.id : null,
//       name,
//       email,
//       phone,
//       message,
//       selectedDate: selectedDateObj,
//       returnDate: matchedPrice.enddate,
//       airport: airportCode,
//       adults,
//       children,
//       selectedHotel: matchedPrice.hotel,
//       selectedPrice: {
//         price: matchedPrice.price,
//         flightDetails: matchedPrice.flightDetails,
//       },
//     });

//     await booking.save();

//     res.status(201).json({ message: "Booking created successfully", booking });
//   } catch (error) {
//     console.error("Booking creation error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


const createBooking = async (req, res) => {
  try {
    const {
      dealId,
      name,
      email,
      phone,
      message,
      selectedDate,
      airport,
      adults,
      children = 0,
    } = req.body;

    // Format date from "DD/MM/YYYY" to "YYYY-MM-DD"
    const [day, month, year] = selectedDate.split("/");
    const formattedDate = `${year}-${month}-${day}`;
    const selectedDateObj = new Date(formattedDate);

    if (isNaN(selectedDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid selected date format" });
    }

    const selectedDateOnly = selectedDateObj.toISOString().split("T")[0];
    const airportCode = airport.toUpperCase();

    // Find deal and populate 'prices.hotel'
    const deal = await Deal.findById(dealId).populate("prices.hotel").populate("prices.airport");
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Match correct pricing object
    const matchedPrice = deal.prices.find((price) => {
      const start = new Date(price.startdate).toISOString().split("T")[0];
      const end = new Date(price.enddate).toISOString().split("T")[0];
      console.log("this is price ",price);
      const hasMatchingAirport = Array.isArray(price.airport)
  ? price.airport.some((a) => a.code?.toUpperCase() === airportCode)
  : price.airport?.code?.toUpperCase() === airportCode;

return (
  hasMatchingAirport &&
  selectedDateOnly >= start &&
  selectedDateOnly <= end
);
    });

    if (!matchedPrice) {
      return res.status(404).json({
        message: "No pricing available for the selected date and airport",
      });
    }

    // Save new booking
    const booking = new Booking({
      dealId,
      userId: req.user ? req.user.id : null,
      name,
      email,
      phone,
      message,
      selectedDate: selectedDateObj,
      returnDate: matchedPrice.enddate,
      airport: airportCode,
      adults,
      children,
      selectedHotel: matchedPrice.hotel?._id || null,
      selectedPrice: {
        price: matchedPrice.price,
        flightDetails: matchedPrice.flightDetails,
      },
    });

    await booking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const createBookingByAdmin = async (req, res) => {
  try {
    const {
      dealId,
      name,
      email,
      phone,
      message,
      selectedDate,
      returnDate,
      airport,
      adults,
      children = 0,
    } = req.body;

    // Find the deal by dealId and populate prices and hotels
    const deal = await Deal.findById(dealId).populate({
      path: "prices.hotel", // Ensure hotel is populated correctly
      select: "name location", // Optional: specify the fields to populate
    });

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Parse dates
    const parseDate = (dateStr) => {
      if (typeof dateStr === "string" && dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        return new Date(`${year}-${month}-${day}`);
      }
      return new Date(dateStr);
    };

    const selectedDateObj = parseDate(selectedDate);
    const returnDateObj = parseDate(returnDate);

    if (isNaN(selectedDateObj) || isNaN(returnDateObj)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Find the selected price based on airport and selected date
    const selectedPrice = deal.prices.find(
      (price) =>
        price.airport === airport.toUpperCase() &&
        new Date(price.startdate).toISOString().split("T")[0] === selectedDate
    );

    if (!selectedPrice) {
      return res.status(400).json({
        message: "No price available for the selected date and airport",
      });
    }

    // Create the booking
    const booking = new Booking({
      dealId,
      userId: req.user ? req.user.id : null,
      name,
      email,
      phone,
      message,
      selectedDate: selectedDateObj,
      returnDate: returnDateObj,
      airport: airport.toUpperCase(),
      adults,
      children,
      selectedHotel: selectedPrice.hotel, // Hotel information
      selectedPrice: {
        price: selectedPrice.price,
        flightDetails: selectedPrice.flightDetails,
      },
    });

    await booking.save();

    res.status(201).json({
      message: "Booking created successfully by admin",
      booking,
    });
  } catch (error) {
    console.error("Admin booking creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Bookings for Logged-in User
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate(
      "dealId",
      "title description"
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin: Get All Bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("dealId", "title")
      .populate("selectedHotel", "name");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const {
      dealId,
      name,
      email,
      phone,
      message,
      selectedDate,
      returnDate,
      airport,
      adults,
      children = 0,
      selectedHotel,
      selectedPrice,
    } = req.body;

    // Format selectedDate and returnDate if needed
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      if (dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        return new Date(`${year}-${month}-${day}`);
      }
      return new Date(dateStr);
    };

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        dealId,
        name,
        email,
        phone,
        message,
        selectedDate: formatDate(selectedDate),
        returnDate: formatDate(returnDate),
        airport,
        adults,
        children,
        selectedHotel,
        selectedPrice,
      },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Booking update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin: Update Booking Status
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await booking.save();

    res.json({ message: "Booking status updated", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin/User: Delete Booking by ID
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDealsDropdown = async (req, res) => {
  try {
    const deals = await Deal.find({})
      .select("title prices") // Only fetch title and prices
      .populate("prices.hotel", "name"); // Populate hotel name only

    // Format data for dropdown use
    const dropdownData = deals.map((deal) => ({
      id: deal._id,
      title: deal.title,
      prices: deal.prices.map((price) => ({
        airport: price.airport,
        startdate: price.startdate,
        enddate: price.enddate,
        price: price.price,
        hotel: price.hotel?.name || "N/A",
      })),
    }));

    res.json(dropdownData);
  } catch (error) {
    console.error("Error fetching deals for dropdown:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createBooking,
  createBookingByAdmin,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  updateBooking,
  getDealsDropdown,
};
