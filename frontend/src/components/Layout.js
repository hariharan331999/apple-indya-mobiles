import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { path: '/inventory', label: 'Inventory', icon: '📦' },
  { path: '/new-sale', label: 'New Sale', icon: '🛒' },
  { path: '/bills', label: 'Bills', icon: '🧾' },
  { path: '/transactions', label: 'Transactions', icon: '📋' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1d1d1f] rounded-xl flex items-center justify-center text-white text-lg font-bold">
              
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#1d1d1f] leading-tight">APPLE INDYA</div>
              <div className="text-[11px] text-[#86868b] font-medium">MOBILES</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[#86868b] font-semibold px-4 mb-3">
            Menu
          </p>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className={`nav-link w-full text-left ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="px-4 py-3 bg-[#f5f5f7] rounded-xl">
            <p className="text-[11px] text-[#86868b] font-medium">Store</p>
            <p className="text-[12px] font-semibold text-[#1d1d1f]">Apple Indya Mobiles</p>
            <p className="text-[10px] text-[#86868b]">Trichy — 620001</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-[#1d1d1f]">
              {navItems.find((n) => n.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#1d1d1f]">Admin</p>
              <p className="text-xs text-[#86868b]">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="w-9 h-9 bg-[#0071e3] rounded-full flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
