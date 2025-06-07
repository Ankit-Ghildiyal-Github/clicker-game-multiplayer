const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth.routes");
const setupSocketGame = require("./service/socketGameService");
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

// Handle 404 for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust as needed for security
    methods: ["GET", "POST"]
  }
});

// Setup your multiplayer game service
setupSocketGame(io);

// Start the server and log status
server.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
  console.log("Available routes:");
  console.log("  POST   /api/auth/register    - Register a new user");
  console.log("  POST   /api/auth/login       - Login with email and password");
  console.log("  GET    /api/auth/all-users   - List of all users");
});