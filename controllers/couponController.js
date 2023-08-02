const couponDb = require("../models/coupon_model");
const userDb = require("../models/userModel");
const { response } = require("../routes/userRoutes");

//=================ADMIN LOAD COUPON=======================//

const loadCoupon = async (req, res) => {
  try {
    const couponsData = await couponDb.find({status:true});
    const todaydate = new Date()
    res.render("couponList", { coupons: couponsData,todaydate });
  } catch (error) {
    console.log(error.message);
  }
};

//==================== ADMIN ADD COUPON ====================//

const addCoupon = async (req, res) => {
  try {

   const alreadyCoupon = await couponDb.findOne({couponCode:req.body.couponCode,})
   console.log(alreadyCoupon,"already coupon");
   if(alreadyCoupon){
       res.json({already:true})
   }else{
    const data = new couponDb({
      couponName: req.body.couponName,
      couponCode: req.body.couponCode,
      discountPercentage: req.body.discountPercentage,
      activationDate: req.body.activationDate,
      criteriaAmount: req.body.criteriaAmount,
      expiryDate: req.body.expiryDate,
      usersLimit: req.body.usersLimit,
    });
    const savedData = await data.save();
   }

    res.redirect("/admin/couponList");
  } catch (error) {
    console.log(error.message);
  }
};

//================= ADMIN EDIT COUPON =====================//

const editCoupon = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedCoupon = await couponDb.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          couponName: req.body.couponName,
          couponCode: req.body.couponCode,
          discountPercentage: req.body.discountPercentage,
          activationDate: req.body.activationDate,
          criteriaAmount: req.body.criteriaAmount,
          expiryDate: req.body.expiryDate,
          usersLimit: req.body.usersLimit,
        },
      }
    );

    if (updatedCoupon) {
      res.redirect("/admin/couponList");
    } else {
      res.redirect("/admin/couponList");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//================ ADMIN DELETE COUPON =====================//

const adminDeleteCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    const deletedData = await couponDb.findByIdAndDelete({ _id: id });
    res.redirect("/admin/couponList");
  } catch (error) {
    console.log(error.message);
  }
};

//=============== VARIFY COUPON FOR USER =====================

const varifyCoupon = async (req, res) => {
  try {
    const code = req.body.couponCode;
    const amount = req.body.amount;
    const id = req.session.user_id;
    const varifyData = await couponDb.findOne({couponCode:code,usedUsers:{$in:{id}}});
    if (varifyData){
      res.json({ usedSuccess: true });
    } else {
      const couponData = await couponDb.findOne({ couponCode:code });
      if (couponData.expiryDate >= new Date()) {
        if (couponData.criteriaAmount <= amount) {
          if (couponData.usersLimit > 0) {
            await couponDb.findOneAndUpdate(
              {_id:couponData._id},
              {
                $push: {
                  usedUsers:{id},
                },
                $inc: {
                  usersLimit: -1,
                },
              },
            );
             const percentage = Math.round((amount*couponData.discountPercentage)/100)
             console.log(percentage);
             const lastTotal= Math.round(amount-percentage)
             console.log(lastTotal);
            res.json({ verifiedsuccess: true,lastTotal,percentage});
          } else {
            res.json({ limitsuccess: true });
          }
        } else {
          res.json({ critirianot: true });
        }
      } else {
        res.json({ notdate: true });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};



  
module.exports = {
  loadCoupon,
  addCoupon,
  editCoupon,
  adminDeleteCoupon,
  varifyCoupon,

  
};
