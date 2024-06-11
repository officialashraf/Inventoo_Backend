const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter Products Name"]
    },
    description:{
        type:String,
        required:[true,"Please Enter Products Description"]
    },
    price:{
        type:Number,
        required:[true,"Please Enter Products Price"],
        maxLength:[8,"Price cannot exceed 8 character"]
    },
    ratings:{
        type: Number,
        default:1
    },
    images:[{
        public_id:{
            type:String,
            required:true
        },
       url:{
            type:String,
            required:true
            
        }
    }],
    category:{
        type:String,
        required:[true,"Please Enter Product Category"],
    },
    stock:{
        type:String,
        required:[true,"Please Enter Products Name"],
        maxLength:[4,"Stock cannot exceed 4 character"],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        name:{
            type:String,
            required:true
        },
        rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true
            }
    }],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    createAt:{
        type:Date,
       default:Date.now
    }
})
module.exports = mongoose.model("Product",productSchema);