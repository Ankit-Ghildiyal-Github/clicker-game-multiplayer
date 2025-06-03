const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");
const authenticateJWT = require("../service/auth.middleware")

router.post("/register", controller.register);

// POST /api/auth/login
router.post("/login", controller.login);

// GET /api/auth/all-users (Protected)
router.get("/all-users", authenticateJWT, controller.allUsers);

module.exports = router;