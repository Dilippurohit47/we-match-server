import express, { Request, Response } from "express"
import { authMiddleware } from "../middleware";
import prisma from "../helper/prisma";

const app = express.Router()



app.get("/get-messages/:id",authMiddleware, async (req: Request, res: Response) => {
  try {
    const senderId = req.user.id
    const receiverId = req.params.id 
    const cursor = req.query.cursor 

    

   if(typeof receiverId !== "string"){
    res.status(404).json({
      success:false,
      message:"Reciver id should be string"
    })
    return
   }
    const limit = parseInt(req.query.limit as string) || 20;
    console.log(typeof cursor , cursor)
    let cursorObj = null;
    if (cursor && cursor !== "undefined") {
      cursorObj = JSON.parse(cursor);
    }


    if (!senderId || !receiverId) {
       res
        .status(400)
        .json({ error: "senderId and receiverId are required" });
        return
    }

    const messages = await prisma.messages.findMany({
      take: limit + 1,
      where: {
        OR: [
          {
            OR: [
              {
                senderId: senderId as string,
                receiverId: receiverId as string,
              },
              {
                senderId: receiverId as string,
                receiverId: senderId as string,
              },
            ],
            createdAt: {
              lt: cursorObj?.createdAt
                ? new Date(cursorObj.createdAt)
                : undefined,
            },
          },
          // Case 2: Same timestamp but older ID (tiebreaker)
          ...(cursorObj
            ? [
                {
                  OR: [
                    {
                      senderId: senderId as string,
                      receiverId: receiverId as string,
                    },
                    {
                      senderId: receiverId as string,
                      receiverId: senderId as string,
                    },
                  ],
                  createdAt: new Date(cursorObj.createdAt),
                  id: { lt: cursorObj.id },
                },
              ]
            : []),
        ].filter(Boolean),
        deletedBy: {
          none: {
            userId: receiverId,
          },
        }, 
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { sender: {
        select:{
          id:true,
          fullName:true,

        }
      }, receiver: {
        select:{
          id:true,
          fullName:true
        }
      }},
    });

    const hasMore = messages.length > limit;
    const messagesToSend = hasMore ? messages.slice(0, limit) : messages;
    const lastMessage = messagesToSend[messagesToSend.length - 1];

    res.status(200).json({
      messages: messagesToSend,
      cursor: hasMore
        ? {
            createdAt: lastMessage.createdAt,
            id: lastMessage.id,
          }
        : null,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default app