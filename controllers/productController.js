const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const { getAll, getOne } = require("./helperController");

exports.uploadProduct = catchAsync(async (req, res, next) => {
  const { name, carModel, engineType, fuelType, minPrice, coverImage, images } =
    req.body;
  let biddingDuration = 1;
  if (req.body.biddingDuration) biddingDuration = req.body.biddingDuration;

  if (!images || !images.length || images.length < 3) {
    return res.status(400).json({
      status: "Bad request",
      message: "Please provide 3 or more images",
    });
  }

  console.log("request body: ", { ...req.body, biddingDuration });
  const product = await Product.create({
    name,
    carModel,
    engineType,
    fuelType,
    minPrice: minPrice * 1,
    coverImage,
    owner: req.user._id,
    biddingDuration,
    images,
  });

  console.log("product created: ", product);

  return res.status(201).json({
    status: "OK",
    data: product,
  });
});

exports.getAllProducts = getAll(Product);
exports.getProduct = getOne(Product);

exports.searchProduct = catchAsync(async (req, res, next) => {
  const productsFound = await Product.find({
    $text: { $search: req.params.searchString },
  });

  return next(
    res.status(200).json({
      status: "OK",
      data: productsFound,
    })
  );
});
