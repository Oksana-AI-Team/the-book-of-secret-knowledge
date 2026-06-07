import { useState } from 'react';
import type { Device, DeviceBrand } from '../types';

const BRAND_LABELS: Record<DeviceBrand, string> = {
  samsung: 'Samsung Android',
  android: 'Other Android',
  iphone: 'iPhone',
  macbook: 'MacBook',
  windows: 'Windows Laptop',
};

const TRACKING_SERVICES: Record<DeviceBrand, string> = {
  samsung: 'Samsung Find My Mobile',
  android: 'Google Find My Device',
  iphone: 'Apple Find My',
  macbook: 'Apple Find My',
  windows: 'Microsoft Find My Device',
};

const SETUP_STEPS: Record<DeviceBrand, string[]> = {
  samsung: [
    'Settings → Biometrics & Security → Find My Mobile → ON',
    'Enable: Remote unlock',
    'Enable: Send last location (sends GPS when battery is critical)',
  ],
  android: [
    'Settings → Google → Find My Device → ON',
    'Enable: Send last location',
  ],
  iphone: [
    'Settings → [Your Name] → Find My → Find My iPhone → ON',
    'Enable: Send Last Location',
  ],
  macbook: [
    'System Settings → Apple ID → iCloud → Find My Mac → ON',
    'Enable: Send Last Location',
  ],
  windows: [
    'Settings → Privacy & Security → Find My Device → ON',
    'You must be signed into a Microsoft account',
    "Note: if this option is missing, your laptop doesn't support it — consider a physical tracker like Tile.",
  ],
};

interface Props {
  devices: Device[];
  onAdd: (device: Omit<Device, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Device>) => void;
  onRemove: (id: string) => void;
}

interface SetupWizardProps {
  device: Device;
  onDone: () => void;
}

function SetupWizard({ device, onDone }: SetupWizardProps) {
  const steps = SETUP_STEPS[device.brand];
  const [checked, setChecked] = useState<boolean[]>(new Array(steps.length).fill(false));

  const allDone = checked.every(Boolean);

  return (
    <div className="setup-wizard">
      <h3>Set up tracking for {device.name}</h3>
      <div className="setup-steps">
        {steps.map((step, i) => (
          <label key={i} className="setup-step">
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={e => {
                const next = [...checked];
                next[i] = e.target.checked;
                setChecked(next);
              }}
            />
            <span>{step}</span>
          </label>
        ))}
      </div>
      <button
        className="btn-primary"
        disabled={!allDone}
        onClick={onDone}
      >
        {allDone ? "I did this ✓" : `${checked.filter(Boolean).length}/${steps.length} steps done`}
      </button>
      <button className="btn-text" onClick={onDone}>Skip for now</button>
    </div>
  );
}

interface AddDeviceFormProps {
  onAdd: (device: Omit<Device, 'id'>) => void;
  onCancel: () => void;
}

function AddDeviceForm({ onAdd, onCancel }: AddDeviceFormProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState<DeviceBrand>('iphone');
  const [account, setAccount] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      brand,
      trackingService: TRACKING_SERVICES[brand],
      linkedAccount: account.trim(),
      setupComplete: false,
    });
  }

  return (
    <form className="add-device-form" onSubmit={submit}>
      <h3>Add a device</h3>
      <label>
        <span>Device name (e.g. "My Samsung S23")</span>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="My iPhone 15"
          required
        />
      </label>
      <label>
        <span>Type</span>
        <select value={brand} onChange={e => setBrand(e.target.value as DeviceBrand)}>
          {(Object.keys(BRAND_LABELS) as DeviceBrand[]).map(b => (
            <option key={b} value={b}>{BRAND_LABELS[b]}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Account linked (optional)</span>
        <input
          type="text"
          value={account}
          onChange={e => setAccount(e.target.value)}
          placeholder="myemail@gmail.com"
        />
      </label>
      <p className="form-hint">Tracking service: {TRACKING_SERVICES[brand]}</p>
      <div className="form-actions">
        <button type="submit" className="btn-primary">Add device</button>
        <button type="button" className="btn-text" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export function DeviceInventory({ devices, onAdd, onUpdate, onRemove }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [settingUp, setSettingUp] = useState<string | null>(null);

  function handleAdd(device: Omit<Device, 'id'>) {
    onAdd(device);
    setShowAdd(false);
  }

  const setupDevice = devices.find(d => d.id === settingUp);

  if (settingUp && setupDevice) {
    return (
      <SetupWizard
        device={setupDevice}
        onDone={() => {
          onUpdate(settingUp, { setupComplete: true });
          setSettingUp(null);
        }}
      />
    );
  }

  if (showAdd) {
    return <AddDeviceForm onAdd={handleAdd} onCancel={() => setShowAdd(false)} />;
  }

  return (
    <div className="inventory">
      <div className="inventory-header">
        <h2>Your devices</h2>
        <button className="btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add device</button>
      </div>

      {devices.length === 0 && (
        <div className="empty-state">
          <p>No devices yet. Add your first device to get started.</p>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>Add your first device</button>
        </div>
      )}

      <div className="device-list">
        {devices.map(device => (
          <div key={device.id} className="device-card">
            <div className="device-card-header">
              <div>
                <strong>{device.name}</strong>
                <span className="device-brand">{BRAND_LABELS[device.brand]}</span>
              </div>
              <span className={`status-badge ${device.setupComplete ? 'status-ok' : 'status-warn'}`}>
                {device.setupComplete ? '✅ Set up' : '❌ Not set up'}
              </span>
            </div>
            <p className="device-service">{device.trackingService}</p>
            {device.linkedAccount && (
              <p className="device-account">Account: {device.linkedAccount}</p>
            )}
            <div className="device-actions">
              {!device.setupComplete && (
                <button className="btn-secondary btn-sm" onClick={() => setSettingUp(device.id)}>
                  Set up tracking
                </button>
              )}
              {device.setupComplete && (
                <button
                  className="btn-text btn-sm"
                  onClick={() => onUpdate(device.id, { setupComplete: false })}
                >
                  Mark as not set up
                </button>
              )}
              <button className="btn-danger btn-sm" onClick={() => onRemove(device.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
