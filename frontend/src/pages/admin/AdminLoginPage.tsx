import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, KeyRound, AlertCircle, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const [isBootstrap, setIsBootstrap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  // Bootstrap state
  const [bootstrapForm, setBootstrapForm] = useState({
    username: 'admin',
    email: 'admin@herbchain.org',
    name: 'System Administrator',
    password: '',
    bootstrap_secret: '',
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(loginForm.username, loginForm.password);
      toast.success('Admin authentication verified');
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Administrative authentication failed. Ensure you have the Admin role and correct credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminApi.bootstrap(bootstrapForm);
      toast.success('Administrator provisioned successfully! You can now log in.');
      setIsBootstrap(false);
      setLoginForm({
        username: bootstrapForm.username,
        password: bootstrapForm.password,
      });
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Admin bootstrap failed. Please verify the bootstrap secret key.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          HerbChain Admin Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Restricted access for system administrators and governance personnel
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10"
        >
          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isBootstrap ? (
            /* Standard Admin Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Admin Username or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="admin or admin@herbchain.org"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 focus:outline-none shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all duration-150"
              >
                {loading ? (
                  <span>Verifying credentials...</span>
                ) : (
                  <>
                    <span>Authenticate & Access Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* First-Time Bootstrap Setup Form */
            <form onSubmit={handleBootstrapSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Initialize the primary root administrator account using your platform bootstrap secret.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={bootstrapForm.name}
                  onChange={(e) => setBootstrapForm({ ...bootstrapForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={bootstrapForm.username}
                    onChange={(e) => setBootstrapForm({ ...bootstrapForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={bootstrapForm.email}
                    onChange={(e) => setBootstrapForm({ ...bootstrapForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={bootstrapForm.password}
                  onChange={(e) => setBootstrapForm({ ...bootstrapForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">Bootstrap Secret Key</label>
                <input
                  type="password"
                  required
                  value={bootstrapForm.bootstrap_secret}
                  onChange={(e) => setBootstrapForm({ ...bootstrapForm, bootstrap_secret: e.target.value })}
                  placeholder="ADMIN_BOOTSTRAP_SECRET"
                  className="w-full px-3 py-2 bg-slate-950 border border-amber-500/40 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 focus:outline-none shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading ? 'Initializing Administrator...' : 'Bootstrap Root Administrator'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col items-center gap-2 text-xs">
            <button
              onClick={() => {
                setError('');
                setIsBootstrap(!isBootstrap);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              {isBootstrap ? 'Already initialized? Back to Admin Login' : 'First-time setup? Bootstrap Root Admin'}
            </button>
            <Link to="/login" className="text-slate-400 hover:text-slate-300 transition-colors">
              Return to Supply Chain Actor Portal
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
