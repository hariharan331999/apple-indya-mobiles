import React, { useEffect, useState } from 'react';
import { billsAPI } from '../api';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

function BillDetailModal({ bill, onClose }) {
  const handlePrint = () => window.print();
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6 border-b-2 border-[#1d1d1f] pb-6">
            <div className="text-4xl mb-2">🍎</div>
            <h1 className="text-2xl font-bold text-[#1d1d1f]">{bill.storeName}</h1>
            <p className="text-sm text-[#86868b]">{bill.storeAddress}</p>
            <p className="text-sm text-[#86868b]">📞 {bill.storePhone}</p>
            <p className="text-xs text-[#86868b] mt-1">GST: {bill.storeGST}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6 bg-[#f5f5f7] rounded-xl p-4">
            <div><p className="text-xs text-[#86868b]">Bill No.</p><p className="text-xs font-bold text-[#1d1d1f] break-all">{bill.billNumber}</p></div>
            <div><p className="text-xs text-[#86868b]">Date</p><p className="text-sm font-bold text-[#1d1d1f]">{new Date(bill.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
            <div><p className="text-xs text-[#86868b]">Customer</p><p className="text-sm font-bold">{bill.customerName}</p></div>
            <div><p className="text-xs text-[#86868b]">Payment</p><p className="text-sm font-bold capitalize">{bill.paymentMethod}</p></div>
            {bill.customerPhone && <div><p className="text-xs text-[#86868b]">Phone</p><p className="text-sm font-bold">{bill.customerPhone}</p></div>}
          </div>
          <table className="w-full mb-4">
            <thead><tr className="border-b-2 border-[#1d1d1f]">
              <th className="text-left text-xs font-bold uppercase py-2">Item</th>
              <th className="text-center text-xs font-bold uppercase py-2">Qty</th>
              <th className="text-right text-xs font-bold uppercase py-2">Price</th>
              <th className="text-right text-xs font-bold uppercase py-2">Total</th>
            </tr></thead>
            <tbody>
              {bill.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3"><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-[#86868b]">{item.brand}</p></td>
                  <td className="text-center text-sm py-3">{item.quantity}</td>
                  <td className="text-right text-sm py-3">{fmt(item.unitPrice)}</td>
                  <td className="text-right text-sm font-semibold py-3">{fmt(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t-2 border-[#1d1d1f] pt-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-[#86868b]">Subtotal</span><span>{fmt(bill.subtotal)}</span></div>
            {bill.discountAmount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount ({bill.discount}%)</span><span>- {fmt(bill.discountAmount)}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-[#86868b]">GST (18%)</span><span>{fmt(bill.gstAmount)}</span></div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#1d1d1f]">
              <span>GRAND TOTAL</span><span className="text-[#0071e3]">{fmt(bill.grandTotal)}</span>
            </div>
          </div>
          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-[#86868b]">Thank you for shopping with us!</p>
          </div>
        </div>
        <div className="px-8 pb-6 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Close</button>
          <button onClick={handlePrint} className="btn-primary flex-1">🖨️ Print</button>
        </div>
      </div>
    </div>
  );
}

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    billsAPI.getAll()
      .then((r) => setBills(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bills.filter((b) =>
    !search || b.customerName.toLowerCase().includes(search.toLowerCase()) || b.billNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = bills.reduce((s, b) => s + b.grandTotal, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Bills</h1>
          <p className="text-sm text-[#86868b]">{bills.length} transactions · Total: {fmt(totalRevenue)}</p>
        </div>
      </div>

      <div className="card p-4">
        <input
          className="input-field max-w-sm"
          placeholder="🔍  Search by customer or bill no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#86868b]">
            <div className="text-4xl mb-3">🧾</div>
            <p className="font-medium">No bills found</p>
            <p className="text-sm mt-1">Complete a sale to generate bills</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f5f5f7] border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-6 py-4">Bill No.</th>
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-4">Customer</th>
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-4">Date</th>
                  <th className="text-center text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-4">Items</th>
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-4">Payment</th>
                  <th className="text-right text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-4">Total</th>
                  <th className="text-right text-xs font-semibold text-[#86868b] uppercase tracking-wider px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((bill) => (
                  <tr key={bill.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-[#0071e3] font-semibold">{bill.billNumber.split('-').slice(0,2).join('-')}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-sm text-[#1d1d1f]">{bill.customerName}</p>
                      {bill.customerPhone && <p className="text-xs text-[#86868b]">{bill.customerPhone}</p>}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-[#1d1d1f]">{new Date(bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      <p className="text-xs text-[#86868b]">{new Date(bill.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="badge-blue">{bill.items.length} item{bill.items.length !== 1 ? 's' : ''}</span>
                    </td>
                    <td className="px-4 py-4 capitalize">
                      <span className="text-sm text-[#86868b]">
                        {bill.paymentMethod === 'cash' ? '💵' : bill.paymentMethod === 'card' ? '💳' : '📲'} {bill.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-[#0071e3] text-sm">{fmt(bill.grandTotal)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelected(bill)}
                        className="text-xs bg-[#0071e3] text-white hover:bg-[#0077ed] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <BillDetailModal bill={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
