import { useParams, useNavigate } from 'react-router-dom';
import { useContract, usePaymentSchedule } from '../../hooks/useContracts';
import { LoadingSpinner } from '../../components/shared/FormField';

const STATUS_META = {
  active:    { label: 'Active',   color: 'var(--green)',  dot: '#22c55e' },
  overdue:   { label: 'Overdue',  color: 'var(--red)',    dot: '#ef4444' },
  maturing:  { label: 'Maturing', color: 'var(--amber)',  dot: '#f59e0b' },
  completed: { label: 'Completed', color: 'var(--tx3)',   dot: 'var(--tx4)' },
};

const PAYMENT_META = {
  upcoming:  { label: 'Upcoming',  color: 'var(--tx3)' },
  due_soon:  { label: 'Due soon',  color: 'var(--amber)' },
  paid:      { label: 'Paid',      color: 'var(--green)' },
  overdue:   { label: 'Overdue',   color: 'var(--red)' },
};

export default function P12AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: contract, isLoading: contractLoading } = useContract(id);
  const { data: schedule = [], isLoading: scheduleLoading } = usePaymentSchedule(id);

  if (contractLoading) return <div className="page-loading"><LoadingSpinner size={24} /></div>;
  if (!contract) return <div className="page-error">Contract not found.</div>;

  const sm = STATUS_META[contract.status] || STATUS_META.active;
  const paidPayments = schedule.filter(p => p.status === 'paid').length;
  const progressPct = schedule.length ? Math.round((paidPayments / schedule.length) * 100) : 0;
  const totalPaid = schedule.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
  const outstanding = (schedule.length - paidPayments) * (contract.monthly_payment || 0);

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/portfolio')}>← Portfolio</button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="page-title">{contract.customer_name}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: sm.color, background: 'var(--bg)', border: `1px solid ${sm.color}33`, borderRadius: 10, padding: '3px 8px' }}>
                {sm.label}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--tx3)' }}>
              {contract.reference_number} · {contract.asset_description}
            </div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Monthly payment', value: `£${(contract.monthly_payment || 0).toLocaleString()}` },
          { label: 'Asset value', value: `£${(contract.asset_value || 0).toLocaleString()}` },
          { label: 'Total paid', value: `£${totalPaid.toLocaleString()}` },
          { label: 'Outstanding', value: `£${outstanding.toLocaleString()}` },
        ].map(k => (
          <div key={k.label} className="metric-card">
            <div className="metric-value" style={{ fontSize: 20 }}>{k.value}</div>
            <div className="metric-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16 }}>
        {/* Left: contract details */}
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 12, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Contract Details</div>
            {[
              ['Reference', contract.reference_number],
              ['Asset', contract.asset_description],
              ['Asset value', `£${(contract.asset_value || 0).toLocaleString()}`],
              ['Term', `${contract.term_months} months`],
              ['Start date', contract.start_date ? new Date(contract.start_date).toLocaleDateString('en-GB') : '—'],
              ['End date', contract.end_date ? new Date(contract.end_date).toLocaleDateString('en-GB') : '—'],
              ['Next payment', contract.next_payment_date ? new Date(contract.next_payment_date).toLocaleDateString('en-GB') : '—'],
              ['Payments made', `${paidPayments} of ${schedule.length}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingBottom: 6, borderBottom: '1px solid var(--bdr)', marginBottom: 6 }}>
                <span style={{ color: 'var(--tx3)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 12 }}>Agreement progress</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--tx3)', marginBottom: 6 }}>
              <span>{paidPayments} payments made</span>
              <span>{progressPct}%</span>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, background: sm.dot, width: `${progressPct}%`, transition: '1s' }} />
            </div>
          </div>
        </div>

        {/* Right: payment schedule */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Payment schedule</div>
            <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{schedule.length} payments</span>
          </div>

          {scheduleLoading ? (
            <div style={{ textAlign: 'center', padding: 24 }}><LoadingSpinner size={20} /></div>
          ) : schedule.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--tx4)', textAlign: 'center', padding: 20 }}>
              No payment schedule found
            </div>
          ) : (
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Due date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Status</th>
                    <th>Paid on</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map(p => {
                    const pm = PAYMENT_META[p.status] || PAYMENT_META.upcoming;
                    return (
                      <tr key={p.id}>
                        <td style={{ color: 'var(--tx4)', fontSize: 11 }}>{p.payment_number}</td>
                        <td style={{ fontSize: 12 }}>{new Date(p.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 12 }}>£{(p.amount || 0).toLocaleString()}</td>
                        <td>
                          <span style={{ fontSize: 11, color: pm.color, fontWeight: 500 }}>{pm.label}</span>
                        </td>
                        <td style={{ fontSize: 11, color: 'var(--tx4)' }}>
                          {p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
