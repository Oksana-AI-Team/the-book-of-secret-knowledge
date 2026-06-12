export type DeviceCategory =
  | 'phone'
  | 'tablet'
  | 'laptop'
  | 'earbuds'
  | 'watch'
  | 'tracker'
  | 'camera'
  | 'ereader'
  | 'gaming'
  | 'other';

export type DeviceEcosystem =
  | 'apple'
  | 'samsung'
  | 'other_android'
  | 'windows'
  | 'google'
  | 'none';

export type DeviceStatus = 'home' | 'lost' | 'recovered_log';

export type FinderEnabled = 'yes' | 'no' | 'unknown';

export type LossOutcome = 'recovered' | 'replaced' | 'unresolved';

export interface HouseholdMember {
  id: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface Device {
  id: number;
  memberId: number;
  name: string;
  category: DeviceCategory;
  ecosystem: DeviceEcosystem;
  brand: string;
  model: string;
  serialNumber: string;
  imei: string | null;
  photoPath: string | null;
  receiptPhotoPath: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  currency: string;
  notes: string;
  finderEnabled: FinderEnabled;
  carrierName: string | null;
  status: DeviceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LossEvent {
  id: number;
  deviceId: number;
  startedAt: string;
  resolvedAt: string | null;
  outcome: LossOutcome | null;
  checklistState: string;
}

export type NewHouseholdMember = Omit<HouseholdMember, 'id' | 'createdAt'>;
export type NewDevice = Omit<Device, 'id' | 'createdAt' | 'updatedAt'>;
export type NewLossEvent = Omit<LossEvent, 'id'>;
