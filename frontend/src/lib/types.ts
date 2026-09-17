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
