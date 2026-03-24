import { useState } from 'react';
import { PenLine, CheckCircle, ShieldCheck, X } from 'lucide-react';
import { useSignContract, useContractSignature } from '../../hooks/useContractSign';
import { useAppContext } from '../../context/AppContext';
import { LoadingSpinner } from './FormField';

export function SignContractButton({ contract }) {
  const [open, setOpen] = useState(false);
  const { data: signature, isLoading } = useContractSignature(contract?.id);

  if (isLoading) return null;
  if (!contract || contract.status === 'cancelled' || contract.status === 'completed') return null;

  if (signature) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, color: 'var(--green)',
        background: 'var(--green-l)', border: '1px solid var(--green-m)',
        borderRadius: 8, padding: '6px 12px',
      }}>
        <CheckCircle size={14} />
        Signed {new Date(signature.signed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
    );
  }

  return (
    <>
      <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => setOpen(true)}>
        <PenLine size={13} /> Sign contract
      </button>
      {open && (
        <ContractSignModal
          contract={contract}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ContractSignModal({ contract, onClose }) {
  const [typedName, setTypedName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);
  const sign = useSignContract(contract.id);
  const { showToast } = useAppContext();

  const canSign = typedName.trim().length >= 2 && agreed;

  const handleSign = async () => {
    try {
      await sign.mutateAsync({ fullNameTyped: typedName.trim() });
      setDone(true);
    } catch (err) {
      showToast(err.message || 'Failed to record signature. Please try again.', 'error');
    }
  };

  return (
    <div
      className="modal-bg show"
      onClick={e => { if (e.target === e.currentTarget && !done) onClose(); }}
    >
      <div className="modal" style={{ maxWidth: 480, width: '100%' }}>
        {done ? (
          <>
            <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--green-l)', border: '2px solid var(--green-m)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <CheckCircle size={32} style={{ color: 'var(--green)' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Contract signed</div>
              <div style={{ fontSize: 13, color: 'var(--tx3)', lineHeight: 1.6, marginBottom: 24 }}>
                Your electronic signature has been recorded on{' '}
                <strong>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                This agreement is now binding.
              </div>
              <button className="btn btn-primary" onClick={onClose}>Close</button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PenLine size={15} style={{ color: 'var(--coral)' }} />
              Sign finance agreement
              <button
                onClick={onClose}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx4)', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Contract summary */}
            <div style={{ background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--tx4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Agreement details</div>
              {[
                ['Reference', contract.reference_number],
                ['Asset', contract.asset_description],
                ['Term', `${contract.term_months} months`],
                ['Start date', contract.start_date ? new Date(contract.start_date).toLocaleDateString('en-GB') : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--tx3)' }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Agreement text */}
            <div style={{
              fontSize: 12, color: 'var(--tx2)', lineHeight: 1.7,
              background: 'var(--bg)', border: '1px solid var(--bdr)',
              borderRadius: 'var(--rl)', padding: '12px 14px', marginBottom: 16,
            }}>
              I confirm that I have read and understood all terms and conditions of this finance agreement
              referenced above. I agree to make all payments as scheduled, and I understand that this
              electronic signature is legally binding and equivalent to a handwritten signature.
            </div>

            {/* Typed name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx2)', display: 'block', marginBottom: 6 }}>
                Type your full legal name to sign *
              </label>
              <input
                className="form-input"
                placeholder="e.g. Jane Smith"
                value={typedName}
                onChange={e => setTypedName(e.target.value)}
                autoFocus
              />
              <div style={{ fontSize: 10, color: 'var(--tx4)', marginTop: 4 }}>
                Your name acts as your electronic signature.
              </div>
            </div>

            {/* Consent checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                style={{ marginTop: 3, width: 14, height: 14, accentColor: 'var(--coral)', flexShrink: 0 }}
              />
              <div style={{ fontSize: 12, color: 'var(--tx2)', lineHeight: 1.6 }}>
                I have read, understood, and agree to be bound by the terms of this finance agreement.
              </div>
            </label>

            {/* Security note */}
            <div className="info-banner" style={{ marginBottom: 20, borderColor: 'var(--bdr)' }}>
              <ShieldCheck size={13} style={{ color: 'var(--tx4)', flexShrink: 0 }} />
              <div style={{ fontSize: 11, color: 'var(--tx3)' }}>
                Your signature is timestamped and linked to your account. It is legally binding in
                accordance with the Electronic Communications Act 2000 (UK) and equivalent legislation.
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleSign}
                disabled={!canSign || sign.isPending}
                style={{ minWidth: 150 }}
              >
                {sign.isPending ? <LoadingSpinner size={13} /> : <PenLine size={13} />}
                Sign agreement
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
