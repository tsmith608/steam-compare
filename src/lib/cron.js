// Vercel Cron sends "Authorization: Bearer $CRON_SECRET".
export function cronAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}
