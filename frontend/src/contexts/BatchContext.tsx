import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Batch, BatchEvent } from '@/lib/types';
import { batchApi } from '@/lib/api';

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
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      setBatches(await batchApi.getAll());
    } catch (error) {
      console.error('Failed to load batches', error);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadBatches(); }, [loadBatches]);

  const getBatchById = useCallback((id: string) => {
    const batch = batches.find(b => b.id === id);
    if (batch) setSelectedBatch(batch);
    return batch;
  }, [batches]);

  const createBatch = useCallback(async (batchData: Partial<Batch>) => {
    try {
      const newBatch = await batchApi.create(batchData as Parameters<typeof batchApi.create>[0]);
      setBatches(prev => [newBatch, ...prev]);
      return newBatch;
    } catch (error) { throw error; }
  }, []);

  const addEventToBatch = useCallback(async (batchId: string, event: BatchEvent) => {
    try {
      const updatedBatch = await batchApi.addEvent(batchId, event);
      setBatches(prev => prev.map(b => b.id === batchId ? updatedBatch : b));
      setSelectedBatch(updatedBatch);
    } catch (error) { throw error; }
  }, []);

  const deleteBatch = useCallback((batchId: string) => {
    setBatches(prev => prev.filter(b => b.id !== batchId));
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
