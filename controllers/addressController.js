const addressDb = require("../models/userAddress_model");
const UserDb = require("../models/userModel");

//==================== LOAD USER DASHBOARD ==========================
const loadUserDashboard = async (req, res) => {
  try {
    const id = req.session.user_id;
    const userData = await UserDb.findOne({ _id: id });
    const userAddress = await addressDb.findOne({userId:id})
    console.log(userAddress);
    const session = req.session.user_id;

    res.render("userDashboard", { user: userData, session,addresses:userAddress});
  } catch (error) {
    console.log(error.message);
  }
};
//=================== add User Details ==============================

const addUserAddress = async (req, res) => {
  try {
    const alredyAdress = await addressDb.findOne({
      userId: req.session.user_id,
    });
    if (alredyAdress) {
      console.log("if");

      const updatedAddress = await addressDb.updateOne(
        { userId: req.ssession.user_id },
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
      if (updatedAddress) {
        res.redirect("/userDashboard");
      }
    } else {
      console.log("else");
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
        res.redirect("/userdashboard");
      } else {
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadUserDashboard,
  addUserAddress,
};


//=================================================================================