const productDb = require("../models/product_model");
const userDb = require("../models/userModel");
const cartDb = require("../models/cart_model");
const categoryDb = require("../models/category_model");
const orderDb = require("../models/order_model");

const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const puppeteer = require("puppeteer");

const crypto = require("crypto");
const Razorpay = require("razorpay");
const { parse } = require("path");
const { productDetails } = require("./productController");
const { log } = require("console");


//========================FOR PLACE USER ORDER ========================
var instance = new Razorpay({
  key_id: process.env.Razorid,
  key_secret: process.env.RazorKey,
});

//---------- PLACE ORDER ------------//
const placeOrder = async (req, res) => {
  try {
    const id = req.session.user_id;
    const address = req.body.address;
    const discount = req.body.disamount
    const cartData = await cartDb.findOne({ userId: req.session.user_id });
    const products = cartData.products;
    const total = parseInt(req.body.Total);
    const paymentMethods = req.body.payment;
    const userName = await userDb.findOne({ _id: id });
    const name = userName.user_name;
    const uniqueNumber = Math.floor(Math.random() * 900000) + 100000;

    const status = paymentMethods === "COD" ? "placed" : "pending";

    const order = new orderDb({
      deliveryDetails: address,
      uniqId: uniqueNumber,
      userId: id,
      userName: name,
      paymentMethod: paymentMethods,
      products: products,
      totalAmount: total,
      date: new Date(),
      status: status,
      discount:discount
    });

    const orderData = await order.save();

    

    const orderid = order._id;
    if (orderData) {
      
      // CASH ON DELIVERY
      if (order.status === "placed") {
        await cartDb.deleteOne({ userId: req.session.user_id });
        for (let i = 0; i < products.length; i++) {
          const pro = products[i].productId;
          const count = products[i].count;
          await productDb.findOneAndUpdate(
            { _id: pro },
            { $inc: { quantity: -count } }
          );
        }
        res.json({ codsuccess: true, orderid });
      } else {
        //------ RAZORPAY ---------

        const orderId = orderData._id;
        const totalAmount = orderData.totalAmount;

        if(order.paymentMethod === "wallet"){
         
          const wallet = userName.wallet
          
          if( wallet >= totalAmount){
            
          await userDb.findOneAndUpdate({_id:userName},{$inc:{wallet:-totalAmount}})

            await cartDb.deleteOne({ userId: req.session.user_id });
            for (let i = 0; i < products.length; i++) {
              const pro = products[i].productId;
              const count = products[i].count;
              await productDb.findOneAndUpdate(
                { _id: pro },
                { $inc: { quantity: -count } }
              );
            }

           

            res.json({ codsuccess: true, orderid });
             
          }else{

            res.json({ walletFailed:true, orderid})

          }
          
            
             
          }


        var options = {
          amount: totalAmount * 100,
          currency: "INR",
          receipt: "" + orderId,
        };

        instance.orders.create(options, function (err, order) {
          res.json({ order });
        });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//====================== VERIFY PAYMENT USER ====================

const verifyPayment = async (req, res) => {
  try {
    const cartData = await cartDb.findOne({ userId: req.session.user_id });
    const products = cartData.products;
    const details = req.body;
    const hmac = crypto.createHmac("sha256", process.env.RazorKey);

    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    const hmacValue = hmac.digest("hex");

    if (hmacValue === details.payment.razorpay_signature) {
      for (let i = 0; i < products.length; i++) {
        const pro = products[i].productId;
        const count = products[i].count;
        await productDb.findByIdAndUpdate(
          { _id: pro },
          { $inc: { quantity: -count } }
        );
      }
      await orderDb.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { status: "placed" } }
      );
      await orderDb.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { paymentId: details.payment.razorpay_payment_id } }
      );
      await cartDb.deleteOne({ userId: req.session.user_id });
      const orderid = details.order.receipt;
      res.json({ codsuccess: true, orderid });
    } else {
      await orderDb.findByIdAndRemove({ _id: details.order.receipt });
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//=====================PLACED ORDERS SUCCESS PAGE==================
const successPage = async (req, res) => {
  try {
    const id = req.params.id;
    const userData = req.session.user_id;
    const orderedProduct = await orderDb
      .findOne({ _id: id })
      .populate("products.productId");
    const products = orderedProduct.products;
    


    res.render("orderSuccess", {
      orderedProduct,
      product: products,
      userData,
      id,
      session:userData,
    });
  } catch (error) {
    console.log(error);
  }
};

//========================= VIEW ORDER PRODUCTS ===================

const viewOrderProducts = async (req, res) => {
  try {
    const id =  req.query.id
    const session = req.session.user_id
    const orderData = await orderDb
      .findOne({
        _id: req.query.id,
      })
      .populate("products.productId");
    const productsData = orderData.products;
   
   const order = await orderDb.findOne({_id:id})
   

    res.render("viewOrderProducts", { products: productsData,order,session});
  } catch (error) {
    console.log(error.message);
  }
};

//========================= FOR CANCEL ORDER  ====================

const orderCancel = async (req, res) => {
  try {
    const id = req.body.orderid;
    const Id = req.session.user_id;
    const cancelReason = req.body.reason;
    const cancelAmount = req.body.totalPrice;
    const amount = parseInt(cancelAmount);
    const updatedData = await orderDb.findOneAndUpdate(
      { userId: Id, "products._id": id },
      {
        $set: {
          "products.$.status": "cancelled",
          "products.$.cancelreason": cancelReason,
        },
      },
      { new: true }
    );
    const productsData = updatedData;

    if (productsData.paymentMethod == "onlinePayment" || productsData.paymentMethod == "wallet" ) {
      const refunded = await userDb.updateOne(
        { _id: req.session.user_id },
        { $inc: { wallet: amount } }
      );

      res.redirect("/orderList");

    } else {
      res.redirect("/orderList");

    }

  } catch (error) {
    console.log(error.message);
  }
};

//===========================FOR SHOW ORDER ======================

const showOrders = async (req, res) => {
  try {
    const orderData = await orderDb.find({userId:req.session.user_id});
    const session = req.session.user_id
 

    if (orderData.length > 0) {
      res.render("orderList", { orders: orderData,session });
    } else {
      res.render("emptyOrderList",{session});
    }
  } catch (error) {
    console.log(error.message);
  }
};

//================= FOR SHOW ORDER LIST IN ADMIN SIDE ============

const showordersAdmin = async (req, res) => {
  try {
    const ordersData = await orderDb
      .find()
      .populate("products.productId")
      .sort({ date: -1 });
    res.render("ordersAdmin", { orders: ordersData });
  } catch (error) {
    console.log(error.message);
  }
};

//============= SHOW PRODUCTS FULL DETAILS IN ADMIN SIDE ===============

const loadProductdetails = async (req, res) => {
  try {
    const id = req.query.id;

    const orderdProduct = await orderDb
      .findOne({ _id: id })
      .populate("products.productId");

    res.render("orderFullDetails", { orders: orderdProduct});
  } catch (error) {
    console.log(error);
  }
};

//======================= STATUS UPDATE IN ADMIN SIDE=========================

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

//==========================LOAD USER INVOICE =================================

const loadInvoice = async (req, res) => {
  try {
    const id = req.params.id;

    const user = req.session.user_id;
    const userData = await userDb.findOne({ _id: user });

    const orderData = await orderDb
      .findOne({ _id: id })
      .populate("products.productId");

    const date = new Date();

    data = {
      order: orderData,
      user: userData,
      date,
    };

    const filepathName = path.resolve(__dirname, "../views/user/invoice.ejs");

    const html = fs.readFileSync(filepathName).toString();
    const ejsData = ejs.render(html, data);

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(ejsData, { waitUntil: "networkidle0" });
    const pdfBytes = await page.pdf({ format: "Letter" });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename= order invoice.pdf"
    );
    res.send(pdfBytes);
  } catch (error) {
    console.log(error.message);
  }
};

//=========================== USER PRODUCT RETURNN =======================

const returnProduct = async (req,res) => {
 
  try {
    try {
      const id = req.body.orderid;
      const Id = req.session.user_id;
      const cancelReason = req.body.reason;
      const cancelAmount = req.body.totalPrice;
      const amount = parseInt(cancelAmount);
     
      const updatedData = await orderDb.findOneAndUpdate(
        { userId: Id, "products._id": id },
        {
          $set: {
            "products.$.status": "returned",
            "products.$.returnReason": cancelReason,
          },
        },
        { new: true }
      );
  
        const refunded = await userDb.updateOne(
          { _id: req.session.user_id },
          { $inc: { wallet: amount } }
        );
  
        res.redirect("/orderList");
  
    } catch (error) {
      console.log(error.message);
    }
    
  } catch (error) { 
    console.log(error.message);
  }


}

module.exports = {
  placeOrder,
  successPage,
  orderCancel,
  viewOrderProducts,
  verifyPayment,
  showOrders,
  showordersAdmin,
  loadProductdetails,
  updateStatus,
  loadInvoice,
  returnProduct
};
