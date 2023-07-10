const admin = require("../models/admin_model");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const catagoryDb = require("../models/category_model");
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
    const adminData = await admin.findOne({ email: email });

    if (adminData && adminData.email === email) {
      if (password == adminData.password) {
        req.session.admin_id = adminData;
        res.redirect("/admin/home");
      } else {
        res.render("login", { message: "your   Email or password is incorrect" });
      }
    } else {
      res.render("login", { message: "your   Email or password is incorrect" });
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
    const userData = await User.find({ is_admin: 0 });

    res.render("user_details", { data: userData });
  } catch (error) {
    console.log(error.message);
  }
};

//================== VARIFY USER BY ADMIN ======================

const verifyUser = async (req, res) => {
  try {
    const id = req.query.id;

    const userData = await User.findById({ _id: id });
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
    const userData = await User.findById({ _id: id });

    if (userData.is_blocked == true) {
      await User.updateOne({ _id: id }, { $set: { is_blocked: false } });
      res.redirect("/admin/user_details");
    }
    if (userData.is_blocked == false) {
      const block = await User.updateOne(
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
    const user = await User.find({
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

//================================== UPDATE CATEGORY ==================================
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

module.exports = {
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
};
