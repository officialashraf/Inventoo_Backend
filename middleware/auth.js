const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User  = require("../models/userModele")

exports.isAuthenticatedUser = catchAsyncErrors(async (req,res,next) =>{
    const {token}  =  req.cookies;

    if(!token){
        return next(new ErrorHander("Please Login to accessthis resource",401));
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodeData.id);

    next();
})

exports.authorizeRoles = (...roles) => {
    return(req, res, next )=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHander(
                `Role: ${req.user.role} is not alowed to access this resource`,403
            ))
        }
        next();
    }
}