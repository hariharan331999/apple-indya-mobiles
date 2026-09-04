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

router.get("/view/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = {
      $or: [
        { billNumber: id },
        { id: id },
      ]
    };
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: id });
    }
    const bill = await Bill.findOne(query);
    if (!bill) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Bill Not Found</title></head>
        <body style="font-family:sans-serif;text-align:center;padding:50px;">
          <h2>Bill not found</h2>
          <p>The requested invoice could not be found.</p>
        </body></html>
      `);
    }

    const hasMobile = bill.items && bill.items.some(i => i.category === 'mobiles');
    const dateStr = new Date(bill.createdAt).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const itemsRows = (bill.items || []).map((item) => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#1d1d1f;">${item.name}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${(item.unitPrice || 0).toLocaleString('en-IN')}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:bold;">₹${(item.total || (item.unitPrice * item.quantity)).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const subtotal = bill.rawSubtotal || bill.subtotal || bill.grandTotal;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apple Indya Mobiles - Invoice ${bill.billNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f5f5f7; color: #1d1d1f; padding: 16px; }
    .invoice-card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e5e7eb; }
    .header-bar { background: #1d1d1f; color: #fff; padding: 24px; text-align: center; }
    .header-bar h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
    .header-bar p { font-size: 12px; color: #a1a1a6; line-height: 1.5; }
    .body-content { padding: 24px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f9fafb; border-radius: 14px; padding: 16px; margin-bottom: 20px; font-size: 13px; }
    .info-label { color: #86868b; font-size: 11px; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
    .info-val { font-weight: 700; color: #1d1d1f; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    th { text-transform: uppercase; font-size: 11px; font-weight: 700; color: #6b7280; padding: 8px; border-bottom: 2px solid #1d1d1f; }
    .summary-box { border-top: 2px solid #1d1d1f; padding-top: 14px; margin-bottom: 20px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
    .grand-total { font-size: 18px; font-weight: 800; color: #0071e3; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 6px; }
    .tax-breakdown { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; font-size: 12px; margin-top: 12px; }
    .btn-bar { display: flex; gap: 10px; padding: 16px 24px; background: #fafafa; border-top: 1px solid #e5e7eb; }
    .btn { flex: 1; padding: 14px; border-radius: 12px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-print { background: #0071e3; color: white; }
    .terms { font-size: 11px; color: #86868b; line-height: 1.6; text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f3f4f6; }
    @media print {
      body { background: #fff; padding: 0; }
      .invoice-card { box-shadow: none; border: none; max-width: 100%; }
      .btn-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header-bar">
      <h1>🍎 APPLE INDYA MOBILES</h1>
      <p>Sales, Service & Accessories</p>
      <p>205, Servaikaran New Street, SHENGOTTAI - 627 809</p>
      <p>Cell: 99441 70066, 98430 68635 | GSTIN: 33AUHPK1750B1ZN</p>
    </div>
    <div class="body-content">
      <div class="info-grid">
        ${hasMobile ? `
          <div><div class="info-label">Bill No</div><div class="info-val">${bill.billNumber}</div></div>
          <div><div class="info-label">Date</div><div class="info-val">${dateStr}</div></div>
          <div><div class="info-label">Customer</div><div class="info-val">${bill.customerName}</div></div>
          <div><div class="info-label">Payment</div><div class="info-val" style="text-transform:capitalize;">${bill.paymentMethod || 'Cash'}</div></div>
          ${bill.customerPhone ? `<div><div class="info-label">Phone</div><div class="info-val">${bill.customerPhone}</div></div>` : ''}
          ${bill.customerGSTIN ? `<div><div class="info-label">GSTIN</div><div class="info-val">${bill.customerGSTIN}</div></div>` : ''}
        ` : `
          <div><div class="info-label">Date</div><div class="info-val">${dateStr}</div></div>
          <div><div class="info-label">Payment</div><div class="info-val" style="text-transform:capitalize;">${bill.paymentMethod || 'Cash'}</div></div>
          ${bill.customerPhone ? `<div><div class="info-label">Mobile Number</div><div class="info-val">${bill.customerPhone}</div></div>` : ''}
          ${bill.customerGSTIN ? `<div><div class="info-label">GSTIN</div><div class="info-val">${bill.customerGSTIN}</div></div>` : ''}
        `}
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align:left;">Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="summary-box">
        <div class="summary-row">
          <span style="color:#6b7280;">Subtotal</span>
          <span style="font-weight:600;">₹${subtotal.toLocaleString('en-IN')}</span>
        </div>
        ${bill.discountAmount > 0 ? `
          <div class="summary-row" style="color:#16a34a;">
            <span>Discount (${bill.discount}%)</span>
            <span>- ₹${bill.discountAmount.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
        <div class="summary-row grand-total">
          <span>GRAND TOTAL</span>
          <span>₹${bill.grandTotal.toLocaleString('en-IN')}</span>
        </div>

        ${bill.gstAmount > 0 ? `
          <div class="tax-breakdown">
            <div style="font-weight:700;display:flex;justify-content:space-between;margin-bottom:4px;">
              <span>GST Included in Price:</span>
              <span>₹${bill.gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style="display:flex;justify-content:space-between;color:#6b7280;margin-bottom:2px;">
              <span>CGST (9%)</span>
              <span>₹${Math.round(bill.gstAmount / 2).toLocaleString('en-IN')}</span>
            </div>
            <div style="display:flex;justify-content:space-between;color:#6b7280;">
              <span>SGST (9%)</span>
              <span>₹${(bill.gstAmount - Math.round(bill.gstAmount / 2)).toLocaleString('en-IN')}</span>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="terms">
        <p style="font-weight:700;font-size:13px;color:#1d1d1f;margin-bottom:8px;">Thank You for Visiting Apple Indya Mobiles! ✨</p>
        ${hasMobile ? `
          <p>1. இங்கு வாங்கும் அனைத்து மொபைல்களுக்கும் ஒரு வருட வாரண்டி உண்டு.</p>
          <p>2. வாரண்டியில் உள்ள மொபைல்களுக்கு அந்தந்த கம்பெனி சர்வீஸ் சென்டரில் சர்வீஸ் செய்து கொள்ளலாம்.</p>
          <p>3. தண்ணீர் பட்டாலோ சேதம் அடைந்தாலோ வாரண்டி பெற இயலாது.</p>
          <p>4. எக்காரணம் கொண்டு மொபைலை மாற்றித்தர இயலாது.</p>
          <p style="color:#8b1836;font-weight:700;">5. பேட்டரி சார்ஜர்களுக்கு ஆறுமாத வாரண்டி மட்டுமே.</p>
        ` : `
          <p style="color:#8b1836;font-weight:700;font-size:12px;">• பேட்டரி சார்ஜர்களுக்கு ஆறுமாத வாரண்டி மட்டுமே.</p>
        `}
      </div>
    </div>

    <div class="btn-bar">
      <button class="btn btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (e) {
    res.status(500).send("Error generating invoice: " + e.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const bill = await Bill.findOne({
      $or: [{ id: req.params.id }, { billNumber: req.params.id }]
    });
    if (!bill) return res.status(404).json({ error: "Bill not found" });
    res.json(bill);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id/cancel", async (req, res) => {
  try {
    const id = req.params.id;
    const query = {
      $or: [{ id: id }, { billNumber: id }]
    };
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: id });
    }
    const bill = await Bill.findOne(query);
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    if (bill.status === "cancelled") {
      return res.status(400).json({ error: "Bill is already cancelled" });
    }

    bill.status = "cancelled";
    await bill.save();

    // Restore stock in Inventory
    const { InventoryItem } = require("../models");
    if (bill.items && bill.items.length > 0) {
      for (const it of bill.items) {
        if (it.category !== "services") {
          await InventoryItem.findOneAndUpdate(
            { $or: [{ id: it.id }, { name: it.name }] },
            { $inc: { stock: it.quantity } }
          ).catch(() => {});
        }
      }
    }

    res.json({ message: "Bill cancelled and products returned to inventory", bill });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /reset-revenue: Wipe all bills and sales transactions from MongoDB
router.post("/reset-revenue", async (req, res) => {
  try {
    const { Transaction } = require("../models");
    const billResult = await Bill.deleteMany({});
    const txResult = await Transaction.deleteMany({ type: "sale" });
    res.json({
      message: "Total revenue and all bills reset to ₹0 in database successfully",
      deletedBills: billResult.deletedCount,
      deletedTransactions: txResult.deletedCount,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /reset-revenue (support DELETE method as well)
router.delete("/reset-revenue", async (req, res) => {
  try {
    const { Transaction } = require("../models");
    const billResult = await Bill.deleteMany({});
    const txResult = await Transaction.deleteMany({ type: "sale" });
    res.json({
      message: "Total revenue and all bills reset to ₹0 in database successfully",
      deletedBills: billResult.deletedCount,
      deletedTransactions: txResult.deletedCount,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /bulk-delete: Delete an array of bills by id/billNumber/_id
router.post("/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids array is required" });
    }
    const { Transaction } = require("../models");
    const objectIds = ids.filter((id) => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/));
    const filter = {
      $or: [
        { id: { $in: ids } },
        { billNumber: { $in: ids } },
        { _id: { $in: objectIds } },
      ],
    };
    const billResult = await Bill.deleteMany(filter);
    await Transaction.deleteMany({
      $or: [{ billId: { $in: ids } }, { billNumber: { $in: ids } }],
    }).catch(() => {});
    res.json({
      message: "Deleted " + billResult.deletedCount + " bills from database successfully",
      deletedCount: billResult.deletedCount,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = {
      $or: [{ id: id }, { billNumber: id }]
    };
    if (id && typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: id });
    }
    const bill = await Bill.findOneAndDelete(query);
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    const { Transaction } = require("../models");
    await Transaction.deleteMany({
      $or: [{ billId: bill.id }, { billId: bill.billNumber }]
    }).catch(() => {});

    res.json({ message: "Bill deleted successfully from database", id: req.params.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

