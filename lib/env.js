const requiredServer = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PAYSTACK_SECRET_KEY',
  'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY'
];

export function getMissingServerEnv() {
  return requiredServer.filter((key) => !String(process.env[key] || '').trim());
}

export function assertServerEnv() {
  const missing = getMissingServerEnv();
  if (missing.length) throw new Error(`Missing required server environment variables: ${missing.join(', ')}`);

  const site = String(process.env.NEXT_PUBLIC_SITE_URL || '').trim();
  if (process.env.NODE_ENV === 'production') {
    if (!site || !/^https:\/\//i.test(site)) {
      throw new Error('NEXT_PUBLIC_SITE_URL must be an HTTPS production URL.');
    }
    if (/localhost|127\.0\.0\.1/i.test(site)) {
      throw new Error('NEXT_PUBLIC_SITE_URL cannot point to localhost in production.');
    }
    if (process.env.PAYSTACK_MODE === 'live' && !String(process.env.PAYSTACK_SECRET_KEY).startsWith('sk_live_')) {
      throw new Error('PAYSTACK_MODE=live requires a live Paystack secret key.');
    }
    if (process.env.PAYSTACK_MODE === 'live' && !String(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY).startsWith('pk_live_')) {
      throw new Error('PAYSTACK_MODE=live requires a live Paystack public key.');
    }
  }
  return true;
}
