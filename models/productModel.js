const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name for this product"],
  },
  carModel: {
    type: String,
    required: [true, "Please enter the model for this product"],
  },
  engineType: {
    type: String,
    required: [true, "Please provide an engine type for this product"],
  },
  fuelType: {
    type: String,
    required: [true, "Please provide a fuel type for this product"],
  },
  minPrice: {
    type: Number,
    required: [true, "Please enter a minimum price for this product"]
  },
  coverImage: {
    type: String,
    required: [true, 'Provide a cover image for this product']
  },
  images: [String],
  description: String,
  biddingDuration: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['open',"inBidding", "sold"],
    default: 'open',
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

productSchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already in use, please try another!",
}); //enable beautifying on this schema

productSchema.index({ "$**" : "text" });


const Product = mongoose.model("Product", productSchema);
module.exports = Product;
