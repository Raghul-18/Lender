import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function P14Login() {
  const navigate = useNavigate();
  const { showToast } = useApp();

  return (
    <div className="page">
      <div style={{ maxWidth: 400, margin: '40px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, background: 'var(--coral)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 auto 14px' }}>RC</div>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.3px', marginBottom: 4 }}>Customer Portal</div>
          <div style={{ fontSize: 12, color: 'var(--tx3)' }}>Sign in to view your contracts and account</div>
        </div>

        <div className="card">
          <div className="form-field">
            <div className="field-label">Email address</div>
            <input className="form-input" type="email" placeholder="you@company.com" defaultValue="contact@techworks.co.uk" />
          </div>
          <div className="form-field">
            <div className="field-label">Password</div>
            <input className="form-input" type="password" defaultValue="password123" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
            onClick={() => { navigate('/dashboard'); showToast('Signed in as TechWorks Solutions'); }}>
            Sign in
          </button>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--tx3)' }}>Or sign in with </span>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--blue)', cursor: 'pointer' }} onClick={() => showToast('SSO provider selected')}>Oracle SSO</span>
          </div>
          <div style={{ borderTop: '1px solid var(--bdr)', marginTop: 12, paddingTop: 12, textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--blue)', cursor: 'pointer' }} onClick={() => showToast('Password reset email sent')}>Forgot your password?</span>
          </div>
        </div>
      </div>
    </div>
  );
}
