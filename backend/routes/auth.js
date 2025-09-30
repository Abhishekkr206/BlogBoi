const express = require("express")
const jwt = require("jsonwebtoken")
const auth = require("../models/user")
const { findOne } = require("../models/user")

require("dotenv").config()
const JWT_SECRET = process.env.JWT_SECRET

const router = express.Router()
router.use(express.json())

router.post("/signup", async (req,res)=>{
    try{
        const {username,name,email,password} = req.body
        const User = new auth({username,name,email,password})
        await User.save()
    
        const token = jwt.sign({id:User._id}, JWT_SECRET, {expiresIn:"1d"})
        console.log("token created")

        res.cookie("token", token,{
            httpOnly:true,
            secure:false,
            maxAge:24*60*60*1000,
            sameSite:"None",
            path:'/'
        })
        res.status(200).json({
            message:"SignUp success",
            user: {
                _id: User._id,
                username: User.username,
                name: User.name,
                email: User.email
            }
        })
    }
    catch(err){
        res.status(400).json({
            message:err
        })
    }
})

router.post("/login", async (req,res)=>{
    try{
        const {user,password} = req.body

        const identifyuser = await auth.findOne({
            $or: [{ username: user }, { email: user }]
        })

        if(!identifyuser) return res.status(401).json({message:"invaild user "})
        
        const comparepassword = await identifyuser.comparepass(password)
        if(!comparepassword) return res.status(401).json({message:"invaild password "})

            
        const token = jwt.sign({id:identifyuser._id}, JWT_SECRET, {expiresIn:"1d"})
        console.log("token created")

        res.cookie("token", token,{
            httpOnly:true,
            secure:false,
            maxAge:24*60*60*1000,
            sameSite:"None",
            path:'/'
        })
        res.status(200).json({
            message:"Login success"
        })

    }
    catch(err){
        res.status(400).json({
            message:"invaild credentials"
        })
    }
})

router.post("/logout", async (req,res)=>{
     res.clearCookie("token", {
     httpOnly: true,
     secure: true,
     sameSite: "None",
     path: "/"
    });
    res.status(200).json({
        message:"logged out"
    });
})

module.exports = router