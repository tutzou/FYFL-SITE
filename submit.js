const { redis, body, okPseudo, okHash, send } = require('./_db');
module.exports = async (req, res) => {
  try {
    const { pseudo, hash, ms } = body(req);
    const t = Math.round(Number(ms));
    if (!okPseudo(pseudo) || !okHash(hash) || !(t > 0 && t < 86400000)) return send(res, 400, { ok: false });
    const u = await redis('GET', 'user:' + pseudo.toLowerCase());
    if (!u || JSON.parse(u).hash !== hash) return send(res, 401, { ok: false });
    await redis('ZADD', 'board:sanspiece', 'GT', t, JSON.parse(u).pseudo);   // garde seulement le meilleur temps
    send(res, 200, { ok: true });
  } catch (e) { send(res, 500, { ok: false, error: e.message }); }
};
