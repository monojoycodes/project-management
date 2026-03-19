import express from 'express'
import cors from "cors"
const app = express(); //make an express app

//setup express to be able to make POST requests
app.use(express.json( {limit:"16kb"} )); //will accept payload upto 16KB.
app.use(express.urlencoded( {extended:true, limit:"16kb"} )); //will encode url spaces (say, to %20,..) and upto 16KB allowed
app.use(express.static("public")); //will be used to make this part of api publically usable


//cors configuration
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:3000", //which frontend can access this backend. 
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Authorization", "Content-Type"]
    }
))

//import the routes
import router from "./routes/healthcheck.routes.js"
app.use("/api/v1/healthcheck",router);


app.get("/", (req, res) => {
    res.send("One busy human being");
})

app.get("/yash", (req, res) => {
    res.send("Yash is a Ratnaparkhi!!")
})


export default app;