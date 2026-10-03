import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin, Camera, Info } from 'lucide-react';
import { useBatch } from '@/contexts/BatchContext';
import { batchApi, ipfsApi } from '@/lib/api';
import { getCurrentLocation } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import QRCodeDisplay from './QRCodeDisplay';

const STEPS = ['Herb Details', 'Location', 'Upload Media', 'Confirm'];

export default function CreateBatchForm() {
  const { createBatch } = useBatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [locationStr, setLocationStr] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [createdBatch, setCreatedBatch] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      herbName: '',
      herbNameHi: '',
      scientificName: '',
      quantity: '',
      unit: 'kg',
      locationName: '',
      latitude: null,
      longitude: null,
      notes: ''
    }
  });

  const formValues = watch();

  const handleGetLocation = async () => {
    setLoadingLoc(true);
    try {
      const loc = await getCurrentLocation();
      setValue('latitude', loc.latitude as any);
      setValue('longitude', loc.longitude as any);
      setLocationStr(`${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`);
    } catch (err) {
      alert("Could not get location.");
    } finally {
      setLoadingLoc(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
      return;
    }
    
    // Final submit
    const newBatch = {
      herbName: data.herbName,
      herbNameHi: data.herbNameHi,
      scientificName: data.scientificName,
      quantity: Number(data.quantity),
      unit: data.unit,
      origin: {
        latitude: Number(data.latitude) || 0,
        longitude: Number(data.longitude) || 0,
        address: data.locationName || locationStr || '',
      },
      ...(imageUrl && { imageUrl }),
    };
    
    const created = await createBatch(newBatch);
    setCreatedBatch(created as any);
  };

  if (createdBatch) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Batch Created Successfully!</h2>
        <p className="text-gray-600 max-w-md">
          A new batch of {createdBatch.herbName} has been initialized on the blockchain. Use this QR code to track it.
        </p>
        <div className="mt-6">
          <QRCodeDisplay batchId={createdBatch.id} herbName={createdBatch.herbName} />
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Create Another Batch
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Steps indicator */}
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
                idx === currentStep ? 'bg-white border-herb-green-600 text-herb-green-700' : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`absolute top-10 text-xs font-medium whitespace-nowrap ${idx <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-12 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Herb Details</h3>
                <Input label="Herb Name (English)" {...register('herbName', { required: 'Herb name is required', minLength: { value: 2, message: 'Must be at least 2 characters' } })} error={errors.herbName?.message as string} />
                <Input label="Herb Name (Hindi) - Optional" {...register('herbNameHi')} />
                <Input label="Scientific Name" {...register('scientificName', { required: 'Scientific name is required' })} error={errors.scientificName?.message as string} />
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input type="number" label="Quantity" {...register('quantity', { required: 'Quantity is required', min: { value: 1, message: 'Quantity must be at least 1' } })} error={errors.quantity?.message as string} />
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
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Collection Location</h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Recording precise GPS location helps prove the origin of the herb.
                  </p>
                </div>
                
                <div className="flex items-center gap-4 py-2">
                  <Button type="button" onClick={handleGetLocation} isLoading={loadingLoc} variant="outline" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Get GPS Coordinates
                  </Button>
                  <span className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1.5 rounded">
                    {locationStr || 'Not captured yet'}
                  </span>
                </div>
                
                <Input label="Location Name / Address" {...register('locationName')} placeholder="e.g. Western Ghats Forest Sector A" />
                <Textarea label="Collection Notes" {...register('notes')} placeholder="Weather conditions, soil type, etc." rows={3} />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Media</h3>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-herb-green-400 transition-colors cursor-pointer relative"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <input
                    type="file"
                    id="photo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const res = await ipfsApi.uploadFile(file);
                          setImageUrl(res.url);
                        } catch (err) {
                          alert("Failed to upload image.");
                        }
                      }
                    }}
                  />
                  {imageUrl ? (
                    <div className="flex flex-col items-center">
                      <img src={imageUrl} alt="Uploaded preview" className="h-32 object-cover rounded-lg mb-2" />
                      <p className="text-sm text-green-600 font-medium">Image uploaded successfully</p>
                      <p className="text-xs mt-1 underline">Click to change</p>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="font-medium text-gray-700">Click to upload photo</p>
                      <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Review & Confirm</h3>
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-3">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Herb</span>
                    <span className="font-bold text-gray-900">{formValues.herbName} <span className="italic font-normal">({formValues.scientificName})</span></span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Quantity</span>
                    <span className="font-medium text-gray-900">{formValues.quantity} {formValues.unit}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium text-gray-900 text-right">
                      {formValues.locationName || 'N/A'}<br/>
                      <span className="text-xs text-gray-500 font-mono">{locationStr}</span>
                    </span>
                  </div>
                  {imageUrl && (
                    <div className="flex justify-between border-b border-gray-200 pb-2 items-center">
                      <span className="text-gray-500">Photo</span>
                      <img src={imageUrl} alt="Uploaded preview" className="h-16 w-16 object-cover rounded shadow-sm" />
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stage</span>
                    <span className="font-medium text-herb-green-700 bg-herb-green-50 px-2 py-0.5 rounded">Collection</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 italic mt-4 text-center">
                  By confirming, this batch data will be permanently recorded on the blockchain.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between pt-4 border-t border-gray-100">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setCurrentStep(c => c - 1)}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button type="submit" className="px-8">
            {currentStep === STEPS.length - 1 ? 'Confirm & Mint' : 'Next'}
          </Button>
        </div>
      </form>
    </div>
  );
}
