// transactions.js
// Handles transaction data retrieval and creation.
// Routes registered in server.js at /transaction-data and /transaction.
//
//   GET  /transaction-data  — returns last 10 transactions sorted by date descending
//   POST /transaction       — saves a new transaction { date, amount, agent_id }

import express from "express";
import { transactionsDb } from "../db/connection.js";

const router = express.Router();

// GET /transaction-data
// Returns the last 10 transactions sorted most-recent-first.
router.get("/", async (req, res) => {
  try {
    const transactions = await transactionsDb
      .collection("transactions")
      .find({})
      .sort({ date: -1 })
      .limit(10)
      .toArray();

    res.status(200).json({ status: "ok", data: transactions, message: null });
  } catch (err) {
    res.status(500).json({ status: "error", data: null, message: err.message });
  }
});

// POST /transaction
// Accepts { amount, agent_id } in the body, validates amount, inserts with date.
router.post("/", async (req, res) => {
  try {
    const { amount, agent_id } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        status: "error",
        data: null,
        message: "Amount must be a positive number",
      });
    }

    const newTransaction = {
      date: new Date(),
      amount: Number(amount),
      agent_id,
    };

    const result = await transactionsDb
      .collection("transactions")
      .insertOne(newTransaction);

    res.status(201).json({
      status: "ok",
      data: { _id: result.insertedId, ...newTransaction },
      message: "transaction saved successfully",
    });
  } catch (err) {
    res.status(500).json({ status: "error", data: null, message: err.message });
  }
});

export default router;
