import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, FileCheck, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ACTOR_ROLES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import FileUpload from '@/components/ui/FileUpload';

interface KYCFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function KYCForm({ onSubmit, onCancel }: KYCFormProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    address: '',
    idDocType: 'aadhaar',
  });

  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [businessLicense, setBusinessLicense] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!idDocument) newErrors.idDocument = 'ID document is required';
    if (!selfie) newErrors.selfie = 'Selfie is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSubmit({
          ...formData,
          idDocument,
          businessLicense,
          selfie,
        });
      }, 2000);
    }, 1500);
  };

  const roleOptions = ACTOR_ROLES.map(r => ({ value: r.role, label: r.label }));
  const docTypeOptions = [
    { value: 'aadhaar', label: 'Aadhaar Card' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'passport', label: 'Passport' },
    { value: 'voter_id', label: 'Voter ID' },
  ];

  if (isSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">KYC Submitted Successfully!</h3>
        <p className="text-gray-600">Your documents are under review. You will be notified once verified.</p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-herb-green-600" />
          Personal Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            error={errors.fullName}
            leftIcon={<User className="w-4 h-4 text-gray-400" />}
          />
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+91 9876543210"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
          />
          <Select
            label="Role"
            options={roleOptions}
            value={formData.role}
            onChange={(value) => handleChange('role', value)}
            placeholder="Select role"
            error={errors.role}
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="Address"
            placeholder="Full address including city, state, pincode"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            error={errors.address}
            rows={2}
          />
        </div>
      </div>

      {/* Document Uploads */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-herb-green-600" />
          Document Verification
        </h3>

        <div className="space-y-4">
          <Select
            label="ID Document Type"
            options={docTypeOptions}
            value={formData.idDocType}
            onChange={(value) => handleChange('idDocType', value)}
          />

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <FileUpload
                label="ID Document *"
                onFileSelect={async (file) => {
                  const reader = new FileReader();
                  reader.onload = () => setIdDocument(reader.result as string);
                  reader.readAsDataURL(file);
                }}
                accept="image/*,.pdf"
                preview={idDocument}
                error={errors.idDocument}
              />
            </div>
            <div>
              <FileUpload
                label="Business License (Optional)"
                onFileSelect={async (file) => {
                  const reader = new FileReader();
                  reader.onload = () => setBusinessLicense(reader.result as string);
                  reader.readAsDataURL(file);
                }}
                accept="image/*,.pdf"
                preview={businessLicense}
              />
            </div>
            <div>
              <FileUpload
                label="Selfie *"
                onFileSelect={async (file) => {
                  const reader = new FileReader();
                  reader.onload = () => setSelfie(reader.result as string);
                  reader.readAsDataURL(file);
                }}
                accept="image/*"
                preview={selfie}
                error={errors.selfie}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('common.cancel') || 'Cancel'}
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          leftIcon={<FileCheck className="w-4 h-4" />}
        >
          Submit KYC
        </Button>
      </div>
    </motion.form>
  );
}
