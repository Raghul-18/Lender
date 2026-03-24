import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../lib/supabase';

const RATES_KEY = ['product_rates'];

export function useProductRates(activeOnly = false) {
  return useQuery({
    queryKey: [...RATES_KEY, activeOnly],
    queryFn: async () => {
      let q = db.productRates().select('*').order('product_type').order('min_term_months');
      if (activeOnly) q = q.eq('is_active', true);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Find the best matching rate for a product type + term.
 * Returns the apr_pct, or null if no rate is configured.
 */
export function findRate(rates, productType, termMonths) {
  if (!rates?.length) return null;
  const match = rates.find(
    r => r.product_type === productType &&
         r.is_active !== false &&
         termMonths >= r.min_term_months &&
         termMonths <= r.max_term_months
  );
  return match ? match.apr_pct : null;
}

// ── Admin mutations ───────────────────────────────────────────

export function useCreateRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rate) => {
      const { data, error } = await db.productRates().insert(rate).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: RATES_KEY }),
  });
}

export function useUpdateRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { error } = await db.productRates().update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: RATES_KEY }),
  });
}

export function useDeleteRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await db.productRates().delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: RATES_KEY }),
  });
}
