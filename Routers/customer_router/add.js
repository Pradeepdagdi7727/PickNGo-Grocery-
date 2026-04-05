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

// ADD TO CART
router.post("/addcart", jwt, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    if (!product_id || !quantity) {
      return res.status(400).json({ message: "Product ID and Quantity required" });
    }

    // 🔍 Check product with discount info
    const product = await Product.findById(product_id);

    if (!product) {
      return res.json({ message: "Product not found" });
    }

    // 📦 Stock check
    if (product.stock < quantity) {
      return res.json({ message: "Not enough stock" });
    }

    // 🛒 Find cart
    let cart = await Cart.findOne({ userId: user_id });

    // Calculate current price with discount
    const currentPrice = isDiscountActive(product.discount) 
      ? (product.discount.type === 'percentage' 
        ? product.price * (1 - product.discount.value / 100)
        : product.price - product.discount.value)
      : product.price;

    if (!cart) {
      // create new cart
      cart = new Cart({
        userId: user_id,
        items: [{ 
          productId: product_id, 
          quantity,
          priceAtAdd: currentPrice,
          productDetails: {
            name: product.name,
            originalPrice: product.price,
            discount: product.discount
          }
        }]
      });
    } else {
      // check existing item
      const index = cart.items.findIndex(
        item => item.productId.toString() === product_id
      );

      if (index > -1) {
        cart.items[index].quantity += Number(quantity);
        cart.items[index].priceAtAdd = currentPrice; // Update price in case discount changed
      } else {
        cart.items.push({ 
          productId: product_id, 
          quantity,
          priceAtAdd: currentPrice,
          productDetails: {
            name: product.name,
            originalPrice: product.price,
            discount: product.discount
          }
        });
      }
    }

    await cart.save();

    return res.json({
      message: "Cart updated successfully",
      cart
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;