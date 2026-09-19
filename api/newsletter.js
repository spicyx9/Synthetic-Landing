const MAX_BODY_BYTES = 2048;
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const reply = (status, ok = false) => res.status(status).json({ok});
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return reply(405); }
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return reply(415);
  let body;
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!raw) return reply(400);
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES || Number(req.headers['content-length']) > MAX_BODY_BYTES) return reply(413);
    body = JSON.parse(raw);
  } catch { return reply(400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return reply(400);
  if (body.company_website != null && typeof body.company_website !== 'string') return reply(400);
  if (body.company_website?.trim()) return reply(200, true);
  if (typeof body.email !== 'string' || body.email.length > 320) return reply(400);
  const email = body.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@<>\x00-\x1f]+@[^\s@<>.]+(?:\.[^\s@<>.]+)+$/.test(email)) return reply(400);
  if (body.lang != null && !['fr', 'en'].includes(body.lang)) return reply(400);
  if (!process.env.RESEND_API_KEY) return reply(503);
  try {
    const request = (path, method, data) => fetch(`https://api.resend.com/contacts${path}`, {
      method, headers: {Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json'},
      body: JSON.stringify(data), signal: AbortSignal.timeout(10000)
    });
    // Existing subscribers and returning subscribers use the same outcome.
    let result = await request(`/${encodeURIComponent(email)}`, 'PATCH', {unsubscribed:false});
    if (result.status === 404) {
      result = await request('', 'POST', {email, unsubscribed:false});
      // A concurrent signup may have created the same contact meanwhile.
      if (result.status === 409 || result.status === 422) {
        result = await request(`/${encodeURIComponent(email)}`, 'PATCH', {unsubscribed:false});
      }
    }
    const data = await result.json();
    if (!result.ok || !data.id) return reply(502);
    return reply(200, true);
  } catch { return reply(502); }
};
