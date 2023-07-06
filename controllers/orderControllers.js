const orderDb = require("../models/order_model");
const productDb = require("../models/product_model");
const userDb = require("../models/userModel");
const cartDb = require("../models/cart_model");
const categoryDb = require("../models/category_model");
//=======================================================

const placeOrder = async (req, res, next) => {
    try {
    
      const id = req.session.user_id;
      const userName = await userDb.findOne({ _id: id });
    
      const address = req.body.address;
      const paymentMethod = req.body.payment;
      const cartData = await cartDb.findOne({ userId: id });
      const products = cartData.products;
      const Total = req.body.Total;
     
      const status = paymentMethod === "COD" ? "placed" : "pending";
    

      const order = new orderDb({
        deliveryDetails: address,
        userId: id,
        userName: userName.user_name,
        paymentMethod: paymentMethod,
        products: products,
        totalAmount: Total,
        date: new Date(),
        status: status,
  
      });
      console.log();
      const orderData = await order.save();
      if (orderData ) {
        await cartDb.deleteOne({ userId: id });

      } 
  
        res.redirect("/orderSuccess");
      
    } catch (error) {
      next(error);
    }
  };


  const successPage= async(req,res)=>{
    try {
        const id = req.session.user_id;
        res.render('orderSuccess')
    } catch (error) {
        console.log(error);
    }
  }
module.exports = {
    placeOrder,
    successPage
}