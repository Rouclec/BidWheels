const mongoose = require("mongoose");
const slugify = require("slugify");
const uniqueValidator = require("mongoose-unique-validator");
const Product = require("./productModel");

const bidSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["complete", "inProgress", "failed"],
    default: "inProgress",
  },
  startDate: {
    type: Date,
    default: Date.now(),
  },
  endDate: Date,
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
  },
  highestBid: {
    user: mongoose.Schema.ObjectId,
    amount: Number,
  },
});

bidSchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already in use, please try another!",
}); //enable beautifying on this schema

bidSchema.statics.checkProduct;

bidSchema.pre(/^save/, async function (next) {
  const product = await Product.findById(this.product).select(
    "+biddingDuration"
  );
  let date = new Date();
  this.endDate = date.setMonth(
    date.getMonth() + product.biddingDuration
  );
  next();
});

const Bid = mongoose.model("Bid", bidSchema);
module.exports = Bid;
