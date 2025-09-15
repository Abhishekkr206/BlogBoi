const express = require("express")
const Auth = require("../middleware/authMiddleware")
const User = require("../models/user")
const Userpost = require("../models/post")
const Comment = require("../models/comment")

//file uplode
const fs = require("fs")
const upload = require("../middleware/multerMiddleware")
const cloudinary = require("../utils/cloudinary")

const router = express.Router()

router.post("/post", Auth, upload.single("img"), async (req,res)=>{
    try{
        if(!req.file) return res.status(400).json({ message: "No image uploaded" })
        const result = await cloudinary.uploader.upload(req.file.path,{folder:"blogBoi"}) 
        fs.unlinkSync(req.file.path)       

        const {title, content} = req.body
        const blog = new Userpost({
            img: result.secure_url,
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
router.get("/post/:postid", async (req,res)=>{
    try{
        const postid = req.params.postid
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

//more work required here because we just don't need the post we need all the things like name username post follower following like
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
            message:"comment added "
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
        const CommentData = await Userpost.findById(postid)
        .populate({
            path:"comment",
            populate: {path:"author", select:"username profileimg"},
        })
        res.status(200).json({
            message:CommentData.content
        })
    }
    catch (err) {
        res.status(500).json({
            message:err.message
        })
    }
})
router.post("/comment/:commentid/reply", Auth, async(req,res)=>{
    try {
        const {content} = req.body
        const author = req.user.id
        const commentid = req.params.commentid

        const postid = await Comment.findById(commentid)
        if (!postid) return res.status(404).json({ message: "Parent comment not found" });
        // const post = postid.post
        
        const reply = new Comment({
            post:commentid,
            author,
            content,
            reply:[]
        })
        const savedReply = await reply.save()
        await Comment.findOneAndUpdate(commentid, {$push:{reply:savedReply._id}})

        res.status(200).json({
            message:"Reply added "
        })
    } 
    catch (err) {
        res.status(500).json({
            message:err.message
        })
    }
})
router.get("/comment/:commentid/reply", async (req,res)=>{
    try {
        const replyid = req.params.commentid
        const parentComment = await Comment.findById(replyid)
        .populate({path:"reply",
            populate:{path:"author", select:"username profileimg"}
        })
    } 
    catch (err) {
        res.status(500).json({
            message:err.message
        })   
    }
})

router.post("/user/:userid/follow", Auth, async (req,res)=>{
    try {
        const followingid = req.params.userid
        const userid = req.user.id

        await User.findByIdAndUpdate(userid, {$addToSet:{following:followingid}})
        await User.findByIdAndUpdate(followingid, {$addToSet:{follower:userid}})

        res.status(200).json({
            message:"follow"
        })
    } 
    catch (err) {
        res.status(500).json({
            message:err.message
        })   
    }
})
router.get("/user/:userid/following", async (req,res)=>{
    try {
        const findFollowing = req.params.userid
        const userFollowing = await User.findById(findFollowing).populate("following", "username profileimg")

        res.status(200).json({
            message:userFollowing.following
        })
    }
    catch (err) {
        res.status(500).json({
            message:err.message
        })   
    }
})
router.get("/user/:userid/follower", async (req,res)=>{
    try {
        const findFollower = req.params.userid
         const userFollower = await User.findById(findFollower).populate("follower", "username profileimg")

        res.status(200).json({
            message:userFollower.following
        })
    }
    catch (err) {
        res.status(500).json({
            message:err.message
        })   
    }
})

router.post("post/:postid/like", Auth, async(req,res)=>{
    try {
        const postid = req.params.postid
        const userid = req.user.id
        const post = await Userpost.findByIdAndUpdate(postid, {$addToSet:{like:userid}})
        res.status(200).json({
            message:"Your like added"
        })
    }     
    catch (err) {
        res.status(500).json({
            message:err.message
        })   
    }
})

router.delete("/post/:postid", Auth, async (req,res)=>{
    try {
        const postid = req.params.postid
        const userid = req.user.id

        const result = await Userpost.deleteOne({_id:postid, author:userid})
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Post not found or not authorized" })
        }

        res.status(200).json({
            message:"your post deleted"
        })
    } 
    catch (err) {
        res.status(500).json({
            message:err.message
        })    
    }
})
router.delete("/comment/:commentid", Auth, async (req,res)=>{
    try {
        const commentid = req.params.commentid
        const userid = req.user.id
        const comment = await Comment.findById(commentid) 

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        if(comment.author.toString() !== userid){
            return res.status(404).json({message:"Not authorized to delete this comment"})
        }

        await Comment.deleteOne({_id:commentid, author:userid})
        await Userpost.findByIdAndUpdate(comment.post, {$pull:{comment:commentid}})

        res.status(200).json({
            message:"your comment deleted"
        })
    } 
    catch (err) {
        res.status(500).json({
            message:err.message
        })   
    }
})
router.delete("/comment/:replyid", Auth, async (req,res)=>{
    try {
        const replyid = req.params.replyid
        const userid = req.user.id
        const reply = await Comment.findById(replyid)

        if(!reply){
            return res.status(404).json({message:"Reply not found"})
        }
        if(reply.author.toString() !== userid){
            return res.status(404).json({message:"Not authorized to delete this reply"})
        }

        await Comment.deleteOne({_id:replyid, author:userid})
        await Comment.findByIdAndUpdate(reply._id, {$pull:{reply:replyid}})

        res.status(200).json({
            message:"your reply deleted"
        })
    } 
    catch (err) {
        res.status(500).json({
            message:err.message
        })   
    }
})
router.delete("/user/:userid/unfollow", Auth, async (req,res)=>{
    try {
        const unfollowUser = req.params.userid
        const userid = req.user.id
                
        const userToUnfollow = await User.findById(unfollowUserId)
        if (!userToUnfollow) {
            return res.status(404).json({ message: "User to unfollow not found" })
        }

        await User.findByIdAndUpdate(userid,{$pull:{following:unfollowUser}})
        await User.findByIdAndUpdate(unfollowUser,{$pull:{follower:userid}})

        res.status(200).json({
            message:"unfollow"
        })
    } 
    catch (err) {
        res.status(500).json({
            message:err.message
        })   
    }
})
router.delete("/post/:postid/unlike", Auth, async (req,res)=>{
    try {
        const postid = req.params.postid
        const userid = req.user.id
        
        const post = await Userpost.findById(postid)
        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        await Userpost.findByIdAndUpdate(postid,{$pull:{like:userid}})

        res.status(200).json({
            message:"unlike"
        })
    } 
    catch (err) {
        res.status(500).json({
            message:err.message
        })   
    }
})

module.exports = router