import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { User } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export interface JWTPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Generate JWT token
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  } as jwt.SignOptions);
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

// Authentication middleware
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        error: "Authentication required",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token);

      // Verify user still exists and is active
      const user = await User.findById(decoded.id).select("-password");

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Invalid token. User not found or inactive.",
          error: "Authentication failed",
        });
      }

      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
        error: "Token verification failed",
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
      error: "Authentication error",
    });
  }
};

// Authorization middleware
export const authorize = (...roles: string[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "User not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
        error: "Authorization failed",
      });
    }

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);

      const user = await User.findById(decoded.id).select("-password");

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        };
      }
    } catch (error) {
      // Token is invalid, but we continue without authentication
      console.log(
        "Optional auth: Invalid token, continuing without authentication"
      );
    }

    next();
  } catch (error) {
    console.error("Optional authentication error:", error);
    next(); // Continue even if there's an error
  }
};
