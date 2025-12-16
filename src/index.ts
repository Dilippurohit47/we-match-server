import express from "express"
import http from "http"
import dotenv from "dotenv"
dotenv.config()
const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT
app.get("/",(req,res)=>{
    res.send("Hello from server")
})
server.listen((PORT),()=>{
    console.log(`server is listening on ${PORT}`)
})


