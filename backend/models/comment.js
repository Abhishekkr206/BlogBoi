const mongoose = require("mongoose")

const commentShema = new mongoose.Schema({
    post:{type:mongoose.Schema.Types.ObjectId, ref:"Post", required:true},
    author:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    content:{type:String, required:true},
},{timestamps:true})

const model = mongoose.model("Comment", commentShema)

module.exports = model