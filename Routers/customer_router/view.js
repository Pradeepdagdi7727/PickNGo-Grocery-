const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/customerauth");

const Cart = require("../../models/Cart");

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

// Helper function to get discounted price
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

// VIEW CART - WITH DISCOUNTS
router.get("/cart", jwt, async (req, res) => {
  try {
    const user_id = req.user.id;

    // 🛒 Find cart + populate products
    const cart = await Cart.findOne({ userId: user_id })
      .populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.json({
        message: "Cart is empty",
        cart: [],
        totalAmount: 0,
        totalSavings: 0
      });
    }

    let totalAmount = 0;
    let totalOriginalAmount = 0;

    // 🔄 Format response with discount calculations
    const cartItems = cart.items.map(item => {
      const product = item.productId;
      
      if (!product) return null;
      
      // Calculate discounted price if applicable
      const discountedPrice = getDiscountedPrice(product);
      const originalPrice = product.price;
      const hasDiscount = discountedPrice < originalPrice;
      const savings = hasDiscount ? (originalPrice - discountedPrice) * item.quantity : 0;
      
      // Add to totals
      totalAmount += discountedPrice * item.quantity;
      totalOriginalAmount += originalPrice * item.quantity;
      
      return {
        product_id: product._id,
        name: product.name,
        description: product.description,
        image: product.image,
        category: product.category,
        original_price: originalPrice,
        discounted_price: hasDiscount ? discountedPrice : null,
        price: discountedPrice, // Current price to pay
        quantity: item.quantity,
        total_price: discountedPrice * item.quantity,
        total_original_price: originalPrice * item.quantity,
        has_discount: hasDiscount,
        discount_percentage: hasDiscount && product.discount?.type === 'percentage' 
          ? product.discount.value 
          : hasDiscount && originalPrice > 0 
          ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
          : 0,
        stock: product.stock,
        inStock: product.stock >= item.quantity
      };
    }).filter(item => item !== null);

    const totalSavings = totalOriginalAmount - totalAmount;

    return res.json({
      message: "Cart items fetched successfully",
      cart: cartItems,
      summary: {
        totalItems: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: totalAmount,
        totalOriginalAmount: totalOriginalAmount,
        totalSavings: totalSavings,
        savingsPercentage: totalOriginalAmount > 0 ? Math.round((totalSavings / totalOriginalAmount) * 100) : 0
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;