import { useState } from 'react';
import type { DeviceBrand } from '../types';

const FIND_LINKS: Record<DeviceBrand, { label: string; url: string }> = {
  samsung: { label: 'Open Samsung Find My Mobile', url: 'https://findmymobile.samsung.com' },
  android: { label: 'Open Google Find My Device', url: 'https://android.com/find' },
  iphone: { label: 'Open iCloud Find My', url: 'https://icloud.com/find' },
  macbook: { label: 'Open iCloud Find My', url: 'https://icloud.com/find' },
  windows: { label: 'Open Microsoft Find My Device', url: 'https://account.microsoft.com/devices' },
};

const DEVICE_LABELS: Record<DeviceBrand, string> = {
  samsung: 'Samsung Android',
  android: 'Other Android',
  iphone: 'iPhone',
  macbook: 'MacBook',
  windows: 'Windows Laptop',
};

type Step = 'call' | 'select' | 'locate' | 'sequence';

export function EmergencyMode() {
  const [step, setStep] = useState<Step>('call');
  const [brand, setBrand] = useState<DeviceBrand | null>(null);
  const [active, setActive] = useState(false);

  if (!active) {
    return (
      <div className="emergency-splash">
        <button className="btn-emergency" onClick={() => setActive(true)}>
          I LOST MY DEVICE RIGHT NOW
        </button>
      </div>
    );
  }

  return (
    <div className="emergency-active">
      <div className="step-indicator">Emergency Mode — Step {step === 'call' ? 1 : step === 'select' ? 2 : step === 'locate' ? 3 : 4} of 4</div>

      {step === 'call' && (
        <div className="step-card">
          <p className="step-text">Try calling your number from another phone first. Listen for vibration nearby.</p>
          <p className="step-hint">This works 30% of the time and takes 30 seconds.</p>
          <button className="btn-primary" onClick={() => setStep('select')}>Okay, tried that. Keep going.</button>
        </div>
      )}

      {step === 'select' && (
        <div className="step-card">
          <p className="step-text">What type of device did you lose?</p>
          <div className="device-grid">
            {(Object.keys(DEVICE_LABELS) as DeviceBrand[]).map(b => (
              <button
                key={b}
                className={`btn-device ${brand === b ? 'selected' : ''}`}
                onClick={() => setBrand(b)}
              >
                {DEVICE_LABELS[b]}
              </button>
            ))}
          </div>
          {brand && (
            <button className="btn-primary" onClick={() => setStep('locate')}>That's it →</button>
          )}
        </div>
      )}

      {step === 'locate' && brand && (
        <div className="step-card">
          <p className="step-text">Open the tracking service for your device:</p>
          <a
            className="btn-primary btn-link"
            href={FIND_LINKS[brand].url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {FIND_LINKS[brand].label} ↗
          </a>
          <div className="divider" />
          <p className="step-hint">Also check Google Maps Timeline — it shows everywhere your phone has been, not just where it is now.</p>
          <a
            className="btn-secondary btn-link"
            href="https://maps.google.com/timeline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Google Maps Timeline ↗
          </a>
          <button className="btn-text" onClick={() => setStep('sequence')}>I've opened it. What's next?</button>
        </div>
      )}

      {step === 'sequence' && (
        <div className="step-card">
          <p className="step-text">Work through this in order. Don't skip ahead.</p>
          <div className="action-sequence">
            <div className="action-step">
              <span className="action-num">1</span>
              <div>
                <strong>Locate</strong>
                <p>Check the tracking app. Get a last known location.</p>
              </div>
            </div>
            <div className="action-step">
              <span className="action-num">2</span>
              <div>
                <strong>Ring</strong>
                <p>Use the tracking app to make it ring at full volume, even if silent mode is on.</p>
              </div>
            </div>
            <div className="action-step">
              <span className="action-num">3</span>
              <div>
                <strong>Lock</strong>
                <p>Lock it remotely so no one can get into your data while you're looking.</p>
              </div>
            </div>
            <div className="action-step action-step--highlight">
              <span className="action-num">4</span>
              <div>
                <strong>Trace & Recover</strong>
                <p>Open Google Maps Timeline. Retrace your route from the last 4 hours. Drive to the 3 most likely drop points first. Do not drive randomly.</p>
                <a
                  className="btn-secondary btn-link btn-sm"
                  href="https://maps.google.com/timeline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Timeline ↗
                </a>
              </div>
            </div>
          </div>
          <button className="btn-text" onClick={() => setActive(false)}>← Back to home</button>
        </div>
      )}
    </div>
  );
}
