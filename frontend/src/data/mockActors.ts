import { Actor } from '@/lib/types';

export const mockActors: Actor[] = [
  {
    id: '1',
    name: 'Ramesh Kumar',
    email: 'ramesh@demo.com',
    role: 'collector',
    kycStatus: 'verified',
    location: { latitude: 26.9124, longitude: 75.7873, address: 'Jaipur, Rajasthan' },
    phone: '+91 98765 43210',
    joinedAt: '2023-05-15T00:00:00Z',
    batchCount: 42
  },
  {
    id: 'c1',
    name: 'Sunita Devi',
    email: 'sunita@demo.com',
    role: 'collector',
    kycStatus: 'verified',
    location: { latitude: 30.3165, longitude: 78.0322, address: 'Dehradun, Uttarakhand' },
    phone: '+91 98765 43211',
    joinedAt: '2023-08-22T00:00:00Z',
    batchCount: 35
  },
  {
    id: 'p1',
    name: 'Priya Sharma',
    email: 'priya@demo.com',
    role: 'processor',
    kycStatus: 'verified',
    location: { latitude: 23.0225, longitude: 72.5714, address: 'Ahmedabad, Gujarat' },
    phone: '+91 98765 43212',
    joinedAt: '2023-03-10T00:00:00Z',
    batchCount: 128
  },
  {
    id: 'p2',
    name: 'Manoj Verma',
    email: 'manoj@demo.com',
    role: 'processor',
    kycStatus: 'verified',
    location: { latitude: 23.2599, longitude: 77.4126, address: 'Bhopal, Madhya Pradesh' },
    phone: '+91 98765 43213',
    joinedAt: '2023-06-18T00:00:00Z',
    batchCount: 89
  },
  {
    id: 't1',
    name: 'Dr. Anand Patel',
    email: 'anand@demo.com',
    role: 'tester',
    kycStatus: 'verified',
    location: { latitude: 12.9716, longitude: 77.5946, address: 'Bengaluru, Karnataka' },
    phone: '+91 98765 43214',
    joinedAt: '2023-01-05T00:00:00Z',
    batchCount: 210
  },
  {
    id: 's1',
    name: 'Vikram Singh',
    email: 'vikram@demo.com',
    role: 'shipper',
    kycStatus: 'pending',
    location: { latitude: 28.6139, longitude: 77.2090, address: 'New Delhi, Delhi' },
    phone: '+91 98765 43215',
    joinedAt: '2023-09-01T00:00:00Z',
    batchCount: 64
  },
  {
    id: 'r1',
    name: 'Meera Joshi',
    email: 'meera@demo.com',
    role: 'retailer',
    kycStatus: 'verified',
    location: { latitude: 19.0760, longitude: 72.8777, address: 'Mumbai, Maharashtra' },
    phone: '+91 98765 43216',
    joinedAt: '2023-04-12T00:00:00Z',
    batchCount: 156
  },
  {
    id: 'r2',
    name: 'Arjun Nair',
    email: 'arjun@demo.com',
    role: 'retailer',
    kycStatus: 'verified',
    location: { latitude: 9.9312, longitude: 76.2673, address: 'Kochi, Kerala' },
    phone: '+91 98765 43217',
    joinedAt: '2023-07-20T00:00:00Z',
    batchCount: 94
  }
];
