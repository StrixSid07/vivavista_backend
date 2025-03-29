const Booking = require("../models/Booking");
const Deal = require("../models/Deal");

// ✅ Create a Booking (User or Guest)
const createBooking = async (req, res) => {
  try {
    const { dealId, name, email, phone, selectedDate } = req.body;
    const userCountry = req.session.country || "UK"; // Get selected country from session

    // Check if deal exists
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ message: "Deal not found" });

    // Check if deal is available in selected country
    if (!deal.availableCountries.includes(userCountry)) {
      return res.status(403).json({ message: "This deal is not available in your selected country." });
    }

    // Save the booking
    const booking = new Booking({
      dealId,
      userId: req.user ? req.user.id : null, // Null for guest users
      name,
      email,
      phone,
      country: userCountry,
      selectedDate,
    });

    await booking.save();
    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Bookings for Logged-in User
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate("dealId", "title description");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin: Get All Bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("dealId", "title description").populate('selectedHotel', 'name');

    res.json(bookings);
  } catch (error) {
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

module.exports = { createBooking, getUserBookings, getAllBookings, updateBookingStatus };
