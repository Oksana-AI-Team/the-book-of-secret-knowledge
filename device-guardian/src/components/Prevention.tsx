import { useState } from 'react';

const DIGITAL_CHECKLIST = [
  'Enable Send Last Location on ALL devices',
  'Enable notifications for sign-ins on your Google account',
  'Enable notifications for sign-ins on your Samsung/Apple account',
];

const TRACKERS = [
  { product: 'Apple AirTag', bestFor: 'MacBook bag, keys, wallet', cost: '~$45 AUD', works: 'iPhone + Bluetooth crowd-tracking', url: 'https://www.apple.com/airtag/' },
  { product: 'Tile Mate', bestFor: 'Android users, bags, luggage', cost: '~$40 AUD', works: 'Any phone + Tile network', url: 'https://www.tile.com' },
  { product: 'Samsung SmartTag', bestFor: 'Samsung phone users', cost: '~$40 AUD', works: 'Samsung Galaxy + SmartThings', url: 'https://www.samsung.com/global/galaxy/galaxy-smarttag/' },
];

const BOOKMARK_LINKS = [
  { label: 'Samsung Find My Mobile', url: 'https://findmymobile.samsung.com' },
  { label: 'Google Find My Device', url: 'https://android.com/find' },
  { label: 'Apple iCloud Find My', url: 'https://icloud.com/find' },
  { label: 'Microsoft Find My Device', url: 'https://account.microsoft.com/devices' },
];

export function Prevention() {
  const [checklist, setChecklist] = useState<boolean[]>(new Array(DIGITAL_CHECKLIST.length).fill(false));
  const [bookmarkBrowser, setBookmarkBrowser] = useState<'chrome' | 'safari' | 'firefox' | null>(null);

  function toggleCheck(i: number) {
    const next = [...checklist];
    next[i] = !next[i];
    setChecklist(next);
  }

  return (
    <div className="prevention">
      <h2>Prevention System</h2>
      <p className="page-subtitle">Three layers. Do all three. The last one is the most important.</p>

      <section className="prevention-section">
        <h3>Layer 1 — Digital checklist</h3>
        <div className="checklist">
          {DIGITAL_CHECKLIST.map((item, i) => (
            <label key={i} className="checklist-item">
              <input type="checkbox" checked={checklist[i]} onChange={() => toggleCheck(i)} />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="prevention-section">
        <h3>Layer 2 — Physical trackers</h3>
        <p>A $40–$45 tracker attached to your bag will outlast any phone. Your phone can be tracked. Your bag with your laptop in it cannot — unless you add one.</p>
        <div className="tracker-table">
          {TRACKERS.map(t => (
            <div key={t.product} className="tracker-row">
              <div className="tracker-name">
                <strong>{t.product}</strong>
                <span className="tracker-cost">{t.cost}</span>
              </div>
              <div className="tracker-detail">
                <p>Best for: {t.bestFor}</p>
                <p className="tracker-works">{t.works}</p>
              </div>
              <a className="btn-secondary btn-link btn-sm" href={t.url} target="_blank" rel="noopener noreferrer">
                View ↗
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="prevention-section prevention-section--highlight">
        <h3>Layer 3 — The one habit that matters most</h3>
        <blockquote className="habit-quote">
          "One rule that prevents 80% of phone loss: phone goes in the same pocket or bag compartment every single time. Muscle memory is better than any app. I learned this the hard way."
        </blockquote>
      </section>

      <section className="prevention-section">
        <h3>Bookmark folder — My Devices</h3>
        <p>Create a browser bookmark folder called <strong>My Devices</strong> so you can find these links in under 5 seconds when you're panicking at 2am.</p>
        <div className="bookmark-links">
          {BOOKMARK_LINKS.map(link => (
            <div key={link.url} className="bookmark-link-row">
              <span>{link.label}</span>
              <code className="bookmark-url">{link.url}</code>
            </div>
          ))}
        </div>
        <div className="browser-tabs">
          {(['chrome', 'safari', 'firefox'] as const).map(b => (
            <button
              key={b}
              className={`btn-tab ${bookmarkBrowser === b ? 'active' : ''}`}
              onClick={() => setBookmarkBrowser(bookmarkBrowser === b ? null : b)}
            >
              {b.charAt(0).toUpperCase() + b.slice(1)}
            </button>
          ))}
        </div>
        {bookmarkBrowser === 'chrome' && (
          <div className="bookmark-instructions">
            <ol>
              <li>Press <kbd>Ctrl+Shift+O</kbd> (Windows) or <kbd>Cmd+Opt+B</kbd> (Mac) to open Bookmarks Manager.</li>
              <li>Click the ⋮ menu → Add new folder → name it <strong>My Devices</strong>.</li>
              <li>For each link above: right-click a blank tab → Bookmark → choose the My Devices folder.</li>
            </ol>
          </div>
        )}
        {bookmarkBrowser === 'safari' && (
          <div className="bookmark-instructions">
            <ol>
              <li>Open each link above in a tab.</li>
              <li>Press <kbd>Cmd+D</kbd> → change the folder to Favorites or create a new folder named <strong>My Devices</strong>.</li>
              <li>Repeat for each link.</li>
            </ol>
          </div>
        )}
        {bookmarkBrowser === 'firefox' && (
          <div className="bookmark-instructions">
            <ol>
              <li>Press <kbd>Ctrl+Shift+O</kbd> (Windows) or <kbd>Cmd+Shift+O</kbd> (Mac) to open Bookmarks Library.</li>
              <li>Right-click Bookmarks Menu → New Folder → name it <strong>My Devices</strong>.</li>
              <li>For each link above: press <kbd>Ctrl+D</kbd> / <kbd>Cmd+D</kbd> and choose the My Devices folder.</li>
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}
