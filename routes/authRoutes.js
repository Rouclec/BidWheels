const express = require("express");
const {
  login,
  signup,
  forgotPassword,
  resetPassword,
  protect,
  verifySeller,
  confirmVerification,
  restrictTo,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

router.get("/confirm-verification/:id/:status", confirmVerification);

router.use(protect);
router.post("/request-verification", restrictTo("seller"), verifySeller);

module.exports = router;
