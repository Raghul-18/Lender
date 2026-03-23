import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './auth/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute, PublicRoute } from './auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';

// Auth pages (no shell)
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Onboarding
import P01Registration from './pages/onboarding/P01Registration';
import P02DocumentUpload from './pages/onboarding/P02DocumentUpload';
import P03Verification from './pages/onboarding/P03Verification';
import P05Welcome from './pages/onboarding/P05Welcome';

// Admin
import P04AdminReview from './pages/admin/P04AdminReview';

// Portfolio
import P10PortfolioDashboard from './pages/portfolio/P10PortfolioDashboard';
import P12AssetDetail from './pages/portfolio/P12AssetDetail';

// Deals
import P06DealInitiation from './pages/deals/P06DealInitiation';
import P07AssetDetails from './pages/deals/P07AssetDetails';
import P08ReviewSubmit from './pages/deals/P08ReviewSubmit';
import P09Confirmation from './pages/deals/P09Confirmation';

// CRM
import P18ProspectList from './pages/crm/P18ProspectList';
import P19ProspectProfile from './pages/crm/P19ProspectProfile';
import ProspectForm from './pages/crm/ProspectForm';

// Quotes
import P21QuoteBuilder from './pages/quotes/P21QuoteBuilder';
import P22QuoteOutput from './pages/quotes/P22QuoteOutput';
import QuotesListPage from './pages/quotes/QuotesListPage';

// Notifications (shared)
import P17Notifications from './pages/notifications/P17Notifications';

// Customer portal
import P15CustomerDashboard from './pages/selfservice/P15CustomerDashboard';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Routes>
              {/* Public auth routes */}
              <Route path="/login" element={
                <PublicRoute><LoginPage /></PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute><SignupPage /></PublicRoute>
              } />

              {/* ── Authenticated shell ── */}
              <Route element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }>
                {/* ── Onboarding (originators not yet approved) ── */}
                <Route path="/onboarding/registration" element={
                  <ProtectedRoute roles={['originator']}>
                    <P01Registration />
                  </ProtectedRoute>
                } />
                <Route path="/onboarding/documents" element={
                  <ProtectedRoute roles={['originator']}>
                    <P02DocumentUpload />
                  </ProtectedRoute>
                } />
                <Route path="/onboarding/verification" element={
                  <ProtectedRoute roles={['originator']}>
                    <P03Verification />
                  </ProtectedRoute>
                } />
                <Route path="/onboarding/welcome" element={
                  <ProtectedRoute roles={['originator']}>
                    <P05Welcome />
                  </ProtectedRoute>
                } />

                {/* ── Admin routes ── */}
                <Route path="/admin/review" element={
                  <ProtectedRoute roles={['admin']}>
                    <P04AdminReview />
                  </ProtectedRoute>
                } />
                <Route path="/admin/audit" element={
                  <ProtectedRoute roles={['admin']}>
                    <div className="page">
                      <div className="page-header"><div className="page-title">Audit Log</div></div>
                      <div className="info-banner blue">
                        <Info size={14} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                        <div style={{ fontSize: 12 }}>Full audit log coming soon.</div>
                      </div>
                    </div>
                  </ProtectedRoute>
                } />

                {/* ── Originator main app (requires approved) ── */}
                <Route path="/portfolio" element={
                  <ProtectedRoute roles={['originator', 'admin']} requireApproved>
                    <P10PortfolioDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/portfolio/:id" element={
                  <ProtectedRoute roles={['originator', 'admin']} requireApproved>
                    <P12AssetDetail />
                  </ProtectedRoute>
                } />

                <Route path="/deals/new" element={
                  <ProtectedRoute roles={['originator']} requireApproved>
                    <P06DealInitiation />
                  </ProtectedRoute>
                } />
                <Route path="/deals/assets" element={
                  <ProtectedRoute roles={['originator']} requireApproved>
                    <P07AssetDetails />
                  </ProtectedRoute>
                } />
                <Route path="/deals/review" element={
                  <ProtectedRoute roles={['originator']} requireApproved>
                    <P08ReviewSubmit />
                  </ProtectedRoute>
                } />
                <Route path="/deals/confirmation" element={
                  <ProtectedRoute roles={['originator']} requireApproved>
                    <P09Confirmation />
                  </ProtectedRoute>
                } />

                <Route path="/crm" element={
                  <ProtectedRoute roles={['originator']} requireApproved>
                    <P18ProspectList />
                  </ProtectedRoute>
                } />
                <Route path="/crm/new" element={
                  <ProtectedRoute roles={['originator']} requireApproved>
                    <ProspectForm />
                  </ProtectedRoute>
                } />
                <Route path="/crm/:id" element={
                  <ProtectedRoute roles={['originator']} requireApproved>
                    <P19ProspectProfile />
                  </ProtectedRoute>
                } />
                <Route path="/crm/:id/edit" element={
                  <ProtectedRoute roles={['originator']} requireApproved>
                    <ProspectForm />
                  </ProtectedRoute>
                } />

                <Route path="/quotes" element={
                  <ProtectedRoute roles={['originator']} requireApproved>
                    <QuotesListPage />
                  </ProtectedRoute>
                } />
                <Route path="/quotes/new" element={
                  <ProtectedRoute roles={['originator']} requireApproved>
                    <P21QuoteBuilder />
                  </ProtectedRoute>
                } />
                <Route path="/quotes/:id" element={
                  <ProtectedRoute roles={['originator']} requireApproved>
                    <P22QuoteOutput />
                  </ProtectedRoute>
                } />

                <Route path="/notifications" element={
                  <ProtectedRoute roles={['originator', 'admin']}>
                    <P17Notifications />
                  </ProtectedRoute>
                } />

                {/* ── Customer portal ── */}
                <Route path="/portal/dashboard" element={
                  <ProtectedRoute roles={['customer']}>
                    <P15CustomerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/portal/contracts/:id" element={
                  <ProtectedRoute roles={['customer']}>
                    <P12AssetDetail />
                  </ProtectedRoute>
                } />
                <Route path="/portal/notifications" element={
                  <ProtectedRoute roles={['customer']}>
                    <P17Notifications />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
