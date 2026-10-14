import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBatch } from '@/contexts/BatchContext';
import { Package, CheckCircle, Activity, Wallet, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import StatsCard from '@/components/ui/StatsCard';
import BatchCard from '@/components/batch/BatchCard';
import Button from '@/components/ui/Button';
import WalletConnectModal from '@/components/WalletConnectModal';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user, disconnectWallet } = useAuth();
  const { batches } = useBatch();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    // Show modal automatically only once per session if no wallet is connected
    if (user && !user.wallet_address && !hasPrompted) {
      const timer = setTimeout(() => {
        setIsModalOpen(true);
        setHasPrompted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, hasPrompted]);

  const totalBatches = batches.length;
  // Batches still progressing through the pipeline and not failed
  const activeBatches = batches.filter(b => b.currentStage !== 'retail' && b.testingStatus !== 'failed').length;
  // Discarded or failed lab quality inspection
  const rejectedBatches = batches.filter(b => b.testingStatus === 'failed').length;

  const recentBatches = [...batches].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <WalletConnectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dashboard.welcome') || 'Welcome back'}, {user?.name || 'User'} 👋
          </h1>
          <p className="text-gray-500">
            {t('dashboard.subtitle') || 'Overview of your Ayurvedic herb supply chain operations.'}
          </p>
        </div>
        
        {!user?.wallet_address ? (
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Wallet size={16} />
            Connect Wallet
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
              <Wallet size={16} />
              <span>{user.wallet_address.substring(0, 6)}...{user.wallet_address.substring(user.wallet_address.length - 4)}</span>
            </div>
            <button
              onClick={async () => {
                try {
                  await disconnectWallet();
                  toast.success('Wallet disconnected');
                } catch {
                  toast.error('Failed to disconnect wallet');
                }
              }}
              title="Disconnect Wallet"
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Streamlined KPI Metric Cards across all roles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Batches"
          value={totalBatches}
          icon={<Package className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <StatsCard
          title="Active In Transit"
          value={activeBatches}
          icon={<Activity className="w-6 h-6 text-amber-600" />}
          color="amber"
        />
        <StatsCard
          title="Discarded / Quality Rejected"
          value={rejectedBatches}
          icon={<CheckCircle className="w-6 h-6 text-red-600" />}
          color="red"
        />
      </div>

      {/* Recent Batches List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Recent Batches</h2>
        {recentBatches.length === 0 ? (
          <p className="text-sm text-gray-500">No batches recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentBatches.map(batch => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
