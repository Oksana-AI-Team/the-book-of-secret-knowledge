import { useState } from 'react';
import type { Tab } from './types';
import { useDevices } from './hooks/useDevices';
import { EmergencyMode } from './components/EmergencyMode';
import { DeviceInventory } from './components/DeviceInventory';
import { TraceRecover } from './components/TraceRecover';
import { Prevention } from './components/Prevention';
import { BackupCheck } from './components/BackupCheck';
import './App.css';

const TABS: { id: Tab; label: string }[] = [
  { id: 'emergency', label: '🚨 Lost Device' },
  { id: 'inventory', label: '📱 My Devices' },
  { id: 'trace', label: '🗺️ Trace & Recover' },
  { id: 'prevention', label: '🛡️ Prevention' },
  { id: 'backup', label: '☁️ Backups' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('emergency');
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const { devices, addDevice, updateDevice, removeDevice } = useDevices();

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <header className="app-header">
        <div className="header-inner">
          <span className="app-logo">🛡️ Device Guardian</span>
          <button
            className="btn-icon"
            onClick={() => setDarkMode(d => !d)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <nav className="tab-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'emergency' && <EmergencyMode />}
        {tab === 'inventory' && (
          <DeviceInventory
            devices={devices}
            onAdd={addDevice}
            onUpdate={updateDevice}
            onRemove={removeDevice}
          />
        )}
        {tab === 'trace' && <TraceRecover />}
        {tab === 'prevention' && <Prevention />}
        {tab === 'backup' && <BackupCheck />}
      </main>
    </div>
  );
}
