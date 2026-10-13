import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  User, Shield, Mail, Phone, Calendar, MapPin, Building,
  Camera, CheckCircle, Clock, AlertCircle, Edit3, X, Save,
  Copy, ExternalLink, Wallet, UploadCloud, RefreshCw, FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ACTOR_ROLES } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import WalletConnectModal from '@/components/WalletConnectModal';

const PRESET_AVATARS = [
  { id: 'botanist', label: 'Botanist', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { id: 'herbalist', label: 'Herbalist', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'farmer', label: 'Cultivator', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  { id: 'scientist', label: 'QA Officer', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
  { id: 'manager', label: 'Distributor', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80' },
];

export default function ProfilePage() {
  const { user, updateProfile, submitKyc, disconnectWallet } = useAuth();
  const { t, locale } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });

  // KYC form state
  const [isEditingKyc, setIsEditingKyc] = useState(false);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycData, setKycData] = useState({
    government_id_type: user?.government_id_type || 'aadhaar',
    government_id_number: user?.government_id_number || '',
    document_hash: user?.kyc_document_hash || '',
  });
  const [kycFilePreview, setKycFilePreview] = useState<string | null>(null);

  if (!user) return null;

  const currentRoleInfo = ACTOR_ROLES.find(r => r.role === user.role);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
      toast.success(t('profile.saveChanges') ? `${t('profile.saveChanges')} ✓` : 'Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image size must be under 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        await updateProfile({ avatar: dataUrl });
        toast.success('Profile picture updated');
        setShowAvatarModal(false);
      } catch (err) {
        toast.error('Failed to update avatar');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = async (avatarUrl: string) => {
    try {
      await updateProfile({ avatar: avatarUrl });
      toast.success('Profile picture updated');
      setShowAvatarModal(false);
    } catch (err) {
      toast.error('Failed to update avatar');
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await updateProfile({ avatar: '' });
      toast.success('Profile picture removed');
      setShowAvatarModal(false);
    } catch (err) {
      toast.error('Failed to remove avatar');
    }
  };

  const handleKycFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setKycFilePreview(file.name);
      // Simulate IPFS CID generation for document
      const fakeCid = 'Qm' + Array.from(crypto.getRandomValues(new Uint8Array(22)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      setKycData(prev => ({ ...prev, document_hash: fakeCid }));
    };
    reader.readAsDataURL(file);
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycData.government_id_number.trim()) {
      toast.error('Government ID Number is required');
      return;
    }
    setIsSubmittingKyc(true);
    try {
      await submitKyc(kycData);
      toast.success('KYC details updated & verified');
      setIsEditingKyc(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit KYC');
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formattedJoinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'January 15, 2024';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-herb-green-600 via-herb-amber-500 to-herb-green-700" />

        {/* Profile Picture & Camera Trigger */}
        <div className="relative group shrink-0">
          <div className="w-28 h-28 bg-herb-green-100 text-herb-green-700 rounded-2xl flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md overflow-hidden transition-transform group-hover:scale-105">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowAvatarModal(true)}
            className="absolute -bottom-2 -right-2 bg-herb-green-700 text-white p-2 rounded-xl shadow-md hover:bg-herb-green-800 transition-colors border-2 border-white cursor-pointer"
            title={t('profile.avatarChange') || 'Change Photo'}
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* User Details Header */}
        <div className="text-center md:text-left flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{user.name}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Badge variant="default" className="text-xs uppercase tracking-wider font-semibold">
                {locale === 'hi' && currentRoleInfo?.labelHi ? currentRoleInfo.labelHi : user.role}
              </Badge>
              <Badge 
                variant={user.kycStatus === 'verified' ? 'success' : user.kycStatus === 'rejected' ? 'error' : 'warning'}
                className="text-xs flex items-center gap-1 font-medium capitalize"
              >
                {user.kycStatus === 'verified' ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {user.kycStatus === 'verified'
                  ? (t('profile.verified') || 'Verified')
                  : user.kycStatus === 'rejected'
                  ? (t('profile.rejected') || 'Rejected')
                  : (t('profile.pending') || 'Pending KYC')}
              </Badge>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-2">{user.email}</p>

          <p className="text-xs text-gray-600 max-w-xl">
            {user.bio || currentRoleInfo?.description || 'Registered supply-chain participant on HerbChain.'}
          </p>

          {user.organization && (
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-gray-500 mt-2">
              <Building className="w-3.5 h-3.5 text-herb-green-600" />
              <span className="font-medium text-gray-700">{user.organization}</span>
              {user.location && (
                <>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-herb-amber-600" />
                  <span>{user.location}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Edit Button */}
        <div className="shrink-0 flex items-center gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData({
                  name: user.name || '',
                  phone: user.phone || '',
                  organization: user.organization || '',
                  location: user.location || '',
                  bio: user.bio || '',
                });
                setIsEditing(true);
              }}
              leftIcon={<Edit3 className="w-4 h-4" />}
            >
              {t('profile.editProfile') || 'Edit Profile'}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              leftIcon={<X className="w-4 h-4" />}
            >
              {t('profile.cancelEdit') || 'Cancel'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Personal & Contact Information */}
        <Card>
          <CardHeader className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-herb-green-600" />
              <h3 className="font-semibold text-gray-900">{t('profile.personalInfo') || 'Personal Information'}</h3>
            </div>
            {isEditing && (
              <span className="text-xs text-herb-amber-600 font-medium bg-herb-amber-50 px-2 py-0.5 rounded">
                Editing Mode
              </span>
            )}
          </CardHeader>
          <CardContent className="p-5">
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('profile.fullName') || 'Full Name'}</p>
                    <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('profile.email') || 'Email Address'}</p>
                    <p className="font-medium text-gray-900 text-sm">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('profile.phone') || 'Phone Number'}</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {user.phone || '+91 98765 43210'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('profile.organization') || 'Organization / Farm'}</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {user.organization || 'Himalayan Organic Herb Co-op'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('profile.location') || 'Location'}</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {user.location || 'Wayanad, Kerala, India'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Joined Date</p>
                    <p className="font-medium text-gray-900 text-sm">{formattedJoinedDate}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <Input
                  label={t('profile.fullName') || 'Full Name'}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />

                <Input
                  label={t('profile.phone') || 'Phone Number'}
                  value={formData.phone}
                  placeholder="+91 98765 43210"
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />

                <Input
                  label={t('profile.organization') || 'Organization / Farm / Facility'}
                  value={formData.organization}
                  placeholder="e.g. Organic Herb Cooperative"
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                />

                <Input
                  label={t('profile.location') || 'Location / Address'}
                  value={formData.location}
                  placeholder="e.g. Wayanad, Kerala"
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />

                <Textarea
                  label={t('profile.bio') || 'About / Bio'}
                  value={formData.bio}
                  placeholder="Brief description of your role and activities"
                  rows={2}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    {t('common.cancel') || 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    {t('profile.saveChanges') || 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Card 2: KYC Settings & Verification */}
        <Card>
          <CardHeader className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">{t('profile.kycInfo') || 'KYC & Verification'}</h3>
            </div>
            {!isEditingKyc ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingKyc(true)}
                className="text-xs text-herb-green-700"
              >
                {t('profile.resubmitKyc') || 'Update KYC'}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingKyc(false)}
                className="text-xs"
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            {/* KYC Status Banner */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              user.kycStatus === 'verified' 
                ? 'bg-green-50 border-green-200 text-green-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                user.kycStatus === 'verified' ? 'bg-green-200 text-green-700' : 'bg-amber-200 text-amber-700'
              }`}>
                {user.kycStatus === 'verified' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {user.kycStatus === 'verified' ? 'Identity Verified' : 'KYC Verification Pending'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {user.kycStatus === 'verified' 
                    ? 'Your government credentials and supply-chain role authorization are verified on-chain.' 
                    : 'Submit your credentials to complete identity validation.'}
                </p>
              </div>
            </div>

            {!isEditingKyc ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">{t('profile.idType') || 'ID Type'}</p>
                    <p className="text-sm font-semibold text-gray-800 uppercase">
                      {user.government_id_type || 'Aadhaar'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">{t('profile.idNumber') || 'ID Number'}</p>
                    <p className="text-sm font-mono font-semibold text-gray-800">
                      {user.government_id_number
                        ? `•••• •••• ${user.government_id_number.slice(-4)}`
                        : '•••• •••• 9012'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">{t('profile.idDoc') || 'Verification Document'}</p>
                      <p className="text-xs font-mono text-gray-700 truncate max-w-[220px]">
                        {user.kyc_document_hash || 'QmHerbChainVerifiedCertID2025'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-herb-green-100 text-herb-green-800 px-2 py-0.5 rounded font-medium">
                    IPFS Sealed
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleKycSubmit} className="space-y-4">
                <Select
                  label={t('profile.idType') || 'Government ID Type'}
                  options={[
                    { value: 'aadhaar', label: 'Aadhaar Card' },
                    { value: 'pan', label: 'PAN Card' },
                    { value: 'ayush_reg', label: 'AYUSH Ministry License' },
                    { value: 'fssai', label: 'FSSAI License / Registration' },
                    { value: 'gstin', label: 'GSTIN Certificate' },
                    { value: 'passport', label: 'Passport' },
                  ]}
                  value={kycData.government_id_type}
                  onChange={(val) => setKycData(prev => ({ ...prev, government_id_type: val }))}
                />

                <Input
                  label={t('profile.idNumber') || 'ID Document Number'}
                  value={kycData.government_id_number}
                  placeholder="Enter credential number"
                  onChange={(e) => setKycData(prev => ({ ...prev, government_id_number: e.target.value }))}
                  required
                />

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    {t('profile.uploadIdDoc') || 'Upload ID Document / Certificate'}
                  </label>
                  <label className="border-2 border-dashed border-gray-200 hover:border-herb-green-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-white transition-all text-center">
                    <UploadCloud className="w-8 h-8 text-herb-green-600 mb-1" />
                    <span className="text-xs font-medium text-gray-700">
                      {kycFilePreview || 'Click to upload PDF or image (max 5MB)'}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      Documents are hashed and stored on IPFS
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleKycFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingKyc(false)}
                  >
                    {t('common.cancel') || 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSubmittingKyc}
                    leftIcon={<Shield className="w-4 h-4" />}
                  >
                    {t('profile.submitKyc') || 'Verify Credentials'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card 3: Web3 Blockchain Identity */}
      <Card>
        <CardHeader className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-herb-green-600" />
            <h3 className="font-semibold text-gray-900">{t('profile.walletDetails') || 'Web3 Wallet & Identity'}</h3>
          </div>
          <span className="text-xs bg-herb-green-50 text-herb-green-700 px-2.5 py-1 rounded-full font-medium border border-herb-green-200">
            Smart Contract Verified
          </span>
        </CardHeader>
        <CardContent className="p-5">
          {user.wallet_address ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-green-50/60 rounded-xl border border-green-200">
              <div className="min-w-0">
                <p className="text-xs text-green-800 font-semibold mb-1">
                  {t('profile.connectedWallet') || 'Connected Wallet Address'}
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-green-950 font-bold truncate">
                    {user.wallet_address}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(user.wallet_address!, 'Wallet address')}
                    className="p-1 hover:bg-green-200/60 rounded text-green-800 transition-colors cursor-pointer"
                    title="Copy address"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`https://amoy.polygonscan.com/address/${user.wallet_address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:bg-green-200/60 rounded text-green-800 transition-colors"
                    title="View on Polygonscan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 shrink-0 self-start sm:self-auto"
                onClick={async () => {
                  try {
                    await disconnectWallet();
                    toast.success('Wallet disconnected');
                  } catch {
                    toast.error('Failed to disconnect wallet');
                  }
                }}
              >
                {t('profile.disconnectWallet') || 'Disconnect'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t('profile.noWallet') || 'No Web3 wallet linked'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Connect your MetaMask or Web3 wallet for direct on-chain signatures and verifiable identity.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowWalletModal(true)}
                leftIcon={<Wallet className="w-4 h-4" />}
              >
                {t('profile.connectWallet') || 'Connect Wallet'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-gray-900 text-lg">Update Profile Picture</h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload from Computer */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">
                  Upload Custom Image
                </label>
                <label className="border-2 border-dashed border-gray-200 hover:border-herb-green-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-white transition-all text-center">
                  <UploadCloud className="w-8 h-8 text-herb-green-600 mb-1" />
                  <span className="text-sm font-medium text-gray-800">Choose image file</span>
                  <span className="text-xs text-gray-400">PNG, JPG, WEBP up to 3MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Presets */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">
                  Or Choose a Persona Avatar
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(avatar.url)}
                      className="w-14 h-14 rounded-xl overflow-hidden border-2 border-transparent hover:border-herb-green-600 transition-all focus:outline-none focus:ring-2 focus:ring-herb-green-500 cursor-pointer"
                      title={avatar.label}
                    >
                      <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {user.avatar && (
                <div className="pt-2 border-t flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 text-xs"
                    onClick={handleRemoveAvatar}
                  >
                    Remove Photo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAvatarModal(false)}
                  >
                    Done
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </div>
  );
}
