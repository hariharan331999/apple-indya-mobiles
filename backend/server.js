require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const inventoryRoutes = require("./routes/inventory");
const salesRoutes = require("./routes/sales");
const billsRoutes = require("./routes/bills");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - allow all origins (or restrict to your frontend URL)
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Routes
app.use("/api/inventory", inventoryRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/bills", billsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    store: "APPLE INDYA MOBILES",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`🍎 APPLE INDYA MOBILES Server running on port ${PORT}`);
});
