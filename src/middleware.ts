import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["accessToken"];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT secret not configured");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    ) as JwtPayload;

    if (!decoded?.id) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token expired or invalid" });
  }
};
