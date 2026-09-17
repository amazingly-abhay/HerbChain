import { Batch } from '@/lib/types';

export const mockBatches: Batch[] = [
  {
    id: 'HB-a1b2c3d4',
    herbName: 'Ashwagandha',
    herbNameHi: 'अश्वगंधा',
    scientificName: 'Withania somnifera',
    currentStage: 'retail',
    origin: { latitude: 26.9124, longitude: 75.7873, address: 'Jaipur, Rajasthan, India' },
    quantity: 50,
    unit: 'kg',
    collectorId: '1',
    collectorName: 'Ramesh Kumar',
    createdAt: '2024-02-15T08:30:00Z',
    updatedAt: '2024-03-01T14:20:00Z',
    qrCodeUrl: '/verify/HB-a1b2c3d4',
    events: [
      { id: 'e1', batchId: 'HB-a1b2c3d4', stage: 'collection', actorId: '1', actorName: 'Ramesh Kumar', actorRole: 'collector', timestamp: '2024-02-15T08:30:00Z', location: { latitude: 26.9124, longitude: 75.7873, address: 'Jaipur, Rajasthan' }, notes: 'Collected from organic farm', blockchainTxHash: '0xabc123...' },
      { id: 'e2', batchId: 'HB-a1b2c3d4', stage: 'processing', actorId: '2', actorName: 'Priya Sharma', actorRole: 'processor', timestamp: '2024-02-18T10:15:00Z', location: { latitude: 23.0225, longitude: 72.5714, address: 'Ahmedabad, Gujarat' }, notes: 'Washed and sun-dried', blockchainTxHash: '0xdef456...' },
      { id: 'e3', batchId: 'HB-a1b2c3d4', stage: 'testing', actorId: '3', actorName: 'Dr. Anand Patel', actorRole: 'tester', timestamp: '2024-02-22T09:00:00Z', location: { latitude: 12.9716, longitude: 77.5946, address: 'Bangalore, Karnataka' }, notes: 'Tested for heavy metals. Passed.', blockchainTxHash: '0xghi789...' },
      { id: 'e4', batchId: 'HB-a1b2c3d4', stage: 'shipment', actorId: '4', actorName: 'Vikram Singh', actorRole: 'shipper', timestamp: '2024-02-26T11:45:00Z', location: { latitude: 28.6139, longitude: 77.2090, address: 'Delhi' }, notes: 'Shipped via secure transport', blockchainTxHash: '0xjkl012...' },
      { id: 'e5', batchId: 'HB-a1b2c3d4', stage: 'retail', actorId: '5', actorName: 'Meera Joshi', actorRole: 'retailer', timestamp: '2024-03-01T14:20:00Z', location: { latitude: 19.0760, longitude: 72.8777, address: 'Mumbai, Maharashtra' }, notes: 'Received at retail outlet', blockchainTxHash: '0xmno345...' }
    ]
  },
  {
    id: 'HB-b2c3d4e5',
    herbName: 'Tulsi',
    herbNameHi: 'तुलसी',
    scientificName: 'Ocimum sanctum',
    currentStage: 'shipment',
    origin: { latitude: 30.3165, longitude: 78.0322, address: 'Dehradun, Uttarakhand, India' },
    quantity: 30,
    unit: 'kg',
    collectorId: 'c1',
    collectorName: 'Sunita Devi',
    createdAt: '2024-03-05T09:15:00Z',
    updatedAt: '2024-03-18T11:00:00Z',
    qrCodeUrl: '/verify/HB-b2c3d4e5',
    events: [
      { id: 'e6', batchId: 'HB-b2c3d4e5', stage: 'collection', actorId: 'c1', actorName: 'Sunita Devi', actorRole: 'collector', timestamp: '2024-03-05T09:15:00Z', location: { latitude: 30.3165, longitude: 78.0322, address: 'Dehradun, Uttarakhand' }, notes: 'Wild harvested in foothills', blockchainTxHash: '0x111222...' },
      { id: 'e7', batchId: 'HB-b2c3d4e5', stage: 'processing', actorId: 'p2', actorName: 'Manoj Verma', actorRole: 'processor', timestamp: '2024-03-10T14:30:00Z', location: { latitude: 23.2599, longitude: 77.4126, address: 'Bhopal, MP' }, notes: 'Air dried and packaged', blockchainTxHash: '0x333444...' },
      { id: 'e8', batchId: 'HB-b2c3d4e5', stage: 'testing', actorId: 't1', actorName: 'Dr. Anand Patel', actorRole: 'tester', timestamp: '2024-03-14T10:00:00Z', location: { latitude: 12.9716, longitude: 77.5946, address: 'Bangalore, Karnataka' }, notes: 'Pesticide residue test: PASS', blockchainTxHash: '0x555666...' },
      { id: 'e9', batchId: 'HB-b2c3d4e5', stage: 'shipment', actorId: 's1', actorName: 'Vikram Singh', actorRole: 'shipper', timestamp: '2024-03-18T11:00:00Z', location: { latitude: 28.6139, longitude: 77.2090, address: 'Delhi Hub' }, notes: 'In transit to Mumbai', blockchainTxHash: '0x777888...' }
    ]
  },
  {
    id: 'HB-c3d4e5f6',
    herbName: 'Brahmi',
    herbNameHi: 'ब्राह्मी',
    scientificName: 'Bacopa monnieri',
    currentStage: 'testing',
    origin: { latitude: 9.9312, longitude: 76.2673, address: 'Kochi, Kerala, India' },
    quantity: 25,
    unit: 'kg',
    collectorId: '1',
    collectorName: 'Ramesh Kumar',
    createdAt: '2024-04-01T07:45:00Z',
    updatedAt: '2024-04-12T16:20:00Z',
    qrCodeUrl: '/verify/HB-c3d4e5f6',
    events: [
      { id: 'e10', batchId: 'HB-c3d4e5f6', stage: 'collection', actorId: '1', actorName: 'Ramesh Kumar', actorRole: 'collector', timestamp: '2024-04-01T07:45:00Z', location: { latitude: 9.9312, longitude: 76.2673, address: 'Kochi, Kerala' }, notes: 'Wetland collection', blockchainTxHash: '0xaaa111...' },
      { id: 'e11', batchId: 'HB-c3d4e5f6', stage: 'processing', actorId: 'p1', actorName: 'Priya Sharma', actorRole: 'processor', timestamp: '2024-04-06T11:00:00Z', location: { latitude: 23.0225, longitude: 72.5714, address: 'Ahmedabad, Gujarat' }, notes: 'Extracted and concentrated', blockchainTxHash: '0xbbb222...' },
      { id: 'e12', batchId: 'HB-c3d4e5f6', stage: 'testing', actorId: 't1', actorName: 'Dr. Anand Patel', actorRole: 'tester', timestamp: '2024-04-12T16:20:00Z', location: { latitude: 12.9716, longitude: 77.5946, address: 'Bangalore, Karnataka' }, notes: 'Bacoside content analysis: 22%', blockchainTxHash: '0xccc333...' }
    ]
  },
  {
    id: 'HB-d4e5f6g7',
    herbName: 'Shatavari',
    herbNameHi: 'शतावरी',
    scientificName: 'Asparagus racemosus',
    currentStage: 'processing',
    origin: { latitude: 26.9124, longitude: 75.7873, address: 'Jaipur, Rajasthan, India' },
    quantity: 40,
    unit: 'kg',
    collectorId: '1',
    collectorName: 'Ramesh Kumar',
    createdAt: '2024-04-15T10:30:00Z',
    updatedAt: '2024-04-20T12:00:00Z',
    qrCodeUrl: '/verify/HB-d4e5f6g7',
    events: [
      { id: 'e13', batchId: 'HB-d4e5f6g7', stage: 'collection', actorId: '1', actorName: 'Ramesh Kumar', actorRole: 'collector', timestamp: '2024-04-15T10:30:00Z', location: { latitude: 26.9124, longitude: 75.7873, address: 'Jaipur, Rajasthan' }, notes: 'Root collection completed', blockchainTxHash: '0xddd444...' },
      { id: 'e14', batchId: 'HB-d4e5f6g7', stage: 'processing', actorId: 'p2', actorName: 'Manoj Verma', actorRole: 'processor', timestamp: '2024-04-20T12:00:00Z', location: { latitude: 23.2599, longitude: 77.4126, address: 'Bhopal, MP' }, notes: 'Peeled and shade dried', blockchainTxHash: '0xeee555...' }
    ]
  },
  {
    id: 'HB-e5f6g7h8',
    herbName: 'Neem',
    herbNameHi: 'नीम',
    scientificName: 'Azadirachta indica',
    currentStage: 'collection',
    origin: { latitude: 23.2599, longitude: 77.4126, address: 'Bhopal, Madhya Pradesh, India' },
    quantity: 100,
    unit: 'kg',
    collectorId: 'c1',
    collectorName: 'Sunita Devi',
    createdAt: '2024-05-01T08:00:00Z',
    updatedAt: '2024-05-01T08:00:00Z',
    qrCodeUrl: '/verify/HB-e5f6g7h8',
    events: [
      { id: 'e15', batchId: 'HB-e5f6g7h8', stage: 'collection', actorId: 'c1', actorName: 'Sunita Devi', actorRole: 'collector', timestamp: '2024-05-01T08:00:00Z', location: { latitude: 23.2599, longitude: 77.4126, address: 'Bhopal, Madhya Pradesh' }, notes: 'Leaves and seeds collected', blockchainTxHash: '0xfff666...' }
    ]
  },
  {
    id: 'HB-f6g7h8i9',
    herbName: 'Guduchi',
    herbNameHi: 'गिलोय',
    scientificName: 'Tinospora cordifolia',
    currentStage: 'retail',
    origin: { latitude: 30.3165, longitude: 78.0322, address: 'Dehradun, Uttarakhand, India' },
    quantity: 60,
    unit: 'kg',
    collectorId: 'c1',
    collectorName: 'Sunita Devi',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-02-10T15:30:00Z',
    qrCodeUrl: '/verify/HB-f6g7h8i9',
    events: [
      { id: 'e16', batchId: 'HB-f6g7h8i9', stage: 'collection', actorId: 'c1', actorName: 'Sunita Devi', actorRole: 'collector', timestamp: '2024-01-10T09:00:00Z', location: { latitude: 30.3165, longitude: 78.0322, address: 'Dehradun, Uttarakhand' }, notes: 'Stem collection', blockchainTxHash: '0x111aaa...' },
      { id: 'e17', batchId: 'HB-f6g7h8i9', stage: 'processing', actorId: 'p1', actorName: 'Priya Sharma', actorRole: 'processor', timestamp: '2024-01-18T11:20:00Z', location: { latitude: 23.0225, longitude: 72.5714, address: 'Ahmedabad, Gujarat' }, notes: 'Satva extraction', blockchainTxHash: '0x222bbb...' },
      { id: 'e18', batchId: 'HB-f6g7h8i9', stage: 'testing', actorId: 't1', actorName: 'Dr. Anand Patel', actorRole: 'tester', timestamp: '2024-01-25T13:45:00Z', location: { latitude: 12.9716, longitude: 77.5946, address: 'Bangalore, Karnataka' }, notes: 'Purity test: 99.4%', blockchainTxHash: '0x333ccc...' },
      { id: 'e19', batchId: 'HB-f6g7h8i9', stage: 'shipment', actorId: 's1', actorName: 'Vikram Singh', actorRole: 'shipper', timestamp: '2024-02-02T10:00:00Z', location: { latitude: 28.6139, longitude: 77.2090, address: 'Delhi' }, notes: 'Dispatched to retail', blockchainTxHash: '0x444ddd...' },
      { id: 'e20', batchId: 'HB-f6g7h8i9', stage: 'retail', actorId: 'r2', actorName: 'Arjun Nair', actorRole: 'retailer', timestamp: '2024-02-10T15:30:00Z', location: { latitude: 9.9312, longitude: 76.2673, address: 'Kochi, Kerala' }, notes: 'Stocked at store', blockchainTxHash: '0x555eee...' }
    ]
  }
];
