import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function P20QualifyConvert() {
  const navigate = useNavigate();
  const { showToast } = useApp();

  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-badge amber">CRM</div>
        <div className="ph-title">Qualify / Convert</div>
        <div className="ph-sub">Assess prospect quality and convert to a customer or active deal.</div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-title">Qualification score — Fresh Harvest Ltd</div>
            <div className="form-field">
              <div className="field-label">Budget confirmed?</div>
              <select className="form-select"><option>Yes — £85,000 confirmed</option><option>No</option><option>Unknown</option></select>
            </div>
            <div className="form-field">
              <div className="field-label">Timeline</div>
              <select className="form-select"><option>Immediate (within 30 days)</option><option>1–3 months</option><option>3–6 months</option></select>
            </div>
            <div className="form-field">
              <div className="field-label">Decision maker engaged?</div>
              <select className="form-select"><option>Yes — MD and Finance Director</option><option>Partially</option><option>No</option></select>
            </div>
            <div className="form-field">
              <div className="field-label">Pipeline stage</div>
              <select className="form-select">
                <option>New lead</option><option>Qualified</option><option selected>Proposal sent</option><option>Negotiation</option><option>Won</option><option>Lost</option>
              </select>
            </div>
            <div className="form-field">
              <div className="field-label">Notes</div>
              <textarea className="form-textarea" defaultValue="Highly qualified — budget approved, decision Q1. MD very engaged. Main competitor is broker from Manchester." />
            </div>
            <button className="btn btn-primary" onClick={() => showToast('Qualification updated — prospect score: 87/100')}>Save qualification</button>
          </div>
        </div>

        <div>
          <div className="card" style={{ borderColor: 'var(--green-m)', background: 'var(--green-l)' }}>
            <div className="card-title" style={{ color: 'var(--green-d)' }}>🔀 Convert to customer &amp; deal</div>
            <div style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 14, lineHeight: 1.6 }}>
              Ready to convert Fresh Harvest Ltd? This will create a customer record and link to a new deal application.
            </div>
            <div className="form-field">
              <div className="field-label">Link to existing deal</div>
              <input className="form-input" placeholder="Search deals… or create new" />
            </div>
            <button className="btn btn-green" onClick={() => { showToast('✅ Fresh Harvest Ltd converted — customer record created'); navigate('/new-deal'); }}>
              Convert &amp; start deal →
            </button>
          </div>

          <div className="card">
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: 'var(--green)', marginBottom: 4 }}>87</div>
              <div style={{ fontSize: 11, color: 'var(--tx3)' }}>Qualification score / 100</div>
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 500, color: 'var(--green-d)' }}>✅ Highly qualified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
