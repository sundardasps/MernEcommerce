const User = require("../models/userModel");
const cartDb = require("../models/cart_model");
const productDb = require("../models/product_model");
const cetegoryDb = require("../models/category_model");
const { objectId } = require("mongodb");
const wishListDb = require("../models/wishlistModel");

//================================== WISH LIST LOAD ======================================

const loadWishList = async (req, res) => {
  try {
    const session = req.session.user_id;

   

    const wishlistData = await wishListDb
      .find({ user: session })
      .populate("products.productId");
      
   

    if (wishlistData.length > 0) {
      const wishlist = wishlistData[0].products;
      const products = wishlist.map((wish) => wish.productId);
      
      res.render("wishList", { user: session, session, wishlist, products ,});
    } else {
      res.render("wishList", { user: session,session, wishlist: [], products: [] ,});
    }
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//================================ ADD PRODUCTS IN WISHLIST ==============================

const addToWishList = async (req, res) => {
  try {
    
    const id = req.body.proId;
    const user = req.session.user_id;
    const userData = await User.findById(user);
    const wishlistData = await wishListDb.findOne({ user: user });
    if(user === undefined){
     
      res.json({login:true,message:"Please login and continueshopping!"})
    }

    if (wishlistData) {
      const checkWishlist =  wishlistData.products.findIndex(
        (wish) => wish.productId == id
      );

      if (checkWishlist != -1) {
        res.json({ check: true });
      } else {
        await wishListDb.updateOne(
          { user: req.session.user_id },
          { $push: { products: { productId: id } } }
        );
        res.json({ success: true });
      }
    } else {
      
      const wishlist = new wishListDb({
        user: req.session.user_id,
        user_name: userData.user_name,
        products: [
          {
            productId: id,
          },
        ],
      });
      const wish = await wishlist.save();
      if (wish) {
        res.json({ seccess: true });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};

//===================== REMOVE ITEM FROM WISH LIST ===========================

const removeFromWishlist = async (req, res) => {
  try {
    const id = req.query.id;
    const user_id = req.session.user_id;

    
    const productData = await wishListDb.findOneAndUpdate(
      { user: user_id },
      { $pull: { products: { productId: id } } }
    );
    res.redirect("/wishList");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadWishList,
  addToWishList,
  removeFromWishlist,
};
