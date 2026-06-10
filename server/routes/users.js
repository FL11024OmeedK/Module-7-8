// users.js
// Handles all routes related to user accounts.
// Currently contains one endpoint: POST /users/login
// This router is registered in server.js at the /users path.

import express from "express";
import jwt from "jsonwebtoken";
import { usersDb } from "../db/connection.js";

const router = express.Router();

// POST /users/login
// Receives { email, password } in the request body.
// Returns a signed JWT on success, 401 on bad credentials.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await usersDb.collection("users").findOne({ email });

    if (!user) {
      return res.status(401).send("Unauthorized: email not found");
    }

    if (user.password !== password) {
      return res.status(401).send("Unauthorized: incorrect password");
    }

    // Sign a JWT containing the user's id and email.
    // The token expires in 24 hours — after that the user must log in again.
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return the token and the user info the frontend needs to create a session.
    res.status(200).json({
      token,
      user: { _id: user._id, first_name: user.first_name, last_name: user.last_name },
    });

  } catch (err) {
    res.status(500).send("Error during login");
  }
});

export default router;
