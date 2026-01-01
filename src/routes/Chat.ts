import prisma from "../helper/prisma";
import express from "express"
import { authMiddleware } from "../middleware";
const app = express.Router()


app.get("/get-recent-chats", authMiddleware,async(req, res) => {
  try {
    const userId = req.user.id
    if (!userId) {
      res.status(404).json({
        message: "Login first",
      });
      return;
    } 

  

    const chats = await prisma.chat.findMany({
      where: {
        AND: [
          {
            OR: [{ senderId: userId }, { receiverId: userId }],
          },
          {
            deleteBy: {
              none: {
                userId: userId,
              },
            },
          },
        ],
      },
      orderBy: {
        lastMessageCreatedAt: "desc",
      },
      include: {
        user1: true,
        user2: true,
        deleteBy: true,
      },
    });

    const formattedChats = chats.map((chat) => {
      const otherUser = chat.user1.id === userId ? chat.user2 : chat.user1;
      return {
        chatId: chat.id,
        lastMessage: chat.lastMessage,
        lastMessageCreatedAt: chat.lastMessageCreatedAt,
        unreadCount: chat.unreadCount,
        senderId:chat.senderId,
        receiverId:chat.receiverId,
        ...otherUser,
      };
    });



    res.json({
      chats: formattedChats,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}); 


 export const upsertRecentChats = async (
  senderId: string,
  receiverId: string,
content:string,
) => {
  try {
    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });
 
    const unreadCount = chat?.unreadCount as {unreadMessages : number}

    if (chat) {
      await prisma.chat.update({
        where: {
          id: chat.id,
        },
        data: {
          lastMessage:content,
          senderId:senderId,
          receiverId:receiverId,
          lastMessageCreatedAt: new Date(),
          unreadCount: {
            userId: receiverId,
            unreadMessages:
              unreadCount?.unreadMessages != null
                ? unreadCount.unreadMessages + 1
                : 1,
          },
        },
      });

      await prisma.deletedChat.deleteMany({
        where:{ 
          userId:{
            in:[senderId,receiverId]
          },
          chatId:chat.id
        }
      })
    } else {  
    chat =  await prisma.chat.create({
        data: {
          senderId: senderId,
          receiverId: receiverId,
          lastMessage:content,
          lastMessageCreatedAt: new Date(),
            unreadCount: {
            userId: receiverId,
            unreadMessages:1
          },
        }, 
      });
    }
    return chat
  } catch (error) {
    console.log("error in upserting recent chats",error);
  }
};

export const saveMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  isMedia:boolean,
) => {
  try { 
 
const chat  = await upsertRecentChats(senderId,receiverId,content)
if(!chat) return
await prisma.messages.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        content: content,
        chatId: chat.id,
        isMedia:isMedia || false,
          },
    });
    return true;
  } catch (error) {
    console.log("error in saving message",error);
    return false;
  }
};

export const updateUnreadMessageCount = async(chatId:string , idForUpdate:string)=>{
     let chat ;
    if(chatId){
chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },  
    });
  } 
    if(!chat){
      console.log("no chat found for unread count update")
      return 
    }

    const unreadCount = chat?.unreadCount as {userId:string} | null
    if ( unreadCount && unreadCount.userId === idForUpdate) {
      await prisma.chat.update({
        where: {
          id: chatId || chat.id,
        },
        data: {
          unreadCount: {
            userId: null,
            unreadMessages: 0,
          },
        },
      });
    }
    return

}



export const sendRecentChats = async (userId: string) => {
  try {  
    if (!userId) { 
      return;
    }
    const chats = await prisma.chat.findMany({
  where: {
  OR: [{ senderId: userId }, { receiverId: userId }],
  deleteBy: {
    none: { userId },
  },
},
      orderBy: {
        lastMessageCreatedAt: "desc",
      },
      include: {
        user1: true,
        user2: true,
      },
    });
    const formattedChats = chats.map((chat) => {
      const otherUser = chat.user1.id === userId ? chat.user2 : chat.user1;
      return {
        chatId: chat.id,
        lastMessage: chat.lastMessage,
        senderId:chat.senderId,
        receiverId:chat.receiverId,
        lastMessageCreatedAt: chat.lastMessageCreatedAt,
        unreadCount: chat.unreadCount,
        ...otherUser,
      };
    });
    return formattedChats;
  } catch (error) {
    console.log("error in send recent chats ",error);
  }
};

export default app