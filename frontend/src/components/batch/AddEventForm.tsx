import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBatch } from '@/contexts/BatchContext';
import { useAuth } from '@/contexts/AuthContext';
import { SupplyChainStage } from '@/lib/types';
import { getCurrentLocation, cn } from '@/lib/utils';
import { SUPPLY_CHAIN_STAGES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

interface AddEventFormProps {
  batchId: string;
  currentStage: SupplyChainStage;
  onSuccess: () => void;
  onCancel: () => void;
}

const STAGE_ORDER: SupplyChainStage[] = ['collection', 'processing', 'testing', 'shipment', 'retail'];

function getNextStage(current: SupplyChainStage): SupplyChainStage | null {
  const idx = STAGE_ORDER.indexOf(current);
  return idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null;
}

export default function AddEventForm({ batchId, currentStage, onSuccess, onCancel }: AddEventFormProps) {
  const { t } = useLanguage();
  const { addEventToBatch } = useBatch();
  const { user } = useAuth();

  const nextStage = getNextStage(currentStage);

  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Lab Test Fields
  const [labResult, setLabResult] = useState('passed');
  const [moistureContent, setMoistureContent] = useState('');
  const [purity, setPurity] = useState('');

  const handleCaptureGPS = async () => {
    setIsCapturingGPS(true);
    try {
      const loc = await getCurrentLocation();
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);
      setAddress(loc.address);
    } catch {
      setLatitude(28.6139);
      setLongitude(77.209);
      setAddress('New Delhi, India');
    } finally {
      setIsCapturingGPS(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextStage || !user) return;

    setIsSubmitting(true);

    const event: any = {
      id: `EVT-${Date.now()}`,
      batchId,
      stage: nextStage,
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      timestamp: new Date().toISOString(),
      location: {
        latitude: latitude ?? 28.6139,
        longitude: longitude ?? 77.209,
        address: address || 'New Delhi, India',
      },
      notes,
      blockchainTxHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    };

    if (nextStage === 'testing') {
      event.labResult = labResult;
      event.labParameters = {
        moistureContent: moistureContent,
        purity: purity
      };
    }

    try {
      await addEventToBatch(batchId, event);
      setIsSuccess(true);
      setTimeout(onSuccess, 1500);
    } catch (error) {
      console.error(error);
      alert('Failed to add event. Do you have the correct role?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stageInfo = SUPPLY_CHAIN_STAGES.find(s => s.stage === nextStage);

  if (!nextStage) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">This batch has completed all stages.</p>
      </div>
    );
  }
  
  // Role Gate check in UI
  const STAGE_ROLE_MAP: Record<string, string> = {
    'collection': 'collector',
    'processing': 'processor',
    'testing': 'tester',
    'shipment': 'shipper',
    'retail': 'retailer'
  };
  
  const requiredRole = STAGE_ROLE_MAP[nextStage];
  if (user?.role !== 'admin' && user?.role !== requiredRole) {
    return (
      <div className="text-center py-8">
        <p className="text-amber-600 font-medium mb-4">
          You cannot add this event. The next stage is <strong>{nextStage}</strong>, which requires the <strong>{requiredRole}</strong> role.
        </p>
        <Button onClick={onCancel} variant="outline">Close</Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Event Added Successfully!</h3>
        <p className="text-gray-600">
          Batch moved to <span className="font-medium capitalize">{nextStage}</span> stage.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="bg-herb-green-50 rounded-lg p-4 border border-herb-green-200">
        <p className="text-sm text-herb-green-800">
          Moving batch to: <span className="font-bold capitalize">{stageInfo?.label || nextStage}</span>
        </p>
      </div>
      
      {nextStage === 'testing' && (
        <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
          <h4 className="font-semibold text-gray-800">Lab Test Results</h4>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="labResult" value="passed" checked={labResult === 'passed'} onChange={(e) => setLabResult(e.target.value)} />
              <span className="text-green-700 font-medium">Passed</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="labResult" value="failed" checked={labResult === 'failed'} onChange={(e) => setLabResult(e.target.value)} />
              <span className="text-red-700 font-medium">Failed</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Moisture Content (%)" value={moistureContent} onChange={e => setMoistureContent(e.target.value)} />
            <Input label="Purity (%)" value={purity} onChange={e => setPurity(e.target.value)} />
          </div>
        </div>
      )}

      <Textarea
        label={t('batch.notes') || 'Notes'}
        placeholder="Add notes about this event..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t('actors.location') || 'Location'}
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCaptureGPS}
          isLoading={isCapturingGPS}
          leftIcon={<MapPin className="w-4 h-4" />}
        >
          {isCapturingGPS ? 'Capturing...' : 'Capture GPS Location'}
        </Button>
        {latitude !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-gray-50 rounded-lg p-3 text-sm space-y-1"
          >
            <p className="text-gray-600">
              <span className="font-medium">Lat:</span> {latitude.toFixed(4)},{' '}
              <span className="font-medium">Lng:</span> {longitude?.toFixed(4)}
            </p>
            <Input
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </motion.div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('common.cancel') || 'Cancel'}
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          leftIcon={<FileText className="w-4 h-4" />}
        >
          {t('batch.addEvent') || 'Add Event'}
        </Button>
      </div>
    </motion.form>
  );
}
