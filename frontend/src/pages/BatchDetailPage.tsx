import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Download, Plus, FileText, Wallet, ShieldCheck, AlertCircle, Sparkles, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useBatch } from '@/contexts/BatchContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getStageColor, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import QRCodeDisplay from '@/components/batch/QRCodeDisplay';
import BatchTimeline from '@/components/batch/BatchTimeline';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import AddEventForm from '@/components/batch/AddEventForm';
import WalletConnectModal from '@/components/WalletConnectModal';
import { batchApi } from '@/lib/api';
import { downloadReportHtml } from '@/lib/reportDownload';

export default function BatchDetailPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { getBatchById, mintBatch } = useBatch();
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [labelCount, setLabelCount] = useState('10');
  const [isGeneratingLabels, setIsGeneratingLabels] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isVerifyingReport, setIsVerifyingReport] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const { loadBatches } = useBatch();

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

  const isFailedTesting = batch.testingStatus === 'failed';
  const requiredRoleForNextStage = nextStage ? NEXT_STAGE_ROLE_MAP[nextStage] : null;
  const canUserUpdateStage = !isFailedTesting && (user?.role === 'admin' || (requiredRoleForNextStage && user?.role === requiredRoleForNextStage));

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

  const handleVerifyReport = async () => {
    setIsVerifyingReport(true);
    setIsVerifyModalOpen(true);
    setVerificationResult(null);
    try {
      const res = await batchApi.verifyReport(batch.id);
      setVerificationResult(res);
    } catch (e: any) {
      setVerificationResult({
        verified: false,
        status: 'FAILED_VERIFICATION',
        verification_details: {
          message: e?.response?.data?.detail || e?.message || 'Report verification failed.'
        }
      });
    } finally {
      setIsVerifyingReport(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-0">
      {/* Page Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-3 sm:gap-4 w-full md:w-auto">
          <button 
            onClick={() => navigate('/batches')}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors shrink-0 mt-0.5"
            title="Back to Batches"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {locale === 'hi' ? batch.herbNameHi || batch.herbName : batch.herbName}
              </h1>
              <Badge variant="default" className="font-mono text-xs">{batch.id}</Badge>
              {isMinted ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  On-Chain (Sepolia)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Draft (Off-Chain)
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 italic mt-0.5">{batch.scientificName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Stage</span>
          <Badge 
            variant={batch.currentStage === 'retail' ? 'success' : 'default'} 
            className="px-3 py-1 text-xs sm:text-sm font-semibold capitalize"
          >
            {batch.currentStage}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-5 border-b flex items-center gap-2">
              <FileText size={18} className="text-herb-green-600" />
              <h3 className="font-semibold text-gray-900">Batch Specification & Origin</h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-5">
              {batch.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200 max-h-64 sm:max-h-80 w-full bg-gray-50">
                  <img src={batch.imageUrl} alt={batch.herbName} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Origin Location</p>
                  <p className="font-semibold text-sm text-gray-900 break-words">{batch.origin?.address || 'Origin Recorded'}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Quantity Harvested</p>
                  <p className="font-semibold text-sm text-gray-900">{batch.quantity} {batch.unit || 'kg'}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Harvest Collector</p>
                  <p className="font-semibold text-sm text-gray-900">{batch.collectorName || 'Registered Collector'}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Harvest Date</p>
                  <p className="font-semibold text-sm text-gray-900">{formatDate(batch.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-5 border-b">
              <h3 className="font-semibold text-gray-900">Provenance Journey & Events</h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 overflow-hidden">
              <BatchTimeline events={batch.events} currentStage={batch.currentStage} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Verification QR Card */}
          <Card>
            <CardHeader className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Verification QR Code</h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <QRCodeDisplay 
                batchId={batch.id} 
                herbName={batch.herbName} 
                size={180} 
                standalone={false} 
              />
              <p className="text-[11px] text-gray-500 text-center mt-3">
                Scan to verify on public blockchain ledger & origin record
              </p>
            </CardContent>
          </Card>

          {/* Reports Card */}
          <Card>
            <CardHeader className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Audit Reports</h3>
              {batch.mainReport && (
                <Badge variant={batch.testingStatus === 'failed' ? 'error' : 'success'} className="text-[10px]">
                  {batch.testingStatus === 'failed' ? 'Failed' : 'Passed'}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {batch.mainReport ? (
                <div className="border border-green-200 bg-green-50/60 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-green-950">Main Lab Inspection</h4>
                    <span className="text-[10px] uppercase font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                      Certified
                    </span>
                  </div>
                  <p className="text-xs text-green-900/90 font-mono break-all line-clamp-1" title={batch.mainReport.hash}>
                    Hash: {batch.mainReport.hash}
                  </p>
                  {batch.mainReport.blockchainTxHash && (
                    batch.mainReport.blockchainTxHash.startsWith('mock-') ? (
                      <p className="text-xs text-gray-500 font-mono truncate">
                        Tx: {batch.mainReport.blockchainTxHash.substring(0, 14)}... <span className="italic">(Local Devnet)</span>
                      </p>
                    ) : (
                      <a
                        href={batch.mainReport.blockchainExplorerUrl || `https://sepolia.etherscan.io/tx/${batch.mainReport.blockchainTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-800 font-mono truncate hover:text-green-950 flex items-center gap-1 font-semibold"
                      >
                        Tx: {batch.mainReport.blockchainTxHash.substring(0, 10)}...{batch.mainReport.blockchainTxHash.substring(batch.mainReport.blockchainTxHash.length - 8)}
                        <ExternalLink size={12} className="shrink-0" />
                      </a>
                    )
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => downloadReportHtml(batch, batch.mainReport!)}
                      className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-green-100 hover:text-green-900 border-green-300 text-xs py-2"
                    >
                      <Download size={13} /> Download
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleVerifyReport}
                      className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 font-medium"
                    >
                      <ShieldCheck size={13} /> Verify on Ledger
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-3 bg-gray-50 rounded-xl border border-gray-100">
                  No main lab report generated yet.
                </p>
              )}

              {batch.reports && batch.reports.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Secondary Reports</h4>
                  <div className="space-y-2">
                    {batch.reports.map((report) => (
                      <div key={report.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50 flex justify-between items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs text-gray-900 capitalize truncate">{report.stage} Report</p>
                          <p className="text-[10px] text-gray-500">{formatDate(report.createdAt)}</p>
                        </div>
                        <button 
                          onClick={() => downloadReportHtml(batch, report)}
                          title={`Download ${report.stage} report`}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Pipeline Actions</h3>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {!isMinted && isCollectorOrAdmin && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
                  <div className="flex items-start gap-2 text-xs text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      This batch is currently an <strong>Off-Chain Draft</strong>. Mint it to publish the genesis provenance record onto Sepolia.
                    </span>
                  </div>
                  <Button
                    onClick={handleMintNow}
                    isLoading={isMinting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 text-xs py-2 font-medium"
                  >
                    <ShieldCheck size={16} />
                    {isWalletConnected ? 'Mint onto Sepolia Blockchain' : 'Connect Wallet & Mint'}
                  </Button>
                </div>
              )}

              {isFailedTesting ? (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Batch Quarantined</span>
                    <span>This batch failed lab quality testing and is permanently locked from shipment or retail distribution.</span>
                  </div>
                </div>
              ) : canUserUpdateStage ? (
                <Button 
                  onClick={() => setIsAddEventModalOpen(true)}
                  className="w-full flex justify-center items-center gap-2 text-xs sm:text-sm py-2.5"
                  disabled={batch.currentStage === 'retail'}
                >
                  <Plus size={18} />
                  Update Stage to {nextStage ? nextStage.toUpperCase() : 'NEXT'}
                </Button>
              ) : batch.currentStage !== 'retail' ? (
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-start gap-2">
                  <span className="font-medium">
                    Next Stage: <strong className="text-gray-900 capitalize">{nextStage}</strong> (Reserved for <strong className="text-gray-900">{requiredRoleForNextStage}</strong>)
                  </span>
                </div>
              ) : null}

              {!isFailedTesting && (user?.role === 'retailer' || user?.role === 'admin') && batch.currentStage !== 'collection' && batch.currentStage !== 'processing' && (
                <Button 
                  variant="outline" 
                  className="w-full flex justify-center items-center gap-2 text-xs sm:text-sm py-2.5"
                  onClick={() => setIsLabelModalOpen(true)}
                >
                  <FileText size={18} />
                  Generate Retail Labels
                </Button>
              )}
            </CardContent>
          </Card>
          
          {batch.retailUnits && batch.retailUnits.length > 0 && (
            <Card>
              <CardHeader className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Unique Retail QRs</h3>
              </CardHeader>
              <CardContent className="p-4">
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  <p className="text-xs text-gray-500 mb-2">Print these unique codes on your retail units for anti-counterfeiting verification.</p>
                  {batch.retailUnits.map(unit => (
                    <div key={unit.id} className="flex justify-between items-center text-xs border-b border-gray-100 py-2 gap-2">
                      <span className="font-mono text-gray-800 truncate">{unit.id}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {unit.isScanned ? (
                          <span className="text-red-600 text-[10px] font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Scanned</span>
                        ) : (
                          <span className="text-green-700 text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">Unscanned</span>
                        )}
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => {
                          const url = `${window.location.origin}/verify/${unit.id}`;
                          navigator.clipboard?.writeText(url);
                          alert(`Verification URL copied:\n${url}`);
                        }}>Copy Link</Button>
                      </div>
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

      <Modal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        title="Generate Unique Retail Unit Labels"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600">
            Create cryptographically tracked retail packaging unit QRs for batch <strong className="font-mono">{batch.id}</strong>. Each unit has a unique identifier to verify genuineness and detect counterfeiting upon consumer scan.
          </p>
          <Input 
            label="Number of Unique Unit Labels (1 - 100)"
            type="number"
            min="1"
            max="100"
            value={labelCount}
            onChange={(e) => setLabelCount(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLabelModalOpen(false)}
              disabled={isGeneratingLabels}
            >
              Cancel
            </Button>
            <Button
              type="button"
              isLoading={isGeneratingLabels}
              onClick={async () => {
                const count = parseInt(labelCount, 10);
                if (isNaN(count) || count < 1 || count > 100) {
                  alert("Please enter a valid count between 1 and 100.");
                  return;
                }
                setIsGeneratingLabels(true);
                try {
                  await batchApi.generateLabels(batch.id, count);
                  await loadBatches();
                  setIsLabelModalOpen(false);
                } catch (e: any) {
                  alert(e?.response?.data?.detail || e?.message || "Failed to generate retail labels");
                } finally {
                  setIsGeneratingLabels(false);
                }
              }}
            >
              Generate Labels
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cryptographic Report Ledger Verification Modal */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Ledger Cryptographic Audit & Report Verification"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          {isVerifyingReport ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="font-semibold text-gray-800">Verifying Report Hash Against On-Chain Ledger...</p>
              <p className="text-xs text-gray-500 max-w-xs">
                Computing deterministic SHA-256 payload digest and querying Sepolia smart contract state.
              </p>
            </div>
          ) : verificationResult ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                verificationResult.verified
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                {verificationResult.verified ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm">
                    {verificationResult.verified
                      ? 'Cryptographic Verification Passed'
                      : 'Cryptographic Verification Failed'}
                  </h4>
                  <p className="text-xs mt-0.5 opacity-90">
                    {verificationResult.verification_details?.message || 
                     (verificationResult.verified ? 'The report data is intact and cryptographically identical to the anchored ledger record.' : 'Data mismatch detected.')}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2.5 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-sans uppercase font-bold block">Recorded Hash in Report</span>
                  <span className="text-gray-900 break-all select-all font-semibold">{verificationResult.recorded_hash || 'None'}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-[10px] text-gray-400 font-sans uppercase font-bold block">Computed Payload Hash (SHA-256)</span>
                  <span className="text-gray-900 break-all select-all font-semibold">{verificationResult.computed_hash || 'None'}</span>
                </div>
                {verificationResult.stored_on_chain_hash && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-[10px] text-gray-400 font-sans uppercase font-bold block">Smart Contract Anchored Hash</span>
                    <span className="text-emerald-700 break-all select-all font-semibold">0x{verificationResult.stored_on_chain_hash}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Payload Match</span>
                  <span className="font-bold text-emerald-600">
                    {verificationResult.hash_matches ? '100% Match (0 byte drift)' : 'Mismatch'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Ledger Network</span>
                  <span className="font-bold text-gray-900 capitalize">
                    {verificationResult.verification_details?.network || 'Sepolia Testnet'}
                  </span>
                </div>
              </div>

              {verificationResult.blockchain_tx_hash && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-1 text-xs">
                  <span className="text-gray-500 font-medium">Anchor Transaction:</span>
                  {verificationResult.blockchain_tx_hash.startsWith('mock-') ? (
                    <span className="font-mono text-gray-600 truncate">
                      {verificationResult.blockchain_tx_hash} <span className="italic">(Local Devnet Sealed)</span>
                    </span>
                  ) : (
                    <a
                      href={verificationResult.blockchain_explorer_url || `https://sepolia.etherscan.io/tx/${verificationResult.blockchain_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold truncate"
                    >
                      <span>{verificationResult.blockchain_tx_hash}</span>
                      <ExternalLink size={12} className="shrink-0" />
                    </a>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setIsVerifyModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
