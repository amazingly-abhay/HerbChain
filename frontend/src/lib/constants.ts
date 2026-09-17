import { SupplyChainStage, ActorRole, NavItem } from './types';

export const APP_CONFIG = {
  name: 'HerbChain',
  description: 'Ayurvedic Supply Chain Traceability',
  version: '1.0.0',
};

export const STAGE_COLORS: Record<SupplyChainStage, string> = {
  collection: '#16A34A',
  processing: '#2563EB',
  testing: '#7C3AED',
  shipment: '#EA580C',
  retail: '#059669',
};

export const STAGE_BG_COLORS: Record<SupplyChainStage, string> = {
  collection: '#DCFCE7',
  processing: '#DBEAFE',
  testing: '#EDE9FE',
  shipment: '#FFEDD5',
  retail: '#D1FAE5',
};

export const SUPPLY_CHAIN_STAGES = [
  { stage: 'collection' as SupplyChainStage, label: 'Collection', labelHi: 'संग्रह', color: STAGE_COLORS.collection, bgColor: STAGE_BG_COLORS.collection, icon: 'Leaf' },
  { stage: 'processing' as SupplyChainStage, label: 'Processing', labelHi: 'प्रसंस्करण', color: STAGE_COLORS.processing, bgColor: STAGE_BG_COLORS.processing, icon: 'Cog' },
  { stage: 'testing' as SupplyChainStage, label: 'Testing', labelHi: 'परीक्षण', color: STAGE_COLORS.testing, bgColor: STAGE_BG_COLORS.testing, icon: 'Beaker' },
  { stage: 'shipment' as SupplyChainStage, label: 'Shipment', labelHi: 'शिपमेंट', color: STAGE_COLORS.shipment, bgColor: STAGE_BG_COLORS.shipment, icon: 'Truck' },
  { stage: 'retail' as SupplyChainStage, label: 'Retail', labelHi: 'खुदरा', color: STAGE_COLORS.retail, bgColor: STAGE_BG_COLORS.retail, icon: 'Store' },
];

export const ACTOR_ROLES = [
  { role: 'collector' as ActorRole, label: 'Collector', labelHi: 'संग्रहकर्ता', description: 'Collects herbs' },
  { role: 'processor' as ActorRole, label: 'Processor', labelHi: 'प्रोसेसर', description: 'Processes raw herbs' },
  { role: 'tester' as ActorRole, label: 'Tester', labelHi: 'परीक्षक', description: 'Tests herb quality' },
  { role: 'shipper' as ActorRole, label: 'Shipper', labelHi: 'शिपर', description: 'Transports batches' },
  { role: 'retailer' as ActorRole, label: 'Retailer', labelHi: 'फुटकर विक्रेता', description: 'Sells products' },
  { role: 'admin' as ActorRole, label: 'Admin', labelHi: 'व्यवस्थापक', description: 'System Administrator' },
];

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', labelHi: 'डैशबोर्ड', path: '/dashboard', icon: 'LayoutDashboard', roles: ['collector', 'processor', 'tester', 'shipper', 'retailer', 'admin'] },
  { label: 'Batches', labelHi: 'बैच', path: '/batches', icon: 'Package', roles: ['collector', 'processor', 'tester', 'shipper', 'retailer', 'admin'] },
];

export const UNITS = ['kg', 'g', 'quintal', 'ton'];
