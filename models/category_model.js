const mongoose = require("mongoose");

const categorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  is_active:{
    type: Boolean,
    default:true
  }
});

module.exports = mongoose.model("category", categorSchema);
