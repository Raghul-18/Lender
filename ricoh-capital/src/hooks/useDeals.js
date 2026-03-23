import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, logAudit } from '../lib/supabase';
import { keys } from '../lib/queryClient';
import { useAuth } from '../auth/AuthContext';
import { useDealStore } from '../store/dealStore';

export function useDeals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: keys.deals(user?.id),
    queryFn: async () => {
      const { data, error } = await db.deals()
        .select('*')
        .eq('originator_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useDeal(dealId) {
  return useQuery({
    queryKey: keys.deal(dealId),
    queryFn: async () => {
      const { data, error } = await db.deals()
        .select('*')
        .eq('id', dealId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!dealId,
  });
}

export function useSubmitDeal() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { initiation, assetDetails, getMonthlyPayment, getTotalPayable, setSubmitted, reset } = useDealStore();

  return useMutation({
    mutationFn: async () => {
      const monthly = getMonthlyPayment();
      const total = getTotalPayable();

      const payload = {
        originator_id: user.id,
        customer_name: initiation.customerName,
        product_type: initiation.productType,
        originator_reference: initiation.originatorReference,
        preferred_start_date: initiation.preferredStartDate || null,
        notes: initiation.notes,
        asset_type: assetDetails.assetType,
        asset_make: assetDetails.make,
        asset_model: assetDetails.model,
        asset_year: assetDetails.year,
        asset_value: assetDetails.assetValue,
        term_months: assetDetails.termMonths,
        deposit: assetDetails.deposit,
        balloon: assetDetails.balloon,
        rate_type: assetDetails.rateType,
        monthly_payment: monthly,
        apr: 7.2,
        total_payable: total,
        status: 'submitted',
      };

      const { data, error } = await db.deals()
        .insert(payload)
        .select()
        .single();
      if (error) throw error;

      // Notify the originator
      await db.notifications().insert({
        user_id: user.id,
        title: `Deal submitted — ${data.reference_number}`,
        body: `${initiation.customerName} · ${initiation.productType} · £${monthly.toLocaleString()}/mo`,
        type: 'deal_update',
        related_id: data.id,
      });

      await logAudit('deal', data.id, 'submitted', { reference: data.reference_number });
      setSubmitted(data.id, data.reference_number);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.deals(user?.id) });
    },
  });
}

export function useSaveDealDraft() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { initiation, assetDetails } = useDealStore();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await db.deals()
        .insert({
          originator_id: user.id,
          customer_name: initiation.customerName || 'Draft',
          product_type: initiation.productType,
          originator_reference: initiation.originatorReference,
          notes: initiation.notes,
          asset_value: assetDetails.assetValue,
          term_months: assetDetails.termMonths,
          status: 'draft',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.deals(user?.id) }),
  });
}
