import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Settings, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn, getInitials } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { blockchainApi } from '@/lib/api';
import { BlockchainStatus } from '@/lib/types';

interface TopbarProps {
  sidebarCollapsed: boolean;
}

export default function Topbar({ sidebarCollapsed }: TopbarProps) {
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bcStatus, setBcStatus] = useState<BlockchainStatus | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    blockchainApi.getStatus().then(setBcStatus).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Find current route title
  const currentNavItem = NAV_ITEMS.find(item => item.path === location.pathname);
  let title = currentNavItem ? (locale === 'hi' ? currentNavItem.labelHi : currentNavItem.label) : 'HerbChain';
  if (location.pathname.startsWith('/profile')) {
    title = locale === 'hi' ? 'प्रोफ़ाइल' : 'Profile';
  } else if (location.pathname.startsWith('/settings')) {
    title = locale === 'hi' ? 'सेटिंग्स' : 'Settings';
  }

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'hi' : 'en');
  };

  const handleNavigate = (path: string) => {
    setDropdownOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-6 transition-all duration-300 shadow-sm",
        sidebarCollapsed ? "left-20" : "left-64"
      )}
    >
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Network Status */}
        {bcStatus && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 border border-gray-200">
            <span className={`w-2 h-2 rounded-full ${bcStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-600">{bcStatus.connected ? bcStatus.network : 'Disconnected'}</span>
          </div>
        )}

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 bg-herb-cream px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <motion.div
            key={locale}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-gray-700"
          >
            {locale === 'en' ? 'EN' : 'हिं'}
          </motion.div>
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-herb-terracotta rounded-full border-2 border-white"></span>
        </button>

        {/* User Menu */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              aria-label="User menu"
              aria-expanded={dropdownOpen}
            >
              <div className="w-8 h-8 rounded-full bg-herb-green-100 flex items-center justify-center text-herb-green-700 font-bold text-sm overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(user.name)
                )}
              </div>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => handleNavigate('/profile')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <User className="w-4 h-4 text-herb-green-600" /> {locale === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}
                  </button>
                  <button 
                    onClick={() => handleNavigate('/settings')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Settings className="w-4 h-4 text-herb-green-600" /> {locale === 'hi' ? 'सेटिंग्स' : 'Settings'}
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> {locale === 'hi' ? 'लॉगआउट' : 'Logout'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
