const express = require("express");
const router = express.Router();
const { InventoryItem, Bill, Transaction } = require("../models");

router.get("/", async (req, res) => {
  try {
    const [allItems, bills, transactions] = await Promise.all([
      InventoryItem.find(),
      Bill.find().sort({ createdAt: -1 }),
      Transaction.find().sort({ timestamp: -1 }),
    ]);

    const totalInventoryValue = allItems.reduce((s, i) => s + i.price * i.stock, 0);
    const lowStockItems = allItems.filter((i) => i.stock <= i.minStock);
    const outOfStock = allItems.filter((i) => i.stock === 0);

    const today = new Date().toDateString();
    const todayBills = bills.filter((b) => new Date(b.createdAt).toDateString() === today);
    const todayRevenue = todayBills.reduce((s, b) => s + b.grandTotal, 0);
    const totalRevenue = bills.reduce((s, b) => s + b.grandTotal, 0);

    // Top selling
    const salesMap = {};
    transactions
      .filter((t) => t.type === "sale")
      .forEach((t) => {
        if (!salesMap[t.itemId]) salesMap[t.itemId] = { name: t.itemName, qty: 0, revenue: 0 };
        salesMap[t.itemId].qty += t.quantity;
        salesMap[t.itemId].revenue += t.total || 0;
      });

    const topSelling = Object.entries(salesMap)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }));

    res.json({
      totalProducts: allItems.length,
      totalInventoryValue,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStock.length,
      todayRevenue,
      totalRevenue,
      totalSales: bills.length,
      todaySales: todayBills.length,
      lowStockItems: lowStockItems.slice(0, 5),
      recentTransactions: transactions.slice(0, 10),
      topSelling,
      categoryBreakdown: {
        mobiles: allItems.filter((i) => i.category === "mobiles").length,
        headsets: allItems.filter((i) => i.category === "headsets").length,
        accessories: allItems.filter((i) => i.category === "accessories").length,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
