const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
    post:{type:mongoose.Schema.Types.ObjectId, ref:"Post", required:true},
    author:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    content:{type:String, required:true},
    reply:[{type:mongoose.Schema.Types.ObjectId, ref:"Comment"}]
},{timestamps:true})

const model = mongoose.model("Comment", commentSchema)

module.exports = model