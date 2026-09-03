const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { InventoryItem, Bill, Transaction } = require("../models");

// POST process a sale
router.post("/", async (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, customerGSTIN, items, paymentMethod, discount, includeGST } = req.body;

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ error: "Customer name and items are required" });
    }

    // Validate and resolve items
    const resolvedItems = [];
    for (const saleItem of items) {
      const found = await InventoryItem.findOne({ id: saleItem.itemId });
      if (!found) return res.status(404).json({ error: `Item ${saleItem.itemId} not found` });
      if (found.stock < saleItem.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${found.name}. Available: ${found.stock}`,
        });
      }
      resolvedItems.push({ ...found.toObject(), qty: saleItem.quantity });
    }

    // Deduct stock
    for (const ri of resolvedItems) {
      await InventoryItem.findOneAndUpdate(
        { id: ri.id },
        { $inc: { stock: -ri.qty } }
      );
    }

    // Generate bill with compulsory 18% inclusive GST for Mobiles, and optional GST for other categories
    const rawSubtotal = resolvedItems.reduce((s, i) => s + i.price * i.qty, 0);
    const discountAmt = discount ? Math.round((rawSubtotal * discount) / 100) : 0;
    const finalPayable = Math.max(0, rawSubtotal - discountAmt);
    const discountRatio = rawSubtotal > 0 ? (finalPayable / rawSubtotal) : 1;

    let totalTaxable = 0;
    let totalGSTAmt = 0;

    for (const item of resolvedItems) {
      const itemNet = (item.price * item.qty) * discountRatio;
      const isMobile = item.category === 'mobiles';
      // Mobiles ALWAYS have 18% inclusive GST. Other items have GST only if includeGST is true.
      if (isMobile || includeGST) {
        const itemTaxable = Math.round(itemNet / 1.18);
        const itemGST = itemNet - itemTaxable;
        totalTaxable += itemTaxable;
        totalGSTAmt += itemGST;
      } else {
        totalTaxable += itemNet;
      }
    }

    const taxableSubtotal = Math.round(totalTaxable);
    const gstAmt = Math.round(totalGSTAmt);
    const grandTotal = finalPayable;
    const billId = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const bill = await Bill.create({
      id: billId,
      billNumber: billId,
      customerName,
      customerPhone: customerPhone || "",
      customerEmail: customerEmail || "",
      customerGSTIN: customerGSTIN || "",
      includeGST: !!includeGST || resolvedItems.some(i => i.category === 'mobiles'),
      items: resolvedItems.map((i) => ({
        id: i.id, name: i.name, brand: i.brand,
        category: i.category, quantity: i.qty,
        unitPrice: i.price, total: i.price * i.qty,
      })),
      subtotal: taxableSubtotal,
      discount: discount || 0,
      discountAmount: discountAmt,
      gst: gstRate,
      gstAmount: gstAmt,
      grandTotal,
      paymentMethod: paymentMethod || "cash",
      status: "completed",
      storeName: "APPLE INDYA MOBILES",
      storeAddress: "No. 12, Main Bazaar, Trichy - 620001",
      storePhone: "+91 98765 43210",
      storeGST: "33AABCI1234M1ZX",
    });

    // Log transactions
    for (const ri of resolvedItems) {
      await Transaction.create({
        id: uuidv4(), type: "sale",
        itemId: ri.id, itemName: ri.name, category: ri.category,
        quantity: ri.qty, salePrice: ri.price, total: ri.price * ri.qty,
        billId, customerName,
      });
    }

    res.status(201).json({ message: "Sale completed", bill });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET all transactions
router.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ timestamp: -1 }).limit(200);
    res.json(transactions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
