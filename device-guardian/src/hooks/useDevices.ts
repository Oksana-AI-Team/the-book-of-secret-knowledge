import { useState, useEffect } from 'react';
import type { Device } from '../types';

const STORAGE_KEY = 'device-guardian-devices';

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  }, [devices]);

  function addDevice(device: Omit<Device, 'id'>) {
    const newDevice: Device = { ...device, id: crypto.randomUUID() };
    setDevices(prev => [...prev, newDevice]);
  }

  function updateDevice(id: string, updates: Partial<Device>) {
    setDevices(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  }

  function removeDevice(id: string) {
    setDevices(prev => prev.filter(d => d.id !== id));
  }

  return { devices, addDevice, updateDevice, removeDevice };
}
