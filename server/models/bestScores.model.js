const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});


/**
 * Get the current top 10 best scores (lowest average_time).
 * @returns {Promise<Array>} Array of {id, email, average_time}
 */
async function getTopScores(topN=10) {
  const res = await pool.query(
    "SELECT id, email, average_time FROM best_scores ORDER BY average_time ASC, id ASC LIMIT $1",[topN]
  );
  return res.rows;
}

/**
 * Try to insert a new score into the top 10 leaderboard.
 * If the new average_time is better than the worst in top 10, insert and prune.
 * @param {string} email
 * @param {number} average_time
 * @returns {Promise<boolean>} True if inserted into top 10, false otherwise
 */
async function tryInsertBestScore(email, average_time) {
  // Get current top 10
  const topScores = await getTopScores();

  // If less than 10, always insert
  if (topScores.length < 10) {
    await pool.query(
      "INSERT INTO best_scores (email, average_time) VALUES ($1, $2)",
      [email, average_time]
    );
    return true;
  }

  // Check if new score is better than the worst in top 10
  const worstScore = topScores[topScores.length - 1];
  if (average_time < worstScore.average_time) {
    // Insert new score
    await pool.query(
      "INSERT INTO best_scores (email, average_time) VALUES ($1, $2)",
      [email, average_time]
    );

    // Remove the new worst score (now 11th best)
    await pool.query(
      `DELETE FROM best_scores
       WHERE id IN (
         SELECT id FROM best_scores
         ORDER BY average_time ASC, id ASC
         OFFSET 10
       )`
    );
    return true;
  }

  // Not good enough for top 10
  return false;
}

module.exports = {
  getTopScores,
  tryInsertBestScore,
};