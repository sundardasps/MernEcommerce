const adminDb = require("../models/admin_model");
const UserDb = require("../models/userModel");
const bcrypt = require("bcrypt");
const catagoryDb = require("../models/category_model");
const orderDb = require("../models/order_model");
const productDb = require("../models/product_model");
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
    const productData = await productDb.find({ is_delete: false });
    const userData = await UserDb.find({});
    const orderData = await orderDb.find({});

    const totalSales = await orderDb.aggregate([
      {
        $match: { "products.status": "Delivered" },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);
    let totalAmount = 0;

    if (totalSales.length > 0) {
      totalAmount += totalSales[0].totalAmount;
      console.log("Total amount of delivered orders:", totalAmount);
    } else {
      console.log("No delivered orders found.");
    }

    const totalCodResult = await orderDb.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: { "products.status": "Delivered", paymentMethod: "COD" },
      },
      {
        $group: {
          _id: null,
          totalCodAmount: { $sum: "$products.totalPrice" },
        },
      },
    ]);

    let totalCod = 0;
    if (totalCodResult.length > 0) {
      totalCod = totalCodResult[0].totalCodAmount;
    } else {
      console.log("No COD orders found.");
    }

    const totalOnlinePaymentResult = await orderDb.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.status": "Delivered",
          paymentMethod: "onlinePayment",
        },
      },
      {
        $group: {
          _id: null,
          totalCodAmount: { $sum: "$products.totalPrice" },
        },
      },
    ]);

    let totalOnline = 0;
    if (totalOnlinePaymentResult.length > 0) {
      totalOnline = totalOnlinePaymentResult[0].totalCodAmount;
    } else {
      console.log("No online orders found.");
    }

    const totalWalletResult = await orderDb.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.status": "Delivered",
          paymentMethod: "wallet",
        },
      },
      {
        $group: {
          _id: null,
          totalCodAmount: { $sum: "$products.totalPrice" },
        },
      },
    ]);

    let totalWallet = 0;
    if (totalWalletResult.length > 0) {
      totalWallet = totalWalletResult[0].totalCodAmount;
    } else {
      console.log("No wallet orders found.");
    }

    // first year sales report

    const firstYear = new Date();
    const secondyear = new Date(
      firstYear.getTime() - 365 * 24 * 60 * 60 * 1000
    );

    const totalSalesYear = await orderDb.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.status": "Delivered",
          date: { $gte: secondyear, $lt: firstYear }, // Filter by the specific year
        },
      },
      {
        $group: {
          _id: null,
          totalYearAmount: { $sum: "$products.totalPrice" },
        },
      },
    ]);

    let totalAmountYear = 0;

    if (totalSalesYear.length > 0) {
      totalAmountYear = totalSalesYear[0].totalYearAmount;
      console.log("Total amount of delivered orders:", totalAmountYear);
    } else {
      console.log("No delivered orders found.");
    }

    //====================SECOND YEAR AGRIGATION =============//

    const thiredyear = new Date(
      secondyear.getTime() - 365 * 24 * 60 * 60 * 1000
    );

    const totalSalesSecondYear = await orderDb.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.status": "Delivered",
          date: { $gte: thiredyear, $lt: secondyear }, // Filter by the specific year
        },
      },
      {
        $group: {
          _id: null,
          totalSecondYearAmount: { $sum: "$products.totalPrice" },
        },
      },
    ]);

    let totalAmountSecondYear = 0;

    if (totalSalesSecondYear.length > 0) {
      totalAmountSecondYear = totalSalesSecondYear[0].totalSecondYearAmount;
      console.log(
        "Total amount of delivered second orders:",
        totalAmountSecondYear
      );
    } else {
      console.log("No delivered orders found.");
    }

    //=================THIRD YEAR SALES =================//

    const FOURTHYEAR = new Date(
      thiredyear.getTime() - 365 * 24 * 60 * 60 * 1000
    );

    const totalSalesThirdYear = await orderDb.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.status": "Delivered",
          date: { $gte: FOURTHYEAR, $lt: thiredyear }, // Filter by the specific year
        },
      },
      {
        $group: {
          _id: null,
          totalThirdYearAmount: { $sum: "$products.totalPrice" },
        },
      },
    ]);

    let totalAmountThirdYear = 0;

    if (totalSalesThirdYear.length > 0) {
      totalAmountThirdYear = totalSalesThirdYear[0].totalThirdYearAmount;
      console.log(
        "Total amount of delivered second orders:",
        totalAmountThirdYear
      );
    } else {
      console.log("No delivered orders found.");
    }

//================ WEEKLY SALES ================//

const currentDate = new Date();
const weekStart = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  currentDate.getDate() - currentDate.getDay()
);
const weekEnd = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  currentDate.getDate() - currentDate.getDay() + 6
);

const weeklysales = await orderDb.aggregate([
  {
    $match: {
      date: { $gte: weekStart, $lte: weekEnd },
    },
  },
  {
    $group: {
      _id: {
        dayOfWeek: { $dayOfWeek: "$date" },
        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
      },
      totalSales: { $sum: "$totalAmount" },
      orderCount: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      dayOfWeek: "$_id.dayOfWeek",
      date: "$_id.date",
      totalSales: 1,
      orderCount: 1,
    },
  },
  {
    $sort: { dayOfWeek: 1, date: 1 },
  },
]);

const dailySalesData = Array.from({ length: 7 }, (_, day) => {
  const dayOfWeek = (day + 1) % 7;
  const salesForDay = weeklysales.filter(
    (entry) => entry.dayOfWeek === dayOfWeek
  );
  return {
    dayOfWeek: dayOfWeek,
    salesData: salesForDay,
  };
});

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const dailySalesTotalByDay = {};

daysOfWeek.forEach((day) => {
  dailySalesTotalByDay[day] = 0;
});

dailySalesData.forEach((dayData) => {
  const dayName = daysOfWeek[dayData.dayOfWeek - 1];
  const totalSalesForDay = dayData.salesData.reduce(
    (acc, entry) => acc + entry.totalSales,
    0
  );
  dailySalesTotalByDay[dayName] = totalSalesForDay;
});

const mondayTotalSales = dailySalesTotalByDay["Monday"];
const tuesdayTotalSales = dailySalesTotalByDay["Tuesday"];
const wednesdayTotalSales = dailySalesTotalByDay["Wednesday"];
const thursdayTotalSales = dailySalesTotalByDay["Thursday"];
const fridayTotalSales = dailySalesTotalByDay["Friday"];
const saturdayTotalSales = dailySalesTotalByDay["Saturday"];
const sundayTotalSales = dailySalesTotalByDay["Sunday"];

//================WEEKLY SALES ENDING=====//

    res.render("home", {
      product: productData,
      user: userData,
      order: orderData,
      total: totalAmount,
      totalCod,
      totalWallet,
      totalOnline,
      firstYear,
      totalAmountYear,
      secondyear,
      totalAmountSecondYear,
      thiredyear,
      totalAmountThirdYear,
      mondayTotalSales,
      tuesdayTotalSales,
      wednesdayTotalSales,
      thursdayTotalSales,
      fridayTotalSales,
      saturdayTotalSales,
      sundayTotalSales,
      
    });
  } catch (error) {
    console.log(error.message);
  }
};

//====================== ADMIN LOGOUT ===================//
const logout = async (req, res) => {
  try {
    req.session.admin_id = false;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

//================== LOAD USER DETAILS ===================//
const loadusers = async (req, res) => {
  try {
    const userData = await UserDb.find({ is_admin: 0 });

    res.render("user_details", { data: userData });
  } catch (error) {
    console.log(error.message);
  }
};

//================== VARIFY USER BY ADMIN ====================///

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

//=================== BLOCK OR UNBLOCK BY ADMIN ======================//
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

//========================== SEARCH USERS ============================//

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

//============================== LOAD CATEGORY =========================//

const LoadCategoryList = async (req, res) => {
  try {
    const categoeryDetails = await catagoryDb.find();

    res.render("category", { catData: categoeryDetails });
  } catch (error) {
    console.log(error.message);
  }
};

//=======================LOAD ADD-CATEGORY ===============================//

const loadAddCate = async (req, res) => {
  try {
    res.render("add_category");
  } catch (error) {
    console.log(error.message);
  }
};

//================================ ADD CATEGORY ==========================//

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

//=================================== EDIT CATEGORY==============================//

const loadEditCat = async (req, res) => {
  try {
    const id = req.query.id;
    const details = await catagoryDb.findById({ _id: id });
    res.render("edit_category", { data: details });
  } catch (error) {
    console.log(error.message);
  }
};

//================================== UPDATE CATEGORY =============================//
const updateCate = async (req, res) => {
  try {
    const name = req.body.name;

    if (name.trim().length == 0) {
      res.redirect("/admin/category");
    } else {
      await catagoryDb.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { name: req.body.name } }
      );
    }
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

//============================ ACTIVE OR INACTIVE =============================//

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

//========================= ADMIN SALES REPORT ============================//

const loadSalesReport = async (req, res) => {
  try {
    // const adminData = await user.findById(req.session.auser_id);
    const orderData = await orderDb.aggregate([
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

    res.render("salesReport", {
      order: orderData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//===================== SALES REPORT SORTING ======================//

const sortsalesReport = async (req, res) => {
  try {
    const from = req.body.fromDate;
    const to = req.body.toDate;

    const order = await orderDb.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          "products.status": "Delivered",
          $and: [
            { "products.deliveryDate": { $gt: new Date(from) } },
            { "products.deliveryDate": { $lt: new Date(to) } },
          ],
        },
      },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products.productId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$productId"] } } }],
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

    res.render("salesReport", { order });
  } catch (error) {
    console.log(error.message);
  }
};

//======================== DAILY WEEKLY YEARLY SELES REPORT SORT =====================//

const salesReportFilter = async (req, res) => {
  try {
    const id = req.params.id;
    const startDate = 86400000 * id;
    const currentDate = new Date();
    const order = await orderDb.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          "products.status": "Delivered",
          $and: [
            { "products.deliveryDate": { $gt: new Date(startDate) } },
            { "products.deliveryDate": { $lt: new Date(currentDate) } },
          ],
        },
      },
      { $sort: { "products.deliveryDate": -1 } },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products.productId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$productId"] } } }],
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
  salesReportFilter,
};
