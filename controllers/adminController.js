const adminDb = require("../models/admin_model");
const UserDb = require("../models/userModel");
const bcrypt = require("bcrypt");
const catagoryDb = require("../models/category_model");
const orderDb = require("../models/order_model");
const { name } = require("ejs");
const session = require("express-session");

//================= PASSWORD BCRYPTING =====================
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//==================ADMIN SIGN UP================

const loadAdminSignUp = async (req, res) => {
  try {
    res.render("adminSignUp");
  } catch (error) {
    console.log(error.message);
  }
};

//=================== ADMIN LOGIN =================
const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

//================== VERIFY LOGIN ==================

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const adminData = await adminDb.findOne({ email: email });

    if (adminData && adminData.email === email) {
      if (password == adminData.password) {
        req.session.admin_id = adminData;
        res.redirect("/admin/home");
      } else {
        res.render("login", { message: "your Email or password is incorrect" });
      }
    } else {
      res.render("login", { message: "your Email or password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//==================== LOAD DASHBOARD ====================

const loadHome = async (req, res) => {
  try {
    res.render("home");
  } catch (error) {
    console.log(error.message);
  }
};

//====================== ADMIN LOGOUT ==========================
const logout = async (req, res) => {
  try {
    req.session.admin_id = false;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

//================== LOAD USER DETAILS ======================
const loadusers = async (req, res) => {
  try {
    const userData = await UserDb.find({ is_admin: 0 });

    res.render("user_details", { data: userData });
  } catch (error) {
    console.log(error.message);
  }
};

//================== VARIFY USER BY ADMIN ======================

const verifyUser = async (req, res) => {
  try {
    const id = req.query.id;

    const userData = await UserDb.findById({ _id: id });
    if (userData.email_varified == false) {
      await User.updateOne({ _id: id }, { $set: { email_varified: true } });
      res.redirect("/admin/user_details");
    }

    if (userData.email_varified == true) {
      await User.updateOne({ _id: id }, { $set: { email_varified: false } });
      res.redirect("/admin/user_details");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//=================== BLOCK OR UNBLOCK BY ADMIN ===========================
const blockOrUnblock = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await UserDb.findById({ _id: id });

    if (userData.is_blocked == true) {
      await UserDb.updateOne({ _id: id }, { $set: { is_blocked: false } });
      res.redirect("/admin/user_details");
    }
    if (userData.is_blocked == false) {
      const block = await UserDb.updateOne(
        { _id: id },
        { $set: { is_blocked: true } }
      );
      if (block) {
        req.session.user_id = false;
      }
      res.redirect("/admin/user_details");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//========================== SEARCH USERS =================================

const searchUser = async (req, res) => {
  try {
    const value = req.body.search;
    // value = value.trim()
    const user = await UserDb.find({
      user_name: { $regex: `^${value}` },
      is_admin: 0,
    });
    res.render("user_details", { data: user });
  } catch (error) {
    console.log(error.message);
  }
};

//============================== LOAD CATEGORY ===============================

const LoadCategoryList = async (req, res) => {
  try {
    const categoeryDetails = await catagoryDb.find();

    res.render("category", { catData: categoeryDetails });
  } catch (error) {
    console.log(error.message);
  }
};

//=======================LOAD ADD-CATEGORY ==================================

const loadAddCate = async (req, res) => {
  try {
    res.render("add_category");
  } catch (error) {
    console.log(error.message);
  }
};

//================================ ADD CATEGORY =============================

const addCategory = async (req, res) => {
  try {
    const name = req.body.name;
    if (name.trim().length == 0) {
      res.redirect("/admin/category");
    } else {
      const already = await catagoryDb.findOne({
        name: { $regex: name, $options: "i" },
      });
      if (already) {
        res.render("add_category", {
          message: " This Category Already Exists",
        });
      } else {
        const catData = new catagoryDb({ name: name });

        const adddata = await catData.save();

        if (adddata) {
          res.redirect("/admin/category");
        } else {
          res.render("add_category", { message: "Somthing Wrong !" });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//=================================== EDIT CATEGORY=================================

const loadEditCat = async (req, res) => {
  try {
    const id = req.query.id;
    const details = await catagoryDb.findById({ _id: id });
    res.render("edit_category", { data: details });
  } catch (error) {
    console.log(error.message);
  }
};

//================================== UPDATE CATEGORY ================================
const updateCate = async (req, res) => {
  try {
    const name = req.body.name;

    if (name.trim().length == 0) {
      res.redirect("/admin/category");
    } else {
      const already = await catagoryDb.findOne({
        name: { $regex: name, $options: "i" },
      });
      if (already) {
        res.render("add_category", { message: "This Category already Exist " });
      } else {
        await catagoryDb.findByIdAndUpdate(
          { _id: req.query.id },
          { $set: { name: req.body.name } }
        );
      }
    }
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

//============================ ACTIVE OR INACTIVE ==================

const activeOrNot = async (req, res) => {
  try {
    const id = req.query.id;
    const catData = await catagoryDb.findOne({ _id: id });
    if (catData.is_active == true) {
      const inActive = await catagoryDb.updateOne(
        { _id: id },
        { $set: { is_active: false } }
      );
      if (inActive) {
        req.session.category_id = false;
      }
      res.redirect("/admin/category");
    }
    if (catData.is_active == false) {
      await catagoryDb.updateOne({ _id: id }, { $set: { is_active: true } });
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//========================= ADMIN SALES REPORT =======================

const loadSalesReport = async (req, res) => {
  try {
    // const adminData = await user.findById(req.session.auser_id);
    const order = await orderDb.aggregate([
      { $unwind: "$products" },
      { $match: { "products.status": "Delivered" } },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products.productId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
          as: "products.productDetails",
        },
      },
      {
        $addFields: {
          "products.productDetails": {
            $arrayElemAt: ["$products.productDetails", 0],
          },
        },
      },
    ]);

    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const orderCount = order.length;
    const totalPages = Math.ceil(orderCount / limit);
    const paginatedOrder = order.slice(startIndex, endIndex);

    res.render("salesReport", {
      order: paginatedOrder,
      activePage: "salesReport",
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//===================== SALES REPORT SORTING ======================

const sortsalesReport = async (req, res) => {
  try {
    const fromDate = req.body.fromDate;
    const toDate = req.body.toDate;

    const order = await orderDb.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          "products.status": "Delivered",
          $and: [
            { "products.deliveryDate": { $gt: new Date(fromDate) } },
            { "products.deliveryDate": { $lt: new Date(toDate) } },
          ],
        },
      },
      { $sort: { deliveryDate: -1 } },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products.productId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
          as: "products.productDetails",
        },
      },
      {
        $addFields: {
          "products.productDetails": {
            $arrayElemAt: ["$products.productDetails", 0],
          },
        },
      },
    ]);

    console.log(order);
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const orderCount = order.length;
    const totalPages = Math.ceil(orderCount / limit);
    const paginatedOrder = order.slice(startIndex, endIndex);

    res.render("salesReport", { order });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadAdminSignUp,
  loadLogin,
  verifyLogin,
  loadHome,
  logout,
  loadusers,
  verifyUser,
  blockOrUnblock,
  searchUser,
  LoadCategoryList,
  loadAddCate,
  addCategory,
  loadEditCat,
  updateCate,
  activeOrNot,
  loadSalesReport,
  sortsalesReport,
};
