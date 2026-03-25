import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠ Supabase credentials missing. Copy .env.example to .env and fill in your project URL and anon key from https://supabase.com/dashboard'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

// ── Typed helpers ──────────────────────────────────────────

export const db = {
  profiles: () => supabase.from('profiles'),
  applications: () => supabase.from('originator_applications'),
  documents: () => supabase.from('originator_documents'),
  checks: () => supabase.from('verification_checks'),
  deals: () => supabase.from('deals'),
  contracts: () => supabase.from('contracts'),
  paymentSchedule: () => supabase.from('payment_schedule'),
  prospects: () => supabase.from('prospects'),
  activities: () => supabase.from('prospect_activities'),
  quotes: () => supabase.from('quotes'),
  notifications: () => supabase.from('notifications'),
  auditLogs: () => supabase.from('audit_logs'),
  amendments: () => supabase.from('deal_amendments'),
};

// ── Storage helpers ────────────────────────────────────────

export const storage = {
  documents: supabase.storage.from('documents'),
  contracts: supabase.storage.from('contracts'),
};

// ── Utility: upload file with progress tracking ────────────

export async function uploadDocument(userId, documentType, file, onProgress) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${documentType}_${Date.now()}.${ext}`;

  // Supabase storage doesn't have native progress, so we simulate it
  onProgress?.(10);
  const { data, error } = await storage.documents.upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  onProgress?.(100);

  if (error) throw error;
  return { path: data.path, fullPath: data.fullPath };
}

// Returns a signed URL valid for 1 hour (private bucket)
export async function getDocumentSignedUrl(filePath) {
  if (!filePath) return null;
  const { data, error } = await storage.documents.createSignedUrl(filePath, 3600);
  if (error) { console.error('Signed URL error:', error); return null; }
  return data?.signedUrl || null;
}

// Batch-fetch signed URLs for multiple file paths
export async function getDocumentSignedUrls(filePaths) {
  if (!filePaths?.length) return {};
  const entries = await Promise.all(
    filePaths.map(async (p) => [p, await getDocumentSignedUrl(p)])
  );
  return Object.fromEntries(entries);
}

// Download a file from storage as a Blob (for zip packaging)
export async function downloadDocumentBlob(filePath) {
  const { data, error } = await storage.documents.download(filePath);
  if (error) throw error;
  return data; // Blob
}

// ── Utility: call admin Edge Functions ───────────────────────
export async function invokeAdminFunction(name, body = {}) {
  const url = `${supabaseUrl}/functions/v1/${name}`;
  const TIMEOUT_MS = 20000;

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token;
  };

  const callFunction = async (token) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      let responseBody;
      try { responseBody = await res.json(); } catch { responseBody = null; }

      if (!res.ok) {
        const detail = responseBody?.error || responseBody?.message || res.statusText;
        throw new Error(`${name} failed (HTTP ${res.status}): ${detail}`);
      }

      return responseBody;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(`${name} timed out after ${TIMEOUT_MS / 1000}s`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  };

  let token = await getAccessToken();
  console.log(`[invokeAdminFunction] ${name} — calling with token: ${token ? 'yes' : 'MISSING'}`);

  try {
    return await callFunction(token);
  } catch (firstErr) {
    console.warn(`[invokeAdminFunction] ${name} first attempt failed:`, firstErr.message);

    if (firstErr.message.includes('HTTP 401') || firstErr.message.toLowerCase().includes('invalid jwt')) {
      console.log(`[invokeAdminFunction] ${name} — refreshing session and retrying…`);
      const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
      if (!refreshErr && refreshed?.session?.access_token) {
        token = refreshed.session.access_token;
        return await callFunction(token);
      }
    }

    throw firstErr;
  }
}

// ── Utility: log audit event ──────────────────────────────

export async function logAudit(entityType, entityId, action, details = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  await db.auditLogs().insert({
    entity_type: entityType,
    entity_id: entityId,
    action,
    performed_by: user?.id,
    details,
  });
}
