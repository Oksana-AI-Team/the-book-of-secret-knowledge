export type DeviceBrand = 'samsung' | 'android' | 'iphone' | 'macbook' | 'windows';

export interface Device {
  id: string;
  name: string;
  brand: DeviceBrand;
  trackingService: string;
  linkedAccount: string;
  setupComplete: boolean;
}

export type Tab = 'emergency' | 'inventory' | 'trace' | 'prevention' | 'backup';
