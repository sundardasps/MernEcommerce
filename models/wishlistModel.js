const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const wishlistSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },

  user_name: {
    type: String,
    required: true,
  },

  products: [
    {
      productId: {
        type: ObjectId,
        ref: "product",
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("wishList", wishlistSchema);
