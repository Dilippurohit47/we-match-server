import express from "express"
import http from "http"
import dotenv from "dotenv"
import Auth from "./routes/Auth"
import UserRoutes from "./routes/user"
import UserMatchedRoutes from "./routes/match"
import cors from "cors"
import cookieParser from "cookie-parser";
dotenv.config()
const app = express()
app.use(cookieParser())
app.use(cors({
    credentials:true,
    origin:["http://localhost:5173"]
}))
app.use(express.json())
const server = http.createServer(app)
const PORT = process.env.PORT
app.get("/",(req,res)=>{
    res.send("Hello from server")
})
app.use("/api/v1/auth/",Auth)
app.use("/api/v1/user/",UserRoutes)
app.use("/api/v1/match/",UserMatchedRoutes)
server.listen((PORT),()=>{  
    console.log(`server is listening on ${PORT}`)
})



