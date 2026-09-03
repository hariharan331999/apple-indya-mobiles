const mongoose = require("mongoose");

// ── Inventory Item Schema ──────────────────────────────────
const inventorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true, enum: ["mobiles", "headsets", "accessories"] },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  minStock: { type: Number, default: 3 },
  image: { type: String, default: "📦" },
  specs: { type: String, default: "" },
  code: { type: String, default: "" },
}, { timestamps: true });

// ── Bill Schema ────────────────────────────────────────────
const billSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  billNumber: String,
  customerName: { type: String, required: true },
  customerPhone: String,
  customerEmail: String,
  items: [{
    id: String,
    name: String,
    brand: String,
    category: String,
    quantity: Number,
    unitPrice: Number,
    total: Number,
  }],
  subtotal: Number,
  discount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  gst: { type: Number, default: 18 },
  gstAmount: Number,
  grandTotal: Number,
  paymentMethod: { type: String, default: "cash" },
  status: { type: String, default: "completed" },
  createdAt: { type: Date, default: Date.now },
  storeName: String,
  storeAddress: String,
  storePhone: String,
  storeGST: String,
});

// ── Transaction Schema ─────────────────────────────────────
const transactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: ["sale", "restock", "stock_added"] },
  itemId: String,
  itemName: String,
  category: String,
  quantity: Number,
  salePrice: Number,
  total: Number,
  billId: String,
  customerName: String,
  note: String,
  timestamp: { type: Date, default: Date.now },
});

const InventoryItem = mongoose.model("InventoryItem", inventorySchema);
const Bill = mongoose.model("Bill", billSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = { InventoryItem, Bill, Transaction };
