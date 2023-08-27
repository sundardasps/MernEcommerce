const express = require('express');
const session = require('express-session');
const { Admin } = require('mongodb');
const auth = require('../middleware/admin-session');
const config = require('../configuration/config');
const upload = require('../configuration/multer');
const bodyparser =  require('body-parser');
const admin_route = express();
const adminController = require('../controllers/adminController');
const orderController = require('../controllers/orderControllers')
const productController = require('../controllers/productController');
const couponController = require('../controllers/couponController')
const bannerController= require('../controllers/bannerContoller')
admin_route.use(bodyparser.json());
admin_route.use(bodyparser.urlencoded({extended:true}));

admin_route.set('view engine', 'ejs');
admin_route.set('views','./views/admin');

admin_route.get('/',auth.isLogout,adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);
admin_route.get('/home',auth.isLogin,adminController.loadHome)
admin_route.get('/logout',auth.isLogin,adminController.logout);

//===================== USER MANAGEMENT =====================
admin_route.get('/user_details',auth.isLogin,adminController.loadusers);
admin_route.get('/verify_user',auth.isLogin,adminController.verifyUser)
admin_route.get('/block_unblockUser',auth.isLogin,adminController.blockOrUnblock);
admin_route.post('/searchuser',auth.isLogin,adminController.searchUser)

//==================== CATEGORY MANAGEMENT ======================
admin_route.get('/category',auth.isLogin,adminController.LoadCategoryList);
admin_route.get('/add_category',auth.isLogin,adminController.loadAddCate);
admin_route.post('/add_category',auth.isLogin,adminController.addCategory)
admin_route.get('/edit_category',auth.isLogin,adminController.loadEditCat)
admin_route.post('/edit_category',auth.isLogin,adminController.updateCate)
admin_route.get('/is_active',auth.isLogin,adminController.activeOrNot);

//==================== PRODUCT MANAGEMENT ========================
admin_route.get('/products',auth.isLogin,productController.loadProducts);
admin_route.get('/add_products',auth.isLogin,productController.LoadAddProducts);
admin_route.post('/add_products',auth.isLogin,upload.array("image", 4),productController.addProducts)
admin_route.get('/product_details',auth.isLogin,productController.productDetails)
admin_route.get('/edit_product',auth.isLogin,productController.editProduct)
admin_route.post('/edit_product',auth.isLogin,upload.array("image", 4),productController.addeditProduct)
admin_route.get('/product_delete',auth.isLogin,productController.deleteProduct)
admin_route.post('/delete_image',auth.isLogin,productController.deleteImageFromEdit)
admin_route.get('/imageCropper',productController.imageCropper)

//================== ORDER MANAGEEMENT ===============================
admin_route.get('/ordersAdmin',orderController.showordersAdmin)
admin_route.get('/orderFullDetails',orderController.loadProductdetails)
admin_route.post('/updateStatus',orderController.updateStatus);

//================== ADMIN SALES MANAGEMENT ======================
admin_route.get('/salesReport',auth.isLogin,adminController.loadSalesReport)
admin_route.post('/salesReportSort',adminController.sortsalesReport)
admin_route.get('/saleSortPage/:id',auth.isLogin,adminController.salesReportFilter)

//================== ADMIN COUPON MANEGEMENT =====================
admin_route.get('/couponList',couponController.loadCoupon)
admin_route.post('/couponList',couponController.addCoupon)
admin_route.post('/editCoupon/:id',couponController.editCoupon)
admin_route.get('/deleteCoupon',auth.isLogin,couponController.adminDeleteCoupon)

//==========================  BANNER MANAEMENT ======================
admin_route.get('/banners',bannerController.loadBanners)
admin_route.post('/banners',upload.array("image", 1),bannerController.addBanner)

module.exports = admin_route;