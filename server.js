const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
// const redis = require("redis");
const fs = require("fs");
const https = require("https");
const swaggerDocs = require("./config/swagger");
const path = require("path"); // ✅ Import path module

// Initialize Redis client
// const client = redis.createClient();
// client.connect();

dotenv.config();
connectDB();

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:4200",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://54.172.95.174",
    "https://54.172.95.174",
    "https://vivavista.netlify.app",
    "http://vivavistaadmin.netlify.app",
    "http://vivavistavacations.co.uk",
    "http://www.vivavistavacations.co.uk",
    "https://vivavistavacations.co.uk",
    "https://vivavistaadmin.netlify.app",
    "https://www.vivavistavacations.co.uk",
    "https://api.vivavistavacations.co.uk",
    "http://localhost:5175/",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies/session
  allowedHeaders: "Content-Type, Authorization",
};

const app = express();
app.use(cors());
// app.options("*", cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());

// ✅ Apply Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50000, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});

app.use(limiter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ✅ Configure Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Only set `true` when behind HTTPS
  })
);

// ✅ Middleware to Set/Get Country from Session
app.use((req, res, next) => {
  if (!req.session.country) {
    req.session.country = "UK"; // Default country
  }
  req.user = { country: req.session.country }; // Attach selected country to req.user
  next();
});

// ✅ API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/hotels", require("./routes/hotelRoutes"));
app.use("/api/deals", require("./routes/dealRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/misc", require("./routes/miscRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/home", require("./routes/homeRoutes"));
app.use("/api/destinations", require("./routes/destinationRoutes"));
app.use("/api/airport", require("./routes/airportRoutes"));
app.use("/api/trending", require("./routes/trandingRoutes"));
app.use("/api/faqs", require("./routes/faqsRoutes"));
app.use("/api/terms", require("./routes/termsRoutes"));
app.use("/api/carousel", require("./routes/carouselRoutes"));
app.use("/api/holidays", require("./routes/holidayRoutes"));
app.use("/api/boardbasis", require("./routes/boardbasisRoutes"));
app.use("/api/mail", require("./routes/contactRoutes"));
app.use("/api/newslatter", require("./routes/newslatterXLRoutes"));
app.use("/api/admindealsexternal", require("./routes/adminDeals"));
// ✅ Apply Caching to Deals API
// const cacheMiddleware = async (req, res, next) => {
//   const key = req.originalUrl;
//   const cachedData = await client.get(key);
//   if (cachedData) {
//     return res.json(JSON.parse(cachedData)); // Return cached response
//   }
//   next();
// };
// app.use("/api/deals", cacheMiddleware);

// ✅ Initialize Swagger Docs
swaggerDocs(app);

// ✅ Auto-detect whether running locally or on the server
const isLocal = process.env.NODE_ENV === "development";

const PORT = process.env.PORT || 5001;

if (isLocal) {
  console.log("🚀 ~ isLocal:", isLocal);
  // 🔹 Local Development (HTTP)
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
} else {
  // 🔹 Production Server (HTTPS)
  // const sslOptions = {
  //   key: fs.readFileSync(
  //     "/etc/letsencrypt/live/vivavistavacations.co.uk/privkey.pem"
  //   ),
  //   cert: fs.readFileSync(
  //     "/etc/letsencrypt/live/vivavistavacations.co.uk/fullchain.pem"
  //   ),
  // };

  // https.createServer(sslOptions, app).listen(PORT, "0.0.0.0", () => {
  //   console.log(
  //     `🚀 Secure Server running on https://api.vivavistavacations.co.uk:${PORT}`
  //   );
  // });
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
}

// ✅ Start Cron Job for Hotel Ratings Update
// const updateHotelRatings = require("./cron/hotelUpdater");
// updateHotelRatings();
