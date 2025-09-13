const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    author:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    img:{type:String},
    title:{type:String},
    content:{type:String, required:true},
    like:[{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
    comment:[{type:mongoose.Schema.Types.ObjectId, ref:"Comment"}]
}, {timestamps:true})

const model = mongoose.model("Post", postSchema)

module.exports = model