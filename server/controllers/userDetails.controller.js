const userDetailsModel = require("../models/userDetails.model.js");

/**
 * Controller to insert or update user details.
 * Expects { email, username, age } in req.body.
 */
exports.insertOrUpdateUserDetails = async (req, res) => {
  const { email, username, age } = req.body;
  if (
    !email ||
    typeof email !== "string" ||
    !username ||
    typeof username !== "string" ||
    typeof age !== "number"
  ) {
    return res.status(400).json({ message: "email (string), username (string), and age (number) are required" });
  }

  try {
    await userDetailsModel.saveUserDetails(email, username, age);
    return res.status(201).json({ message: "User details saved" });
  } catch (err) {
    console.error("Error saving user details:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controller to fetch user details by user email.
 * Expects :email as a route parameter.
 */
exports.getUserDetailsByEmail = async (req, res) => {
  const email = req.params.email;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Invalid user email" });
  }

  try {
    const userDetails = await userDetailsModel.getUserDetailsByEmail(email);
    if (!userDetails) {
      return res.status(404).json({ message: "User details not found" });
    }
    return res.json({ userDetails });
  } catch (err) {
    console.error("Error fetching user details:", err);
    return res.status(500).json({ message: "Server error" });
  }
};