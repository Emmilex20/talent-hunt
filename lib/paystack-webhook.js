import crypto from "crypto";

export function verifyPaystackSignature(rawBody, signature, secret) {
  if (!rawBody || !signature || !secret) return false;
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  const supplied = Buffer.from(signature, "utf8");
  const calculated = Buffer.from(expected, "utf8");
  return supplied.length === calculated.length && crypto.timingSafeEqual(supplied, calculated);
}

export function parsePaystackEvent(rawBody) {
  try { return JSON.parse(rawBody); } catch { return null; }
}
