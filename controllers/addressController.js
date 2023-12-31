const { session } = require("passport");
const addressDb = require("../models/userAddress_model");
const UserDb = require("../models/userModel");
const orderDb = require("..//models/order_model");
const { query } = require("express");

//==================== LOAD USER DASHBOARD ==========================
const loadUserDashboard = async (req, res,) => {
  try {
    const id = req.session.user_id;
    const userData = await UserDb.findOne({ _id: id });
    const addresses = await addressDb.find({ userId: id });
    const orderData = await orderDb.find({_id:id});

    
    res.render("userDashboard", {
      user: userData,
      session:id,
      addresses,
      orders: orderData,
     
    });
  } catch (error) {
    console.log(error.message);
  }
};

//=========================LOAD ADD ADDRESS FORM ============================

const loadAddAddress = async (req, res) => {
  try {
    const session = req.session.user_id;
    res.render("addAddress",{session});
  } catch (error) {
    console.log(error.message);
  }
};

//=================== INSERT USER ADDRESS =======================

const addUserAddress = async (req, res) => {
  try {
    const alredyAdress = await addressDb.findOne({
      userId: req.session.user_id,
    });
    if (alredyAdress) {
      const updatedAddress = await addressDb.updateOne(
        { userId: req.session.user_id },
        {
          $push: {
            addresses: [
              {
                userName: req.body.userName,
                mobile: req.body.mobile,
                altrenativeMob: req.body.alternativenumber,
                houseName: req.body.hoseName,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
              },
            ],
          },
        }
      );
      if (updatedAddress) {
        res.redirect("/checkOut");
      }
    } else {
      const newAddress = new addressDb({
        userId: req.session.user_id,
        addresses: [
          {
            userName: req.body.userName,
            mobile: req.body.mobile,
            altrenativeMob: req.body.alternativenumber,
            houseName: req.body.hoseName,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
          },
        ],
      });
     
      const savedAddress = await newAddress.save();

      if (savedAddress) {
        res.redirect("/checkOut");
      } else {
      }
    }
  } catch (error) {
    console.log(error.message);

  }
};

//================================= EDIT ADDRESS ========================

const loadEditAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const session = req.session.user_id;
    const user = await UserDb.find();
    const addressData = await addressDb.findOne(
      { userId: req.session.user_id },
      { addresses: { $elemMatch: { _id: id } } }
    );
    const address = addressData.addresses;

    res.render("editAddress", {
      addresses: address[0],session
    });
  } catch (error) {
    console.log(error.message);

  }
};

//============================INSERT UPDATED ADDRESS =================

const updateAddress = async (req,res) => {
  try {
    const id = req.query.id;
    const session = req.session.user_id;
    console.log(req.body.alternativenumber);
    const address = await addressDb.updateOne(
      { userId: req.session.user_id },
      { $pull: { addresses: { _id: id } } }
    );

    const pushAddress = await addressDb.updateOne(
      { userId: session },
      {
        $push: {
          addresses: {
            userName: req.body.userName,
            mobile: req.body.mobile,
            altrenativeMob: req.body.alternativenumber,
            houseName: req.body.hoseName,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
          },
        },
      }
    );
    res.redirect("/checkOut");
  } catch (error){
   console.log(error.message);
  }
};

//=========================== DELETE ADDRESSS ==========================

const deleteAddress = async (req, res) => {
  try {
    
    const id = req.body.id;
    await addressDb.updateOne(
      { userId: req.session.user_id },
      { $pull: { addresses: { _id: id } } }
    );
    res.json({ remove: true });
  } catch (error) {
    console.log(error.message);
  }
};

//======================LOAD EMPTY CART ==========================

const emptyCheckOut = async (req, res) => {
  try {
    res.render("emptyCheckOut");
  } catch (error) {
    console.log(error.message);
  }
};

//======================USER SHOW ADDRESSS ========================

const showAddress = async (req, res) => {
  try {
  
    const session = req.session.user_id
    const addressData = await addressDb.findOne({
      userId: session,
    });
    if (addressData.addresses.length > 0) {
      const address = addressData.addresses;
      res.render("showAddress", { address ,session});
    } else {
      res.render("emptyCheckOut");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//====================LOAD ADDRESS FROM DASHBOARD==================

const loadAddressFromDash = async (req, res) => {
  try {
    
    const session = req.session.user_id
    const addressData = await addressDb.findOne({
      userId:session,
    });
  
    if (addressData.addresses.length > 0) {
      const address = addressData.addresses;
      res.render("showAddressFromDash", { address,session });
    } else{
       res.render('emptyAddress',{session})
    }
  } catch (error) {
    console.log(error.message);
  }
};

//====================ADD ADDRESS FROM DASHBOARD====================

const addUserAddressFromDash = async (req, res) => {
  try {
    const alredyAdress = await addressDb.findOne({
      userId: req.session.user_id,
    });
    if (alredyAdress) {
      const updatedAddress = await addressDb.updateOne(
        { userId: req.session.user_id },
        {
          $push: {
            addresses: [
              {
                userName: req.body.userName,
                mobile: req.body.mobile,
                altrenativeMob: req.body.alternativenumber,
                houseName: req.body.hoseName,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
              },
            ],
          },
        }
      );
      if (updatedAddress) {
        res.redirect("/userDashboard");
      }
    } else {
      const newAddress = new addressDb({
        userId: req.session.user_id,
        addresses: [
          {
            userName: req.body.userName,
            mobile: req.body.mobile,
            altrenativeMob: req.body.alternativenumber,
            houseName: req.body.hoseName,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
          },
        ],
      });
      
      const savedAddress = await newAddress.save();

      if (savedAddress) {
        res.redirect("/userDashboard");
      } else {
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//===================LOAD EDIT ADDRESS FROM DASHBOARD ===================

const loadEditAddressfromDash = async (req, res) => {
  try {
    const id = req.query.id;
    const session = req.session.user_id;
    const user = await UserDb.find();
    const addressData = await addressDb.findOne(
      { userId: req.session.user_id },
      { addresses: { $elemMatch: { _id: id } } }
    );
    const address = addressData.addresses;

    res.render("editAddressFromDash", {
      addresses: address[0],session
    });
  } catch (error) {
    console.log(error.message);
  }
};

//===================ADD EDIT ADDRESS FROM DASHBOARD ===================

const updateAddressFromDash = async (req, res) => {
  try {
    const id = req.query.id;
    const session = req.session.user_id;
    const address = await addressDb.updateOne(
      { userId: req.session.user_id },
      { $pull: { addresses: { _id: id } } }
    );

    const pushAddress = await addressDb.updateOne(
      { userId: session },
      {
        $push: {
          addresses: {
            userName: req.body.userName,
            mobile: req.body.mobile,
            altrenativeMob: req.body.alternativenumber,
            houseName: req.body.hoseName,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
          },
        },
      }
    );
    res.redirect("/userDashboard");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadUserDashboard,
  loadAddAddress,
  addUserAddress,
  loadEditAddress,
  deleteAddress,
  updateAddress,
  emptyCheckOut,
  showAddress,
  loadAddressFromDash,
  loadEditAddressfromDash,
  addUserAddressFromDash,
  updateAddressFromDash,
};
