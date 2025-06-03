const { Pool } = require("pg");
require("dotenv").config();



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});



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

async function findAllUsers() {
  const query = `SELECT id, email FROM user_credentials`;
  const result = await pool.query(query);
  console.log(result.rows);
  return result.rows;
}

module.exports = {
  findUserByEmail,
  createUser,
  findAllUsers
};