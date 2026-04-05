const express = require("express");
const router = express.Router();
const jwt = require("../../middleware/adminauth");
const upload = require("../../middleware/upload");

const Product = require("../../models/Product");

// UPDATE PRODUCT - WITH DISCOUNT FIX
router.patch("/update", jwt, upload.array("mediaFiles", 6), async (req, res) => {
  try {
    const { id, name, price, stock, image, description, category, mediaUrls, discount } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ── Media handling ─────────────────────────────────────────────
    let existingMedia = Array.isArray(product.media) ? product.media : [];
    if (existingMedia.length === 0 && product.image) {
      existingMedia = [{ type: "image", url: product.image }];
    }

    const BASE = (process.env.BASE_URL || "http://localhost:4000").replace(/\/$/, "");

    const uploadedMedia = Array.isArray(req.files)
      ? req.files.map(file => ({
          type: file.mimetype.startsWith("video/") ? "video" : "image",
          url: `${BASE}/uploads/${file.filename}`
        }))
      : [];

    const parsedMediaUrls = mediaUrls
      ? String(mediaUrls)
          .split("\n")
          .map(url => url.trim())
          .filter(Boolean)
          .map(url => ({
            type: /\.(mp4|webm|ogg|mov)$/i.test(url) ? "video" : "image",
            url
          }))
      : null;

    const finalMedia =
      uploadedMedia.length > 0 || parsedMediaUrls !== null
        ? [...(parsedMediaUrls || existingMedia), ...uploadedMedia]
        : existingMedia;

    const finalImage = finalMedia[0]?.url || image || product.image;

    // ── Discount handling ───────────────────────────────────────────
    let parsedDiscount = product.discount;
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

    // ── Update fields ───────────────────────────────────────────────
    product.name        = name        || product.name;
    product.price       = price       !== undefined ? Number(price) : product.price;
    product.stock       = stock       !== undefined ? Number(stock) : product.stock;
    product.image       = finalImage;
    product.media       = finalMedia;
    product.description = description || product.description;
    product.category    = category    || product.category;
    product.discount    = parsedDiscount;

    await product.save();

    return res.json({
      message: "Product updated successfully",
      updatedId: product._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;