import { WebSocketServer } from "ws";
import prisma from "../helper/prisma";
import { saveMessage, upsertRecentChats } from "../routes/Chat";

const userMap = new Map()

export const setupWebSocket = (server: any) => {
  const wss = new WebSocketServer({ server });

wss.on("connection",(ws) =>{
    console.log("client connected")
    ws.on("message",async(m) =>{
        const data = JSON.parse(m.toString())
        if(data.type === "user-info"){
            const user = await prisma.user.findUnique({
                where:{
                    id:data.userId
                }
            })
            userMap.set(user?.id,{ws,userInfo:user})
        }
        if(data.type === "personal-msg"){
            const ws = userMap.get(data.receiverId)?.ws
            if(ws){
                ws.send(JSON.stringify({
                    type:"personal-msg",
                    content:data.content,
                    senderId:data.senderId,
                    receiverId:data.receiverId
                }))
            }
            await saveMessage(data.senderId,data.receiverId,data.content ,data.isMedia =false)
        }
    })
})
};
