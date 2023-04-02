const Bid = require("../models/bidModel");
const Product = require("../models/productModel");
const UserBid = require("../models/userBidModel");
const User = require("../models/userModel");
const BiddingEmail = require("../utils/biddingEmail");
const catchAsync = require("../utils/catchAsync");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const deductPayment = async (amount, user) => {
  const client = require("twilio")(accountSid, authToken);
  client.messages
    .create({
      body: `Hello ${
        user.fullname.split(" ")[0]
      }, ${amount} has been deducted from your mobile money, for your bid on Bid 4 Wheels`,
      messagingServiceSid: "MG2926ab2460fccf4b17c058e498e89dad",
      to: "+237650184172",
    })
    .then((message) => console.log(message.sid))
    .catch((error) => console.log("SMS failed with error: ", error));
  // .done();
};

exports.createUserBid = catchAsync(async (req, res, next) => {
  const { productId, productStatus, minimumPrice, amount } = req.body;
  let bid;
  if (productStatus === "open") {
    if (amount < minimumPrice) {
      return next(
        res.status(400).json({
          status: "Bad request",
          message: `Bidding price ${amount} cannot be less than minimum price ${minimumPrice}`,
        })
      );
    }
    bid = await Bid.create({
      product: productId,
      highestBid: {
        user: req.user._id,
        amount,
      },
    });
    await Product.findByIdAndUpdate(productId, { status: "inBidding" });
  } else {
    bid = await Bid.findOne({ product: productId, status: "inProgress" });
    const date = new Date();
    if (bid.status === "complete") {
      return next(
        res.status(500).json({
          status: "Server Error",
          message: "Bidding has ended for this item",
        })
      );
    }
    if (bid.endDate < date) {
      await Bid.findByIdAndUpdate(bid._id, {
        status: "complete",
      });
      const userFound = await User.findById(bid.highestBid.user);
      const product = await Product.findById(bid.product);
      await new BiddingEmail(userFound, product.name).sendBiddingWonMail();
      return next(
        res.status(500).json({
          status: "Server Error",
          message: "Bidding has ended for this item",
        })
      );
    }
    if (amount < minimumPrice) {
      return next(
        res.status(400).json({
          status: "Bad request",
          message: `Bidding price ${amount} cannot be less than minimum price ${minimumPrice}`,
        })
      );
    }
    if (amount <= bid.highestBid.amount) {
      return next(
        res.status(400).json({
          status: "Bad request",
          message: `Bidding amount should be greater than highest bidder's ${bid.highestBid.amount}`,
        })
      );
    }
    const existingUserBid = await UserBid.findOne({
      product: productId,
      user: req.user._id,
    });
    if (existingUserBid) {
      await deductPayment(amount - existingUserBid.amount, req.user);
      const updatedBid = await UserBid.findByIdAndUpdate(existingUserBid._id, {
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
  await deductPayment(amount, req.user);
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
    firstFive.slice(0, 4).forEach(async (e, i) => {
      board.push({
        position: i + 1,
        user: e.userId,
        amount: e.amount,
      });
    });
    board.push({
      position: bidIndex + 1,
      user: req.user._id,
      amount: myBid.amount,
    });
  } else {
    firstFive.forEach(async (e, i) => {
      board.push({
        position: i + 1,
        user: e.userId,
        amount: e.amount,
      });
    });
  }

  await Promise.all(
    board.map(async (e) => {
      const user = await User.findById(e.user);
      if (user) {
        const username =
          user.username === req.user.username
            ? `${req.user.username} (You)`
            : `${req.user.username}`;
        e.user = username;
      } else {
        e.user = `Anonymous`;
      }
    })
  );

  return next(
    res.status(200).json({
      status: "OK",
      data: board,
    })
  );
});
