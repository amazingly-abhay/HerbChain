import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Batch, BatchEvent } from '@/lib/types';
import { batchApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface BatchContextType {
  batches: Batch[];
  loading: boolean;
  selectedBatch: Batch | null;
  loadBatches: () => Promise<void>;
  getBatchById: (id: string) => Batch | undefined;
  createBatch: (batch: Partial<Batch>) => Promise<Batch>;
  addEventToBatch: (batchId: string, event: BatchEvent) => Promise<void>;
  deleteBatch: (batchId: string) => void;
}

const BatchContext = createContext<BatchContextType | undefined>(undefined);

export function BatchProvider({ children }: { children: ReactNode }) {
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { user } = useAuth();

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      setAllBatches(await batchApi.getAll());
    } catch (error) {
      console.error('Failed to load batches', error);
      setAllBatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadBatches(); }, [loadBatches]);

  const batches = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return allBatches;
    
    if (user.role === 'collector') {
      return allBatches.filter(b => b.collectorId === user.id);
    }
    if (user.role === 'processor') {
      return allBatches.filter(b => b.currentStage === 'collection' || b.currentStage === 'processing');
    }
    if (user.role === 'tester') {
      return allBatches.filter(b => b.currentStage === 'processing' || b.currentStage === 'testing');
    }
    if (user.role === 'shipper') {
      return allBatches.filter(b => b.currentStage === 'testing' || b.currentStage === 'shipment');
    }
    if (user.role === 'retailer') {
      return allBatches.filter(b => b.currentStage === 'shipment' || b.currentStage === 'retail');
    }
    return allBatches;
  }, [allBatches, user]);

  const selectedBatch = useMemo(() => {
    return batches.find(b => b.id === selectedBatchId) || null;
  }, [batches, selectedBatchId]);

  const getBatchById = useCallback((id: string) => {
    setSelectedBatchId(id);
    return batches.find(b => b.id === id);
  }, [batches]);

  const createBatch = useCallback(async (batchData: Partial<Batch>) => {
    try {
      const newBatch = await batchApi.create(batchData as Parameters<typeof batchApi.create>[0]);
      setAllBatches(prev => [newBatch, ...prev]);
      return newBatch;
    } catch (error) { throw error; }
  }, []);

  const addEventToBatch = useCallback(async (batchId: string, event: BatchEvent) => {
    try {
      const updatedBatch = await batchApi.addEvent(batchId, event);
      setAllBatches(prev => prev.map(b => b.id === batchId ? updatedBatch : b));
      setSelectedBatchId(updatedBatch.id);
    } catch (error) { throw error; }
  }, []);

  const deleteBatch = useCallback((batchId: string) => {
    setAllBatches(prev => prev.filter(b => b.id !== batchId));
  }, []);

  return (
    <BatchContext.Provider value={{ 
      batches, 
      loading, 
      selectedBatch, 
      loadBatches, 
      getBatchById, 
      createBatch, 
      addEventToBatch, 
      deleteBatch 
    }}>
      {children}
    </BatchContext.Provider>
  );
}

export function useBatch() {
  const context = useContext(BatchContext);
  if (!context) throw new Error('useBatch must be used within a BatchProvider');
  return context;
}
