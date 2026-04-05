const express = require("express");
const router = express.Router();

const Product = require("../../models/Product");

// GET PRODUCTS (SEARCH + FILTER) - WITH DISCOUNTS
router.get("/products", async (req, res) => {
  try {
    const { search, category } = req.query;

    let filter = {};

    // 🔍 Search by name (case-insensitive)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // 📂 Filter by category
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    // 📦 Normalize media and include discount
    const normalizedProducts = products.map(product => {
      let mediaValue = product.media || [];

      if (!Array.isArray(mediaValue)) {
        mediaValue = [];
      }

      if (mediaValue.length === 0 && product.image) {
        mediaValue = [{ type: "image", url: product.image }];
      }

      return {
        ...product._doc,
        media: mediaValue,
        discount: product.discount || { type: 'none', value: 0, startDate: null, endDate: null }
      };
    });

    return res.json({
      message: "Products fetched successfully",
      products: normalizedProducts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", products: [] });
  }
});

module.exports = router;