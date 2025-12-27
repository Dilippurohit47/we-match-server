import express ,{Request ,Response} from "express"
import { sendErrorResponse } from "../helper/errorHandler"
import prisma from "../helper/prisma"
import { calculateDistance } from "../helper"

const app = express.Router()







app.get("/get-nearby-users",async(req:Request,res:Response)=>{
    try {
        const userId = req.query.userid as string
      if(!userId){
        sendErrorResponse(res,404,"Login First")
      }
      const user = await prisma.user.findUnique({
        where:{
            id:userId,
        }
      })
      if(!user){
        sendErrorResponse(res,404,"User doesnt exist")
        return 
      }

const RADIUS_KM = 100;
const lat = Number(user.lat);
const lon = Number(user.long);
console.log(lat,lon)
if(!lat && !lon){
  return
}
const latDelta = RADIUS_KM / 111;
const lonDelta = RADIUS_KM / (111 * Math.cos(lat * Math.PI / 180));
const candidates = await prisma.user.findMany({
  where: {
    lat: {
      gte: lat - latDelta,
      lte: lat + latDelta,
    },
    long: {
      gte: lon - lonDelta,
      lte: lon + lonDelta,
    },
    NOT: {
      id: user.id, 
    },
  },
  select:{
    fullName:true,
    lat:true,
    long:true,
    profilePic:true,
    oneLiner:true,
    city:true,
    skills:true,
    age:true,
    bio:true,
    profession:true,
    country:true,
    id:true
  }
});


candidates.forEach((candidate) =>{
  candidate.distance = calculateDistance(candidate.lat ,candidate.long , user.lat , user.long)
})
return res.status(200).json({
  success:true,
  candidates:candidates
})        
    } catch (error) {
        console.log(error)
    }
})

export default app




// const queryParts = [
//   "Anjurphata",
//   "bhiwandi",
//   "maharashtra",
//   "India",
// ].filter(Boolean);

// const query = queryParts.join(", ");

// const response = await fetch(
//   `https://geocode.maps.co/search?q=${encodeURIComponent(query)}&api_key=${"6738a0c177bd4019266980jofb0d17b"}`
// );

// console.log(response)
// const data = await response.json();
// console.log(data)
// if (!data.length) {
//   throw new Error("Location not found");
// }

// const latitude = parseFloat(data[0].lat);
// const longitude = parseFloat(data[0].lon);


// console.log(latitude , longitude)