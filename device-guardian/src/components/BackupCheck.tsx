import { useState } from 'react';

interface BackupItem {
  label: string;
  howTo: string;
  url: string;
  urlLabel: string;
}

const BACKUP_ITEMS: BackupItem[] = [
  {
    label: 'Google Photos backup is ON',
    howTo: 'Open Google Photos → tap your profile photo → Photos settings → Backup → turn on Backup.',
    url: 'https://photos.google.com',
    urlLabel: 'Open Google Photos ↗',
  },
  {
    label: 'Contacts saved to Google or iCloud (not just on the phone)',
    howTo: 'Android: Settings → Google → Back up to Google Drive → ON. iPhone: Settings → [Your Name] → iCloud → Contacts → ON.',
    url: 'https://contacts.google.com',
    urlLabel: 'Check Google Contacts ↗',
  },
  {
    label: 'WhatsApp backs up daily to Google Drive or iCloud',
    howTo: 'WhatsApp → Settings → Chats → Chat Backup → Back Up Now. Set frequency to Daily.',
    url: 'https://faq.whatsapp.com/android/chats/how-to-back-up-to-google-drive/',
    urlLabel: 'WhatsApp backup guide ↗',
  },
  {
    label: 'Samsung Cloud or iCloud backup is ON',
    howTo: 'Samsung: Settings → Accounts and backup → Back up data → ON. iPhone: Settings → [Your Name] → iCloud → iCloud Backup → ON.',
    url: 'https://icloud.com',
    urlLabel: 'Check iCloud ↗',
  },
];

export function BackupCheck() {
  const [checked, setChecked] = useState<boolean[]>(new Array(BACKUP_ITEMS.length).fill(false));
  const [expanded, setExpanded] = useState<number | null>(null);

  function toggle(i: number) {
    const next = [...checked];
    next[i] = !next[i];
    setChecked(next);
  }

  const doneCount = checked.filter(Boolean).length;

  return (
    <div className="backup-check">
      <div className="backup-intro">
        <h2>Backup Check</h2>
        <p>Finding your phone is great. Not losing your data is better.</p>
        <p>My friend in Thailand lost everything because he didn't have backups. Let's check what's already safe.</p>
      </div>

      <div className="backup-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(doneCount / BACKUP_ITEMS.length) * 100}%` }} />
        </div>
        <span className="progress-label">{doneCount} / {BACKUP_ITEMS.length} backed up</span>
      </div>

      <div className="backup-list">
        {BACKUP_ITEMS.map((item, i) => (
          <div key={i} className={`backup-item ${checked[i] ? 'backup-item--done' : ''}`}>
            <div className="backup-item-header">
              <label className="backup-check-label">
                <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} />
                <span>{item.label}</span>
              </label>
              <button
                className="btn-text btn-sm"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                {expanded === i ? 'Hide' : 'How to check'}
              </button>
            </div>
            {expanded === i && (
              <div className="backup-howto">
                <p>{item.howTo}</p>
                <a className="btn-secondary btn-link btn-sm" href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.urlLabel}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {doneCount === BACKUP_ITEMS.length && (
        <div className="backup-complete">
          <p>All backed up. If you lose your phone tomorrow, you lose the hardware. Your data comes back.</p>
        </div>
      )}
    </div>
  );
}
