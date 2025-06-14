const express = require("express");
const router = express.Router();
const bestScoresController = require("../controllers/bestScores.controller");
const authenticateJWT = require("../service/auth.middleware");

// GET /api/best-scores
router.get("/",authenticateJWT, bestScoresController.getBestScores);
// POST /api/best-scores/insert
router.post("/insert",authenticateJWT, bestScoresController.insertBestScore);

module.exports = router;