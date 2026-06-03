import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "gymbro_fallback_secret_key";

// Custom TypeScript interface extending Express's default Request type
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
  };
}

// Middleware to verify the JSON Web Token (JWT) sent by the frontend
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Access token missing or invalid" });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Token is invalid or expired" });
    }

    try {
      // Verify that the user still exists in the database
      const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [decoded.userId]);
      if (userCheck.rows.length === 0) {
        return res.status(401).json({ error: "User account no longer exists" });
      }

      // Attach decoded user info (userId, username) to request object
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
      };

      next(); // Pass control to the next handler/middleware
    } catch (dbErr) {
      console.error("Auth middleware database error:", dbErr);
      return res.status(500).json({ error: "Authentication database query failed" });
    }
  });
};

