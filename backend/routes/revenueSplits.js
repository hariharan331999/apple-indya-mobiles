const express = require("express");
const router = express.Router();
const { RevenueSplit } = require("../models");

// GET all revenue splits
router.get("/", async (req, res) => {
  try {
    const splits = await RevenueSplit.find().sort({ createdAt: -1 });
    res.json(splits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create revenue split
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = "split_" + Date.now();
    }
    const split = new RevenueSplit(data);
    await split.save();
    res.status(201).json(split);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE revenue split
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await RevenueSplit.findOneAndDelete({
      $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });
    if (!deleted) return res.status(404).json({ error: "Revenue split not found" });
    res.json({ message: "Revenue split deleted successfully", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
