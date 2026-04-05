const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/adminauth");
const Order = require("../../models/Order");

// GET ALL ORDERS (ADMIN)
router.get("/orders", jwt, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "fullname email")
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.json({ message: "No orders found", orders: [] });
    }

    const response = orders.map(order => ({
      order_id: order._id,
      customer_name: order.userId?.fullname,
      customer_email: order.userId?.email,
      shipping_address: order.shippingAddress || "N/A",  // ✅
      phone: order.phone || "N/A",                        // ✅
      notes: order.notes || "",                            // ✅
      total_amount: order.totalAmount,
      status: order.status,
      created_at: order.createdAt,
      items: order.items.map(item => ({
        product_id: item.productId?._id,
        product_name: item.productId?.name,
        quantity: item.quantity,
        price: item.priceAtPurchase || item.productId?.price,
        total_price: item.quantity * (item.priceAtPurchase || item.productId?.price || 0)
      }))
    }));

    return res.json({ orders: response });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE ORDER STATUS (ADMIN)
router.put("/orders/:id", jwt, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "shipped", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.json({ message: `Order #${order._id} updated to ${status}`, order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;