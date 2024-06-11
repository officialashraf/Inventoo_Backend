const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const Product = require("../models/productModle");
const Order = require("../models/orderModel");
  

///create new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });
  
  res.status(201).json({
    success: true,
    order,
  });
});

//Get Singal Order

exports.getSingalOrder = catchAsyncErrors(async (req, res, next) => {
    
    const order = await Order.findById(req.params.id).populate("user","name email")

    if(!order){
        return next(new ErrorHander("Order not found with this id", 404));
    }
    res.status(200).json({
        success: true,
        order
      });
})

//my Order ---User
exports.getMyOrder = catchAsyncErrors(async (req, res, next) => {
    
    const orders = await Order.find({user: req.user._id});

    res.status(200).json({
        success: true,
        orders
      });
})

//Get All Order -----Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    
    const orders = await Order.find();
    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice
    });

    res.status(200).json({
        success: true,
        orders,
        totalAmount
      });
})

//Update Order Status --Admin

exports.updateOrders = catchAsyncErrors(async (req, res, next) => {
    
    const order = await Order.findById(req.params.id);

    if(order.orderStatus === "Delevered"){
        return next(new ErrorHander("you have already this order", 400))
    }

     if(req.body.status === "Shipping"){
      order.orderItems.forEach(async(o)=>{
        await updateStock(o.product, o.quantity);
     })
     }

    order.orderStatus = req.body.status;
    if(req.body.status === "Deleiverd"){
        order.deliverdAt =Date.now();
    }
        await order.save({validateBeforeSave: false})
       res.status(200).json({
        success: true,
      });
})
 async function updateStock(id, quantity){
    const product = await Product.findById(id);

    product.stock -= quantity

    await product.save({validateBeforeSave: false})
 }


//Delete Order
exports.deleteOrders = catchAsyncErrors(async (req, res, next) => {
    
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHander("Order not found with this id", 404));
    }
        await order.deleteOne()
       res.status(200).json({
        success: true,
      });
})


