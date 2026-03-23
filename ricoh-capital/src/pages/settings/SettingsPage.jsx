import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Building2, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { db, supabase } from '../../lib/supabase';
import { useAppContext } from '../../context/AppContext';
import { FormField, LoadingSpinner } from '../../components/shared/FormField';

const profileSchema = z.object({
  full_name:    z.string().min(2, 'Name must be at least 2 characters'),
  company_name: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

function ProfileSection({ profile, onSave }) {
  const [saving, setSaving] = useState(false);
  const { showToast } = useAppContext();

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name:    profile?.full_name || '',
      company_name: profile?.company_name || '',
    },
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const { error } = await db.profiles()
        .update({ full_name: data.full_name, company_name: data.company_name || null })
        .eq('id', profile.id);
      if (error) throw error;
      await onSave();
      showToast('Profile updated', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <User size={15} style={{ color: 'var(--coral)' }} />
        <div style={{ fontWeight: 600, fontSize: 14 }}>Profile information</div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Full name" required error={errors.full_name?.message}>
          <input {...register('full_name')} className="form-input" placeholder="Jane Smith" />
        </FormField>
        <FormField label="Email address" hint="Email cannot be changed here — contact support">
          <input className="form-input" value={profile?.email || ''} disabled style={{ opacity: .6, cursor: 'not-allowed' }} />
        </FormField>
        {(profile?.role === 'originator' || profile?.role === 'admin') && (
          <FormField label="Company name" error={errors.company_name?.message}>
            <input {...register('company_name')} className="form-input" placeholder="Acme Finance Ltd" />
          </FormField>
        )}
        <div style={{ marginTop: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={saving || !isDirty}>
            {saving ? <><LoadingSpinner size={12} /> Saving…</> : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordSection() {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const { showToast } = useAppContext();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Re-authenticate first by signing in with current password
      const { data: { user } } = await supabase.auth.getUser();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      });
      if (signInErr) throw new Error('Current password is incorrect');

      // Then update the password
      const { error } = await supabase.auth.updateUser({ password: data.newPassword });
      if (error) throw error;

      reset();
      setDone(true);
      showToast('Password updated successfully', 'success');
      setTimeout(() => setDone(false), 4000);
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Lock size={15} style={{ color: 'var(--coral)' }} />
        <div style={{ fontWeight: 600, fontSize: 14 }}>Change password</div>
      </div>
      {done ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: 'var(--green)' }}>
          <CheckCircle size={18} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Password updated successfully</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Current password" required error={errors.currentPassword?.message}>
            <input {...register('currentPassword')} className="form-input" type="password" autoComplete="current-password" />
          </FormField>
          <FormField label="New password" required error={errors.newPassword?.message} hint="Minimum 8 characters">
            <input {...register('newPassword')} className="form-input" type="password" autoComplete="new-password" />
          </FormField>
          <FormField label="Confirm new password" required error={errors.confirmPassword?.message}>
            <input {...register('confirmPassword')} className="form-input" type="password" autoComplete="new-password" />
          </FormField>
          <div style={{ marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><LoadingSpinner size={12} /> Updating…</> : 'Update password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function AccountInfoSection({ profile }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Building2 size={15} style={{ color: 'var(--coral)' }} />
        <div style={{ fontWeight: 600, fontSize: 14 }}>Account details</div>
      </div>
      {[
        ['Role', profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : '—'],
        ['Member since', profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
        ['Account status', profile?.role === 'originator'
          ? { 'approved': 'Active', 'pending': 'Pending onboarding', 'under_review': 'Under review', 'rejected': 'Rejected' }[profile.onboarding_status] || 'Active'
          : 'Active'],
        ['Avatar initials', profile?.avatar_initials || '—'],
      ].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingBottom: 8, borderBottom: '1px solid var(--bdr)', marginBottom: 8 }}>
          <span style={{ color: 'var(--tx3)' }}>{k}</span>
          <span style={{ fontWeight: 500 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-sub">Manage your profile and account preferences</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
        <div>
          <ProfileSection profile={profile} onSave={refreshProfile} />
          <PasswordSection />
        </div>
        <div>
          <AccountInfoSection profile={profile} />
        </div>
      </div>
    </div>
  );
}
