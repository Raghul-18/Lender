import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';

function signaturesTable() {
  return supabase.from('contract_signatures');
}

export function useContractSignature(contractId) {
  return useQuery({
    queryKey: ['contract-signature', contractId],
    queryFn: async () => {
      const { data, error } = await signaturesTable()
        .select('*')
        .eq('contract_id', contractId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!contractId,
  });
}

export function useSignContract(contractId) {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ fullNameTyped }) => {
      const { data, error } = await signaturesTable()
        .insert({
          contract_id: contractId,
          signed_by: user.id,
          full_name_typed: fullNameTyped,
          user_agent: navigator.userAgent,
          agreement_text:
            'I have read, understood, and agree to be bound by the terms of this finance agreement.',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contract-signature', contractId] });
      qc.invalidateQueries({ queryKey: ['contract', contractId] });
    },
  });
}
