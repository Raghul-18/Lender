import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const withTimeout = async <T>(label: string, promise: Promise<T>, timeoutMs = 12000): Promise<T> => {
  let timer: number | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

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
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await withTimeout(
      'auth.getUser',
      supabaseAdmin.auth.getUser(token),
      10000
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: callerProfile } = await withTimeout(
      'load caller profile',
      supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single(),
      10000
    );

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
    console.log('invite-customer:start', { email, contractId, dealId });
    const { data: inviteData, error: inviteError } = await withTimeout(
      'auth.admin.inviteUserByEmail',
      supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          data: { role: 'customer', full_name: customerName, needs_password_setup: true },
          redirectTo: `${Deno.env.get('SITE_URL') ?? 'http://localhost:5173'}/portal/dashboard`,
        }
      ),
      12000
    );

    if (inviteError) {
      // User already exists — look them up by email
      const { data: existing, error: lookupErr } = await withTimeout(
        'lookup existing profile by email',
        supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single(),
        10000
      );

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
    await withTimeout(
      'update profile role',
      supabaseAdmin
      .from('profiles')
      .update({ role: 'customer', full_name: customerName || undefined })
      .eq('id', customerId),
      10000
    );

    // Link contract → customer
    await withTimeout(
      'link contract customer_id',
      supabaseAdmin
      .from('contracts')
      .update({ customer_id: customerId })
      .eq('id', contractId),
      10000
    );

    // Update deal customer_email if deal ID supplied
    if (dealId) {
      await withTimeout(
        'update deal customer_email',
        supabaseAdmin
        .from('deals')
        .update({ customer_email: email })
        .eq('id', dealId),
        10000
      );
    }

    // Send welcome notification
    await withTimeout(
      'insert welcome notification',
      supabaseAdmin.from('notifications').insert({
        user_id: customerId,
        title: 'Welcome to Zoro Capital',
        body: `Your finance agreement is now active. Log in to view your payment schedule and account details.`,
        type: 'contract_update',
        related_id: contractId,
      }),
      10000
    );

    console.log('invite-customer:success', { email, customerId, isExisting });

    return new Response(
      JSON.stringify({ success: true, customerId, isExisting }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('invite-customer:error', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
