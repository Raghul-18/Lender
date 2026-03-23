import { useNavigate } from 'react-router-dom';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../../hooks/useNotifications';
import { LoadingSpinner } from '../../components/shared/FormField';

const TYPE_META = {
  payment_reminder: { icon: '💳', color: 'var(--amber)' },
  deal_update:      { icon: '📋', color: 'var(--blue)' },
  quote_update:     { icon: '📄', color: 'var(--coral)' },
  contract_update:  { icon: '📝', color: 'var(--green)' },
  onboarding_update: { icon: '🎉', color: 'var(--coral)' },
  system:           { icon: '🔔', color: 'var(--tx3)' },
};

export default function P17Notifications() {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unread = notifications.filter(n => !n.read).length;

  if (isLoading) return <div className="page-loading"><LoadingSpinner size={24} /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Notifications</div>
          <div className="page-sub">{unread} unread · {notifications.length} total</div>
        </div>
        {unread > 0 && (
          <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => markAllRead.mutate()}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <div className="empty-state-title">All caught up!</div>
            <div className="empty-state-sub">You have no notifications right now. We'll notify you of payment reminders, deal updates, and more.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(n => {
            const meta = TYPE_META[n.type] || TYPE_META.system;
            return (
              <div
                key={n.id}
                className="card"
                style={{
                  padding: '14px 16px',
                  opacity: n.read ? .65 : 1,
                  borderLeft: n.read ? undefined : `3px solid ${meta.color}`,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (!n.read) markRead.mutate(n.id);
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {meta.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: n.read ? 400 : 600, fontSize: 13 }}>{n.title}</div>
                    {n.body && <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 3, lineHeight: 1.5 }}>{n.body}</div>}
                    <div style={{ fontSize: 10, color: 'var(--tx4)', marginTop: 4 }}>
                      {new Date(n.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {!n.read && (
                    <div style={{ width: 8, height: 8, background: meta.color, borderRadius: '50%', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
