import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Send, Save, ExternalLink } from 'lucide-react';
import { useCreateQuote, calcMonthly } from '../../hooks/useQuotes';
import { useProspects } from '../../hooks/useProspects';
import { useAppContext } from '../../context/AppContext';
import { FormField, LoadingSpinner } from '../../components/shared/FormField';
import { useCurrency } from '../../hooks/useCurrency';

const ASSET_TYPES = ['Commercial vehicle', 'Plant & machinery', 'Medical equipment', 'Catering equipment', 'IT & technology', 'Agricultural equipment', 'Other'];
const TERMS = [12, 24, 36, 48, 60, 72, 84];

const headerSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  assetType: z.string().min(1, 'Asset type is required'),
  assetValue: z.number({ invalid_type_error: 'Enter a valid number' }).min(1000, 'Asset value must be at least 1,000'),
});

const scenarioSchema = z.object({
  termMonths: z.number().min(6).max(120),
  deposit: z.number().min(0),
  aprPct: z.number({ invalid_type_error: 'Enter a valid APR' })
    .min(0.1, 'APR must be greater than 0')
    .max(50, 'APR seems too high'),
  rateType: z.enum(['Fixed', 'Variable']),
});

const defaultScenario = () => ({ termMonths: 36, deposit: 0, aprPct: 7.2, rateType: 'Fixed' });

export default function P21QuoteBuilder() {
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const { data: prospects = [], isLoading: prospectsLoading } = useProspects();
  const createQuote = useCreateQuote();
  const { symbol } = useCurrency();

  const [prospectId, setProspectId] = useState('');
  const [scenarios, setScenarios] = useState([defaultScenario()]);
  const [scenarioErrors, setScenarioErrors] = useState([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      customerName: '',
      assetType: 'Commercial vehicle',
      assetValue: 0,
    },
  });

  const watchedAssetValue = watch('assetValue') || 0;

  const updateScenario = (index, updates) => {
    setScenarios(s => s.map((sc, i) => i === index ? { ...sc, ...updates } : sc));
    setScenarioErrors(e => e.map((err, i) => i === index ? {} : err));
  };

  const addScenario = () => {
    if (scenarios.length >= 4) { showToast('Maximum 4 scenarios per quote', 'warning'); return; }
    setScenarios(s => [...s, defaultScenario()]);
    setScenarioErrors(e => [...e, {}]);
  };

  const removeScenario = (index) => {
    if (scenarios.length === 1) return;
    setScenarios(s => s.filter((_, i) => i !== index));
    setScenarioErrors(e => e.filter((_, i) => i !== index));
  };

  const handleProspectChange = (e) => {
    const pid = e.target.value;
    setProspectId(pid);
    const p = prospects.find(p => p.id === pid);
    if (p) setValue('customerName', p.company_name, { shouldValidate: true });
  };

  const validateScenarios = () => {
    const errs = scenarios.map(sc => {
      const result = scenarioSchema.safeParse(sc);
      if (result.success) return {};
      return Object.fromEntries(result.error.errors.map(e => [e.path[0], e.message]));
    });
    setScenarioErrors(errs);
    return errs.every(e => Object.keys(e).length === 0);
  };

  const handleSave = (status) => (headerData) => {
    if (!validateScenarios()) {
      showToast('Please fix the errors in your scenarios', 'warning');
      return;
    }

    const scenariosData = scenarios.map(sc => {
      const monthly = calcMonthly(headerData.assetValue, sc.deposit, sc.termMonths, sc.aprPct);
      return {
        termMonths: sc.termMonths,
        deposit: sc.deposit,
        aprPct: sc.aprPct,
        rateType: sc.rateType,
        monthlyPayment: monthly,
        totalPayable: monthly * sc.termMonths,
      };
    });

    createQuote.mutate({
      customer_name: headerData.customerName,
      prospect_id: prospectId || null,
      asset_type: headerData.assetType,
      asset_value: headerData.assetValue,
      scenarios: scenariosData,
      status,
    }, {
      onSuccess: (quote) => {
        showToast(status === 'sent' ? 'Quote sent!' : 'Quote saved as draft', 'success');
        navigate(`/quotes/${quote.id}`);
      },
      onError: (err) => showToast(err.message || 'Failed to save quote', 'error'),
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Quote Builder</div>
          <div className="page-sub">Build a multi-scenario quote for your customer</div>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/quotes')}><X size={14} /> Cancel</button>
      </div>

      <div className="two-col">
        {/* Left: customer & asset */}
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Customer</div>
            <FormField label="Customer name" required error={errors.customerName?.message}>
              <input {...register('customerName')} className="form-input" placeholder="TechWorks Solutions Ltd" />
            </FormField>
            <FormField label="Link to prospect" hint="Optional — links this quote to your CRM">
              {prospectsLoading ? (
                <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--tx4)' }}>
                  <LoadingSpinner size={12} /> Loading prospects…
                </div>
              ) : prospects.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--tx3)', padding: '8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  No prospects in CRM yet —{' '}
                  <Link to="/crm/new" style={{ color: 'var(--coral)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    Add one <ExternalLink size={11} />
                  </Link>
                </div>
              ) : (
                <select className="form-input" value={prospectId} onChange={handleProspectChange}>
                  <option value="">— None —</option>
                  {prospects.map(p => (
                    <option key={p.id} value={p.id}>{p.company_name}</option>
                  ))}
                </select>
              )}
            </FormField>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Asset</div>
            <FormField label="Asset type" required error={errors.assetType?.message}>
              <select {...register('assetType')} className="form-input">
                {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label={`Asset value (${symbol})`} required error={errors.assetValue?.message}>
              <input
                {...register('assetValue', { valueAsNumber: true })}
                className="form-input"
                type="number" min="0" step="1000"
                placeholder="42000"
              />
            </FormField>
          </div>
        </div>

        {/* Right: scenarios */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Scenarios ({scenarios.length}/4)</div>
            <button className="btn btn-secondary" style={{ fontSize: 11 }} onClick={addScenario}><Plus size={12} /> Add scenario</button>
          </div>

          {scenarios.map((sc, i) => {
            const monthly = watchedAssetValue > 0 ? calcMonthly(watchedAssetValue, sc.deposit, sc.termMonths, sc.aprPct) : 0;
            const total = monthly * sc.termMonths;
            const scErr = scenarioErrors[i] || {};
            return (
              <div key={i} className="card" style={{ marginBottom: 12, border: i === 0 ? '2px solid var(--coral)' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    Scenario {i + 1}
                    {i === 0 && <span style={{ fontSize: 10, background: 'var(--coral)', color: '#fff', borderRadius: 99, padding: '2px 8px', marginLeft: 8 }}>Recommended</span>}
                  </div>
                  {i > 0 && (
                    <button className="btn btn-ghost" style={{ fontSize: 11, color: 'var(--red)', padding: '2px 8px' }} onClick={() => removeScenario(i)}><X size={12} /></button>
                  )}
                </div>

                <div className="two-col-equal" style={{ gap: '0 12px' }}>
                  <FormField label="Term">
                    <select className="form-input" value={sc.termMonths} onChange={e => updateScenario(i, { termMonths: Number(e.target.value) })}>
                      {TERMS.map(t => <option key={t} value={t}>{t} months</option>)}
                    </select>
                  </FormField>
                  <FormField label={`Deposit (${symbol})`} error={scErr.deposit}>
                    <input
                      className="form-input"
                      type="number" min="0" step="100"
                      value={sc.deposit}
                      onChange={e => updateScenario(i, { deposit: Number(e.target.value) })}
                    />
                  </FormField>
                </div>

                <div className="two-col-equal" style={{ gap: '0 12px' }}>
                  <FormField label="APR (%)" error={scErr.aprPct}>
                    <input
                      className="form-input"
                      type="number" min="0.1" max="50" step="0.01"
                      value={sc.aprPct}
                      onChange={e => updateScenario(i, { aprPct: Number(e.target.value) })}
                    />
                  </FormField>
                  <FormField label="Rate type">
                    <select className="form-input" value={sc.rateType} onChange={e => updateScenario(i, { rateType: e.target.value })}>
                      <option>Fixed</option>
                      <option>Variable</option>
                    </select>
                  </FormField>
                </div>

                <div style={{ background: 'var(--bg)', borderRadius: 'var(--rl)', padding: '12px 14px', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--tx4)', marginBottom: 2 }}>Monthly</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--coral)' }}>{symbol}{monthly.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--tx4)', marginBottom: 2 }}>Total payable</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{symbol}{total.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--tx4)', marginBottom: 2 }}>Over</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{sc.termMonths} months</div>
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              className="btn btn-ghost"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleSubmit(handleSave('draft'))}
              disabled={createQuote.isPending}
            >
              <Save size={13} /> Save draft
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 2, justifyContent: 'center' }}
              onClick={handleSubmit(handleSave('sent'))}
              disabled={createQuote.isPending}
            >
              {createQuote.isPending ? <LoadingSpinner /> : <><Send size={13} /> Save &amp; send quote</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
