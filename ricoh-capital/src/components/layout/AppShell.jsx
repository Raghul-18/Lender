import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { KeyRound, X } from 'lucide-react';
import TopNav from './TopNav';
import LeftNav from './LeftNav';
import Toast from '../shared/Toast';
import Modal from '../shared/Modal';
import Confetti from '../shared/Confetti';
import { useAuth } from '../../auth/AuthContext';

export default function AppShell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('nav-collapsed') === 'true'; }
    catch { return false; }
  });
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const needsPasswordSetup = !bannerDismissed && user?.user_metadata?.needs_password_setup === true;

  useEffect(() => {
    localStorage.setItem('nav-collapsed', collapsed);
  }, [collapsed]);

  return (
    <div className="app-shell">
      <Confetti />
      <LeftNav collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopNav />

        {/* First-login password setup banner */}
        {needsPasswordSetup && (
          <div style={{
            background: 'var(--amber-l)', borderBottom: '1px solid #fde68a',
            padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <KeyRound size={14} color="var(--amber)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--tx2)', flex: 1 }}>
              <strong>Set your password</strong> — you logged in with an invite link. Visit settings to set a permanent password for your account.
            </span>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 11, padding: '4px 12px', flexShrink: 0 }}
              onClick={() => navigate('/settings')}
            >
              Set password
            </button>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx4)', padding: 4, display: 'flex' }}
              onClick={() => setBannerDismissed(true)}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>
      <Modal />
      <Toast />
    </div>
  );
}
