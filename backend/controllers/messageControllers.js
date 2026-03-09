const Message = require("../models/message")
const User = require("../models/user")

async function getMessages(senderId, receiverId) {
    const messages = await Message.find({
        $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
        ]
    }).sort({ createdAt: 1 });

    return messages;
}

async function markAsRead(currentUserId, otherUserId) {
    await Message.updateMany(
        { 
            senderId: otherUserId,   
            receiverId: currentUserId, 
            isRead: false 
        },
        { $set: { isRead: true } }
    );
}

async function getChatList(currentUserId) {
    // 1. Get unique IDs of people the user has chatted with
    const sentTo = await Message.find({ senderId: currentUserId }).distinct("receiverId");
    const receivedFrom = await Message.find({ receiverId: currentUserId }).distinct("senderId");

    // 2. Combine and remove duplicates to get a unique list of User IDs
    const uniqueIds = [...new Set([...sentTo, ...receivedFrom])];

    // 3. Fetch the actual User details for those IDs
    // We use $in to find all users whose _id is in our uniqueIds array
    const chatList = await User.find({
        _id: { $in: uniqueIds }
    }).select("username profileimg"); 

    return chatList;
}

module.exports = { getMessages, markAsRead, getChatList }