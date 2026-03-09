const express = require("express")
const { Auth } = require("../middleware/authMiddleware")
const { getMessages, markAsRead, getChatList } = require("../controllers/messageControllers")

const router = express.Router()

router.get("/message/:receiverid", Auth, async (req, res) => {
    try {
        const receiverId = req.params.receiverid
        const senderId = req.user?.id?.toString()

        const message = await getMessages(senderId, receiverId)

        res.status(200).json({ message })
    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
})

router.post("/message/:receiverid/read", Auth, async (req, res) => {
    try {
        const receiverId = req.params.receiverid
        const senderId = req.user?.id?.toString()

        await markAsRead(senderId, receiverId)

        res.status(200).json({ message: "Messages marked as read" })
    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
})

router.get("/list", Auth, async (req, res) => {
    try {
        const currentUserId = req.user?.id?.toString()

        const chatList = await getChatList(currentUserId)

        res.status(200).json({ message: chatList })
    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
})

module.exports = router