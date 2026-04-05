const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/customerauth");

const Cart = require("../../models/Cart");

// DELETE ITEM FROM CART
router.delete("/cart/:productId", jwt, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // 🔍 Find cart
    const cart = await Cart.findOne({ userId: user_id });

    if (!cart) {
      return res.json({ message: "Cart not found" });
    }

    // ❌ Remove item
    const initialLength = cart.items.length;

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.json({ message: "Item not found in cart" });
    }

    await cart.save();

    return res.json({ message: "Item removed from cart" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;