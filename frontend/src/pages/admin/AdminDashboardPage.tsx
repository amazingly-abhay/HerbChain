import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Package, 
  Scale, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  ShieldCheck, 
  Clock, 
  Activity, 
  ArrowUpRight,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AdminAnalytics } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { Link } from 'react-router-dom';
import Loader from '@/components/ui/Loader';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const data = await adminApi.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader text="Aggregating platform intelligence..." />
      </div>
    );
  }

  const overview = analytics?.overview || {
    total_batches: 0,
    total_herb_mass_kg: 0,
    total_events: 0,
    total_users: 0,
    active_users: 0,
    inactive_users: 0,
    pass_rate_percentage: 100,
    manual_checks_required: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Intelligence & Operations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time supply chain throughput, purity rates, and governance metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volume */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Herb Mass</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {overview.total_herb_mass_kg.toLocaleString()} <span className="text-xs font-normal text-emerald-400">kg</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Across all active batches</p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </motion.div>

        {/* Total Batches */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Batches</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {overview.total_batches}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{overview.total_events} verifiable lifecycle events</p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
        </motion.div>

        {/* Quality Pass Rate */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lab Pass Rate</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {overview.pass_rate_percentage}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Based on lab testing criteria</p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
        </motion.div>

        {/* Total Actors */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Network Participants</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {overview.total_users}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{overview.active_users} active actors onboarded</p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        </motion.div>
      </div>

      {/* Operational Attention Alerts */}
      {(overview.manual_checks_required > 0 || (analytics?.kyc_breakdown?.pending || 0) > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {overview.manual_checks_required > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold">{overview.manual_checks_required} Batches Require Manual Verification</div>
                  <div className="text-xs text-amber-300/80">AI confidence below configured threshold during collection.</div>
                </div>
              </div>
              <Link to="/batches" className="text-xs font-semibold underline text-amber-300 hover:text-amber-200">
                Inspect
              </Link>
            </div>
          )}

          {(analytics?.kyc_breakdown?.pending || 0) > 0 && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold">{analytics?.kyc_breakdown?.pending} KYC Verification Pending</div>
                  <div className="text-xs text-blue-300/80">Actors awaiting administrative credential approval.</div>
                </div>
              </div>
              <Link to="/admin/users" className="text-xs font-semibold underline text-blue-300 hover:text-blue-200">
                Review Users
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Charts Section: Top Herbs Volume & Supply Chain Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Herb Mass Distribution Bar Chart */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Top Herbs by Mass (kg)</h2>
              <p className="text-xs text-slate-400">Total volume logged by collectors & processors</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {analytics?.top_herbs && analytics.top_herbs.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.top_herbs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} 
                  />
                  <Bar dataKey="quantity_kg" name="Quantity (kg)" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No herb volume recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Stage Progression Funnel */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Supply Chain Lifecycle Funnel</h2>
              <p className="text-xs text-slate-400">Distribution of batches across pipeline stages</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {analytics?.stage_funnel ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={analytics.stage_funnel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis type="category" dataKey="label" stroke="#94a3b8" fontSize={12} width={85} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} 
                  />
                  <Bar dataKey="count" name="Batches" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No stage data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Quality Testing Breakdown & Actor Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lab Testing Status Pie */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-white mb-1">Lab Testing Status</h2>
          <p className="text-xs text-slate-400 mb-4">Quality conformance inspection results</p>
          <div className="h-56 w-full flex items-center justify-center">
            {analytics?.quality_distribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.quality_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.quality_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>
          <div className="flex justify-center gap-4 text-xs mt-2">
            {analytics?.quality_distribution.map((q) => (
              <div key={q.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: q.color }} />
                <span className="text-slate-300">{q.name} ({q.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actor Role Breakdown */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-white mb-1">Actor Role Distribution</h2>
          <p className="text-xs text-slate-400 mb-4">Registered ecosystem stakeholders</p>
          <div className="space-y-3">
            {analytics?.role_breakdown.map((r) => (
              <div key={r.role} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium capitalize">{r.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ 
                        width: `${overview.total_users > 0 ? (r.count / overview.total_users) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-slate-400 font-semibold w-6 text-right">{r.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Recent Audit Events</h2>
                <p className="text-xs text-slate-400">Security & governance trace</p>
              </div>
              <Link to="/admin/audit-logs" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {analytics?.recent_audit_logs && analytics.recent_audit_logs.length > 0 ? (
                analytics.recent_audit_logs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-300">{log.action}</span>
                      <span className="text-[10px] text-slate-500">{formatDateTime(log.timestamp)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">
                      By <span className="text-slate-300 font-medium">{log.admin_username}</span> on {log.target_resource}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No recent audit events recorded.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Immutable Ledger Protection Active</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
