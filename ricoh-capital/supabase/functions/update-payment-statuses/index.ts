import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const sevenDaysStr = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);
  const ninetyDaysStr = new Date(today.getTime() + 90 * 86400000).toISOString().slice(0, 10);

  const results: Record<string, number> = {};

  // 1. Mark due_soon: upcoming payments within the next 7 days
  const { count: dueSoonCount } = await supabaseAdmin
    .from('payment_schedule')
    .update({ status: 'due_soon' })
    .eq('status', 'upcoming')
    .lte('due_date', sevenDaysStr)
    .gte('due_date', todayStr)
    .select('*', { count: 'exact', head: true });
  results.due_soon = dueSoonCount ?? 0;

  // 2. Mark overdue: unpaid payments where due_date < today
  const { count: overduePaymentCount } = await supabaseAdmin
    .from('payment_schedule')
    .update({ status: 'overdue' })
    .in('status', ['upcoming', 'due_soon'])
    .lt('due_date', todayStr)
    .select('*', { count: 'exact', head: true });
  results.overdue_payments = overduePaymentCount ?? 0;

  // 3. Mark contracts overdue if they have overdue payments
  const { data: overduePayments } = await supabaseAdmin
    .from('payment_schedule')
    .select('contract_id')
    .eq('status', 'overdue');

  const overdueContractIds = [...new Set((overduePayments ?? []).map((p: any) => p.contract_id))];
  if (overdueContractIds.length > 0) {
    const { count: overdueContractCount } = await supabaseAdmin
      .from('contracts')
      .update({ status: 'overdue' })
      .in('id', overdueContractIds)
      .in('status', ['active', 'maturing'])
      .select('*', { count: 'exact', head: true });
    results.overdue_contracts = overdueContractCount ?? 0;
  } else {
    results.overdue_contracts = 0;
  }

  // 4. Mark maturing: active contracts ending within 90 days
  const { count: maturingCount } = await supabaseAdmin
    .from('contracts')
    .update({ status: 'maturing' })
    .eq('status', 'active')
    .lte('end_date', ninetyDaysStr)
    .gte('end_date', todayStr)
    .select('*', { count: 'exact', head: true });
  results.maturing = maturingCount ?? 0;

  // 5. Mark completed: contracts past their end_date with no overdue payments
  const { count: completedCount } = await supabaseAdmin
    .from('contracts')
    .update({ status: 'completed' })
    .in('status', ['active', 'maturing'])
    .lt('end_date', todayStr)
    .select('*', { count: 'exact', head: true });
  results.completed = completedCount ?? 0;

  // 6. Expire quotes past their valid_until date
  const { count: expiredQuoteCount } = await supabaseAdmin
    .from('quotes')
    .update({ status: 'expired' })
    .in('status', ['draft', 'sent'])
    .lt('valid_until', todayStr)
    .select('*', { count: 'exact', head: true });
  results.expired_quotes = expiredQuoteCount ?? 0;

  // Log audit entry
  await supabaseAdmin.from('audit_logs').insert({
    entity_type: 'system',
    action: 'status_change',
    details: { ...results, run_at: todayStr },
  });

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
