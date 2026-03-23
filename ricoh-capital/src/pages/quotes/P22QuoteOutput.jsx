import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Send } from 'lucide-react';
import { useQuote, useSendQuote, calcMonthly } from '../../hooks/useQuotes';
import { useQuotes } from '../../hooks/useQuotes';
import { useAppContext } from '../../context/AppContext';
import { LoadingSpinner } from '../../components/shared/FormField';
import { ZoroMark } from '../../components/shared/ZoroLogo';

const STATUS_META = {
  draft:    { label: 'Draft',    color: 'var(--tx3)' },
  sent:     { label: 'Sent',     color: 'var(--blue)' },
  accepted: { label: 'Accepted', color: 'var(--green)' },
  rejected: { label: 'Rejected', color: 'var(--red)' },
  expired:  { label: 'Expired',  color: 'var(--tx4)' },
};

function QuoteCard({ quote, onSend }) {
  if (!quote) return null;
  const sm = STATUS_META[quote.status] || STATUS_META.draft;

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--bdr)', borderRadius: 'var(--rxl)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'var(--coral)', padding: '24px 28px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ZoroMark size={34} />
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.3px', color: '#fff' }}>Zoro Capital</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, opacity: .8 }}>Quote reference</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700 }}>{quote.reference_number}</div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, opacity: .8 }}>Prepared for</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{quote.customer_name}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 12, color: 'var(--tx3)' }}>
          <div>Asset type: <strong style={{ color: 'var(--tx1)' }}>{quote.asset_type}</strong></div>
          <div>Asset value: <strong style={{ color: 'var(--tx1)' }}>£{(quote.asset_value || 0).toLocaleString()}</strong></div>
          <div>Valid until: <strong style={{ color: 'var(--tx1)' }}>{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('en-GB') : '—'}</strong></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Status: <span style={{ fontWeight: 700, color: sm.color }}>{sm.label}</span>
          </div>
        </div>

        {/* Scenarios */}
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Finance options</div>
        {(quote.scenarios || []).map((sc, i) => (
          <div key={i} style={{
            border: i === 0 ? '2px solid var(--coral)' : '1px solid var(--bdr)',
            borderRadius: 'var(--rl)', padding: '16px 20px', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Option {i + 1}</div>
                <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>
                  {sc.termMonths} months · {sc.aprPct}% APR · {sc.rateType} rate
                  {sc.deposit > 0 && ` · £${sc.deposit.toLocaleString()} deposit`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: i === 0 ? 'var(--coral)' : 'var(--tx1)' }}>
                  £{(sc.monthlyPayment || calcMonthly(quote.asset_value, sc.deposit, sc.termMonths, sc.aprPct)).toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: 'var(--tx3)' }}>per month</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--bdr)', marginTop: 12, paddingTop: 10, display: 'flex', gap: 24, fontSize: 12, color: 'var(--tx3)' }}>
              <div>Total payable: <strong style={{ color: 'var(--tx1)' }}>£{(sc.totalPayable || 0).toLocaleString()}</strong></div>
              <div>Amount financed: <strong style={{ color: 'var(--tx1)' }}>£{((quote.asset_value || 0) - (sc.deposit || 0)).toLocaleString()}</strong></div>
            </div>
          </div>
        ))}

        <div style={{ fontSize: 10, color: 'var(--tx4)', marginTop: 16, lineHeight: 1.6 }}>
          This quotation is indicative only and subject to credit approval. All figures include VAT where applicable.
          APR quoted is representative. Zoro Capital Limited is authorised and regulated by the Financial Conduct Authority.
          Valid for 30 days from the date above.
        </div>
      </div>

      {/* Footer actions */}
      {quote.status === 'draft' && (
        <div style={{ borderTop: '1px solid var(--bdr)', padding: '16px 24px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => onSend(quote.id, quote.customer_name)}>
            <Send size={13} /> Send to customer
          </button>
        </div>
      )}
    </div>
  );
}

// ── Single quote output ────────────────────────────────────
export default function P22QuoteOutput() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: quote, isLoading } = useQuote(id);
  const sendQuote = useSendQuote();
  const { showToast } = useAppContext();

  const handleSend = async (quoteId, customerName) => {
    await sendQuote.mutateAsync({ quoteId, customerName });
    showToast('Quote sent to customer!', 'success');
  };

  if (isLoading) return <div className="page-loading"><LoadingSpinner size={24} /></div>;
  if (!quote) return <div className="page-error">Quote not found.</div>;

  return (
    <div className="page" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <button className="btn btn-ghost" onClick={() => navigate('/quotes')}><ArrowLeft size={14} /> All quotes</button>
        <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => window.print()}><Printer size={13} /> Print</button>
      </div>
      <QuoteCard quote={quote} onSend={handleSend} />
    </div>
  );
}
