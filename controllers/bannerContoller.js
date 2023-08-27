const sharp = require('sharp');
const bannerDb = require('../models/bannerModel');

//===============LOAD BANNERS=====================//

const loadBanners = async (req,res) =>{
  
    try {
        const bannerData = await bannerDb.find()
        res.render('banners',{banners:bannerData})
    } catch (error) {
         console.log(error.message);
    }

}


//==========================ADD BANNERS ==================//

const addBanner = async (req,res) => {
  
     try {
           console.log(req.files.filename,"ppppppppppppppppppppppppppp");
          const image = []
          image = req.files.filename
            await sharp("./public/adminassets/imgs/"+req.files.filename).resize({
            width: 3400,
            height: 2400,  
            }).toFile("./public/adminassets/bannerImages/" + req.files.filename)
       
        const newBanner = new bannerDb({
            title:req.body.title,
            
        })
        console.log(newBanner,"ooooooooooooooooooooooo");
        const savedBanner = await newBanner.save();
        
    } catch (error) {
        console.log(error);
    }


}

module.exports={
    loadBanners,
    addBanner
}