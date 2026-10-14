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
  imageUrl?: string;
  blockchainTxHash?: string;
  blockchainExplorerUrl?: string;
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
  blockchainExplorerUrl?: string;
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
  blockchainExplorerUrl?: string;
  imageUrl?: string;
  productImageUrl?: string;
  ingredients?: Array<{ name: string; percentage?: string; purpose?: string }>;
  mainReport?: Report;
  reports?: Report[];
  retailUnits?: RetailUnit[];
  testingStatus?: 'passed' | 'failed' | 'pending';
  manualCheckRequired?: boolean;
  isMinted?: boolean;
  collectorWallet?: string;
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

export interface UserSettings {
  language?: 'en' | 'hi';
  dateFormat?: string;
  defaultUnit?: string;
  emailNotifications?: boolean;
  labAlerts?: boolean;
  criticalAlerts?: boolean;
  pushNotifications?: boolean;
  preferredNetwork?: string;
  autoGasEstimate?: boolean;
  explorerUrl?: string;
  autoRefreshFeed?: boolean;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: ActorRole;
  avatar?: string;
  phone?: string;
  organization?: string;
  bio?: string;
  kycStatus: KYCStatus;
  government_id_type?: string;
  government_id_number?: string;
  kyc_document_hash?: string;
  location?: string;
  onboarding_completed?: boolean;
  wallet_address?: string;
  is_active?: boolean;
  is_admin?: boolean;
  settings?: UserSettings;
  created_at?: string;
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

export interface BlockchainStatus {
  network: string;
  connected: boolean;
  wallet_address: string;
  balance: string;
  contract_address: string;
  explorer_url: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  admin_id: string;
  admin_username: string;
  action: string;
  target_resource: string;
  details: Record<string, any>;
  ip_address: string;
}

export interface SystemConfig {
  min_purity_percent: number;
  max_moisture_percent: number;
  ai_confidence_threshold: number;
  maintenance_mode: boolean;
  auto_verify_kyc: boolean;
  allowed_units: string[];
}

export interface AdminAnalytics {
  overview: {
    total_batches: number;
    total_herb_mass_kg: number;
    total_events: number;
    total_users: number;
    active_users: number;
    inactive_users: number;
    pass_rate_percentage: number;
    manual_checks_required: number;
  };
  stage_funnel: { stage: string; label: string; count: number }[];
  quality_distribution: { name: string; value: number; color: string }[];
  top_herbs: { name: string; quantity_kg: number; batch_count: number }[];
  role_breakdown: { role: string; label: string; count: number }[];
  kyc_breakdown: { verified: number; pending: number; rejected: number };
  recent_audit_logs: AuditLogEntry[];
}
