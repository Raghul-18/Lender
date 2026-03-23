import { useState } from 'react';
import {
  CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  Building2, Wrench, CreditCard, Search, Send,
} from 'lucide-react';
import { useAllDeals, useApproveDeal, useRejectDeal, useSetDealUnderReview } from '../../hooks/useDeals';
import { useAppContext } from '../../context/AppContext';
import { LoadingSpinner } from '../../components/shared/FormField';

const STATUS_META = {
  submitted:    { label: 'Submitted',  color: 'var(--blue)',  bg: 'var(--blue-l)' },
  under_review: { label: 'In review',  color: 'var(--amber)', bg: 'var(--amber-l)' },
  approved:     { label: 'Approved',   color: 'var(--green)', bg: 'var(--green-l)' },
  rejected:     { label: 'Declined',   color: 'var(--red)',   bg: 'var(--red-l)' },
  draft:        { label: 'Draft',      color: 'var(--tx4)',   bg: 'var(--bg)' },
};

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, paddingBottom: 5, borderBottom: '1px solid var(--bdr)', marginBottom: 5 }}>
      <span style={{ color: 'var(--tx4)' }}>{label}</span>
      <span style={{ fontWeight: 500, maxWidth: 200, textAlign: 'right', color: 'var(--tx2)' }}>{value}</span>
    </div>
  );
}

function DealCard({ deal }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(deal.admin_notes || '');
  const [startDate, setStartDate] = useState('');
  const approve = useApproveDeal();
  const reject = useRejectDeal();
  const setUnderReview = useSetDealUnderReview();
  const { showToast } = useAppContext();

  const sm = STATUS_META[deal.status] || STATUS_META.submitted;
  const originator = deal.originator || {};
  const canDecide = deal.status === 'submitted' || deal.status === 'under_review';

  const handleApprove = async () => {
    try {
      await approve.mutateAsync({ dealId: deal.id, adminNotes: notes, startDate });
      showToast('Deal approved — contract created', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleReject = async () => {
    if (!notes.trim()) { showToast('Please provide a reason for declining this deal', 'warning'); return; }
    try {
      await reject.mutateAsync({ dealId: deal.id, adminNotes: notes });
      showToast('Deal declined — originator notified', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleMarkUnderReview = async () => {
    try {
      await setUnderReview.mutateAsync(deal.id);
      showToast('Deal marked as in review', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const isPending = approve.isPending || reject.isPending || setUnderReview.isPending;

  return (
    <div className="card" style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{deal.customer_name}</div>
            <span style={{ fontSize: 10, fontWeight: 600, color: sm.color, background: sm.bg, borderRadius: 99, padding: '2px 8px' }}>{sm.label}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--tx3)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--coral)' }}>{deal.reference_number}</span>
            <span>{deal.product_type}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Building2 size={10} /> {originator.company_name || originator.email || 'Unknown originator'}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--coral)' }}>£{(deal.monthly_payment || 0).toLocaleString()}/mo</div>
          <div style={{ fontSize: 11, color: 'var(--tx3)' }}>£{(deal.asset_value || 0).toLocaleString()} asset</div>
        </div>
        <div style={{ color: 'var(--tx4)', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--bdr)', padding: '18px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 18 }}>
            {/* Client */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--tx4)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Building2 size={11} /> Client
              </div>
              <Row label="Name" value={deal.customer_name} />
              <Row label="Product" value={deal.product_type} />
              <Row label="Your ref" value={deal.originator_reference} />
              <Row label="Start date" value={deal.preferred_start_date ? new Date(deal.preferred_start_date).toLocaleDateString('en-GB') : null} />
              {deal.notes && <Row label="Notes" value={deal.notes} />}
            </div>

            {/* Asset */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--tx4)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Wrench size={11} /> Asset
              </div>
              <Row label="Type" value={deal.asset_type} />
              <Row label="Make" value={deal.asset_make} />
              <Row label="Model" value={deal.asset_model} />
              <Row label="Year" value={deal.asset_year} />
              <Row label="Value" value={`£${(deal.asset_value || 0).toLocaleString()}`} />
            </div>

            {/* Finance */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--tx4)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <CreditCard size={11} /> Finance
              </div>
              <Row label="Monthly" value={`£${(deal.monthly_payment || 0).toLocaleString()}`} />
              <Row label="Term" value={`${deal.term_months} months`} />
              <Row label="Deposit" value={deal.deposit ? `£${deal.deposit.toLocaleString()}` : 'None'} />
              <Row label="Balloon" value={deal.balloon ? `£${deal.balloon.toLocaleString()}` : 'None'} />
              <Row label="APR" value={`${deal.apr}%`} />
              <Row label="Rate type" value={deal.rate_type} />
              <Row label="Total payable" value={`£${(deal.total_payable || 0).toLocaleString()}`} />
            </div>
          </div>

          {/* Originator info */}
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--rl)', padding: '10px 14px', marginBottom: 16, fontSize: 11, color: 'var(--tx3)' }}>
            Submitted by <strong style={{ color: 'var(--tx)' }}>{originator.company_name || '—'}</strong>
            {originator.full_name && ` · ${originator.full_name}`}
            {originator.email && ` · ${originator.email}`}
            {deal.created_at && ` · ${new Date(deal.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </div>

          {canDecide && (
            <div style={{ borderTop: '1px solid var(--bdr)', paddingTop: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>Credit decision</div>

              {deal.status === 'submitted' && (
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: 11, marginBottom: 12 }}
                  onClick={handleMarkUnderReview}
                  disabled={isPending}
                >
                  <Clock size={12} /> Mark as in review
                </button>
              )}

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: 'var(--tx3)', display: 'block', marginBottom: 4 }}>
                  Decision notes (required for decline, optional for approval)
                </label>
                <textarea
                  className="form-input"
                  style={{ height: 72, fontSize: 12, resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="e.g. Approved subject to direct debit setup. / Declined due to insufficient trading history."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: 'var(--tx3)', display: 'block', marginBottom: 4 }}>
                  Contract start date (leave blank to default to today)
                </label>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: 180, fontSize: 12 }}
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-primary"
                  style={{ background: 'var(--green)', borderColor: 'var(--green)' }}
                  onClick={handleApprove}
                  disabled={isPending}
                >
                  {approve.isPending ? <LoadingSpinner size={12} /> : <CheckCircle size={13} />}
                  Approve & create contract
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ color: 'var(--red)', border: '1px solid var(--red-m)' }}
                  onClick={handleReject}
                  disabled={isPending}
                >
                  {reject.isPending ? <LoadingSpinner size={12} /> : <XCircle size={13} />}
                  Decline
                </button>
              </div>
            </div>
          )}

          {/* Closed deal info */}
          {!canDecide && deal.admin_notes && (
            <div style={{ borderTop: '1px solid var(--bdr)', paddingTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx3)', marginBottom: 4 }}>Decision notes</div>
              <div style={{ fontSize: 12, color: 'var(--tx2)' }}>{deal.admin_notes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDealQueue() {
  const [filter, setFilter] = useState('submitted');
  const [search, setSearch] = useState('');
  const { data: deals = [], isLoading, error } = useAllDeals();

  const filtered = deals
    .filter(d => filter === 'all' || d.status === filter)
    .filter(d => {
      const q = search.toLowerCase();
      return !q
        || d.customer_name?.toLowerCase().includes(q)
        || d.reference_number?.toLowerCase().includes(q)
        || d.originator?.company_name?.toLowerCase().includes(q);
    });

  const counts = Object.fromEntries(
    ['submitted', 'under_review', 'approved', 'rejected'].map(s => [s, deals.filter(d => d.status === s).length])
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Deal review queue</div>
          <div className="page-sub">
            {counts.submitted + counts.under_review} deal{counts.submitted + counts.under_review !== 1 ? 's' : ''} awaiting decision
          </div>
        </div>
      </div>

      {/* Status summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { key: 'submitted',    label: 'New',       color: 'var(--blue)' },
          { key: 'under_review', label: 'In review', color: 'var(--amber)' },
          { key: 'approved',     label: 'Approved',  color: 'var(--green)' },
          { key: 'rejected',     label: 'Declined',  color: 'var(--red)' },
        ].map(({ key, label, color }) => (
          <div
            key={key}
            className="metric-card"
            style={{ cursor: 'pointer', outline: filter === key ? `2px solid ${color}` : undefined }}
            onClick={() => setFilter(filter === key ? 'all' : key)}
          >
            <div className="metric-value" style={{ color }}>{counts[key] || 0}</div>
            <div className="metric-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: 8, width: 260, height: 34, padding: '0 10px' }}>
          <Search size={13} style={{ color: 'var(--tx4)', flexShrink: 0 }} />
          <input style={{ all: 'unset', flex: 1, fontSize: 12 }} placeholder="Search customer, ref, or originator…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'submitted', 'under_review', 'approved', 'rejected'].map(s => (
            <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: 11, padding: '4px 12px', height: 32 }} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : STATUS_META[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="page-loading"><LoadingSpinner size={24} /></div>}
      {error && <div className="page-error">{error.message}</div>}

      {!isLoading && filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ color: 'var(--tx4)', marginBottom: 14 }}><Send size={40} /></div>
            <div className="empty-state-title">No deals here</div>
            <div className="empty-state-sub">Submitted deals from originators will appear here for credit review.</div>
          </div>
        </div>
      ) : (
        filtered.map(d => <DealCard key={d.id} deal={d} />)
      )}
    </div>
  );
}
