import React, { useEffect, useState } from 'react';
import { salesAPI } from '../api';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const TYPE_LABELS = {
  sale: { label: 'Sale', color: 'bg-green-100 text-green-800', icon: '💸' },
  restock: { label: 'Restock', color: 'bg-blue-100 text-blue-800', icon: '📥' },
  stock_added: { label: 'New Product', color: 'bg-purple-100 text-purple-800', icon: '➕' },
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    salesAPI.getTransactions()
      .then((r) => setTransactions(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter((t) => {
    const matchType = filter === 'all' || t.type === filter;
    const matchSearch = !search || t.itemName.toLowerCase().includes(search.toLowerCase()) || (t.customerName || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1d1d1f]">Transactions</h1>
        <p className="text-sm text-[#86868b]">{transactions.length} total records</p>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All' },
            { value: 'sale', label: '💸 Sales' },
            { value: 'restock', label: '📥 Restocks' },
            { value: 'stock_added', label: '➕ Added' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.value ? 'bg-[#0071e3] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="input-field flex-1 max-w-xs"
          placeholder="🔍  Search..."
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
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f5f5f7] border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-6 py-4">Type</th>
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-4">Product</th>
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-4">Customer / Note</th>
                  <th className="text-center text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-4">Qty</th>
                  <th className="text-right text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-4">Value</th>
                  <th className="text-right text-xs font-semibold text-[#86868b] uppercase tracking-wider px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((tx) => {
                  const typeInfo = TYPE_LABELS[tx.type] || { label: tx.type, color: 'bg-gray-100 text-gray-800', icon: '•' };
                  return (
                    <tr key={tx.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${typeInfo.color}`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-sm text-[#1d1d1f]">{tx.itemName}</p>
                        <p className="text-xs text-[#86868b] capitalize">{tx.category}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-[#86868b]">
                          {tx.customerName || tx.note || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-bold text-sm ${tx.type === 'sale' ? 'text-red-500' : 'text-green-500'}`}>
                          {tx.type === 'sale' ? '-' : '+'}{tx.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {tx.total ? (
                          <span className="font-semibold text-sm text-[#1d1d1f]">{fmt(tx.total)}</span>
                        ) : (
                          <span className="text-[#86868b] text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm text-[#1d1d1f]">{new Date(tx.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        <p className="text-xs text-[#86868b]">{new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
