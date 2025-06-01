/**
 * Express authentication routes for registration and login.
 * Uses PostgreSQL, bcrypt for password hashing, and JWT for authentication.
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Helper: Find user by email
async function findUserByEmail(email) {
  const res = await pool.query("SELECT * FROM user_credentials WHERE email = $1", [email]);
  return res.rows[0];
}

// Helper: Create user
async function createUser(email, hashedPassword) {
  const res = await pool.query(
    "INSERT INTO user_credentials (email, password) VALUES ($1, $2) RETURNING id, email",
    [email, hashedPassword]
  );
  return res.rows[0];
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser)
      return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(email, hashedPassword);

    res.status(201).json({ message: "Registration successful", user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await findUserByEmail(email);
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/logged-in-users
router.get("/all-users", async (req, res) => {
  try {
    // Get emails of logged-in users
    const query = `SELECT id, email FROM user_credentials`;
    const result = await pool.query(query);
    res.json({ users: result.rows });
  } catch (err) {
    console.error("Error fetching logged-in users:", err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;