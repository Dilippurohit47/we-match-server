import express ,{Request ,Response}from "express"
import { sendErrorResponse, sendInternalErroResponse } from "../helper/errorHandler"
import { UserSignupSchema , UserSignInSchema } from "../types/userZod"
import { formatZodError, sendJwtToken } from "../helper"
import prisma from "../helper/prisma"
import  bcrypt from "bcrypt"
import JWT from "jsonwebtoken"
const router  = express.Router()

router.post("/sign-up",async(req:Request,res:Response) =>{
  try {
const userBody = req.body    

const result = UserSignupSchema.safeParse(userBody);
if (!result.success) {
 let {field , message } = formatZodError(result.error)
 sendErrorResponse(res,404,`${field}:${message}`)
 return
} 
const userData = result.data
if(!userData) return 
const hasedhPassword  =  await bcrypt.hash(userData.password , 10)
const user = await prisma.user.create({
  data:{
    fullName:userData.fullName, 
    age:userData.age,
    email:userData.email,
    password:hasedhPassword,
    country:userData.country,
    city:userData.city,
    landmark:userData.landmark,
    portfolio:userData.portfolio,
    lat:userData.latitude,
    long:userData.longitude,
    skills:{
      create:userData.skills.map((skill)=>{
        return {name:skill}
      })
    },
    profession:userData.profession,
    subjects:{
      create:userData.subjects.map((subject) =>{
      return {name:subject}
    }),
    },
    oneLiner:userData.oneLiner,
    gender:userData.gender,
    bio:userData.bio,
    profilePic:"ok ok "

  }
})

if(user){
let token = sendJwtToken(res,user.id)
}
console.log(user)
return res.status(200).json({
  success:true,
  message:"Sign up successfully"
})
  } catch (error) {
    console.log(error)
    sendErrorResponse(res,500,"Internal server error")
  }
})

router.get("/me",async(req:Request,res:Response) =>{
  try {
    const token = req.cookies["accessToken"];
    if(!process.env.JWT_SECRET_KEY){
      console.log("error jwt secret is required in route me")
      sendErrorResponse(res,500,"temporary error try again later")
      return
    }
  const decoded = JWT.verify(token, process.env.JWT_SECRET_KEY);

    const user = await prisma.user.findUnique({
      where:{
        id:decoded.id
      }
    })

    if(!user){
      sendErrorResponse(res,500,"something went wrong")
      return
    }
    res.status(200).json({
      user:user,
      success:true
    })
    return
  } catch (error) {
    console.log("error in getting user",error)
      sendErrorResponse(res,500,"Internal server error try again later")
  }
})

router.post("/sign-in",async(req:Request,res:Response) =>{
  try {
    const result =UserSignInSchema.safeParse(req.body)
    if(!result.success){
      let {field , message } = formatZodError(result.error)
      sendErrorResponse(res,404,`${field}:${message}`)
      return
    }
    const loginCredentials = result.data
    const userExist = await prisma.user.findFirst({
      where:{
        email:loginCredentials.email
      },select:{
        email:true,
        password:true,
        id:true,
      }
    })
    if(!userExist){
      sendErrorResponse(res,404,"Email or password doesnt match")
      return
    }
    let isPasswordMatch ;
    if(userExist.password){
    isPasswordMatch = await bcrypt.compare(loginCredentials.password , userExist.password)
if(!isPasswordMatch){
  sendErrorResponse(res,403,"Email or password doesnt match")
  return
}}
let token = sendJwtToken(res,userExist.id)
return res.status(200).json({
  success:true
})
  } catch (error) {
    console.log(error)
    sendErrorResponse(res,500,"Internal server error")
  }
})

router.post("/logout",async(req:Request,res:Response) =>{
  try {
  res.clearCookie("wematch-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",        
    sameSite: "lax",    
  });
    res.status(200).json({
      success:true
    })
    return
  } catch (error) {
    sendInternalErroResponse(res)
  }
})

export default router