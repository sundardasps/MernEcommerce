const express = require("express");
const user_route = express();
const bodyParser = require("body-parser");
const auth = require("../middleware/user-session");
const orderController = require('../controllers/orderControllers')
const userController = require("../controllers/userController");
const { loadWishList } = require("../controllers/wishlistController");
const productController = require('../controllers/productController')
const wishlistController = require('../controllers/wishlistController');
const cartController = require('../controllers/cartController');
const adderssController = require('../controllers/addressController');
const couponController = require('../controllers/couponController')




user_route.set("view engine", "ejs");
user_route.set("views", "./views/user");

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

//==================== SIGNUP ===================
user_route.get("/signup", auth.isLogout, userController.register);
user_route.post("/signup", auth.isLogout, userController.insertUser);
user_route.post("/otp", auth.isLogout, userController.varifyOtp);

//====================== LOGIN ===================
user_route.get("/", userController.loadHome);
user_route.get("/login", auth.isLogout, userController.userLogin);
user_route.post("/login", auth.isLogout, userController.varifyLogin);
user_route.get('/logout',auth.isLogin,userController.logout);
user_route.get('/forgetPassword',userController.loadForget);
user_route.post('/forgetPassword',userController.forgetSendEmail)
user_route.get('/reset_password',auth.isLogout,userController.resetPasswordLoad)
user_route.post('/reset_password',auth.isLogout,userController.resetPasswordVerify)

//======================= HOME ===================================
user_route.get("/login", auth.isLogin, userController.userLogin);
user_route.get("/category", userController.loadHome);
user_route.get('/product_details',userController.loadProductdetails)
user_route.get('/shop',userController.loadShop)
user_route.get('/filterCategory/:id',userController.filterCategory)


//======================  WISHLIST ===============================
user_route.get('/wishList',auth.isLogin,wishlistController.loadWishList)
user_route.post('/wishList',auth.isLogin,wishlistController.addToWishList)
user_route.get('/removeItem',auth.isLogin,wishlistController.removeFromWishlist)

//========================== CART =============================
user_route.get('/cart',auth.isLogin,cartController.loadCart);
user_route.post('/addToCart',cartController.addCartItem);
user_route.post('/removeCartItem',cartController.removeFromCart)
user_route.post('/cartQuantityIncrease',cartController.cartQuantityIncrease)
user_route.post('/placeOrder',orderController.placeOrder)

//========================== CHECKOUT ===================================
user_route.get('/checkOut',auth.isLogin,cartController.loadcheckOut)
user_route.get('/editAddress',auth.isLogin,adderssController.loadEditAddress);
user_route.get('/addAddress',auth.isLogin,adderssController.loadAddAddress);
user_route.post('/addAddress',adderssController.addUserAddress);
user_route.post('/updateAddress',adderssController.updateAddress)
user_route.post("/deleteAddress",adderssController.deleteAddress)
user_route.get('/emptyCheckOut',auth.isLogin,adderssController.emptyCheckOut);

//========================= USER ACCOUNT ============================
user_route.get('/userDashboard', auth.isLogin,adderssController.loadUserDashboard)
user_route.get('/loadUserAddressFromDash',auth.isLogin,adderssController.loadAddressFromDash)
user_route.get('/editAddressFromDash',auth.isLogin,adderssController.loadEditAddressfromDash)
user_route.post('/updateAddressFromDash',adderssController.updateAddressFromDash)
user_route.get('/loadaddAddressFromDash',auth.isLogin,adderssController.loadAddAddress)
user_route.post('/loadaddAddressFromDash',adderssController.addUserAddressFromDash)
user_route.post('/addUserAddress',adderssController.addUserAddress)
user_route.get('/showAddress',auth.isLogin,adderssController.showAddress);
user_route.post('/editUser/:id',userController.updateUser)

//===========================USER ORDER ===========================
user_route.post('/checkoutPage',orderController.placeOrder);
user_route.get("/orderSuccess/:id",auth.isLogin,orderController.successPage);
user_route.post('/orderCancel',orderController.orderCancel)
user_route.get("/viewProducts",auth.isLogin,orderController.viewOrderProducts);
user_route.get("/orderList",auth.isLogin,orderController.showOrders)
user_route.post('/verify-payment',orderController.verifyPayment)
user_route.post("/addFeedback",productController.addFeedback);
user_route.get("/invoice/:id",auth.isLogin,orderController.loadInvoice)
user_route.post('/returnProduct',orderController.returnProduct)

//========================== COUPON MANAGEMENT ======================
user_route.post('/applyCoupon',couponController.varifyCoupon)

//======================= OTHER USER INTERACTIONS ================//
user_route.get('/about',userController.loadAbout)


module.exports = user_route;

