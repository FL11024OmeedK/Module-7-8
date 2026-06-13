// session.js
// Handles session token creation and validation.
// Routes registered in server.js at /session and /validate_token.
//
//   POST /session/:user_id  — creates a UUID session, saves to MongoDB, returns the token
//   GET  /validate_token    — checks if a token is valid, returns user info

import express from "express";
import { v4 as uuidv4 } from "uuid";
import { sessionsDb } from "../db/connection.js";

const router = express.Router();

// POST /session/:user_id
// Called by the frontend immediately after a successful login.
// Generates a UUID token, saves the session to MongoDB, returns the token.
router.post("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    // Pull the user info passed in the request body so we can embed it in the session.
    const { first_name, last_name } = req.body;

    const session_token = uuidv4();

    await sessionsDb.collection("sessions").insertOne({
      session_token,
      User: { first_name, last_name, id: user_id },
      createdAt: new Date(),
    });

    res.status(201).json({
      status: "ok",
      data: { token: session_token },
      message: "session saved successfully",
    });
  } catch (err) {
    res.status(500).json({ status: "error", data: null, message: err.message });
  }
});

// GET /validate_token?token=<uuid>
// Called on every page navigation to check if the session is still valid.
// Returns the user info if the session exists (MongoDB TTL handles expiry automatically).
router.get("/", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(200).json({
        status: "ok",
        data: { valid: false, user: null },
        message: null,
      });
    }

    const session = await sessionsDb.collection("sessions").findOne({ session_token: token });

    if (!session) {
      return res.status(200).json({
        status: "ok",
        data: { valid: false, user: null },
        message: null,
      });
    }

    res.status(200).json({
      status: "ok",
      data: { valid: true, user: session.User },
      message: null,
    });
  } catch (err) {
    res.status(500).json({ status: "error", data: null, message: err.message });
  }
});

export default router;
