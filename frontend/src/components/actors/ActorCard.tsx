import { motion } from 'framer-motion';
import { MapPin, Package, Mail, Phone } from 'lucide-react';
import { Actor } from '@/lib/types';
import { getInitials, cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface ActorCardProps {
  actor: Actor;
  onClick?: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  collector: 'bg-green-100 text-green-800',
  processor: 'bg-blue-100 text-blue-800',
  tester: 'bg-purple-100 text-purple-800',
  shipper: 'bg-orange-100 text-orange-800',
  retailer: 'bg-emerald-100 text-emerald-800',
  admin: 'bg-gray-100 text-gray-800',
};

const AVATAR_COLORS = [
  'bg-herb-green-500',
  'bg-herb-amber-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-emerald-500',
];

export default function ActorCard({ actor, onClick }: ActorCardProps) {
  const avatarColor = AVATAR_COLORS[actor.name.length % AVATAR_COLORS.length];

  return (
    <motion.div
      whileHover={{ y: -4, shadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-gray-100 shadow-sm p-5 transition-shadow hover:shadow-md',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0', avatarColor)}>
          {getInitials(actor.name)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + Role */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{actor.name}</h3>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize', ROLE_COLORS[actor.role] || ROLE_COLORS.admin)}>
              {actor.role}
            </span>
          </div>

          {/* Contact Info */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">{actor.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Phone className="w-3.5 h-3.5" />
              <span>{actor.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{actor.location.address}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <Badge
              variant={actor.kycStatus === 'verified' ? 'success' : actor.kycStatus === 'pending' ? 'warning' : 'error'}
              size="sm"
              dot
            >
              KYC: {actor.kycStatus}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Package className="w-3.5 h-3.5" />
              <span>{actor.batchCount} batches</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
