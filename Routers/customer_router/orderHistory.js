const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/customerauth");

const Order = require("../../models/Order");

// GET USER ORDERS
router.get("/orders", jwt, async (req, res) => {
  try {
    const user_id = req.user.id;

    const orders = await Order.find({ userId: user_id })
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.json({ message: "No Orders Found", orders: [] });
    }

    // 🔄 Format response (same as old structure)
    const response = orders.map(order => ({
      order_id: order._id,
      id: order._id,
      total_amount: order.totalAmount,
      status: order.status,
      created_at: order.createdAt,
      items: order.items.map(item => ({
        product_id: item.productId?._id,
        product_name: item.productId?.name,
        quantity: item.quantity,
        price: item.productId?.price,
        total_price: item.quantity * (item.productId?.price || 0)
      }))
    }));

    return res.json({
      message: "Orders fetched successfully",
      orders: response
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", orders: [] });
  }
});

module.exports = router;