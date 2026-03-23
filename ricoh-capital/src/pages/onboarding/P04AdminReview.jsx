import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAdminQueue, useAdminApplication,
  useApproveApplication, useRejectApplication,
  useRequestInfo, useSaveAdminNote,
} from '../../hooks/useAdminQueue';
import { useAppContext } from '../../context/AppContext';
import { LoadingSpinner } from '../../components/shared/FormField';

function RiskBadge({ score }) {
  if (!score) return null;
  const band = score >= 80 ? { label: 'Low', color: 'var(--green)' }
    : score >= 60 ? { label: 'Medium', color: 'var(--amber)' }
    : { label: 'High', color: 'var(--red)' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 80, background: 'var(--bg)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: band.color, width: `${score}%` }} />
      </div>
      <span style={{ fontSize: 11, color: band.color, fontWeight: 600 }}>{band.label} ({score})</span>
    </div>
  );
}

function CheckList({ checks }) {
  if (!checks?.length) return <div style={{ fontSize: 12, color: 'var(--tx4)' }}>No checks yet</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {checks.map(c => (
        <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12 }}>
          <span>{c.status === 'passed' ? '✅' : c.status === 'failed' ? '❌' : c.status === 'running' ? '🔄' : '⬜'}</span>
          <span style={{ flex: 1 }}>{c.display_name}</span>
          {c.result_detail && <span style={{ fontSize: 10, color: c.status === 'failed' ? 'var(--red)' : 'var(--tx4)', maxWidth: 200, textAlign: 'right' }}>{c.result_detail}</span>}
        </div>
      ))}
    </div>
  );
}

function ApplicationDetail({ appId, onClose }) {
  const { showToast } = useAppContext();
  const { data: app, isLoading } = useAdminApplication(appId);
  const approve = useApproveApplication();
  const reject = useRejectApplication();
  const requestInfo = useRequestInfo();
  const saveNote = useSaveAdminNote();

  const [note, setNote] = useState('');
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState('');

  if (isLoading) return <div className="page-loading"><LoadingSpinner size={24} /></div>;
  if (!app) return null;

  const handleApprove = async () => {
    try {
      await approve.mutateAsync({ applicationId: appId, note });
      showToast('Application approved', 'success');
      onClose();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleReject = async () => {
    if (!reason.trim()) { showToast('Please enter a rejection reason', 'warning'); return; }
    try {
      await reject.mutateAsync({ applicationId: appId, reason });
      showToast('Application rejected', 'success');
      onClose();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleRequestInfo = async () => {
    if (!note.trim()) { showToast('Please enter a message explaining what information is needed', 'warning'); return; }
    try {
      await requestInfo.mutateAsync({ applicationId: appId, message: note });
      showToast('Information requested — originator notified', 'success');
      onClose();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const profile = app.profiles;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{app.company_name || profile?.company_name}</div>
          <div style={{ fontSize: 12, color: 'var(--tx3)' }}>{profile?.email} · Reg. {app.company_reg_number}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`tag ${app.status === 'under_review' ? 'blue' : 'amber'}`}>{app.status.replace(/_/g, ' ')}</span>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Company details */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 12, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Company</div>
          {[
            ['Type', app.company_type],
            ['Address', app.registered_address],
            ['Products', app.product_lines?.join(', ')],
          ].map(([k, v]) => v && (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: 'var(--tx3)' }}>{k}</span>
              <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 12, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Primary Contact</div>
          {[
            ['Name', `${app.contact_first_name} ${app.contact_last_name}`],
            ['Email', app.contact_email],
            ['Title', app.contact_job_title],
          ].map(([k, v]) => v && (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: 'var(--tx3)' }}>{k}</span>
              <span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          {app.risk_score && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, alignItems: 'center' }}>
              <span style={{ color: 'var(--tx3)' }}>Risk score</span>
              <RiskBadge score={app.risk_score} />
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 12, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Uploaded Documents</div>
        {app.originator_documents?.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {app.originator_documents.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span>{d.status === 'uploaded' || d.status === 'verified' ? '✅' : '⬜'}</span>
                <span>{d.display_name}</span>
              </div>
            ))}
          </div>
        ) : <div style={{ fontSize: 12, color: 'var(--tx4)' }}>No documents uploaded</div>}
      </div>

      {/* Verification checks */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 12, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Verification Checks</div>
        <CheckList checks={app.verification_checks} />
      </div>

      {/* Admin note */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>Internal notes</div>
        <textarea
          className="form-input"
          rows={3}
          placeholder="Add notes visible only to Zoro Capital staff…"
          value={note || app.admin_notes || ''}
          onChange={e => setNote(e.target.value)}
          style={{ resize: 'vertical', fontSize: 12 }}
        />
        <button className="btn btn-ghost" style={{ fontSize: 11, marginTop: 8 }}
          onClick={() => saveNote.mutate({ applicationId: appId, note })}>
          {saveNote.isPending ? 'Saving…' : 'Save note'}
        </button>
      </div>

      {/* Actions */}
      {action === 'reject' ? (
        <div style={{ background: 'var(--red-l)', border: '1px solid var(--red-m)', borderRadius: 'var(--rl)', padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Reject application</div>
          <textarea
            className="form-input"
            rows={2}
            placeholder="Reason for rejection (sent to originator)"
            value={reason}
            onChange={e => setReason(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-danger" onClick={handleReject} disabled={reject.isPending}>
              {reject.isPending ? <LoadingSpinner /> : 'Confirm rejection'}
            </button>
            <button className="btn btn-ghost" onClick={() => setAction(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" style={{ color: 'var(--red)' }} onClick={() => setAction('reject')}>
            Reject
          </button>
          <button className="btn btn-secondary" onClick={handleRequestInfo} disabled={requestInfo.isPending}>
            {requestInfo.isPending ? <LoadingSpinner /> : 'Request info'}
          </button>
          <button className="btn btn-primary" onClick={handleApprove} disabled={approve.isPending}>
            {approve.isPending ? <LoadingSpinner /> : '✅ Approve'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function P04AdminReview() {
  const { data: queue = [], isLoading, error } = useAdminQueue();
  const [selectedAppId, setSelectedAppId] = useState(null);

  if (isLoading) return <div className="page-loading"><LoadingSpinner size={24} /></div>;

  if (selectedAppId) {
    return (
      <div className="page">
        <ApplicationDetail appId={selectedAppId} onClose={() => setSelectedAppId(null)} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Originator Review Queue</div>
          <div className="page-sub">{queue.length} application{queue.length !== 1 ? 's' : ''} awaiting review</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ background: 'var(--blue-l)', border: '1px solid var(--blue)', borderRadius: 'var(--rx)', padding: '4px 12px', fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>
            {queue.filter(a => a.status === 'under_review').length} to review
          </div>
          <div style={{ background: 'var(--amber-l)', border: '1px solid var(--amber)', borderRadius: 'var(--rx)', padding: '4px 12px', fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>
            {queue.filter(a => a.status === 'info_requested').length} info requested
          </div>
        </div>
      </div>

      {error && (
        <div className="page-error">Error loading queue: {error.message}</div>
      )}

      {queue.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <div className="empty-state-title">Queue is clear!</div>
            <div className="empty-state-sub">No applications are awaiting review at this time.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {queue.map((app) => {
            const profile = app.profiles;
            const uploadedDocs = app.originator_documents?.filter(d => d.status === 'uploaded' || d.status === 'verified').length || 0;
            const checks = app.verification_checks || [];
            const failedChecks = checks.filter(c => c.status === 'failed').length;
            const passedChecks = checks.filter(c => c.status === 'passed').length;
            const allChecksComplete = checks.length > 0 && checks.every(c => c.status === 'passed' || c.status === 'failed');

            return (
              <div key={app.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelectedAppId(app.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, background: 'var(--coral)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {profile?.avatar_initials || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{app.company_name || profile?.company_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--tx3)' }}>
                        {profile?.email} · {app.company_type} · Reg. {app.company_reg_number}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--tx4)', marginTop: 2 }}>
                        Submitted {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`tag ${app.status === 'under_review' ? 'blue' : 'amber'}`}>
                      {app.status.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--tx3)' }}>→</span>
                  </div>
                </div>

                {/* Mini stats */}
                <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--bdr)', fontSize: 11, color: 'var(--tx3)' }}>
                  <div><span style={{ fontWeight: 600, color: 'var(--tx1)' }}>{uploadedDocs}</span> docs uploaded</div>
                  <div><span style={{ fontWeight: 600, color: 'var(--green)' }}>{passedChecks}</span> checks passed</div>
                  {failedChecks > 0 && <div><span style={{ fontWeight: 600, color: 'var(--red)' }}>{failedChecks}</span> checks failed</div>}
                  {allChecksComplete && failedChecks === 0 && (
                    <div style={{ color: 'var(--green)', fontWeight: 600 }}>✅ Ready to approve</div>
                  )}
                  <div style={{ marginLeft: 'auto' }}>Products: {app.product_lines?.join(', ') || 'None selected'}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
