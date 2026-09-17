const mongoose = require("mongoose");

// Inventory Item Schema
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

// Bill Schema
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
  customerGSTIN: { type: String, default: "" },
  includeGST: { type: Boolean, default: false },
});

// Transaction Schema
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

// Supplier Purchase / Due Schema
const supplierPurchaseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  supplierName: { type: String, required: true },
  phone: { type: String, default: "" },
  description: { type: String, default: "" },
  invoiceRef: { type: String, default: "" },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  status: { type: String, default: "pending" },
  date: { type: String, default: () => new Date().toISOString().split("T")[0] },
  notes: { type: String, default: "" },
  payments: [
    {
      id: String,
      amount: Number,
      date: String,
      mode: { type: String, default: "Cash" },
      note: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

// Revenue Split Schema
const revenueSplitSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  revenueSource: { type: String, default: "today_profit" },
  baseAmount: { type: Number, required: true },
  supplierPaid: { type: Number, default: 0 },
  shopBuffer: { type: Number, default: 500 },
  homeAmount: { type: Number, required: true },
  notes: { type: String, default: "" },
}, { timestamps: true });

const InventoryItem = mongoose.model("InventoryItem", inventorySchema);
const Bill = mongoose.model("Bill", billSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const SupplierPurchase = mongoose.model("SupplierPurchase", supplierPurchaseSchema);
const RevenueSplit = mongoose.model("RevenueSplit", revenueSplitSchema);

module.exports = { InventoryItem, Bill, Transaction, SupplierPurchase, RevenueSplit };
