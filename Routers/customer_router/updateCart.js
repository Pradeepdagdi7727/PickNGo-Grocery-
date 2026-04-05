const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/customerauth");

const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// Helper function to check if discount is active
const isDiscountActive = (discount) => {
  if (!discount || discount.type === 'none' || !discount.value) return false;
  const now = new Date();
  const start = discount.startDate ? new Date(discount.startDate) : null;
  const end = discount.endDate ? new Date(discount.endDate) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
};

// UPDATE CART QUANTITY - WITH DISCOUNT RECALCULATION
router.patch("/cart", jwt, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ message: "product_id and quantity required" });
    }

    const qtyNum = parseInt(quantity);
    if (qtyNum <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    // 🔍 Check product stock and discount
    const product = await Product.findById(product_id);

    if (!product) {
      return res.json({ message: "Product not found" });
    }

    if (product.stock < qtyNum) {
      return res.json({ message: `Not enough stock. Only ${product.stock} left.` });
    }

    // 🛒 Find cart
    const cart = await Cart.findOne({ userId: user_id });

    if (!cart) {
      return res.json({ message: "Cart not found" });
    }

    // 🔍 Find item
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === product_id
    );

    if (itemIndex === -1) {
      return res.json({ message: "Cart item not found" });
    }

    // Calculate current price with discount
    const currentPrice = isDiscountActive(product.discount) 
      ? (product.discount.type === 'percentage' 
        ? product.price * (1 - product.discount.value / 100)
        : product.price - product.discount.value)
      : product.price;

    // ✏️ Update quantity and price
    cart.items[itemIndex].quantity = qtyNum;
    cart.items[itemIndex].priceAtAdd = currentPrice;
    cart.items[itemIndex].productDetails = {
      name: product.name,
      originalPrice: product.price,
      discount: product.discount
    };

    await cart.save();

    return res.json({
      message: "Cart quantity updated",
      quantity: qtyNum,
      priceAtAdd: currentPrice,
      totalItemPrice: currentPrice * qtyNum
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;