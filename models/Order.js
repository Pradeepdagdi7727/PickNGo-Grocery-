const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      priceAtPurchase: {
        type: Number,
        default: 0
      },
      originalPrice: {
        type: Number,
        default: 0
      },
      discountApplied: {
        type: Object,
        default: null
      }
    }
  ],

  // ✅ NEW: Shipping info
  shippingAddress: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  notes: {
    type: String,
    default: ""
  },

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);