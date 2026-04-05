const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/adminauth");
const Product = require("../../models/Product");

// ✅ DELETE PRODUCT (FINAL)
router.delete("/delete/:id", jwt, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Product ID required" });
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;