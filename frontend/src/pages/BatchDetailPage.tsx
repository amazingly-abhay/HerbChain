import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Download, Plus, FileText, Activity } from 'lucide-react';
import { useBatch } from '@/contexts/BatchContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getStageColor, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import QRCodeDisplay from '@/components/batch/QRCodeDisplay';
import BatchTimeline from '@/components/batch/BatchTimeline';
import Modal from '@/components/ui/Modal';
import AddEventForm from '@/components/batch/AddEventForm';
import PlantAnalysis from '@/components/ai/PlantAnalysis';

export default function BatchDetailPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { getBatchById } = useBatch();
  const { t, locale } = useLanguage();
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

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
          </div>
          <p className="text-gray-500 italic">{batch.scientificName}</p>
        </div>
        <div className="ml-auto">
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
            <CardHeader className="p-4 border-b flex items-center gap-2">
              <Activity size={18} className="text-herb-green-600" />
              <h3 className="font-semibold text-gray-900">AI Plant Assessment</h3>
            </CardHeader>
            <CardContent className="p-4">
              <PlantAnalysis />
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
                  <p className="text-xs text-green-800 font-mono truncate">Tx: {batch.mainReport.blockchainTxHash}</p>
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
              <Button 
                onClick={() => setIsAddEventModalOpen(true)}
                className="w-full flex justify-center items-center gap-2"
                disabled={batch.currentStage === 'retail'}
              >
                <Plus size={18} />
                Update Stage
              </Button>
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
    </div>
  );
}
