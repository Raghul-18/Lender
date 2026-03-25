import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { useProductRates, useCreateRate, useUpdateRate, useDeleteRate } from '../../hooks/useProductRates';
import { useAppContext } from '../../context/AppContext';
import { LoadingSpinner } from '../../components/shared/FormField';

const PRODUCT_TYPES = [
  'Asset Finance — Hire Purchase',
  'Asset Finance — Finance Lease',
  'Operating Lease',
  'Refinance',
  'Working Capital',
  'Invoice Finance',
  'Other',
];

const RATE_TYPES = ['Fixed', 'Variable'];

const emptyForm = () => ({
  product_type: PRODUCT_TYPES[0],
  rate_type: 'Fixed',
  min_term_months: 1,
  max_term_months: 60,
  apr_pct: '',
  is_active: true,
});

function RateForm({ initial, onSave, onCancel, isPending }) {
  const [form, setForm] = useState(initial || emptyForm());
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.apr_pct || isNaN(Number(form.apr_pct))) return;
    onSave({
      ...form,
      apr_pct: Number(form.apr_pct),
      min_term_months: Number(form.min_term_months),
      max_term_months: Number(form.max_term_months),
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr) auto', gap: 8, alignItems: 'end', padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--rl)', marginBottom: 8 }}>
      <div>
        <label style={{ fontSize: 10, color: 'var(--tx4)', fontWeight: 600, display: 'block', marginBottom: 3 }}>Product type</label>
        <select className="form-input" style={{ fontSize: 11 }} value={form.product_type} onChange={e => set('product_type', e.target.value)}>
          {PRODUCT_TYPES.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 10, color: 'var(--tx4)', fontWeight: 600, display: 'block', marginBottom: 3 }}>Rate type</label>
        <select className="form-input" style={{ fontSize: 11 }} value={form.rate_type} onChange={e => set('rate_type', e.target.value)}>
          {RATE_TYPES.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 10, color: 'var(--tx4)', fontWeight: 600, display: 'block', marginBottom: 3 }}>Min term (mo)</label>
        <input className="form-input" style={{ fontSize: 11 }} type="number" min="1" max="240" value={form.min_term_months} onChange={e => set('min_term_months', e.target.value)} required />
      </div>
      <div>
        <label style={{ fontSize: 10, color: 'var(--tx4)', fontWeight: 600, display: 'block', marginBottom: 3 }}>Max term (mo)</label>
        <input className="form-input" style={{ fontSize: 11 }} type="number" min="1" max="240" value={form.max_term_months} onChange={e => set('max_term_months', e.target.value)} required />
      </div>
      <div>
        <label style={{ fontSize: 10, color: 'var(--tx4)', fontWeight: 600, display: 'block', marginBottom: 3 }}>APR (%)</label>
        <input className="form-input" style={{ fontSize: 11 }} type="number" min="0" max="50" step="0.01" value={form.apr_pct} onChange={e => set('apr_pct', e.target.value)} placeholder="7.20" required />
      </div>
      <div>
        <label style={{ fontSize: 10, color: 'var(--tx4)', fontWeight: 600, display: 'block', marginBottom: 3 }}>Active</label>
        <button
          type="button"
          onClick={() => set('is_active', !form.is_active)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: form.is_active ? 'var(--green)' : 'var(--tx4)', height: 36, display: 'flex', alignItems: 'center' }}
        >
          {form.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button type="submit" className="btn btn-primary" style={{ fontSize: 11, height: 34, padding: '0 10px' }} disabled={isPending}>
          {isPending ? <LoadingSpinner size={12} /> : <Check size={13} />}
        </button>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 11, height: 34, padding: '0 10px' }} onClick={onCancel}>
          <X size={13} />
        </button>
      </div>
    </form>
  );
}

export default function AdminRatesPage() {
  const { data: rates = [], isLoading } = useProductRates(false);
  const createRate = useCreateRate();
  const updateRate = useUpdateRate();
  const deleteRate = useDeleteRate();
  const { showToast, confirm } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleCreate = async (data) => {
    try {
      await createRate.mutateAsync(data);
      showToast('Rate created', 'success');
      setShowAdd(false);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateRate.mutateAsync({ id, ...data });
      showToast('Rate updated', 'success');
      setEditingId(null);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Delete rate',
      message: 'This will permanently remove this rate. Deals already submitted will not be affected.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deleteRate.mutateAsync(id);
      showToast('Rate deleted', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleToggleActive = async (rate) => {
    try {
      await updateRate.mutateAsync({ id: rate.id, is_active: !rate.is_active });
    } catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Rate configuration</div>
          <div className="page-sub">Manage APR rates by product type and term. These drive the deal wizard calculator.</div>
        </div>
        <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => setShowAdd(true)}>
          <Plus size={13} /> Add rate
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>New rate</div>
          <RateForm onSave={handleCreate} onCancel={() => setShowAdd(false)} isPending={createRate.isPending} />
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 100px 90px 90px 80px 70px 90px',
          gap: 8, padding: '8px 16px',
          background: 'var(--bg)', borderBottom: '1px solid var(--bdr)',
          fontSize: 10, fontWeight: 700, color: 'var(--tx4)', textTransform: 'uppercase', letterSpacing: '.05em',
        }}>
          <div>Product type</div>
          <div>Rate type</div>
          <div>Min term</div>
          <div>Max term</div>
          <div>APR %</div>
          <div>Active</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {isLoading ? (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><LoadingSpinner size={24} /></div>
        ) : rates.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--tx4)', fontSize: 13 }}>
            No rates configured. Click "Add rate" to create the first one.
          </div>
        ) : (
          rates.map(rate => (
            editingId === rate.id ? (
              <div key={rate.id} style={{ padding: '8px 8px', borderBottom: '1px solid var(--bdr)' }}>
                <RateForm
                  initial={{ ...rate, apr_pct: rate.apr_pct }}
                  onSave={(data) => handleUpdate(rate.id, data)}
                  onCancel={() => setEditingId(null)}
                  isPending={updateRate.isPending}
                />
              </div>
            ) : (
              <div key={rate.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 100px 90px 90px 80px 70px 90px',
                gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--bdr)',
                alignItems: 'center',
                opacity: rate.is_active ? 1 : 0.5,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{rate.product_type}</div>
                <div style={{ fontSize: 12, color: 'var(--tx3)' }}>{rate.rate_type}</div>
                <div style={{ fontSize: 12 }}>{rate.min_term_months} mo</div>
                <div style={{ fontSize: 12 }}>{rate.max_term_months} mo</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--coral)' }}>{rate.apr_pct}%</div>
                <div>
                  <button
                    onClick={() => handleToggleActive(rate)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: rate.is_active ? 'var(--green)' : 'var(--tx4)' }}
                    title={rate.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {rate.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" style={{ fontSize: 10, padding: '3px 8px', height: 26 }} onClick={() => setEditingId(rate.id)}>
                    <Pencil size={11} />
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 10, padding: '3px 8px', height: 26, color: 'var(--red)' }}
                    onClick={() => handleDelete(rate.id)}
                    disabled={deleteRate.isPending}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            )
          ))
        )}
      </div>

      <div className="info-banner blue" style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, lineHeight: 1.6 }}>
          <strong>How rates work:</strong> When an originator selects a product type and term in the deal wizard,
          the system finds the matching rate for that term range and uses it to calculate the monthly payment.
          If no rate matches, a fallback of <strong>7.2% APR</strong> is used.
          Rates are also shown live in the calculator as the user adjusts the term.
        </div>
      </div>
    </div>
  );
}
