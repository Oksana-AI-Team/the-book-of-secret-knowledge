import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';
import type {
  HouseholdMember,
  Device,
  LossEvent,
  NewHouseholdMember,
  NewDevice,
  NewLossEvent,
} from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('device-guardian.db');
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');
    for (const stmt of CREATE_TABLES_SQL.split(';').map(s => s.trim()).filter(Boolean)) {
      await db.execAsync(stmt + ';');
    }
  }
  return db;
}

// ── Household Members ──────────────────────────────────────────────────────

export async function getMembers(): Promise<HouseholdMember[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number; name: string; color: string; created_at: string;
  }>('SELECT * FROM household_members ORDER BY created_at ASC');
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    color: r.color,
    createdAt: r.created_at,
  }));
}

export async function addMember(member: NewHouseholdMember): Promise<HouseholdMember> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO household_members (name, color) VALUES (?, ?)',
    member.name,
    member.color,
  );
  const row = await db.getFirstAsync<{ id: number; name: string; color: string; created_at: string }>(
    'SELECT * FROM household_members WHERE id = ?',
    result.lastInsertRowId,
  );
  return { id: row!.id, name: row!.name, color: row!.color, createdAt: row!.created_at };
}

export async function updateMember(id: number, updates: Partial<NewHouseholdMember>): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), id];
  await db.runAsync(`UPDATE household_members SET ${fields} WHERE id = ?`, ...values);
}

export async function deleteMember(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM household_members WHERE id = ?', id);
}

// ── Devices ────────────────────────────────────────────────────────────────

function rowToDevice(r: Record<string, unknown>): Device {
  return {
    id: r.id as number,
    memberId: r.member_id as number,
    name: r.name as string,
    category: r.category as Device['category'],
    ecosystem: r.ecosystem as Device['ecosystem'],
    brand: r.brand as string,
    model: r.model as string,
    serialNumber: r.serial_number as string,
    imei: r.imei as string | null,
    photoPath: r.photo_path as string | null,
    receiptPhotoPath: r.receipt_photo_path as string | null,
    purchaseDate: r.purchase_date as string | null,
    purchasePrice: r.purchase_price as number | null,
    currency: r.currency as string,
    notes: r.notes as string,
    finderEnabled: r.finder_enabled as Device['finderEnabled'],
    carrierName: r.carrier_name as string | null,
    status: r.status as Device['status'],
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export async function getDevices(memberId?: number): Promise<Device[]> {
  const db = await getDb();
  const rows = memberId
    ? await db.getAllAsync<Record<string, unknown>>(
        'SELECT * FROM devices WHERE member_id = ? ORDER BY created_at ASC',
        memberId,
      )
    : await db.getAllAsync<Record<string, unknown>>(
        'SELECT * FROM devices ORDER BY member_id ASC, created_at ASC',
      );
  return rows.map(rowToDevice);
}

export async function getDevice(id: number): Promise<Device | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM devices WHERE id = ?',
    id,
  );
  return row ? rowToDevice(row) : null;
}

export async function addDevice(device: NewDevice): Promise<Device> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO devices
      (member_id, name, category, ecosystem, brand, model, serial_number, imei,
       photo_path, receipt_photo_path, purchase_date, purchase_price, currency,
       notes, finder_enabled, carrier_name, status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    device.memberId,
    device.name,
    device.category,
    device.ecosystem,
    device.brand,
    device.model,
    device.serialNumber,
    device.imei ?? null,
    device.photoPath ?? null,
    device.receiptPhotoPath ?? null,
    device.purchaseDate ?? null,
    device.purchasePrice ?? null,
    device.currency,
    device.notes,
    device.finderEnabled,
    device.carrierName ?? null,
    device.status,
  );
  return (await getDevice(result.lastInsertRowId))!;
}

export async function updateDevice(id: number, updates: Partial<NewDevice>): Promise<void> {
  const db = await getDb();
  const colMap: Record<string, string> = {
    memberId: 'member_id',
    serialNumber: 'serial_number',
    imei: 'imei',
    photoPath: 'photo_path',
    receiptPhotoPath: 'receipt_photo_path',
    purchaseDate: 'purchase_date',
    purchasePrice: 'purchase_price',
    finderEnabled: 'finder_enabled',
    carrierName: 'carrier_name',
  };
  const entries = Object.entries(updates);
  const fields = entries.map(([k]) => `${colMap[k] ?? k} = ?`).join(', ');
  const values = [...entries.map(([, v]) => v ?? null), id];
  await db.runAsync(
    `UPDATE devices SET ${fields}, updated_at = datetime('now') WHERE id = ?`,
    ...values,
  );
}

export async function deleteDevice(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM devices WHERE id = ?', id);
}

// ── Loss Events ────────────────────────────────────────────────────────────

function rowToLossEvent(r: Record<string, unknown>): LossEvent {
  return {
    id: r.id as number,
    deviceId: r.device_id as number,
    startedAt: r.started_at as string,
    resolvedAt: r.resolved_at as string | null,
    outcome: r.outcome as LossEvent['outcome'],
    checklistState: r.checklist_state as string,
  };
}

export async function getLossEvents(deviceId: number): Promise<LossEvent[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM loss_events WHERE device_id = ? ORDER BY started_at DESC',
    deviceId,
  );
  return rows.map(rowToLossEvent);
}

export async function getActiveLossEvent(deviceId: number): Promise<LossEvent | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM loss_events WHERE device_id = ? AND resolved_at IS NULL ORDER BY started_at DESC LIMIT 1',
    deviceId,
  );
  return row ? rowToLossEvent(row) : null;
}

export async function addLossEvent(event: NewLossEvent): Promise<LossEvent> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO loss_events (device_id, started_at, resolved_at, outcome, checklist_state)
     VALUES (?, ?, ?, ?, ?)`,
    event.deviceId,
    event.startedAt,
    event.resolvedAt ?? null,
    event.outcome ?? null,
    event.checklistState,
  );
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM loss_events WHERE id = ?',
    result.lastInsertRowId,
  );
  return rowToLossEvent(row!);
}

export async function updateLossEvent(id: number, updates: Partial<Omit<LossEvent, 'id' | 'deviceId'>>): Promise<void> {
  const db = await getDb();
  const colMap: Record<string, string> = {
    startedAt: 'started_at',
    resolvedAt: 'resolved_at',
    checklistState: 'checklist_state',
  };
  const entries = Object.entries(updates);
  const fields = entries.map(([k]) => `${colMap[k] ?? k} = ?`).join(', ');
  const values = [...entries.map(([, v]) => v ?? null), id];
  await db.runAsync(`UPDATE loss_events SET ${fields} WHERE id = ?`, ...values);
}
