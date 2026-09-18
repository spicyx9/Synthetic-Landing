const { createHash } = require('node:crypto');
// Best-effort per-instance limit; a shared firewall limit can be added in Vercel.
const requests = new Map();
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const reply = (status, error, fields) => res.status(status).json({ ok: false, error, ...(fields ? {fields} : {}) });
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return reply(405, 'method'); }
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) return reply(415, 'content_type');
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return reply(400, 'invalid'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return reply(400, 'invalid');
  if (JSON.stringify(body).length > 14000) return reply(413, 'size');
  if (body.website) return reply(400, 'invalid');
  const limits = { firstName:100, lastName:100, email:254, company:160, subject:200, message:5000 };
  const data = {}, fields = {};
  for (const [key, max] of Object.entries(limits)) {
    const value = body[key];
    data[key] = typeof value === 'string' ? value.trim() : '';
    if ((key !== 'company' && !data[key]) || (value != null && typeof value !== 'string') || data[key].length > max || (key !== 'message' && /[\r\n\x00-\x1f]/.test(data[key]))) fields[key] = 'invalid';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) fields.email = 'invalid';
  if (Object.keys(fields).length) return reply(400, 'validation', fields);
  const now = Date.now();
  for (const [key, value] of requests) if (value.until <= now) requests.delete(key);
  const ip = String(req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown');
  const key = createHash('sha256').update(ip).digest('hex');
  const count = requests.get(key) || { n: 0, until: now + 600000 };
  if (count.n >= 5 || requests.size >= 10000) { res.setHeader('Retry-After','600'); return reply(429,'rate_limit'); }
  count.n++; requests.set(key, count);
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_FROM_EMAIL) return reply(503, 'configuration');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method:'POST', headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},
      signal: AbortSignal.timeout(10000),
      body:JSON.stringify({from:process.env.CONTACT_FROM_EMAIL,to:['contact@syntheticswarm.ai'],reply_to:data.email,subject:`Contact: ${data.subject}`,text:`Name: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nCompany: ${data.company}\n\n${data.message}`})
    });
    const result = await response.json();
    if (!response.ok || !result.id) return reply(502,'delivery');
    return res.status(200).json({ok:true});
  } catch { return reply(502,'delivery'); }
};
