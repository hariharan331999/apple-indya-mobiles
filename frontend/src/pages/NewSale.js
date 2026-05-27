import React, { useEffect, useState } from 'react';
import { inventoryAPI, salesAPI } from '../api';
import toast from 'react-hot-toast';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

function BillPrintView({ bill, onClose }) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Bill content */}
        <div id="bill-print" className="p-8">
          {/* Header */}
          <div className="text-center mb-6 border-b-2 border-[#1d1d1f] pb-6">
            <div className="text-4xl mb-2">🍎</div>
            <h1 className="text-2xl font-bold text-[#1d1d1f]">{bill.storeName}</h1>
            <p className="text-sm text-[#86868b]">{bill.storeAddress}</p>
            <p className="text-sm text-[#86868b]">📞 {bill.storePhone}</p>
            <p className="text-xs text-[#86868b] mt-1">GST: {bill.storeGST}</p>
          </div>

          {/* Bill info */}
          <div className="grid grid-cols-2 gap-4 mb-6 bg-[#f5f5f7] rounded-xl p-4">
            <div>
              <p className="text-xs text-[#86868b] font-medium">Bill No.</p>
              <p className="text-sm font-bold text-[#1d1d1f] truncate">{bill.billNumber}</p>
            </div>
            <div>
              <p className="text-xs text-[#86868b] font-medium">Date</p>
              <p className="text-sm font-bold text-[#1d1d1f]">
                {new Date(bill.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#86868b] font-medium">Customer</p>
              <p className="text-sm font-bold text-[#1d1d1f]">{bill.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-[#86868b] font-medium">Payment</p>
              <p className="text-sm font-bold text-[#1d1d1f] capitalize">{bill.paymentMethod}</p>
            </div>
            {bill.customerPhone && (
              <div>
                <p className="text-xs text-[#86868b] font-medium">Phone</p>
                <p className="text-sm font-bold text-[#1d1d1f]">{bill.customerPhone}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b-2 border-[#1d1d1f]">
                <th className="text-left text-xs font-bold text-[#1d1d1f] uppercase py-2">Item</th>
                <th className="text-center text-xs font-bold text-[#1d1d1f] uppercase py-2">Qty</th>
                <th className="text-right text-xs font-bold text-[#1d1d1f] uppercase py-2">Price</th>
                <th className="text-right text-xs font-bold text-[#1d1d1f] uppercase py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3">
                    <p className="text-sm font-medium text-[#1d1d1f]">{item.name}</p>
                    <p className="text-xs text-[#86868b]">{item.brand}</p>
                  </td>
                  <td className="text-center text-sm py-3">{item.quantity}</td>
                  <td className="text-right text-sm py-3">{fmt(item.unitPrice)}</td>
                  <td className="text-right text-sm font-semibold py-3">{fmt(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t-2 border-[#1d1d1f] pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#86868b]">Subtotal</span>
              <span className="font-medium">{fmt(bill.subtotal)}</span>
            </div>
            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Discount ({bill.discount}%)</span>
                <span className="text-green-600 font-medium">- {fmt(bill.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[#86868b]">GST (18%)</span>
              <span className="font-medium">{fmt(bill.gstAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#1d1d1f]">
              <span>GRAND TOTAL</span>
              <span className="text-[#0071e3]">{fmt(bill.grandTotal)}</span>
            </div>
          </div>

          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-[#86868b]">Thank you for shopping with us!</p>
            <p className="text-xs text-[#86868b] mt-1">🍎 Apple Indya Mobiles — Your Apple Authorised Partner</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 pb-6 flex gap-3 no-print">
          <button onClick={onClose} className="btn-secondary flex-1">Close</button>
          <button onClick={handlePrint} className="btn-primary flex-1">🖨️ Print Bill</button>
        </div>
      </div>
    </div>
  );
}

export default function NewSale() {
  const [allItems, setAllItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [bill, setBill] = useState(null);

  useEffect(() => {
    inventoryAPI.getAll()
      .then((r) => setAllItems(r.data.items))
      .finally(() => setLoading(false));
  }, []);

  const filtered = allItems.filter((item) => {
    const matchCat = category === 'all' || item.category === category;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && item.stock > 0;
  });

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        if (existing.qty >= item.stock) { toast.error('Not enough stock!'); return prev; }
        return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    const item = allItems.find((i) => i.id === id);
    if (qty > item.stock) { toast.error('Not enough stock!'); return; }
    if (qty <= 0) { setCart((p) => p.filter((c) => c.id !== id)); return; }
    setCart((p) => p.map((c) => c.id === id ? { ...c, qty } : c));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = Math.round((subtotal * discount) / 100);
  const gstAmt = Math.round((subtotal - discountAmt) * 0.18);
  const grandTotal = subtotal - discountAmt + gstAmt;

  const handleSale = async () => {
    if (!customer.name) { toast.error('Enter customer name'); return; }
    if (cart.length === 0) { toast.error('Add items to cart'); return; }
    setProcessing(true);
    try {
      const res = await salesAPI.createSale({
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        paymentMethod,
        discount: Number(discount),
        items: cart.map((c) => ({ itemId: c.id, quantity: c.qty })),
      });
      setBill(res.data.bill);
      setCart([]);
      setCustomer({ name: '', phone: '', email: '' });
      setDiscount(0);
      toast.success('Sale completed! 🎉');
      // Refresh inventory
      inventoryAPI.getAll().then((r) => setAllItems(r.data.items));
    } catch (e) {
      toast.error(e.response?.data?.error || 'Sale failed');
    } finally {
      setProcessing(false);
    }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">New Sale</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Product picker */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filters */}
          <div className="card p-4 space-y-3">
            <input
              className="input-field"
              placeholder="🔍  Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              {['all', 'mobiles', 'headsets', 'accessories'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                    category === c ? 'bg-[#0071e3] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filtered.map((item) => {
                const inCart = cart.find((c) => c.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className={`card p-4 cursor-pointer hover:shadow-md transition-all ${
                      inCart ? 'ring-2 ring-[#0071e3]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.image}</span>
                        <div>
                          <p className="font-semibold text-[#1d1d1f] text-sm">{item.name}</p>
                          <p className="text-xs text-[#86868b]">{item.brand}</p>
                        </div>
                      </div>
                      {inCart && (
                        <span className="bg-[#0071e3] text-white text-xs font-bold px-2 py-1 rounded-full">
                          ×{inCart.qty}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-[#0071e3] text-sm">{fmt(item.price)}</span>
                      <span className="text-xs text-[#86868b]">{item.stock} in stock</span>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-2 text-center py-12 text-[#86868b]">
                  <p className="text-4xl mb-2">📭</p>
                  <p>No products available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart + Customer */}
        <div className="space-y-4">
          {/* Customer details */}
          <div className="card p-5">
            <h3 className="font-bold text-[#1d1d1f] mb-4">Customer Details</h3>
            <div className="space-y-3">
              <input
                className="input-field"
                placeholder="Customer Name *"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Phone Number"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Email (optional)"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />
            </div>
          </div>

          {/* Cart */}
          <div className="card p-5">
            <h3 className="font-bold text-[#1d1d1f] mb-4">Cart {cart.length > 0 && `(${cart.length})`}</h3>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-[#86868b]">
                <p className="text-3xl mb-2">🛒</p>
                <p className="text-sm">Click products to add</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-xl">{item.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1d1d1f] truncate">{item.name}</p>
                      <p className="text-xs text-[#86868b]">{fmt(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-6 h-6 bg-gray-100 rounded-md text-sm font-bold hover:bg-gray-200 flex items-center justify-center"
                      >−</button>
                      <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-6 h-6 bg-gray-100 rounded-md text-sm font-bold hover:bg-gray-200 flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment & Total */}
          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-[#1d1d1f]">Payment</h3>
            <div className="grid grid-cols-3 gap-2">
              {['cash', 'card', 'upi'].map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                    paymentMethod === m ? 'bg-[#0071e3] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'
                  }`}
                >
                  {m === 'cash' ? '💵' : m === 'card' ? '💳' : '📲'} {m}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">Discount (%)</label>
              <input
                className="input-field"
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
              />
            </div>

            {/* Bill summary */}
            {cart.length > 0 && (
              <div className="bg-[#f5f5f7] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#86868b]">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>- {fmt(discountAmt)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#86868b]">
                  <span>GST (18%)</span>
                  <span>{fmt(gstAmt)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#1d1d1f] text-base pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-[#0071e3]">{fmt(grandTotal)}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSale}
              disabled={processing || cart.length === 0 || !customer.name}
              className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : '🧾 Complete Sale & Print Bill'}
            </button>
          </div>
        </div>
      </div>

      {bill && <BillPrintView bill={bill} onClose={() => setBill(null)} />}
    </div>
  );
}
