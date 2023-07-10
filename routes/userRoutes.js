const express = require("express");
const user_route = express();
const bodyParser = require("body-parser");
const auth = require("../middleware/user-session");

const userController = require("../controllers/userController");
const { loadWishList } = require("../controllers/wishlistController");
const productController = require('../controllers/productController')
const wishlistController = require('../controllers/wishlistController');
const cartController = require('../controllers/cartController');
const adderssController = require('../controllers/addressController');




user_route.set("view engine", "ejs");
user_route.set("views", "./views/user");

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

//==================== SIGNUP ===================
user_route.get("/signup", auth.isLogout, userController.register);
user_route.post("/signup", auth.isLogout, userController.insertUser);
user_route.post("/otp", auth.isLogout, userController.varifyOtp);

//====================== LOGIN ===================
user_route.get("/", auth.isLogout, userController.userLogin);
user_route.get("/login", auth.isLogout, userController.userLogin);
user_route.post("/login", auth.isLogout, userController.varifyLogin);
user_route.get('/logout',userController.logout);
user_route.get('/forgetPassword',userController.loadForget);
user_route.post('/forgetPassword',userController.forgetSendEmail)
user_route.get('/reset_password',auth.isLogout,userController.resetPasswordLoad)
user_route.post('/reset_password',auth.isLogout,userController.resetPasswordVerify)


//======================= HOME ===================================
user_route.get("/home", auth.isLogin, userController.loadHome);
user_route.get("/category", auth.isLogin, userController.loadHome);
user_route.get('/product_details',auth.isLogin,userController.loadProductdetails)
user_route.get('/shop',auth.isLogin,userController.loadShop)


//======================  WISHLIST ===============================
user_route.get('/wishList',auth.isLogin,wishlistController.loadWishList)
user_route.post('/wishList',auth.isLogin,wishlistController.addToWishList)
user_route.get('/removeItem',auth.isLogin,wishlistController.removeFromWishlist)

//========================== CART =============================
user_route.get('/cart',auth.isLogin,cartController.loadCart);
user_route.post('/addToCart',auth.isLogin,cartController.addCartItem);
user_route.post('/removeCartItem',auth.isLogin,cartController.removeFromCart)
user_route.post('/cartQuantityIncrease',auth.isLogin,cartController.cartQuantityIncrease)
user_route.get('placeOrder',)

//========================== CHECKOUT ===================================
user_route.get('/checkOut',auth.isLogin,cartController.loadcheckOut)
user_route.get('/editAddress',auth.isLogin,adderssController.loadEditAddress);
user_route.get('/addAddress',auth.isLogin,adderssController.loadAddAddress);
user_route.post('/updateAddress',adderssController.updateAddress)
user_route.post("/deleteAddress",auth.isLogin,adderssController.deleteAddress)
user_route.get('/emptyCheckOut',adderssController.emptyCheckOut);


//========================= USER ACCOUNT ============================
user_route.get('/userDashboard',adderssController.loadUserDashboard)
user_route.post('/addUserAddress',adderssController.addUserAddress)

//===========================USER ORDER ===========================
const orderController = require('../controllers/orderControllers');
user_route.post('/checkOut',orderController.placeOrder);
user_route.get("/orderSuccess",orderController.successPage);
user_route.get('/cancelOrder',orderController.orderCancel)

module.exports = user_route;

