// This is the main server file for our Express backend. It sets up the server, connects to the database, and defines the routes for our API. It runs every time we start the server with "npm run dev". The server listens for incoming requests on port 5050 and responds to them based on the defined routes. The routes are organized into separate files for better modularity and maintainability. The server also uses middleware to handle CORS and parse JSON request bodies, allowing it to communicate effectively with the React frontend. It runs from top to bottom every time a request is made to the server, and it uses the defined routes to determine how to respond to each request. The server is essential for handling the backend logic of our application, such as fetching data from the database, processing user input, and sending responses back to the frontend.
import express from "express";
import cors from "cors";

// Route files — each file handles a different resource.
import agents from "./routes/agents.js";
import users from "./routes/users.js";
import { requireAuth } from "./middleware/auth.js";

const PORT = process.env.PORT || 5050;
const app = express();

// Middleware — runs on every request before it reaches a route.
app.use(cors());        // Allows the React app (port 5173) to call this server (port 5050).
app.use(express.json()); // Parses JSON request bodies so req.body works.

// Routes — each path is handled by its own router file.
app.use("/agents", requireAuth, agents); // Agent CRUD endpoints — protected by JWT.
app.use("/users", users);    // User login endpoint.

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});