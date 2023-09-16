const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailar = require("nodemailer");
const otpGenerator = require("otp-generator");
const categoryDb = require("../models/category_model");
const productDb = require("../models/product_model");
const wishListDb = require('../models/wishlistModel')
const bannerDb = require('../models/bannerModel')
const cartDb = require('../models/cart_model')
const { name } = require("ejs");






let userOtp;
let registedEmail;

//====================================FOR BCRYPT PASSWORD===============================

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};
//====================================== OTP GENERATOR =================================

const generateOtp = () => {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
  return otp;
};

//=======================================FOR SEND EMAIL============================

const sendVarifyMAil = async (userName, email, otp) => {
  try {
    console.log("REACHED MAIL OPPTION");
    const transporter = nodemailar.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user:process.env.email,
        pass:process.env.password,
      },
    });
    const mailOptions = {
      from:process.env.email,
      to: email,
      subject: "For varification mail",
      text: `Hi ${userName}Your OTP is:${otp}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been send:-", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//=======================================FOR USER SIGNUP==============================
const register = async (req, res) => {
  try {
   
    res.render("signup");
  } catch (error) {
    console.log(error.message);
  }
};

//============================= FOR RESET PASSWORD AND SEND EMAIL ==================

const resendVarifyMail = async (userName, email, token) => {
 
  try {
    const transporter = nodemailar.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });
    const mailOptions = {
      from: process.env.email,
      to: email,
      subject: "For Reset password",
      html: `<p>hi ${userName}, please click here to <a href="http://localhost:3000/reset_password?token=${token}">Reset</a> your password</p>`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been send:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//=======================================USER DATA INSERT==========================

const insertUser = async (req, res) => {
  try {
  
    const userName = req.body.name;
    const email = req.body.email;
    registedEmail = email;
    const mobileNumber = req.body.number;
    const spassword = await securePassword(req.body.password);
    const alreadyUser = await User.findOne({ user_name: userName });
    const alreadyMail = await User.findOne({ email: email });
    const alreadyPhone = await User.findOne({ mobile_number: mobileNumber });
    if (alreadyUser) {
      res.render("signup", { message: "User name already exists! " });
    } else {
      if (alreadyMail) {
        res.render("signup", { message: "Mail Id is already exists" });
      } else {
        if (alreadyPhone) {
          res.render("signup", { message: "Mobile numeber already exists" });
        } else {
          const data = new User({
            user_name: req.body.name,
            email: req.body.email,
            mobile_number: req.body.number,
            password: spassword,
            is_admin: 0,
            is_verified: 0,
            is_blocked: false,
          });
          const result = await data.save();
          const otp = generateOtp();
          userOtp = otp;
          console.log(userOtp);
          sendVarifyMAil(userName, email, otp);
          res.render("varifyOtp");
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//=====================================OTP VARIFICATION==============================
const varifyOtp = async (req, res) => {
  try {
    const userotp = req.body.otp;
    if (userOtp == userotp) {
      const updateInfo = await User.updateOne(
        { email: registedEmail },
        { $set: { email_varified: true } }
      );
      res.redirect("login");
    } else {
      //===========================================================================================================NEED TO ADD DELETE OPTION
      res.render("varifyotp", { message: "Entered OTP is wrong !" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//=========================================USER LOGIN =====================================
const userLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

//=======================================LOGIN VARIFICATION================================

const varifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData == null) {
      res.redirect("/");
    } else if (userData.email_varified == true) {
      if (userData.is_blocked == false) {
        if (userData.email) {
          const passwordmatch = await bcrypt.compare(
            password,
            userData.password
          );
          if (passwordmatch) {
            req.session.user_id = userData._id;
            res.redirect("/");
          } else {
            res.render("login", { message: "Incorrect Email or Password " });
          }
        } else {
          res.render("login", { message: "Incorrect Email or Password " });
        }
      } else {
        res.render("login", { message: "Your blocked By Admin !" });
      }
    } else {
      res.render("login", { message: "Pleasse Varify Your Email " });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//=====================================LOAD HOME=========================================

const loadHome = async (req, res) => {
  const session = req.session.user_id;
  const productdata = await productDb.find({is_delete:false});
  const data = await categoryDb.find();
  const cartData = await cartDb.find();
  const wishData = await wishListDb.find();
  const bannerData = await bannerDb.find({isActive:true})
  console.log(bannerData);
  

  try {
    res.render("home", {
     session,
      category: data,
      products: productdata,
      cartProducts:cartData,
      wishProducts:wishData,
      banner:bannerData,
      
    });
  } catch (error) {
    console.log(error.message);
  }
};

//================================== USER LOGOUT ====================================

const logout = async (req, res) => {
  try {
    req.session.user_id = false;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

//================================= FORGOT PASSWORD LOAD =================================

const loadForget = async (req, res) => {
  try {
    res.render("forget_password");
  } catch (error) {
    console.log(error.message);
  }
};

//================================= ADD FOREGET PASSWORD ==================================

const forgetSendEmail = async (req, res) => {
  try {
    const email = req.body.email;
    
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.email_varified == false) {
        res.render("forget_password", { message: "Email Not varified" });
      } else {
        const forgetOTP = otpGenerator.generate();
        const updateData = await User.updateOne(
          { email: email },
          { $set: { token: forgetOTP } }
        );
        const user = await User.findOne({ email: email });

        resendVarifyMail("user", user.email, forgetOTP);

        res.render("forget_password", {
          message: "Please Check Your Email For Reset Password",
        });
      }
    } else {
      res.render("forget_password", { message: "Wrong Email Id" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//====================================LOAD RESET PASSWOR======================================

const resetPasswordLoad = async (req, res) => {
  try {
  
    const token = req.query.token;
    const session = req.session.user_id
    const userData = await User.findOne({ token: token });
    if (userData) {
      res.render("reset_password", { email: userData.email });
    } else {
      res.render("404", {session, message: "Invalid Token" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//=================================== ADD RESET PASSWORD ==========================

const resetPasswordVerify = async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.body.email;

    const spassword = await securePassword(password);
    const updatedData = await User.findOneAndUpdate(
      { email: email },
      { $set: { password: spassword, token: "" } }
    );
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

// ====================================PRODUCT DETAILED PAGE ===============================

const loadProductdetails = async (req, res) => {
  try {
    const id = req.query.id;
    const session = req.session.user_id;
    const productData = await productDb.findById({ _id: id });
    const productsinDb = await productDb.find();
    const data = await categoryDb.find();

    res.render("product_details", {
      products: productData,
      category: data,
      all: productsinDb,
      session: session,
     
    });
  } catch (error) {
    console.log(error.message);
  }
};

//===================================== LOAD SHOP =========================================

const loadShop = async (req, res) => {
  try {
  
    let search='';
  
    if(req.query.search){

      search = req.query.search
    }
    var page = 1;
    if(req.query.page){ 
      page = req.query.page;
    }
    const limit = 8
    const session = req.session.user_id;
    const productdata = await productDb.find({is_delete:false,
      $or:[
        {name:{$regex:'.*'+search+'.*',$options:'i'}},
        {category:{$regex:'.*'+search+'.*',$options:'i'}},
      ]
    })
    .limit(limit*1)
    .skip((page-1)*limit)
    .exec()


    const count = await productDb.find({is_delete:false,
     $or:[  
      {name:{$regex:'.*'+search+'.*',$options:'i'}},
        {category:{$regex:'.*'+search+'.*',$options:'i'}},
     ]
    }).countDocuments()



    const data = await categoryDb.find({is_active:true});
 

   
    res.render("shop", {
      session,
      category: data,
      products: productdata,
      totalPages:Math.ceil(count/limit),
      currentPage: page,
      previousPage: page -1,
     
    });
  } catch (error) {
    console.log(error.message);
  }
};


//========================== FILTER USER CATEGORY ======================

const filterCategory = async (req,res) => {

   try {
      var search = '';
      if(req.query.search){
        search = req.query.search;
      }

      var page = 1;
    if(req.query.page){ 
      page = req.query.page;
    }

      const id = req.params.id;
      const limit = 8;

     

      const productdata = await productDb.find({category: id,is_delete:false,
        $or:[
          {name:{$regex:'.*'+search+'.*',$options:'i'}},
          {category:{$regex:'.*'+search+'.*',$options:'i'}},
        ]
      })
      .limit(limit*1)
      .skip((page-1)*limit)
      .exec()

     

      const count = await productDb.find({is_delete:false,
        $or:[
          {name:{$regex:'.*'+search+'.*',$options:'i'}},
          {category:{$regex:'.*'+search+'.*',$options:'i'}},
         
        ]
      })
      .countDocuments();
      
      const session = req.session.user_id;

      const data = await categoryDb.find({is_active:true});
       
      const produtData = await productDb.find({category:id,is_delete:false})
     


      if(data.length > 0){
        res.render('shop',{totalPages:Math.ceil(count/limit),products:productdata,session:session,category:data,});
      }else{
        res.render('shop',{totalPages:Math.ceil(count/limit),products:[],session:session,category:data,});
        
      }
  

   } catch (error) {
     console.log(error.message);
   }

}


//======================== EDIT USER  ===========================

const updateUser = async (req,res) =>{

   try {
    const id = req.params.id
    const name = req.body.name
    const email = req.body.email
    const mobile = req.body.mobile
    const updatedData = await User.findOneAndUpdate({_id:id},{
       $set:{
        user_name:name,
        email:email,
        mobile_number:mobile,
       }
    })

    res.redirect('/userDashboard')
    
   } catch (error) {
     console.log(error.message);
   }

}

//===========================LOAD USERSIDE ABOUT PAGE ==============================

const loadAbout  = async  (req,res) =>{

   try {
    const session = req.session.user_id
    res.render('about',{session})
    
   } catch (error) {
    console.log(error.message);
   }
}


module.exports = {
  register,
  insertUser,
  varifyOtp,
  userLogin,
  varifyLogin,
  loadHome,
  logout,
  loadProductdetails,
  loadForget,
  forgetSendEmail,
  resetPasswordLoad,
  resetPasswordVerify,
  loadShop,
  filterCategory,
  updateUser,
  loadAbout

};
