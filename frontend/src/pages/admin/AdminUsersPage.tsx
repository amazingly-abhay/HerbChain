import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit3, 
  MoreVertical, 
  RefreshCw,
  AlertCircle,
  Shield
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { User, ActorRole } from '@/lib/types';
import { ACTOR_ROLES } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import Loader from '@/components/ui/Loader';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>('collector');
  const [roleLoading, setRoleLoading] = useState(false);

  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycStatusToSet, setKycStatusToSet] = useState<'verified' | 'rejected'>('verified');
  const [kycNotes, setKycNotes] = useState('');
  const [kycLoading, setKycLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (kycFilter) params.kyc_status = kycFilter;
      if (statusFilter !== '') params.is_active = statusFilter === 'active';

      const data = await adminApi.getUsers(params);
      setUsers(data.users);
      setTotalCount(data.total);
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter, kycFilter]);

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    setRoleLoading(true);
    try {
      await adminApi.updateUserRole(selectedUser.id, newRole);
      toast.success(`Role updated to ${newRole}`);
      setRoleModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update role');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleKycUpdate = async () => {
    if (!selectedUser) return;
    setKycLoading(true);
    try {
      await adminApi.updateUserKyc(selectedUser.id, kycStatusToSet, kycNotes);
      toast.success(`KYC status updated to ${kycStatusToSet}`);
      setKycModalOpen(false);
      setKycNotes('');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update KYC');
    } finally {
      setKycLoading(false);
    }
  };

  const handleStatusToggle = async (user: User) => {
    const nextStatus = !user.is_active;
    const actionText = nextStatus ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${actionText} user @${user.username || user.name}?`)) {
      return;
    }

    try {
      await adminApi.updateUserStatus(user.id, nextStatus);
      toast.success(`User ${user.username || user.name} account ${nextStatus ? 'activated' : 'suspended'}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to toggle status');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'collector':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'processor':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'tester':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'shipper':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'retailer':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"><CheckCircle className="w-3 h-3" /> Verified</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Governance & Access Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage actor identities, enforce role permissions, review KYC verifications, and regulate platform access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, handle..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Roles ({totalCount})</option>
              {ACTOR_ROLES.map((r) => (
                <option key={r.role} value={r.role}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* KYC Status Filter */}
          <div>
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All KYC Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Account Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Suspended Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader text="Loading registered accounts..." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No users match the specified criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">KYC Status</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{u.name || u.username}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                          {u.organization && (
                            <div className="text-[10px] text-slate-500">{u.organization}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${getRoleBadge(u.role)}`}>
                        {u.role || 'Unassigned'}
                      </span>
                    </td>

                    {/* KYC Status */}
                    <td className="py-3.5 px-4">
                      {getKycBadge(u.kycStatus || 'pending')}
                    </td>

                    {/* Account Status */}
                    <td className="py-3.5 px-4">
                      {u.is_active !== false ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Suspended
                        </span>
                      )}
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {u.created_at ? formatDateTime(u.created_at) : 'N/A'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setNewRole(u.role || 'collector');
                            setRoleModalOpen(true);
                          }}
                          title="Change Role"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-colors"
                        >
                          Role
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setKycStatusToSet(u.kycStatus === 'verified' ? 'rejected' : 'verified');
                            setKycModalOpen(true);
                          }}
                          title="Review KYC"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-colors"
                        >
                          KYC
                        </button>

                        <button
                          onClick={() => handleStatusToggle(u)}
                          title={u.is_active !== false ? "Suspend Account" : "Activate Account"}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                            u.is_active !== false 
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30' 
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {u.is_active !== false ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {roleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-base font-bold text-white mb-1">
              Modify User Role: {selectedUser.name || selectedUser.username}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select the supply-chain actor role or promote/demote to administrator.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Assignment</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {ACTOR_ROLES.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label} — {r.description}
                    </option>
                  ))}
                </select>
              </div>

              {newRole === 'admin' && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-start gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Granting Administrator privileges grants full access to user governance, system configs, and supply chain bypass powers.
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setRoleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                disabled={roleLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
              >
                {roleLoading ? 'Saving...' : 'Update Role'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* KYC Review Modal */}
      {kycModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-base font-bold text-white mb-1">
              KYC Verification Review: {selectedUser.name || selectedUser.username}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Government ID: {selectedUser.government_id_type || 'N/A'} — {selectedUser.government_id_number || 'N/A'}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Verification Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setKycStatusToSet('verified')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      kycStatusToSet === 'verified'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Approve & Verify</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setKycStatusToSet('rejected')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      kycStatusToSet === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Review Notes (Optional)</label>
                <textarea
                  value={kycNotes}
                  onChange={(e) => setKycNotes(e.target.value)}
                  placeholder="Reason for decision, verified credentials, or requested corrections..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setKycModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleKycUpdate}
                disabled={kycLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
              >
                {kycLoading ? 'Saving...' : 'Confirm Decision'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
