const express = require("express")
const morgan = require("morgan")
const helmet = require("helmet")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser =require("cookie-parser")

require("dotenv").config();

const app = express()
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL
console.log("PORT:", process.env.PORT);
console.log("MONGO_URL", process.env.MONGO_URL);


app.use(morgan("dev"))
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
// app.use(cors({
//   origin: "frontend",
//   credentials: true,
// }));

// app.get('/', (req,res)=>{
//     res.send("hi")
// })
    
mongoose.connect(MONGO_URL).then(()=>
app.listen(PORT, ()=>{console.log(`server is running on this port ${PORT}`)})).catch((err)=>{console.log(err)})