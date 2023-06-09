const express = require("express");
const { restrictTo, protect } = require("../controllers/authController");
const {
  createUserBid,
  getLeaderBoard,
  getAllBids,
  getBids,
} = require("../controllers/userBidController");

const router = express.Router();

router.use(protect);
router.post("/", createUserBid);
router.get("/", getAllBids);
router.get("/all", getBids);
router.get("/getLeaderBoard/:productId", getLeaderBoard);

module.exports = router;
