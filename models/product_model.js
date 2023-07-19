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
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
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
   ratings:[
    {
       star:Number,
       postedby:{type: mongoose.Schema.Types.ObjectId,ref:"user"},
    },
   ],
  totalRating:{
    type:String,
    default:0,
  }

});

module.exports = mongoose.model("product", productSchema);
