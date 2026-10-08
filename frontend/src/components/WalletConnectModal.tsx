import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, X, ExternalLink } from 'lucide-react';
import { BrowserProvider } from 'ethers';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletConnectModal({ isOpen, onClose }: Props) {
  const { user, connectWallet, disconnectWallet } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const currentHostAndPath = typeof window !== 'undefined' ? window.location.host + window.location.pathname + window.location.search : '';
  const metamaskDeepLink = `https://metamask.app.link/dapp/${currentHostAndPath}`;

  const handleConnect = async () => {
    // 1. Injected Provider Detected (Desktop Extension or MetaMask Mobile In-App Browser)
    if (window.ethereum) {
      setIsConnecting(true);
      try {
        const provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        await connectWallet(address);
        toast.success('Wallet connected successfully!');
        onClose();
      } catch (error: any) {
        console.error(error);
        toast.error('Failed to connect wallet');
      } finally {
        setIsConnecting(false);
      }
      return;
    }

    // 2. Mobile Device without Injected Provider -> Automatically open MetaMask Mobile App
    if (isMobile) {
      toast.loading('Opening MetaMask App...', { duration: 2500 });
      window.location.href = metamaskDeepLink;
      return;
    }

    // 3. Desktop without MetaMask Extension -> Direct to download
    toast.error('MetaMask extension not found. Redirecting to install page...');
    window.open('https://metamask.io/download/', '_blank');
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectWallet();
      toast.success('Wallet disconnected');
      onClose();
    } catch (error) {
      toast.error('Failed to disconnect wallet');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-herb-green-50 rounded-lg flex items-center justify-center text-herb-green-600">
                    <Wallet size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {user?.wallet_address ? 'Wallet Details' : 'Connect Wallet'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {user?.wallet_address ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-xs text-green-700 font-medium mb-1">Connected Address</p>
                    <p className="font-mono text-sm text-green-900 break-all">{user.wallet_address}</p>
                  </div>
                  <Button
                    onClick={handleDisconnect}
                    isLoading={isDisconnecting}
                    variant="outline"
                    className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-6 text-sm">
                    Connect your Web3 wallet to authorize supply chain events and record transactions on the blockchain.
                  </p>

                  <div className="space-y-3">
                    <Button 
                      onClick={handleConnect}
                      isLoading={isConnecting}
                      className="w-full justify-center flex items-center gap-2 bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold shadow-md"
                    >
                      <Wallet size={18} />
                      Connect MetaMask
                    </Button>

                    <button
                      onClick={onClose}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Skip for now
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


