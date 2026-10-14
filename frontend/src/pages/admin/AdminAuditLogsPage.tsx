import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  FileText, 
  Calendar, 
  Globe, 
  User, 
  Eye, 
  X,
  Code
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AuditLogEntry } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import Loader from '@/components/ui/Loader';
import toast from 'react-hot-toast';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;

      const data = await adminApi.getAuditLogs(params);
      setLogs(data.logs);
      setTotalCount(data.total);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      toast.error('Failed to load audit records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, actionFilter]);

  const getActionBadge = (action: string) => {
    if (action.includes('LOGIN')) {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
    if (action.includes('ROLE')) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
    if (action.includes('SUSPENDED')) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
    if (action.includes('ACTIVATED') || action.includes('BOOTSTRAP')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
    if (action.includes('CONFIG')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
    if (action.includes('KYC')) {
      return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
    }
    return 'bg-slate-700 text-slate-300 border-slate-600';
  };

  const actionOptions = [
    'ADMIN_LOGIN',
    'ADMIN_BOOTSTRAP',
    'USER_ROLE_CHANGED',
    'USER_ACTIVATED',
    'USER_SUSPENDED',
    'KYC_STATUS_UPDATED',
    'SYSTEM_CONFIG_UPDATED',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security & Governance Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all administrative actions, role assignments, status modifications, and security events.
          </p>
        </div>
        <button
          onClick={() => fetchLogs()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by admin, action, target..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Audit Action Types</option>
              {actionOptions.map((act) => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end text-xs text-slate-400 font-medium">
            <span>Showing {logs.length} of {totalCount} total audit entries</span>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader text="Retrieving verified audit logs..." />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No audit records found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Event ID & Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Admin Operator</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Timestamp & ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] text-slate-400 font-semibold">{log.id}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        <span>{formatDateTime(log.timestamp)}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Admin Operator */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-white">
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{log.admin_username}</span>
                      </div>
                    </td>

                    {/* Target Resource */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      {log.target_resource}
                    </td>

                    {/* IP */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-600" />
                      <span>{log.ip_address}</span>
                    </td>

                    {/* Details View */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3 h-3 text-emerald-400" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Audit Record: {selectedLog.id}</span>
                </h3>
                <span className="text-xs text-slate-400">{formatDateTime(selectedLog.timestamp)}</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-semibold">Action</span>
                  <div className="font-semibold text-white mt-0.5">{selectedLog.action}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-semibold">Operator</span>
                  <div className="font-semibold text-white mt-0.5">{selectedLog.admin_username}</div>
                </div>
                <div className="mt-2">
                  <span className="text-slate-500 uppercase text-[10px] font-semibold">Target</span>
                  <div className="font-mono text-slate-300 mt-0.5">{selectedLog.target_resource}</div>
                </div>
                <div className="mt-2">
                  <span className="text-slate-500 uppercase text-[10px] font-semibold">IP Address</span>
                  <div className="font-mono text-slate-300 mt-0.5">{selectedLog.ip_address}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5 mb-1.5">
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Payload & Change Delta</span>
                </span>
                <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Close Record
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
