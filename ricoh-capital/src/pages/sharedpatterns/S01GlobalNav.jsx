export default function S01GlobalNav() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-badge gray">Shared Pattern S01</div>
        <div className="ph-title">Global Navigation Shell</div>
        <div className="ph-sub">The navigation layout used across all authenticated pages.</div>
      </div>

      <div className="card">
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 12 }}>Pattern documentation</div>
        <div className="grid-2" style={{ fontSize: 11, lineHeight: 1.7 }}>
          <div>
            <p style={{ marginBottom: 8 }}><strong>Top bar</strong> — fixed height 52px. Logo, breadcrumbs, mode badge, avatar. Sticky on scroll.</p>
            <p style={{ marginBottom: 8 }}><strong>Left nav</strong> — 200px wide. Sections with labels. Active state: coral left border + coral-l background.</p>
            <p style={{ marginBottom: 8 }}><strong>Breadcrumbs</strong> — current section shown in top bar. Full path for deep pages.</p>
          </div>
          <div>
            <p style={{ marginBottom: 8 }}><strong>Badges</strong> — numeric counts on nav items (e.g. unread notifications, pending items).</p>
            <p style={{ marginBottom: 8 }}><strong>Responsive</strong> — left nav collapses to icon-only at &lt;900px, hidden at &lt;600px with hamburger.</p>
            <p><strong>Modes</strong> — Originator Portal (coral badge), Customer Portal (green), Admin (purple).</p>
          </div>
        </div>
      </div>

      <div className="info-banner blue">
        <span style={{ fontSize: 16 }}>ℹ</span>
        <div style={{ fontSize: 11, color: 'var(--blue)' }}>
          <strong>Implementation note:</strong> This demo uses the navigation shell on every page. In production, the shell wraps all authenticated routes. The left nav items are role-filtered based on the logged-in user's permissions.
        </div>
      </div>

      <div className="card">
        <div className="card-title">Design tokens used</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { color: 'var(--coral)', token: '--coral: #BF4528', desc: 'Active nav, CTAs, brand' },
            { color: 'var(--coral-l)', token: '--coral-l: #FCF0EC', desc: 'Active nav background' },
            { color: 'var(--surface)', token: '--surface: #FFFFFF', desc: 'Nav background' },
            { color: 'var(--bdr)', token: '--bdr: #DDD9D1', desc: 'Nav borders' },
          ].map(t => (
            <div key={t.token} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 24, height: 24, background: t.color, borderRadius: 4, border: '1px solid var(--bdr)' }} />
              <div style={{ fontSize: 11 }}><span style={{ fontFamily: "'DM Mono', monospace" }}>{t.token}</span> · {t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
