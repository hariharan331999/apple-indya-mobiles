import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const StatCard = ({ title, value, sub, color, icon, onClick }) => (
  <div
    onClick={onClick}
    className={`card p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold text-[#1d1d1f] mb-1">{value}</div>
    <div className="text-sm font-medium text-[#1d1d1f]">{title}</div>
    {sub && <div className="text-xs text-[#86868b] mt-1">{sub}</div>}
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardAPI.getSummary()
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <div className="text-center text-[#86868b]">Failed to load dashboard</div>;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#1d1d1f] to-[#3d3d3f] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#86868b] text-sm font-medium mb-1">Welcome back</p>
            <h2 className="text-2xl font-bold">APPLE INDYA MOBILES</h2>
            <p className="text-[#86868b] text-sm mt-1">Trichy — Inventory Management System</p>
          </div>
          <div className="text-5xl hidden sm:block">🍎</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={data.totalProducts}
          sub={`M: ${data.categoryBreakdown.mobiles} | H: ${data.categoryBreakdown.headsets} | A: ${data.categoryBreakdown.accessories}`}
          color="bg-blue-50"
          icon="📦"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Inventory Value"
          value={fmt(data.totalInventoryValue)}
          sub="Current stock value"
          color="bg-green-50"
          icon="💰"
        />
        <StatCard
          title="Today's Revenue"
          value={fmt(data.todayRevenue)}
          sub={`${data.todaySales} sale${data.todaySales !== 1 ? 's' : ''} today`}
          color="bg-purple-50"
          icon="📈"
          onClick={() => navigate('/bills')}
        />
        <StatCard
          title="Low Stock Alert"
          value={data.lowStockCount}
          sub={`${data.outOfStockCount} out of stock`}
          color="bg-red-50"
          icon="⚠️"
          onClick={() => navigate('/inventory')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock items */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1d1d1f]">Low Stock Items</h3>
            <span className="badge-red">{data.lowStockCount} items</span>
          </div>
          {data.lowStockItems.length === 0 ? (
            <div className="text-center py-8 text-[#86868b]">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm">All items are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-[#f5f5f7] rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.image}</span>
                    <div>
                      <p className="text-sm font-medium text-[#1d1d1f]">{item.name}</p>
                      <p className="text-xs text-[#86868b]">{item.brand}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${item.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                      {item.stock} left
                    </span>
                    <p className="text-xs text-[#86868b]">min: {item.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top selling */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1d1d1f]">Top Selling Items</h3>
            <span className="badge-blue">All time</span>
          </div>
          {data.topSelling.length === 0 ? (
            <div className="text-center py-8 text-[#86868b]">
              <div className="text-3xl mb-2">🛒</div>
              <p className="text-sm">No sales yet. Start selling!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.topSelling.map((item, i) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-[#f5f5f7] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#0071e3] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium text-[#1d1d1f]">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1d1d1f]">{item.qty} sold</p>
                    <p className="text-xs text-[#86868b]">{fmt(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1d1d1f]">Recent Activity</h3>
          <button
            onClick={() => navigate('/transactions')}
            className="text-sm text-[#0071e3] font-medium hover:underline"
          >
            View all
          </button>
        </div>
        {data.recentTransactions.length === 0 ? (
          <p className="text-sm text-[#86868b] text-center py-6">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {data.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    tx.type === 'sale' ? 'bg-green-100' : tx.type === 'restock' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {tx.type === 'sale' ? '💸' : tx.type === 'restock' ? '📥' : '➕'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1d1d1f]">{tx.itemName}</p>
                    <p className="text-xs text-[#86868b]">
                      {tx.type === 'sale' ? `Sold to ${tx.customerName}` : tx.note}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.type === 'sale' ? 'text-green-600' : 'text-blue-600'}`}>
                    {tx.type === 'sale' ? '-' : '+'}{tx.quantity} units
                  </p>
                  <p className="text-xs text-[#86868b]">
                    {new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
