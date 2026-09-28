import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import BatchTimeline from '@/components/batch/BatchTimeline';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { Batch } from '@/lib/types';
import { verifyApi } from '@/lib/api';

export default function VerifyPage() {
  const { batchId } = useParams();
  
  const [searchInput, setSearchInput] = useState(batchId || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'not-found'>('idle');
  const [batchData, setBatchData] = useState<Batch | null>(null);
  const [unitData, setUnitData] = useState<any>(null);

  useEffect(() => {
    if (batchId) {
      handleVerify(batchId);
    }
  }, [batchId]);

  const handleVerify = async (id: string = searchInput) => {
    if (!id.trim()) return;
    
    setIsVerifying(true);
    setResult('idle');
    
    try {
      const response = await verifyApi.verifyBatch(id);
      setBatchData(response.batch);
      setUnitData(response.unit);
      setResult('success');
    } catch {
      setBatchData(null);
      setUnitData(null);
      setResult('not-found');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-herb-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-herb-green-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-herb-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Product Authenticity</h1>
          <p className="text-gray-600">Enter a batch ID or scan a retail QR code to trace its journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter ID (e.g. HB-a1b2c3d4 or HB-1234-001)"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-herb-green-500 focus:border-herb-green-500 outline-none"
              />
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleVerify()}
              isLoading={isVerifying}
              leftIcon={<Search className="w-5 h-5" />}
            >
              Verify
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {result === 'not-found' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3"
            >
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-bold text-red-900">Batch Not Found</h3>
              <p className="text-sm text-red-700">No matching product batch was found on the ledger for ID: {searchInput}</p>
            </motion.div>
          )}

          {result === 'success' && batchData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {unitData ? (
                unitData.isScanned ? (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-yellow-600 shrink-0" />
                    <div>
                      <h4 className="text-yellow-800 font-bold">Warning: Item Already Scanned</h4>
                      <p className="text-yellow-700 text-sm">This specific QR code was first scanned on {formatDate(unitData.scannedAt)}. If you just purchased this as a new sealed product, the label may be a counterfeit duplicate.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-300 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                    <div>
                      <h4 className="text-green-800 font-bold">100% Authentic Product</h4>
                      <p className="text-green-700 text-sm">You are the first person to verify this unique retail item ({unitData.id}). It has now been securely claimed.</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                  <p className="text-green-800 font-medium">Authentic & Verified Batch Record</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="p-4 border-b flex items-center gap-2">
                    <FileText size={18} className="text-gray-500" />
                    <h3 className="font-semibold text-gray-900">100% Authentic Herb Details</h3>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Ingredient</p>
                      <p className="font-semibold text-lg">{batchData.herbName}</p>
                      <p className="text-sm italic text-gray-600">{batchData.scientificName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Origin / Farm</p>
                        <p className="font-medium">{batchData.origin.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Harvest Date</p>
                        <p className="font-medium">{formatDate(batchData.createdAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 border-b flex items-center gap-2">
                    <Shield size={18} className="text-blue-500" />
                    <h3 className="font-semibold text-gray-900">Blockchain Integrity</h3>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Batch ID</p>
                      <p className="font-mono text-sm bg-gray-50 p-2 rounded border">{batchData.id}</p>
                    </div>
                    {batchData.mainReport ? (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Lab Report Hash (SHA-256)</p>
                        <p className="font-mono text-xs text-green-700 truncate">{batchData.mainReport.hash}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No lab report sealed yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Complete Journey: Farm to Retail</h3>
                </CardHeader>
                <CardContent className="p-4">
                  <BatchTimeline events={batchData.events} currentStage={batchData.currentStage} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
