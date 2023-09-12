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
        default:false
       }
    
    }
)
module.exports = mongoose.model("banner",bannerSchema);