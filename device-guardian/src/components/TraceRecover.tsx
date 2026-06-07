export function TraceRecover() {
  return (
    <div className="trace-recover">
      <h2>Trace & Recover</h2>
      <p className="page-subtitle">This is how you find a device when tracking apps show nothing. Work through these one at a time.</p>

      <div className="trace-card">
        <div className="trace-icon">🗺️</div>
        <h3>Google Maps Timeline</h3>
        <p>This shows everywhere your phone has been, not just where it is now. Use this to retrace your route. Look for the last location before it went offline.</p>
        <a className="btn-primary btn-link" href="https://maps.google.com/timeline" target="_blank" rel="noopener noreferrer">
          Open Google Maps Timeline ↗
        </a>
      </div>

      <div className="trace-card">
        <div className="trace-icon">📶</div>
        <h3>Last known Wi-Fi networks</h3>
        <p><strong>Android:</strong> Settings → About Phone → Status → Wi-Fi MAC address. This narrows your search to a specific building or area.</p>
        <p><strong>iPhone:</strong> This information isn't available on iOS.</p>
        <p className="trace-tip">Cross-reference your Maps Timeline with places that have Wi-Fi — cafés, airports, friend's homes.</p>
      </div>

      <div className="trace-card">
        <div className="trace-icon">📡</div>
        <h3>Offline finding — Samsung only</h3>
        <p>Settings → Biometrics & Security → Find My Mobile → Offline finding → ON</p>
        <p>When your Samsung is off or has no signal, nearby Samsung devices ping it via Bluetooth and report its location anonymously. You don't need to do anything — it just works if this is enabled.</p>
      </div>

      <div className="trace-card">
        <div className="trace-icon">🔋</div>
        <h3>Send Last Location</h3>
        <p>When your battery hits 5–10%, the phone sends one final GPS ping to the tracking service. This is how I found my phone on the highway.</p>
        <p>Check your tracking app — there may be a "last location before battery died" pin that's different from the current location.</p>
      </div>

      <div className="trace-card">
        <div className="trace-icon">☁️</div>
        <h3>Cloud backup check</h3>
        <p>Your data is probably safe even if the device isn't. Check now so you're not worried about two things at once.</p>
        <div className="cloud-links">
          <a className="btn-secondary btn-link btn-sm" href="https://photos.google.com" target="_blank" rel="noopener noreferrer">Google Photos ↗</a>
          <a className="btn-secondary btn-link btn-sm" href="https://contacts.google.com" target="_blank" rel="noopener noreferrer">Google Contacts ↗</a>
          <a className="btn-secondary btn-link btn-sm" href="https://www.samsung.com/us/support/owners/app/samsung-cloud" target="_blank" rel="noopener noreferrer">Samsung Cloud ↗</a>
          <a className="btn-secondary btn-link btn-sm" href="https://icloud.com" target="_blank" rel="noopener noreferrer">iCloud ↗</a>
        </div>
      </div>

      <div className="trace-card trace-card--gone">
        <h3>If you never see this phone again</h3>
        <p className="section-intro">Here's the four-step recovery. You lose the hardware. You don't lose your life.</p>
        <div className="gone-steps">
          <div className="gone-step">
            <span className="gone-num">1</span>
            <div>
              <strong>Change your Google password immediately</strong>
              <a className="btn-text btn-sm" href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer">google.com → Security ↗</a>
            </div>
          </div>
          <div className="gone-step">
            <span className="gone-num">2</span>
            <div>
              <strong>Remote sign out of the lost device</strong>
              <div className="gone-links">
                <a className="btn-text btn-sm" href="https://account.samsung.com" target="_blank" rel="noopener noreferrer">samsung.com ↗</a>
                <a className="btn-text btn-sm" href="https://appleid.apple.com" target="_blank" rel="noopener noreferrer">appleid.apple.com ↗</a>
                <a className="btn-text btn-sm" href="https://myaccount.google.com/device-activity" target="_blank" rel="noopener noreferrer">Google devices ↗</a>
              </div>
            </div>
          </div>
          <div className="gone-step">
            <span className="gone-num">3</span>
            <div>
              <strong>Restore from cloud backup to a new phone</strong>
              <p>Your photos, contacts, and apps come back. The setup wizard walks you through it on first boot.</p>
            </div>
          </div>
          <div className="gone-step">
            <span className="gone-num">4</span>
            <div>
              <strong>You're done.</strong>
              <p>You lost the hardware. Everything else came back.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
