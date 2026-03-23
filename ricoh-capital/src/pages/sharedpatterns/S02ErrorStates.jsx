import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function S02ErrorStates() {
  const navigate = useNavigate();
  const { showToast } = useApp();

  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-badge gray">Shared Pattern S02</div>
        <div className="ph-title">Empty &amp; Error States</div>
        <div className="ph-sub">Graceful handling of edge cases across all pages.</div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-title">Empty state — no results</div>
            <div style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>No contracts found</div>
              <div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 16 }}>Try adjusting your filters or search term.</div>
              <button className="btn btn-ghost btn-sm" onClick={() => showToast('Filters cleared')}>Clear filters</button>
            </div>
          </div>
          <div className="card">
            <div className="card-title">403 — No permission</div>
            <div style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Access restricted</div>
              <div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 16 }}>You don't have permission to view this page. Contact your account administrator.</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/portfolio')}>← Go back</button>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-title">API error state</div>
            <div className="info-banner red">
              <span style={{ fontSize: 16 }}>⚠</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', marginBottom: 3 }}>Unable to load portfolio data</div>
                <div style={{ fontSize: 11, color: 'var(--tx2)', marginBottom: 8 }}>There was a problem connecting to the server. Your data is safe — please try again.</div>
                <button className="btn btn-sm" style={{ background: 'var(--red)', color: '#fff', border: 'none' }} onClick={() => showToast('Retrying request…')}>↺ Retry</button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">404 — Page not found</div>
            <div style={{ textAlign: 'center', padding: '24px 20px' }}>
              <div style={{ fontSize: 36, fontFamily: "'DM Mono', monospace", fontWeight: 700, color: 'var(--bdrm)', marginBottom: 10 }}>404</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Page not found</div>
              <div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 16 }}>The page you're looking for doesn't exist or has been moved.</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/portfolio')}>Go to dashboard</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
