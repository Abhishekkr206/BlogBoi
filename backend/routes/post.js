const express = require("express")
const { Auth, optionalAuth } = require("../middleware/authMiddleware")
const User = require("../models/user")
const Userpost = require("../models/post")
const Comment = require("../models/comment")

// File upload
const fs = require("fs")
const upload = require("../middleware/multerMiddleware")
const cloudinary = require("../utils/cloudinary")
const { parse } = require("path")

const router = express.Router()

// ============================================================
//  POST ROUTES
// ============================================================

// Create new post
router.post("/post", Auth, upload.single("img"), async (req, res) => {
  try {
    let imgUrl = ""
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "blogBoi" })
      fs.unlinkSync(req.file.path)
      imgUrl = result.secure_url
    }

    const { title, content } = req.body
    const blog = new Userpost({
      img: imgUrl,
      title,
      content,
      author: req.user.id
    })
    await blog.save()
    res.status(200).json({ message: "Blog submited" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all posts (front page)
router.get("/post", optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const blog = await Userpost.find()
      .sort({createdAt: -1})
      .skip(skip)
      .limit(limit)
      .populate({
        path: "author",
        select: "username profileimg"
    })

    const totalPosts = await Userpost.countDocuments();
    const currentUserId = req.user?.id?.toString()

    const blogs = blog.map(post => ({
      _id: post._id,
      author: post.author,
      title: post.title,
      content: post.content,
      img: post.img,
      like: post.like,
      isliked: currentUserId ? post.like.map(id => id.toString()).includes(currentUserId) : false,
      comment: post.comment.length,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }))

    res.status(200).json({ message: blogs,      
      hasMore: skip + blog.length < totalPosts,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get a specific post with full details + comments
router.get("/post/:postid", optionalAuth, async (req, res) => {
  try {
    const postid = req.params.postid
    const currentUserId = req.user?.id?.toString()

    const blog = await Userpost.findById(postid).populate("author", "username profileimg follower")

    if (!blog) {
      return res.status(404).json({ message: "Post not found" })
    }

    const followers = blog.author.follower || []

    const userBlogs = {
      _id: blog._id,
      author: blog.author,
      title: blog.title,
      content: blog.content,
      img: blog.img,
      like: blog.like,
      isfollowing: req.user ? followers.map(id => id.toString()).includes(req.user.id) : false,
      isliked: currentUserId ? blog.like.map(id => id.toString()).includes(currentUserId) : false,
      comment: blog.comment,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt
    }

    res.status(200).json({ message: userBlogs })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Like a post
router.post("/post/:postid/like", Auth, async (req, res) => {
  try {
    const postid = req.params.postid
    const userid = req.user.id
    await Userpost.findByIdAndUpdate(postid, { $addToSet: { like: userid } })
    res.status(200).json({ message: "Your like added" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Unlike a post
router.delete("/post/:postid/unlike", Auth, async (req, res) => {
  try {
    const postid = req.params.postid
    const userid = req.user.id

    const post = await Userpost.findById(postid)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    await Userpost.findByIdAndUpdate(postid, { $pull: { like: userid } })
    res.status(200).json({ message: "unlike" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete a post
router.delete("/post/:postid", Auth, async (req, res) => {
  try {
    const postid = req.params.postid
    const userid = req.user.id

    // First, find the post to get the image URL
    const post = await Userpost.findOne({ _id: postid, author: userid })

    if (!post) {
      return res.status(404).json({ message: "Post not found or not authorized" })
    }

    // Delete image from Cloudinary if it exists
    if (post.img) {
      // Extract public_id from the Cloudinary URL
      const urlParts = post.img.split('/')
      const filename = urlParts[urlParts.length - 1]
      const publicId = `blogBoi/${filename.split('.')[0]}`
      
      await cloudinary.uploader.destroy(publicId)
    }

    // Delete the post from database
    await Userpost.deleteOne({ _id: postid, author: userid })

    res.status(200).json({ message: "your post deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ============================================================
//  COMMENT ROUTES
// ============================================================

// Add a comment to a post
router.post("/comment/:postid", Auth, async (req, res) => {
  try {
    const post = req.params.postid
    const author = req.user.id
    const { content } = req.body

    const newComment = new Comment({ post, author, content })
    const savedComment = await newComment.save()
    await Userpost.findByIdAndUpdate(post, { $push: { comment: savedComment._id } })

    res.status(200).json({ message: "comment added " })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get comments of a post
router.get("/comment/:postid", async (req, res) => {
  try {
    const postid = req.params.postid;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Count total comments for this post
    const totalComments = await Comment.countDocuments({ post: postid });

    // Find comments by post reference
    const comments = await Comment.find({ post: postid })
      .populate("author", "username profileimg")
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: comments,
      hasMore: skip + comments.length < totalComments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Delete a comment
router.delete("/comment/:commentid", Auth, async (req, res) => {
  try {
    const commentid = req.params.commentid
    const userid = req.user.id
    const comment = await Comment.findById(commentid)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (comment.author.toString() !== userid) {
      return res.status(404).json({ message: "Not authorized to delete this comment" })
    }

    await Comment.deleteOne({ _id: commentid, author: userid })
    await Userpost.findByIdAndUpdate(comment.post, { $pull: { comment: commentid } })

    res.status(200).json({ message: "your comment deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ============================================================
//  REPLY ROUTES
// ============================================================

// Add reply to a comment
router.post("/comment/:commentid/reply", Auth, async (req, res) => {
  try {
    const { content } = req.body
    const author = req.user.id
    const commentid = req.params.commentid

    const postid = await Comment.findById(commentid)
    if (!postid) return res.status(404).json({ message: "Parent comment not found" })

    const reply = new Comment({ post: commentid, author, content, reply: [] })
    const savedReply = await reply.save()
    await Comment.findOneAndUpdate({ _id: commentid }, { $push: { reply: savedReply._id } })

    res.status(200).json({ message: "Reply added " })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all replies of a comment
router.get("/comment/:commentid/reply", async (req, res) => {
  try {
    const commentId = req.params.commentid;
    
    const comment = await Comment.findById(commentId).populate({
      path: "reply",
      populate: { path: "author", select: "username profileimg" }
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(comment.reply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a reply
router.delete("/comment/:replyid/reply", Auth, async (req, res) => {
  try {
    const replyid = req.params.replyid
    const userid = req.user.id
    const reply = await Comment.findById(replyid)

    if (!reply) {
      return res.status(404).json({ message: "Reply not found" })
    }
    if (reply.author.toString() !== userid) {
      return res.status(404).json({ message: "Not authorized to delete this reply" })
    }

    await Comment.deleteOne({ _id: replyid, author: userid })
    await Comment.findByIdAndUpdate(reply._id, { $pull: { reply: replyid } })

    res.status(200).json({ message: "your reply deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ============================================================
//  USER ROUTES
// ============================================================

// Get user profile with posts
router.get("/user/:userid", optionalAuth, async (req, res) => {
  try {
    const userid = req.params.userid

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const totalPosts = await Userpost.countDocuments({ author: userid });
    const userblog = await Userpost.find({ author: userid }).sort({createdAt: -1}).skip(skip).limit(limit)

    const user = await User.findById({ _id: userid })

    const followers = user.follower || []
    const following = user.following || []

    const response = {
      _id: user._id,
      username: user.username,
      name: user.name,
      bio:user.bio,
      profileimg: user.profileimg,
      email: user.email,
      followers: followers,
      following: following,
      followerCount: user.follower.length,
      followingCount: user.following.length,
      isfollowing: req.user ? followers.map(id => id.toString()).includes(req.user.id) : false,
      blogs: userblog.map(blog => ({
        _id: blog._id,
        author: {
          _id: user._id,
          username: user.username,
          profileimg: user.profileimg
        },
        title: blog.title,
        content: blog.content,
        img: blog.img,
        like: blog.like,
        isliked: blog.like.map(id => id.toString()).includes(req.user?.id),
        comment: blog.comment.length,
        createdAt: blog.createdAt,
        profileSection: true,
      })),
      hasMore: skip + userblog.length < totalPosts,
    }

    res.status(200).json({ response })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Edit user profile
router.patch("/user/edit", Auth, upload.single("profileimg"), async (req, res) => {
  try{
    const userid = req.user.id
    const { name, bio } = req.body

    // Fetch current user
    const currentUser = await User.findById(userid)
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" })
    }

    const updatedData = {}
    
    // Handle text fields first
    if (name) updatedData.name = name
    if (bio) updatedData.bio = bio

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (currentUser.profileimg) {
        try {
          const urlParts = currentUser.profileimg.split('/')
          const filename = urlParts[urlParts.length - 1]
          const publicId = `blogBoiUserInfo/${filename.split('.')[0]}`
          await cloudinary.uploader.destroy(publicId)
          console.log("Old image deleted:", publicId)
        } catch (deleteErr) {
          console.log("Error deleting old image:", deleteErr)
        }
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, { 
        folder: "blogBoiUserInfo" 
      })
      fs.unlinkSync(req.file.path) // Delete temp file
      updatedData.profileimg = result.secure_url
      console.log("New image uploaded:", result.secure_url)
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userid, 
      updatedData, 
      { new: true, runValidators: true }
    )

    res.status(200).json({ 
      message: "Profile updated successfully", 
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        bio: updatedUser.bio,
        profileimg: updatedUser.profileimg,
        username: updatedUser.username
      }
    })

  }catch(err){
    console.error("Update error:", err)
    res.status(500).json({ message: err.message })
  }
})

// Follow a user
router.post("/user/:userid/follow", Auth, async (req, res) => {
  try {
    const followingid = req.params.userid
    const userid = req.user.id

    await User.findByIdAndUpdate(userid, { $addToSet: { following: followingid } })
    await User.findByIdAndUpdate(followingid, { $addToSet: { follower: userid } })

    res.status(200).json({ message: "follow" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Unfollow a user
router.delete("/user/:userid/unfollow", Auth, async (req, res) => {
  try {
    const unfollowUser = req.params.userid
    const userid = req.user.id

    const userToUnfollow = await User.findById(unfollowUser)
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User to unfollow not found" })
    }

    await User.findByIdAndUpdate(userid, { $pull: { following: unfollowUser } })
    await User.findByIdAndUpdate(unfollowUser, { $pull: { follower: userid } })

    res.status(200).json({ message: "unfollow" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get user's following list
router.get("/user/:userid/following", optionalAuth, async (req, res) => {
  try {
    const findFollowing = req.params.userid
    const userFollowing = await User.findById(findFollowing).populate("following", "username name profileimg")

    let myFollowingList = []
    if (req.user) {
      const currentUser = await User.findById(req.user.id).select("following")
      myFollowingList = currentUser.following.map(id => id.toString())
    }

    const following = userFollowing.following.map(f => ({
      _id: f._id,
      username: f.username,
      name: f.name,
      profileimg: f.profileimg,
      isfollowing: myFollowingList.includes(f._id.toString())
    }))

    res.status(200).json({ message: following })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get user's followers list
router.get("/user/:userid/follower", optionalAuth, async (req, res) => {
  try {
    const findFollower = req.params.userid
    const userFollower = await User.findById(findFollower).populate("follower", "username name profileimg")

    let myFollowingList = []
    if (req.user) {
      const currentUser = await User.findById(req.user.id).select("following")
      myFollowingList = currentUser.following.map(id => id.toString())
    }

    const followers = userFollower.follower.map(f => ({
      _id: f._id,
      username: f.username,
      name: f.name,
      profileimg: f.profileimg,
      isfollowing: myFollowingList.includes(f._id.toString())
    }))

    res.status(200).json({ message: followers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
