require("dotenv").config();
const mongoose = require("mongoose");
const { InventoryItem } = require("./models");

const seedData = [
  // Mobiles
  { id: "MOB001", name: "iPhone 15 Pro Max", brand: "Apple", category: "mobiles", price: 134900, stock: 10, minStock: 3, image: "📱", specs: "256GB, Titanium, A17 Pro" },
  { id: "MOB002", name: "iPhone 15 Pro", brand: "Apple", category: "mobiles", price: 119900, stock: 8, minStock: 3, image: "📱", specs: "128GB, Titanium, A17 Pro" },
  { id: "MOB003", name: "iPhone 15", brand: "Apple", category: "mobiles", price: 79900, stock: 15, minStock: 5, image: "📱", specs: "128GB, Pink, A16 Bionic" },
  { id: "MOB004", name: "iPhone 14", brand: "Apple", category: "mobiles", price: 64900, stock: 6, minStock: 3, image: "📱", specs: "128GB, Midnight, A15 Bionic" },
  { id: "MOB005", name: "Samsung Galaxy S24 Ultra", brand: "Samsung", category: "mobiles", price: 129999, stock: 7, minStock: 3, image: "📱", specs: "256GB, Titanium Black, Snapdragon 8 Gen 3" },
  // Headsets
  { id: "HEAD001", name: "AirPods Pro (2nd Gen)", brand: "Apple", category: "headsets", price: 26900, stock: 20, minStock: 5, image: "🎧", specs: "ANC, MagSafe, USB-C" },
  { id: "HEAD002", name: "AirPods (3rd Gen)", brand: "Apple", category: "headsets", price: 19900, stock: 15, minStock: 5, image: "🎧", specs: "Spatial Audio, Lightning" },
  { id: "HEAD003", name: "AirPods Max", brand: "Apple", category: "headsets", price: 59900, stock: 4, minStock: 2, image: "🎧", specs: "Over-ear, ANC, 20hr battery" },
  { id: "HEAD004", name: "Samsung Galaxy Buds2 Pro", brand: "Samsung", category: "headsets", price: 17999, stock: 12, minStock: 4, image: "🎧", specs: "ANC, 360 Audio, IPX7" },
  // Accessories
  { id: "ACC001", name: "Apple MagSafe Charger", brand: "Apple", category: "accessories", price: 3900, stock: 30, minStock: 10, image: "🔌", specs: "15W, USB-C, 1m cable" },
  { id: "ACC002", name: "Apple 20W USB-C Adapter", brand: "Apple", category: "accessories", price: 1900, stock: 25, minStock: 10, image: "🔌", specs: "Fast Charge, USB-C" },
  { id: "ACC003", name: "Apple Lightning to USB-C Cable", brand: "Apple", category: "accessories", price: 1900, stock: 40, minStock: 15, image: "🔌", specs: "1m, Woven" },
  { id: "ACC004", name: "iPhone 15 Clear Case", brand: "Apple", category: "accessories", price: 3900, stock: 18, minStock: 5, image: "📦", specs: "MagSafe Compatible, Transparent" },
  { id: "ACC005", name: "Apple Watch Series 9", brand: "Apple", category: "accessories", price: 41900, stock: 9, minStock: 3, image: "⌚", specs: "45mm, GPS, Midnight Aluminum" },
  { id: "ACC006", name: "Samsung 25W Fast Charger", brand: "Samsung", category: "accessories", price: 1299, stock: 22, minStock: 8, image: "🔌", specs: "25W, USB-C, PD 3.0" },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // Upsert each item (insert if not exists)
  let added = 0, skipped = 0;
  for (const item of seedData) {
    const exists = await InventoryItem.findOne({ id: item.id });
    if (!exists) {
      await InventoryItem.create(item);
      added++;
    } else {
      skipped++;
    }
  }
  console.log(`✅ Seed complete: ${added} added, ${skipped} skipped`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
