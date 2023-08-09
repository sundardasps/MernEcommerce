const User = require("../models/userModel");
const admin = require("../models/admin_model");
const productdb = require("../models/product_model");
const catagoryDb = require("../models/category_model");
const sharp = require("sharp");
const { errorMonitor } = require("nodemailer/lib/xoauth2");
//================================ LOAD PRODUCTS ===================================//

const loadProducts = async (req, res) => {
  try {
    const data = await productdb.find({ is_delete: false });
    res.render("products", { data });
  } catch (error) {
    console.log(error.message);
  }
};

//=============================== LOAD ADDPRODUCTS ======================================//

const LoadAddProducts = async (req, res) => {
  try {
    const categoryData = await catagoryDb.find();
    res.render("add_products", { cartData: categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

//=============================== LOAD PRODUCT DETAILS ==================================//
const productDetails = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await productdb.findById({ _id: id });
    const productImages = productData.productImages;
    res.render("product_details", { product: productData,productImages });
  } catch (error) {
    console.log(error.message);
  }
};

//=============================== ADD PRODUCT =============================================//

const addProducts = async (req, res) => {
  try {
    const images = [];

    for (let i = 0; i < req.files.length; i++) {
      images[i] = req.files[i].filename;
      await sharp("./public/adminassets/imgs/" + req.files[i].filename)
        .resize({
          width: 3400,
          height: 2400,
        })
        .toFile("./public/adminassets/productImages/" + req.files[i].filename);
    }

    const uniqueNumber = Math.floor(Math.random() * 900000 + 100000);

    const product = new productdb({
      name: req.body.name,
      uniqId: uniqueNumber,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
      quantity: req.body.quantity,
      description: req.body.description,
      productImages: images,
    });

    const savedProduct = await product.save();
    if (savedProduct) {
      res.redirect("/admin/products");
    } else {
      res.render("add_products", { message: "Something went wrong!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//=============================== LOAD EDIT PRODUCT ===============================
const editProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await productdb.findById({ _id: id });
    const categoryData = await catagoryDb.find();
    const productImages = productData.productImages;
    res.render("edit_product", {
      product: productData,
      cartData: categoryData,
      productImages,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//============================== DELETE IMAGE WHILE EDIT IN ADMIN ===================//

const deleteImageFromEdit = async (req, res) => {
  try {
    const position = req.body.position;
    const prodId = req.body.id;
    const productImage = await productdb.findOne({ _id: prodId });
    const image = productImage.productImages[position];
    const data = await productdb.updateOne(
      { _id: prodId },
      { $pullAll: { productImages: [image] } }
    );
    if (data) {
      res.json({ success: true });
    } else {
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//============================= ADD UPDATE PRODUCT ===============================

const addeditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const name = req.body.name;
    const brand = req.body.brand;
    const price = req.body.price;
    const category = req.body.category;
    const stock = req.body.stock;
    const quantity = req.body.quantity;
    const description = req.body.description;
    const image = [];
    for (i = 0; i < req.files.length; i++) {
      image[i] = req.files[i].filename;
    }
    if (image.length != 0) {
      await productdb.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name: name,
            price: price,
            brand: brand,
            stock: stock,
            category: category,
            quantity: quantity,
            description: description,
            image: image,
          },
        }
      );

      res.redirect("/admin/products");
    } else {
      console.log("3");

      const productData2 = await productdb.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name: name,
            price: price,
            brand: brand,
            stock: stock,
            category: category,
            quantity: quantity,
            description: description,
          },
        }
      );
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//======================== DELETE PRODUCT ==================

const deleteProduct = async (req, res) => {
  try {
    const deleteProduct = await productdb.updateOne(
      { _id: req.query.id },
      { $set: { is_delete: true } }
    );
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

//========================IMAGE CROPPING PAGE CALLING ===========================

const imageCropper = async (req, res) => {
  try {
    res.render("imageCropper");
  } catch (error) {
    console.log(error.message);
  }
};

//=========================  PRODUCT REVIEWS AND RATING ====================

const addFeedback = async (req, res) => {
  try {
    const email = req.body.email;
    const star = req.body.rating;
    const name = req.body.name;
    const prodId = req.body.id;
    const review = req.body.review;
    const title = req.body.title;
   
    
    const product =await productdb.findOne({_id:prodId});
   
    let totalStars = [];

    for (let i = 0; i < product.product_review.length; i++) {
        if (product.product_review[i].stars !== undefined && typeof product.product_review[i].stars === 'number') {
            if (totalStars[i] === undefined) {
                totalStars[i] = 0;  // Initialize totalStars[i] if it's undefined
            }
            totalStars[i] += product.product_review[i].stars;
        }
    }
    let totalStarSum = 0

    for(let i=0;i<totalStars.length;i++){
      totalStarSum += totalStars[i]
    }
    
     console.log(totalStarSum,"total star sum");
    let Outof5 = Math.round(totalStarSum/totalStars.length)
    

    
    const rateProduct = await productdb.findByIdAndUpdate(
      prodId,
      {
        $push: {
          
          product_review: [
            {
              stars: star,
              userName: name,
              email: email,
              review: review,
              title: title,
              
            },
          ],
    
        },
        $set: { totalRating: totalStars ,ratingOutof: Outof5}
      },
      {
        new: true,
      }
    );
   

    res.redirect("/product_details?id=" + prodId);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadProducts,
  LoadAddProducts,
  addProducts,
  productDetails,
  editProduct,
  addeditProduct,
  deleteProduct,
  imageCropper,
  addFeedback,
  deleteImageFromEdit,
};
