const express = require("express");
const { restrictTo, protect } = require("../controllers/authController");
const {
  uploadProduct,
  getAllProducts,
  getProduct,
  searchProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProduct);
router.get('/search/:searchString',searchProduct)

router.use(protect);
router.post("/upload-product", restrictTo("seller"), uploadProduct);

module.exports = router;
