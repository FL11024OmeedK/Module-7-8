import express from "express";

// Connect to the agents database
import { agentsDb } from "../db/connection.js";

// This helps convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

// Import schema factory functions to build properly shaped agent documents.
// This ensures field names are consistent across all routes.
import { createAgent, updateAgent } from "../db/schemas/agent.schema.js";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();

// This section will help you get a list of all the agents.
router.get("/", async (req, res) => {
  try {
    let collection = agentsDb.collection("agents");
    let results = await collection.find({}).toArray();
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send("Error retrieving agents");
  }
});

// This section will help you get a single agent by id.
router.get("/:id", async (req, res) => {
  try {
    let collection = agentsDb.collection("agents");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) return res.status(404).send("Agent not found");
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Error retrieving agent");
  }
});

// This section will help you create a new agent.
// createAgent() builds a clean object with the correct agent fields.
router.post("/", async (req, res) => {
  try {
    let newAgent = createAgent(req.body);
    let collection = agentsDb.collection("agents");
    let result = await collection.insertOne(newAgent);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send("Error adding agent");
  }
});

// This section will help you update an agent by id.
// updateAgent() builds the update object — sales is excluded so it can't be overwritten here.
router.patch("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = { $set: updateAgent(req.body) };
    let collection = agentsDb.collection("agents");
    let result = await collection.updateOne(query, updates);
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Error updating agent");
  }
});

// This section will help you delete an agent by id.
router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const collection = agentsDb.collection("agents");
    let result = await collection.deleteOne(query);
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Error deleting agent");
  }
});

export default router;
