const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  user_name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  mobile_number: {
    type: Number,
    required: true,
    trim: true,
  },
  email_varified: {
    type: Boolean,
    default: false,
  },
  is_admin: {
    type: Number,
    require: true,
  },
  is_verified: {
    type: Number,
    default: 0,
  },
  is_blocked: {
    type: Boolean,
    default: false,
  },
  token:{
    type:String,
    default:''
  }
});

module.exports = mongoose.model("user", userSchema);
