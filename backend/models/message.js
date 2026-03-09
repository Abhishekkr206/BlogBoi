const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    receiverId:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    senderId:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    text:{type:String, required:true},
    isRead:{type:Boolean, default:false},
}, {timestamps:true})

const model = mongoose.model("Message", messageSchema)

module.exports = model
