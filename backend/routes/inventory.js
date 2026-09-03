const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { InventoryItem, Transaction } = require("../models");

const EMOJI = { mobiles: "📱", headsets: "🎧", accessories: "🔌" };
const PREFIX = { mobiles: "MOB", headsets: "HEAD", accessories: "ACC" };

// GET all inventory (with optional filter)
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }
    const items = await InventoryItem.find(query).sort({ category: 1, name: 1 });
    res.json({ items, total: items.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET inventory summary
router.get("/summary", async (req, res) => {
  try {
    const all = await InventoryItem.find();
    const cats = ["mobiles", "headsets", "accessories"];
    const summary = {};
    for (const cat of cats) {
      const catItems = all.filter((i) => i.category === cat);
      summary[cat] = {
        count: catItems.length,
        totalStock: catItems.reduce((s, i) => s + i.stock, 0),
        totalValue: catItems.reduce((s, i) => s + i.price * i.stock, 0),
        lowStock: catItems.filter((i) => i.stock <= i.minStock).length,
      };
    }
    res.json(summary);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET single item
router.get("/:id", async (req, res) => {
  try {
    const item = await InventoryItem.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST add new product
router.post("/", async (req, res) => {
  try {
    const { name, brand, category, price, stock, minStock, specs, code } = req.body;
    if (!name || !brand || !category || !price || stock === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!["mobiles", "headsets", "accessories"].includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    // Generate ID safely by finding highest existing number
    const itemsInCat = await InventoryItem.find({ category }).select("id");
    let maxNum = 0;
    const prefix = PREFIX[category];
    for (const it of itemsInCat) {
      if (it.id && it.id.startsWith(prefix)) {
        const num = parseInt(it.id.replace(prefix, ""), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    }
    const newId = `${prefix}${String(maxNum + 1).padStart(3, "0")}`;

    const newItem = await InventoryItem.create({
      id: newId, name, brand, category,
      price: Number(price),
      stock: Number(stock),
      minStock: Number(minStock) || 3,
      image: EMOJI[category],
      specs: specs || "",
      code: code || "",
    });

    await Transaction.create({
      id: uuidv4(), type: "stock_added",
      itemId: newId, itemName: name, category,
      quantity: Number(stock),
      note: "New product added",
    });

    res.status(201).json({ message: "Product added successfully", item: newItem });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update product
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.category && EMOJI[updateData.category]) {
      updateData.image = EMOJI[updateData.category];
    }
    const item = await InventoryItem.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Product updated successfully", item });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH restock
router.patch("/:id/restock", async (req, res) => {
  try {
    const { quantity, note } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be positive" });
    }
    const item = await InventoryItem.findOneAndUpdate(
      { id: req.params.id },
      { $inc: { stock: Number(quantity) } },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: "Item not found" });

    await Transaction.create({
      id: uuidv4(), type: "restock",
      itemId: item.id, itemName: item.name, category: item.category,
      quantity: Number(quantity),
      note: note || "Manual restock",
    });

    res.json({ message: "Stock updated", item });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const item = await InventoryItem.findOneAndDelete({ id: req.params.id });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
