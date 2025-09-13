const express = require("express")
const Auth = require("../authMiddleware/authMiddleware")
const Userpost = require("../models/post")
const Comment = require("../models/comment")

const router = express.Router()

router.post("/post", Auth, async (req,res)=>{
    try{
        const {img, title, content} = req.body
        const blog = new Userpost({
            img,
            title,
            content,
            author:req.user.id
        })
        await blog.save()
        res.status(200).json({
            message:"Blog submited"
        })
    }
    catch(err){
        res.status(500).json({
            message:err.message
        })
    }
})

//for the front page
router.get("/post", async (req,res)=>{
    try{
        const blog = await Userpost.find()
        res.status(200).json({
            message:blog
        })
    }
    catch(err){
        res.status(500).json({
            message:err.message
        })
    }
})

//for the specific post to see the full blog and comments
router.get("/post/:id", async (req,res)=>{
    try{
        const postid = req.params.id
        const blog = await Userpost.findById(postid).populate("author","username profileimg")

        if (!blog) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({
            message:blog
        })
    }
    catch(err){
        res.status(500).json({
            message:err.message
        })
    }
})

//for the user profile
router.get("/user/:userid", async (req,res)=>{
    try {
        const userid = req.params.userid
        const userblog = await Userpost.find({author:userid})
        res.status(200).json({
            message:userblog
        })
    } 
    catch (err) {
        res.status(500).json({
            message:err.message
        })
    }
})

//comments
router.post("/comment/:postid", Auth, async (req,res)=>{
    try {
        const {content} = req.body
        const post = req.params.postid
        const author = req.user.id
        const newComment =  new Comment({
            post,
            author,
            content
        })
        const savedComment = await newComment.save()
        await Userpost.findByIdAndUpdate(post, {$push:{comment:savedComment._id}})
        res.status(200).json({
            message:"commented "
        })
    } 
    catch (err) {
         res.status(500).json({
            message:err.message
        })
    }
})
router.get("/comment/:postid", async (req,res)=>{
    try {
        const postid = req.params.postid
        const CommentData = await Userpost.findById(postid).populate("comment")
        res.status(200).json({
            message:CommentData
        })
    }
    catch (err) {
        res.status(500).json({
            message:err.message
        })
    }
})

router.delete()