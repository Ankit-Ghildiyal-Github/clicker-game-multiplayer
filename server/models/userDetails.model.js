const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

/**
 * Save user details to the user_details table.
 * @param {string} email - User email (must exist in user_credentials)
 * @param {string} username
 * @param {number} age
 * @returns {Promise<void>}
 */
async function saveUserDetails(email, username, age) {
  await pool.query(
    `INSERT INTO user_details (email, username, age)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username, age = EXCLUDED.age`,
    [email, username, age]
  );
}

/**
 * Fetch user details by user email.
 * @param {string} email
 * @returns {Promise<{email: string, username: string, age: number, tokens: number} | null>}
 */
async function getUserDetailsByEmail(email) {
  const res = await pool.query(
    `SELECT email, username, age, tokens FROM user_details WHERE email = $1`,
    [email]
  );
  return res.rows[0] || null;
}

module.exports = {
  saveUserDetails,
  getUserDetailsByEmail,
};