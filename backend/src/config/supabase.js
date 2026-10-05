import https from 'node:https';
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseClient = null;
let supabaseAdmin = null;
let isSupabaseSchemaReady = false;

// Custom IPv4 fetch to prevent Windows IPv6 connection timeouts to Cloudflare / Supabase
const ipv4Fetch = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const headers = {};
      if (options.headers) {
        if (typeof options.headers.forEach === 'function') {
          options.headers.forEach((v, k) => { headers[k] = v; });
        } else {
          Object.assign(headers, options.headers);
        }
      }
      const req = https.request({
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers,
        family: 4,
        timeout: 10000
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage || '',
            headers: new Headers(res.headers),
            json: async () => JSON.parse(body || '{}'),
            text: async () => body
          });
        });
      });
      req.on('timeout', () => {
        req.destroy(new Error('Supabase request timed out'));
      });
      req.on('error', reject);
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  });
};

const isValidSupabaseUrl = (url) => {
  return url && url.startsWith('https://') && !url.includes('placeholder-project');
};

const anonKey = env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (isValidSupabaseUrl(env.SUPABASE_URL) && anonKey && !anonKey.includes('placeholder')) {
  try {
    supabaseClient = createClient(env.SUPABASE_URL, anonKey, {
      global: { fetch: ipv4Fetch },
      auth: { persistSession: false, autoRefreshToken: false }
    });
    console.log('[Supabase] Public client initialized successfully for:', env.SUPABASE_URL);
  } catch (error) {
    console.warn('[Supabase] Failed to initialize public client:', error.message);
  }
}

if (isValidSupabaseUrl(env.SUPABASE_URL) && serviceKey && !serviceKey.includes('placeholder')) {
  try {
    supabaseAdmin = createClient(env.SUPABASE_URL, serviceKey, {
      global: { fetch: ipv4Fetch },
      auth: { persistSession: false, autoRefreshToken: false }
    });
    console.log('[Supabase] Admin service-role client initialized successfully');
    
    // Check if tables are ready in Supabase schema
    supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)
      .then(({ error }) => {
        if (!error) {
          isSupabaseSchemaReady = true;
          console.log('[Supabase] Database schema tables verified online in Supabase cloud');
        } else if (error.code === 'PGRST205') {
          isSupabaseSchemaReady = false;
          console.log('[Supabase] Note: Supabase project is connected, but schema tables are not created yet (run schema.sql in Supabase SQL editor). Local persistent storage active.');
        } else {
          console.warn('[Supabase] Schema check warning:', error.message);
        }
      })
      .catch((e) => {
        console.warn('[Supabase] Schema check network warning:', e.message);
      });
  } catch (error) {
    console.warn('[Supabase] Failed to initialize admin client:', error.message);
  }
}

export const getIsSupabaseSchemaReady = () => isSupabaseSchemaReady;

export const getSupabaseStatus = () => ({
  configured: Boolean(supabaseAdmin),
  schemaReady: isSupabaseSchemaReady,
  url: env.SUPABASE_URL
});

export { supabaseClient, supabaseAdmin, isSupabaseSchemaReady };

