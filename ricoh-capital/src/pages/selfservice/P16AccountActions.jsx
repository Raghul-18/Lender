import { useApp } from '../../context/AppContext';

export default function P16AccountActions() {
  const { showToast } = useApp();

  return (
    <div className="page">
      <div className="page-header">
        <div className="ph-badge green">Customer Portal</div>
        <div className="ph-title">Account Actions</div>
        <div className="ph-sub">Manage your account and make service requests.</div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-title">Statements &amp; documents</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { title: 'Account statement', sub: 'All contracts — Jan 2025', btnLabel: 'Download PDF', fn: () => showToast('📄 Downloading statement…') },
                { title: 'Finance agreements', sub: 'All signed agreements', btnLabel: 'Download ZIP', fn: () => showToast('📄 Downloading agreements…') },
                { title: 'Payment history', sub: 'All payments to date', btnLabel: 'Download CSV', fn: () => showToast('📄 Downloading payment history…') },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid var(--bdr)', borderRadius: 'var(--r)' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--tx3)' }}>{item.sub}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={item.fn}>{item.btnLabel}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Service requests</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '💰', title: 'Request early settlement', sub: 'Get a settlement quote for any active contract', fn: () => showToast('Opening early settlement request…') },
                { icon: '🔄', title: 'Request upgrade / variation', sub: 'Change terms, extend, or upgrade your agreement', fn: () => showToast('Opening upgrade/variation form…') },
                { icon: '💬', title: 'Contact us', sub: 'Speak with our customer support team', fn: () => showToast('Opening support chat…') },
              ].map(item => (
                <div key={item.title} style={{ border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: '12px 14px', cursor: 'pointer' }} onClick={item.fn}>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{item.icon} {item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-title">Update bank details</div>
            <div className="form-field">
              <div className="field-label">Account holder name</div>
              <input className="form-input" defaultValue="TechWorks Solutions Ltd" />
            </div>
            <div className="grid-2">
              <div className="form-field">
                <div className="field-label">Sort code</div>
                <input className="form-input" defaultValue="20-45-78" />
              </div>
              <div className="form-field">
                <div className="field-label">Account number</div>
                <input className="form-input" defaultValue="12345678" />
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => showToast('Bank details update requested — verification email sent')}>Submit change request</button>
          </div>
        </div>
      </div>
    </div>
  );
}
