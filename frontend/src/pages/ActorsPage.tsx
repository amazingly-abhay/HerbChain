import { useState } from 'react';
import { Search, MapPin, Mail, Phone, Package, Calendar } from 'lucide-react';
import { mockActors } from '@/data/mockActors';
import { ACTOR_ROLES } from '@/lib/constants';
import { Actor } from '@/lib/types';
import ActorCard from '@/components/actors/ActorCard';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function ActorsPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);

  const filteredActors = mockActors.filter(actor => {
    const matchesSearch = actor.name.toLowerCase().includes(search.toLowerCase()) || 
                          actor.location.address.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || actor.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Network Actors</h1>
        <p className="text-gray-500">Directory of verified participants in the supply chain</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-herb-green-500"
          />
        </div>
        <div className="w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-herb-green-500 bg-white"
          >
            <option value="ALL">All Roles</option>
            {ACTOR_ROLES.map(r => (
              <option key={r.role} value={r.role}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredActors.length === 0 ? (
        <EmptyState
          title="No actors found"
          description="Try adjusting your search or filters."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setRoleFilter('ALL');
              }}
            >
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActors.map(actor => (
            <div key={actor.id} onClick={() => setSelectedActor(actor)} className="cursor-pointer">
              <ActorCard actor={actor} />
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={!!selectedActor} 
        onClose={() => setSelectedActor(null)}
        title="Actor Profile"
      >
        {selectedActor && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-herb-green-600 text-white font-bold text-xl flex items-center justify-center">
                {selectedActor.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedActor.name}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-herb-green-100 text-herb-green-800 capitalize">
                  {selectedActor.role}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{selectedActor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{selectedActor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{selectedActor.location.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Joined {new Date(selectedActor.joinedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="w-4 h-4 text-gray-400" />
                <span>{selectedActor.batchCount} batches processed</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm text-gray-500">KYC Status</span>
              <Badge variant={selectedActor.kycStatus === 'verified' ? 'success' : 'warning'}>
                {selectedActor.kycStatus}
              </Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
