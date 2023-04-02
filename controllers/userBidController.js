const Bid = require("../models/bidModel");
const Product = require("../models/productModel");
const UserBid = require("../models/userBidModel");
const catchAsync = require("../utils/catchAsync");

exports.createUserBid = catchAsync(async (req, res, next) => {
  const { productId, productStatus, minimumPrice, amount } = req.body;
  if (amount < minimumPrice) {
    return next(
      res.status(400).json({
        status: "Bad request",
        message: `Bidding price ${amount} cannot be less than minimum price ${minimumPrice}`,
      })
    );
  }
  let bid;
  if (productStatus === "open") {
    bid = await Bid.create({
      product: productId,
      highestBid: {
        user: req.user._id,
        amount,
      },
    });
    await Product.findByIdAndUpdate(productId, { status: "inBidding" });
  } else {
    bid = await Bid.findOne({ product: productId });
    if (amount <= bid.highestBid.amount) {
      return next(
        res.status(400).json({
          status: "Bad request",
          message: `Bidding amount should be greater than highest bidder's ${bid.highestBid.amount}`,
        })
      );
    }
    const existingBid = await UserBid.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingBid) {
      const date = new Date();
      if (existingBid.status === "complete") {
        return next(
          res.status(500).json({
            status: "Server Error",
            message: "Bidding has ended for this item",
          })
        );
      }
      if (existingBid.endDate < date) {
        await Bid.findByIdAndUpdate(existingBid._id, { status: "complete" });
        return next(
          res.status(500).json({
            status: "Server Error",
            message: "Bidding has ended for this item",
          })
        );
      }
      const updatedBid = await UserBid.findByIdAndUpdate(existingBid._id, {
        amount,
      });

      await Bid.findByIdAndUpdate(bid._id, {
        highestBid: {
          user: req.user._id,
          amount: amount,
        },
      });
      return next(
        res.status(200).json({
          status: "OK",
          data: updatedBid,
        })
      );
    }
    await Bid.findByIdAndUpdate(bid._id, {
      highestBid: {
        user: req.user._id,
        amount: amount,
      },
    });
  }
  const userBid = await UserBid.create({
    amount,
    bidId: bid._id,
    userId: req.user._id,
    productId,
  });

  return next(
    res.status(201).json({
      status: "OK",
      data: userBid,
    })
  );
});

exports.getLeaderBoard = catchAsync(async (req, res, next) => {
  const bids = await UserBid.find({ productId: req.params.productId }).sort(
    "-amount"
  );
  const firstFive = bids.slice(0, 5);
  const myBid = await UserBid.findOne({
    productId: req.params.productId,
    userId: req.user._id,
  });
  const bidIndex = bids.findIndex(
    (e) => e._id.toString() === myBid._id.toString()
  );
  let board = [];
  if (bidIndex > 4) {
    firstFive.slice(0, 4).forEach((e, i) => {
      board.push({
        position: i + 1,
        userId: e.userId,
        amount: e.amount,
      });
    });
    board.push({
      position: bidIndex + 1,
      userId: req.user._id,
      amount: myBid.amount,
    });
  } else {
    firstFive.forEach((e, i) => {
      board.push({
        position: i + 1,
        userId: e.userId,
        amount: e.amount,
      });
    });
  }

  return next(
    res.status(200).json({
      status: "OK",
      data: board,
    })
  );
});
