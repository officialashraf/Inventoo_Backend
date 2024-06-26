const ErrorHandler = require("../utils/errorhander")

module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.message =  err.message || "Internal Server Error";


    //Wrong Mongo Id eroor
    if(err.name == "CastError"){
        const message = `Resource not found, Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    //Mongoose Duplicate key Error
    if(err.code == "11000"){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    }

    //Jwt EXPIRE error
    if(err.name == "JsonWebTokenError"){
        const message = `Json Web Token is Invalid, Try Again`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        error: err.message,
    });
}