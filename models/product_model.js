const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand:{
    type: String,
    required:true
  },
  uniqId:{
    type:Number
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  productImages: {
    type: Array,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  stock: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  is_delete:{
    type:Boolean,
    default:false
  },
   product_review:[
    {
      
        userName:{
          type:String,
          required:true
        },
        email:{
          type:String,
          required:true,
        },
        title:{
          type:String,
          required:true,
        },
        review:{
          type:String,
          required:true
        },
        stars:{
          type:Number,
        }
      
    },
   ],
  totalRating:{
    type:String,
    default:0,
  }

});

module.exports = mongoose.model("product", productSchema);
