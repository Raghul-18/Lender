import { useQuery } from '@tanstack/react-query';
import { db } from '../lib/supabase';
import { keys } from '../lib/queryClient';
import { useAuth } from '../auth/AuthContext';

export function useContracts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: keys.contracts(user?.id),
    queryFn: async () => {
      const { data, error } = await db.contracts()
        .select('*')
        .eq('originator_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

// Alias for the customer portal — filters by customer_id
export function useCustomerContracts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-contracts', user?.id],
    queryFn: async () => {
      const { data, error } = await db.contracts()
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useContract(contractId) {
  return useQuery({
    queryKey: keys.contract(contractId),
    queryFn: async () => {
      const { data, error } = await db.contracts()
        .select('*')
        .eq('id', contractId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!contractId,
  });
}

export function useContractByRef(refNumber) {
  return useQuery({
    queryKey: ['contract-ref', refNumber],
    queryFn: async () => {
      const { data, error } = await db.contracts()
        .select('*')
        .eq('reference_number', refNumber)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!refNumber,
  });
}

export function usePaymentSchedule(contractId) {
  return useQuery({
    queryKey: keys.paymentSchedule(contractId),
    queryFn: async () => {
      const { data, error } = await db.paymentSchedule()
        .select('*')
        .eq('contract_id', contractId)
        .order('payment_number');
      if (error) throw error;
      return data || [];
    },
    enabled: !!contractId,
  });
}

// Portfolio KPIs derived from contracts
export function usePortfolioStats(contracts = []) {
  const active = contracts.filter(c => c.status === 'active').length;
  const overdue = contracts.filter(c => c.status === 'overdue').length;
  const maturing = contracts.filter(c => c.status === 'maturing').length;
  const totalValue = contracts.reduce((s, c) => s + (c.asset_value || 0), 0);
  return { active, overdue, maturing, totalValue };
}

// Export contracts as CSV
export function exportContractsCSV(contracts, fields) {
  const headers = fields.join(',');
  const rows = contracts.map(c =>
    fields.map(f => {
      const val = c[f] ?? '';
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
    }).join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portfolio_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
