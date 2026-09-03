const express = require("express");
const router = express.Router();
const { Bill } = require("../models");

router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const bill = await Bill.findOne({ id: req.params.id });
    if (!bill) return res.status(404).json({ error: "Bill not found" });
    res.json(bill);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const bill = await Bill.findOneAndDelete({
      $or: [{ id: req.params.id }, { billNumber: req.params.id }]
    });
    if (!bill) return res.status(404).json({ error: "Bill not found" });
    res.json({ message: "Bill deleted successfully", id: req.params.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
