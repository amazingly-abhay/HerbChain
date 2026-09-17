import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import * as Icons from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();

  const filteredNavItems = NAV_ITEMS.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 flex flex-col shadow-sm"
    >
      <div className="h-16 flex items-center px-4 border-b border-gray-100">
        <Leaf className="w-8 h-8 text-herb-green-600 flex-shrink-0" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 font-bold text-xl text-herb-green-800 whitespace-nowrap"
          >
            {locale === 'hi' ? 'हर्बचेन' : 'HerbChain'}
          </motion.span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
        {filteredNavItems.map((item) => {
          const Icon = (Icons as any)[item.icon] || Icons.Circle;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? (locale === 'hi' ? item.labelHi : item.label) : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors whitespace-nowrap",
                isActive 
                  ? "bg-herb-green-50 text-herb-green-700 border-l-4 border-herb-green-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center px-0 border-l-0"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-herb-green-600")} />
              {!collapsed && (
                <span className="font-medium text-sm">
                  {locale === 'hi' ? item.labelHi : item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-herb-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden text-herb-green-700 font-bold">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              getInitials(user.name)
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 z-10"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}
