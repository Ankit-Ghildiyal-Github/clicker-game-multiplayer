const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Register authentication routes
app.use("/api/auth", authRoutes);

// Root route for health check
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start the server and log status
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
  console.log("Available routes:");
  console.log("  POST   /api/auth/register   - Register a new user");
  console.log("  POST   /api/auth/login      - Login with email and password");
  console.log("  GET    /api/auth//all-users - List of all users");
});