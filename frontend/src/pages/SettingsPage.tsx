import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Globe, Bell, Shield, Lock, Database, Check,
  Download, Trash2, Cpu, AlertTriangle, KeyRound
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { UNITS } from '@/lib/constants';

export default function SettingsPage() {
  const { user, updateSettings, changePassword } = useAuth();
  const { locale, setLocale, t } = useLanguage();

  // Settings State
  const [settings, setSettings] = useState({
    language: (user?.settings?.language || locale || 'en') as 'en' | 'hi',
    dateFormat: user?.settings?.dateFormat || 'DD/MM/YYYY',
    defaultUnit: user?.settings?.defaultUnit || 'kg',
    emailNotifications: user?.settings?.emailNotifications ?? true,
    labAlerts: user?.settings?.labAlerts ?? true,
    criticalAlerts: user?.settings?.criticalAlerts ?? true,
    pushNotifications: user?.settings?.pushNotifications ?? false,
    preferredNetwork: user?.settings?.preferredNetwork || 'polygon_amoy',
    autoGasEstimate: user?.settings?.autoGasEstimate ?? true,
    explorerUrl: user?.settings?.explorerUrl || 'https://amoy.polygonscan.com',
    autoRefreshFeed: user?.settings?.autoRefreshFeed ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user?.settings) {
      setSettings(prev => ({
        ...prev,
        ...user.settings,
      }));
    }
  }, [user]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSettings(settings);
      if (settings.language !== locale) {
        setLocale(settings.language);
      }
      toast.success(t('settings.settingsSaved') || 'Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('settings.passwordMismatch') || 'New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      toast.success(t('settings.passwordSuccess') || 'Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to update password';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = () => {
    const exportObject = {
      profile: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        phone: user?.phone,
        location: user?.location,
        organization: user?.organization,
        wallet_address: user?.wallet_address,
        kycStatus: user?.kycStatus,
      },
      settings,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `herbchain_user_data_${user?.username || 'account'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Account data exported');
  };

  const handleClearCache = () => {
    const confirmed = window.confirm('Are you sure you want to clear cached temporary data? You may be logged out.');
    if (confirmed) {
      localStorage.removeItem('herbchain-user');
      sessionStorage.clear();
      toast.success(t('settings.clearCacheSuccess') || 'Local cache cleared successfully');
      setTimeout(() => window.location.reload(), 800);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('settings.title') || 'System Settings'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('settings.subtitle') || 'Customize your platform preferences, alerts, and account security'}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleSaveSettings}
          isLoading={isSaving}
          leftIcon={<Check className="w-4 h-4" />}
        >
          {t('settings.saveSettings') || 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Preferences */}
        <Card>
          <CardHeader className="p-4 border-b flex items-center gap-2">
            <Globe className="w-5 h-5 text-herb-green-600" />
            <h3 className="font-semibold text-gray-900">{t('settings.preferences') || 'General Preferences'}</h3>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('settings.language') || 'Interface Language'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, language: 'en' }))}
                  className={`p-3 rounded-xl border text-sm font-medium text-center transition-all ${
                    settings.language === 'en'
                      ? 'border-herb-green-600 bg-herb-green-50 text-herb-green-800 ring-2 ring-herb-green-600/20'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🇬🇧 {t('settings.languageEn') || 'English'}
                </button>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, language: 'hi' }))}
                  className={`p-3 rounded-xl border text-sm font-medium text-center transition-all ${
                    settings.language === 'hi'
                      ? 'border-herb-green-600 bg-herb-green-50 text-herb-green-800 ring-2 ring-herb-green-600/20'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🇮🇳 {t('settings.languageHi') || 'हिन्दी (Hindi)'}
                </button>
              </div>
            </div>

            <Select
              label={t('settings.dateFormat') || 'Date Display Format'}
              options={[
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 15/01/2025)' },
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g. 01/15/2025)' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO 8601)' },
              ]}
              value={settings.dateFormat}
              onChange={(value) => setSettings(prev => ({ ...prev, dateFormat: value }))}
            />

            <Select
              label={t('settings.defaultUnit') || 'Default Weight Unit'}
              options={UNITS.map(u => ({ value: u, label: u.toUpperCase() }))}
              value={settings.defaultUnit}
              onChange={(value) => setSettings(prev => ({ ...prev, defaultUnit: value }))}
            />
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="p-4 border-b flex items-center gap-2">
            <Bell className="w-5 h-5 text-herb-amber-600" />
            <h3 className="font-semibold text-gray-900">{t('settings.notifications') || 'Notification Preferences'}</h3>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">
                  {t('settings.emailNotifications') || 'Email Notifications'}
                </p>
                <p className="text-xs text-gray-500">
                  {t('settings.emailNotificationsDesc') || 'Receive status alerts when batch stages progress'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="w-5 h-5 text-herb-green-600 rounded border-gray-300 focus:ring-herb-green-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">
                  {t('settings.labAlerts') || 'Lab Test Alerts'}
                </p>
                <p className="text-xs text-gray-500">
                  {t('settings.labAlertsDesc') || 'Instant notification on lab test certifications or failures'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.labAlerts}
                onChange={() => handleToggle('labAlerts')}
                className="w-5 h-5 text-herb-green-600 rounded border-gray-300 focus:ring-herb-green-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">
                  {t('settings.criticalAlerts') || 'Critical & Emergency Alerts'}
                </p>
                <p className="text-xs text-gray-500">
                  {t('settings.criticalAlertsDesc') || 'Alert on temperature excursions or supply chain quarantines'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.criticalAlerts}
                onChange={() => handleToggle('criticalAlerts')}
                className="w-5 h-5 text-herb-green-600 rounded border-gray-300 focus:ring-herb-green-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">Auto-Refresh Live Feeds</p>
                <p className="text-xs text-gray-500">Periodically refresh dashboard and active batches feed</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoRefreshFeed}
                onChange={() => handleToggle('autoRefreshFeed')}
                className="w-5 h-5 text-herb-green-600 rounded border-gray-300 focus:ring-herb-green-500 cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Blockchain & Network */}
        <Card>
          <CardHeader className="p-4 border-b flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">{t('settings.blockchain') || 'Blockchain & Network'}</h3>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <Select
              label={t('settings.network') || 'Target Network'}
              options={[
                { value: 'polygon_amoy', label: 'Polygon Amoy Testnet (Recommended)' },
                { value: 'eth_sepolia', label: 'Ethereum Sepolia Testnet' },
                { value: 'localhost', label: 'Local Hardhat Node (Development)' },
              ]}
              value={settings.preferredNetwork}
              onChange={(value) => setSettings(prev => ({ ...prev, preferredNetwork: value }))}
            />

            <Select
              label={t('settings.explorer') || 'Block Explorer'}
              options={[
                { value: 'https://amoy.polygonscan.com', label: 'Polygonscan (Amoy)' },
                { value: 'https://sepolia.etherscan.io', label: 'Etherscan (Sepolia)' },
                { value: 'https://blockscout.com', label: 'Blockscout Explorer' },
              ]}
              value={settings.explorerUrl}
              onChange={(value) => setSettings(prev => ({ ...prev, explorerUrl: value }))}
            />

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="pr-4">
                <p className="text-sm font-medium text-gray-900">
                  {t('settings.autoGas') || 'Auto Gas Price Estimation'}
                </p>
                <p className="text-xs text-gray-500">
                  {t('settings.autoGasDesc') || 'Automatically calculate optimal gas price for fast transactions'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoGasEstimate}
                onChange={() => handleToggle('autoGasEstimate')}
                className="w-5 h-5 text-herb-green-600 rounded border-gray-300 focus:ring-herb-green-500 cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Password */}
        <Card>
          <CardHeader className="p-4 border-b flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">{t('settings.security') || 'Security & Access'}</h3>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label={t('settings.currentPassword') || 'Current Password'}
                type="password"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                leftIcon={<KeyRound className="w-4 h-4 text-gray-400" />}
              />

              <Input
                label={t('settings.newPassword') || 'New Password'}
                type="password"
                placeholder="At least 6 characters"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              />

              <Input
                label={t('settings.confirmPassword') || 'Confirm New Password'}
                type="password"
                placeholder="Repeat new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                error={passwordError}
                leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  isLoading={isChangingPassword}
                  leftIcon={<Shield className="w-4 h-4" />}
                >
                  {t('settings.updatePassword') || 'Update Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone & Data */}
      <Card className="border-red-100 bg-red-50/20">
        <CardHeader className="p-4 border-b border-red-100 flex items-center gap-2 text-red-800">
          <Database className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold">{t('settings.dangerZone') || 'Data & Session'}</h3>
        </CardHeader>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {t('settings.clearCache') || 'Clear Local Cache'}
            </p>
            <p className="text-xs text-gray-500">
              {t('settings.clearCacheDesc') || 'Reset offline cache and stored application state'}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export JSON
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearCache}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
