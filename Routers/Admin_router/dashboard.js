const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/adminauth");

const User = require("../../models/User");
const Product = require("../../models/Product");
const Order = require("../../models/Order");

// ADMIN DASHBOARD
router.get("/dashboard", jwt, async (req, res) => {
  try {
    // 👥 Total customers
    const totalCustomers = await User.countDocuments({ role: "customer" });

    // 📦 Total products
    const totalProducts = await Product.countDocuments();

    // 🧾 Total orders
    const totalOrders = await Order.countDocuments();

    // 💰 Total revenue (exclude cancelled)
    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // ❌ Out of stock
    const outOfStock = await Product.countDocuments({ stock: { $lte: 0 } });

    // ⚠️ Low stock (1–9)
    const lowStock = await Product.countDocuments({ stock: { $gte: 1, $lt: 10 } });

    // 📅 Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });

    // 📋 Inventory list
    const products = await Product.find({}, "name category stock price");
    const inventory = products.map(p => ({
      id:       p._id,
      name:     p.name,
      category: p.category || "Uncategorized",
      stock:    p.stock ?? 0,
      price:    p.price ?? 0,
      status:
        (p.stock ?? 0) <= 0  ? "out" :
        (p.stock ?? 0) < 10  ? "low" : "ok"
    }));

    return res.json({
      totalCustomers,
      totalProducts,
      totalOrders,
      totalRevenue,
      outOfStock,
      lowStock,
      todayOrders,
      inventory,

      // backward compatibility
      total_users:     totalCustomers,
      total_products:  totalProducts,
      total_orders:    totalOrders,
      out_of_stock:    outOfStock,
      today_orders:    todayOrders
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;