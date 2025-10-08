const express = require("express")
const jwt = require("jsonwebtoken")

require("dotenv").config()

const JWT_SECRET = process.env.JWT_SECRET

const Auth = (req, res, next) => {
    const token = req.cookies.token
    if(!token) return res.status(400).json({message:"token not found"})
    try{
        const user = jwt.verify(token, JWT_SECRET)
        req.user = user
        next()
    }
    catch(err){
        res.status(401).json({
            message:"invalid token"
        })
    }
}

// Optional authentication - for guest users
const optionalAuth = (req, res, next) => {
    const token = req.cookies.token
    
    if (token) {
        try {
            const user = jwt.verify(token, JWT_SECRET)
            req.user = user // User is logged in
        } catch(err) {
            req.user = null // Invalid token, treat as guest
        }
    } else {
        req.user = null // No token, treat as guest
    }
    
    next() // Always continue
}

module.exports = { Auth, optionalAuth }