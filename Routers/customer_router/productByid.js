const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/customerauth");

const Product = require("../../models/Product");

// GET PRODUCT BY ID - WITH DISCOUNT
router.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.json({ message: "Product not found" });
    }

    // 📦 Normalize media
    let mediaValue = product.media || [];

    if (!Array.isArray(mediaValue)) {
      mediaValue = [];
    }

    // fallback to image
    if (mediaValue.length === 0 && product.image) {
      mediaValue = [{ type: "image", url: product.image }];
    }

    return res.json({
      Productis: [
        {
          ...product._doc,
          media: mediaValue,
          discount: product.discount || { type: 'none', value: 0, startDate: null, endDate: null }
        }
      ]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;