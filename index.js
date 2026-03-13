const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 9110;
const app = express();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Security headers
app.use(helmet());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


const cors = require("cors");

const allowedOrigins = [
  process.env.FRONTEND_URL ||
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((o) => origin.startsWith(o))) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders:
      "Content-Type,Authorization,x-user-data,x-secret-key,x-access-key",
    credentials: true,
  }),
);

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 attempts per window
  message: { code: 0, message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const fileUpload = require("express-fileupload");
app.use(
  fileUpload({
    limits: { fileSize: 100000000 },
  }),
);

// Mount all routes
app.use("/v1/api", require("./src/routes/index"));

// Health route
app.use("/", (req, res) => {
  res.send("Hello from main");
});

// ✅ Start the server
app.listen(PORT, async () => {
  console.log(`Service listening on port ${PORT}`);
});
