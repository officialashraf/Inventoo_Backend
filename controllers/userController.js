const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/userModele"); 
const sendToken = require("../utils/jwtToken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const Product = require("../models/productModle");
const cloudinary = require("cloudinary");


exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });
    const { name, email,password} = req.body;
    
    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    });

   sendToken(user,201,res);
})


//login user
exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
    const{ email, password } = req.body;

// checking if user has given both email & password

if(!email || !password){
    return next(new ErrorHander("Please Enter email or password",400));
}
const user = await User.findOne({ email }).select("+password");

if(!user){
    return next(new ErrorHander("Invalid email or password",401)); 
}
//console.log(user)
//console.log(password)
const isPasswordMatched = await bcrypt.compare(password, user.password);


if(!isPasswordMatched){
    return next(new ErrorHander("Invalid email or password",401)); 
}
sendToken(user, 200, res);
})




///Logout Functionality

exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
 res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
 });


    res.status(200).json({
        success:true,
        message: "Logged Out"
    })
})

//Forgot Password

exports.forgotPassword = catchAsyncErrors(async (req,res, next)=>{
    const user =  await User.findOne({ email: req.body.email})

    if(!user){
        return next(new ErrorHander("User Not Found", 404));
    }
    //Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

    const message = `Your password reset token is temp :- /n/n ${resetPasswordUrl} /n/nIf you have not requested this email then please ignore it`;

    try{
         await sendEmail({
            email: user.email,
            subject: `Inventoo Password Recovery`,
            message,
         });

         res.status(200).json({
            success: true,
            message: `email send to ${user.email} successfully`,
         });
    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false})
         
        return next(new ErrorHander(error.message, 500));
    }
});




//Reset Password For User
exports.resetPassword = catchAsyncErrors( async (req,res,next)=>{

//creating Token Hash
const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex;");

const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {$gt: Date.now() },
});

if(!user){
    return next(new ErrorHander("reset Password Token is invalid or has been expired", 400))
}

if(req.body.password !== req.body.confirmPassword){
    return next(new ErrorHander("Password does not password", 400)) ;
}

user.password = req.body.password;
user.resetPasswordToken = undefined;
user.resetPasswordExpire = undefined;

await user.save();

sendToken(user,200, res);
})


//Get user Details
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    })
})

//Upadte User Password
exports.updateUserPassword = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user.id).select("+password");
   /// console.log(user.password)
    const isPasswordMatched = await bcrypt.compare(req.body.oldPassword, user.password);
      /// console.log(req.body.oldPassword)
       

if(!isPasswordMatched){
    return next(new ErrorHander("Old  password is incorrect",400)); 
}

if(req.body.newPassword !== req.body.confirmPassword){
    return next(new ErrorHander("Password doesnt match",400));
}
user.password = req.body.newPassword;
//console.log(req.body.newPassword)
     
    await user.save();
    sendToken(user, 200, res);
    
})


//User Profile Update

exports.updateUserProfile = catchAsyncErrors(async(req,res,next)=>{

   const newUserData ={
    email: req.body.email,
    name:  req.body.name
   };
   if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }


   const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
    new: true,
    runValidators : true,
    useFindAndModify : false
   });
    
   res.status(200).json({
    success: true,
    message: "profile succesfullly updated",
   })
})


//Get Singal User Details ---Admin
exports.getSingalUserDetails = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user.id);

    if(!user){
        return next(new ErrorHander(`User does'nt Exists witd id ${req.user.id}`, 400))
    }

    res.status(200).json({
        success: true,
        user,
    });
})

//Get All User Details ---Admin
exports.getAllUserDetails = catchAsyncErrors(async(req,res,next)=>{

    const users = await User.find();

    res.status(200).json({
        success: true,
        users,
    });
})

// Update User Profile Role ---- Admin
exports.updateUserProfileRole = catchAsyncErrors(async(req,res,next)=>{

    const { email, name, role } = req.body;

    const newUser = {
        email,
        name,
        role
    };

     await User.findByIdAndUpdate(req.params.id, newUser, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    // if (!user) {
    //     return next(new Error(`User doesn't exist with id ${req.params.id}`,400));
    // }

    res.status(200).json({
        success: true,
        message: "Profile successfully updated"
    });
});



 //Delete Register user ----Admin

 exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{
  
    const user = await User.findById(req.params.id)
    
    if(!user){
        return next(new ErrorHander(`User does'nt Exists witd id ${req.params.id}`, 400))
    }

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);
  

      await user.deleteOne();
    res.status(200).json({
     success: true,
     message: "Delete User succesfullly updated",
    })
 })

 
 