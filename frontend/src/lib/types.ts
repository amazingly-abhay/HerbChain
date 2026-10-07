export type SupplyChainStage = 'collection' | 'processing' | 'testing' | 'shipment' | 'retail';

export type ActorRole = 'collector' | 'processor' | 'tester' | 'shipper' | 'retailer' | 'admin';

export type KYCStatus = 'pending' | 'verified' | 'rejected';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface BatchEvent {
  id: string;
  batchId: string;
  stage: SupplyChainStage;
  actorId: string;
  actorName: string;
  actorRole: ActorRole;
  timestamp: string;
  location: GeoLocation;
  notes: string;
  documents?: string[];
  blockchainTxHash?: string;
  labResult?: string;
  labParameters?: Record<string, any>;
}

export interface DiseaseDetection {
  name: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface PestDetection {
  name: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface AIAnalysis {
  plantIdentification: {
    name: string;
    scientificName: string;
    confidence: number;
  };
  healthRating: number;
  diseases: DiseaseDetection[];
  pests: PestDetection[];
  harvestReadiness: {
    ready: boolean;
    estimatedDays?: number;
    notes: string;
  };
  recommendations: string[];
}

export interface Report {
  id: string;
  batchId: string;
  type: 'main' | 'secondary';
  stage: SupplyChainStage;
  data: any;
  hash?: string;
  blockchainTxHash?: string;
  createdAt: string;
}

export interface RetailUnit {
  id: string;
  batchId: string;
  isScanned: boolean;
  scannedAt: string | null;
}

export interface Batch {
  id: string;
  herbName: string;
  herbNameHi: string;
  scientificName: string;
  currentStage: SupplyChainStage;
  createdAt: string;
  updatedAt: string;
  collectorId: string;
  collectorName: string;
  origin: GeoLocation;
  quantity: number;
  unit: string;
  events: BatchEvent[];
  aiAnalysis?: AIAnalysis;
  qrCodeUrl: string;
  blockchainTxHash?: string;
  imageUrl?: string;
  mainReport?: Report;
  reports?: Report[];
  retailUnits?: RetailUnit[];
  testingStatus?: 'passed' | 'failed' | 'pending';
  manualCheckRequired?: boolean;
}

export interface Actor {
  id: string;
  name: string;
  role: ActorRole;
  email: string;
  phone: string;
  location: GeoLocation;
  kycStatus: KYCStatus;
  kycDocuments?: string[];
  avatar?: string;
  joinedAt: string;
  batchCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: ActorRole;
  avatar?: string;
  kycStatus: KYCStatus;
  location?: string;
  onboarding_completed?: boolean;
  wallet_address?: string;
}

export interface NavItem {
  label: string;
  labelHi: string;
  path: string;
  icon: string;
  roles: ActorRole[];
}

export interface DashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalActors: number;
  batchesByStage: Record<SupplyChainStage, number>;
  recentActivity: BatchEvent[];
}
