const mongoose = require("mongoose");
const slugify = require("slugify");
const uniqueValidator = require("mongoose-unique-validator");
const Product = require("./productModel");
const Bid = require("./bidModel");

const userBidSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, "Please enter an amount"],
  },
  bidId: {
    type: mongoose.Schema.ObjectId,
    ref: "Bid",
  },
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["inProgress", "won", "lost"],
    default: "inProgress",
  },
});

userBidSchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already in use, please try another!",
}); //enable beautifying on this schema

const UserBid = mongoose.model("UserBid", userBidSchema);
module.exports = UserBid;
