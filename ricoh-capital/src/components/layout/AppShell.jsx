import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import LeftNav from './LeftNav';
import Toast from '../shared/Toast';
import Modal from '../shared/Modal';
import Confetti from '../shared/Confetti';

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('nav-collapsed') === 'true'; }
    catch { return false; }
  });

  useEffect(() => {
    localStorage.setItem('nav-collapsed', collapsed);
  }, [collapsed]);

  return (
    <div className="app-shell">
      <Confetti />
      <LeftNav collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopNav />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>
      <Modal />
      <Toast />
    </div>
  );
}
