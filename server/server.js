import express from "express";
import cors from "cors";

// Route files — each file handles a different resource.
import agents from "./routes/agents.js";
import users from "./routes/users.js";

const PORT = process.env.PORT || 5050;
const app = express();

// Middleware — runs on every request before it reaches a route.
app.use(cors());        // Allows the React app (port 5173) to call this server (port 5050).
app.use(express.json()); // Parses JSON request bodies so req.body works.

// Routes — each path is handled by its own router file.
app.use("/agents", agents); // Agent CRUD endpoints.
app.use("/users", users);    // User login endpoint.

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});