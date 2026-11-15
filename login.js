const { redis, body, okPseudo, okHash, send } = require('./_db');
module.exports = async (req, res) => {
  try {
    const { pseudo, hash } = body(req);
    if (!okPseudo(pseudo) || !okHash(hash)) return send(res, 400, { ok: false, error: 'Pseudo ou mot de passe faux.' });
    const u = await redis('GET', 'user:' + pseudo.toLowerCase());
    if (!u || JSON.parse(u).hash !== hash) return send(res, 401, { ok: false, error: 'Pseudo ou mot de passe faux.' });
    send(res, 200, { ok: true, pseudo: JSON.parse(u).pseudo });
  } catch (e) { send(res, 500, { ok: false, error: e.message }); }
};
