/* Ecran de chargement maison + diagnostic (affiche la vraie raison si ca bloque) */
(function () {
  'use strict';
  var errors = [];
  window.addEventListener('error', function (e) {
    var m = e && (e.message || (e.error && e.error.message)); if (!m || m === 'Script error.') return;
    errors.push(m + (e.filename ? ' (' + e.filename.split('/').pop() + ':' + e.lineno + ')' : ''));
  }, true);
  window.addEventListener('unhandledrejection', function (e) { var m = (e.reason && e.reason.message) || String(e.reason); if (!/object Event/.test(m)) errors.push('Promesse : ' + m); });
  var origErr = console.error;
  console.error = function () { try { var t = Array.prototype.join.call(arguments, ' '); if (/abort|failed|error/i.test(t) && !/FileUtil|OnlineSettings|onlinesettings|Debug\.bindings/i.test(t) && t.length < 400) errors.push(t); } catch (x) {} return origErr.apply(console, arguments); };

  var css =
    '#ssl{position:fixed;inset:0;z-index:2147483000;background:#2a2620 repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0 14px,transparent 14px 28px);display:flex;align-items:center;justify-content:center;font-family:"Trebuchet MS",Verdana,Arial,sans-serif;color:#1d1b16;transition:opacity .4s}' +
    '#ssl .c{width:min(460px,90vw);background:#fff8e4;border:3px solid #1d1b16;border-radius:7px;box-shadow:8px 8px 0 #000;padding:22px 22px 18px;transform:rotate(-1deg)}' +
    '#ssl .t{font-family:Impact,"Arial Black",sans-serif;font-size:34px;letter-spacing:1px;text-transform:uppercase;line-height:1}' +
    '#ssl .tag{display:inline-block;background:#1d1b16;color:#fff8e4;font-size:11px;font-weight:bold;letter-spacing:2px;padding:3px 7px;transform:rotate(2deg);margin-bottom:10px;text-transform:uppercase}' +
    '#ssl .bar{margin-top:16px;height:26px;border:3px solid #1d1b16;border-radius:5px;background:#fff;overflow:hidden}' +
    '#ssl .fill{height:100%;width:0;background:#ffd23f repeating-linear-gradient(-45deg,rgba(0,0,0,.12) 0 10px,transparent 10px 20px);background-size:28px 28px;border-right:3px solid #1d1b16;transition:width .2s;animation:sslm 1s linear infinite}' +
    '@keyframes sslm{from{background-position:0 0}to{background-position:28px 0}}' +
    '#ssl .row{display:flex;justify-content:space-between;margin-top:8px;font-weight:bold}' +
    '#ssl .pc{font-family:Consolas,monospace;font-size:18px}' +
    '#ssl .err{display:none;margin-top:12px;background:#ffe1e5;border:2px solid #c81e3a;border-radius:4px;padding:8px;font-size:12px;color:#7a0f22;max-height:120px;overflow:auto;white-space:pre-wrap;word-break:break-word}' +
    '#ssl .btns{display:none;gap:8px;margin-top:12px}' +
    '#ssl button{border:3px solid #1d1b16;border-radius:6px;box-shadow:3px 3px 0 #1d1b16;font-family:Impact,"Arial Black",sans-serif;font-size:16px;letter-spacing:1px;padding:7px 12px;cursor:pointer;background:#ffd23f;color:#1d1b16}' +
    '#ssl button:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #1d1b16}' +
    '#ssl .tip{margin-top:12px;font-size:12px;color:#6b6454}' +
    '#loader{visibility:hidden !important}';
  var box, fill, pc, stage, errEl, btns, t0 = Date.now(), lastProg = -1, lastChange = Date.now(), done = false;
  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    box = document.createElement('div'); box.id = 'ssl';
    box.innerHTML = '<div class="c"><div class="tag">sans piece</div><div class="t">Chargement</div>' +
      '<div class="bar"><div class="fill"></div></div><div class="row"><span class="st">Preparation...</span><span class="pc">0%</span></div>' +
      '<div class="err"></div><div class="btns"><button class="rep">Reparer</button><button class="rel" style="background:#fff">Recharger</button><button class="cop" style="background:#fff">Copier l\'erreur</button></div>' +
      '<div class="tip">Le 1er lancement est le plus long, les suivants sont bien plus rapides.</div></div>';
    document.body.appendChild(box);
    fill = box.querySelector('.fill'); pc = box.querySelector('.pc'); stage = box.querySelector('.st');
    errEl = box.querySelector('.err'); btns = box.querySelector('.btns');
    box.querySelector('.rel').onclick = function () { location.reload(); };
    box.querySelector('.cop').onclick = function () { try { navigator.clipboard.writeText(report()); } catch (e) {} };
    box.querySelector('.rep').onclick = function () {
      stage.textContent = 'Nettoyage du cache...';
      try { var r = indexedDB.deleteDatabase('ss-embed-cache'); r.onsuccess = r.onerror = r.onblocked = function () { location.reload(); }; } catch (e) { location.reload(); }
      setTimeout(function () { location.reload(); }, 2500);
    };
    ['keydown', 'mousedown', 'click'].forEach(function (t) { box.addEventListener(t, function (e) { e.stopPropagation(); }); });
    tick();
  }
  function report() {
    var L = window.__ssLoad;
    return 'Etape: ' + stage.textContent + '\nProgression: ' + pc.textContent + '\nTemps: ' + Math.round((Date.now() - t0) / 1000) + 's' +
      '\nNavigateur: ' + navigator.userAgent + '\nURL: ' + location.protocol + '\n' +
      (L ? 'Cache: ' + L.cached + ' fichiers\n' : 'embed-loader.js non charge !\n') + errors.concat(L ? L.errors : []).join('\n');
  }
  function gameStarted() {
    var g = document.getElementById('game-container');
    return g && g.style.display === 'block' && window.unityGame;
  }
  function tick() {
    if (done) return;
    var L = window.__ssLoad, p = 0;
    if (L && L.total) p = L.loaded() / L.total;
    var pct = Math.min(100, Math.floor(p * 92 + (gameStarted() ? 8 : 0)));
    fill.style.width = pct + '%'; pc.textContent = pct + '%';
    if (!L) stage.textContent = 'Fichier embed-loader.js manquant ?';
    else if (p < 1) stage.textContent = (L.cached ? 'Lecture du cache...' : 'Telechargement du jeu...');
    else stage.textContent = 'Demarrage du jeu...';
    var waitingLogin = false;
    try { waitingLogin = !!window.__ssWaitLogin && !localStorage.getItem('ssmod_session'); } catch (e) {}
    if (waitingLogin) { stage.textContent = p >= 1 ? 'Connecte-toi pour jouer' : stage.textContent + ' (connecte-toi)'; lastChange = Date.now(); }
    if (pct !== lastProg) { lastProg = pct; lastChange = Date.now(); }
    var all = errors.concat(L ? L.errors : []);
    var stuck = Date.now() - lastChange > 15000 || (L && L.errors.length);
    if (stuck) {
      btns.style.display = 'flex'; errEl.style.display = 'block';
      errEl.textContent = 'Le chargement est bloque.' + (all.length ? '\n' + all.slice(-6).join('\n') : '\nAucune erreur visible : clique sur Reparer.');
    }
    if (gameStarted()) {
      done = true; fill.style.width = '100%'; pc.textContent = '100%';
      setTimeout(function () { box.style.opacity = '0'; setTimeout(function () { box.remove(); }, 450); }, 250);
      return;
    }
    setTimeout(tick, 200);
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
