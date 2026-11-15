const { redis, send } = require('./_db');
module.exports = async (req, res) => {
  try {
    const r = await redis('ZRANGE', 'board:sanspiece', 0, 9, 'REV', 'WITHSCORES');
    const list = [];
    for (let i = 0; i < (r || []).length; i += 2) list.push({ pseudo: r[i], best_ms: Number(r[i + 1]) });
    send(res, 200, { ok: true, list });
  } catch (e) { send(res, 500, { ok: false, error: e.message }); }
};
