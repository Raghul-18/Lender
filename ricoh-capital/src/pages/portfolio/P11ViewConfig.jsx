import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const defaultCols = [
  { label: 'Contract reference', on: true },
  { label: 'Customer name', on: true },
  { label: 'Asset description', on: true },
  { label: 'Monthly payment', on: true },
  { label: 'Asset value', on: false },
  { label: 'Originator reference', on: false },
  { label: 'Status badge', on: true },
];

export default function P11ViewConfig() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [cols, setCols] = useState(defaultCols);
  const [viewName, setViewName] = useState('');

  const toggleCol = (i) => setCols(prev => prev.map((c, idx) => idx === i ? { ...c, on: !c.on } : c));

  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-badge blue">Portfolio</div>
        <div className="ph-title">View Configurator</div>
        <div className="ph-sub">Customise the columns and sorting of your portfolio table.</div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Column visibility</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cols.map((col, i) => (
              <div key={col.label} className="check-row" onClick={() => toggleCol(i)}>
                <div style={{ width: 16, height: 16, borderRadius: 3, border: `2px solid ${col.on ? 'var(--coral)' : 'var(--bdrm)'}`, background: col.on ? 'var(--coral)' : 'transparent', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>
                  {col.on ? '✓' : ''}
                </div>
                <div style={{ flex: 1, fontSize: 12 }}>{col.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-title">Saved views</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="check-row" style={{ borderRadius: 'var(--r)', border: '1px solid var(--coral-m)', background: 'var(--coral-l)' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--coral)', flex: 1 }}>Default view</div>
                <span className="tag coral">Active</span>
              </div>
              <div className="check-row" style={{ borderRadius: 'var(--r)', border: '1px solid var(--bdr)' }}>
                <div style={{ fontSize: 12, flex: 1 }}>Overdue focus</div>
                <button className="btn btn-ghost btn-sm" onClick={() => showToast('Overdue focus view activated')}>Load</button>
              </div>
              <div className="check-row" style={{ borderRadius: 'var(--r)', border: '1px solid var(--bdr)' }}>
                <div style={{ fontSize: 12, flex: 1 }}>Maturing contracts</div>
                <button className="btn btn-ghost btn-sm" onClick={() => showToast('Maturing contracts view activated')}>Load</button>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <input className="form-input" placeholder="Name your view…" style={{ flex: 1 }} value={viewName} onChange={e => setViewName(e.target.value)} />
              <button className="btn btn-primary" onClick={() => { showToast('View saved!'); setViewName(''); }}>Save view</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/portfolio')}>← Back to portfolio</button>
            <button className="btn btn-primary" onClick={() => { navigate('/portfolio'); showToast('View configuration saved'); }}>Apply changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
