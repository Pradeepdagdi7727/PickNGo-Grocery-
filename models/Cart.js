const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
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
  // Store price at add time to handle discount changes
  priceAtAdd: {
    type: Number,
    required: true,
    default: 0
  },
  // Store product snapshot to preserve discount info
  productSnapshot: {
    name: String,
    originalPrice: Number,
    discountedPrice: Number,
    discountType: {
      type: String,
      enum: ['none', 'percentage', 'fixed']
    },
    discountValue: Number,
    image: String,
    category: String
  }
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true   // ✅ ek user ka ek hi cart
  },
  items: [cartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);