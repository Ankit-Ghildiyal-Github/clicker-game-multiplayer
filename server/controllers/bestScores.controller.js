const bestScoresModel = require("../models/bestScores.model.js");

/**
 * Controller to insert a new score into the best scores leaderboard.
 * Expects { email, average_time } in req.body.
 */
exports.insertBestScore = async (req, res) => {
  const { email, average_time } = req.body;
  if (!email || typeof average_time !== "number") {
    return res.status(400).json({ message: "Email and average_time required" });
  }

  try {
    const inserted = await bestScoresModel.tryInsertBestScore(email, average_time);
    if (inserted) {
      return res.status(201).json({ message: "Score added to leaderboard" });
    } else {
      return res.status(200).json({ message: "Score not in top 10" });
    }
  } catch (err) {
    console.error("Error inserting best score:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controller to retrieve the top 10 best scores.
 */
exports.getBestScores = async (req, res) => {
  try {
    const scores = await bestScoresModel.getTopScores(5);
    return res.json({ bestScores: scores });
  } catch (err) {
    console.error("Error retrieving best scores:", err);
    return res.status(500).json({ message: "Server error" });
  }
};