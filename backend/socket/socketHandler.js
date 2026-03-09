const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const Message = require("../models/message");
const {markAsRead} = require("../controllers/messageControllers")

module.exports = (io) => {
    const JWT_SECRET = process.env.JWT_SECRET;

    io.on("connection", (socket) => {
        try {
            const cookies = socket.handshake.headers.cookie;
            if (!cookies) return socket.disconnect();

            const parsedCookies = cookie.parse(cookies);
            const accessToken = parsedCookies.accessToken; 

            if (!accessToken || !JWT_SECRET) {
                console.error("Missing Token or JWT_SECRET");
                return socket.disconnect();
            }

            const decoded = jwt.verify(accessToken, JWT_SECRET);
            const userId = decoded.id;

            socket.join(userId.toString());

            socket.on("send_message", async ({ receiverId, text }) => {
                try {
                    const newMessage = await Message.create({
                        senderId: userId,
                        receiverId: receiverId,
                        text: text,
                        isRead: false
                    });

                    io.to(receiverId.toString()).emit("receive_message", newMessage);
                    socket.emit("receive_message", newMessage);
                } catch (error) {
                    console.log(error);
                }
            });

            socket.on("mark_read", async ({senderId}) => {
                await markAsRead(userId, senderId);
                // Force userId to be a string here
                io.to(senderId.toString()).emit("messages_read", { by: userId.toString() });
            })

        } catch (err) {
            console.log("Auth Error:", err.message);
            socket.disconnect();
        }
    });
};