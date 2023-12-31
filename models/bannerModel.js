const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
       title:{
        type:String,
         required:true
       } ,
       description:{
           type:String,
           required:true
       },
       bannerimage:{
        type:String,
        required:true
       },
       isActive:{
        type:Boolean,
        default:true
       }
    
    }
)
module.exports = mongoose.model("banner",bannerSchema);