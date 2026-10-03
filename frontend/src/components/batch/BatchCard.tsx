import { motion } from 'framer-motion';
import { Package, Calendar, User } from 'lucide-react';
import { Batch } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/utils';
import { SUPPLY_CHAIN_STAGES } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';

interface BatchCardProps {
  batch: Batch;
  onClick?: () => void;
}

export default function BatchCard({ batch, onClick }: BatchCardProps) {
  const { locale } = useLanguage();
  const navigate = useNavigate();

  const herbName = locale === 'hi' && batch.herbNameHi ? batch.herbNameHi : batch.herbName;
  const currentStageIndex = SUPPLY_CHAIN_STAGES.findIndex(s => s.stage === batch.currentStage);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/batches/${batch.id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={handleClick}
    >
      {batch.imageUrl && (
        <div className="h-32 w-full overflow-hidden">
          <img src={batch.imageUrl} alt={herbName} className="w-full h-full object-cover transition-transform hover:scale-105" />
        </div>
      )}
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{herbName}</h3>
            <p className="text-sm text-gray-500 italic">{batch.scientificName}</p>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-herb-green-100 text-herb-green-800 capitalize">
            {batch.currentStage}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Package className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-mono text-xs">{batch.id}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <span>{batch.collectorName || 'Collector'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formatDate(batch.createdAt)}</span>
          </div>
        </div>

        <div className="text-sm font-semibold text-gray-800">
          Qty: {batch.quantity} {batch.unit}
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-4 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{Math.round(((currentStageIndex + 1) / SUPPLY_CHAIN_STAGES.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-herb-green-500 h-1.5 rounded-full" 
            style={{ width: `${((currentStageIndex + 1) / SUPPLY_CHAIN_STAGES.length) * 100}%` }} 
          />
        </div>
      </div>
    </motion.div>
  );
}
