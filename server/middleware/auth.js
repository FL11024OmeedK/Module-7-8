import jwt from "jsonwebtoken";

// Middleware that protects routes by verifying a JWT.
// Expects the client to send: Authorization: Bearer <token>
// If valid, attaches the decoded payload to req.user and calls next().
// If missing or invalid, returns 401 immediately.
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
