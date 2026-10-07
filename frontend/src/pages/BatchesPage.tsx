import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Grid, List as ListIcon, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBatch } from '@/contexts/BatchContext';
import { useAuth } from '@/contexts/AuthContext';
import { SUPPLY_CHAIN_STAGES } from '@/lib/constants';
import BatchCard from '@/components/batch/BatchCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/utils';

export default function BatchesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { batches } = useBatch();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredBatches = useMemo(() => {
    let result = [...batches];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b => 
        b.herbName.toLowerCase().includes(q) || 
        b.scientificName.toLowerCase().includes(q) || 
        b.id.toLowerCase().includes(q)
      );
    }

    if (stageFilter !== 'ALL') {
      result = result.filter(b => b.currentStage === stageFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'name_asc') return a.herbName.localeCompare(b.herbName);
      if (sortBy === 'name_desc') return b.herbName.localeCompare(a.herbName);
      return 0;
    });

    return result;
  }, [batches, search, stageFilter, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
          <p className="text-gray-500">Manage and track herb batches</p>
        </div>
        {(user?.role === 'collector' || user?.role === 'admin') && (
          <Button onClick={() => navigate('/batches/create')} className="flex items-center gap-2">
            <Plus size={18} />
            Create New Batch
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search batches by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-herb-green-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-herb-green-500 bg-white"
          >
            <option value="ALL">All Stages</option>
            {SUPPLY_CHAIN_STAGES.map(s => (
              <option key={s.stage} value={s.stage}>{s.label}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-herb-green-500 bg-white"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filteredBatches.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              title="No batches found"
              description="Try adjusting your filters or search query."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStageFilter('ALL');
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredBatches.map(batch => (
              <div key={batch.id} onClick={() => navigate(`/batches/${batch.id}`)} className="cursor-pointer transition-transform hover:-translate-y-1">
                <BatchCard batch={batch} />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Batch ID / Herb</th>
                    <th className="px-6 py-4 font-medium">Current Stage</th>
                    <th className="px-6 py-4 font-medium">Quantity</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBatches.map(batch => (
                    <tr 
                      key={batch.id} 
                      onClick={() => navigate(`/batches/${batch.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{batch.herbName}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">{batch.id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${batch.currentStage.toLowerCase()}-100 text-${batch.currentStage.toLowerCase()}-800`}>
                          {batch.currentStage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{batch.quantity}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDateTime(batch.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
