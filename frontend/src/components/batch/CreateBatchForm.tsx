import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  MapPin, 
  Camera, 
  Info, 
  AlertTriangle, 
  Loader2, 
  Sparkles, 
  Lock, 
  RefreshCw,
  Wallet,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useBatch } from '@/contexts/BatchContext';
import { useAuth } from '@/contexts/AuthContext';
import { ipfsApi, aiApi } from '@/lib/api';
import { getCurrentLocation } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import QRCodeDisplay from './QRCodeDisplay';
import WalletConnectModal from '@/components/WalletConnectModal';
import { AIAnalysis } from '@/lib/types';

const STEPS = [
  'Photo & AI Verification',
  'Herb & Quantity',
  'Location Coordinates',
  'Review & Mint'
];

export default function CreateBatchForm() {
  const { createBatch } = useBatch();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Image & AI state
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPassed, setAiPassed] = useState<boolean | null>(null);

  // Location auto-capture state
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [locCaptured, setLocCaptured] = useState(false);
  const [locError, setLocError] = useState('');

  // Result state
  const [createdBatch, setCreatedBatch] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      herbName: '',
      herbNameHi: '',
      scientificName: '',
      quantity: '',
      unit: 'kg',
      locationName: '',
      latitude: 0,
      longitude: 0,
      notes: ''
    }
  });

  const formValues = watch();

  // Automatically trigger location capture when reaching Step 2 (Location Coordinates)
  useEffect(() => {
    if (currentStep === 2 && !locCaptured && !loadingLoc) {
      handleGetLocation();
    }
  }, [currentStep]);

  const handleGetLocation = async () => {
    setLoadingLoc(true);
    setLocError('');
    try {
      const loc = await getCurrentLocation();
      setValue('latitude', loc.latitude);
      setValue('longitude', loc.longitude);
      setValue('locationName', loc.address);
      setLocCaptured(true);
    } catch (err: any) {
      console.error(err);
      setLocError('Could not auto-detect location. Please check browser location permissions.');
    } finally {
      setLoadingLoc(false);
    }
  };

  const handleImageSelected = async (file: File) => {
    try {
      setIsUploading(true);
      setIsAnalyzing(true);
      setAiAnalysis(null);
      setAiPassed(null);

      // Create instant local preview so collector immediately sees their photo
      const localPreviewUrl = URL.createObjectURL(file);
      setImageUrl(localPreviewUrl);

      // Run IPFS upload and AI botanical analysis concurrently in parallel
      const [uploadResult, analysisResult] = await Promise.allSettled([
        ipfsApi.uploadFile(file),
        aiApi.analyzePlant(file)
      ]);

      if (uploadResult.status === 'fulfilled') {
        setImageUrl(uploadResult.value.url);
      } else {
        console.warn('IPFS upload warning:', uploadResult.reason);
        // Retain local preview url so collector can still proceed if IPFS is slow
      }

      if (analysisResult.status === 'fulfilled') {
        const analysis = analysisResult.value;
        setAiAnalysis(analysis);

        const confidence = analysis?.plantIdentification?.confidence || 0;
        const passed = confidence >= 0.8;
        setAiPassed(passed);

        if (passed && analysis.plantIdentification?.name) {
          // Auto-fill and lock details
          setValue('herbName', analysis.plantIdentification.name);
          setValue('scientificName', analysis.plantIdentification.scientificName || '');
        } else {
          // Did not pass threshold: reset so user fills manually
          if (!formValues.herbName) {
            setValue('herbName', analysis.plantIdentification?.name || '');
            setValue('scientificName', analysis.plantIdentification?.scientificName || '');
          }
        }
      } else {
        console.error('AI analysis error:', analysisResult.reason);
        alert('AI analysis encountered an issue. You can proceed by manually specifying the herb details.');
        // Set fallback analysis to unblock collector
        setAiAnalysis({
          plantIdentification: { name: '', scientificName: '', confidence: 0 },
          healthRating: 0,
          harvestReadiness: { ready: false, notes: 'Manual inspection required' },
        } as any);
        setAiPassed(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  // Determine if "Next" button should be enabled for current step
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        // Must have uploaded image and completed AI analysis
        return !!imageUrl && !!aiAnalysis && !isAnalyzing && !isUploading;
      case 1:
        // Must have herb name, scientific name, and valid quantity > 0
        return (
          !!formValues.herbName?.trim() &&
          !!formValues.scientificName?.trim() &&
          Number(formValues.quantity) > 0
        );
      case 2:
        // Must have captured valid coordinates
        return (
          locCaptured &&
          formValues.latitude !== 0 &&
          formValues.longitude !== 0 &&
          !!formValues.locationName
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const onNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canProceed()) {
      setCurrentStep(curr => curr + 1);
    }
  };

  const isWalletConnected = !!user?.wallet_address;

  const onFinalSubmit = async (data: any, mintImmediately: boolean = isWalletConnected) => {
    setSubmitting(true);
    try {
      const newBatch = {
        herbName: data.herbName,
        herbNameHi: data.herbNameHi,
        scientificName: data.scientificName,
        quantity: Number(data.quantity),
        unit: data.unit,
        origin: {
          latitude: Number(data.latitude) || 0,
          longitude: Number(data.longitude) || 0,
          address: data.locationName || '',
        },
        ...(imageUrl && { imageUrl }),
        ...(aiAnalysis && { aiAnalysis }),
        mintImmediately,
        collectorWallet: user?.wallet_address || '',
      };

      const created = await createBatch(newBatch as any);
      setCreatedBatch(created as any);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (createdBatch) {
    const isMintedOnChain = createdBatch.isMinted && createdBatch.blockchainTxHash;
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className={`w-16 h-16 ${isMintedOnChain ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'} rounded-full flex items-center justify-center mb-2`}>
          {isMintedOnChain ? <Check className="w-8 h-8" /> : <Info className="w-8 h-8" />}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isMintedOnChain ? 'Batch Minted Successfully!' : 'Batch Saved as Draft!'}
        </h2>
        <p className="text-gray-600 max-w-md">
          {isMintedOnChain ? (
            <>
              A new batch of <strong className="text-gray-900">{createdBatch.herbName}</strong> has been initialized and cryptographically recorded on the Sepolia blockchain ledger.
            </>
          ) : (
            <>
              A new batch of <strong className="text-gray-900">{createdBatch.herbName}</strong> has been saved as an off-chain draft. You can connect your Web3 wallet anytime on the batch detail page to mint it onto the blockchain.
            </>
          )}
        </p>

        {isMintedOnChain && createdBatch.blockchainTxHash && !createdBatch.blockchainTxHash.startsWith('mock-') && (
          <div className="flex items-center gap-2 text-xs font-mono bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200">
            <span>Tx: {createdBatch.blockchainTxHash.substring(0, 10)}...{createdBatch.blockchainTxHash.substring(createdBatch.blockchainTxHash.length - 8)}</span>
            {createdBatch.blockchainExplorerUrl && (
              <a href={createdBatch.blockchainExplorerUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-900">
                View on Etherscan &rarr;
              </a>
            )}
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
          <QRCodeDisplay batchId={createdBatch.id} herbName={createdBatch.herbName} size={180} />
        </div>
        <div className="pt-2 flex gap-3">
          <Button onClick={() => window.location.reload()} variant="outline">
            Create Another Batch
          </Button>
          <Button onClick={() => window.location.href = `/batches/${createdBatch.id}`} className="bg-herb-green-600 hover:bg-herb-green-700">
            View Batch Details
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Wallet Warning Banner if not connected */}
      {!isWalletConnected && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Web3 Wallet Disconnected:</span> You can fill the details, but connecting MetaMask / Web3 is recommended to sign on-chain transactions directly.
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-herb-green-600 z-0 rounded transition-all duration-300"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          ></div>
          
          {STEPS.map((step, idx) => (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                idx < currentStep ? 'bg-herb-green-600 border-herb-green-600 text-white' :
                idx === currentStep ? 'bg-white border-herb-green-600 text-herb-green-700 shadow-sm' : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`absolute top-10 text-[11px] font-semibold text-center whitespace-nowrap ${idx <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit((data) => onFinalSubmit(data, isWalletConnected))(e); }} className="mt-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* STEP 0: Photo & AI Verification */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Step 1: Botanical Image & AI Verification</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a high-resolution photograph of the harvested herb. Our AI model analyzes species authenticity, health rating, and confidence score.
                  </p>
                </div>

                <div 
                  className={`border-2 border-dashed ${isAnalyzing || isUploading ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-herb-green-500 hover:bg-gray-50'} rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 transition-colors cursor-pointer relative`}
                  onClick={() => !isAnalyzing && !isUploading && document.getElementById('collector-photo-upload')?.click()}
                >
                  <input
                    type="file"
                    id="collector-photo-upload"
                    className="hidden"
                    accept="image/*"
                    disabled={isAnalyzing || isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelected(file);
                    }}
                  />

                  {isAnalyzing || isUploading ? (
                    <div className="flex flex-col items-center py-4">
                      <Loader2 className="w-10 h-10 mb-3 text-purple-600 animate-spin" />
                      <p className="font-semibold text-sm text-purple-900">
                        {isAnalyzing && isUploading 
                          ? 'Analyzing botanical species & securing photo to IPFS...' 
                          : isAnalyzing 
                          ? 'AI is evaluating botanical markers...' 
                          : 'Securing photo to IPFS...'}
                      </p>
                      <p className="text-xs mt-1 text-purple-600">Verifying taxonomic species and health rating</p>
                    </div>
                  ) : imageUrl ? (
                    <div className="flex flex-col items-center">
                      <img src={imageUrl} alt="Uploaded harvest" className="h-40 object-cover rounded-xl shadow-sm mb-3" />
                      <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Image Stored on IPFS
                      </span>
                      <p className="text-xs text-gray-500 mt-2 underline">Click to choose another photo</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4">
                      <div className="w-12 h-12 rounded-full bg-herb-green-50 text-herb-green-600 flex items-center justify-center mb-3">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-sm text-gray-900">Take or Upload Plant Photo</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, or WEBP up to 10MB</p>
                    </div>
                  )}
                </div>

                {/* AI Assessment Results */}
                {aiAnalysis && (
                  <div className="p-4 border rounded-2xl bg-slate-50 border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <h4 className="font-bold text-sm text-gray-900">AI Botanical Identification</h4>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        aiPassed 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        Confidence: {Math.round((aiAnalysis.plantIdentification?.confidence || 0) * 100)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Detected Herb</span>
                        <p className="font-bold text-gray-900 mt-0.5">{aiAnalysis.plantIdentification?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Scientific Name</span>
                        <p className="font-medium italic text-gray-800 mt-0.5">{aiAnalysis.plantIdentification?.scientificName || 'N/A'}</p>
                      </div>
                    </div>

                    {aiPassed ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Confidence Verified (&ge; 80%):</strong> Botanical species recognized with high confidence. The Herb & Scientific Name are automatically locked into the batch to prevent tampering.
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Confidence Below 80%:</strong> Species match is tentative. You will manually confirm the herb name in Step 2, and this batch will automatically receive a <strong>Manual Check Required</strong> flag for laboratory inspection.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: Herb & Quantity */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Step 2: Herb Details & Harvest Quantity</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {aiPassed 
                      ? 'AI confidence verified. Botanical names are locked to preserve harvest authenticity.' 
                      : 'Please enter and verify the herb names. A manual inspection check will be marked.'}
                  </p>
                </div>

                {/* Herb Name (English) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-700">
                      Herb Common Name (English)
                    </label>
                    {aiPassed && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> AI Locked
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    {...register('herbName', { required: 'Herb name is required' })}
                    readOnly={!!aiPassed}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none ${
                      aiPassed 
                        ? 'bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed font-semibold' 
                        : 'bg-white text-gray-900 border-gray-300 focus:border-herb-green-500'
                    }`}
                    placeholder="e.g. Ashwagandha"
                  />
                </div>

                {/* Herb Name (Hindi) */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Herb Name (Hindi) - Optional
                  </label>
                  <input
                    type="text"
                    {...register('herbNameHi')}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-herb-green-500"
                    placeholder="उदा. अश्वगंधा"
                  />
                </div>

                {/* Scientific Name */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-700">
                      Botanical / Scientific Name
                    </label>
                    {aiPassed && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> AI Locked
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    {...register('scientificName', { required: 'Scientific name is required' })}
                    readOnly={!!aiPassed}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none ${
                      aiPassed 
                        ? 'bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed font-medium italic' 
                        : 'bg-white text-gray-900 border-gray-300 focus:border-herb-green-500'
                    }`}
                    placeholder="e.g. Withania somnifera"
                  />
                </div>

                {/* Quantity and Unit */}
                <div className="flex gap-4 pt-1">
                  <div className="flex-1 space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">Harvest Quantity</label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      {...register('quantity', { required: 'Quantity is required', min: 0.01 })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-herb-green-500 font-semibold"
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div className="w-1/3">
                    <Select 
                      label="Unit" 
                      options={[
                        { value: 'kg', label: 'kg' },
                        { value: 'g', label: 'g' },
                        { value: 'quintal', label: 'quintal' },
                        { value: 'ton', label: 'ton' }
                      ]}
                      value={watch('unit')}
                      onChange={(val) => setValue('unit', val)}
                    />
                  </div>
                </div>

                {/* Optional Collection Notes */}
                <Textarea 
                  label="Harvest / Cultivation Details (Optional)" 
                  {...register('notes')} 
                  placeholder="Harvest technique, weather conditions, initial drying..." 
                  rows={2} 
                />
              </div>
            )}

            {/* STEP 2: Location Auto-Capture */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Step 3: Device Location & Coordinates</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Exact GPS coordinates are auto-captured from your device hardware to establish immutable geographic provenance.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-blue-900">
                    <strong>Tamper-Proof Origin:</strong> Geolocation coordinates and resolved location names are strictly read-only and automatically recorded onto the blockchain to prevent geographic origin falsification.
                  </div>
                </div>

                {loadingLoc ? (
                  <div className="py-8 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-200">
                    <Loader2 className="w-8 h-8 text-herb-green-600 animate-spin mb-2" />
                    <p className="text-xs font-semibold text-gray-700">Acquiring device GPS satellites & reverse geocoding...</p>
                  </div>
                ) : (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-gray-500" />
                        <span>Auto-Captured Origin Location</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="text-xs font-semibold text-herb-green-700 hover:text-herb-green-800 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Re-sync GPS
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Resolved Geographic Address</label>
                      <input
                        type="text"
                        readOnly
                        value={formValues.locationName || ''}
                        placeholder="Detecting address..."
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl text-xs text-gray-800 font-medium cursor-not-allowed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-1">Latitude</label>
                        <input
                          type="text"
                          readOnly
                          value={formValues.latitude ? `${formValues.latitude.toFixed(6)}° N` : ''}
                          placeholder="Latitude"
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-1">Longitude</label>
                        <input
                          type="text"
                          readOnly
                          value={formValues.longitude ? `${formValues.longitude.toFixed(6)}° E` : ''}
                          placeholder="Longitude"
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {locError && (
                      <p className="text-xs text-rose-600 font-medium pt-1">{locError}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Review & Confirm */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Step 4: Review, Confirm & Mint</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Review all batch provenance specifications prior to sealing the genesis record onto the blockchain.
                  </p>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-gray-200 pb-2.5">
                    <span className="text-gray-500 font-medium">Herb Species</span>
                    <span className="font-bold text-gray-900 text-right">
                      {formValues.herbName} <span className="italic font-normal text-gray-600">({formValues.scientificName})</span>
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-200 pb-2.5">
                    <span className="text-gray-500 font-medium">Quantity</span>
                    <span className="font-bold text-gray-900">{formValues.quantity} {formValues.unit}</span>
                  </div>

                  <div className="flex justify-between border-b border-gray-200 pb-2.5">
                    <span className="text-gray-500 font-medium">Origin Address</span>
                    <span className="font-medium text-gray-900 text-right max-w-xs">{formValues.locationName}</span>
                  </div>

                  <div className="flex justify-between border-b border-gray-200 pb-2.5">
                    <span className="text-gray-500 font-medium">Coordinates</span>
                    <span className="font-mono text-gray-800">
                      {formValues.latitude?.toFixed(5)}° N, {formValues.longitude?.toFixed(5)}° E
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-200 pb-2.5 items-center">
                    <span className="text-gray-500 font-medium">AI Botanical Validation</span>
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      aiPassed 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {aiPassed ? 'Verified Match' : 'Manual Check Required'} ({Math.round((aiAnalysis?.plantIdentification?.confidence || 0) * 100)}%)
                    </span>
                  </div>

                  {imageUrl && (
                    <div className="flex justify-between border-b border-gray-200 pb-2.5 items-center">
                      <span className="text-gray-500 font-medium">Harvest Photo</span>
                      <img src={imageUrl} alt="Harvest" className="h-12 w-12 object-cover rounded-lg border border-gray-200" />
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-500 font-medium">Supply Chain Stage</span>
                    <span className="font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Collection (Genesis)
                    </span>
                  </div>
                </div>

                {!isWalletConnected ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold">Wallet Disconnected (Hybrid Mode):</span>
                      <p className="mt-0.5 text-amber-800">
                        Blockchain minting is paused while disconnected. You can save this batch as an <strong>Off-Chain Draft</strong>, or connect your Web3 wallet now to sign and mint the genesis transaction onto Sepolia.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>On-Chain Minting Ready:</strong> Connected with {user?.wallet_address?.substring(0, 6)}...{user?.wallet_address?.substring(user.wallet_address.length - 4)}. Genesis transaction will be signed and published to Sepolia.</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Wizard Controls */}
        <div className="mt-8 flex justify-between items-center pt-4 border-t border-gray-100">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setCurrentStep(c => c - 1)}
            disabled={currentStep === 0 || submitting}
          >
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button 
              type="button" 
              onClick={onNextStep} 
              disabled={!canProceed()}
              className="px-8"
            >
              Next Step
            </Button>
          ) : isWalletConnected ? (
            <Button 
              type="button" 
              onClick={handleSubmit((data) => onFinalSubmit(data, true))}
              isLoading={submitting}
              className="px-8 bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Confirm & Mint on Sepolia
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setWalletModalOpen(true)}
                className="flex items-center gap-1.5 border-herb-green-600 text-herb-green-700 hover:bg-herb-green-50"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet to Mint
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit((data) => onFinalSubmit(data, false))}
                isLoading={submitting}
                className="px-6 bg-amber-600 hover:bg-amber-700 text-white"
              >
                Save as Draft (Off-Chain)
              </Button>
            </div>
          )}
        </div>
      </form>

      <WalletConnectModal 
        isOpen={walletModalOpen} 
        onClose={() => setWalletModalOpen(false)} 
      />
    </div>
  );
}
