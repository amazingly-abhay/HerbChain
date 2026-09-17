import { useAuth } from '@/contexts/AuthContext';
import { User, Shield, Mail, Phone, Calendar } from 'lucide-react';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 bg-herb-green-100 text-herb-green-700 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md">
          {getInitials(user.name)}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500 mb-3">{user.email}</p>
          <Badge variant="default" className="text-sm capitalize">{user.role}</Badge>
        </div>
        <Button variant="outline">Edit Profile</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="p-4 border-b flex items-center gap-2">
            <User size={18} className="text-gray-500" />
            <h3 className="font-semibold text-gray-900">Personal Information</h3>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="text-gray-400 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-gray-400 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium text-gray-900">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-0.5" size={18} />
              <div>
                <p className="text-sm text-gray-500">Joined Date</p>
                <p className="font-medium text-gray-900">January 15, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 border-b flex items-center gap-2">
            <Shield size={18} className="text-gray-500" />
            <h3 className="font-semibold text-gray-900">KYC Status</h3>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Identity Verification</h4>
                  <p className="text-xs text-gray-500">Government ID & Role Credentials</p>
                </div>
              </div>
              <Badge variant={user.kycStatus === 'verified' ? 'success' : 'warning'}>
                {user.kycStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
