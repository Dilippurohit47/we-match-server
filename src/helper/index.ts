import { jwt, ZodError } from "zod";
import JWT from "jsonwebtoken"
import { Response } from "express";

export const formatZodError = (error: ZodError) => {
  const fieldErrors = error.flatten().fieldErrors;

  const firstKey = Object.keys(fieldErrors)[0];
  const firstMessage = fieldErrors[firstKey]?.[0];
  return {
    field: firstKey,
    message: firstMessage,
  };
};


export const sendJwtToken = (res:Response, userId:string) => {
  if(!process.env.JWT_SECRET_KEY) {
    console.log("jwt secret key required")
    return
  }
  const token = JWT.sign(
    { id: userId },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

};


export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in KM

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 return Math.round(R * c * 100) / 100;
}