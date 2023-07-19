const UserDb = require("../models/userModel");
const CartDb = require("../models/cart_model");
const ProductDb = require("../models/product_model");
const addressDb = require("../models/userAddress_model")
//=================== LOAD CART ======================

const loadCart = async (req, res) => {
  try {
    
    let id = req.session.user_id;
    const userName = await UserDb.findOne({ _id: req.session.user_id });
    const cartData = await CartDb.findOne({
      userId: req.session.user_id,
    }).populate("products.productId");
   
    const session = req.session.user_id;

      if (cartData) {
        if (cartData.products.length > 0) {
          const products = cartData.products;
         
          const total = await CartDb.aggregate([
            { $match: { userId: req.session.user_id } },
            { $unwind: "$products" },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply:["$products.productPrice","$products.count"],
                  },
                },
              },
            },
          ]);
          
          const Total = total.length > 0 ? total[0].total : 0;
          const totalamout = Total
          const userId = userName._id;
          const userData = await UserDb.find();
          res.render("cart", {
            products: products,
            Total: Total,
            userId,
            session,
            totalamout,
            user: userName,
          });

       
        } else {
          res.render("emptyCart", {
            user: userName,
            session,
            massage: "Your cart is empty !",
          });
        }
      } else {
        res.render("emptyCart", {
          user: userName,
          session,
          massage: "No products Added to cart",
        });
      }
   
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//===================================== LOAD EMPTY CART ===============================

const emptyCartLoad = async (req, res) => {
  try {
    res.render("emptyCart");
  } catch (error) {
    console.log(error.massage);
  }
};

//===================================== ADD TO CART ============================================

const addCartItem = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await UserDb.findOne({ _id: userId });
    const proId = req.body.id;
    const productData = await ProductDb.findOne({ _id: proId });
    const productQuantity = productData.quantity;
    const cartData = await CartDb.findOneAndUpdate(
      { userId: userId },
      {
        $setOnInsert: {
          userId: userId,
          userName: userData.user_name,
          products: [],
        },
      },
      { upsert: true, new: true }
    );

    const updatedProduct = cartData.products.find(
      (product) => product.productId === proId
    );
    const updatedQuantity = updatedProduct ? updatedProduct.count : 0;
    if (updatedQuantity + 1 > productQuantity) {
      return res.json({
        success: false,
        message: "Quantity limit reached!",
      });
    }

    
    const discount =  productData.discountPercentage;          
    const price =  productData.price 
    // const discountAmount = Math.round((price*discount)/100)
    const total = price 
   
    if (updatedProduct) {
      await CartDb.updateOne(
        { userId: userId, "products.productId": proId },
        {
          $inc: {
            "products.$.count": 1,
            "products.$.totalPrice": total,
          },
        }
      );
    } else {
      cartData.products.push({
        productId: proId,
        productPrice:total,
        totalPrice: total,
      });
      await cartData.save();
     
    }

    res.json({ success: true });


  } catch (error) {
    console.log(error.massage);
  }
};

//=============================REMOVE CART ITEMS ===================================
const removeFromCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const proId = req.body.product;
    const cartData = await CartDb.findOne({ userId: userId });

    if (cartData) {
      const data2 = await CartDb.findOneAndUpdate(
        { userId: userId },
        { $pull: { products: { productId: proId } } }
      );
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

//========================== TO INCREASE CART QUANTITY ====================

const cartQuantityIncrease = async (req, res, next) => {
  try {
    const userData = req.session.user_id;
    const proId = req.body.product;
    let count = req.body.count;
    count = parseInt(count);
  
    const cartData = await CartDb.findOne({ userId: userData });
    const product = cartData.products.find(
      (product) => product.productId === proId
    );
    const productData = await ProductDb.findOne({ _id: proId });
    const productQuantity = productData.quantity;
    const updatedCartData = await CartDb.findOne({ userId: userData });
    const updatedProduct = updatedCartData.products.find(
      (product) => product.productId === proId
    );
    const updatedQuantity = updatedProduct.count;
   
    if (count > 0) {
      if (updatedQuantity + count > productQuantity) {
        res.json({ success: false, message: "Quantity limit reached!" });
        return;
      }
    } else if (count < 0) {
      // Quantity is being decreased
      if (updatedQuantity <= 1 || Math.abs(count) > updatedQuantity) {
        await CartDb.updateOne(
          { userId: userData },
          { $pull: { products: { productid: proId } } }
        );
        res.json({ success: true });
        return;
      }
    }

    const cartdata = await CartDb.updateOne(
      { userId: userData, "products.productId": proId },
      { $inc: { "products.$.count": count } }
    );
    const updateCartData = await CartDb.findOne({ userId: userData });
    const updateProduct = updateCartData.products.find(
      (product) => product.productId === proId
    );
    const updateQuantity = updateProduct.count;
    const productPrice = productData.price;
    // const discount =  productData.discountPercentage;
    // const price =  productData.price
    // const discountAmount = Math.round((price*discount)/100)
    // const total = price - discountAmount
    // const prices = updateQuantity * total;
 

    const productTotal = productPrice * updateQuantity;
    await CartDb.updateOne(
      { userId: userData, "products.productId": proId },
      { $set: { "products.$.totalPrice": productTotal } }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};


//==================================== LOAD CHECKOUT ======================================



const loadcheckOut = async (req, res) => {
  try {
   
    const  session = req.session.user_id;
    const userName = await UserDb.findOne({ _id: req.session.user_id });
    const addressdata = await addressDb.findOne({userId:req.session.user_id});
    const cartData = await CartDb.findOne({
      userId: req.session.user_id,
    }).populate("products.productId");
    const products = cartData.products;
          const total = await CartDb.aggregate([
            { $match: { userId: req.session.user_id } },
            { $unwind: "$products" },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: ["$products.productPrice","$products.count"],
                  },
                },
              },
            },
          ]);
           
         
          if (req.session.user_id) {
            if(addressdata) {
              if(addressdata.addresses.length > 0){
                const address = addressdata.addresses
          const Total = total.length > 0 ? total[0].total : 0;
          const totalamout = Total
          const userId = userName._id;
         
          res.render("checkOut",{
            products: products,
            Total: Total,
            userId,
            session,
            totalamout,
            user: userName,
            address
          });

          } else {
            res.render("emptyCheckOut",{session,user:userName,message:"Please enter a valid addresss"})
          }

        } else {
           res.render("emptyCheckOut",{session,user:userName,message:"Please enter a valid addresss"})
        }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};



module.exports = {
  loadCart,
  addCartItem,
  loadcheckOut,
  removeFromCart,
  cartQuantityIncrease,

};
