import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sliders, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles, 
  Beaker, 
  Scale, 
  RefreshCw 
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { SystemConfig } from '@/lib/types';
import Loader from '@/components/ui/Loader';
import toast from 'react-hot-toast';

export default function AdminConfigPage() {
  const [config, setConfig] = useState<SystemConfig>({
    min_purity_percent: 80.0,
    max_moisture_percent: 12.0,
    ai_confidence_threshold: 80.0,
    maintenance_mode: false,
    auto_verify_kyc: false,
    allowed_units: ['kg', 'g', 'quintal', 'ton'],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getConfig();
      setConfig(data);
    } catch (err) {
      console.error('Failed to load system config:', err);
      toast.error('Failed to fetch platform configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminApi.updateConfig(config);
      setConfig(updated);
      toast.success('System configuration updated and audit log recorded');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to update system config');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader text="Retrieving platform governance parameters..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform System Configuration</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure automated validation thresholds, quality policies, and global governance controls.
          </p>
        </div>
        <button
          onClick={fetchConfig}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reload Config</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Lab Testing Quality Policies */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Beaker className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Laboratory Quality & Testing Thresholds</h2>
              <p className="text-xs text-slate-400">Rules determining automatic pass/fail during the lab testing phase</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Min Purity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Minimum Chemical Purity (%)
                </label>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  {config.min_purity_percent}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                step="0.5"
                value={config.min_purity_percent}
                onChange={(e) => setConfig({ ...config, min_purity_percent: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Lab results with purity below this value will automatically be marked as Failed.
              </p>
            </div>

            {/* Max Moisture */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Maximum Allowable Moisture (%)
                </label>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                  {config.max_moisture_percent}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="0.5"
                value={config.max_moisture_percent}
                onChange={(e) => setConfig({ ...config, max_moisture_percent: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Moisture content exceeding this limit will trigger batch failure or drying re-processing.
              </p>
            </div>
          </div>
        </div>

        {/* AI & Automation Thresholds */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Vision & Automated Checks</h2>
              <p className="text-xs text-slate-400">Settings for Gemini AI botanical verification and KYC automation</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  AI Botanical Confidence Cutoff (%)
                </label>
                <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-500/20">
                  {config.ai_confidence_threshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={config.ai_confidence_threshold}
                onChange={(e) => setConfig({ ...config, ai_confidence_threshold: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Batches with AI plant identification confidence below this score are automatically flagged for manual inspector review.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Automated KYC Auto-Approval</div>
                <div className="text-[11px] text-slate-400">
                  Automatically mark submitted government IDs as verified without manual administrative review (useful for test environments).
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.auto_verify_kyc}
                  onChange={(e) => setConfig({ ...config, auto_verify_kyc: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Global Controls & Maintenance Mode */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Platform Governance & Maintenance</h2>
              <p className="text-xs text-slate-400">Global system operational status</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <span>Platform Maintenance Mode</span>
                {config.maintenance_mode && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Active
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                When enabled, non-admin actors will see a system maintenance alert and batch creation will pause.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.maintenance_mode}
                onChange={(e) => setConfig({ ...config, maintenance_mode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all font-bold"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving System Changes...' : 'Save Configuration Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
