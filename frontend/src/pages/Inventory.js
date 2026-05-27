import React, { useEffect, useState, useCallback } from 'react';
import { inventoryAPI } from '../api';
import toast from 'react-hot-toast';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const CATEGORIES = [
  { value: 'all', label: 'All', icon: '📦' },
  { value: 'mobiles', label: 'Mobiles', icon: '📱' },
  { value: 'headsets', label: 'Headsets', icon: '🎧' },
  { value: 'accessories', label: 'Accessories', icon: '🔌' },
];

const EMPTY_FORM = { name: '', brand: '', category: 'mobiles', price: '', stock: '', minStock: '3', specs: '' };

function ProductModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(item ? { ...item } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const isEdit = !!item;

  const handleSubmit = async () => {
    if (!form.name || !form.brand || !form.price || !form.stock) {
      toast.error('Fill all required fields');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await inventoryAPI.update(item.id, form);
        toast.success('Product updated!');
      } else {
        await inventoryAPI.create(form);
        toast.success('Product added!');
      }
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1d1d1f]">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#86868b]">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">Name *</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. iPhone 15 Pro" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">Brand *</label>
              <input className="input-field" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Apple" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">Category *</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="mobiles">Mobiles</option>
                <option value="headsets">Headsets</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">Price (₹) *</label>
              <input className="input-field" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">Stock *</label>
              <input className="input-field" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">Min Stock</label>
              <input className="input-field" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} placeholder="3" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">Specs</label>
            <input className="input-field" value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} placeholder="128GB, Black, A17 Pro" />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RestockModal({ item, onClose, onSaved }) {
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!qty || Number(qty) <= 0) { toast.error('Enter valid quantity'); return; }
    setSaving(true);
    try {
      await inventoryAPI.restock(item.id, { quantity: Number(qty), note });
      toast.success(`Stock updated! Added ${qty} units`);
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1d1d1f]">Restock</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#86868b]">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-[#f5f5f7] rounded-xl">
            <p className="font-semibold text-[#1d1d1f]">{item.name}</p>
            <p className="text-sm text-[#86868b]">Current stock: <span className="font-bold text-[#1d1d1f]">{item.stock}</span></p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">Quantity to Add *</label>
            <input className="input-field" type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">Note</label>
            <input className="input-field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note..." />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : 'Add Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [restockItem, setRestockItem] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    inventoryAPI.getAll({ category: category !== 'all' ? category : undefined, search: search || undefined })
      .then((r) => setItems(r.data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await inventoryAPI.delete(item.id);
      toast.success('Product deleted');
      load();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const getStockBadge = (item) => {
    if (item.stock === 0) return <span className="badge-red">Out of Stock</span>;
    if (item.stock <= item.minStock) return <span className="badge-yellow">Low Stock</span>;
    return <span className="badge-green">In Stock</span>;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Inventory</h1>
          <p className="text-sm text-[#86868b]">{items.length} products</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  category === c.value
                    ? 'bg-[#0071e3] text-white'
                    : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          <input
            className="input-field flex-1 max-w-xs"
            placeholder="🔍  Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-[#86868b]">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium">No products found</p>
            <p className="text-sm mt-1">Add products or try a different search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f5f5f7] border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-6 py-4">Product</th>
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-4">Category</th>
                  <th className="text-right text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-4">Price</th>
                  <th className="text-right text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-4">Stock</th>
                  <th className="text-left text-xs font-semibold text-[#86868b] uppercase tracking-wider px-4 py-4">Status</th>
                  <th className="text-right text-xs font-semibold text-[#86868b] uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.image}</span>
                        <div>
                          <p className="font-semibold text-[#1d1d1f] text-sm">{item.name}</p>
                          <p className="text-xs text-[#86868b]">{item.brand} · {item.specs}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="badge-blue capitalize">{item.category}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-semibold text-[#1d1d1f] text-sm">{fmt(item.price)}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-bold text-sm ${
                        item.stock === 0 ? 'text-red-500' : item.stock <= item.minStock ? 'text-orange-500' : 'text-[#1d1d1f]'
                      }`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4">{getStockBadge(item)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRestockItem(item)}
                          className="text-xs bg-blue-50 text-[#0071e3] hover:bg-blue-100 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => setEditItem(item)}
                          className="text-xs bg-gray-100 text-[#1d1d1f] hover:bg-gray-200 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-xs bg-red-50 text-red-500 hover:bg-red-100 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <ProductModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} />}
      {editItem && <ProductModal item={editItem} onClose={() => setEditItem(null)} onSaved={() => { setEditItem(null); load(); }} />}
      {restockItem && <RestockModal item={restockItem} onClose={() => setRestockItem(null)} onSaved={() => { setRestockItem(null); load(); }} />}
    </div>
  );
}
