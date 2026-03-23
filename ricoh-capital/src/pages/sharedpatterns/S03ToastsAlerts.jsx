import { useApp } from '../../context/AppContext';

export default function S03ToastsAlerts() {
  const { showToast } = useApp();

  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-badge gray">Shared Pattern S03</div>
        <div className="ph-title">Notifications &amp; Toasts</div>
        <div className="ph-sub">System feedback patterns used across all pages.</div>
      </div>

      <div className="card">
        <div className="card-title">Toast notifications — click to trigger</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" style={{ background: 'var(--green)', color: '#fff' }} onClick={() => showToast('✓ Deal submitted successfully — Ref RC-2025-08741')}>Success toast</button>
          <button className="btn" style={{ background: 'var(--amber)', color: '#fff' }} onClick={() => showToast('⚠ Your session expires in 5 minutes')}>Warning toast</button>
          <button className="btn" style={{ background: 'var(--red)', color: '#fff' }} onClick={() => showToast('✕ Upload failed — file too large (max 20 MB)')}>Error toast</button>
          <button className="btn btn-ghost" onClick={() => showToast('ℹ Deal RC-2025-08741 is pending credit review')}>Info toast</button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Inline banners</div>
          <div className="info-banner green" style={{ marginBottom: 10 }}><span>✅</span><div style={{ fontSize: 11, color: 'var(--green-d)' }}><strong>Application approved.</strong> Your deal has been accepted and will commence on 14 Feb 2025.</div></div>
          <div className="info-banner amber" style={{ marginBottom: 10 }}><span>⚠</span><div style={{ fontSize: 11, color: 'var(--amber)' }}><strong>Action required.</strong> Director ID check failed. Please resubmit a clearer scan.</div></div>
          <div className="info-banner red" style={{ marginBottom: 10 }}><span>✕</span><div style={{ fontSize: 11, color: 'var(--red)' }}><strong>Application rejected.</strong> Please review the reason below and contact support.</div></div>
          <div className="info-banner blue"><span>ℹ</span><div style={{ fontSize: 11, color: 'var(--blue)' }}><strong>Checks in progress.</strong> 4 of 7 automated checks complete. Estimated: 2 hours.</div></div>
        </div>

        <div className="card">
          <div className="card-title">Design tokens</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { color: 'var(--green)', token: '--green: #2C7A4B', desc: 'Success' },
              { color: 'var(--amber)', token: '--amber: #A86410', desc: 'Warning' },
              { color: 'var(--red)', token: '--red: #C0372A', desc: 'Error' },
              { color: 'var(--blue)', token: '--blue: #1A5FA8', desc: 'Info' },
              { color: 'var(--coral)', token: '--coral: #BF4528', desc: 'Brand / CTA' },
            ].map(t => (
              <div key={t.token} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 24, height: 24, background: t.color, borderRadius: 4 }} />
                <div style={{ fontSize: 11 }}><span style={{ fontFamily: "'DM Mono', monospace" }}>{t.token}</span> · {t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
