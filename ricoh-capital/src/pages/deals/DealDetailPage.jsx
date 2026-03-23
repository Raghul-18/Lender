import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, Send, FileText,
  Building2, Wrench, CreditCard, Info, ExternalLink,
} from 'lucide-react';
import { useDeal } from '../../hooks/useDeals';
import { LoadingSpinner } from '../../components/shared/FormField';

const STATUS_META = {
  draft:        { label: 'Draft',        color: 'var(--tx3)',   icon: <FileText size={16} />,     step: 0 },
  submitted:    { label: 'Submitted',    color: 'var(--blue)',  icon: <Send size={16} />,          step: 1 },
  under_review: { label: 'In review',    color: 'var(--amber)', icon: <Clock size={16} />,         step: 2 },
  approved:     { label: 'Approved',     color: 'var(--green)', icon: <CheckCircle size={16} />,   step: 3 },
  rejected:     { label: 'Not approved', color: 'var(--red)',   icon: <XCircle size={16} />,       step: -1 },
};

const TIMELINE_STEPS = [
  { key: 'submitted',    label: 'Deal submitted',     sub: 'Sent to Zoro Capital for review' },
  { key: 'under_review', label: 'Credit review',       sub: 'A credit analyst is reviewing the deal' },
  { key: 'approved',     label: 'Decision made',       sub: 'Contract issued and active' },
];

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingBottom: 7, borderBottom: '1px solid var(--bdr)', marginBottom: 7 }}>
      <span style={{ color: 'var(--tx3)' }}>{label}</span>
      <span style={{ fontWeight: 500, maxWidth: 220, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function DealDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: deal, isLoading } = useDeal(id);

  if (isLoading) return <div className="page-loading"><LoadingSpinner size={24} /></div>;
  if (!deal) return <div className="page-error">Deal not found.</div>;

  const sm = STATUS_META[deal.status] || STATUS_META.submitted;
  const currentStep = sm.step;
  const isRejected = deal.status === 'rejected';
  const isApproved = deal.status === 'approved';

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/deals')}>
            <ArrowLeft size={14} /> My deals
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="page-title">{deal.customer_name}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: sm.color, background: sm.color + '18', border: `1px solid ${sm.color}33`, borderRadius: 10, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                {sm.icon && <span style={{ display: 'flex' }}>{sm.icon}</span>}
                {sm.label}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--tx3)' }}>
              {deal.reference_number} · {deal.product_type}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
        {/* Left column — details */}
        <div>
          {/* Status timeline */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>Application status</div>
            {isRejected ? (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--red-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', flexShrink: 0 }}>
                  <XCircle size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>Deal not approved</div>
                  <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 3, lineHeight: 1.5 }}>
                    {deal.admin_notes || 'This deal was not approved at this time. Please contact your relationship manager for details.'}
                  </div>
                  {deal.reviewed_at && (
                    <div style={{ fontSize: 10, color: 'var(--tx4)', marginTop: 6 }}>
                      Decision made {new Date(deal.reviewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {TIMELINE_STEPS.map((step, i) => {
                  const done = currentStep > i + 1;
                  const active = currentStep === i + 1;
                  const pending = currentStep < i + 1;
                  return (
                    <div key={step.key} style={{ display: 'flex', gap: 12, paddingBottom: i < TIMELINE_STEPS.length - 1 ? 20 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                          background: done ? 'var(--green)' : active ? 'var(--coral)' : 'var(--bg)',
                          color: done || active ? '#fff' : 'var(--tx4)',
                          border: pending ? '2px solid var(--bdr)' : 'none',
                        }}>
                          {done ? <CheckCircle size={14} /> : i + 1}
                        </div>
                        {i < TIMELINE_STEPS.length - 1 && (
                          <div style={{ width: 2, flex: 1, background: done ? 'var(--green)' : 'var(--bdr)', minHeight: 16, marginTop: 3 }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: i < TIMELINE_STEPS.length - 1 ? 8 : 0 }}>
                        <div style={{ fontWeight: active ? 700 : 600, fontSize: 13, color: active ? 'var(--coral)' : pending ? 'var(--tx4)' : 'var(--tx)' }}>
                          {step.label}
                          {active && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--coral)', background: 'var(--coral-l)', borderRadius: 99, padding: '1px 8px' }}>Current</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--tx4)', marginTop: 2 }}>{step.sub}</div>
                        {step.key === 'approved' && isApproved && deal.reviewed_at && (
                          <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>
                            Approved {new Date(deal.reviewed_at).toLocaleDateString('en-GB')}
                            {deal.admin_notes && ` — ${deal.admin_notes}`}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Approved — link to contract */}
          {isApproved && (
            <div className="info-banner" style={{ marginBottom: 14, borderColor: 'var(--green-m)', background: 'var(--green-l)' }}>
              <CheckCircle size={14} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 12, color: 'var(--tx2)', flex: 1 }}>
                This deal has been approved and a contract is now active.
              </div>
              <button className="btn btn-ghost" style={{ fontSize: 11, border: '1px solid var(--green-m)', color: 'var(--green-d)' }} onClick={() => navigate('/portfolio')}>
                <ExternalLink size={11} /> View contract
              </button>
            </div>
          )}

          {/* Client & deal info */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Building2 size={14} style={{ color: 'var(--coral)' }} />
              <div style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--tx3)' }}>Client & deal</div>
            </div>
            <Row label="Client name" value={deal.customer_name} />
            <Row label="Product type" value={deal.product_type} />
            <Row label="Your reference" value={deal.originator_reference} />
            <Row label="Preferred start" value={deal.preferred_start_date ? new Date(deal.preferred_start_date).toLocaleDateString('en-GB') : null} />
            <Row label="Notes" value={deal.notes} />
          </div>

          {/* Asset info */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Wrench size={14} style={{ color: 'var(--coral)' }} />
              <div style={{ fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--tx3)' }}>Asset</div>
            </div>
            <Row label="Type" value={deal.asset_type} />
            <Row label="Make" value={deal.asset_make} />
            <Row label="Model" value={deal.asset_model} />
            <Row label="Year" value={deal.asset_year} />
            <Row label="Value" value={`£${(deal.asset_value || 0).toLocaleString()}`} />
          </div>
        </div>

        {/* Right column — finance summary */}
        <div>
          <div className="calc-box" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <CreditCard size={14} style={{ color: 'var(--coral)' }} />
              <div style={{ fontWeight: 700, fontSize: 14 }}>Finance summary</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 0 18px', borderBottom: '1px solid var(--bdr)', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--tx3)' }}>Monthly payment</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--coral)', lineHeight: 1.2 }}>
                £{(deal.monthly_payment || 0).toLocaleString()}
              </div>
            </div>
            {[
              ['Asset value',     `£${(deal.asset_value || 0).toLocaleString()}`],
              ['Deposit',         deal.deposit ? `£${deal.deposit.toLocaleString()}` : 'None'],
              ['Balloon',         deal.balloon ? `£${deal.balloon.toLocaleString()}` : 'None'],
              ['Amount financed', `£${Math.max(0, (deal.asset_value || 0) - (deal.deposit || 0) - (deal.balloon || 0)).toLocaleString()}`],
              ['Term',            `${deal.term_months} months`],
              ['Rate type',       deal.rate_type],
              ['APR',             `${deal.apr}%`],
              ['Total payable',   `£${(deal.total_payable || 0).toLocaleString()}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: 'var(--tx3)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>Submitted</div>
            <Row label="Reference" value={deal.reference_number} />
            <Row label="Date submitted" value={new Date(deal.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
            {deal.reviewed_at && <Row label="Decision date" value={new Date(deal.reviewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />}
          </div>

          {deal.status === 'under_review' && (
            <div className="info-banner blue" style={{ marginTop: 12 }}>
              <Info size={14} style={{ color: 'var(--blue)', flexShrink: 0 }} />
              <div style={{ fontSize: 11, lineHeight: 1.6 }}>
                A credit analyst is reviewing this deal. Decisions are typically made within 2 business days.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
