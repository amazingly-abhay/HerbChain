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
import WalletConnectModal from '@/components/WalletConnectModal';

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
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [networkName, setNetworkName] = useState<string>('Sepolia Testnet');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    blockchainApi.getStatus().then((status) => {
      setBcStatus(status);
      if (status?.network) {
        setNetworkName(status.network.toUpperCase() === 'SEPOLIA' ? 'Sepolia Testnet' : status.network);
      }
    }).catch(() => {});

    // Listen to MetaMask network changes if available
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_chainId' }).then((chainId: string) => {
        if (chainId === '0xaa36a7' || chainId === '11155111') {
          setNetworkName('Sepolia Testnet');
        } else if (chainId === '0x1') {
          setNetworkName('Ethereum Mainnet');
        } else if (chainId === '0x539' || chainId === '0x7a69') {
          setNetworkName('Local Devnet');
        }
      }).catch(() => {});
    }
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
        {/* Web3 & Network Status Badge */}
        {user?.wallet_address ? (
          <div 
            title="Active Web3 Blockchain Connection"
            className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{networkName}</span>
          </div>
        ) : (
          <button
            onClick={() => setWalletModalOpen(true)}
            title="Click to Connect MetaMask Wallet"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Wallet Disconnected</span>
            <span className="text-[10px] bg-rose-200/60 px-1 rounded text-rose-900 font-bold hidden sm:inline">Connect</span>
          </button>
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

      <WalletConnectModal 
        isOpen={walletModalOpen} 
        onClose={() => setWalletModalOpen(false)} 
      />
    </header>
  );
}
