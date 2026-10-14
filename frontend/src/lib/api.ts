import axios from 'axios';
import { AIAnalysis, Batch, BatchEvent, User, BlockchainStatus, AuditLogEntry, SystemConfig, AdminAnalytics } from './types';

const api = axios.create({
  // Vite proxies this during development; deployments can set VITE_API_URL.
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('herbchain-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    return (await api.post('auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })).data as { access_token: string; token_type: string };
  },
  register: async (data: { name: string; email: string; password: string }) => (
    await api.post('auth/register', {
      username: data.name.replace(/\s+/g, '').toLowerCase() || data.email.split('@')[0],
      email: data.email,
      name: data.name,
      password: data.password,
    })
  ).data,
  submitOnboarding: async (data: { role: string; location: string; government_id_type: string; government_id_number: string }) => {
    const response = (await api.post('auth/onboarding', data)).data;
    return { ...response, name: response.name || response.username, role: response.role } as User;
  },
  connectWallet: async (wallet_address: string) => {
    const response = (await api.post('auth/wallet', { wallet_address })).data;
    return { ...response, name: response.name || response.username, role: response.role } as User;
  },
  disconnectWallet: async () => {
    const response = (await api.post('auth/wallet', { wallet_address: '' })).data;
    return { ...response, name: response.name || response.username, role: response.role } as User;
  },
  updateProfile: async (data: { name?: string; phone?: string; location?: string; avatar?: string; organization?: string; bio?: string }) => {
    const response = (await api.put('auth/profile', data)).data;
    return { ...response, name: response.name || response.username, role: response.role } as User;
  },
  submitKyc: async (data: { government_id_type: string; government_id_number: string; document_hash?: string }) => {
    const response = (await api.post('auth/kyc', data)).data;
    return { ...response, name: response.name || response.username, role: response.role } as User;
  },
  updateSettings: async (settings: Partial<NonNullable<User['settings']>>) => {
    const response = (await api.put('auth/settings', { settings })).data;
    return { ...response, name: response.name || response.username, role: response.role } as User;
  },
  changePassword: async (data: { current_password: string; new_password: string }) => {
    return (await api.post('auth/change-password', data)).data as { message: string };
  },
  me: async () => {
    const data = (await api.get('auth/me')).data;
    return { ...data, name: data.name || data.username, role: data.role } as User;
  },
};

export const batchApi = {
  getAll: async () => (await api.get('batches')).data as Batch[],
  getById: async (id: string) => (await api.get(`batches/${id}`)).data as Batch,
  create: async (data: Pick<Batch, 'herbName' | 'herbNameHi' | 'scientificName' | 'quantity' | 'unit' | 'origin' | 'imageUrl'>) =>
    (await api.post('batches', data)).data as Batch,
  addEvent: async (batchId: string, event: BatchEvent) => {
    const payload: any = {
      stage: event.stage,
      actorId: event.actorId,
      actorName: event.actorName,
      actorRole: event.actorRole,
      location: event.location,
      notes: event.notes,
    };
    if (event.labResult) payload.labResult = event.labResult;
    if (event.labParameters) payload.labParameters = event.labParameters;
    
    return (await api.post(`batches/${batchId}/events`, payload)).data as Batch;
  },
  generateLabels: async (batchId: string, count: number) => (
    await api.post(`batches/${batchId}/labels`, { count })
  ).data as { units: any[] },
};

export const aiApi = {
  analyzePlant: async (image: File) => {
    const data = new FormData();
    data.append('file', image);
    return (await api.post('ai/analyze', data)).data as AIAnalysis;
  },
};

export const ipfsApi = {
  uploadFile: async (file: File) => {
    const data = new FormData();
    data.append('file', file);
    return (await api.post('ipfs/upload', data)).data as { ipfs_hash: string; url: string };
  },
};

export const verifyApi = {
  verifyBatch: async (identifier: string) => (
    await api.get(`verify/${identifier}`)
  ).data as { verified: boolean; batch: Batch; unit?: any; blockchainNetwork?: string },
};

export const blockchainApi = {
  getStatus: async () => (await api.get('blockchain/status')).data as BlockchainStatus,
};

export const adminApi = {
  login: async (credentials: { username: string; password: string }) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    return (await api.post('admin/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })).data as { access_token: string; token_type: string; user: User };
  },
  bootstrap: async (data: { username: string; email: string; name: string; password: string; bootstrap_secret: string }) => {
    return (await api.post('admin/auth/bootstrap', data)).data as User;
  },
  getUsers: async (params?: { search?: string; role?: string; kyc_status?: string; is_active?: boolean; limit?: number; skip?: number }) => {
    return (await api.get('admin/users', { params })).data as { total: number; limit: number; skip: number; users: User[] };
  },
  getUserDetail: async (userId: string) => {
    return (await api.get(`admin/users/${userId}`)).data as { user: User; batches: Batch[]; audit_logs: AuditLogEntry[] };
  },
  updateUserRole: async (userId: string, role: string) => {
    return (await api.put(`admin/users/${userId}/role`, { role })).data as { message: string };
  },
  updateUserStatus: async (userId: string, is_active: boolean) => {
    return (await api.put(`admin/users/${userId}/status`, { is_active })).data as { message: string };
  },
  updateUserKyc: async (userId: string, kyc_status: string, notes?: string) => {
    return (await api.put(`admin/users/${userId}/kyc`, { kyc_status, notes })).data as { message: string };
  },
  getAuditLogs: async (params?: { action?: string; search?: string; limit?: number; skip?: number }) => {
    return (await api.get('admin/audit-logs', { params })).data as { total: number; logs: AuditLogEntry[] };
  },
  getConfig: async () => {
    return (await api.get('admin/config')).data as SystemConfig;
  },
  updateConfig: async (config: SystemConfig) => {
    return (await api.put('admin/config', config)).data as SystemConfig;
  },
  getAnalytics: async () => {
    return (await api.get('admin/analytics')).data as AdminAnalytics;
  },
};

export default api;
