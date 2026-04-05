const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/adminauth");

const Product = require("../../models/Product");

// GET ALL PRODUCTS (ADMIN) - WITH DISCOUNTS
router.get("/products", jwt, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    // Normalize media and include discount
    const normalizedProducts = products.map(product => {
      let mediaValue = product.media || [];

      if (!Array.isArray(mediaValue)) {
        mediaValue = [];
      }

      // fallback to image
      if (mediaValue.length === 0 && product.image) {
        mediaValue = [{ type: "image", url: product.image }];
      }

      return {
        ...product._doc,
        media: mediaValue,
        discount: product.discount || { 
          type: 'none', 
          value: 0, 
          startDate: null, 
          endDate: null 
        }
      };
    });

    return res.json({ Allproduct: normalizedProducts });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;