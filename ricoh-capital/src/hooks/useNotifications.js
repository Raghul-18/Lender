import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, supabase } from '../lib/supabase';
import { keys } from '../lib/queryClient';
import { useAuth } from '../auth/AuthContext';
import { useEffect } from 'react';

export function useNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        qc.invalidateQueries({ queryKey: keys.notifications(user.id) });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  return useQuery({
    queryKey: keys.notifications(user?.id),
    queryFn: async () => {
      const { data, error } = await db.notifications()
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useMarkNotificationRead() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId) => {
      const { error } = await db.notifications()
        .update({ read: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.notifications(user?.id) }),
  });
}

// Alias used by notification pages
export const useMarkAllRead = () => useMarkAllNotificationsRead();

export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await db.notifications()
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.notifications(user?.id) }),
  });
}
