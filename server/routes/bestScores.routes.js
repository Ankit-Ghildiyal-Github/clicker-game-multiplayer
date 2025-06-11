const express = require("express");
const router = express.Router();
const bestScoresController = require("../controllers/bestScores.controller");

// GET /api/best-scores
router.get("/", bestScoresController.getBestScores);
// POST /api/best-scores/insert
router.post("/insert", bestScoresController.insertBestScore);

module.exports = router;