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

  res.cookie("wematch-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
