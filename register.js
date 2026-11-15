const { redis, body, okPseudo, okHash, send } = require('./_db');
module.exports = async (req, res) => {
  try {
    const { pseudo, hash } = body(req);
    if (!okPseudo(pseudo) || !okHash(hash)) return send(res, 400, { ok: false, error: 'Pseudo ou mot de passe invalide.' });
    const r = await redis('SET', 'user:' + pseudo.toLowerCase(), JSON.stringify({ pseudo, hash }), 'NX');
    if (r !== 'OK') return send(res, 409, { ok: false, error: 'Ce pseudo est deja pris.' });
    send(res, 200, { ok: true });
  } catch (e) { send(res, 500, { ok: false, error: e.message }); }
};
