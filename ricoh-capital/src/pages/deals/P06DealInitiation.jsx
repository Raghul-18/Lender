import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDealStore } from '../../store/dealStore';
import { dealInitiationSchema } from '../../schemas';
import { FormField, LoadingSpinner } from '../../components/shared/FormField';
import { useAuth } from '../../auth/AuthContext';
import { Info } from 'lucide-react';

const PRODUCT_TYPES = [
  'Asset Finance — Hire Purchase',
  'Asset Finance — Finance Lease',
  'Asset Finance — Operating Lease',
  'Vehicle Finance — Hire Purchase',
  'Vehicle Finance — PCP',
  'Equipment Leasing',
  'Working Capital Loan',
  'Invoice Finance',
];

export default function P06DealInitiation() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { initiation, setInitiation } = useDealStore();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(dealInitiationSchema),
    defaultValues: initiation,
  });

  const onSubmit = (data) => {
    setInitiation(data);
    navigate('/deals/assets');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">New Deal</div>
          <div className="page-sub">Step 1 of 3 — Customer &amp; product details</div>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/portfolio')}>Cancel</button>
      </div>

      {/* Progress */}
      <div className="steps-row" style={{ marginBottom: 24 }}>
        {['Initiation', 'Asset details', 'Review & submit'].map((s, i) => (
          <div key={s} className={`step ${i === 0 ? 'active' : ''}`}>
            <div className="step-dot">{i + 1}</div>
            <div className="step-label">{s}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {profile?.company_name && (
          <div className="info-banner blue" style={{ marginBottom: 16 }}>
            <Info size={14} style={{ color: 'var(--blue)', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12 }}>
              Submitting as <strong>{profile.company_name}</strong>. The customer details below are for the <em>end-client</em> being financed.
            </div>
          </div>
        )}

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>End-client information</div>
          <FormField label="Client / company name" required error={errors.customerName?.message}
            hint="The company or individual being financed (your client, not your own company)">
            <input {...register('customerName')} className="form-input" placeholder="TechWorks Solutions Ltd" autoFocus />
          </FormField>
          <FormField label="Product type" required error={errors.productType?.message}>
            <select {...register('productType')} className="form-input">
              {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </FormField>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>Deal reference</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Your reference" required error={errors.originatorReference?.message}
              hint="Your internal ID for this deal">
              <input {...register('originatorReference')} className="form-input" placeholder="AC-2025-0042" />
            </FormField>
            <FormField label="Preferred start date" error={errors.preferredStartDate?.message}>
              <input {...register('preferredStartDate')} className="form-input" type="date" />
            </FormField>
          </div>
          <FormField label="Additional notes" error={errors.notes?.message}>
            <textarea {...register('notes')} className="form-input" rows={3} placeholder="Any background or context about this deal…" style={{ resize: 'vertical' }} />
          </FormField>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            Continue → Asset details
          </button>
        </div>
      </form>
    </div>
  );
}
