import jwt from "jsonwebtoken";

// Middleware that protects routes by verifying a JWT.
// Expects the client to send: Authorization: Bearer <token>
// If valid, attaches the decoded payload to req.user and calls next().
// If missing or invalid, returns 401 immediately.

// this is exported to server.js, where it is registered as middleware at the /agents path. It is used to protect all the agent CRUD endpoints, so that only authenticated users can access them. It checks for a valid JWT in the Authorization header of incoming requests, and if the token is valid, it allows the request to proceed to the route handlers in routes/agents.js. If the token is missing or invalid, it responds with a 401 Unauthorized error, preventing access to the protected routes. This ensures that only users who have logged in and received a valid token can perform actions on the agents resource.
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  // Bearer tokens are the standard way to send JWTs in HTTP requests. The header should look like: "Authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

