// Petite connexion a Upstash Redis (base "KV" de Vercel) via son API REST
const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
async function redis(...cmd) {
  if (!URL || !TOKEN) throw new Error('Base non configuree (Vercel > Storage > Upstash Redis)');
  const r = await fetch(URL, { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; }
}
const okPseudo = p => typeof p === 'string' && /^[A-Za-z0-9_-]{3,16}$/.test(p);
const okHash = h => typeof h === 'string' && /^[0-9a-f]{32,64}$/.test(h);
function send(res, code, obj) { res.setHeader('Cache-Control', 'no-store'); res.status(code).json(obj); }
module.exports = { redis, body, okPseudo, okHash, send };
