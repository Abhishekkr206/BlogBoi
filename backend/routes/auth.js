const express = require("express")
const jwt = require("jsonwebtoken")
const auth = require("../models/user")
const { findOne } = require("../models/user")
const OTP = require("../models/OTP")
const genrateOtp = require("../utils/generateOtp")
const nodemailer = require("nodemailer");

require("dotenv").config()
const JWT_SECRET = process.env.JWT_SECRET

const router = express.Router()
router.use(express.json())

const transport = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.PASS_USER
    }
})

router.post("/validateotp", async (req,res)=>{
    const {email, otp, name, username, password} = req.body
    try{
        const verifyotp = await OTP.findOne({email})
        
        if(!verifyotp) return res.status(400).json({message:"Invalid" })
        if(verifyotp.otp !== otp) return res.status(400).json({message:"Invalid OTP" })

        const User = new auth({username,name,email,password})
        await User.save()

        const token = jwt.sign({id:User._id}, JWT_SECRET, {expiresIn:"1d"})
        console.log("token created")

        res.cookie("token", token,{
            httpOnly:true,
            secure:false,
            maxAge:24*60*60*1000,
            sameSite:"Lax",
            path:'/'
        })
        res.status(200).json({
            message:"SignUp success",
            user: {
                _id: User._id,
                username: User.username,
                name: User.name,
                email: User.email,
                profileimg: User.profileimg,
                bio: User.bio,
            }
        })
    }
    catch(err){
        res.status(400).json({message:"Invalid OTP" })
    }
})

router.post("/google", async (req, res) => {
  const { token, name, username } = req.body;

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, picture } = ticket.getPayload();

    // Check if user exists
    let user = await auth.findOne({ email });

    if (!user) {
      // Create new user
      user = new auth({
        username,
        name,
        email,
        profileimg: picture || "", // fallback if no picture
        password: null,
      });
      await user.save();
    }

    // Create JWT
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    console.log("Token created");

    // Set cookie
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "Lax",
      path: "/",
    });

    // Respond with user info
    res.status(200).json({
      message: "SignUp success",
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profileimg: user.profileimg,
        bio: user.bio || "",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid Google token" });
  }
});


router.post("/signup", async (req,res)=>{
    const {username,name,email,password,google} = req.body
    try{
        if(google){
            let user = auth.findOne({email})
            if(!user){
                user = new auth({username,name,email,password})
                await user.save()
            }
            const token = jwt.sign({id:User._id}, JWT_SECRET, {expiresIn:"1d"})
            console.log("token created")
            
            res.cookie("token", token,{
                httpOnly:true,
                secure:false,
                maxAge:24*60*60*1000,
                sameSite:"Lax",
                path:'/'
            })
            res.status(200).json({
                message:"SignUp success",
                user: {
                    _id: User._id,
                    username: User.username,
                    name: User.name,
                    email: User.email,
                    profileimg: User.profileimg,
                    bio: User.bio,
                }
            })
        }
        
    const {email} = req.body
    const otp = genrateOtp()
    try{
        await OTP.create({email, otp})

        await transport.sendMail({
            from: process.env.EMAIL_USER,
            to:email,
            subject:"Your OTP code",    
            text:`Your OTP code is ${otp}. It will expire in 5 minutes.`
        })
        res.status(200).json({ message: "OTP sent successfully" });
    } 
    catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to send OTP" });
    }

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
            sameSite:"Lax",
            path:'/'
        })
        res.status(200).json({
            message:"Login success",
            user: {
                _id: identifyuser._id,
                username: identifyuser.username,
                name: identifyuser.name,
                email: identifyuser.email,
                profileimg: identifyuser.profileimg,
                bio: identifyuser.bio,
            }
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