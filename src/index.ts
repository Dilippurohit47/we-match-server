import express from "express"
import http from "http"
import dotenv from "dotenv"
import Auth from "./routes/Auth"
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
server.listen((PORT),()=>{  
    console.log(`server is listening on ${PORT}`)
})



