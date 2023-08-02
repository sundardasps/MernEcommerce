const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
       title:{
        type:String,
         required:true
       } ,
       bannerImage:{
        type:String,
        required:true
       }
    
    }
)
module.exports = mongoose.model("banner",bannerSchema);