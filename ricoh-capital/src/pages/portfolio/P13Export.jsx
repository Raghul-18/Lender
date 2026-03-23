import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const allFields = ['Contract ref', 'Customer', 'Asset', 'Monthly payment', 'Asset value', 'Term'];
const defaultOn = [true, true, true, true, false, false];

export default function P13Export() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [fields, setFields] = useState(defaultOn);
  const [fmt, setFmt] = useState('csv');
  const [schedEnabled, setSchedEnabled] = useState(true);

  const toggleField = (i) => setFields(prev => prev.map((v, idx) => idx === i ? !v : v));

  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-badge blue">Portfolio</div>
        <div className="ph-title">Export &amp; Reports</div>
        <div className="ph-sub">Download portfolio data or schedule automated reports.</div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-title">Export data</div>
            <div className="form-field">
              <div className="field-label">Export format</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[['csv','CSV'],['xlsx','Excel (.xlsx)'],['pdf','PDF summary']].map(([val, label]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
                    <input type="radio" name="fmt" checked={fmt === val} onChange={() => setFmt(val)} /> {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-field">
              <div className="field-label">Date range</div>
              <div className="grid-2">
                <input className="form-input" type="date" defaultValue="2025-01-01" />
                <input className="form-input" type="date" defaultValue="2025-01-31" />
              </div>
            </div>
            <div className="form-field">
              <div className="field-label">Fields to include</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allFields.map((f, i) => (
                  <span key={f} className={`tag ${fields[i] ? 'coral' : 'gray'}`} style={{ cursor: 'pointer' }} onClick={() => toggleField(i)}>
                    {f} {fields[i] ? '✓' : ''}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={() => showToast('📥 Downloading portfolio_export_jan2025.csv…')}>📥 Download now</button>
              <button className="btn btn-ghost" onClick={() => showToast('✉ Export sent to james@acmefinance.co.uk')}>✉ Email me</button>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-title">Scheduled reports</div>
            <div style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 14 }}>Automate regular exports to your inbox.</div>
            <div className="form-field">
              <div className="field-label">Frequency</div>
              <select className="form-select">
                <option>Weekly (every Monday)</option>
                <option>Monthly (1st of month)</option>
                <option>Quarterly</option>
              </select>
            </div>
            <div className="form-field">
              <div className="field-label">Send to</div>
              <input className="form-input" defaultValue="james@acmefinance.co.uk" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div
                style={{ width: 36, height: 20, borderRadius: 10, background: schedEnabled ? 'var(--green)' : 'var(--bdrm)', cursor: 'pointer', position: 'relative', transition: 'background .15s' }}
                onClick={() => setSchedEnabled(s => !s)}
              >
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', right: schedEnabled ? 2 : undefined, left: schedEnabled ? undefined : 2, top: 2, transition: 'all .15s' }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--tx2)' }}>{schedEnabled ? 'Reports enabled' : 'Reports disabled'}</span>
            </div>
            <button className="btn btn-primary" onClick={() => showToast('✅ Scheduled report configured — first delivery Monday')}>Save schedule</button>
          </div>
        </div>
      </div>
    </div>
  );
}
