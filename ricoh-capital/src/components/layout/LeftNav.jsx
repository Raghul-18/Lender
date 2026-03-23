import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Plus, FileText, Users, Bell,
  ClipboardList, FolderOpen, ShieldCheck,
  ClipboardCheck, ScrollText, Home,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { ZoroWordmark } from '../shared/ZoroLogo';

const ICON_SIZE = 15;

const ORIGINATOR_NAV = [
  {
    section: 'Overview',
    items: [
      { to: '/portfolio',  icon: <LayoutDashboard size={ICON_SIZE} />, label: 'Portfolio' },
    ],
  },
  {
    section: 'Deals',
    items: [
      { to: '/deals/new',  icon: <Plus size={ICON_SIZE} />,      label: 'New deal' },
      { to: '/quotes',     icon: <FileText size={ICON_SIZE} />,   label: 'Quotes' },
    ],
  },
  {
    section: 'CRM',
    items: [
      { to: '/crm', icon: <Users size={ICON_SIZE} />, label: 'Prospects' },
    ],
  },
  {
    section: 'Account',
    items: [
      { to: '/notifications', icon: <Bell size={ICON_SIZE} />, label: 'Notifications' },
    ],
  },
];

const ADMIN_NAV = [
  {
    section: 'Admin',
    items: [
      { to: '/admin/review', icon: <ClipboardCheck size={ICON_SIZE} />, label: 'Review queue' },
      { to: '/admin/audit',  icon: <ScrollText size={ICON_SIZE} />,     label: 'Audit log' },
    ],
  },
];

const CUSTOMER_NAV = [
  {
    section: 'My account',
    items: [
      { to: '/portal/dashboard',     icon: <Home size={ICON_SIZE} />, label: 'Dashboard' },
      { to: '/portal/notifications', icon: <Bell size={ICON_SIZE} />, label: 'Notifications' },
    ],
  },
];

const ONBOARDING_NAV = [
  {
    section: 'Onboarding',
    items: [
      { to: '/onboarding/registration', icon: <ClipboardList size={ICON_SIZE} />, label: 'Registration' },
      { to: '/onboarding/documents',    icon: <FolderOpen size={ICON_SIZE} />,    label: 'Documents' },
      { to: '/onboarding/verification', icon: <ShieldCheck size={ICON_SIZE} />,   label: 'Verification' },
    ],
  },
];

export default function LeftNav() {
  const { profile, isAdmin, isOriginator, isCustomer, isApproved } = useAuth();

  let navSections;
  if (isAdmin)                        navSections = ADMIN_NAV;
  else if (isCustomer)                navSections = CUSTOMER_NAV;
  else if (isOriginator && isApproved) navSections = ORIGINATOR_NAV;
  else if (isOriginator)              navSections = ONBOARDING_NAV;
  else                                navSections = [];

  return (
    <div className="leftnav">
      {/* Brand */}
      <div className="leftnav-logo">
        <ZoroWordmark size={28} gap={9} fontSize={14} />
      </div>

      {/* Nav sections */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {navSections.map(section => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={['/portfolio', '/crm', '/portal/dashboard'].includes(item.to)}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* User info */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--bdr)', fontSize: 11 }}>
        <div style={{ fontWeight: 600, color: 'var(--tx2)', marginBottom: 2 }}>{profile?.full_name || '—'}</div>
        <div style={{ color: 'var(--tx4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {profile?.company_name || profile?.email}
        </div>
      </div>
    </div>
  );
}
