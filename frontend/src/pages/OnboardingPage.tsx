import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ACTOR_ROLES } from '@/lib/constants';
import Button from '@/components/ui/Button';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, submitOnboarding, logout } = useAuth();

  const [formData, setFormData] = useState({
    role: 'collector',
    location: '',
    government_id_type: 'aadhar',
    government_id_number: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (formErrors[e.target.name]) {
      setFormErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!formData.government_id_number.trim()) {
      errors.government_id_number = 'Government ID Number is required';
    } else if (formData.government_id_type === 'aadhar' && !/^\d{12}$/.test(formData.government_id_number.replace(/\s/g, ''))) {
      errors.government_id_number = 'Aadhaar must be 12 digits';
    } else if (formData.government_id_type === 'pan' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.government_id_number)) {
      errors.government_id_number = 'Invalid PAN format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      await submitOnboarding(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Onboarding failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-herb-cream">
      <div className="hidden lg:flex lg:w-1/2 gradient-green p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">HerbChain</span>
        </div>
        <div className="space-y-6 max-w-md relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Complete Your Profile</h1>
          <p className="text-herb-green-100 text-lg">
            Tell us your role in the supply chain and provide verification details to get started.
          </p>
        </div>
        <p className="text-xs text-herb-green-200 relative z-10">© 2026 HerbChain Prototype</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome, {user?.name || 'User'}!</h2>
            <p className="mt-2 text-sm text-gray-600">Please provide your details below.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role in Supply Chain</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herb-green-500 outline-none bg-white"
              >
                {ACTOR_ROLES.map(r => (
                  <option key={r.role} value={r.role}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                placeholder="City, Country"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${formErrors.location ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-herb-green-500'}`}
              />
              {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Government ID Type</label>
              <select
                name="government_id_type"
                value={formData.government_id_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herb-green-500 outline-none bg-white"
              >
                <option value="aadhar">Aadhaar Card (India)</option>
                <option value="pan">PAN Card (India)</option>
                <option value="passport">Passport</option>
                <option value="business_license">Business License</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Government ID Number</label>
              <input
                type="text"
                name="government_id_number"
                value={formData.government_id_number}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${formErrors.government_id_number ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-herb-green-500'}`}
              />
              {formErrors.government_id_number && <p className="text-red-500 text-xs mt-1">{formErrors.government_id_number}</p>}
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Complete Onboarding
            </Button>
          </form>

          <div className="text-center">
            <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-gray-700">
              Sign out and return later
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
