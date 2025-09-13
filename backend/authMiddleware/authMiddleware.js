const express = require("express")
const jwt = require("jsonwebtoken")

require("dotenv").config()

const JWT_SECRET = process.env.JWT_SECRET

const auth = (req,res,next) =>{
    const token = req.cookies.token
    if(!token) return res.status(400).json({message:"tokken not found"})
    try{
        const user = jwt.verify(token, JWT_SECRET)
        req.user = user
        next()
    }
    catch(err){
        res.status(401).json({
            message:err
        })
    }
}