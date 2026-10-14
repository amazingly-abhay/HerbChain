import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Download, Plus, FileText, Wallet, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useBatch } from '@/contexts/BatchContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getStageColor, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import QRCodeDisplay from '@/components/batch/QRCodeDisplay';
import BatchTimeline from '@/components/batch/BatchTimeline';
import Modal from '@/components/ui/Modal';
import AddEventForm from '@/components/batch/AddEventForm';
import WalletConnectModal from '@/components/WalletConnectModal';

export default function BatchDetailPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { getBatchById, mintBatch } = useBatch();
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const batch = batchId ? getBatchById(batchId) : undefined;

  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Batch Not Found</h2>
        <p className="text-gray-500 mb-6">The batch you are looking for does not exist or you don't have access.</p>
        <Button onClick={() => navigate('/batches')}>Return to Batches</Button>
      </div>
    );
  }

  const stageColor = getStageColor(batch.currentStage);
  const isMinted = !!(batch.isMinted && batch.blockchainTxHash);
  const isWalletConnected = !!user?.wallet_address;
  const isCollectorOrAdmin = user?.role === 'admin' || user?.role === 'collector' || (user?.id && user.id === batch.collectorId);

  // Determine the next stage in the pipeline
  const STAGE_ORDER = ['collection', 'processing', 'testing', 'shipment', 'retail'];
  const currentStageIndex = STAGE_ORDER.indexOf(batch.currentStage);
  const nextStage = currentStageIndex < STAGE_ORDER.length - 1 ? STAGE_ORDER[currentStageIndex + 1] : null;

  // Next stage required role:
  // processing -> processor, testing -> tester, shipment -> shipper, retail -> retailer
  const NEXT_STAGE_ROLE_MAP: Record<string, string> = {
    processing: 'processor',
    testing: 'tester',
    shipment: 'shipper',
    retail: 'retailer',
  };

  const requiredRoleForNextStage = nextStage ? NEXT_STAGE_ROLE_MAP[nextStage] : null;
  const canUserUpdateStage = user?.role === 'admin' || (requiredRoleForNextStage && user?.role === requiredRoleForNextStage);

  const handleMintNow = async () => {
    if (!isWalletConnected) {
      setWalletModalOpen(true);
      return;
    }
    setIsMinting(true);
    try {
      await mintBatch(batch.id, user.wallet_address);
    } catch (err: any) {
      alert(err.message || 'Failed to mint batch onto blockchain');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/batches')}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {locale === 'hi' ? batch.herbNameHi || batch.herbName : batch.herbName}
            </h1>
            <Badge variant="default" className="font-mono">{batch.id.substring(0, 12)}</Badge>
            {isMinted ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                On-Chain (Sepolia)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Draft (Off-Chain)
              </span>
            )}
          </div>
          <p className="text-gray-500 italic">{batch.scientificName}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge 
            variant={batch.currentStage === 'retail' ? 'success' : 'default'} 
            className="px-3 py-1 text-sm font-medium capitalize"
          >
            {batch.currentStage}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="p-4 border-b flex items-center gap-2">
              <FileText size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Batch Details</h3>
            </CardHeader>
            <CardContent className="p-4">
              {batch.imageUrl && (
                <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                  <img src={batch.imageUrl} alt={batch.herbName} className="w-full h-48 object-cover" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Origin Location</p>
                  <p className="font-medium">{batch.origin.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Quantity</p>
                  <p className="font-medium">{batch.quantity} {batch.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Collector</p>
                  <p className="font-medium">{batch.collectorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created Date</p>
                  <p className="font-medium">{formatDate(batch.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Journey Timeline</h3>
            </CardHeader>
            <CardContent className="p-4">
              <BatchTimeline events={batch.events} currentStage={batch.currentStage} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Verification QR Code</h3>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
              <QRCodeDisplay batchId={batch.id} herbName={batch.herbName} size={180} />
              <p className="text-xs text-gray-500">Scan to verify on public blockchain ledger</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Reports</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {batch.mainReport ? (
                <div className="border border-green-200 bg-green-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-green-900">Main Lab Report</h4>
                    <Badge variant="success">Passed</Badge>
                  </div>
                  <p className="text-xs text-green-800 mb-2 truncate">Hash: {batch.mainReport.hash}</p>
                  {batch.mainReport.blockchainTxHash && (
                    batch.mainReport.blockchainTxHash.startsWith('mock-') ? (
                      <p className="text-xs text-gray-500 font-mono truncate">Tx: {batch.mainReport.blockchainTxHash.substring(0, 14)}... <span className="italic">(mock)</span></p>
                    ) : (
                      <a
                        href={batch.mainReport.blockchainExplorerUrl || `https://sepolia.etherscan.io/tx/${batch.mainReport.blockchainTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-800 font-mono truncate hover:text-green-600 flex items-center gap-1"
                      >
                        Tx: {batch.mainReport.blockchainTxHash.substring(0, 10)}...{batch.mainReport.blockchainTxHash.substring(batch.mainReport.blockchainTxHash.length - 8)}
                        <ExternalLink size={12} />
                      </a>
                    )
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-3 flex items-center justify-center gap-2">
                    <Download size={14} /> Download Main Report
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">No main report generated yet.</p>
              )}

              {batch.reports && batch.reports.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="font-medium text-sm text-gray-700">Secondary Reports</h4>
                  {batch.reports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm text-gray-800 capitalize">{report.stage} Report</p>
                        <p className="text-xs text-gray-500">{formatDate(report.createdAt)}</p>
                      </div>
                      <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Download size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Actions</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {!isMinted && isCollectorOrAdmin && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
                  <div className="flex items-start gap-2 text-xs text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      This batch is currently an <strong>Off-Chain Draft</strong>. Mint it to publish the genesis provenance record onto Sepolia.
                    </span>
                  </div>
                  <Button
                    onClick={handleMintNow}
                    isLoading={isMinting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 text-xs py-2"
                  >
                    <ShieldCheck size={16} />
                    {isWalletConnected ? 'Mint onto Sepolia Blockchain' : 'Connect Wallet & Mint'}
                  </Button>
                </div>
              )}

              {canUserUpdateStage ? (
                <Button 
                  onClick={() => setIsAddEventModalOpen(true)}
                  className="w-full flex justify-center items-center gap-2"
                  disabled={batch.currentStage === 'retail'}
                >
                  <Plus size={18} />
                  Update Stage to {nextStage ? nextStage.toUpperCase() : 'NEXT'}
                </Button>
              ) : batch.currentStage !== 'retail' ? (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 flex items-center gap-2">
                  <span className="font-medium">
                    Next Stage: <strong className="text-gray-800 capitalize">{nextStage}</strong> (Reserved for <strong>{requiredRoleForNextStage}</strong>)
                  </span>
                </div>
              ) : null}
              <Button 
                variant="outline" 
                className="w-full flex justify-center items-center gap-2"
                onClick={() => {
                  const count = prompt("Enter number of unique retail labels to generate (max 100):", "10");
                  if (count) {
                    import('@/lib/api').then(({ batchApi }) => {
                      batchApi.generateLabels(batch.id, parseInt(count)).then(() => {
                        window.location.reload();
                      }).catch(e => alert(e.message || "Failed to generate labels"));
                    });
                  }
                }}
              >
                <FileText size={18} />
                Generate Retail Labels
              </Button>
            </CardContent>
          </Card>
          
          {batch.retailUnits && batch.retailUnits.length > 0 && (
            <Card>
              <CardHeader className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Unique Retail QRs</h3>
              </CardHeader>
              <CardContent className="p-4">
                <div className="max-h-60 overflow-y-auto space-y-2">
                  <p className="text-xs text-gray-500 mb-2">Print these unique codes on your retail units. Consumers scanning these will be checked for counterfeiting.</p>
                  {batch.retailUnits.map(unit => (
                    <div key={unit.id} className="flex justify-between items-center text-sm border-b py-2">
                      <span className="font-mono">{unit.id}</span>
                      {unit.isScanned ? (
                        <span className="text-red-600 text-xs font-bold">Scanned</span>
                      ) : (
                        <span className="text-green-600 text-xs">Unscanned</span>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                        // Quick way to download this specific QR
                        const url = `${window.location.origin}/verify/${unit.id}`;
                        alert(`QR URL: ${url}`);
                      }}>View URL</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isAddEventModalOpen} 
        onClose={() => setIsAddEventModalOpen(false)}
        title="Update Batch Stage"
      >
        <AddEventForm 
          batchId={batch.id} 
          currentStage={batch.currentStage}
          onSuccess={() => setIsAddEventModalOpen(false)} 
          onCancel={() => setIsAddEventModalOpen(false)} 
        />
      </Modal>

      <WalletConnectModal 
        isOpen={walletModalOpen} 
        onClose={() => setWalletModalOpen(false)} 
      />
    </div>
  );
}
