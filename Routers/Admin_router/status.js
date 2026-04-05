const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/adminauth");

const Order = require("../../models/Order");

// UPDATE ORDER STATUS
router.patch("/order/status", jwt, async (req, res) => {
  try {
    const { order_id, status } = req.body;

    if (!order_id || !status) {
      return res.status(400).json({ message: "order_id and status required" });
    }

    const validStatus = ["pending", "shipped", "delivered", "cancelled"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // 🔍 Find order
    const order = await Order.findById(order_id);

    if (!order) {
      return res.json({ message: "Order not found" });
    }

    // ✏️ Update status
    order.status = status;
    await order.save();

    return res.json({
      message: "Order status updated successfully",
      order_id,
      status
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;