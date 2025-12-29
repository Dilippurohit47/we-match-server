import express, { Request, Response } from "express"
import { authMiddleware } from "../middleware" 
import { sendErrorResponse, sendInternalErroResponse } from "../helper/errorHandler"
import prisma from "../helper/prisma"
const app = express.Router()

app.post("/user-matched",authMiddleware,async(req:Request , res:Response) =>{
    try {
        const targetId = req.body.matchedUserId
        if(!targetId){
            sendErrorResponse(res,400,"Matched user id required")
            return
        }
        const swiperId = req.user.id
        const [user1Id, user2Id] =
  swiperId < targetId
    ? [swiperId, targetId]
    : [targetId, swiperId];


        const existingMatch = await prisma.match.findUnique({
          where: {
        user1Id_user2Id: { user1Id, user2Id },
      },
        })

        if(existingMatch){
            sendErrorResponse(res,409,"Match already exist")
            return
        }

       const alreadySwiped = await prisma.swipe.findUnique({
  where: {
    swiperId_targetId: {
      swiperId: swiperId,
      targetId: targetId,
    },
  },
});

        if(alreadySwiped){
            sendErrorResponse(res,409,"already swiped")
            return
        }
        const reverseSwipe = await prisma.swipe.findUnique({
        where: {
            swiperId_targetId: {
            swiperId: targetId,
            targetId: swiperId,
            },
        },
        });

        if(reverseSwipe){
            const match = await prisma.match.create({
                data:{
                    user1Id:user1Id,
                    user2Id:user2Id,
                }
            })

            res.status(201).json({
                success:true,
                message:"Hurray match created"
            })
            return
        }


 await prisma.swipe.create({
    data:{
     swiperId:swiperId,
     targetId:targetId,
     direction:"right",   
    }
})


    res.status(200).json({
        success:true,
        message:"Right swiped"
    })
    return 
    } catch (error) {
        console.log(error)
        sendInternalErroResponse(res)
    }
})

app.get("/get-matches",authMiddleware ,async(req:Request,res:Response) =>{
    try {
        const id = req.user.id
        const matches = await prisma.match.findMany({
            where:{
                OR:[
                  {  user1Id:id},
                 {   user2Id:id}
                ]
            },
            include: {
            user1: {
                select: {
                id: true,
                fullName: true,
                profilePic: true,
                city: true,
                profession:true,
                oneLiner:true,
                skills:{
                    select:{
                        name:true
                    }
                }
                },
            },
            user2: {
                select: {
                id: true,
                fullName: true,
                profilePic: true,
                city: true,
                oneLiner:true,
                profession:true,
                skills:{
                    select:{
                        name:true
                    }
                }
                },
            },
            }
        })
        const otherUsers = matches.map((users) =>{
            return users.user1.id === req.user.id ? {...users.user2  ,matchedAt:users.matchedAt} : {...users.user1 ,matchedAt:users.matchedAt}
        }) 

        return res.status(200).json({
            message:"Matched successfully",
            matches:otherUsers,
            success:true,
        })
    } catch (error) {
        console.log(error)
        sendErrorResponse(res,500,"Internal server error")
    }

})

export default app

