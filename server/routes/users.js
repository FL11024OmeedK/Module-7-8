// users.js
// Handles all routes related to user accounts.
// Currently contains one endpoint: POST /users/login
// This router is registered in server.js at the /users path.

import express from "express";

// Import the users database connection.
// usersDb points to the separate "users" MongoDB database.
import { usersDb } from "../db/connection.js";

const router = express.Router();

// POST /users/login
// Receives { email, password } in the request body.
// Looks up the user by email in the users database.
// Returns 200 if credentials match, 401 if they do not.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Find a user document with a matching email.
    const user = await usersDb.collection("users").findOne({ email });

    // Step 2: If no user with that email exists, reject the login.
    if (!user) {
      return res.status(401).send("Unauthorized: email not found");
    }

    // Step 3: If the email exists but the password does not match, reject.
    if (user.password !== password) {
      return res.status(401).send("Unauthorized: incorrect password");
    }

    // Step 4: Credentials are valid — login successful.
    res.status(200).send({ message: "Login successful" });

  } catch (err) {
    res.status(500).send("Error during login");
  }
});

export default router;
