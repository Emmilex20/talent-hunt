const path = require('node:path');
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(path.resolve(__dirname, '..'));

const required = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PAYSTACK_SECRET_KEY',
  'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY'
];

const missing = required.filter((key) => !String(process.env[key] || '').trim());
if (missing.length) {
  console.error(`Environment check failed. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

const site = String(process.env.NEXT_PUBLIC_SITE_URL).trim();
if (!/^https?:\/\//i.test(site)) {
  console.error('Environment check failed. NEXT_PUBLIC_SITE_URL must be an absolute http(s) URL.');
  process.exit(1);
}

const mode = process.env.PAYSTACK_MODE || 'test';
if (!['test', 'live'].includes(mode)) {
  console.error('Environment check failed. PAYSTACK_MODE must be test or live.');
  process.exit(1);
}
if (mode === 'live') {
  if (!site.startsWith('https://') || /localhost|127\.0\.0\.1/i.test(site)) {
    console.error('Environment check failed. Live payments require an HTTPS non-localhost NEXT_PUBLIC_SITE_URL.');
    process.exit(1);
  }
  if (!process.env.PAYSTACK_SECRET_KEY.startsWith('sk_live_') || !process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.startsWith('pk_live_')) {
    console.error('Environment check failed. PAYSTACK_MODE=live requires live Paystack keys.');
    process.exit(1);
  }
}

console.log(`Environment check passed (${mode} payments).`);
