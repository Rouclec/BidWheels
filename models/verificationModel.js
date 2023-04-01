const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const uniqueValidator = require("mongoose-unique-validator");

const verificationSchema = new mongoose.Schema(
  {
    vatNumber: {
      type: String,
      required: [true, "Please enter your VAT number"],
      unique: true,
    },
    vatDocument: {
      type: String,
      required: [true, "Please upload a valid VAT document"],
      unique: true,
    },
    idDocument: {
      type: String,
      required: [true, "Please upload a valid Identification document"],
      unique: true,
    },
    status: {
        type: String,
        enum: ["Pending","Completed","Rejected"],
        default: "Pending"
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

verificationSchema.plugin(uniqueValidator, {
  message: "{PATH} {VALUE} already in use, please try another!",
}); //enable beautifying on this schema


const Verification = mongoose.model("Verification", verificationSchema);
module.exports = Verification;
