const User = require("../models/userModel");
const admin = require("../models/admin_model");
const productdb = require("../models/product_model");
const catagoryDb = require("../models/category_model");

//================================ LOAD PRODUCTS ===================================

const loadProducts = async (req, res) => {
  try {
    const data = await productdb.find();

    res.render("products", { data });
  } catch (error) {
    console.log(error.message);
  }
};

//=============================== LOAD ADDPRODUCTS ======================================

const LoadAddProducts = async (req, res) => {
  try {
    res.render("add_products");
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
    const images = req.files.map((image) => image.filename);
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
    const name = req.body.name;
    const brand = req.body.brand;
    const price = req.body.price;
    const category = req.body.category;
    const stock = req.body.stock;
    const quantity = req.body.quantity;
    const description = req.body.description;
    const id = req.body.id;
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
    } else {
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
          },
        }
      );
    }
    res.redirect("/product_details");
  } catch (error) {
    console.log(error.message);
  }
};

//======================== DELETE PRODUCT ==================

// const deleteProduct = async (req, res) => {
//   try {
//     const id = req.query.id;
//     await productdb.deleteOne({ _id: id });
//     res.redirect("/products");
//   } catch (error) {
//     console.log(error.message);
//   }
// };

//========================= 


//============================================================






module.exports = {
  loadProducts,
  LoadAddProducts,
  addProducts,
  productDetails,
  editProduct,
  addeditProduct,
  // deleteProduct,
};
