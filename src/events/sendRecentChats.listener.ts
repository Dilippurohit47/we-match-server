import { appEvents } from "./events";
import { sendRecentChats } from "../routes/Chat";
import { sendToUser } from "../websockets/index";

console.log("registering")
appEvents.on("RECENT_CHATS_UPDATED", async (userId: string) => {
  console.log("2nd step for emitting")
  const chats = await sendRecentChats(userId);
  sendToUser(userId, {
    type: "get-recent-chats",
    chats,
  });
  console.log("chats send")
});
