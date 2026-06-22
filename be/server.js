const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Cho phép truy cập file trong thư mục fe
app.use(express.static(path.join(__dirname, "../fe")));

// API Routes
const router = require("./src/route/index");
app.use("/api", router);

// Trang chủ -> index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../fe/index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../fe/dashboard.html"));
});

// Start Server
const PORT = process.env.PORT || 9999;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
