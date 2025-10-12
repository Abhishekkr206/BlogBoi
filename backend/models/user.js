const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const UserSchema = new mongoose.Schema({
    username:{type:String, unique:true, required:true},
    name:{type:String, required:true},
    bio:{type:String, maxlength:150},
    email:{type:String, unique:true, required:true},
    password:{type:String, minlength:8},
    profileimg:{type:String},
    follower:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    following:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
},{timestamps:true})

UserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10)
    return next()
})


UserSchema.methods.comparepass = function(password){
    return bcrypt.compare(password, this.password)
}

const model = mongoose.model("User", UserSchema)

module.exports = model