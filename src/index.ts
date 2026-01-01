import express from "express"
import http from "http"
import dotenv from "dotenv"
import Auth from "./routes/Auth"
import UserRoutes from "./routes/user"
import UserMatchedRoutes from "./routes/match"
import ChatRoutes from "./routes/Chat"
import cors from "cors"
import cookieParser from "cookie-parser";
import MessageRoutes from "./routes/messages"
import "./events/sendRecentChats.listener"
import { setupWebSocket } from "./websockets"
dotenv.config()
const app = express()
app.use(cookieParser())
app.use(cors({
    credentials:true,
    origin:["http://localhost:5173"]
}))
app.use(express.json())
const server = http.createServer(app)
setupWebSocket(server)

const PORT = process.env.PORT

app.get("/",(req,res)=>{
    res.send("Hello from server")
})
app.use("/api/v1/auth/",Auth)
app.use("/api/v1/user/",UserRoutes)
app.use("/api/v1/match/",UserMatchedRoutes)
app.use("/api/v1/chat/",ChatRoutes)
app.use("/api/v1/message/",MessageRoutes)
server.listen((PORT),()=>{  
    console.log(`server is listening on ${PORT}`)
})



