const productDb = require("../models/product_model");
const userDb = require("../models/userModel");
const cartDb = require("../models/cart_model");
const categoryDb = require("../models/category_model");
const orderDb = require("../models/order_model");
const Razorpay = require("razorpay");
const { parse } = require("path");
const { productDetails } = require("./productController");
const { log } = require("console");

//========================FOR PLACE USER ORDER ========================

var instance = new Razorpay({
  key_id: "rzp_test_h9X7hpWjwefyd2",
  key_secret: "cWly06BuqStaRLNPj2YiLZRa",
});

const placeOrder = async (req, res) => {
  try {
    const id = req.session.user_id;
    const Total = req.body.Total;
    const totalAmount = parseInt(Total);
    const address = req.body.address;
    const paymentMethod = req.body.payment;
    const productCount = req.body.count;

    const userName = await userDb.findOne({ _id: id });
    const cartData = await cartDb.findOne({ userId: id });
    

    const productsData = cartData.products;

    const status = paymentMethod === "COD" ? "placed" : "pending";

    const order = new orderDb({
      deliveryDetails: address,
      userId: id,
      userName: userName.user_name,
      paymentMethod: paymentMethod,
      products: productsData,
      totalAmount: totalAmount,
      date: new Date(),
      status: status,
    });
     
  
    
    for (let i = 0; i < productsData.length; i++) {
      const count = productsData[i].count;
      console.log(count ,'hiiiiiii')
      const proId = productsData[i].productId;
    
      // Fetch the current quantity from the database
      const product = await productDb.findById(proId);
      const currentQuantity = product.quantity;
    
      // Ensure the quantity won't become less than 0
      const newQuantity = currentQuantity - count;
      const updatedQuantity = Math.max(newQuantity, 0);
    
      // Update the quantity in the database
      await productDb.findByIdAndUpdate(
        { _id: proId },
        { $set: { quantity: updatedQuantity } }
      );
    }
    

    const saveOrder = await order.save();

    if (status == "placed") {
      await cartDb.deleteOne({ userId: id });
      res.json({ codsuccess: true });
    } else {
      await cartDb.deleteOne({ userId: id });
      const orderid = saveOrder._id;
      const totalamount = saveOrder.totalAmount;
      var options = {
        amount: totalamount * 100,
        currency: "INR",
        receipt: "" + orderid,
      };

      instance.orders.create(options, function (err, order) {
        if (err) {
          // Handle the error
          console.error(err);
        } else {
          // Process the order
          console.log("Success");
          res.json({ order });
        }
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//======================== USER PAYMENT VERIFY ===================
const verifyPayment = async (req, res) => {
  try {
    const userd = await userDb.findOne({ _id: req.session.user_id });

    const stotal = await cartDb.aggregate([
      { $match: { user: userd._id } },

      { $unwind: "$product" },

      { $project: { price: "$product.price", quantity: "$product.quantity" } },

      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
    ]);


    const subtotal = stotal[0].total;

    const total = req.body.amount;

    const details = req.body;
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", process.env.RazorKey);
    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );

    hmac = hmac.digest("hex");

    if (hmac == details.payment.razorpay_signature) {
      // await userDb.updateOne(
      //   { _id: req.session.user_id },
      //   { $inc: { wallet: -wal } }
      // );
      await orderDb.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { status: "placed" } }
      );
      await orderDb.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { paymentId: details.payment.razorpay_payment_id } }
      );
      await cartDb.deleteOne({ user: req.session.user_id });
      res.json({ success: true });
    } else {
      await orderDb.findByIdAndRemove({ _id: details.order.receipt });
      res.json({ success: false });
    }
  } catch (error) {}
};

//=====================PLLACED ORDERS SUCCESS PAGE==================
const successPage = async (req, res) => {
  try {
    const orderedProduct = await orderDb.findOne({}).sort({ _id: -1 });
    res.render("orderSuccess", { orderedProduct });
  } catch (error) {
    console.log(error);
  }
};

//========================= VIEW ORDER PRODUCTS ===================

const viewOrderProducts = async (req, res) => {
  try {
    const orderData = await orderDb
      .findOne({
        _id: req.query.id,
      })
      .populate("products.productId");
    const productsData = orderData.products;
    res.render("viewOrderProducts", { products: productsData });
  } catch (error) {
    console.log(error.message);
  }
};

//========================= FOR CANCEL ORDER  ====================

const orderCancel = async (req, res) => {
  try {
    const id = req.body.orderid;
    const userId = req.session.user_id;
    const cancelReason = req.body.reason
    const cancelAmount = req.body.totalPrice
    const amount = parseInt(cancelAmount)
    console.log(cancelAmount);
    const updatedData = await orderDb.findOneAndUpdate(
      {  userId: userId,
        "products._id": id },
      { $set: { "products.$.status": "cancelled" ,"products.$.cancelreason": cancelReason } },
      { new: true }
    );
    const productsData = updatedData.products
     if(updatedData.paymentMethod === "onlinePayment"){
       
        const refunded =  await userDb.updateOne(
        { _id: req.session.user_id },
        { $inc: { wallet: amount } }
      );
      console.log(refunded);
     }
    res.render("viewOrderProducts",{products:productsData})
  } catch (error) {
    console.log(error.message);
  }
};
//===========================FOR SHOW ORDER ======================

const showOrders = async (req, res) => {
  try {
    const orderData = await orderDb.find();
    if (orderData.length > 0) {
      res.render("orderList", { orders: orderData });
    } else {
      res.render("emptyOrderList");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//================= FOR SHOW ORDER LIST IN ADMIN SIDE ============

const showordersAdmin = async (req, res) => {
  try {
    console.log("in   in admin ordersssssssssssssssssssssssssssss");
    const ordersData = await orderDb
      .find()
      .populate("products.productId")
      .sort({ date: 1 });
    res.render("ordersAdmin", { orders: ordersData });
  } catch (error) {
    console.log(error.message);
  }
};

//============= SHOW PRODUCTS FULL DETAILS IN ADMIN SIDE ===============

const loadProductdetails = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const orderdProduct = await orderDb
      .findOne({ _id: id })
      .populate("products.productId");
    res.render("orderFullDetails", { orders: orderdProduct });
  } catch (error) {
    console.log(error);
  }
};




//================================================

const updateStatus = async (req, res) => {
  try {

    const id = req.body.id;
    const userId = req.body.userId;
    const statusChange = req.body.status;

    const updatedOrder = await orderDb.findOneAndUpdate(
      {
        userId: userId,
        "products._id": id,
      },
      {
        $set: {
          "products.$.status": statusChange,
        },
      },
      { new: true }
    );
 

    if (statusChange === "Delivered") {
      await orderDb.findOneAndUpdate(
        {
          userId: userId,
          "products._id": id,
        },
        {
          $set: {
            "products.$.deliveryDate": new Date(),
          },
        },
        { new: true }
      );
    }

    if (updatedOrder) {
      
      res.json({ success: true });
    }
  } catch (error) {
      console.log(error.message);
  }
};


module.exports = {
  placeOrder,
  successPage,
  orderCancel,
  viewOrderProducts,
  verifyPayment,
  showOrders,
  showordersAdmin,
  loadProductdetails,
  updateStatus
};
