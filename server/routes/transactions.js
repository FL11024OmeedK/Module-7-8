// transactions.js
// Handles transaction data retrieval and creation.
// Routes registered in server.js at /transaction-data and /transaction.
//
//   GET   /transaction-data  — returns last 10 transactions sorted by date descending
//   POST  /transaction       — saves a new transaction { date, amount, agent_id }
//   PATCH /transaction/:id   — updates an existing transaction's amount and agent_id
//   DELETE /transaction/:id  — removes a transaction

import express from "express";
import { ObjectId } from "mongodb";
import { transactionsDb } from "../db/connection.js";

const router = express.Router();

// Shared input checks for POST and PATCH.
// Returns an error message string for the first invalid field, or null if all fields pass.
function validateTransaction({ amount, agent_id }) {
  if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    return "Amount must be a positive number";
  }
  if (typeof agent_id !== "string" || !agent_id.trim()) {
    return "agent_id is required";
  }
  return null;
}

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

    const validationError = validateTransaction(req.body);
    if (validationError) {
      return res.status(400).json({ status: "error", data: null, message: validationError });
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

// PATCH /transaction/:id
// Updates the amount and agent_id of an existing transaction.
// The original date is intentionally left unchanged — editing a sale doesn't move it in time.
router.patch("/:id", async (req, res) => {
  try {
    const { amount, agent_id } = req.body;

    const validationError = validateTransaction(req.body);
    if (validationError) {
      return res.status(400).json({ status: "error", data: null, message: validationError });
    }

    const result = await transactionsDb
      .collection("transactions")
      .updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { amount: Number(amount), agent_id } }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ status: "error", data: null, message: "Transaction not found" });
    }

    res.status(200).json({
      status: "ok",
      data: { _id: req.params.id, amount: Number(amount), agent_id },
      message: "transaction updated successfully",
    });
  } catch (err) {
    res.status(500).json({ status: "error", data: null, message: err.message });
  }
});

// DELETE /transaction/:id
// Removes a transaction permanently.
router.delete("/:id", async (req, res) => {
  try {
    const result = await transactionsDb
      .collection("transactions")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ status: "error", data: null, message: "Transaction not found" });
    }

    res.status(200).json({
      status: "ok",
      data: null,
      message: "transaction deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ status: "error", data: null, message: err.message });
  }
});

export default router;
