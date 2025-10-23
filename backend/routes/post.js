const express = require("express")
const { Auth, optionalAuth } = require("../middleware/authMiddleware")
const User = require("../models/user")
const Userpost = require("../models/post")
const Comment = require("../models/comment")
const redisClient = require("../config/redis")

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

    // Clear user's posts cache
    const keys = await redisClient.keys(`user:${req.user.id}:posts:page:*`)
    if (keys.length > 0) {
      await redisClient.del(keys)
    }

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

    // 70% trending, 30% recent
    const trendingLimit = Math.ceil(limit * 0.7)
    const recentLimit = limit - trendingLimit

    // Get trending posts (fetch extra for proper pagination)
    const trending = await Userpost.aggregate([
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $multiply: [{ $size: { $ifNull: ["$like", []] } }, 2] },
              { $multiply: [{ $size: { $ifNull: ["$comment", []] } }, 3] }
            ]
          }
        }
      },
      { $sort: { engagementScore: -1 } },
      { $limit: limit * page }
    ])

    const trendingIds = trending.map(p => p._id)

    // Get recent posts (exclude trending, fetch extra)
    const recent = await Userpost.find({ _id: { $nin: trendingIds } })
      .sort({ createdAt: -1 })
      .limit(limit * page)

    // Merge and shuffle
    const merged = [...trending, ...recent].sort(() => Math.random() - 0.5)

    // Apply proper pagination
    const blog = merged.slice(skip, skip + limit)

    await Userpost.populate(blog, {
      path: "author",
      select: "username profileimg"
    })

    const totalPosts = await Userpost.countDocuments()
    const currentUserId = req.user?.id?.toString()

    const blogs = blog.map(post => ({
      _id: post._id,
      author: post.author,
      title: post.title,
      content: post.content,
      img: post.img,
      like: post.like.length,
      isliked: currentUserId ? post.like.map(id => id.toString()).includes(currentUserId) : false,
      comment: post.comment.length,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }))

    res.status(200).json({
      message: blogs,
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

    const cached = await redisClient.get(`post:${postid}`)
    
    let blog
    if(cached){
      blog = JSON.parse(cached)
    }
    else{
      blog = await Userpost.findById(postid).populate("author", "username profileimg follower")
      if(!blog){
        return res.status(404).json({ message: "Post not found" })
      }
      // Cache the blog data (without user-specific fields)
      await redisClient.setEx(`post:${postid}`, 300, JSON.stringify(blog))
    }
    
    const followers = blog.author.follower || []
    
    const userBlogs = {
      _id: blog._id,
      author: blog.author,
      title: blog.title,
      content: blog.content,
      img: blog.img,
      like: blog.like.length,
      isfollowing: req.user ? followers.map(id => id.toString()).includes(req.user.id) : false,
      isliked: currentUserId ? blog.like.map(id => id.toString()).includes(currentUserId) : false,
      comment: blog.comment,
      createdAt: blog.createdAt,
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

    // Clear single post cache
    await redisClient.del(`post:${postid}`)

    // Clear post author's posts cache
    const postAuthor = await Userpost.findById(postid).select('author')
    const keys = await redisClient.keys(`user:${postAuthor.author}:posts:page:*`)
    if (keys.length > 0) {
      await redisClient.del(keys)
    }

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

    // Clear single post cache
    await redisClient.del(`post:${postid}`)

    // Clear post author's posts cache
    const postAuthor = await Userpost.findById(postid).select('author')
    const keys = await redisClient.keys(`user:${postAuthor.author}:posts:page:*`)
    if (keys.length > 0) {
      await redisClient.del(keys)
    }

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
      const urlParts = post.img.split('/')
      const filename = urlParts[urlParts.length - 1]
      const publicId = `blogBoi/${filename.split('.')[0]}`
      
      await cloudinary.uploader.destroy(publicId)
    }

    // Delete the post from database
    await Userpost.deleteOne({ _id: postid, author: userid })

    // Clear user's posts cache
    const keys = await redisClient.keys(`user:${userid}:posts:page:*`)
    if (keys.length > 0) {
      await redisClient.del(keys)
    }
    
    // Clear single post cache
    await redisClient.del(`post:${postid}`)

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
    const postId = req.params.postid
    const author = req.user.id
    const { content } = req.body

    const newComment = new Comment({ post: postId, author, content })
    const savedComment = await newComment.save()
    await Userpost.findByIdAndUpdate(postId, { $push: { comment: savedComment._id } })

    // Clear post author's posts cache
    const postAuthor = await Userpost.findById(postId).select('author')
    const keys = await redisClient.keys(`user:${postAuthor.author}:posts:page:*`)
    if (keys.length > 0) {
      await redisClient.del(keys)
    }
    
    // Clear single post cache
    await redisClient.del(`post:${postId}`)

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

    const totalComments = await Comment.countDocuments({ post: postid });

    const comments = await Comment.find({ post: postid })
      .populate("author", "username profileimg")
      .sort({ createdAt: -1 })
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

    const postid = comment.post  // Get post ID before deletion

    await Comment.deleteOne({ _id: commentid, author: userid })
    await Userpost.findByIdAndUpdate(postid, { $pull: { comment: commentid } })

    // Clear post author's posts cache
    const postAuthor = await Userpost.findById(postid).select('author')
    const keys = await redisClient.keys(`user:${postAuthor.author}:posts:page:*`)
    if (keys.length > 0) {
      await redisClient.del(keys)
    }
    
    // Clear single post cache
    await redisClient.del(`post:${postid}`)

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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const comment = await Comment.findById(commentId).select('reply');
    
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const totalReplies = comment.reply?.length || 0;

    const commentWithReplies = await Comment.findById(commentId)
      .populate({
        path: "reply",
        options: { 
          skip: skip, 
          limit: limit, 
          sort: { createdAt: -1 } 
        },
        populate: { 
          path: "author", 
          select: "username profileimg" 
        }
      });

    res.status(200).json({
      message: commentWithReplies.reply || [],
      hasMore: skip + (commentWithReplies.reply?.length || 0) < totalReplies,
    });
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

    const postCachedKey = `user:${userid}:posts:page:${page}`
    const userCachedKey = `user:${userid}:profile`

    const cachedPosts = await redisClient.get(postCachedKey)
    let userblog
    let totalPosts 
    if(cachedPosts){
      const blog = JSON.parse(cachedPosts)
      userblog = blog.userblog
      totalPosts = blog.totalPosts
    }
    else{
      userblog = await Userpost.find({ author: userid }).sort({createdAt: -1}).skip(skip).limit(limit)
      totalPosts = await Userpost.countDocuments({ author: userid })
      await redisClient.setEx(postCachedKey, 300, JSON.stringify({userblog, totalPosts}))
    }
    
    const cachedUser = await redisClient.get(userCachedKey)
    let user
    if(cachedUser){
      user = JSON.parse(cachedUser)
    }
    else{
      user = await User.findById({ _id: userid })
      await redisClient.setEx(userCachedKey, 300, JSON.stringify(user))
    }

    const followers = user.follower || []
    const following = user.following || []

    const response = {
      _id: user._id,
      username: user.username,
      name: user.name,
      bio:user.bio,
      profileimg: user.profileimg,
      email: user.email,
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
        like: blog.like.length,
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

    const currentUser = await User.findById(userid)
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" })
    }

    const updatedData = {}
    
    if (name) updatedData.name = name
    if (bio) updatedData.bio = bio

    if (req.file) {
      if (currentUser.profileimg) {
        try {
          const urlParts = currentUser.profileimg.split('/')
          const filename = urlParts[urlParts.length - 1]
          const publicId = `blogBoiUserInfo/${filename.split('.')[0]}`
          await cloudinary.uploader.destroy(publicId)
        } catch (deleteErr) {
          console.log("Error deleting old image:", deleteErr)
        }
      }

      const result = await cloudinary.uploader.upload(req.file.path, { 
        folder: "blogBoiUserInfo" 
      })
      fs.unlinkSync(req.file.path)
      updatedData.profileimg = result.secure_url
    }

    const updatedUser = await User.findByIdAndUpdate(
      userid, 
      updatedData, 
      { new: true, runValidators: true }
    )

    // Clear user's posts cache
    const keys = await redisClient.keys(`user:${userid}:posts:page:*`)
    if (keys.length > 0) {
      await redisClient.del(keys)
    }

    // Clear user's profile cache
    await redisClient.del(`user:${userid}:profile`)

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

  }catch(err) {
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

    // Clear both users' profile cache
    await redisClient.del(`user:${userid}:profile`)
    await redisClient.del(`user:${followingid}:profile`)

    // Clear all posts by the followed user (because isfollowing changed)
    const userPosts = await Userpost.find({ author: followingid }).select('_id')
    const postKeys = userPosts.map(post => `post:${post._id}`)
    if (postKeys.length > 0) {
      await redisClient.del(postKeys)
    }

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

    // Clear both users' profile cache
    await redisClient.del(`user:${userid}:profile`)
    await redisClient.del(`user:${unfollowUser}:profile`)

    // Clear all posts by the unfollowed user (because isfollowing changed)
    const userPosts = await Userpost.find({ author: unfollowUser }).select('_id')
    const postKeys = userPosts.map(post => `post:${post._id}`)
    if (postKeys.length > 0) {
      await redisClient.del(postKeys)
    }

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

    let myFollowerList = []
    if (req.user) {
      const currentUser = await User.findById(req.user.id).select("follower")
      myFollowerList = currentUser.follower.map(id => id.toString())
    }

    const followers = userFollower.follower.map(f => ({
      _id: f._id,
      username: f.username,
      name: f.name,
      profileimg: f.profileimg,
      isfollowing: myFollowerList.includes(f._id.toString())
    }))

    res.status(200).json({ message: followers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router