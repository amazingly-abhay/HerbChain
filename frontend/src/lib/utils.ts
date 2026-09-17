import { SupplyChainStage, GeoLocation } from './types';
import { SUPPLY_CHAIN_STAGES, STAGE_COLORS, STAGE_BG_COLORS } from './constants';
import { v4 as uuidv4 } from 'uuid';

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString();
}

export function getStageColor(stage: SupplyChainStage): string {
  return STAGE_COLORS[stage] || '#000000';
}

export function getStageBgColor(stage: SupplyChainStage): string {
  return STAGE_BG_COLORS[stage] || '#FFFFFF';
}

export function getStageLabel(stage: SupplyChainStage): string {
  const found = SUPPLY_CHAIN_STAGES.find(s => s.stage === stage);
  return found ? found.label : stage;
}

export function getStageLabelHi(stage: SupplyChainStage): string {
  const found = SUPPLY_CHAIN_STAGES.find(s => s.stage === stage);
  return found ? found.labelHi : stage;
}

export function getStageIcon(stage: SupplyChainStage): string {
  const found = SUPPLY_CHAIN_STAGES.find(s => s.stage === stage);
  return found ? found.icon : 'HelpCircle';
}

export function generateBatchId(): string {
  return `HB-${uuidv4().slice(0, 8).toUpperCase()}`;
}

export function truncateAddress(address: string, length: number = 6): string {
  if (!address || address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function getCurrentLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: 'Location fetched from browser'
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getInitials(name: string): string {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
