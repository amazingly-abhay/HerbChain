import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Leaf } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ACTOR_ROLES } from '@/lib/constants';
import { ActorRole } from '@/lib/types';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('collector@demo.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
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
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-herb-cream">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-green p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">HerbChain</span>
        </div>
        <div className="space-y-6 max-w-md relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Supply Chain Traceability Prototype</h1>
          <p className="text-herb-green-100 text-lg">
            Track Ayurvedic medicinal plants from wild collection through processing, testing, shipment, and retail with verifiable history.
          </p>
        </div>
        <p className="text-xs text-herb-green-200 relative z-10">© 2026 HerbChain Prototype</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600">Select a role and test the supply chain workflow.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${formErrors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-herb-green-500'}`}
              />
              {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors(prev => ({ ...prev, password: '' }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${formErrors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-herb-green-500'}`}
              />
              {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-herb-green-600 hover:text-herb-green-500">
                Register here
              </Link>
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500 mb-3 uppercase tracking-wider font-semibold">Quick Demo Users</p>
            <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600 space-y-1 font-mono">
              <p>Collector: collector@demo.com</p>
              <p>Processor: processor@demo.com</p>
              <p>Tester: tester@demo.com</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
