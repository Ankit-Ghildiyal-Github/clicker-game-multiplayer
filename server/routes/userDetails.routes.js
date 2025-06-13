const express = require("express");
const router = express.Router();
const userDetailsController = require("../controllers/userDetails.controller");
const authenticateJWT = require("../service/auth.middleware");

// POST /api/user-details
router.post("/", authenticateJWT, userDetailsController.insertOrUpdateUserDetails);

// GET /api/user-details/:email
router.get("/:email", authenticateJWT, userDetailsController.getUserDetailsByEmail);

module.exports = router;