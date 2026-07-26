require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const urlRouter = require("./routes/url.routes");
const redirectRouter = require("./routes/redirect.routes");

const morgan = require('morgan')

const app = express();
app.set("trust proxy", 1);
// Parse JSON bodies
app.use(express.json());
app.use(morgan("dev"));
// Rate limiter for URL creation only
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Too many requests, please slow down." },
});

// Health check — must come before redirect router
app.get("/health", (req, res) => res.json({ status: "ok" }));

// URL creation API — locked to frontend origin only
app.use(
  "/api",
  cors({
    origin: process.env.ALLOWED_ORIGIN,
    methods: ["POST"],
  }),
  createLimiter,
  urlRouter
);

// Redirect route — open to all origins (browsers follow short links directly)
app.use("/", redirectRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
