const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  media: [
    {
      type: { type: String, enum: ['image', 'video'] }, // image / video
      url: { type: String }
    }
  ],
  stock: { type: Number, default: 0 },
  // 🆕 Discount field
  discount: {
    type: {
      type: String,
      enum: ['none', 'percentage', 'fixed'],
      default: 'none'
    },
    value: { type: Number, default: 0 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null }
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model("Product", productSchema);