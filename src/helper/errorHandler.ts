import { Response } from "express";
export const sendErrorResponse = (
  res:Response,
  statusCode = 500,
  message = "Internal server error"
) => {
  if (!res) throw new Error("Response object not provided");

  return res.status(statusCode).json({
    success: false,
    message
  });
};



export const sendInternalErroResponse = (res:Response) =>{
  return res.status(500).json({
    error:"Internal server error",
    success:false
  })
}