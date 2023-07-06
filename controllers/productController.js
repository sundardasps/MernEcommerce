const User = require("../models/userModel");
const admin = require("../models/admin_model");
const productdb = require("../models/product_model");
const catagoryDb = require("../models/category_model");
const sharp = require("sharp")
//================================ LOAD PRODUCTS ===================================

const loadProducts = async (req, res) => {
  try {
    const data = await productdb.find({ is_delete:false});
    res.render("products", { data });
  } catch (error) {
    console.log(error.message);
  }
};

//=============================== LOAD ADDPRODUCTS ======================================

const LoadAddProducts = async (req, res) => {
  try {
    const categoryData = await catagoryDb.find();
    res.render("add_products",{cartData : categoryData});
  } catch (error) {
    console.log(error.message);
  }
};

//=============================== LOAD PRODUCT DETAILS =================================
const productDetails = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await productdb.findById({ _id: id });
    res.render("product_details", { product: productData });
  } catch (error) {
    console.log(error.message);
  }
};

//=============================== ADD PRODUCT ====================================

const addProducts = async (req, res) => {
  try {
     const images = []
      // for(let i= 0 ;i< req.files.length;i++){
      //   images[i] = req.files[i].filename;
      //   await sharp("./public/adminassets/imgs/" + req.files[i].filename)
      //   .resize(800,800)
      //   .toFile(
      //     "./public/adminassets/productImages/"+ req.files[i].filename
      //   )
      // }
      for (let i = 0; i < req.files.length; i++) {
        images[i] = req.files[i].filename;
        await sharp("./public/adminassets/imgs/" + req.files[i].filename)
          .resize({
            width: 500,
            height: 500,
          
          })
          .toFile(
            "./public/adminassets/productImages/" + req.files[i].filename
          );
      }
      
    const product = new productdb({
      name: req.body.name,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
      quantity: req.body.quantity,
      description: req.body.description,
      image: images,
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
    res.render("edit_product", { product: productData });
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

   const productData2 =  await productdb.findByIdAndUpdate(
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
        {_id:req.query.id},
        {$set:{is_delete:true}}
       )
       res.redirect('/admin/products')
    } catch (error) {
       console.log(error.message);
    }
};

//============================================================






module.exports = {
  loadProducts,
  LoadAddProducts,
  addProducts,
  productDetails,
  editProduct,
  addeditProduct,
  deleteProduct,
};
