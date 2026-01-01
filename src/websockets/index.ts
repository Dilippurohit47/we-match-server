import { WebSocketServer } from "ws";
import prisma from "../helper/prisma";
import { saveMessage, sendRecentChats, updateUnreadMessageCount, upsertRecentChats } from "../routes/Chat";
import { appEvents } from "../events/events";

const userMap = new Map()

export const sendToUser = (userId: string, payload: any) => {
  const client = userMap.get(userId)?.ws;
  if (client && client.readyState === client.OPEN) {
    client.send(JSON.stringify(payload));
  }
};

export const setupWebSocket = (server: any) => {
  const wss = new WebSocketServer({ server });

wss.on("connection",(ws) =>{
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
            Array.from([data.receiverId , data.senderId]).forEach((userId) =>{
            appEvents.emit("RECENT_CHATS_UPDATED", userId);
            })
        }

        if(data.type === "update-unread-message-count"){
            await updateUnreadMessageCount(data.chatId , data.idForUpdate)
            appEvents.emit("RECENT_CHATS_UPDATED", data.idForUpdate);
        }
        if(data.type === "send-recent-chats"){
            const chats  = await sendRecentChats(data.userId)
            let ws = userMap.get(data.userId)?.ws
            if(ws){
                ws.send(JSON.stringify({
                    type:"get-recent-chats",
                    chats:chats
                }))
            }
        }


    })
})
};
