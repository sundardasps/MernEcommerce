const sharp = require("sharp");
const bannerDb = require("../models/bannerModel");
const { redirect } = require("express/lib/response");

//===============LOAD BANNERS=====================//

const loadBanners = async (req, res) => {
  try {
    const bannerData = await bannerDb.find();
    res.render("banners", { banners: bannerData });
  } catch (error) {
    console.log(error.message);
  }
};

//==========================ADD BANNERS ==================//

const addBanner = async (req, res) => {
  try {
    const title = req.body.title;
    const image = req.file.filename;
    const description = req.body.description;
    
    const data = new bannerDb({
      title: title,
      description: description,
      bannerimage: image,
    });

    const savedData = await data.save();

    if (savedData) {
      res.redirect("/admin/banners");
    }
  } catch (error) {
    console.log(error);
  }
};

//=======================ACTIVE AND INNACTIVE BANNER===================//

const activeOrInactiveBanner = async (req, res) => {
  try {
    const id = req.query.id;
     console.log(id);
    const data = await bannerDb.findOne({ _id: id, isActive: false });
    console.log(data,"false data ");
    if (data) {
      await bannerDb.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            isActive: true,
          },
        }
      );
    } else {
      await bannerDb.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            isActive: false,
          },
        }
      );
    }
   console.log("done");
    res.redirect("/admin/banners");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadBanners,
  addBanner,
  activeOrInactiveBanner,
};
