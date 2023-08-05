const sharp = require('sharp');
const bannerDb = require('../models/bannerModel');

//===============LOAD BANNERS=====================//

const addBanner = async (req,res) => {
  
     try {
      
        const image = req.files.filename
        if(req.files.length){
            await sharp("./public/adminassets/imgs/"+req.files.filename).resize({
            }).toFile("./public/adminassets/bannerImages/" + req.files.filename)
        }
        const newBanner = new bannerDb({
            title:req.body.title,
            bannerImage:image
        })

        const savedBanner = await newBanner.save();
        
    } catch (error) {
        console.log(error.message);
    }


}