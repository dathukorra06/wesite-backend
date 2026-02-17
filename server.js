const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const { errorHandler } = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

/* =========================
   SECURITY
========================= */
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
app.use(limiter);

/* =========================
   CORS (Vercel Safe)
========================= */
app.use(
  cors({
    origin: [
      "https://wesite-frontend-stpy.vercel.app",
      "https://wesite-frontend-stpy-7u9vhtsg6-dathukorra06s-projects.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running 🚀",
    api: {
      auth: "/api/auth",
      tasks: "/api/tasks",
      health: "/api/health",
    },
  });
});

/* =========================
   ROUTES
========================= */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));

/* =========================
   HEALTH
========================= */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    time: new Date().toISOString(),
  });
});

/* =========================
   404
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use(errorHandler);

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

/* =========================
   CRASH PROTECTION
========================= */
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
