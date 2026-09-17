const express = require("express");
const router = express.Router();
const { SupplierPurchase } = require("../models");

// GET all supplier purchases
router.get("/", async (req, res) => {
  try {
    const suppliers = await SupplierPurchase.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single supplier purchase
router.get("/:id", async (req, res) => {
  try {
    const supplier = await SupplierPurchase.findOne({
      $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create supplier purchase
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = "sup_" + Date.now();
    }
    const totalAmount = Number(data.totalAmount) || 0;
    const paidAmount = Number(data.paidAmount) || 0;
    const balanceAmount = Math.max(0, totalAmount - paidAmount);
    data.totalAmount = totalAmount;
    data.paidAmount = paidAmount;
    data.balanceAmount = balanceAmount;
    data.status = balanceAmount === 0 ? "cleared" : paidAmount > 0 ? "partial" : "pending";

    const supplier = new SupplierPurchase(data);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update supplier purchase (details or payment update)
router.put("/:id", async (req, res) => {
  try {
    const data = req.body;
    let supplier = await SupplierPurchase.findOne({
      $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });

    if (!supplier) {
      // If not found, create new with this ID
      data.id = data.id || req.params.id;
      supplier = new SupplierPurchase(data);
      await supplier.save();
      return res.json(supplier);
    }

    // Update fields
    if (data.supplierName !== undefined) supplier.supplierName = data.supplierName;
    if (data.phone !== undefined) supplier.phone = data.phone;
    if (data.description !== undefined) supplier.description = data.description;
    if (data.invoiceRef !== undefined) supplier.invoiceRef = data.invoiceRef;
    if (data.date !== undefined) supplier.date = data.date;
    if (data.notes !== undefined) supplier.notes = data.notes;
    if (data.totalAmount !== undefined) supplier.totalAmount = Number(data.totalAmount);
    if (data.paidAmount !== undefined) supplier.paidAmount = Number(data.paidAmount);
    if (data.payments !== undefined && Array.isArray(data.payments)) supplier.payments = data.payments;

    const tot = Number(supplier.totalAmount) || 0;
    const pd = Number(supplier.paidAmount) || 0;
    supplier.balanceAmount = Math.max(0, tot - pd);
    supplier.status = supplier.balanceAmount === 0 ? "cleared" : pd > 0 ? "partial" : "pending";

    await supplier.save();
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supplier purchase
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await SupplierPurchase.findOneAndDelete({
      $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });
    if (!deleted) return res.status(404).json({ error: "Supplier not found" });
    res.json({ message: "Supplier deleted successfully", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE single payment from supplier payments array
router.delete("/:id/payments/:paymentId", async (req, res) => {
  try {
    const supplier = await SupplierPurchase.findOne({
      $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    });
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });

    const paymentToRemove = (supplier.payments || []).find(p => p.id === req.params.paymentId);
    if (!paymentToRemove) return res.status(404).json({ error: "Payment record not found" });

    supplier.payments = supplier.payments.filter(p => p.id !== req.params.paymentId);
    supplier.paidAmount = Math.max(0, (supplier.paidAmount || 0) - (Number(paymentToRemove.amount) || 0));
    supplier.balanceAmount = Math.max(0, (supplier.totalAmount || 0) - supplier.paidAmount);
    supplier.status = supplier.balanceAmount === 0 ? "cleared" : supplier.paidAmount > 0 ? "partial" : "pending";

    await supplier.save();
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
