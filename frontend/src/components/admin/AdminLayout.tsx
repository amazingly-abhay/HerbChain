import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  BarChart3, 
  Users, 
  Sliders, 
  Package, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeftRight,
  Shield,
  Layers
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: 'Business Analytics', path: '/admin/dashboard', icon: BarChart3 },
    { label: 'User Governance', path: '/admin/users', icon: Users },
    { label: 'Audit & Security', path: '/admin/audit-logs', icon: ShieldCheck },
    { label: 'System Configuration', path: '/admin/system-config', icon: Sliders },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Admin Sidebar */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full bg-slate-950 border-r border-slate-800 z-50 flex flex-col shadow-2xl"
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800 justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base text-white tracking-wide">HERBCHAIN</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-400">Admin Console</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
          <div className={cn("px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase", collapsed && "text-center")}>
            {collapsed ? "•••" : "Platform Governance"}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-300 border-l-4 border-emerald-500 font-semibold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60",
                  collapsed && "justify-center px-0 border-l-0"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-emerald-400" : "text-slate-400")} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}

          <div className="pt-6 pb-2">
            <div className={cn("px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase", collapsed && "text-center")}>
              {collapsed ? "•••" : "Operations"}
            </div>
            <NavLink
              to="/batches"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? "Supply Chain Batches" : undefined}
            >
              <Package className="w-5 h-5 text-slate-400 flex-shrink-0" />
              {!collapsed && <span>Supply Chain Batches</span>}
            </NavLink>
            <NavLink
              to="/dashboard"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? "Actor Dashboard" : undefined}
            >
              <ArrowLeftRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
              {!collapsed && <span>Actor Dashboard</span>}
            </NavLink>
          </div>
        </nav>

        {/* User profile & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
          <div className={cn("flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800", collapsed && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || user?.username}</p>
                <p className="text-[10px] text-emerald-400 font-medium">Root Administrator</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 min-h-screen",
          collapsed ? "ml-20" : "ml-[260px]"
        )}
      >
        {/* Top Navbar */}
        <header className="h-16 bg-slate-950/70 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Secure Admin Environment
            </span>
            <span className="text-slate-500 text-sm hidden sm:inline">|</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Production Traceability Ledger</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/batches')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Batches View</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 bg-slate-900 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
