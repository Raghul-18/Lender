import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Admin client with service role — can create/invite users
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify caller is an authenticated admin
    const authHeader = req.headers.get('Authorization') ?? '';
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden — admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, customerName, contractId, dealId } = await req.json() as {
      email: string;
      customerName: string;
      contractId: string;
      dealId?: string;
    };

    if (!email || !contractId) {
      return new Response(JSON.stringify({ error: 'email and contractId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let customerId: string;
    let isExisting = false;

    // Try to invite — falls back to existing user if already registered
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: { role: 'customer', full_name: customerName },
        redirectTo: `${Deno.env.get('SITE_URL') ?? 'http://localhost:5173'}/login`,
      }
    );

    if (inviteError) {
      // User already exists — look them up by email
      const { data: existing, error: lookupErr } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (lookupErr || !existing) {
        return new Response(JSON.stringify({ error: `Invite failed: ${inviteError.message}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      customerId = existing.id;
      isExisting = true;
    } else {
      customerId = inviteData.user.id;
    }

    // Ensure profile has correct role + name
    await supabaseAdmin
      .from('profiles')
      .update({ role: 'customer', full_name: customerName || undefined })
      .eq('id', customerId);

    // Link contract → customer
    await supabaseAdmin
      .from('contracts')
      .update({ customer_id: customerId })
      .eq('id', contractId);

    // Update deal customer_email if deal ID supplied
    if (dealId) {
      await supabaseAdmin
        .from('deals')
        .update({ customer_email: email })
        .eq('id', dealId);
    }

    // Send welcome notification
    await supabaseAdmin.from('notifications').insert({
      user_id: customerId,
      title: 'Welcome to Zoro Capital',
      body: `Your finance agreement is now active. Log in to view your payment schedule and account details.`,
      type: 'contract_update',
      related_id: contractId,
    });

    return new Response(
      JSON.stringify({ success: true, customerId, isExisting }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
