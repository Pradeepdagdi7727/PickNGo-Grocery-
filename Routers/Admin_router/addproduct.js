const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/adminauth");
const upload = require("../../middleware/upload");
const Product = require("../../models/Product");

// ADD PRODUCT - WITH DISCOUNT SUPPORT
router.post("/addproduct", jwt, upload.array("mediaFiles", 6), async (req, res) => {
  try {
    const { name, price, category, stock, image, description, mediaUrls, discount } = req.body;

    const BASE = (process.env.BASE_URL || "http://localhost:4000").replace(/\/$/, "");

    // Uploaded files
    const uploadedMedia = Array.isArray(req.files) && req.files.length > 0
      ? req.files.map(file => ({
          type: file.mimetype.startsWith("video/") ? "video" : "image",
          url: `${BASE}/uploads/${file.filename}`
        }))
      : [];

    // Extra Media URLs
    const parsedMediaUrls = mediaUrls
      ? String(mediaUrls)
          .split("\n")
          .map(url => url.trim())
          .filter(Boolean)
          .map(url => ({
            type: /\.(mp4|webm|ogg|mov)$/i.test(url) ? "video" : "image",
            url
          }))
      : [];

    const allMedia = [...uploadedMedia, ...parsedMediaUrls];
    const finalImage = allMedia[0]?.url || image || "";

    if (!name || price === undefined || !category || stock === undefined || !description) {
      return res.status(400).json({ message: "Fill All Fields" });
    }

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(409).json({ message: "Item Already Exist" });
    }

    // Parse discount
    let parsedDiscount = { type: "none", value: 0, startDate: null, endDate: null };
    if (discount) {
      try {
        const d = typeof discount === "string" ? JSON.parse(discount) : discount;
        parsedDiscount = {
          type: d.type || "none",
          value: d.type !== "none" ? parseFloat(d.value) || 0 : 0,
          startDate: d.startDate ? new Date(d.startDate) : null,
          endDate: d.endDate ? new Date(d.endDate) : null
        };
      } catch (e) {
        console.error("Discount parse error:", e);
      }
    }

    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      category,
      image: finalImage,
      media: allMedia,
      stock: Number(stock),
      discount: parsedDiscount
    });

    await newProduct.save();

    return res.json({
      message: "Product add successful",
      productid: newProduct._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;