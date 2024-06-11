const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter Your Name"],
        maxLength: [30,"Nmae cannot exceed 30 character"],
        minLength: [4, "Name should have more than 4 character"]
    },
    email:{
        type:String,
        required:[true,"Please Enter your Email"],
       unique: true,
       validate : [ validator.isEmail, "Please Enter a valid Email"]
    },
    password:{
        type:String,
        required:[true,"Please Enter your Password"],
        minLength: [4, "Password should be greater more than 4 character"],
        select: false,
    },
    avatar:{
        public_id: {
            type: String,
            required: true
        },
        url:{
            type:String,
            default:"user"
        }
    },
    role:{
        type:String,
        default: "user"
    },
    createAt:{
        type:Date,
       default:Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

//bycrpt password
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
     this.password = await bcrypt.hash(this.password, 10)
});

//JWT Token
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    });
}

// //Compare Passwword

// userSchema.methods.comparePassword = async function(password){
//     return await bcrypt.compare(password, this.password);
// };



//Generating Password Reset Token 
userSchema.methods.getResetPasswordToken = function(){
     //Generating Token
     const resetToken = crypto.randomBytes(20).toString("hex");
     
     //randomBytes(32).toString("hex");
     console.log(resetToken)
     //Hashing and adding resetPasswordToken to user Schema
     this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex;")

     this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  
     return resetToken;
}

module.exports = mongoose.model("User", userSchema);