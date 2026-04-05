const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/customerauth");
const Order = require("../../models/Order");
const Product = require("../../models/Product");

const isDiscountActive = (discount) => {
  if (!discount || discount.type === 'none' || !discount.value) return false;
  const now = new Date();
  const start = discount.startDate ? new Date(discount.startDate) : null;
  const end = discount.endDate ? new Date(discount.endDate) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
};

const getDiscountedPrice = (product) => {
  if (!isDiscountActive(product.discount)) return product.price;
  const original = parseFloat(product.price) || 0;
  if (product.discount.type === 'percentage') {
    return original * (1 - (parseFloat(product.discount.value) / 100));
  } else if (product.discount.type === 'fixed') {
    return Math.max(0, original - parseFloat(product.discount.value));
  }
  return original;
};

router.post("/order", jwt, async (req, res) => {
  try {
    const user_id = req.user.id;
    const cartItems = req.body.cart;

    // ✅ Address fields receive karo
    const shippingAddress = req.body.address || "";
    const phone = req.body.phone || "";
    const notes = req.body.notes || "";

    if (!cartItems || cartItems.length === 0) {
      return res.json({ message: "Cart is empty" });
    }

    // ✅ Address validation
    if (!shippingAddress || !phone) {
      return res.status(400).json({ message: "Address and phone are required" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product_id);
      if (!product) return res.json({ message: "Product not found" });
      if (product.stock < item.quantity) {
        return res.json({ message: `Not enough stock for ${product.name}` });
      }

      const discountedPrice = getDiscountedPrice(product);
      totalAmount += item.quantity * discountedPrice;

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase: discountedPrice,
        originalPrice: product.price,
        discountApplied: isDiscountActive(product.discount) ? {
          type: product.discount.type,
          value: product.discount.value
        } : null
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      userId: user_id,
      items: orderItems,
      totalAmount,
      status: "pending",
      shippingAddress,  // ✅ Save
      phone,            // ✅ Save
      notes             // ✅ Save
    });

    await order.save();

    return res.json({
      message: "Order placed successfully",
      order_id: order._id,
      totalAmount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;