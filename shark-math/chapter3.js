/* Shark Math, Chapter 3: The Sunken City.
   Loaded right after chapter2.js. Like chapter 2 it registers new puzzle renderers on R and pushes
   nine new islands onto WORLDS, here with ch: 3. Everything lives inside one function so that no
   name here can clash with the main script or chapter 2. */
'use strict';
(() => {
/* ================================================================ styles (each section adds its own) */
const addCSS = (css, id) => document.head.append(h('style', { id: 'ch3-style-' + id }, css));
addCSS(`
.c3-row{display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap;max-width:100%}
.c3-col{display:flex;flex-direction:column;gap:10px;align-items:center}
.c3-pop{animation:c3pop .45s}
@keyframes c3pop{40%{transform:scale(1.25)}}
.c3-glow{animation:c3glow 1s ease-in-out infinite}
@keyframes c3glow{50%{box-shadow:0 0 0 6px rgba(255,207,90,.95)}}
.c3-status{font-size:20px;font-weight:600;text-align:center;min-height:27px}
.c3-goal{background:#fff7e0;border-radius:14px;padding:4px 16px;font-weight:600;text-align:center}
.c3-log{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:760px;font-size:16px;min-height:26px;align-items:center}
.c3-log span{background:#eef3f5;border-radius:10px;padding:2px 10px}
.c3-log span.new{background:#ffe7a0}
.c3-pal{display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap;background:var(--sand);border-radius:18px;padding:8px 14px}
.c3-pal .pl{font-weight:600;font-size:17px;color:#7a5a2a}
.c3-swatch{width:50px;height:50px;border-radius:50%;border:4px solid #fff;box-shadow:0 3px 0 rgba(0,0,0,.15);padding:0;font-size:24px;display:grid;place-items:center;transition:transform .12s}
.c3-swatch.on{transform:scale(1.18);box-shadow:0 0 0 4px var(--ink),0 3px 0 rgba(0,0,0,.15)}
.stage.c3-st>:first-child{margin-top:auto}.stage.c3-st>:last-child{margin-bottom:auto}
.c3-rules3{background:#fff;border:3px solid var(--line);border-radius:16px;padding:4px 14px;font-size:18px;max-width:780px;text-align:center}
/* the chapter 3 map: a sunken city at the bottom of a deep purple-teal sea */
.ocean.ch3{background:
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 300' preserveAspectRatio='xMidYMax slice'%3E%3Cg fill='%23ffffff' fill-opacity='.07'%3E%3Cpath d='M0 300V230h60v-60h20v-30h40v30h20v60h50v70z'/%3E%3Crect x='230' y='140' width='22' height='160'/%3E%3Crect x='290' y='170' width='22' height='130'/%3E%3Crect x='350' y='120' width='22' height='180'/%3E%3Cpath d='M215 140h175v-18H215z'/%3E%3Cpath d='M440 300V200a70 70 0 0 1 140 0v100h-30V205a40 40 0 0 0-80 0v95z'/%3E%3Cpath d='M630 300V150l50-50 50 50v150z'/%3E%3Crect x='770' y='190' width='20' height='110' transform='rotate(-14 780 245)'/%3E%3Cpath d='M820 300V210h120v90z M850 210v-40h60v40z'/%3E%3C/g%3E%3C/svg%3E") bottom/100% auto no-repeat,
  radial-gradient(circle at 25% 20%,rgba(180,255,240,.16),transparent 35%),
  radial-gradient(ellipse at 50% 0%,#2f8c9a,#1d4f78 45%,#2b1f5c 100%)!important}
.ocean.ch3 .isl-blob{background:radial-gradient(circle at 50% 35%,#fbf6ea,#d9cfb8 58%,#ab9d80);box-shadow:0 0 0 9px rgba(190,240,255,.22),0 8px 0 rgba(0,0,0,.12)}
.ocean.ch3 .island.next .isl-blob{animation:c3isl 1.6s ease-in-out infinite}
@keyframes c3isl{50%{box-shadow:0 0 0 14px rgba(160,255,230,.55),0 8px 0 rgba(0,0,0,.12)}}
`, 'base');

/* ================================================================ small helpers */
const popEl = el => { if (!el) return; el.classList.remove('c3-pop'); void el.offsetWidth; el.classList.add('c3-pop'); };
const shakeEl = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
const winLater = (api, ms = 500) => setTimeout(() => api.win(), ms);
const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + 's')}`;
const sumOf = a => a.reduce((x, y) => x + y, 0);
const listTxt = a => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' or ' + a[a.length - 1];
const glowOff = st => $$('.c3-glow', st).forEach(e => e.classList.remove('c3-glow'));
/* pixels of height left for the main picture of a puzzle (the rest is task, buttons and one status line) */
const room = () => Math.max(250, Math.min(480, innerHeight - 410));

/* ================================================================ 1. strategy games (take-away games) */
addCSS(`
.c3-duel{display:flex;gap:16px;align-items:stretch;justify-content:center;width:100%;max-width:900px}
.c3-side{width:128px;flex:none;border-radius:20px;padding:6px;display:flex;flex-direction:column;align-items:center;gap:2px;background:#eef6f8;border:3px solid transparent;transition:border-color .2s,background .2s}
.c3-side.mini{width:auto;flex-direction:row;gap:8px;padding:4px 14px}.c3-side.mini .face{height:44px;font-size:34px}.c3-side.mini .face svg{width:68px;height:44px}
.c3-side.turn{border-color:var(--sun);background:#fff7e0}
.c3-side .who{font-weight:700;font-size:19px}
.c3-side .face{height:62px;display:grid;place-items:center;font-size:46px;line-height:1}
.c3-side .face svg{width:96px;height:62px}
.c3-side .got{display:flex;flex-wrap:wrap;gap:3px;justify-content:center;min-height:22px;max-width:110px}
.c3-side .cnt{font-size:15px;color:var(--ink2);font-weight:600}
.c3-table{flex:1;min-width:0;min-height:150px;border-radius:26px;padding:16px 12px;display:flex;flex-direction:column;gap:14px;align-items:center;justify-content:center;
  background:radial-gradient(ellipse at 50% 30%,#d8f1f2,#9fd3d8 70%,#7fbfc6);box-shadow:inset 0 -8px 0 rgba(0,0,0,.08)}
.c3-prow{display:flex;gap:8px;align-items:center;justify-content:center;min-height:58px;padding:4px 14px;border-radius:999px;background:rgba(255,255,255,.35)}
.c3-prow .rl{font-size:14px;font-weight:700;color:var(--teal-d);width:46px;text-align:right}
.c3-pearl{width:60px;height:60px;border-radius:50%;padding:0;border:2px solid #d7cbe8;flex:none;transition:transform .15s,opacity .3s;
  background:radial-gradient(circle at 35% 30%,#fff,#f6f0fb 40%,#dcd0ec);box-shadow:0 3px 0 rgba(0,0,0,.14)}
.c3-pearl.pick{transform:translateY(-8px);box-shadow:0 0 0 4px var(--sun),0 6px 0 rgba(0,0,0,.14)}
.c3-pearl.gone{opacity:0;transform:scale(.3)}
.c3-socket{width:60px;height:60px;border-radius:50%;flex:none;background:radial-gradient(circle,rgba(20,54,90,.12),rgba(20,54,90,.04) 70%);box-shadow:inset 0 2px 4px rgba(0,0,0,.12)}
.c3-prow.line{gap:6px}
.c3-stone.pool{background:radial-gradient(circle at 50% 50%,#bfe9ff,#3a9fc2 70%,#1d6f93);cursor:not-allowed;font-size:26px!important}
.c3-pearl.sm{width:18px;height:18px;border-width:1px;box-shadow:none;display:inline-block}
.c3-banner{font-size:21px;font-weight:600;text-align:center;min-height:30px}
.c3-track{display:flex;gap:4px;align-items:flex-end;justify-content:center;flex-wrap:nowrap;padding:40px 4px 4px;position:relative}
.c3-stone{position:relative;border-radius:50% 50% 40% 40%;padding:0;border:0;font-weight:700;color:#5d6b74;
  background:radial-gradient(circle at 40% 30%,#f4f1ea,#c9c1b2 70%,#a69c88);box-shadow:0 4px 0 rgba(0,0,0,.18);display:grid;place-items:center;transition:transform .15s}
.c3-stone.reach{box-shadow:0 0 0 4px var(--sun),0 4px 0 rgba(0,0,0,.18);cursor:pointer}
.c3-stone.reach:hover{transform:translateY(-5px)}
.c3-stone.hov{box-shadow:0 0 0 4px rgba(255,255,255,.95),0 4px 0 rgba(0,0,0,.18)}
.c3-stone.goal{background:radial-gradient(circle at 40% 30%,#fff6c4,#f2c14e 70%,#c99a22);color:#6b4a00}
.c3-stone .star{position:absolute;top:-34px;left:50%;transform:translateX(-50%);font-size:26px;pointer-events:none}
.c3-tok{position:absolute;bottom:100%;left:50%;width:40px;height:40px;margin-left:-20px;margin-bottom:-4px;border-radius:50%;z-index:2;pointer-events:none;
  background:radial-gradient(circle at 35% 30%,#fff,#ffe9b0 45%,#f0b93a);box-shadow:0 0 0 3px #fff,0 0 18px 6px rgba(255,236,150,.9);animation:c3pop .45s}
`, 'nim');

const NIMC = new Map();
const nimMoves = (piles, max, ban) => { const out = []; piles.forEach((n, i) => { for (let t = 1; t <= Math.min(n, max); t++) if (!ban || !ban.includes(n - t)) out.push([i, t]); }); return out; };
const nimApply = (piles, [i, t]) => piles.map((n, j) => j === i ? n - t : n);
/* true when the player who has to move now loses (if the other player plays well) */
function nimLose(piles, max, mis, ban) {
  const key = max + (mis ? 'm' : 'n') + (ban ? 'b' + ban.join('.') : '') + ':' + piles.slice().sort((a, b) => a - b).join(',');
  if (NIMC.has(key)) return NIMC.get(key);
  const r = piles.every(n => !n) ? !mis : !nimMoves(piles, max, ban).some(m => nimLose(nimApply(piles, m), max, mis, ban));
  NIMC.set(key, r); return r;
}
const nimGood = (piles, max, mis, ban) => nimMoves(piles, max, ban).filter(m => nimLose(nimApply(piles, m), max, mis, ban));
/* the line game: take 1 pearl, or 2 pearls side by side, from anywhere in a line */
const runsOf = line => { const r = []; let k = 0; line.forEach(x => { if (x) k++; else { if (k) r.push(k); k = 0; } }); if (k) r.push(k); return r.sort((a, b) => a - b); };
const lineMoves = line => { const out = []; for (let s = 0; s < line.length; s++) for (let t = 1; t <= 2; t++) if (s + t <= line.length && line.slice(s, s + t).every(x => x)) out.push([s, t]); return out; };
const lineApply = (line, [s, t]) => line.map((x, i) => i >= s && i < s + t ? 0 : x);
const LINEC = new Map();
function lineLose(line) {
  const key = runsOf(line).join(','); if (LINEC.has(key)) return LINEC.get(key);
  const r = !lineMoves(line).some(m => lineLose(lineApply(line, m)));
  LINEC.set(key, r); return r;
}
const lineGood = line => lineMoves(line).filter(m => lineLose(lineApply(line, m)));

R.duel = (st, p, api) => {
  const look = p.look || 'pearls', race = look === 'race', isLine = look === 'line', mode = p.mode || 'play';
  const max = p.max || 2, mis = !!p.misere, T = p.T;
  const holes = p.holes || [], ban = race && holes.length ? holes.map(k => T - k) : null;
  const anyN = max >= 99;
  const maxTxt = anyN ? 'as many as you like from one row' : listTxt(range(max).map(i => String(i + 1)));
  /* one interface for the three games */
  const G = isLine
    ? { moves: lineMoves, apply: lineApply, lose: lineLose, good: lineGood, over: s => s.every(x => !x) }
    : { moves: s => nimMoves(s, max, ban), apply: nimApply, lose: s => nimLose(s, max, mis, ban), good: s => nimGood(s, max, mis, ban), over: s => s.every(n => !n) };
  const start = race ? [T - (p.from || 0)] : isLine ? range(p.n).map(() => 1) : p.piles.slice();
  let S = start.slice(), turn = 'you', busy = false, round = 1, showBest = false, got = { you: 0, finn: 0 }, hov = null, pick = [];
  const log = [];
  const sideEl = {}, gotEl = {}, cntEl = {};
  for (const who of ['you', 'finn']) {
    gotEl[who] = h('div', { class: 'got' }); cntEl[who] = h('div', { class: 'cnt' });
    sideEl[who] = h('div', { class: 'c3-side' }, h('div', { class: 'face', html: who === 'finn' ? sharkSVG() : '🧒' }), h('div', { class: 'who' }, who === 'finn' ? 'Finn' : 'You'), race ? null : gotEl[who], race ? null : cntEl[who]);
  }
  const banner = h('div', { class: 'c3-banner' });
  const table = h('div', { class: 'c3-table' });
  const logEl = h('div', { class: 'c3-log' });
  const takeBtn = h('button', { class: 'btn coral', onclick: () => takePick() }, '✋ Take');
  /* ---- race track */
  let stones = [], stars = new Set([T]);
  const pos = () => T - S[0];
  const stoneSize = race ? Math.max(36, Math.min(60, Math.floor(((st.clientWidth || 860) - 90) / (T + 1)) - 4)) : 0;
  function drawTrack() {
    const tr = h('div', { class: 'c3-track' });
    stones = range(T + 1).map(k => {
      const b = h('button', { class: 'c3-stone' + (k === T ? ' goal' : '') + (holes.includes(k) ? ' pool' : ''), style: { width: stoneSize + 'px', height: stoneSize + 'px', fontSize: (stoneSize > 48 ? 21 : 18) + 'px' }, 'aria-label': `Stone ${k}${k === T ? ', the crown' : holes.includes(k) ? ', a whirlpool' : ''}` }, k === T ? '👑' : holes.includes(k) ? '🌀' : String(k));
      b.onclick = () => stoneClick(k);
      b.onmouseenter = () => { hov = k; paintTrack(); };
      b.onmouseleave = () => { if (hov === k) { hov = null; paintTrack(); } };
      tr.append(b); return b;
    });
    table.innerHTML = ''; table.append(tr);
    paintTrack();
  }
  const canLand = (from, k) => k > from && k - from <= max && !holes.includes(k);
  function paintTrack() {
    const at = pos();
    stones.forEach((b, k) => {
      b.classList.toggle('reach', mode !== 'mark' && turn === 'you' && !busy && canLand(at, k));
      b.classList.toggle('hov', mode === 'mark' && hov != null && canLand(hov, k));
      $$('.star,.c3-tok', b).forEach(e => e.remove());
      if (mode === 'mark' && stars.has(k)) b.append(h('span', { class: 'star' }, '⭐'));
      if (mode !== 'mark' && k === at) b.append(h('span', { class: 'c3-tok' }));
    });
  }
  /* ---- pearl rows */
  function drawRows() {
    table.innerHTML = '';
    S.forEach((n, i) => {
      const row = h('div', { class: 'c3-prow' }, S.length > 1 ? h('span', { class: 'rl' }, `row ${i + 1}`) : null);
      for (let j = 0; j < n; j++) {
        const b = h('button', { class: 'c3-pearl', 'aria-label': `Pearl ${j + 1} in row ${i + 1}. Click to take it and the pearls after it.`, 'data-i': i, 'data-j': j });
        b.onclick = () => pearlClick(i, j);
        b.onmouseenter = () => { if (turn !== 'you' || busy || api.done()) return; if (n - j <= max) $$(`.c3-pearl[data-i="${i}"]`, table).forEach(x => x.classList.toggle('pick', +x.dataset.j >= j)); };
        b.onmouseleave = () => $$('.c3-pearl.pick', table).forEach(x => x.classList.remove('pick'));
        row.append(b);
      }
      if (!n) row.append(h('span', { class: 'note' }, 'empty'));
      table.append(row);
    });
  }
  /* ---- one long line (pearls keep their places, taken ones leave an empty shell) */
  function drawLine() {
    table.innerHTML = '';
    const row = h('div', { class: 'c3-prow line' });
    S.forEach((x, j) => {
      if (!x) { row.append(h('span', { class: 'c3-socket', 'data-j': j })); return; }
      const b = h('button', { class: 'c3-pearl' + (pick.includes(j) ? ' pick' : ''), 'aria-label': `Pearl ${j + 1}`, 'data-j': j });
      b.onclick = () => lineClick(j); row.append(b);
    });
    table.append(row);
    takeBtn.hidden = !pick.length || turn !== 'you' || busy;
    takeBtn.textContent = pick.length === 2 ? '✋ Take these 2' : '✋ Take this 1';
  }
  function draw() {
    if (race) drawTrack(); else if (isLine) drawLine(); else drawRows();
    for (const who of ['you', 'finn']) {
      sideEl[who].classList.toggle('turn', turn === who);
      if (!race) { gotEl[who].innerHTML = ''; for (let k = 0; k < got[who]; k++) gotEl[who].append(h('span', { class: 'c3-pearl sm' })); cntEl[who].textContent = plural(got[who], 'pearl'); }
    }
    banner.textContent = busy && turn === 'finn' ? 'Finn is thinking…' : turn !== 'you' ? '' : race ? `Your turn: jump the pearl ${maxTxt} stones.` : isLine ? 'Your turn: pick 1 pearl, or 2 pearls side by side.' : `Your turn: take ${maxTxt}${anyN ? '' : ' pearls'}.`;
    logEl.innerHTML = log.length ? (round > 1 ? `<span>Round ${round}</span>` : '') + log.map((t, k) => `<span class="${k === log.length - 1 ? 'new' : ''}">${t}</span>`).join('') : `<span>${round > 1 ? `Round ${round}. ` : ''}You go first.</span>`;
    if (showBest && turn === 'you' && !busy) markBest();
  }
  function markBest() {
    glowOff(st);
    const g = G.good(S)[0]; if (!g) return;
    if (race) { const s = stones[pos() + g[1]]; if (s) s.classList.add('c3-glow'); }
    else if (isLine) { for (let j = g[0]; j < g[0] + g[1]; j++) { const b = $(`.c3-pearl[data-j="${j}"]`, table); if (b) b.classList.add('c3-glow'); } }
    else { const b = $(`.c3-pearl[data-i="${g[0]}"][data-j="${S[g[0]] - g[1]}"]`, table); if (b) b.classList.add('c3-glow'); }
  }
  const moveTxt = (who, [i, t]) => { const W = who === 'you' ? 'You' : 'Finn'; return race ? `${W}: ${pos()} ➜ ${pos() + t}` : isLine ? `${W} took ${t}` : `${W} took ${t}${S.length > 1 ? ` from row ${i + 1}` : ''}`; };
  async function doMove(m, who) {
    busy = true; glowOff(st); pick = [];
    log.push(moveTxt(who, m));
    if (race) { const to = pos() + m[1]; S = G.apply(S, m); snd.drop(); paintTrack(); popEl(stones[to]); await sleep(520); }
    else {
      const [i, t] = m;
      const els = isLine ? range(t).map(k => $(`.c3-pearl[data-j="${i + k}"]`, table)) : $$(`.c3-pearl[data-i="${i}"]`, table).filter(b => +b.dataset.j >= S[i] - t);
      if (isLine) { takeBtn.hidden = true; els.forEach(b => b && b.classList.add('pick')); await sleep(250); }
      els.forEach(b => b && b.classList.add('gone'));
      snd.pop(); await sleep(420);
      S = G.apply(S, m); got[who] += t;
    }
    busy = false;
  }
  async function youMove(m) {
    if (api.done() || busy || turn !== 'you') return;
    if (mode === 'move') return judgeMove(m);
    await doMove(m, 'you'); if (api.done()) return;
    if (G.over(S)) return endGame(mis ? 'finn' : 'you');
    turn = 'finn'; busy = true; draw(); await sleep(750); busy = false; if (api.done()) return;
    const good = G.good(S), all = G.moves(S);
    const fm = good.length ? good[Math.floor(Math.random() * good.length)] : all[Math.floor(Math.random() * all.length)];
    await doMove(fm, 'finn'); if (api.done()) return;
    if (G.over(S)) return endGame(mis ? 'you' : 'finn');
    turn = 'you'; draw();
  }
  function endGame(winner) {
    turn = 'none'; draw();
    if (winner === 'you') {
      banner.textContent = race ? 'You reached the crown first!' : mis ? 'Finn had to take the last pearl. You win!' : 'You took the last pearl. You win!';
      snd.good(); popEl(sideEl.you); winLater(api, 700); return;
    }
    banner.textContent = 'Finn wins this round.';
    busy = true;
    api.nudge(race ? `Finn reached the crown first, so Finn wins this round. Let's play again!` : mis ? `Oh no, you had to take the last pearl. Let's play again! Think about what you leave for Finn.` : `Finn took the last pearl, so Finn wins this round. Let's play again! Think about what you leave for Finn.`);
    setTimeout(() => { if (api.done()) return; reset(); round++; draw(); }, 2200);
  }
  function reset() { S = start.slice(); turn = 'you'; busy = false; got = { you: 0, finn: 0 }; log.length = 0; pick = []; }
  async function judgeMove(m) {
    const after = G.apply(S, m);
    await doMove(m, 'you'); turn = 'finn'; draw();
    if (G.lose(after)) { snd.good(); api.say(race ? `Yes! From stone ${pos()}, Finn cannot win any more.` : `Yes! Finn is left with ${after.join(' and ')}, and now he cannot win.`); winLater(api, 800); return; }
    const reply = G.good(after)[0];
    busy = true; await sleep(650); if (api.done()) return;
    await doMove(reply, 'finn'); draw(); busy = true;
    api.nudge(race ? `Finn jumps to ${pos()}, and now you cannot win any more. Let's put the pearl back and try a different jump.` : `Then Finn takes ${reply[1]} and leaves you ${S.join(' and ')}. From there Finn can always win. Let's put the pearls back and try a different move.`);
    setTimeout(() => { if (api.done()) return; reset(); round++; draw(); }, 2600);
  }
  function pearlClick(i, j) {
    if (api.done() || busy || turn !== 'you') return;
    const t = S[i] - j;
    if (t > max) return api.nudge(`You may take only ${maxTxt} pearls. Click one of the last ${max} pearls in a row.`);
    youMove([i, t]);
  }
  function lineClick(j) {
    if (api.done() || busy || turn !== 'you') return;
    glowOff(st);
    if (pick.includes(j)) pick = pick.filter(x => x !== j);
    else if (pick.length === 1 && Math.abs(pick[0] - j) === 1) pick.push(j);
    else { if (pick.length) api.nudge('Two pearls must be side by side, with no gap between them.'); pick = [j]; }
    snd.pop(); draw();
  }
  function takePick() { if (!pick.length || busy) return; const s0 = Math.min(...pick); youMove([s0, pick.length]); }
  function stoneClick(k) {
    if (api.done() || busy) return;
    if (mode === 'mark') {
      if (k === T) return api.nudge('The crown is always magic: whoever lands there wins.');
      if (holes.includes(k)) return api.nudge('That is a whirlpool. Nobody can stand on it, so it can’t be magic.');
      stars.has(k) ? stars.delete(k) : stars.add(k); snd.pop(); paintTrack(); return;
    }
    if (turn !== 'you') return;
    const d = k - pos();
    if (holes.includes(k)) return api.nudge('That stone is a whirlpool 🌀! Nobody can land on it.');
    if (d <= 0) return api.nudge('The pearl only jumps forwards, towards the crown.');
    if (d > max) return api.nudge(`The pearl can jump only ${maxTxt} stones at a time.`);
    youMove([0, d]);
  }
  /* ---- marking the magic stones */
  const magic = () => range(T + 1).filter(k => !holes.includes(k) && G.lose([T - k]));
  function checkStars() {
    if (api.done()) return;
    const truth = new Set(magic());
    const extra = [...stars].filter(k => !truth.has(k)).sort((a, b) => b - a), miss = [...truth].filter(k => !stars.has(k));
    if (!extra.length && !miss.length) { stones.filter((_, k) => stars.has(k)).forEach((s, n) => setTimeout(() => popEl(s), n * 120)); snd.good(); api.say('All the magic stones are found!'); winLater(api, 900); return; }
    if (extra.length) {
      const k = extra[0]; const q = [...stars].find(s => canLand(k, s));
      if (q != null) { stones[k].classList.add('c3-glow'); stones[q].classList.add('c3-glow'); setTimeout(() => glowOff(st), 2400); return api.nudge(`Stone ${k} and stone ${q} can’t both be magic. From ${k}, one jump of ${q - k} reaches the magic stone ${q}. So whoever stands on ${k} can still win.`); }
      return api.nudge(`Not quite. ${plural(extra.length, 'star')} ${extra.length === 1 ? 'is' : 'are'} on a stone that is not magic. Work backwards from the crown.`);
    }
    return api.nudge(`Good so far, but ${plural(miss.length, 'magic stone')} ${miss.length === 1 ? 'is' : 'are'} still missing. A stone is magic when no jump from it reaches another magic stone.`);
  }
  /* ---- layout */
  if (mode === 'mark') {
    drawTrack();
    st.append(h('div', { class: 'c3-rules3' }, `⭐ A magic stone: if you jump onto it, you can always win from there. The crown is magic.${holes.length ? ' Nobody may land on a whirlpool 🌀.' : ''} Click stones to put stars on them.`), table,
      h('div', { class: 'c3-row' }, h('button', { class: 'btn coral big', onclick: checkStars }, '✓ Check my stars'), h('span', { class: 'note' }, `Each jump is ${maxTxt} stones. Point at a stone to see where it can jump.`)));
    return {
      hint(l) { if (l > (p.hints || []).length) { const k = magic().filter(x => x !== T).sort((a, b) => b - a).find(x => !stars.has(x)); if (k != null) { stars.add(k); paintTrack(); popEl(stones[k]); } } },
      async solve() { stars = new Set(); paintTrack(); for (const k of magic().sort((a, b) => b - a)) { stars.add(k); paintTrack(); snd.pop(); await sleep(220); } checkStars(); },
    };
  }
  if (p.rule) st.append(h('div', { class: 'c3-rules3', html: p.rule }));
  takeBtn.hidden = true;
  if (race) { sideEl.you.classList.add('mini'); sideEl.finn.classList.add('mini'); }
  st.append(...(race ? [h('div', { class: 'c3-row', style: { gap: '24px' } }, sideEl.you, banner, sideEl.finn), table] : [h('div', { class: 'c3-duel' }, sideEl.you, table, sideEl.finn), h('div', { class: 'c3-row' }, banner, isLine ? takeBtn : null)]), logEl,
    h('div', { class: 'note' }, race ? 'Click a glowing stone to jump the pearl there.' : isLine ? 'Click a pearl, or two pearls next to each other, then press Take.' : 'Click a pearl to take it and all the pearls to its right.'));
  draw();
  return {
    hint(l) { if (l > (p.hints || []).length) { showBest = true; if (turn === 'you' && !busy) markBest(); } },
    async solve() {
      showBest = true;
      while (busy) { await sleep(100); if (api.done()) return; }
      if (api.done()) return;
      if (turn !== 'you' || G.lose(S)) { reset(); round++; draw(); await sleep(400); }
      while (!api.done()) {
        while (busy || turn !== 'you') { await sleep(100); if (api.done()) return; }
        const g = G.good(S)[0]; if (!g) return;
        await sleep(350); if (api.done()) return;
        await youMove(g);
      }
    },
  };
};

/* ================================================================ 2. mirrors and folding */
addCSS(`
.c3-mwrap{position:relative;flex:none}
.c3-mgrid{display:grid;border:4px solid #8f7d58;border-radius:10px;background:#fffdf6;box-shadow:0 6px 0 rgba(0,0,0,.08);overflow:hidden;touch-action:none}
.c3-mc{border:1px solid #e9dfc8;padding:0;background:transparent;transition:background-color .12s;border-radius:0}
.c3-mc.src{cursor:default;background-color:#f3eddd}
.c3-mc.ed{cursor:pointer}
.c3-mc.ed:hover{box-shadow:inset 0 0 0 3px rgba(13,132,150,.55)}
.c3-mc.bad{box-shadow:inset 0 0 0 4px var(--coral)!important}
.c3-mline{position:absolute;pointer-events:none;background:linear-gradient(90deg,#bfe9ff,#fff 50%,#bfe9ff);box-shadow:0 0 10px 2px rgba(120,210,255,.9);border-radius:3px;z-index:2}
.c3-turn{position:absolute;transform:translate(-50%,-50%);font-size:30px;z-index:3;pointer-events:none;filter:drop-shadow(0 0 4px #fff);animation:c3spin 4s linear infinite}
@keyframes c3spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
.c3-msvg{position:absolute;inset:0;pointer-events:none;z-index:2}
.c3-mside{display:flex;flex-direction:column;gap:12px;align-items:center;max-width:250px}
.c3-mside .note{text-align:center}
.c3-fold{display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;background:#eef6f8;border-radius:18px;padding:8px 12px}
.c3-fstep{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:15px;font-weight:600;color:var(--ink2)}
.c3-fstep svg{display:block}
.c3-farr{font-size:22px;color:var(--teal)}
.c3-paper{position:relative;display:grid;background:#fffaf0;border:3px solid #d8c9a6;box-shadow:0 6px 0 rgba(0,0,0,.08);flex:none}
.c3-pc{border:1px dotted #e6dcc6;padding:0;background:transparent;display:grid;place-items:center;cursor:pointer}
.c3-pc:hover{background:rgba(13,132,150,.1)}
.c3-hole{width:58%;height:58%;border-radius:50%;background:radial-gradient(circle at 40% 35%,#7fd6e8,#2d8fb3);box-shadow:inset 0 3px 4px rgba(0,0,0,.35);pointer-events:none}
.c3-hole.ghost{background:none;border:3px dashed var(--coral);box-shadow:none}
.c3-crease{position:absolute;pointer-events:none;border-color:#b9a57a;border-style:dashed;border-width:0}
`, 'mirror');

const COLN = { a: ['#2b8fd6', 'blue'], b: ['#ffcf3a', 'yellow'], c: ['#ef6a4a', 'red'], d: ['#4fbf7a', 'green'], e: ['#9b6ad6', 'purple'], k: ['#2c3e57', 'black'], o: ['#ff9a3c', 'orange'], p: ['#f497b6', 'pink'] };
const mirrorTwin = (ax, H, W, r, c) => ax === 'v' ? [r, W - 1 - c] : ax === 'h' ? [H - 1 - r, c] : ax === 'vh' ? [r < H / 2 ? r : H - 1 - r, c < W / 2 ? c : W - 1 - c] : ax === 'r' ? [H - 1 - r, W - 1 - c] : [c, r];
const mirrorSrc = (ax, H, W, r, c) => ax === 'v' ? c < W / 2 : ax === 'h' || ax === 'r' ? r < H / 2 : ax === 'vh' ? (r < H / 2 && c < W / 2) : c >= r;

R.mirror3 = (st, p, api) => {
  const pic = p.pic, H = pic.length, W = pic[0].length, ax = p.axis;
  const cs = Math.min(54, Math.floor(room() / H), Math.floor(520 / W));
  const used = [...new Set(pic.join('').replace(/\./g, ''))].sort();
  let sel = used[0];
  const val = pic.map((row, r) => [...row].map((ch, c) => mirrorSrc(ax, H, W, r, c) ? ch : '.'));
  const want = (r, c) => { const [a, b] = mirrorTwin(ax, H, W, r, c); return pic[a][b]; };
  const grid = h('div', { class: 'c3-mgrid', style: { gridTemplateColumns: `repeat(${W},${cs}px)`, gridTemplateRows: `repeat(${H},${cs}px)` } });
  const cells = [];
  let stroke = null, said = false;
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    const src = mirrorSrc(ax, H, W, r, c);
    const b = h('button', { class: 'c3-mc ' + (src ? 'src' : 'ed'), 'aria-label': `Square in row ${r + 1}, column ${c + 1}`, tabindex: src ? -1 : 0 });
    if (!src) {
      b.addEventListener('pointerdown', e => { if (e.button !== 0 || api.done()) return; e.preventDefault(); stroke = val[r][c] === sel ? '.' : sel; said = false; paint(r, c); });
      b.addEventListener('pointerenter', e => { if (stroke != null && (e.buttons & 1)) paint(r, c); });
      b.addEventListener('click', e => { if (e.detail === 0 && !api.done()) { stroke = val[r][c] === sel ? '.' : sel; said = false; paint(r, c); stroke = null; } });
    }
    cells.push(b); grid.append(b);
  }
  const endStroke = () => { if (!document.body.contains(grid)) { window.removeEventListener('pointerup', endStroke); return; } if (stroke == null) return; stroke = null; check(); };
  window.addEventListener('pointerup', endStroke);
  const cell = (r, c) => cells[r * W + c];
  function paint(r, c) {
    if (api.done() || val[r][c] === stroke) return;
    val[r][c] = stroke; stroke === '.' ? snd.bloop() : snd.pop(); show(r, c);
    const w = want(r, c);
    if (stroke !== '.' && stroke !== w && !said) {
      said = true; const [a, b] = mirrorTwin(ax, H, W, r, c);
      cell(a, b).classList.add('c3-glow'); setTimeout(() => cell(a, b).classList.remove('c3-glow'), 1600);
      const tw = ax === 'r' ? 'turning twin' : 'mirror twin';
      api.nudge(w === '.' ? `Look at this square’s ${tw} (it is glowing). The twin is empty, so this square stays empty too. Click it again to rub it out.` : `Look at this square’s ${tw} (it is glowing). The twin is ${COLN[w][1]}, so this one must be ${COLN[w][1]} too.`);
    }
  }
  function show(r, c) {
    const v = val[r][c], b = cell(r, c);
    b.style.backgroundColor = v === '.' ? '' : COLN[v][0];
    b.classList.toggle('bad', !mirrorSrc(ax, H, W, r, c) && v !== '.' && v !== want(r, c));
  }
  const left = () => { let n = 0; for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (!mirrorSrc(ax, H, W, r, c) && val[r][c] !== want(r, c)) n++; return n; };
  function check() { if (api.done()) return; if (!left()) { window.removeEventListener('pointerup', endStroke); snd.good(); grid.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 500 }); winLater(api, 600); } }
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) show(r, c);
  /* the mirror line(s) */
  const wrap = h('div', { class: 'c3-mwrap' }, grid);
  const GW = W * cs + 8, GH = H * cs + 8;
  if (ax === 'v' || ax === 'vh') wrap.append(h('div', { class: 'c3-mline', style: { left: (4 + W * cs / 2 - 3) + 'px', top: '-10px', width: '6px', height: (GH + 20) + 'px' } }));
  if (ax === 'h' || ax === 'vh') wrap.append(h('div', { class: 'c3-mline', style: { top: (4 + H * cs / 2 - 3) + 'px', left: '-10px', height: '6px', width: (GW + 20) + 'px' } }));
  if (ax === 'r') { wrap.append(h('div', { class: 'c3-mline', style: { top: (4 + H * cs / 2 - 1) + 'px', left: '4px', height: '2px', width: (W * cs) + 'px', opacity: '.5', boxShadow: 'none', background: '#9fb3c2' } }), h('div', { class: 'c3-turn', style: { left: (4 + W * cs / 2) + 'px', top: (4 + H * cs / 2) + 'px' } }, '🔄')); }
  if (ax === 'd') wrap.append(h('div', { class: 'c3-msvg', html: `<svg width="${GW}" height="${GH}" style="overflow:visible"><line x1="-8" y1="-8" x2="${GW + 8}" y2="${GH + 8}" stroke="#bfe9ff" stroke-width="7" stroke-linecap="round" style="filter:drop-shadow(0 0 5px #7fd0ff)"/><line x1="-8" y1="-8" x2="${GW + 8}" y2="${GH + 8}" stroke="#fff" stroke-width="2.5"/></svg>` }));
  const side = h('div', { class: 'c3-mside' });
  if (used.length > 1) {
    const pal = h('div', { class: 'c3-pal' }, h('span', { class: 'pl' }, 'Paint:'));
    used.forEach(k => { const b = h('button', { class: 'c3-swatch' + (k === sel ? ' on' : ''), style: { background: COLN[k][0] }, 'aria-label': COLN[k][1] + ' paint', onclick: () => { sel = k; snd.pop(); $$('.c3-swatch', pal).forEach(x => x.classList.toggle('on', x === b)); } }); pal.append(b); });
    side.append(pal);
  }
  side.append(h('div', { class: 'note' }, ax === 'r' ? 'The 🔄 in the middle is where the tile turns.' : ax === 'd' ? 'The mirror is the shining slanted line.' : 'The mirror is the shining line.'), h('div', { class: 'note' }, 'Click or drag over the empty squares to paint them. Click a painted square again to rub it out.'));
  st.append(h('div', { class: 'c3-row', style: { gap: '28px' } }, wrap, side));
  function firstWrong() { for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (!mirrorSrc(ax, H, W, r, c) && val[r][c] !== want(r, c)) return [r, c]; return null; }
  return {
    hint(l) { if (l > (p.hints || []).length) { const f = firstWrong(); if (f) { const [a, b] = mirrorTwin(ax, H, W, f[0], f[1]); cell(...f).classList.add('c3-glow'); cell(a, b).classList.add('c3-glow'); setTimeout(() => glowOff(st), 4000); } } },
    async solve() {
      let f; while (!api.done() && (f = firstWrong())) { const [r, c] = f; val[r][c] = want(r, c); show(r, c); snd.pop(); await sleep(70); }
      check();
    },
  };
};

/* folding paper and punching holes */
function foldUnfold(n, folds, holes) {
  const sizes = []; let W = n, H = n;
  folds.forEach(f => { sizes.push([W, H]); if (f === 'v') W /= 2; else H /= 2; });
  let set = new Set(holes.map(([r, c]) => r + ',' + c));
  for (let k = folds.length - 1; k >= 0; k--) {
    const [W0, H0] = sizes[k]; const next = new Set(set);
    set.forEach(s => { const [r, c] = s.split(',').map(Number); next.add(folds[k] === 'v' ? r + ',' + (W0 - 1 - c) : (H0 - 1 - r) + ',' + c); });
    set = next;
  }
  return set;
}
function miniPaper(w, h, cs, o = {}) {
  const W = w * cs, H = h * cs, pad = 6;
  let s = `<svg width="${W + 2 * pad}" height="${H + 2 * pad}" viewBox="${-pad} ${-pad} ${W + 2 * pad} ${H + 2 * pad}" aria-hidden="true"><defs><marker id="c3ah${o.id}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ef6a4a"/></marker></defs>`;
  s += `<rect x="0" y="0" width="${W}" height="${H}" fill="#fffaf0" stroke="#cdbb92" stroke-width="2"/>`;
  for (let i = 1; i < w; i++) s += `<line x1="${i * cs}" y1="0" x2="${i * cs}" y2="${H}" stroke="#eee3cc" stroke-width="1"/>`;
  for (let i = 1; i < h; i++) s += `<line x1="0" y1="${i * cs}" x2="${W}" y2="${i * cs}" stroke="#eee3cc" stroke-width="1"/>`;
  if (o.fold === 'v') s += `<rect x="${W / 2}" y="0" width="${W / 2}" height="${H}" fill="#ef6a4a" fill-opacity=".1"/><line x1="${W / 2}" y1="-4" x2="${W / 2}" y2="${H + 4}" stroke="#8a7550" stroke-width="2" stroke-dasharray="4 3"/><path d="M${W * 0.8} ${H * 0.55} Q${W / 2} ${H * 0.1} ${W * 0.2} ${H * 0.55}" fill="none" stroke="#ef6a4a" stroke-width="3" marker-end="url(#c3ah${o.id})"/>`;
  if (o.fold === 'h') s += `<rect x="0" y="${H / 2}" width="${W}" height="${H / 2}" fill="#ef6a4a" fill-opacity=".1"/><line x1="-4" y1="${H / 2}" x2="${W + 4}" y2="${H / 2}" stroke="#8a7550" stroke-width="2" stroke-dasharray="4 3"/><path d="M${W * 0.55} ${H * 0.8} Q${W * 0.1} ${H / 2} ${W * 0.55} ${H * 0.2}" fill="none" stroke="#ef6a4a" stroke-width="3" marker-end="url(#c3ah${o.id})"/>`;
  (o.holes || []).forEach(([r, c]) => { s += `<circle cx="${c * cs + cs / 2}" cy="${r * cs + cs / 2}" r="${cs * 0.3}" fill="#2d8fb3" stroke="#14365a" stroke-width="1.5"/>`; });
  return s + '</svg>';
}
let foldUid = 0;
R.punch = (st, p, api) => {
  const n = p.n, folds = p.folds, truth = foldUnfold(n, folds, p.holes);
  const marks = new Set(); let ghosts = new Set();
  /* the folding story */
  const story = h('div', { class: 'c3-fold' });
  let w = n, hh = n; const mcs = Math.max(10, Math.floor((room() > 330 ? 84 : 64) / n));
  folds.forEach((f, k) => {
    story.append(h('div', { class: 'c3-fstep', html: miniPaper(w, hh, mcs, { fold: f, id: ++foldUid }) + `<span>${k + 1}. fold</span>` }), h('span', { class: 'c3-farr' }, '➜'));
    if (f === 'v') w /= 2; else hh /= 2;
  });
  story.append(h('div', { class: 'c3-fstep', html: miniPaper(w, hh, mcs, { holes: p.holes, id: ++foldUid }) + `<span>${folds.length + 1}. punch</span>` }));
  /* the big unfolded paper */
  const cs = Math.min(60, Math.floor((room() - (room() > 330 ? 120 : 100)) / n));
  const paper = h('div', { class: 'c3-paper', style: { gridTemplateColumns: `repeat(${n},${cs}px)`, gridTemplateRows: `repeat(${n},${cs}px)` } });
  const cells = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const b = h('button', { class: 'c3-pc', 'aria-label': `Row ${r + 1}, column ${c + 1}: click to put a hole here` });
    b.onclick = () => { if (api.done()) return; const k = r + ',' + c; marks.has(k) ? (marks.delete(k), snd.bloop()) : (marks.add(k), snd.pop()); draw(); };
    cells.push(b); paper.append(b);
  }
  /* crease lines on the unfolded paper */
  const xs = new Set(), ys = new Set(); let W0 = n, H0 = n; const sizes = [];
  folds.forEach(f => { sizes.push([W0, H0]); if (f === 'v') W0 /= 2; else H0 /= 2; });
  folds.forEach((f, k) => {
    let lines = [f === 'v' ? sizes[k][0] / 2 : sizes[k][1] / 2];
    for (let j = k - 1; j >= 0; j--) if (folds[j] === f) { const S = f === 'v' ? sizes[j][0] : sizes[j][1]; lines = lines.concat(lines.map(x => S - x)); }
    lines.forEach(x => (f === 'v' ? xs : ys).add(x));
  });
  xs.forEach(x => paper.append(h('div', { class: 'c3-crease', style: { left: (x * cs - 1) + 'px', top: 0, bottom: 0, borderLeftWidth: '3px' } })));
  ys.forEach(y => paper.append(h('div', { class: 'c3-crease', style: { top: (y * cs - 1) + 'px', left: 0, right: 0, borderTopWidth: '3px' } })));
  const count = h('div', { class: 'c3-status' });
  function draw() {
    cells.forEach((b, i) => { const k = Math.floor(i / n) + ',' + (i % n); b.innerHTML = ''; if (marks.has(k)) b.append(h('span', { class: 'c3-hole' })); else if (ghosts.has(k)) b.append(h('span', { class: 'c3-hole ghost' })); });
    count.textContent = `Holes marked: ${marks.size}`;
  }
  function check() {
    if (api.done()) return;
    const extra = [...marks].filter(k => !truth.has(k)), miss = [...truth].filter(k => !marks.has(k));
    if (!extra.length && !miss.length) { $$('.c3-hole', paper).forEach((e, i) => setTimeout(() => popEl(e.parentNode), i * 90)); snd.good(); api.say(`Unfolded: ${plural(truth.size, 'hole')}, just where you said!`); winLater(api, 900); return; }
    if (marks.size !== truth.size) return api.nudge(`Not quite. You marked ${plural(marks.size, 'hole')}. Each fold doubles the layers of paper, so think about how many holes the punch makes.`);
    return api.nudge('You have the right number of holes, but some are in the wrong place. Each hole has a mirror twin on the other side of a fold line.');
  }
  st.append(story, h('div', { class: 'c3-row', style: { gap: '26px' } }, paper, h('div', { class: 'c3-mside' }, count, h('button', { class: 'btn coral big', onclick: check }, '📄 Unfold and check'), h('div', { class: 'note' }, 'Click the paper to mark where the holes will be. The dashed lines are the folds.'))));
  draw();
  return {
    hint(l) { if (l > (p.hints || []).length) { const [Wl, Hl] = sizes[sizes.length - 1], f = folds[folds.length - 1]; ghosts = new Set(); p.holes.forEach(([r, c]) => { ghosts.add(r + ',' + c); ghosts.add(f === 'v' ? r + ',' + (Wl - 1 - c) : (Hl - 1 - r) + ',' + c); }); draw(); } },
    async solve() { marks.clear(); for (const k of truth) { marks.add(k); draw(); snd.pop(); await sleep(120); } check(); },
  };
};

/* ================================================================ 3. map colouring */
addCSS(`
.c3-map{display:block;flex:none;filter:drop-shadow(0 6px 0 rgba(0,0,0,.12))}
.c3-map .rg{cursor:pointer;transition:fill .25s}
.c3-map .rg.hl{fill-opacity:.8}
.c3-map .rg.c3-flash{animation:c3flash .45s 4}
@keyframes c3flash{50%{fill:#fff}}
.c3-map .rg.c3-glowr{animation:c3glowr 1s ease-in-out infinite}
@keyframes c3glowr{50%{fill:#ffe48a}}
.c3-pots{display:flex;flex-direction:column;gap:10px;align-items:center;background:var(--sand);border-radius:20px;padding:10px 14px}
.c3-pots.two{display:grid;grid-template-columns:auto auto;gap:8px 10px;justify-items:center}.c3-pots.two .pl{grid-column:1/-1}
.c3-pots .pl{font-weight:600;font-size:17px;color:#7a5a2a}
.c3-potb{width:64px;height:58px;border:0;padding:0;background:none;position:relative;transition:transform .12s}
.c3-potb svg{width:64px;height:58px;display:block}
.c3-potb.on{transform:scale(1.15)}
.c3-potb.on:after{content:'';position:absolute;inset:-5px;border-radius:16px;border:4px solid var(--ink)}
`, 'colour');
const POTS = [['#ef6a4a', 'red'], ['#ffcf3a', 'yellow'], ['#2b8fd6', 'blue'], ['#4fbf7a', 'green'], ['#9b6ad6', 'purple']];
const potSVG = col => `<svg viewBox="0 0 64 58" aria-hidden="true"><path d="M10 18 h44 l-4 34 q-1 5 -6 5 H20 q-5 0 -6 -5 z" fill="#d9dee3" stroke="#8c99a5" stroke-width="2"/><ellipse cx="32" cy="18" rx="23" ry="7" fill="${col}" stroke="#8c99a5" stroke-width="2"/><path d="M16 22 q2 14 -2 20" stroke="${col}" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`;
function mapInfo(map) {
  const H = map.length, W = map[0].length, cells = {}, adj = {};
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) { const L = map[r][c]; if (L === '.') continue; (cells[L] = cells[L] || []).push([r, c]); adj[L] = adj[L] || new Set(); }
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    const L = map[r][c]; if (L === '.') continue;
    for (const [dr, dc] of [[0, 1], [1, 0]]) { const M = (map[r + dr] || '')[c + dc]; if (M && M !== '.' && M !== L) { adj[L].add(M); adj[M].add(L); } }
  }
  return { H, W, cells, adj, regs: Object.keys(cells).sort() };
}
/* a colouring with colours 0..k-1 that keeps the colours in `pre`, or null */
function colourMap(info, k, pre = {}) {
  const regs = info.regs.slice().sort((a, b) => (pre[b] != null) - (pre[a] != null) || info.adj[b].size - info.adj[a].size);
  const col = { ...pre };
  for (const L in pre) for (const M of info.adj[L]) if (pre[M] === pre[L]) return null;
  const go = i => {
    if (i === regs.length) return true;
    const L = regs[i]; if (col[L] != null) return go(i + 1);
    for (let c = 0; c < k; c++) { if ([...info.adj[L]].some(M => col[M] === c)) continue; col[L] = c; if (go(i + 1)) return true; }
    delete col[L]; return false;
  };
  return go(0) ? col : null;
}
const mapNeed = (info, pre = {}) => { for (let k = 1; k <= 5; k++) if (colourMap(info, k, pre)) return k; return 6; };

R.colour = (st, p, api) => {
  const info = mapInfo(p.map), { H, W, cells, adj, regs } = info, fixed = p.fixed || {};
  const need = mapNeed(info, fixed), pots = p.pots || need;
  const col = { ...fixed };
  let sel = 0;
  const cs = Math.min(76, Math.floor((room() - 46) / H), Math.floor(560 / W));
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'c3-map'); svg.setAttribute('width', W * cs + 12); svg.setAttribute('height', H * cs + 12); svg.setAttribute('viewBox', `-6 -6 ${W * cs + 12} ${H * cs + 12}`);
  let inner = '';
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) { const L = p.map[r][c]; if (L !== '.') inner += `<rect class="rg" data-reg="${L}" x="${c * cs}" y="${r * cs}" width="${cs + .5}" height="${cs + .5}"/>`; }
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    const L = p.map[r][c]; if (L === '.') continue;
    const edge = (M, x1, y1, x2, y2) => { if (M === L) inner += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-opacity=".07" stroke-width="1.5" pointer-events="none"/>`; else inner += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#4a3f30" stroke-width="5" stroke-linecap="round" pointer-events="none"/>`; };
    edge((p.map[r] || '')[c + 1] || '.', (c + 1) * cs, r * cs, (c + 1) * cs, (r + 1) * cs);
    edge((p.map[r + 1] || '')[c] || '.', c * cs, (r + 1) * cs, (c + 1) * cs, (r + 1) * cs);
    if (c === 0 || p.map[r][c - 1] === '.') edge('.', c * cs, r * cs, c * cs, (r + 1) * cs);
    if (r === 0 || p.map[r - 1][c] === '.') edge('.', c * cs, r * cs, (c + 1) * cs, r * cs);
  }
  for (const L in fixed) { const cl = cells[L], m = cl[Math.floor(cl.length / 2)]; inner += `<text x="${m[1] * cs + cs / 2}" y="${m[0] * cs + cs / 2 + 9}" font-size="26" text-anchor="middle" pointer-events="none">📌</text>`; }
  svg.innerHTML = inner;
  const rects = L => $$(`.rg[data-reg="${L}"]`, svg);
  svg.addEventListener('click', e => { const L = e.target.dataset && e.target.dataset.reg; if (L) tap(L); });
  svg.addEventListener('mouseover', e => { const L = e.target.dataset && e.target.dataset.reg; $$('.rg.hl', svg).forEach(x => x.classList.remove('hl')); if (L) rects(L).forEach(x => x.classList.add('hl')); });
  svg.addEventListener('mouseleave', () => $$('.rg.hl', svg).forEach(x => x.classList.remove('hl')));
  const status = h('div', { class: 'c3-status' });
  function paintReg(L) { rects(L).forEach(x => x.setAttribute('fill', col[L] == null ? '#ece5d3' : POTS[col[L]][0])); }
  function flash(L) { rects(L).forEach(x => { x.classList.remove('c3-flash'); void x.getBBox(); x.classList.add('c3-flash'); }); setTimeout(() => rects(L).forEach(x => x.classList.remove('c3-flash')), 1900); }
  const usedN = () => new Set(Object.values(col)).size;
  function draw() { regs.forEach(paintReg); const n = Object.keys(col).length; status.innerHTML = `Painted: <b>${n}</b> of ${regs.length} &nbsp;·&nbsp; Colours used: <b>${usedN()}</b>`; }
  function tap(L) {
    if (api.done()) return;
    $$('.c3-glowr', svg).forEach(x => x.classList.remove('c3-glowr'));
    if (fixed[L] != null) { flash(L); return api.nudge('The tiles with a pin 📌 were painted long ago. Paint the others.'); }
    if (col[L] === sel) { delete col[L]; snd.bloop(); draw(); return; }
    const clash = [...adj[L]].find(M => col[M] === sel);
    if (clash) { flash(clash); return api.nudge(`This tile touches a ${POTS[sel][1]} tile (it is flashing), so it can’t be ${POTS[sel][1]} too.`); }
    col[L] = sel; snd.drop(); draw(); check();
  }
  function check() {
    if (Object.keys(col).length < regs.length || api.done()) return;
    const u = usedN();
    if (u > need) return api.nudge(`Every tile is painted, using ${u} colours. Can you do it with fewer? Try repainting some tiles.`);
    snd.good(); svg.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }], { duration: 500 }); winLater(api, 600);
  }
  const potBox = h('div', { class: 'c3-pots' + (pots > 3 ? ' two' : '') }, h('span', { class: 'pl' }, 'Paint pots'));
  range(pots).forEach(i => { const b = h('button', { class: 'c3-potb' + (i === sel ? ' on' : ''), html: potSVG(POTS[i][0]), 'aria-label': POTS[i][1] + ' paint' }); b.onclick = () => { sel = i; snd.pop(); $$('.c3-potb', potBox).forEach(x => x.classList.toggle('on', x === b)); }; potBox.append(b); });
  st.append(h('div', { class: 'c3-row', style: { gap: '26px', alignItems: 'flex-start' } }, svg, h('div', { class: 'c3-col' }, potBox)), status,
    h('div', { class: 'note' }, 'Pick a paint pot, then click a tile. Tiles that share a side need different colours. Touching at a corner is fine.'));
  draw();
  const target = () => colourMap(info, need, Object.fromEntries(Object.entries(col))) || colourMap(info, need, fixed);
  return {
    hint(l) {
      if (l <= (p.hints || []).length) return;
      const sol = colourMap(info, need, { ...col });
      if (!sol) { Object.keys(col).forEach(L => { if (fixed[L] == null) delete col[L]; }); }
      const s2 = sol || colourMap(info, need, fixed);
      const L = regs.filter(x => col[x] == null).sort((a, b) => adj[b].size - adj[a].size)[0];
      if (L) { col[L] = s2[L]; draw(); rects(L).forEach(x => x.classList.add('c3-glowr')); setTimeout(() => $$('.c3-glowr', svg).forEach(x => x.classList.remove('c3-glowr')), 2500); snd.pop(); }
    },
    async solve() {
      const sol = target();
      Object.keys(col).forEach(L => { if (fixed[L] == null && col[L] !== sol[L]) delete col[L]; }); draw();
      for (const L of regs) { if (api.done()) return; if (col[L] == null) { col[L] = sol[L]; draw(); snd.pop(); await sleep(160); } }
      check();
    },
  };
};

/* ================================================================ 4. mini logic grids: sudoku and sum cages */
addCSS(`
.c3-lgrid{display:grid;border:5px solid #3f5d78;border-radius:12px;overflow:hidden;background:#fff;flex:none;box-shadow:0 6px 0 rgba(0,0,0,.08)}
.c3-lc{position:relative;border:0;border-right:1px solid #c6d6e2;border-bottom:1px solid #c6d6e2;background:#fff;padding:0;display:grid;place-items:center;font-weight:700;color:var(--ink);transition:background .15s}
.c3-lc:hover:not(.giv){background:#eaf7fa}
.c3-lc.giv{background:#e8eff4;cursor:default}
.c3-lc.giv .v{opacity:.95}
.c3-lc .v{line-height:1}
.c3-lc .cg{position:absolute;top:2px;left:5px;font-size:16px;font-weight:700;color:#b5452a;line-height:1.1;pointer-events:none}
.c3-lc.c3-flash{animation:c3flashc .45s 4}
@keyframes c3flashc{50%{background:#ffd2c4}}
.c3-lc.new .v{animation:c3pop .4s}
.c3-pal2{display:grid;grid-template-columns:auto auto;gap:10px;justify-items:center}.c3-pal2 .pl{grid-column:1/-1}
.c3-lside{display:flex;flex-direction:column;gap:12px;align-items:center;max-width:260px}
.c3-lside .c3-rules3{font-size:17px;padding:6px 12px}
.c3-sym{width:62px;height:62px;border-radius:16px;border:3px solid #fff;background:#fff;box-shadow:0 4px 0 var(--sand-d);font-size:34px;font-weight:700;padding:0;display:grid;place-items:center;transition:transform .12s}
.c3-sym.on{transform:scale(1.12);border-color:var(--ink);box-shadow:0 4px 0 var(--ink)}
`, 'latin');
function latinCheck(p, g, r, c, v) { // why v can't go at r,c (or null)
  const n = p.n;
  for (let k = 0; k < n; k++) { if (k !== c && g[r][k] === v) return { why: 'row', at: [r, k] }; if (k !== r && g[k][c] === v) return { why: 'column', at: [k, c] }; }
  if (p.box) { const [bh, bw] = p.box, r0 = r - r % bh, c0 = c - c % bw; for (let i = r0; i < r0 + bh; i++) for (let j = c0; j < c0 + bw; j++) if ((i !== r || j !== c) && g[i][j] === v) return { why: 'box', at: [i, j] }; }
  for (const cg of p.cages || []) {
    if (!cg.c.some(([i, j]) => i === r && j === c)) continue;
    const vals = cg.c.map(([i, j]) => (i === r && j === c) ? v : g[i][j]);
    const s = sumOf(vals.filter(x => x)), empty = vals.filter(x => !x).length;
    if (!empty && s !== cg.s) return { why: 'cage', s, cg };
    if (empty && s + empty > cg.s) return { why: 'cagebig', s, cg };
    if (empty && s + empty * n < cg.s) return null;
  }
  return null;
}
function latinSolve(p, g0, limit = 2) {
  const n = p.n, g = g0.map(r => r.slice()), out = [];
  const go = () => {
    let best = null, bc = null;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!g[r][c]) { const cand = range(n).map(i => i + 1).filter(v => !latinCheck(p, g, r, c, v)); if (!best || cand.length < bc.length) { best = [r, c]; bc = cand; } }
    if (!best) { out.push(g.map(r => r.slice())); return out.length >= limit; }
    for (const v of bc) { g[best[0]][best[1]] = v; if (go()) return true; g[best[0]][best[1]] = 0; }
    return false;
  };
  go(); return out;
}
const latinGrid = p => p.givens ? p.givens.map(row => [...row].map(ch => ch === '.' ? 0 : +ch)) : range(p.n).map(() => range(p.n).map(() => 0));

R.latin = (st, p, api) => {
  const n = p.n, g = latinGrid(p), giv = g.map(r => r.map(v => !!v));
  const sym = v => p.syms ? p.syms[v - 1] : String(v);
  const cs = Math.min(n <= 3 ? 92 : 80, Math.floor((room() + 10) / n));
  let sel = 1;
  const cageOf = {}; (p.cages || []).forEach((cg, k) => cg.c.forEach(([i, j]) => cageOf[i + ',' + j] = k));
  const grid = h('div', { class: 'c3-lgrid', style: { gridTemplateColumns: `repeat(${n},${cs}px)`, gridTemplateRows: `repeat(${n},${cs}px)` } });
  const cells = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const b = h('button', { class: 'c3-lc' + (giv[r][c] ? ' giv' : ''), style: { fontSize: (p.syms ? 44 : 40) + 'px' }, 'aria-label': `Row ${r + 1}, column ${c + 1}` });
    const thick = '4px solid #3f5d78';
    if (p.box) { if ((c + 1) % p.box[1] === 0 && c < n - 1) b.style.borderRight = thick; if ((r + 1) % p.box[0] === 0 && r < n - 1) b.style.borderBottom = thick; }
    if (p.cages) {
      const k = cageOf[r + ',' + c];
      if (c < n - 1 && cageOf[r + ',' + (c + 1)] !== k) b.style.borderRight = thick;
      if (r < n - 1 && cageOf[(r + 1) + ',' + c] !== k) b.style.borderBottom = thick;
      const cg = p.cages[k]; const first = cg.c.slice().sort((a, b2) => a[0] - b2[0] || a[1] - b2[1])[0];
      if (first[0] === r && first[1] === c) b.append(h('span', { class: 'cg' }, cg.s + (cg.c.length > 1 ? ' +' : '')));
    }
    b.append(h('span', { class: 'v' }));
    b.onclick = () => tap(r, c);
    cells.push(b); grid.append(b);
  }
  const cell = (r, c) => cells[r * n + c];
  function show(r, c, isNew) { const b = cell(r, c); $('.v', b).textContent = g[r][c] ? sym(g[r][c]) : ''; b.classList.toggle('new', !!isNew); }
  function flash(r, c) { const b = cell(r, c); b.classList.remove('c3-flash'); void b.offsetWidth; b.classList.add('c3-flash'); }
  function tap(r, c) {
    if (api.done()) return;
    glowOff(st);
    if (giv[r][c]) { flash(r, c); return api.nudge('This one was there from the start. Fill in the empty squares.'); }
    if (g[r][c] === sel) { g[r][c] = 0; snd.bloop(); show(r, c); return; }
    const w = latinCheck(p, g, r, c, sel);
    if (w) {
      if (w.at) { flash(...w.at); return api.nudge(`There is already ${p.syms ? 'a ' : 'a '}${sym(sel)} in this ${w.why}. Each ${w.why} has every ${p.syms ? 'creature' : 'number'} just once.`); }
      w.cg.c.forEach(([i, j]) => flash(i, j));
      return api.nudge(w.why === 'cage' ? `This cage must add up to ${w.cg.s}. With ${sel} here it would add up to ${w.s}.` : `This cage must add up to ${w.cg.s}. With ${sel} here it is already too big, because the other squares need at least 1 each.`);
    }
    g[r][c] = sel; snd.drop(); show(r, c, true); check();
  }
  function check() { if (api.done()) return; if (g.every(row => row.every(v => v))) { snd.good(); cells.forEach((b, i) => setTimeout(() => popEl(b), i * 30)); winLater(api, 700); } }
  const pal = h('div', { class: 'c3-pal c3-pal2' }, h('span', { class: 'pl' }, p.syms ? 'Pick a creature' : 'Pick a number'));
  range(n).forEach(i => { const b = h('button', { class: 'c3-sym' + (i + 1 === sel ? ' on' : ''), 'aria-label': 'Use ' + sym(i + 1) }, sym(i + 1)); b.onclick = () => { sel = i + 1; snd.pop(); $$('.c3-sym', pal).forEach(x => x.classList.toggle('on', x === b)); }; pal.append(b); });
  const rules = p.cages ? `Each row and column has ${listTxt(range(n).map(i => String(i + 1))).replace(' or ', ' and ')} once. A cage adds up to its red number.` : `Each row, column and thick box has every ${p.syms ? 'creature' : 'number'} once.`;
  st.append(h('div', { class: 'c3-row', style: { gap: '28px' } }, grid, h('div', { class: 'c3-lside' }, h('div', { class: 'c3-rules3' }, rules), pal, h('div', { class: 'note' }, 'Pick one, then click an empty square. Click it again to rub it out.'))));
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) show(r, c);
  const solution = () => latinSolve(p, latinGrid(p), 1)[0];
  return {
    hint(l) {
      if (l <= (p.hints || []).length) return;
      const s = solution();
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (g[r][c] && g[r][c] !== s[r][c]) { g[r][c] = 0; show(r, c); }
      let pick = null;
      for (let r = 0; r < n && !pick; r++) for (let c = 0; c < n && !pick; c++) if (!g[r][c] && range(n).filter(i => !latinCheck(p, g, r, c, i + 1)).length === 1) pick = [r, c];
      if (!pick) for (let r = 0; r < n && !pick; r++) for (let c = 0; c < n && !pick; c++) if (!g[r][c]) pick = [r, c];
      if (pick) { const [r, c] = pick; g[r][c] = s[r][c]; show(r, c, true); cell(r, c).classList.add('c3-glow'); snd.pop(); }
    },
    async solve() {
      const s = solution();
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (g[r][c] && g[r][c] !== s[r][c]) { g[r][c] = 0; show(r, c); }
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { if (api.done()) return; if (!g[r][c]) { g[r][c] = s[r][c]; show(r, c, true); snd.pop(); await sleep(110); } }
      check();
    },
  };
};

/* ================================================================ 5. tiling and area */
addCSS(`
.c3-board{position:relative;flex:none}
.c3-fl{position:absolute;border-radius:4px;background:radial-gradient(circle at 40% 35%,#f1ece0,#d9cfb9);box-shadow:inset 0 0 0 1px rgba(120,100,60,.25)}
.c3-fl.pv-ok{background:#c9f0d6;box-shadow:inset 0 0 0 3px var(--good)}
.c3-fl.pv-no{background:#ffd9cf;box-shadow:inset 0 0 0 3px var(--coral)}
.c3-pc3{position:absolute;touch-action:none;cursor:grab}
.c3-blk{position:absolute;border-radius:5px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.18),inset 0 0 0 2px rgba(255,255,255,.35)}
.c3-ptray{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:center;background:var(--sand);border-radius:18px;padding:10px 12px;max-width:420px;min-height:80px;min-width:220px}
.c3-pslot{display:flex;flex-direction:column;align-items:center;gap:4px}
.c3-pslot .c3-pc3{position:relative}
.c3-flip{font-size:14px!important;padding:2px 8px!important}
.c3-pghost{position:fixed;z-index:1000;pointer-events:none;opacity:.85;filter:drop-shadow(0 8px 10px rgba(0,0,0,.3))}
body.c3-dragging,body.c3-dragging *{cursor:grabbing!important}
.c3-gcount{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.c3-gcount .pill{font-size:21px;padding:4px 14px}
.c3-gcount .pill.ok{background:var(--good-l);color:var(--good)}
.c3-gcell{position:absolute;border:0;padding:0;border-radius:3px;background:rgba(255,255,255,.35);cursor:pointer}
.c3-gcell:hover{background:rgba(255,255,255,.7)}
.c3-gcell.on{background:linear-gradient(#7fd08f,#4fae66);box-shadow:inset 0 -4px 0 rgba(0,0,0,.15);border-radius:4px}
.c3-gcell.on:after{content:'🌿';font-size:20px;opacity:.7}
.c3-gcell.ghost{box-shadow:inset 0 0 0 3px var(--coral)}
.c3-sandbed{position:relative;border-radius:16px;background:linear-gradient(#f6e4b8,#e8cf93);box-shadow:inset 0 0 0 3px #d9b874;touch-action:none}
`, 'tile');
const PCOL = ['#ef6a4a', '#2b8fd6', '#ffc93a', '#4fbf7a', '#9b6ad6', '#ff8fb3', '#2fb3ac', '#ff9a3c', '#8a6d4f'];
const cellsOf = rows => { const out = []; rows.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.' && ch !== ' ') out.push([r, c]); })); return out; };
const normCells = cl => { const r0 = Math.min(...cl.map(x => x[0])), c0 = Math.min(...cl.map(x => x[1])); return cl.map(([r, c]) => [r - r0, c - c0]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
const rotCells = cl => normCells(cl.map(([r, c]) => [c, -r]));
const flipCells = cl => normCells(cl.map(([r, c]) => [r, -c]));
const cellsKey = cl => normCells(cl).map(x => x.join(',')).join(';');
function orients(cl, flip) {
  const out = [], seen = new Set(); let a = normCells(cl);
  for (const f of flip ? [0, 1] : [0]) { let b = f ? flipCells(a) : a; for (let k = 0; k < 4; k++) { const key = cellsKey(b); if (!seen.has(key)) { seen.add(key); out.push(b); } b = rotCells(b); } }
  return out;
}
/* fill the floor with the pieces; `pre` = placements already made [{i, cells:[[r,c]] absolute}] */
function tileSolve(p, pre = []) {
  const floor = p.shape.map(row => [...row].map(ch => ch === '#'));
  const H = floor.length, W = floor[0].length, used = new Set(pre.map(x => x.i)), cov = floor.map(r => r.map(() => false));
  for (const pl of pre) for (const [r, c] of pl.cells) { if (!floor[r] || !floor[r][c] || cov[r][c]) return null; cov[r][c] = true; }
  const pcs = p.pieces.map(pc => orients(cellsOf(pc), p.flip !== false));
  const out = pre.slice();
  const go = () => {
    let tr = -1, tc = -1;
    for (let r = 0; r < H && tr < 0; r++) for (let c = 0; c < W; c++) if (floor[r][c] && !cov[r][c]) { tr = r; tc = c; break; }
    if (tr < 0) return true;
    const tried = new Set();
    for (let i = 0; i < pcs.length; i++) {
      if (used.has(i)) continue; const k = cellsKey(cellsOf(p.pieces[i])); if (tried.has(k)) continue; tried.add(k);
      for (const o of pcs[i]) {
        const dr = tr - o[0][0], dc = tc - o[0][1];
        const abs = o.map(([r, c]) => [r + dr, c + dc]);
        if (!abs.every(([r, c]) => floor[r] && floor[r][c] && !cov[r][c])) continue;
        abs.forEach(([r, c]) => cov[r][c] = true); used.add(i); out.push({ i, cells: abs });
        if (go()) return true;
        abs.forEach(([r, c]) => cov[r][c] = false); used.delete(i); out.pop();
      }
    }
    return false;
  };
  return go() ? out : null;
}

R.tile = (st, p, api) => {
  const floor = p.shape.map(row => [...row].map(ch => ch === '#'));
  const H = floor.length, W = floor[0].length;
  const bs = Math.min(66, Math.floor(room() / H), Math.floor(460 / W)), ts = Math.min(34, Math.round(bs * 0.6));
  const pcs = p.pieces.map((pc, i) => ({ i, o: normCells(cellsOf(pc)), at: null, col: PCOL[(p.colors || [])[i] != null ? p.colors[i] : i % PCOL.length] }));
  const chiral = pc => orients(pc.o, true).length > orients(pc.o, false).length;
  const board = h('div', { class: 'c3-board', style: { width: W * bs + 'px', height: H * bs + 'px' } });
  const fl = {};
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (floor[r][c]) { const d = h('div', { class: 'c3-fl', style: { left: c * bs + 1 + 'px', top: r * bs + 1 + 'px', width: bs - 2 + 'px', height: bs - 2 + 'px' } }); fl[r + ',' + c] = d; board.append(d); }
  const tray = h('div', { class: 'c3-ptray' });
  const pieceEl = (pc, s) => {
    const w = Math.max(...pc.o.map(x => x[1])) + 1, hh = Math.max(...pc.o.map(x => x[0])) + 1;
    const el = h('div', { class: 'c3-pc3', style: { width: w * s + 'px', height: hh * s + 'px' }, role: 'button', tabindex: 0, 'aria-label': `A piece of ${pc.o.length} squares. Click to turn it, drag it onto the floor.` });
    pc.o.forEach(([r, c], k) => el.append(h('div', { class: 'c3-blk', 'data-k': k, style: { left: c * s + 1 + 'px', top: r * s + 1 + 'px', width: s - 2 + 'px', height: s - 2 + 'px', background: pc.col } })));
    return el;
  };
  const covered = () => { const m = {}; pcs.forEach(pc => { if (pc.at) pc.o.forEach(([r, c]) => m[(r + pc.at[0]) + ',' + (c + pc.at[1])] = pc.i); }); return m; };
  function fits(pc, at) {
    const m = covered();
    for (const [r, c] of pc.o) { const R0 = r + at[0], C0 = c + at[1]; if (!floor[R0] || !floor[R0][C0]) return 'out'; const o = m[R0 + ',' + C0]; if (o != null && o !== pc.i) return 'over'; }
    return null;
  }
  function draw() {
    $$('.c3-pc3', board).forEach(e => e.remove());
    pcs.forEach(pc => { if (!pc.at) return; const el = pieceEl(pc, bs); el.style.left = pc.at[1] * bs + 'px'; el.style.top = pc.at[0] * bs + 'px'; hook(el, pc); board.append(el); });
    tray.innerHTML = '';
    pcs.forEach(pc => {
      if (pc.at) return;
      const el = pieceEl(pc, ts); hook(el, pc);
      const slot = h('div', { class: 'c3-pslot' }, el);
      if (p.flip !== false && chiral(pc)) slot.append(h('button', { class: 'btn alt c3-flip', onclick: () => { if (api.done()) return; pc.o = flipCells(pc.o); snd.pop(); draw(); } }, '⇋ flip'));
      tray.append(slot);
    });
    if (!pcs.some(pc => !pc.at)) tray.append(h('span', { class: 'note' }, 'All the pieces are on the floor.'));
  }
  function preview(pc, at) {
    Object.values(fl).forEach(d => d.classList.remove('pv-ok', 'pv-no'));
    if (!at) return;
    const bad = fits(pc, at);
    pc.o.forEach(([r, c]) => { const d = fl[(r + at[0]) + ',' + (c + at[1])]; if (d) d.classList.add(bad ? 'pv-no' : 'pv-ok'); });
  }
  function hook(el, pc) {
    el.addEventListener('pointerdown', e => {
      if (e.button !== 0 || api.done()) return; e.preventDefault();
      const k = e.target.dataset.k != null ? +e.target.dataset.k : 0;
      const grab = pc.o[k];
      const sx = e.clientX, sy = e.clientY; let ghost = null, at = null;
      const mv = ev => {
        if (!ghost) {
          if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 7) return;
          ghost = pieceEl(pc, bs); ghost.classList.add('c3-pghost'); document.body.append(ghost); document.body.classList.add('c3-dragging'); el.style.opacity = '.25';
        }
        ghost.style.left = (ev.clientX - grab[1] * bs - bs / 2) + 'px'; ghost.style.top = (ev.clientY - grab[0] * bs - bs / 2) + 'px';
        const br = board.getBoundingClientRect();
        const r = Math.floor((ev.clientY - br.top) / bs) - grab[0], c = Math.floor((ev.clientX - br.left) / bs) - grab[1];
        const inside = ev.clientX > br.left - bs && ev.clientX < br.right + bs && ev.clientY > br.top - bs && ev.clientY < br.bottom + bs;
        at = inside ? [r, c] : null; preview(pc, at);
      };
      const up = ev => {
        window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
        document.body.classList.remove('c3-dragging'); preview(pc, null);
        if (!ghost) { // a click
          if (ev.type !== 'pointerup') return;
          if (pc.at) { pc.at = null; snd.bloop(); draw(); return; }
          pc.o = rotCells(pc.o); snd.pop(); draw(); return;
        }
        ghost.remove(); el.style.opacity = '';
        if (ev.type === 'pointerup' && at) place(pc, at); else if (pc.at) { pc.at = null; snd.bloop(); draw(); }
      };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (pc.at) pc.at = null; else pc.o = rotCells(pc.o); snd.pop(); draw(); } });
  }
  function place(pc, at) {
    if (api.done()) return;
    const bad = fits(pc, at);
    if (bad) { const was = pc.at; pc.at = was; draw(); return api.nudge(bad === 'out' ? 'That piece would stick out over the edge of the floor. Try another spot, or click the piece to turn it.' : 'That piece would sit on top of another piece. Pieces must not overlap.'); }
    pc.at = at; snd.drop(); draw();
    const m = covered();
    if (Object.keys(fl).every(k => m[k] != null)) { snd.good(); board.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 500 }); winLater(api, 600); }
  }
  st.append(h('div', { class: 'c3-row', style: { gap: '30px', alignItems: 'center' } }, board, h('div', { class: 'c3-col' }, tray, h('div', { class: 'note', style: { maxWidth: '400px' } }, 'Drag a piece onto the floor. Click a piece to turn it. Click a piece on the floor to take it back.'))));
  draw();
  const plan = () => { const pre = pcs.filter(pc => pc.at).map(pc => ({ i: pc.i, cells: pc.o.map(([r, c]) => [r + pc.at[0], c + pc.at[1]]) })); return tileSolve(p, pre) || (pcs.forEach(pc => pc.at = null), tileSolve(p, [])); };
  const apply = pl => { const pc = pcs[pl.i]; pc.o = normCells(pl.cells); const r0 = Math.min(...pl.cells.map(x => x[0])), c0 = Math.min(...pl.cells.map(x => x[1])); pc.at = [r0, c0]; };
  return {
    hint(l) { if (l <= (p.hints || []).length) return; const s = plan(); const nx = s && s.find(pl => !pcs[pl.i].at); if (nx) { apply(nx); snd.drop(); draw(); } else draw(); },
    async solve() { const s = plan(); draw(); for (const pl of s) { if (api.done()) return; if (pcs[pl.i].at) continue; apply(pl); snd.drop(); draw(); await sleep(280); } place(pcs[s[s.length - 1].i], pcs[s[s.length - 1].i].at); },
  };
};

/* build a garden with a given area and fence length */
const gardenStats = on => {
  const keys = [...on]; let per = 0;
  keys.forEach(k => { const [r, c] = k.split(',').map(Number); [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(([a, b]) => { if (!on.has((r + a) + ',' + (c + b))) per++; }); });
  let parts = 0; const seen = new Set();
  keys.forEach(k => { if (seen.has(k)) return; parts++; const q = [k]; seen.add(k); while (q.length) { const [r, c] = q.pop().split(',').map(Number); [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(([a, b]) => { const t = (r + a) + ',' + (c + b); if (on.has(t) && !seen.has(t)) { seen.add(t); q.push(t); } }); } });
  return { area: on.size, per, parts };
};
R.garden = (st, p, api) => {
  const W = p.w, H = p.h, cs = Math.min(54, Math.floor((room() - 50) / H), Math.floor(520 / W));
  const on = new Set(); let stroke = null;
  const bed = h('div', { class: 'c3-sandbed', style: { width: W * cs + 16 + 'px', height: H * cs + 16 + 'px' } });
  const cells = {};
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    const k = r + ',' + c;
    const b = h('button', { class: 'c3-gcell', style: { left: 8 + c * cs + 1 + 'px', top: 8 + r * cs + 1 + 'px', width: cs - 2 + 'px', height: cs - 2 + 'px' }, 'aria-label': `Row ${r + 1}, column ${c + 1}` });
    b.addEventListener('pointerdown', e => { if (e.button !== 0 || api.done()) return; e.preventDefault(); stroke = !on.has(k); set(k); });
    b.addEventListener('pointerenter', e => { if (stroke != null && (e.buttons & 1)) set(k); });
    b.addEventListener('click', e => { if (e.detail === 0 && !api.done()) { stroke = !on.has(k); set(k); stroke = null; after(); } });
    cells[k] = b; bed.append(b);
  }
  const fence = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  fence.setAttribute('width', W * cs + 16); fence.setAttribute('height', H * cs + 16);
  Object.assign(fence.style, { position: 'absolute', left: 0, top: 0, pointerEvents: 'none' });
  bed.append(fence);
  const up = () => { if (!document.body.contains(bed)) { window.removeEventListener('pointerup', up); return; } if (stroke == null) return; stroke = null; after(); };
  window.addEventListener('pointerup', up);
  const cA = h('span', { class: 'pill' }), cP = h('span', { class: 'pill' }), cN = h('div', { class: 'note' });
  const goal = p.max ? `Goal: a fence of ${p.perim}, with as many squares inside as you can` : `Goal: area ${p.area} squares, fence ${p.perim} sticks`;
  function set(k) { if (api.done() || on.has(k) === stroke) return; stroke ? on.add(k) : on.delete(k); stroke ? snd.pop() : snd.bloop(); draw(); }
  function draw() {
    Object.entries(cells).forEach(([k, b]) => { b.classList.toggle('on', on.has(k)); });
    let s = '';
    on.forEach(k => {
      const [r, c] = k.split(',').map(Number), x = 8 + c * cs, y = 8 + r * cs;
      const seg = (x1, y1, x2, y2) => { s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8a5a2b" stroke-width="6" stroke-linecap="round"/><circle cx="${x1}" cy="${y1}" r="4" fill="#5e3b19"/><circle cx="${x2}" cy="${y2}" r="4" fill="#5e3b19"/>`; };
      if (!on.has((r - 1) + ',' + c)) seg(x, y, x + cs, y);
      if (!on.has((r + 1) + ',' + c)) seg(x, y + cs, x + cs, y + cs);
      if (!on.has(r + ',' + (c - 1))) seg(x, y, x, y + cs);
      if (!on.has(r + ',' + (c + 1))) seg(x + cs, y, x + cs, y + cs);
    });
    fence.innerHTML = s;
    const g = gardenStats(on);
    cA.textContent = `Area: ${plural(g.area, 'square')}`; cP.textContent = `Fence: ${plural(g.per, 'stick')}`;
    cA.classList.toggle('ok', !p.max && g.area === p.area); cP.classList.toggle('ok', g.per === p.perim);
    cN.textContent = g.parts > 1 ? 'Your garden is in more than one piece. Keep it in one piece!' : 'Click or drag on the sand to plant squares. Click again to remove one.';
  }
  function after() {
    if (api.done()) return;
    const g = gardenStats(on);
    if (g.parts !== 1) return;
    if (p.max) {
      if (g.per === p.perim && g.area === p.area) { snd.good(); winLater(api, 600); return; }
      if (g.per === p.perim && g.area < p.area) return api.nudge(`The fence is ${p.perim} sticks long and holds ${plural(g.area, 'square')}. Can you fit more squares inside a fence of the same length?`);
      return;
    }
    if (g.area === p.area && g.per === p.perim) { snd.good(); winLater(api, 600); return; }
    if (g.area === p.area) api.nudge(`The area is right: ${p.area} squares! But the fence is ${g.per} sticks, and we want ${p.perim}. ${g.per > p.perim ? 'Squash the shape together to make the fence shorter.' : 'Stretch the shape out to make the fence longer.'}`);
  }
  st.append(h('div', { class: 'c3-goal' }, goal), h('div', { class: 'c3-row', style: { gap: '26px' } }, bed, h('div', { class: 'c3-col', style: { maxWidth: '260px' } }, h('div', { class: 'c3-gcount', style: { flexDirection: 'column' } }, cA, cP), cN)));
  draw();
  const exCells = () => { const cl = cellsOf(p.ex), hh = Math.max(...cl.map(x => x[0])) + 1, ww = Math.max(...cl.map(x => x[1])) + 1, r0 = Math.floor((H - hh) / 2), c0 = Math.floor((W - ww) / 2); return cl.map(([r, c]) => (r + r0) + ',' + (c + c0)); };
  return {
    hint(l) { if (l > (p.hints || []).length) { exCells().forEach(k => cells[k].classList.add('ghost')); } },
    async solve() { on.clear(); draw(); for (const k of exCells()) { if (api.done()) return; on.add(k); snd.pop(); draw(); await sleep(110); } after(); },
  };
};

/* ================================================================ 6. drawing without lifting, and bridges */
addCSS(`
.c3-trace{display:block;flex:none;border-radius:22px;max-width:100%}
.c3-trace .hit{cursor:pointer}
.c3-trace .nd{cursor:pointer}
.c3-trace .nd circle.dot{transition:fill .2s}
.c3-trace .nd:hover circle.dot{fill:#fff3c4}
.c3-trace .eg.used .ln{stroke:#ef6a4a;stroke-dasharray:none}
.c3-trace .eg.c3-hl .ln{stroke:#ffcf3a;animation:c3dash 1s linear infinite}
@keyframes c3dash{to{stroke-dashoffset:-24}}
.c3-trace .nd.c3-hl circle.dot,.c3-trace .nd.c3-hl ellipse{animation:c3ndglow 1s ease-in-out infinite}
@keyframes c3ndglow{50%{fill:#ffe48a}}
.c3-trace .nd.pick ellipse,.c3-trace .nd.pick circle.dot{fill:#ffe48a}
.c3-trace .walker{transition:transform .35s ease-in-out;pointer-events:none}
.c3-trace .oddm{pointer-events:none}
`, 'trace');
const edgeEnds = (nodes, e) => [[nodes[e[0]][0] + (e[3] ? e[3][0] : 0), nodes[e[0]][1] + (e[3] ? e[3][1] : 0)], [nodes[e[1]][0] + (e[4] ? e[4][0] : 0), nodes[e[1]][1] + (e[4] ? e[4][1] : 0)]];
const edgePath = (P, Q, bend = 0) => { const mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2, dx = Q[0] - P[0], dy = Q[1] - P[1], L = Math.hypot(dx, dy) || 1; const cx = mx - dy / L * bend, cy = my + dx / L * bend; return { d: `M${P[0]} ${P[1]} Q${cx} ${cy} ${Q[0]} ${Q[1]}`, mid: [(P[0] + 2 * cx + Q[0]) / 4, (P[1] + 2 * cy + Q[1]) / 4] }; };
const degrees = (n, edges) => { const d = Array(n).fill(0); edges.forEach(([a, b]) => { d[a]++; d[b]++; }); return d; };
const oddNodes = (n, edges) => degrees(n, edges).map((d, i) => d % 2 ? i : -1).filter(i => i >= 0);
const edgesConnected = (n, edges) => { if (!edges.length) return true; const adj = range(n).map(() => []); edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); }); const seen = new Set([edges[0][0]]), q = [edges[0][0]]; while (q.length) { const v = q.pop(); adj[v].forEach(u => { if (!seen.has(u)) { seen.add(u); q.push(u); } }); } return edges.every(([a]) => seen.has(a)); };
const eulerOK = (n, edges) => edgesConnected(n, edges) && oddNodes(n, edges).length <= 2;
/* an Euler path through the edges with the given indices, starting at s (Hierholzer); returns edge indices in order, or null */
function eulerPath(n, edges, idx, s) {
  const sub = idx.map(i => edges[i]);
  if (!edgesConnected(n, sub)) return null;
  const odd = oddNodes(n, sub);
  if (odd.length > 2 || (odd.length === 2 && !odd.includes(s))) return null;
  if (sub.length && !sub.some(([a, b]) => a === s || b === s)) return null;
  const left = new Set(idx), stack = [[s, -1]], out = [];
  while (stack.length) {
    const [v] = stack[stack.length - 1];
    const e = idx.find(i => left.has(i) && (edges[i][0] === v || edges[i][1] === v));
    if (e == null) { const [, ei] = stack.pop(); if (ei >= 0) out.push(ei); }
    else { left.delete(e); stack.push([edges[e][0] === v ? edges[e][1] : edges[e][0], e]); }
  }
  return out.reverse();
}
R.trace = (st, p, api) => {
  const mode = p.mode || 'trace', land = p.look === 'land', N = p.nodes.length;
  const edges = p.edges.map(e => e.slice());
  const VW = p.vw || 600, VH = p.vh || 360;
  let path = [], used = [], marks = new Set(), phase = mode === 'add' ? 'build' : 'walk', pick = null, showDeg = false, busy = false;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'c3-trace'); svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
  const scale = Math.min(1.1, (room() - 10) / VH, 640 / VW);
  svg.setAttribute('width', VW * scale); svg.setAttribute('height', VH * scale);
  const status = h('div', { class: 'c3-status' });
  function draw() {
    let s = `<rect x="0" y="0" width="${VW}" height="${VH}" rx="24" fill="${land ? 'url(#c3wat)' : '#f5f9fb'}"/>`;
    s += `<defs><linearGradient id="c3wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ad8e8"/><stop offset="1" stop-color="#3a9fc2"/></linearGradient></defs>`;
    if (land) for (let k = 0; k < 7; k++) s += `<path d="M${30 + k * 85} ${40 + (k % 3) * 110} q12 -8 24 0 t24 0" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none"/>`;
    /* lands under the bridges */
    if (land) p.nodes.forEach(([x, y], i) => { const L = p.lands[i]; s += `<ellipse cx="${x}" cy="${y}" rx="${L.rx || 70}" ry="${L.ry || 44}" fill="#f1e2b6" stroke="#c9ab6a" stroke-width="4"/><ellipse cx="${x}" cy="${y + 4}" rx="${(L.rx || 70) - 12}" ry="${(L.ry || 44) - 12}" fill="#a7d38a" fill-opacity=".55"/>`; });
    edges.forEach((e, i) => {
      const { d } = edgePath(...edgeEnds(p.nodes, e), e[2] || 0), u = used.includes(i);
      if (land) s += `<g class="eg${u ? ' used' : ''}" data-e="${i}"><path d="${d}" stroke="#7a5230" stroke-width="20" fill="none" stroke-linecap="round"/><path class="ln" d="${d}" stroke="${u ? '#ffcf3a' : '#c48a52'}" stroke-width="13" fill="none" stroke-dasharray="${u ? 'none' : '5 4'}"/><path class="hit" data-e="${i}" d="${d}" stroke="transparent" stroke-width="30" fill="none"/></g>`;
      else s += `<g class="eg${u ? ' used' : ''}" data-e="${i}"><path class="ln" d="${d}" stroke="${u ? '#ef6a4a' : '#9fb6c6'}" stroke-width="${u ? 9 : 7}" fill="none" stroke-linecap="round" stroke-dasharray="${u ? 'none' : '2 12'}"/><path class="hit" data-e="${i}" d="${d}" stroke="transparent" stroke-width="26" fill="none"/></g>`;
    });
    const deg = degrees(N, edges);
    p.nodes.forEach(([x, y], i) => {
      const cur = path.length && path[path.length - 1] === i;
      if (land) { const L = p.lands[i]; s += `<g class="nd${pick === i ? ' pick' : ''}" data-n="${i}"><ellipse cx="${x}" cy="${y}" rx="${(L.rx || 70) - 14}" ry="${(L.ry || 44) - 14}" fill="${cur ? '#ffe48a' : 'transparent'}" fill-opacity=".8"/><text x="${x}" y="${y + 2}" font-size="30" text-anchor="middle" pointer-events="none">${L.e}</text><text x="${x}" y="${y + 26}" font-size="15" font-weight="700" fill="#5a4320" text-anchor="middle" pointer-events="none">${L.name}</text></g>`; }
      else s += `<g class="nd${pick === i ? ' pick' : ''}" data-n="${i}"><circle cx="${x}" cy="${y}" r="26" fill="transparent"/><circle class="dot" cx="${x}" cy="${y}" r="14" fill="${cur ? '#ffcf3a' : path[0] === i ? '#ffe9b0' : '#fff'}" stroke="#14365a" stroke-width="4"/></g>`;
      if (marks.has(i)) s += `<circle class="oddm" cx="${x}" cy="${y}" r="${land ? 46 : 22}" fill="none" stroke="#ef6a4a" stroke-width="5" stroke-dasharray="7 5"/>`;
      if (showDeg) { const bx = x + (land ? 46 : 24), by = y - (land ? 30 : 22); s += `<g pointer-events="none"><circle cx="${bx}" cy="${by}" r="14" fill="${deg[i] % 2 ? '#ef6a4a' : '#1f8f55'}"/><text x="${bx}" y="${by + 6}" font-size="17" font-weight="700" fill="#fff" text-anchor="middle">${deg[i]}</text></g>`; }
    });
    if (path.length) { const [x, y] = p.nodes[path[path.length - 1]]; s += land ? `<text class="walker" x="${x - 34}" y="${y - 12}" font-size="34" text-anchor="middle">🦀</text>` : `<g class="walker" transform="translate(${x - 36} ${y - 52})">${sharkSVG().replace('<svg ', '<svg width="72" height="47" ')}</g>`; }
    svg.innerHTML = s;
    if (mode === 'odd') status.textContent = `Dots marked: ${marks.size}`;
    else if (phase === 'build') status.textContent = pick == null ? 'Click a piece of land, then another one, to build a new bridge between them.' : `Now click the land on the other end of the new bridge.`;
    else status.innerHTML = `${land ? 'Bridges crossed' : 'Lines drawn'}: <b>${used.length}</b> of ${edges.length}`;
  }
  /* a new bridge: on a long shore it starts at the point of the shore nearest the other land */
  const shoreOff = (a, b) => { const L = land && p.lands[a]; if (!L || (L.rx || 70) < 150) return [0, 0]; const [ax, ay] = p.nodes[a], [bx, by] = p.nodes[b]; return [Math.max(-(L.rx - 60), Math.min(L.rx - 60, bx - ax)), by > ay ? L.ry - 24 : -(L.ry - 24)]; };
  const newEdge = (a, b, bend) => [a, b, bend, shoreOff(a, b), shoreOff(b, a)];
  const at = () => path[path.length - 1];
  const freeEdges = () => range(edges.length).filter(i => !used.includes(i));
  function go(ei) {
    const e = edges[ei], v = at(), w = e[0] === v ? e[1] : e[0];
    used.push(ei); path.push(w); snd.pop(); glowOff(st); $$('.c3-hl', svg).forEach(x => x.classList.remove('c3-hl')); draw();
    const g = $(`.eg[data-e="${ei}"] .ln`, svg);
    if (g && g.getTotalLength) { const L = g.getTotalLength(); g.animate([{ strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDasharray: `${L} ${L}`, strokeDashoffset: 0 }], { duration: 300 }); }
    if (used.length === edges.length) { snd.good(); api.say(land ? 'Every bridge crossed exactly once!' : 'The whole picture, without lifting the pen!'); winLater(api, 700); return; }
    if (!freeEdges().some(i => edges[i][0] === w || edges[i][1] === w)) api.nudge(`Stuck! There are ${plural(edges.length - used.length, land ? 'bridge' : 'line')} left, but none of them ${land ? 'leaves this land' : 'starts at this dot'}. Press Undo, or Start over and try a different start.`);
  }
  function tapNode(i) {
    if (api.done() || busy) return;
    if (mode === 'odd') { marks.has(i) ? marks.delete(i) : marks.add(i); snd.pop(); draw(); return; }
    if (phase === 'build') {
      if (pick == null) { pick = i; snd.pop(); draw(); return; }
      if (pick === i) { pick = null; draw(); return; }
      const a = pick, k = edges.filter(e => (e[0] === a && e[1] === i) || (e[0] === i && e[1] === a)).length;
      edges.push(newEdge(a, i, k ? (k % 2 ? 1 : -1) * 34 * Math.ceil((k + 1) / 2) : 0)); pick = null; snd.drop(); draw();
      if (!eulerOK(N, edges)) {
        busy = true; api.nudge(`With that bridge, ${plural(oddNodes(N, edges).length, 'land')} still ${oddNodes(N, edges).length === 1 ? 'has' : 'have'} an odd number of bridges, so the walk is still impossible. The new bridge will wash away. Try another place.`);
        setTimeout(() => { edges.pop(); busy = false; draw(); }, 1800); return;
      }
      phase = 'walk'; snd.good(); api.say('The new bridge is built! Now take the walk: click a land to start, then cross every bridge once.'); draw(); return;
    }
    if (!path.length) { path = [i]; snd.pop(); draw(); return; }
    const v = at();
    const cand = freeEdges().filter(k => (edges[k][0] === v && edges[k][1] === i) || (edges[k][1] === v && edges[k][0] === i));
    if (cand.length) return go(cand[0]);
    if (i === v) return;
    const any = edges.some(e => (e[0] === v && e[1] === i) || (e[1] === v && e[0] === i));
    api.nudge(any ? `You already ${land ? 'crossed that bridge' : 'drew that line'}. Each one is used only once.` : land ? 'No bridge goes straight from here to there.' : 'No line goes straight from Finn’s dot to that dot.');
  }
  function tapEdge(ei) {
    if (api.done() || busy) return;
    if (mode === 'odd' || phase === 'build') return;
    if (!path.length) return api.nudge(land ? 'First click a piece of land to start the walk.' : 'First click a dot to start drawing there.');
    if (used.includes(ei)) return api.nudge(`You already ${land ? 'crossed that bridge' : 'drew that line'}.`);
    const e = edges[ei], v = at();
    if (e[0] !== v && e[1] !== v) return api.nudge(land ? 'That bridge does not touch the land where the crab is.' : 'That line does not start at Finn’s dot.');
    go(ei);
  }
  svg.addEventListener('click', e => { const n = e.target.closest('[data-n]'), g = e.target.closest('[data-e]'); if (n) tapNode(+n.dataset.n); else if (g) tapEdge(+g.dataset.e); });
  const cant = () => {
    if (api.done() || busy) return;
    if (!eulerOK(N, edges)) { showDeg = true; draw(); api.say(`You are right! ${plural(oddNodes(N, edges).length, land ? 'land has' : 'dot has', land ? 'lands have' : 'dots have')} an odd number of ${land ? 'bridges' : 'lines'}. That is too many.`); snd.good(); winLater(api, 900); }
    else api.nudge('It can be done! Keep trying. Think about where to start.');
  };
  if (mode === 'odd') {
    const check = () => {
      if (api.done()) return;
      const odd = new Set(oddNodes(N, edges)), deg = degrees(N, edges);
      const wrong = [...marks].find(i => !odd.has(i)), miss = [...odd].find(i => !marks.has(i));
      if (wrong == null && miss == null) { showDeg = true; draw(); snd.good(); api.say(`Yes! Those ${plural(odd.size, 'dot')} have an odd number of lines.`); winLater(api, 900); return; }
      if (wrong != null) { $(`.nd[data-n="${wrong}"]`, svg).classList.add('c3-hl'); return api.nudge(`The glowing dot has ${deg[wrong]} lines. ${deg[wrong]} is even. Count the lines touching it again.`); }
      api.nudge(`You found ${marks.size} so far, but some dots with an odd number of lines are not marked yet. Count the lines at every dot.`);
    };
    st.append(svg, h('div', { class: 'c3-row' }, status, h('button', { class: 'btn coral big', onclick: check }, '✓ Check')));
    draw();
    return {
      hint(l) { if (l > (p.hints || []).length) { showDeg = true; draw(); } },
      async solve() { marks = new Set(oddNodes(N, edges)); showDeg = true; draw(); await sleep(400); check(); },
    };
  }
  api.button('↶ Undo', () => {
    if (busy) return;
    if (used.length) { used.pop(); path.pop(); }
    else if (path.length) path = [];
    else if (mode === 'add' && phase === 'walk' && edges.length > p.edges.length) { edges.pop(); phase = 'build'; }
    snd.bloop(); draw();
  }, 'btn alt');
  if (mode === 'trace' && !p.noCant) api.button('🙅 It can’t be done', cant, 'btn alt');
  st.append(svg, status);
  draw();
  function nextHint() {
    $$('.c3-hl', svg).forEach(x => x.classList.remove('c3-hl'));
    if (phase === 'build') { oddNodes(N, edges).forEach(i => $(`.nd[data-n="${i}"]`, svg).classList.add('c3-hl')); showDeg = true; draw(); oddNodes(N, edges).forEach(i => $(`.nd[data-n="${i}"]`, svg).classList.add('c3-hl')); return; }
    if (!eulerOK(N, edges)) { showDeg = true; draw(); return; }
    if (!path.length) { const odd = oddNodes(N, edges); (odd.length ? odd : range(N)).forEach(i => $(`.nd[data-n="${i}"]`, svg).classList.add('c3-hl')); return; }
    const rest = eulerPath(N, edges, freeEdges(), at());
    if (rest && rest.length) $(`.eg[data-e="${rest[0]}"]`, svg).classList.add('c3-hl');
    else { const b = $$('.acts button').find(x => /Undo/.test(x.textContent)); if (b) b.classList.add('c3-glow'); }
  }
  return {
    hint(l) { if (l > (p.hints || []).length) nextHint(); },
    async solve() {
      while (busy) { await sleep(100); if (api.done()) return; }
      if (mode === 'trace' && !eulerOK(N, edges)) return cant();
      if (phase === 'build') {
        const odd = oddNodes(N, edges); let made = false;
        for (let a = 0; a < odd.length && !made; a++) for (let b = a + 1; b < odd.length && !made; b++) { edges.push(newEdge(odd[a], odd[b], 0)); if (eulerOK(N, edges)) made = true; else edges.pop(); }
        phase = 'walk'; snd.drop(); draw(); await sleep(500);
      }
      used = []; path = []; draw();
      const odd = oddNodes(N, edges), s = odd.length ? odd[0] : edges[0][0];
      const order = eulerPath(N, edges, range(edges.length), s);
      path = [s]; draw(); await sleep(300);
      for (const ei of order) { if (api.done()) return; go(ei); await sleep(320); }
    },
  };
};

/* ================================================================ 7. counting routes through the city streets */
addCSS(`
.c3-routes{display:block;flex:none}
.c3-routes .xn{cursor:pointer}
.c3-routes .xn.next circle.ring{animation:c3ring 1s ease-in-out infinite}
@keyframes c3ring{50%{stroke-opacity:.2}}
.c3-routes .xn:hover circle.bub{fill:#fff3c4}
.c3-routes .xn.sel circle.bub{fill:#ffe48a;stroke:#d9a62c}
.c3-routes .xn.ok circle.bub{fill:#dcf5e6;stroke:#1f8f55}
.c3-routes .xn.c3-hl circle.bub{animation:c3ndglow .7s ease-in-out infinite}
.c3-found{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:300px;align-content:flex-start}
.c3-found svg{background:#fff;border-radius:8px;border:2px solid var(--line)}
.c3-found svg.new{animation:c3pop .5s;border-color:var(--sun-d)}
.c3-pad{display:grid;grid-template-columns:repeat(4,52px);gap:6px}
.c3-pad .btn{padding:0;height:46px;font-size:23px}
.c3-rside{display:flex;flex-direction:column;gap:10px;align-items:center;min-width:230px}
`, 'routes');
const segKey = (a, b) => (a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])) ? `${a[0]},${a[1]}-${b[0]},${b[1]}` : `${b[0]},${b[1]}-${a[0]},${a[1]}`;
function routeWays(p) {
  const bl = new Set((p.block || []).map(s => segKey([s[0], s[1]], [s[2], s[3]]))), gone = new Set((p.gone || []).map(g => g.join(',')));
  const ok = (x, y) => x >= 0 && y >= 0 && x <= p.w && y <= p.h && !gone.has(x + ',' + y);
  const W = {};
  for (let s = 0; s <= p.w + p.h; s++) for (let x = 0; x <= p.w; x++) { const y = s - x; if (y < 0 || y > p.h) continue;
    if (!ok(x, y)) { W[x + ',' + y] = 0; continue; }
    if (!x && !y) { W['0,0'] = 1; continue; }
    let v = 0; if (x > 0 && ok(x - 1, y) && !bl.has(segKey([x - 1, y], [x, y]))) v += W[(x - 1) + ',' + y]; if (y > 0 && ok(x, y - 1) && !bl.has(segKey([x, y - 1], [x, y]))) v += W[x + ',' + (y - 1)]; W[x + ',' + y] = v; }
  return { W, bl, gone, ok, step: (a, b) => ok(b[0], b[1]) && !bl.has(segKey(a, b)) && ((b[0] === a[0] + 1 && b[1] === a[1]) || (b[1] === a[1] + 1 && b[0] === a[0])) };
}
function allRoutes(p) {
  const { step } = routeWays(p), out = [];
  const go = (at, acc) => { if (at[0] === p.w && at[1] === p.h) { out.push(acc); return; } for (const [dx, dy, m] of [[1, 0, 'R'], [0, 1, 'U']]) { const b = [at[0] + dx, at[1] + dy]; if (step(at, b)) go(b, acc + m); } };
  go([0, 0], ''); return out;
}
R.routes = (st, p, api) => {
  const mode = p.mode || 'trace', { W: ways, bl, gone, ok, step } = routeWays(p), total = ways[p.w + ',' + p.h];
  const s = Math.min(120, Math.floor((room() - 96) / p.h), Math.floor(440 / p.w)), pad = 34;
  const X = x => pad + x * s, Y = y => pad + (p.h - y) * s;
  const VW = p.w * s + 2 * pad, VH = p.h * s + 2 * pad;
  let path = [[0, 0]], found = [], lab = { '0,0': 1 }, sel = null, typed = '', ghost = null;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'c3-routes'); svg.setAttribute('width', VW); svg.setAttribute('height', VH); svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
  const foundEl = h('div', { class: 'c3-found' });
  const status = h('div', { class: 'c3-status' });
  function base() {
    let t = `<rect x="0" y="0" width="${VW}" height="${VH}" rx="22" fill="#2e6f86"/><rect x="6" y="6" width="${VW - 12}" height="${VH - 12}" rx="18" fill="#3f8aa0"/>`;
    for (let x = 0; x < p.w; x++) for (let y = 0; y < p.h; y++) {
      const x0 = X(x) + s * 0.16, y0 = Y(y + 1) + s * 0.16, w = s * 0.68, kind = (x * 7 + y * 3) % 3;
      t += `<rect x="${x0}" y="${y0}" width="${w}" height="${w}" rx="8" fill="${['#b9a98a', '#a8b5a0', '#c2ae9a'][kind]}" opacity=".85"/>`;
      t += `<path d="M${x0 + w * .15} ${y0 + w * .38} L${x0 + w / 2} ${y0 + w * .12} L${x0 + w * .85} ${y0 + w * .38} Z" fill="#8f7f62" opacity=".7"/>`;
      for (let k = 0; k < 3; k++) t += `<rect x="${x0 + w * (.22 + k * .22)}" y="${y0 + w * .42}" width="${w * .1}" height="${w * .4}" fill="#8f7f62" opacity=".7"/>`;
    }
    for (let y = 0; y <= p.h; y++) t += `<line x1="${X(0)}" y1="${Y(y)}" x2="${X(p.w)}" y2="${Y(y)}" stroke="#ecdcae" stroke-width="${s * .2}" stroke-linecap="round"/>`;
    for (let x = 0; x <= p.w; x++) t += `<line x1="${X(x)}" y1="${Y(0)}" x2="${X(x)}" y2="${Y(p.h)}" stroke="#ecdcae" stroke-width="${s * .2}" stroke-linecap="round"/>`;
    (p.block || []).forEach(([x1, y1, x2, y2]) => { const mx = (X(x1) + X(x2)) / 2, my = (Y(y1) + Y(y2)) / 2, vert = x1 === x2; t += `<g transform="translate(${mx} ${my}) rotate(${vert ? 90 : 0}) rotate(70)"><rect x="${-s * .3}" y="-9" width="${s * .6}" height="18" rx="9" fill="#8d97a0" stroke="#5f6a73" stroke-width="3"/><line x1="${-s * .18}" y1="-8" x2="${-s * .18}" y2="8" stroke="#5f6a73" stroke-width="2"/><line x1="${s * .18}" y1="-8" x2="${s * .18}" y2="8" stroke="#5f6a73" stroke-width="2"/></g>`; });
    (p.gone || []).forEach(([x, y]) => { t += `<circle cx="${X(x)}" cy="${Y(y)}" r="${s * .2}" fill="#7c8790"/><text x="${X(x)}" y="${Y(y) + 9}" font-size="26" text-anchor="middle">🪨</text>`; });
    t += `<text x="${X(p.w) + 2}" y="${Y(p.h) - 14}" font-size="34" text-anchor="middle">💎</text>`;
    return t;
  }
  const routeD = pts => pts.map(([x, y], k) => `${k ? 'L' : 'M'}${X(x)} ${Y(y)}`).join(' ');
  function draw() {
    let t = base();
    if (mode === 'trace') {
      if (ghost) t += `<path d="${routeD(ghost)}" stroke="#ffcf3a" stroke-width="8" stroke-dasharray="10 8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      t += `<path d="${routeD(path)}" stroke="#ef6a4a" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      const at = path[path.length - 1];
      for (let x = 0; x <= p.w; x++) for (let y = 0; y <= p.h; y++) {
        if (!ok(x, y)) continue; const nx = step(at, [x, y]);
        t += `<g class="xn${nx ? ' next' : ''}" data-x="${x}" data-y="${y}"><circle cx="${X(x)}" cy="${Y(y)}" r="${s * .26}" fill="transparent"/>${nx ? `<circle class="ring" cx="${X(x)}" cy="${Y(y)}" r="13" fill="#fff" stroke="#ffcf3a" stroke-width="6"/>` : `<circle cx="${X(x)}" cy="${Y(y)}" r="6" fill="#c9b47e"/>`}</g>`;
      }
      t += `<g transform="translate(${X(at[0]) - 34} ${Y(at[1]) - 46})" pointer-events="none">${sharkSVG().replace('<svg ', '<svg width="68" height="44" ')}</g>`;
      status.innerHTML = `Routes found: <b>${found.length}</b>${p.tell ? ` of ${total}` : ''}`;
    } else {
      for (let x = 0; x <= p.w; x++) for (let y = 0; y <= p.h; y++) {
        if (!ok(x, y)) continue; const k = x + ',' + y, isSel = sel === k, v = isSel ? typed : lab[k];
        const r = Math.min(20, s * .3);
        t += `<g class="xn${isSel ? ' sel' : ''}${lab[k] != null && !isSel ? ' ok' : ''}" data-x="${x}" data-y="${y}"><circle class="bub" cx="${X(x)}" cy="${Y(y)}" r="${r}" fill="#fff" stroke="#14365a" stroke-width="3"/><text x="${X(x)}" y="${Y(y) + 7}" font-size="${String(v || '').length > 2 ? 15 : 20}" font-weight="700" text-anchor="middle" fill="#14365a" pointer-events="none">${v == null || v === '' ? (isSel ? '_' : '') : v}</text></g>`;
      }
      t += `<g transform="translate(${X(0) - 66} ${Y(0) - 20})" pointer-events="none">${sharkSVG().replace('<svg ', '<svg width="56" height="36" ')}</g>`;
      status.innerHTML = lab[p.w + ',' + p.h] != null ? `There are <b>${total}</b> routes!` : 'Click a crossing to write its number.';
    }
    svg.innerHTML = t;
  }
  function addThumb(rt, isNew) {
    const ts = Math.max(9, Math.min(15, Math.floor(56 / Math.max(p.w, p.h)))), tp = 5;
    const pts = [[0, 0]]; [...rt].forEach(m => { const [x, y] = pts[pts.length - 1]; pts.push(m === 'R' ? [x + 1, y] : [x, y + 1]); });
    const d = pts.map(([x, y], k) => `${k ? 'L' : 'M'}${tp + x * ts} ${tp + (p.h - y) * ts}`).join(' ');
    let g = ''; for (let y = 0; y <= p.h; y++) g += `<line x1="${tp}" y1="${tp + y * ts}" x2="${tp + p.w * ts}" y2="${tp + y * ts}" stroke="#e3e9ee" stroke-width="2"/>`; for (let x = 0; x <= p.w; x++) g += `<line x1="${tp + x * ts}" y1="${tp}" x2="${tp + x * ts}" y2="${tp + p.h * ts}" stroke="#e3e9ee" stroke-width="2"/>`;
    const el = h('span', { html: `<svg width="${p.w * ts + 2 * tp}" height="${p.h * ts + 2 * tp}" class="${isNew ? 'new' : ''}">${g}<path d="${d}" stroke="#ef6a4a" stroke-width="3.5" fill="none" stroke-linejoin="round"/></svg>` });
    foundEl.append(el);
  }
  function tapTrace(x, y) {
    const at = path[path.length - 1];
    if (x === at[0] && y === at[1]) return;
    if (!step(at, [x, y])) {
      const near = Math.abs(x - at[0]) + Math.abs(y - at[1]) === 1 && (x >= at[0] && y >= at[1]);
      return api.nudge(near ? 'A fallen column blocks that street.' : 'Finn swims only to the right or up, one street at a time. Click a glowing crossing.');
    }
    path.push([x, y]); snd.pop(); ghost = null; draw();
    if (x === p.w && y === p.h) {
      const rt = path.slice(1).map((q, k) => q[0] > path[k][0] ? 'R' : 'U').join('');
      if (found.includes(rt)) { api.nudge('You found that route already! Try a different one.'); }
      else { found.push(rt); addThumb(rt, true); snd.good(); }
      setTimeout(() => { if (api.done()) return; path = [[0, 0]]; draw(); }, 500);
      if (found.length === total) { api.say(`All ${total} routes found!`); winLater(api, 700); }
      draw();
    }
  }
  /* labelling */
  const feeders = (x, y) => { const f = []; if (x > 0 && ok(x - 1, y) && !bl.has(segKey([x - 1, y], [x, y]))) f.push([x - 1, y]); if (y > 0 && ok(x, y - 1) && !bl.has(segKey([x, y - 1], [x, y]))) f.push([x, y - 1]); return f; };
  function tapLabel(x, y) {
    const k = x + ',' + y;
    if (k === '0,0') return api.nudge('Finn starts here, so there is just 1 way to be here.');
    if (lab[k] != null) return api.nudge(`This crossing is done: ${lab[k]}.`);
    sel = k; typed = ''; snd.pop(); draw();
  }
  function key(d) {
    if (api.done() || sel == null) return;
    if (d === '⌫') typed = typed.slice(0, -1); else if (d === '✓') return enter(); else if (typed.length < 3) typed += d;
    snd.pop(); draw();
  }
  function enter() {
    if (sel == null) return;
    if (typed === '') return api.nudge('Type the number with the buttons first.');
    const [x, y] = sel.split(',').map(Number), v = +typed, want = ways[sel];
    if (v === want) { lab[sel] = v; const k = sel; sel = null; typed = ''; snd.drop(); draw(); popEl($(`.xn[data-x="${x}"][data-y="${y}"]`, svg)); if (k === p.w + ',' + p.h) { snd.good(); winLater(api, 700); } return; }
    const f = feeders(x, y);
    typed = ''; draw();
    if (!f.length) return api.nudge('No street leads into this crossing from the left or from below, so Finn can never get here. That is 0 ways.');
    if (f.some(([a, b]) => lab[a + ',' + b] == null)) return api.nudge(`Not quite. Finn reaches this crossing only from ${f.length === 2 ? 'the crossing on the left or the one below' : f[0][0] < x ? 'the crossing on the left' : 'the crossing below'}. Find ${f.length === 2 ? 'their numbers' : 'that number'} first.`);
    api.nudge(f.length === 2 ? `Not quite. Finn reaches this crossing from the left (${lab[f[0][0] + ',' + f[0][1]]} ways) or from below (${lab[f[1][0] + ',' + f[1][1]]} ways). Add them up.` : `Only one street leads into this crossing, from ${f[0][0] < x ? 'the left' : 'below'}. So it has the same number as that crossing.`);
  }
  svg.addEventListener('click', e => { const g = e.target.closest('.xn'); if (!g || api.done()) return; const x = +g.dataset.x, y = +g.dataset.y; mode === 'trace' ? tapTrace(x, y) : tapLabel(x, y); });
  if (mode === 'trace') {
    api.button('↶ Back one step', () => { if (path.length > 1) { path.pop(); snd.bloop(); draw(); } }, 'btn alt');
    st.append(h('div', { class: 'c3-row', style: { gap: '24px', alignItems: 'flex-start' } }, svg, h('div', { class: 'c3-rside' }, status, foundEl, h('div', { class: 'note' }, 'Click the glowing crossings to swim to the 💎. Each new route goes in this list.'))));
    draw();
    return {
      hint(l) { if (l > (p.hints || []).length) { const rt = allRoutes(p).find(r => !found.includes(r)); if (rt) { ghost = [[0, 0]]; [...rt].forEach(m => { const [x, y] = ghost[ghost.length - 1]; ghost.push(m === 'R' ? [x + 1, y] : [x, y + 1]); }); draw(); } } },
      async solve() {
        for (const rt of allRoutes(p)) {
          if (api.done()) return; if (found.includes(rt)) continue;
          path = [[0, 0]]; draw();
          for (const m of rt) { if (api.done()) return; const [x, y] = path[path.length - 1]; tapTrace(m === 'R' ? x + 1 : x, m === 'U' ? y + 1 : y); await sleep(110); }
          await sleep(520);
        }
      },
    };
  }
  const padEl = h('div', { class: 'c3-pad' }, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫', '✓'].map(d => h('button', { class: 'btn ' + (d === '✓' ? 'coral' : 'alt'), onclick: () => key(d), 'aria-label': d === '⌫' ? 'Rub out' : d === '✓' ? 'Enter' : d }, d)));
  const onKey = e => { if (!document.body.contains(svg)) { document.removeEventListener('keydown', onKey); return; } if (/^[0-9]$/.test(e.key)) key(e.key); else if (e.key === 'Backspace') key('⌫'); else if (e.key === 'Enter' && sel) { e.preventDefault(); key('✓'); } };
  document.addEventListener('keydown', onKey);
  st.append(h('div', { class: 'c3-row', style: { gap: '24px' } }, svg, h('div', { class: 'c3-rside' }, status, padEl, h('div', { class: 'note', style: { maxWidth: '240px' } }, 'Click a crossing, then type how many ways Finn can get there.'))));
  draw();
  const order = () => { const o = []; for (let s2 = 1; s2 <= p.w + p.h; s2++) for (let x = 0; x <= p.w; x++) { const y = s2 - x; if (y >= 0 && y <= p.h && ok(x, y)) o.push([x, y]); } return o; };
  return {
    hint(l) { if (l > (p.hints || []).length) { const nx = order().find(([x, y]) => lab[x + ',' + y] == null); if (nx) { const [x, y] = nx; feeders(x, y).forEach(([a, b]) => { if (lab[a + ',' + b] == null) lab[a + ',' + b] = ways[a + ',' + b]; }); sel = x + ',' + y; typed = ''; draw(); feeders(x, y).forEach(([a, b]) => $(`.xn[data-x="${a}"][data-y="${b}"]`, svg).classList.add('c3-hl')); } } },
    async solve() { for (const [x, y] of order()) { if (api.done()) return; const k = x + ',' + y; if (lab[k] != null) continue; sel = k; typed = String(ways[k]); draw(); await sleep(120); enter(); await sleep(60); } },
  };
};

/* ================================================================ 8. matchstick puzzles */
addCSS(`
.c3-eq{display:flex;gap:14px;align-items:center;justify-content:center;background:linear-gradient(#24475f,#1b3a50);border-radius:22px;padding:18px 22px;box-shadow:inset 0 -6px 0 rgba(0,0,0,.2)}
.c3-mcell{position:relative;flex:none}
.c3-slot{position:absolute;border-radius:7px;border:2px dashed rgba(255,255,255,.18)}
.c3-slot.full{border-color:transparent}
body.picking .c3-slot:not(.full),body.dragging .c3-slot:not(.full){border-color:rgba(255,230,150,.75);background:rgba(255,230,150,.12)}
.c3-slot.c3-glow{border-color:#ffcf3a!important;background:rgba(255,207,58,.35)}
.c3-stk{position:absolute;inset:1px;border-radius:6px;background:linear-gradient(90deg,#f6d9a0,#e2b86a);box-shadow:0 2px 0 rgba(0,0,0,.35);padding:0;border:0}
.c3-stk.v{background:linear-gradient(0deg,#f6d9a0,#e2b86a)}
.c3-stk:after{content:'';position:absolute;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff8a6a,#c9302a)}
.c3-stk.h:after{left:-3px;top:-3px;width:18px;height:18px}
.c3-stk.v:after{left:-3px;top:-3px;width:18px;height:18px}
.c3-stk.fixed{cursor:default;filter:saturate(.6) brightness(.9)}
.c3-stk.fixed:after{display:none}
.c3-stk.moved{box-shadow:0 0 0 3px #7fe3ff,0 2px 0 rgba(0,0,0,.35)}
.c3-read{font-size:24px;font-weight:700;text-align:center;min-height:34px}
.c3-read .no{color:var(--bad)}.c3-read .yes{color:var(--good)}
.c3-mcount{font-size:18px;font-weight:600;color:var(--ink2)}
.c3-lat{position:relative;background:linear-gradient(#24475f,#1b3a50);border-radius:22px;box-shadow:inset 0 -6px 0 rgba(0,0,0,.2);flex:none}
`, 'match');
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
const SEGD = Object.fromEntries(Object.entries(SEG).map(([d, s]) => [s, d]));
const ML = 54, MT = 13;
const SEGPOS = { a: [MT, 0, 'h'], g: [MT, ML + MT, 'h'], d: [MT, 2 * ML + 2 * MT, 'h'], f: [0, MT, 'v'], b: [ML + MT, MT, 'v'], e: [0, ML + 2 * MT, 'v'], c: [ML + MT, ML + 2 * MT, 'v'] };
function matchCells(eq) {
  return [...eq].map(ch => /\d/.test(ch) ? { t: 'd', segs: SEG[ch] } : ch === '_' ? { t: 'd', segs: '' } : ch === '=' ? { t: '=' } : { t: 'o', segs: ch === '+' ? 'hv' : ch === '-' ? 'h' : '' });
}
function matchSlots(eq) { // all slot ids of an equation, and the ones filled at the start
  const cells = matchCells(eq), all = [], on = [];
  cells.forEach((c, i) => { const names = c.t === 'd' ? 'abcdefg' : c.t === 'o' ? 'hv' : ''; [...names].forEach(s => { all.push(i + s); if (c.segs.includes(s)) on.push(i + s); }); });
  return { cells, all, on };
}
function matchRead(cells, on) { // the text the sticks show, with ? for unreadable ones
  return cells.map((c, i) => {
    if (c.t === '=') return '=';
    const segs = [...(c.t === 'd' ? 'abcdefg' : 'hv')].filter(s => on.has(i + s)).join('');
    if (c.t === 'o') return segs === 'hv' ? '+' : segs === 'h' ? '−' : segs === '' ? ' ' : '?';
    return segs === '' ? ' ' : SEGD[segs] != null ? SEGD[segs] : '?';
  });
}
function matchTrue(cells, on) {
  const txt = matchRead(cells, on).join('').replace(/−/g, '-');
  if (/\?/.test(txt)) return false;
  const sides = txt.split('='); if (sides.length !== 2) return false;
  const val = side => { const m = side.trim(); if (!/^\d+( *[+-] *\d+)*$/.test(m)) return null; const toks = m.replace(/ /g, '').match(/\d+|[+-]/g); if (toks.some(t => /^0\d/.test(t))) return null; let v = +toks[0]; for (let k = 1; k < toks.length; k += 2) v = toks[k] === '+' ? v + +toks[k + 1] : v - +toks[k + 1]; return v; };
  const a = val(sides[0]), b = val(sides[1]);
  return a != null && b != null && a === b;
}
function latSlots(p) { const all = []; for (let y = 0; y <= p.lat.h; y++) for (let x = 0; x < p.lat.w; x++) all.push(`h${x},${y}`); for (let y = 0; y < p.lat.h; y++) for (let x = 0; x <= p.lat.w; x++) all.push(`v${x},${y}`); return all; }
function latSquares(p, on) {
  let n = 0; const inSq = new Set();
  for (let y = 0; y < p.lat.h; y++) for (let x = 0; x < p.lat.w; x++) { const e = [`h${x},${y}`, `h${x},${y + 1}`, `v${x},${y}`, `v${x + 1},${y}`]; if (e.every(k => on.has(k))) { n++; e.forEach(k => inSq.add(k)); } }
  return { n, loose: [...on].filter(k => !inSq.has(k)).length };
}
const matchGood = (p, cells, on) => p.lat ? (() => { const s = latSquares(p, on); return s.n === p.squares && !s.loose; })() : matchTrue(cells, on);
/* every way to move up to p.moves sticks that makes the puzzle right; each answer is [[from, to], ...] */
function matchSolutions(p, limit = 50) {
  const { cells, all, on } = p.lat ? { cells: null, all: latSlots(p), on: p.lat.sticks } : matchSlots(p.eq);
  const fixed = new Set(p.fixed || []);
  const sticks = on.filter(k => !fixed.has(k)), empty = all.filter(k => !on.includes(k)), out = [];
  for (let m = 1; m <= p.moves && out.length < limit; m++)
    for (const rm of combos(sticks, m)) for (const ad of combos(empty, m)) {
      const s = new Set(on); rm.forEach(k => s.delete(k)); ad.forEach(k => s.add(k));
      if (matchGood(p, cells, s)) { out.push(rm.map((k, i) => [k, ad[i]])); if (out.length >= limit) break; }
    }
  return out;
}
R.sticks = (st, p, api) => {
  const lat = !!p.lat;
  const S0 = lat ? { cells: null, all: latSlots(p), on: p.lat.sticks } : matchSlots(p.eq);
  const orig = new Set(S0.on), fixed = new Set(p.fixed || []);
  let on = new Set(S0.on); const hist = [];
  const box = h('div', { class: lat ? 'c3-lat' : 'c3-eq' });
  const read = h('div', { class: 'c3-read' }), cnt = h('div', { class: 'c3-mcount' });
  const slotEls = {};
  const moved = () => [...orig].filter(k => !on.has(k)).length;
  function mkSlot(id, x, y, dir, parent) {
    const el = h('div', { class: 'c3-slot', style: { left: x + 'px', top: y + 'px', width: (dir === 'h' ? ML : MT) + 'px', height: (dir === 'h' ? MT : ML) + 'px' } });
    el.dataset.dir = dir; el.dataset.id = id; droppable(el, d => move(d.slot, id), 'An empty place for a stick'); slotEls[id] = el; parent.append(el);
  }
  if (lat) {
    const U = ML + MT;
    Object.assign(box.style, { width: p.lat.w * U + MT + 40 + 'px', height: p.lat.h * U + MT + 40 + 'px' });
    const inner = h('div', { style: { position: 'absolute', left: '20px', top: '20px' } }); box.append(inner);
    S0.all.forEach(k => { const [x, y] = k.slice(1).split(',').map(Number); k[0] === 'h' ? mkSlot(k, x * U + MT, y * U, 'h', inner) : mkSlot(k, x * U, y * U + MT, 'v', inner); });
  } else {
    S0.cells.forEach((c, i) => {
      const cell = h('div', { class: 'c3-mcell', style: { width: (c.t === 'd' ? ML + 2 * MT : ML + 2 * MT) + 'px', height: 2 * ML + 3 * MT + 'px' } });
      if (c.t === 'd') Object.entries(SEGPOS).forEach(([s, [x, y, dir]]) => mkSlot(i + s, x, y, dir, cell));
      else if (c.t === 'o') { mkSlot(i + 'h', MT, ML + MT, 'h', cell); mkSlot(i + 'v', MT + ML / 2 - MT / 2, ML + MT + MT / 2 - ML / 2, 'v', cell); }
      else { [ML + MT - 13, ML + MT + 13].forEach(y => cell.append(h('div', { class: 'c3-slot full', style: { left: MT + 'px', top: y + 'px', width: ML + 'px', height: MT + 'px' } }, h('div', { class: 'c3-stk h fixed' })))); }
      box.append(cell);
    });
  }
  function draw() {
    Object.entries(slotEls).forEach(([id, el]) => {
      el.innerHTML = ''; el.classList.toggle('full', on.has(id));
      if (on.has(id)) { const s = h('button', { class: `c3-stk ${el.dataset.dir}${fixed.has(id) ? ' fixed' : ''}${!orig.has(id) ? ' moved' : ''}`, 'aria-label': 'A stick. Drag it to an empty place.' }); if (!fixed.has(id)) draggable(s, { slot: id }); el.append(s); }
    });
    const m = moved();
    cnt.textContent = `Sticks moved: ${m} of ${p.moves}`;
    if (lat) { const s = latSquares(p, on); read.innerHTML = `Squares: <span class="${s.n === p.squares && !s.loose ? 'yes' : ''}">${s.n}</span>${s.loose ? ` <span class="note">(${plural(s.loose, 'loose stick')})</span>` : ''}`; }
    else { const t = matchRead(S0.cells, on).join(' ').replace(/ +/g, ' '); const ok = matchTrue(S0.cells, on); read.innerHTML = `It says: <span class="${ok ? 'yes' : 'no'}">${t.trim()} ${ok ? '✓' : '✗'}</span>`; }
  }
  function move(from, to) {
    if (api.done() || from == null || from === to) return;
    glowOff(st);
    if (!on.has(from) || on.has(to)) return;
    const next = new Set(on); next.delete(from); next.add(to);
    const m = [...orig].filter(k => !next.has(k)).length;
    if (m > p.moves) { shakeEl(slotEls[from]); return api.nudge(`You may move only ${plural(p.moves, 'stick')}. Put a moved stick back first (the moved ones glow blue), or press Start over.`); }
    hist.push(new Set(on)); on = next; snd.drop(); draw(); popEl(slotEls[to]);
    if (m >= 1 && matchGood(p, S0.cells, on)) { snd.good(); api.say(lat ? `${plural(p.squares, 'square')}, and no loose sticks!` : `${matchRead(S0.cells, on).join(' ').replace(/ +/g, ' ').trim()}. That is true!`); winLater(api, 800); return; }
    if (m === p.moves) {
      if (lat) { const s = latSquares(p, on); api.nudge(`Now there ${s.n === 1 ? 'is' : 'are'} ${plural(s.n, 'square')}${s.loose ? ` and ${plural(s.loose, 'loose stick')}` : ''}. We want ${plural(p.squares, 'square')} with no loose sticks. Try moving a different stick.`); }
      else { const t = matchRead(S0.cells, on); api.nudge(t.includes('?') ? 'Some sticks don’t make a proper digit or sign now. Move a stick back and try again.' : `It says ${t.join(' ').replace(/ +/g, ' ').trim()}. That is not true. Try a different stick.`); }
    }
  }
  api.button('↶ Undo', () => { if (!hist.length) return; on = hist.pop(); snd.bloop(); glowOff(st); draw(); }, 'btn alt');
  st.append(box, read, h('div', { class: 'c3-row' }, cnt, h('span', { class: 'note' }, 'Drag a stick to an empty place, or click a stick and then click the place.')));
  draw();
  function nextMove() {
    const sols = matchSolutions(p);
    const ahead = sols.find(sol => { const rm = new Set(sol.map(x => x[0])), ad = new Set(sol.map(x => x[1])); return [...orig].filter(k => !on.has(k)).every(k => rm.has(k)) && [...on].filter(k => !orig.has(k)).every(k => ad.has(k)); });
    if (!ahead) { on = new Set(orig); draw(); return sols[0] && sols[0][0]; }
    const rm = ahead.map(x => x[0]).filter(k => on.has(k)), ad = ahead.map(x => x[1]).filter(k => !on.has(k));
    return rm.length ? [rm[0], ad[0]] : null;
  }
  return {
    hint(l) { if (l > (p.hints || []).length) { const mv = nextMove(); if (mv) { $('.c3-stk', slotEls[mv[0]]).classList.add('c3-glow'); slotEls[mv[1]].classList.add('c3-glow'); } } },
    async solve() { let mv, guard = 0; while (!api.done() && (mv = nextMove()) && guard++ < 6) { slotEls[mv[0]].classList.add('c3-glow'); await sleep(350); move(mv[0], mv[1]); await sleep(450); } },
  };
};

/* ================================================================ 9. bar models */
addCSS(`
.c3-bars{display:flex;flex-direction:column;gap:16px;background:#f4f8fa;border-radius:20px;padding:12px 16px}
.c3-brow{display:flex;align-items:center;gap:10px;min-height:50px}
.c3-bname{width:120px;flex:none;display:flex;align-items:center;gap:6px;font-weight:600;font-size:19px}
.c3-bname .e{font-size:30px;line-height:1}
.c3-btrack{position:relative;height:48px;flex:none;touch-action:none}
.c3-btrack.free{cursor:ew-resize}
.c3-btrack.free:before{content:'';position:absolute;inset:0;border-radius:10px;background:repeating-linear-gradient(90deg,transparent 0 calc(var(--u) - 1px),rgba(20,54,90,.08) calc(var(--u) - 1px) var(--u))}
.c3-blks{position:absolute;left:0;top:3px;bottom:3px;display:flex;pointer-events:none}
.c3-bk{flex:none;height:100%;border-radius:5px;margin-right:2px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.15)}
.c3-bk.later{opacity:.45;box-shadow:inset 0 0 0 2px rgba(0,0,0,.25)}
.c3-bk.extra{background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.45) 0 4px,transparent 4px 9px)!important}
.c3-bk.gap{margin-left:6px}
.c3-handle{position:absolute;top:-3px;width:16px;height:54px;margin-left:-8px;border-radius:8px;background:#fff;border:3px solid var(--ink);pointer-events:none;box-shadow:0 2px 0 rgba(0,0,0,.2)}
.c3-bval{min-width:50px;font-size:26px;font-weight:700;text-align:center}
.c3-bbtn{width:40px;height:40px;padding:0!important;font-size:24px!important}
.c3-ans{position:absolute;top:-8px;bottom:-8px;width:0;border-left:4px dashed var(--coral);pointer-events:none}
.c3-conds{display:flex;flex-direction:column;gap:6px;width:min(100%,760px)}
.c3-cond{display:flex;gap:10px;align-items:center;background:#fff;border:3px solid var(--line);border-radius:14px;padding:4px 12px;font-size:18px}
.c3-cond .ic{font-size:22px;width:28px;text-align:center}
.c3-cond .now{margin-left:auto;color:var(--ink2);font-size:17px;text-align:right}
.c3-cond.ok{border-color:var(--good);background:var(--good-l)}
.c3-xtag{position:absolute;top:-17px;font-size:14px;font-weight:700;color:var(--coral-d);white-space:nowrap;pointer-events:none}
`, 'bars');
function barVals(p, v) { const out = { ...v }; p.bars.forEach(b => { if (b.fixed != null) out[b.id] = b.fixed; }); p.bars.forEach(b => { if (b.link) out[b.id] = b.link.times ? out[b.link.to] * b.link.times : out[b.link.to] + (b.link.plus || 0); }); return out; }
function condOK(c, v) {
  const s = ids => sumOf(ids.map(i => v[i]));
  if (c.t === 'sum') return s(c.of) === c.is;
  if (c.t === 'more') return v[c.a] - v[c.b] === c.by;
  if (c.t === 'times') return v[c.a] === c.k * v[c.b];
  if (c.t === 'give') return v[c.from] - c.n === v[c.to] + c.n;
  if (c.t === 'sumLater') return s(c.of) + c.of.length * c.years === c.is;
  if (c.t === 'timesLater') return v[c.a] + v[c.y] === c.k * (v[c.b] + v[c.y]);
  return false;
}
R.bars = (st, p, api) => {
  const byId = Object.fromEntries(p.bars.map(b => [b.id, b]));
  const free = p.bars.filter(b => !b.link && b.fixed == null).map(b => b.id);
  const v0 = {}; free.forEach(id => v0[id] = byId[id].start != null ? byId[id].start : 1);
  let v = { ...v0 }, ghosts = false;
  const u = Math.min(40, Math.floor(560 / p.max));
  const later = id => { const b = byId[id]; return b.later ? (typeof b.later === 'number' ? b.later : barVals(p, v)[b.later]) : 0; };
  const rowsEl = h('div', { class: 'c3-bars' });
  const condEl = h('div', { class: 'c3-conds' });
  const nm = id => byId[id].name;
  const tracks = {};
  function draw() {
    const all = barVals(p, v);
    rowsEl.innerHTML = '';
    p.bars.forEach(b => {
      const isFree = free.includes(b.id), n = all[b.id], L = later(b.id);
      const track = h('div', { class: 'c3-btrack' + (isFree ? ' free' : ''), style: { width: p.max * u + 'px', '--u': u + 'px' } });
      track.style.setProperty('--u', u + 'px');
      const blks = h('div', { class: 'c3-blks' });
      const mk = (cls, col) => h('div', { class: 'c3-bk ' + cls, style: { width: (u - 2) + 'px', background: col } });
      if (b.link && b.link.times) { const base = all[b.link.to]; for (let g = 0; g < b.link.times; g++) for (let k = 0; k < base; k++) blks.append(mk(k === 0 && g > 0 ? 'gap' : '', b.col)); }
      else if (b.link) { const base = all[b.link.to]; for (let k = 0; k < base; k++) blks.append(mk('', b.col)); for (let k = 0; k < b.link.plus; k++) blks.append(mk('extra' + (k === 0 ? ' gap' : ''), b.col)); }
      else for (let k = 0; k < n; k++) blks.append(mk('', b.col));
      for (let k = 0; k < L; k++) blks.append(mk('later' + (k === 0 ? ' gap' : ''), b.col));
      track.append(blks);
      if (b.link && b.link.plus) track.append(h('div', { class: 'c3-xtag', style: { left: (all[b.link.to] * u + 6) + 'px' } }, `${b.link.plus} more`));
      if (b.link && b.link.times) track.append(h('div', { class: 'c3-xtag', style: { left: '2px' } }, `${b.link.times} times ${nm(b.link.to)}’s`));
      if (L) track.append(h('div', { class: 'c3-xtag', style: { left: (n * u + 6) + 'px', color: 'var(--ink2)' } }, `+${plural(L, 'year')}`));
      if (isFree) { track.append(h('div', { class: 'c3-handle', style: { left: (n * u + (n ? 0 : 4)) + 'px' } })); hookTrack(track, b.id); }
      if (isFree && ghosts) track.append(h('div', { class: 'c3-ans', style: { left: p.ans[b.id] * u + 'px' } }));
      tracks[b.id] = track;
      const minus = isFree ? h('button', { class: 'btn alt c3-bbtn', onclick: () => set(b.id, v[b.id] - 1), 'aria-label': 'One less for ' + b.name }, '−') : h('span', { style: { width: '40px' } });
      const plus = isFree ? h('button', { class: 'btn alt c3-bbtn', onclick: () => set(b.id, v[b.id] + 1), 'aria-label': 'One more for ' + b.name }, '+') : h('span', { style: { width: '40px' } });
      rowsEl.append(h('div', { class: 'c3-brow' }, h('div', { class: 'c3-bname' }, h('span', { class: 'e' }, b.e), b.name), minus, track, plus, h('div', { class: 'c3-bval' }, b.unit === 'yr' ? `${n}` : String(n))));
    });
    condEl.innerHTML = '';
    p.conds.forEach(c => {
      const ok = condOK(c, all);
      condEl.append(h('div', { class: 'c3-cond' + (ok ? ' ok' : '') }, h('span', { class: 'ic' }, ok ? '✅' : '⬜'), h('span', { html: c.text }), h('span', { class: 'now', html: nowTxt(c, all) })));
    });
  }
  function nowTxt(c, a) {
    if (c.t === 'sum') return `now: ${c.of.map(i => a[i]).join(' + ')} = ${sumOf(c.of.map(i => a[i]))}`;
    if (c.t === 'more') { const d = a[c.a] - a[c.b]; return d === 0 ? 'now: the same' : `now: ${Math.abs(d)} ${d > 0 ? 'more' : 'fewer'}`; }
    if (c.t === 'times') return `now: ${c.k} × ${a[c.b]} = ${c.k * a[c.b]}, ${nm(c.a)} has ${a[c.a]}`;
    if (c.t === 'give') return a[c.from] < c.n ? `${nm(c.from)} has fewer than ${c.n} to give` : `after: ${nm(c.from)} ${a[c.from] - c.n}, ${nm(c.to)} ${a[c.to] + c.n}`;
    if (c.t === 'sumLater') return `then: ${c.of.map(i => a[i] + c.years).join(' + ')} = ${sumOf(c.of.map(i => a[i] + c.years))}`;
    if (c.t === 'timesLater') return `then: ${nm(c.a)} ${a[c.a] + a[c.y]}, ${nm(c.b)} ${a[c.b] + a[c.y]} (${c.k} × ${a[c.b] + a[c.y]} = ${c.k * (a[c.b] + a[c.y])})`;
    return '';
  }
  function set(id, n) {
    if (api.done()) return;
    n = Math.max(0, Math.min(byId[id].max || p.max, n));
    const all = barVals(p, { ...v, [id]: n }); if (Math.max(...p.bars.map(b => all[b.id] + (b.later ? (typeof b.later === 'number' ? b.later : all[b.later]) : 0))) > p.max) return;
    if (v[id] === n) return;
    v[id] = n; snd.pop(); draw(); check();
  }
  let checkT = null;
  function check() {
    clearTimeout(checkT);
    checkT = setTimeout(() => {
      if (api.done()) return;
      const all = barVals(p, v);
      if (free.every(id => v[id] > 0) && p.conds.every(c => condOK(c, all))) { snd.good(); rowsEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }], { duration: 500 }); winLater(api, 600); }
    }, 350);
  }
  function hookTrack(track, id) {
    track.addEventListener('pointerdown', e => {
      if (e.button !== 0 || api.done()) return; e.preventDefault();
      const at = ev => { const r = tracks[id].getBoundingClientRect(); set(id, Math.round((ev.clientX - r.left) / u)); };
      at(e);
      const mv = ev => at(ev);
      const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    });
  }
  st.append(rowsEl, condEl, h('div', { class: 'note' }, free.length > 1 ? 'Drag the bars (or use − and +) until every line has a tick.' : 'Drag the bar (or use − and +) until every line has a tick.'));
  draw();
  return {
    hint(l) { if (l > (p.hints || []).length) { ghosts = true; draw(); } },
    async solve() {
      ghosts = true;
      for (const id of free) { while (!api.done() && v[id] !== p.ans[id]) { v[id] += v[id] < p.ans[id] ? 1 : -1; snd.pop(); draw(); await sleep(70); } }
      check();
    },
  };
};

/* ================================================================ content */
const CH3 = [];
/* ---------------------------------------------------------------- 1 */
CH3.push({ ch: 3, id: 'duel', name: 'Duel Plaza', emoji: '♟️', creature: '🦉', prize: '🦄', prizeName: 'unicorn', concept: 'Winning strategy games',
  teaches: 'Two-player games, one step on from the fish-eating game in Chapter 1: finding the magic positions by working backwards (also when some spots are forbidden), choosing the one winning move, the upside-down rule where the last one loses, and the copycat (symmetry) strategy with two rows or one long line.',
  puzzles: [
  { type: 'duel', look: 'race', T: 10, max: 2,
    task: 'A race to the crown! Take turns to jump the golden pearl 1 or 2 stones forward. Whoever lands on the crown (stone 10) wins. You go first.',
    hints: ['Which stone would you like to land on just before the end? From there Finn can’t reach 10, but after his jump you can.', 'Stone 7 is great: Finn can only reach 8 or 9, then you jump to 10. The great stone before 7 is 4. And before 4?'],
    walk: 'Jump to 1. Then after each of Finn’s jumps, jump to 4, then 7, then 10.',
    explain: 'It is the fish game from Chapter 1 in disguise! The great stones are 3 apart: 10, 7, 4, 1. You find them by working backwards from the end.' },
  { type: 'duel', look: 'race', mode: 'mark', T: 11, max: 2,
    task: 'A race to stone 11, with jumps of 1 or 2. Before you play, find all the <b>magic stones</b> and put a star on each one.',
    hints: ['Work backwards. From which stone can Finn not reach the crown, but whatever he does, you can?', 'From 8, Finn can only jump to 9 or 10, and from there you reach the crown. So 8 is magic. Keep going back.'],
    walk: 'The magic stones are 2, 5, 8 and the crown at 11. They are 3 apart.',
    explain: 'Mathematicians find magic positions by working backwards from the end. Here they are 3 apart, because a jump is 1 or 2, and 1 + 2 = 3.' },
  { type: 'duel', mode: 'move', piles: [8], max: 2,
    task: 'Finn left you 8 pearls. Take 1 or 2, and whoever takes the last pearl wins. Only one move is sure to win. Which one?',
    hints: ['Which numbers are traps for Finn? Think of the 3 times table.', 'The trap closest to 8 is 6.'],
    walk: 'Take 2, so Finn has 6. Six is a trap number.',
    explain: 'From 8, take 2 and leave 6. Whatever Finn does from 6, you can leave him 3 next, and then 0.' },
  { type: 'duel', look: 'race', T: 15, max: 3,
    task: 'Race to stone 15. This time each jump is 1, 2 or 3 stones. You go first.',
    hints: ['With jumps of 1, 2 or 3, how far apart are the magic stones?', 'The magic stones are 4 apart: 15, 11, 7, 3.'],
    walk: 'Jump to 3. Then always jump to the next magic stone: 7, then 11, then 15.',
    explain: 'With jumps of 1, 2 or 3, the magic stones are 4 apart, because whatever Finn jumps, you can make it up to 4.' },
  { type: 'duel', look: 'race', mode: 'mark', T: 12, max: 2, holes: [6],
    task: 'Stone 6 is a whirlpool 🌀: nobody can land on it. Jumps are 1 or 2. Find the magic stones now!',
    hints: ['Start at the crown and work backwards, just like before. Is 9 still magic?', 'From 5, Finn can’t land on 6, so he has to jump to 7. Check every stone again near the whirlpool.'],
    walk: 'The magic stones are 12, 9, 5 and 2. Near the whirlpool the gap changes from 3 to 4.',
    explain: 'A whirlpool changes the pattern, but working backwards one stone at a time always works, even when there is no simple rule.' },
  { type: 'duel', look: 'race', T: 12, max: 2, holes: [5, 9],
    task: 'Two whirlpools, on stones 5 and 9! Jump 1 or 2, never onto a whirlpool. Reach the crown (12) first. You go first.',
    hints: ['Work backwards from 12, and remember that nobody can land on 5 or 9.', 'The magic stones are 12, 8, 4 and 1.'],
    walk: 'Jump to 1. Then get to 4, then 8, then the crown.',
    explain: 'Each new rule needs a new map of magic stones, but the way to find them stays the same: start at the end.' },
  { type: 'duel', piles: [8], max: 2, misere: true, rule: '🙃 Upside-down rule: whoever takes the <b>last</b> pearl <b>loses</b>!',
    task: 'Upside-down game! Take 1 or 2 pearls, but this time whoever takes the last pearl loses. 8 pearls, and you go first.',
    hints: ['You want Finn to be stuck with the very last pearl. So 1 is the trap now.', 'The traps are 1, 4, 7: always one more than 0, 3, 6. Leave Finn 7.'],
    walk: 'Take 1, leaving 7. Then leave Finn 4, and then leave him 1.',
    explain: 'When the last pearl loses, you want to leave 1 at the end. So all the traps move up by one: 1, 4, 7, 10…' },
  { type: 'duel', piles: [3, 5], max: 99,
    task: 'Two rows of pearls. On your turn take as many as you like, but only from <b>one</b> row. Whoever takes the last pearl wins. You go first.',
    hints: ['If both rows were the same, could you copy everything Finn does in the other row?', 'Take 2 from the row of 5, so both rows have 3. Then copy Finn: if he takes some from one row, take the same from the other row.'],
    walk: 'Take 2 from row 2, so both rows have 3. Then copy each of Finn’s moves in the other row.',
    explain: 'The copycat trick! When the two rows are equal, copy each move in the other row. Finn can never take the last pearl, because you always have a matching move.' },
  { type: 'duel', look: 'line', n: 9,
    task: 'The master game: 9 pearls in a line. On your turn take 1 pearl, or 2 pearls that are side by side, from anywhere. Whoever takes the last pearl wins. You go first.',
    hints: ['Remember the copycat trick with two equal rows. Can you make two equal rows out of one line?', 'Take the middle pearl. Then there are two groups of 4. Whatever Finn takes from one group, take the same from the other group.'],
    walk: 'Take the middle pearl (the 5th). Then copy Finn: when he takes pearls from one side, take the matching pearls from the other side.',
    explain: 'Making the game symmetric (the same on both sides) and then copying is a famous olympiad strategy. The first move creates the symmetry.' },
  ] });

/* ---------------------------------------------------------------- 2 */
CH3.push({ ch: 3, id: 'mirror', name: 'Mirror Palace', emoji: '🪞', creature: '🦚', prize: '🦓', prizeName: 'zebra', concept: 'Mirrors, turns and folding',
  teaches: 'Symmetry beyond Chapter 1: two-colour pictures, two mirror lines at once, a slanted (diagonal) mirror that swaps rows and columns, half-turn symmetry, and folding paper two or three times, where every fold doubles the holes.',
  puzzles: [
  { type: 'mirror3', axis: 'v', pic: ['aa....aa', 'aaa..aaa', '.aabbaa.', '..abba..', '.aa..aa.', 'aa....aa'],
    task: 'Finish the butterfly so that both wings match. There are two colours: pick one, then paint.',
    hints: ['Each square on the right is the mirror twin of a square on the left, in the same colour.', 'The yellow squares are right next to the mirror, so their twins are right next to it too.'],
    walk: 'Row by row: copy each square from the left onto the right, the same distance from the mirror and in the same colour.',
    explain: 'Butterflies, faces and many leaves are (almost) symmetric. The mirror twin has the same colour and the same distance from the line.' },
  { type: 'mirror3', axis: 'h', pic: ['...c...', '..ccc..', '.ccccc.', '.k.k.k.', '.k.k.k.', '.ccccc.', '..ccc..', '...c...'],
    task: 'The temple stands at the edge of a still pool, so you see it upside down in the water. Paint the reflection.',
    hints: ['The row just above the water has its twin just below it.', 'The roof is at the top, so in the reflection it is at the bottom.'],
    walk: 'The row just above the line is copied just below it, the next row up goes to the next row down, and so on.',
    explain: 'With a flat mirror, top and bottom swap, but left and right stay the same, like a reflection in water.' },
  { type: 'punch', n: 4, folds: ['v'], holes: [[0, 1], [2, 0], [3, 1]],
    task: 'Finn folds the paper in half and punches 3 holes. Where are the holes when he opens it? Click to mark them all.',
    hints: ['How many holes will there be? Each punch goes through 2 layers.', 'Copy each hole across the fold line, the same distance from it.'],
    walk: '6 holes: the 3 on the left half and their 3 mirror twins on the right half.',
    explain: 'With one fold, every punch makes a pair of holes. 3 punches make 6 holes.' },
  { type: 'mirror3', axis: 'vh', pic: ['d.aa.d', '.daad.', 'aabbaa', 'aabbaa', '.daad.', 'd.aa.d'],
    task: 'A floor tile with <b>two</b> mirrors! Only one corner is painted. Paint the other three corners.',
    hints: ['First mirror the top-left corner across the up-and-down mirror. Then mirror the whole top across the flat mirror.', 'Each square has 3 twins, one in every other corner.'],
    walk: 'Top right: copy the top-left corner, mirrored. Then the bottom half: copy the top half, upside down.',
    explain: 'With two mirror lines, one quarter of the picture decides everything. Snowflakes have even more mirror lines!' },
  { type: 'punch', n: 4, folds: ['h', 'v'], holes: [[0, 1], [1, 0]],
    task: 'This time Finn folds the paper up, then in half sideways, and punches 2 holes. Mark every hole.',
    hints: ['Two folds make 4 layers, and there are 2 punches. How many holes is that?', 'Unfold one fold at a time, starting with the last one. Each time, every hole gets a twin.'],
    walk: '8 holes. Undo the sideways fold: 4 holes in the top half. Undo the first fold: their twins in the bottom half.',
    explain: '2 folds make 4 layers, so 2 punches make 2 × 4 = 8 holes. Unfolding backwards, one fold at a time, finds them all.' },
  { type: 'mirror3', axis: 'd', pic: ['ca..b', 'aca.b', '.ac..', '...ca', 'bb.ac'],
    task: 'A slanted mirror, from corner to corner! Paint the squares below the mirror.',
    hints: ['The top row turns into the left column: read the top row from left to right, and paint the left column from top to bottom.', 'Row 1, column 5 has its twin at row 5, column 1. Swap the row and the column.'],
    walk: 'Copy the top row into the left column, the second row into the second column, and so on.',
    explain: 'A slanted mirror swaps rows and columns. It is called a diagonal mirror.' },
  { type: 'punch', n: 4, folds: ['v', 'h', 'v'], holes: [[1, 0]],
    task: 'Three folds! The paper ends up as a thin strip, and Finn punches one hole near the bottom. Mark every hole.',
    hints: ['Three folds make 2 × 2 × 2 = 8 layers.', 'Undo the last fold first: copy the hole across that fold line. Then undo the fold before that, and then the first one.'],
    walk: '8 holes: the two middle rows are full of holes. Unfold one step at a time: 2 holes, then 4, then 8.',
    explain: 'Three folds make 8 layers, so one punch makes 8 holes. Unfolding one step at a time, each step doubles the holes.' },
  { type: 'mirror3', axis: 'r', pic: ['aa....', 'a..bb.', 'a..b..', '..b..a', '.bb..a', '....aa'],
    task: 'No mirror this time: this tile looks <b>the same after half a turn</b> (upside down). Paint the bottom half.',
    hints: ['Half a turn sends the top-left corner to the bottom-right corner.', 'The top row, read from left to right, becomes the bottom row read from right to left.'],
    walk: 'Copy the top row backwards into the bottom row, the second row backwards into the second row from the bottom, and the third row backwards into the fourth row.',
    explain: 'This is turning symmetry: the picture matches itself after half a turn. Playing cards and the letters S, N and Z have it.' },
  { type: 'mirror3', axis: 'd', pic: ['ca.b..', 'ac.ba.', '..c.ab', 'bb.c..', '.aa.cd', '..b.dc'],
    task: 'The master mirror: a bigger slanted mirror with four colours. Paint everything below it.',
    hints: ['The twin of a square is found by swapping its row and its column. Row 1, column 4 has its twin at row 4, column 1.', 'Do it one row at a time: the top row becomes the left column, the second row becomes the second column, and so on.'],
    walk: 'Copy the top row (going right) into the left column (going down). Copy the second row into the second column, and so on.',
    explain: 'A slanted mirror swaps rows and columns. Turning rows into columns like this is called flipping across the diagonal.' },
  ] });

/* ---------------------------------------------------------------- 3 */
CH3.push({ ch: 3, id: 'paint', name: 'Painted Temple', emoji: '🎨', creature: '🐝', prize: '🐯', prizeName: 'tiger', concept: 'Colouring maps',
  teaches: 'Colouring maps so that neighbours differ: using a fixed number of colours, finding the fewest colours a map needs (2 for stripes and rings, 3 for an even ring around a centre, 4 for an odd ring around a centre), and reasoning forward from tiles that are already painted.',
  puzzles: [
  { type: 'colour', map: ['AAAAA', 'ABBBA', 'ABCBA', 'ABBBA', 'AAAAA'], pots: 2,
    task: 'Paint the temple floor with 2 paint pots. Tiles that touch along a side must be different colours.',
    hints: ['The outside ring touches the middle ring. Does the outside ring touch the centre?', 'The outside and the centre do not touch, so they can be the same colour.'],
    walk: 'Outside ring red, middle ring yellow, centre red.',
    explain: 'Tiles that do not touch can share a colour. Rings inside rings only ever need 2 colours.' },
  { type: 'colour', map: ['AAAB', 'ACCB', 'DCCB', 'DDEE'], pots: 3,
    task: 'Now you have 3 pots. Paint every tile so that touching tiles are different.',
    hints: ['The big middle tile touches all the others. Paint it first.', 'The 4 tiles around the middle can take turns with the 2 other colours.'],
    walk: 'Middle tile red. Then the four outside tiles go yellow, blue, yellow, blue around the edge.',
    explain: 'Start with the tile that has the most neighbours. It is the hardest one to fit in.' },
  { type: 'colour', mode: 'fewest', map: ['AABBCC', 'ABBCCD', 'BBCCDD', 'BCCDDE', 'CCDDEE'], pots: 4,
    task: 'Paint these slanted stripes using as <b>few</b> colours as you can.',
    hints: ['Each stripe touches only the stripe before it and the stripe after it.', 'Could you take turns with just two colours, like a zebra?'],
    walk: 'Red, yellow, red, yellow, red. Only 2 colours!',
    explain: 'When every tile touches only the one before and the one after, two colours taking turns are enough.' },
  { type: 'colour', map: ['AABB', 'FXXC', 'FXXC', 'EEDD'], pots: 3,
    task: 'A centre tile with a ring of 6 tiles around it. Paint it with 3 pots.',
    hints: ['The centre touches every tile in the ring, so the ring can’t use the centre’s colour.', 'That leaves 2 colours for the ring. Take turns all the way round: does it fit?'],
    walk: 'Centre red. Ring: yellow, blue, yellow, blue, yellow, blue. Six is even, so the colours meet up nicely.',
    explain: 'A ring with an even number of tiles can take turns with 2 colours. Add a centre, and you need a third colour.' },
  { type: 'colour', mode: 'fewest', map: ['AABB', 'EXXB', 'EXXC', 'EDDC'], pots: 5,
    task: 'Now the ring around the centre has only 5 tiles. What is the fewest number of colours you need? Paint it!',
    hints: ['Try taking turns round the ring with 2 colours. What happens at the end?', 'With 5 tiles, the first and the last tile in the ring touch and would get the same colour. So the ring needs 3 colours, plus 1 for the centre.'],
    walk: 'Centre red. Ring: yellow, blue, yellow, blue, green. That is 4 colours, and 3 is impossible.',
    explain: 'An odd ring needs 3 colours. With a centre touching all of it, the map needs 4. Mathematicians proved that 4 colours are always enough for any flat map!' },
  { type: 'colour', map: ['AAABB', 'ACCDB', 'ECCDB', 'EEFDD', 'GGFFF'], pots: 3, fixed: { A: 0, D: 1 },
    task: 'Two tiles were painted long ago (they have pins 📌). Paint the rest with the 3 pots.',
    hints: ['Look for a tile that touches both pinned tiles. It has only one colour left.', 'The big tile in the middle-left touches the red tile and the yellow tile, so it must be blue.'],
    walk: 'The middle-left tile is blue. Then each next tile has only one colour that fits: work outwards from there.',
    explain: 'When a tile touches two colours already, the third colour is forced. One forced tile leads to the next, like dominoes falling.' },
  { type: 'colour', map: ['AABBC', 'ADDBC', 'EDFFC', 'EGGFH', 'EEGHH'], pots: 4,
    task: 'A trickier floor. You have 4 pots. Paint every tile.',
    hints: ['Find tiles that all touch each other. They each need a different colour.', 'Start with the tile with the most neighbours, then go to its neighbours.'],
    walk: 'Paint the middle tiles first, each touching group with different colours, then fill in the edges.',
    explain: 'Some groups of tiles all touch each other, and each needs its own colour. Four colours are always enough.' },
  { type: 'colour', mode: 'fewest', map: ['AABCC', 'DABBC', 'DEEFC', 'GGEFF', 'GHHHF'], pots: 4,
    task: 'Paint this floor with as few colours as you can. It looks like it needs lots!',
    hints: ['Find three tiles that all touch each other. You need at least 3 colours. Can 3 be enough?', 'Paint the big middle tile first. Then each neighbour gets one of the other two colours, taking turns round it.'],
    walk: '3 colours are enough. Paint the middle tile red, then go round it with yellow and blue, and finish the corners.',
    explain: 'Count first: three tiles that all touch each other prove you need 3 colours. Then find a way to paint with exactly 3.' },
  { type: 'colour', map: ['AABBBC', 'ADDEEC', 'FDGGEC', 'FHGGIJ', 'FHHIIJ'], pots: 3, fixed: { A: 0, J: 1 },
    task: 'The master floor: only 3 pots, and two tiles are pinned at opposite corners. There is just one way to finish it.',
    hints: ['Start from a pinned tile and look at its neighbours. Which tiles touch each other?', 'Find a tile that touches two tiles you already know. Its colour is forced. Keep going from corner to corner.'],
    walk: 'Work from the red corner: the tiles next to it must be yellow and blue, in the only way that fits. Then each next tile is forced, all the way to the yellow corner.',
    explain: 'Hard puzzles become easy when you always look for the tile with only one choice left.' },
  ] });

/* ---------------------------------------------------------------- 4 */
const SEA = ['🐙', '🦀', '🐠', '🐢'];
CH3.push({ ch: 3, id: 'grid', name: 'Statue Square', emoji: '🗿', creature: '🐭', prize: '🐼', prizeName: 'panda', concept: 'Logic grids',
  teaches: 'Mini logic grids: 4 × 4 sudoku with sea creatures (each row, column and box has each creature once), finding the square with only one possibility, and sum cages (KenKen) where the numbers in a cage add up to a target.',
  puzzles: [
  { type: 'latin', n: 4, box: [2, 2], syms: SEA, givens: ['1.34', '34.2', '21.3', '.321'],
    task: 'Each row, each column and each thick box must have all four creatures. Fill in the empty squares.',
    hints: ['Look at the top row. Which creature is missing?', 'Each row has only one empty square. Find the creature that row is missing.'],
    walk: 'Top row: the crab is missing. Second row: the octopus. Third row: the turtle. Bottom row: the turtle.',
    explain: 'When only one square is empty, the missing one must go there. That is the first sudoku trick.' },
  { type: 'latin', n: 4, box: [2, 2], syms: SEA, givens: ['1..4', '.4.2', '2.4.', '4..1'],
    task: 'More empty squares now. Rows, columns and boxes each need all four creatures.',
    hints: ['Find a square where three different creatures already sit in its row, column or box.', 'The top-left box already has an octopus and a turtle. Its row has a turtle too…'],
    walk: 'Fill the squares that have only one choice first: look along each row, down each column and in each box. Each one you fill makes the next one easier.',
    explain: 'Look for the square with just one possible creature. Filling it gives clues for the others.' },
  { type: 'latin', n: 4, box: [2, 2], syms: SEA, givens: ['.2..', '3..2', '..4.', '4..1'],
    task: 'Only 6 creatures to start with. Can you fill the whole grid?',
    hints: ['Look at one creature at a time. Where can the crab go in each box?', 'The top-left box still needs an octopus and a turtle. The left column already has a turtle at the bottom, so the top-left corner must be the octopus.'],
    walk: 'Go creature by creature. Each box needs one of each, but a creature can’t go in a row or column that already has it.',
    explain: 'Two ways to think: “What can go in this square?” and “Where can this creature go in this box?” Good solvers switch between them.' },
  { type: 'latin', n: 3, cages: [{ c: [[0, 0], [1, 0]], s: 3 }, { c: [[0, 1], [0, 2]], s: 5 }, { c: [[1, 1], [2, 1]], s: 4 }, { c: [[1, 2], [2, 2]], s: 3 }, { c: [[2, 0]], s: 3 }],
    task: 'Sum cages! Use 1, 2 and 3. Each row and column has each number once, and the numbers in a cage add up to its small red number.',
    hints: ['A cage with just one square is easy: the number is written in it.', 'Two squares that add up to 5 must be 2 and 3. Two squares that add up to 3 must be 1 and 2.'],
    walk: 'Bottom-left is 3. The left column cage (3) is 1 then 2. Top row: 1, then 2 and 3. Keep going.',
    explain: 'In sum cages, small and big targets help most: 3 can only be 1 + 2, and 5 can only be 2 + 3.' },
  { type: 'latin', n: 3, cages: [{ c: [[0, 0], [0, 1], [1, 0]], s: 5 }, { c: [[0, 2], [1, 2]], s: 4 }, { c: [[1, 1], [2, 1], [2, 0]], s: 7 }, { c: [[2, 2]], s: 2 }],
    task: 'Bigger cages now, still with 1, 2 and 3.',
    hints: ['Start with the single square. Then look at the cage of 4 in the right column.', 'The right column has 1, 2 and 3. The bottom one is 2, so the two above add up to 4: they are 1 and 3.'],
    walk: 'Bottom-right is 2. The right column’s top two are 1 and 3. Then the cages of 5 and 7 tell you the rest.',
    explain: 'Every row of 1, 2, 3 adds up to 6. Knowing totals like that helps with big cages.' },
  { type: 'latin', n: 4, box: [2, 2], syms: SEA, givens: ['1...', '.4..', '..43', '..2.'],
    task: 'Only 5 creatures to start with. Think carefully!',
    hints: ['The bottom-right box has a turtle, a fish and a crab. Which creature is missing?', 'The third row needs an octopus and a crab. The left column already has an octopus at the top, so which one goes on the left?'],
    walk: 'Fill the bottom-right box first, then the third row, then use the columns to finish.',
    explain: 'With few clues, look for places where two rules meet: a row and a box, or a column and a box.' },
  { type: 'latin', n: 4, cages: [{ c: [[0, 0], [0, 1]], s: 3 }, { c: [[0, 2], [0, 3]], s: 7 }, { c: [[1, 0], [2, 0]], s: 5 }, { c: [[1, 1], [1, 2]], s: 7 }, { c: [[1, 3], [2, 3]], s: 3 }, { c: [[2, 1], [3, 1]], s: 5 }, { c: [[2, 2], [3, 2]], s: 3 }, { c: [[3, 0]], s: 4 }, { c: [[3, 3]], s: 3 }],
    task: 'A 4 × 4 sum cage puzzle, with the numbers 1 to 4.',
    hints: ['Cages of 3 must be 1 and 2. Cages of 7 must be 3 and 4.', 'The top row: the cage of 3 has 1 and 2, the cage of 7 has 3 and 4. The bottom row starts with 4 and ends with 3.'],
    walk: 'Fill the single squares, then the cages of 3 and 7, which have only two choices each. The columns tell you which way round.',
    explain: 'With 1 to 4, a two-square cage of 3 is 1 + 2 and a cage of 7 is 3 + 4. A cage of 5 could be 1 + 4 or 2 + 3, so it needs more clues.' },
  { type: 'latin', n: 4, box: [2, 2], syms: SEA, givens: ['1...', '..1.', '.2..', '...4'],
    task: 'The hardest sudoku: just 4 creatures to start with!',
    hints: ['Where can the octopus go in the bottom-left and bottom-right boxes? The octopus rows and columns are already used up a lot.', 'There are octopuses in row 1 and row 2, and in columns 1 and 3. So the bottom-left box’s octopus must be in column 2, and the bottom-right’s in column 4.'],
    walk: 'Place all the octopuses first (one in each row, column and box). Then the crabs, then the rest.',
    explain: 'With very few clues, placing one creature everywhere first (here the octopus) cracks the puzzle open.' },
  { type: 'latin', n: 4, cages: [{ c: [[0, 0], [1, 0], [1, 1]], s: 7 }, { c: [[0, 1], [0, 2], [0, 3]], s: 9 }, { c: [[1, 2], [2, 2]], s: 7 }, { c: [[1, 3], [2, 3]], s: 3 }, { c: [[2, 0], [3, 0]], s: 5 }, { c: [[2, 1], [3, 1]], s: 5 }, { c: [[3, 2], [3, 3]], s: 4 }],
    task: 'The master cage puzzle. Numbers 1 to 4, no repeats in a row or column, and every cage adds up right.',
    hints: ['Each row adds up to 1 + 2 + 3 + 4 = 10. The top row has a cage of 9 in three squares, so the top-left square is 10 − 9 = 1.', 'Cage of 3 is 1 and 2. Cage of 7 (two squares) is 3 and 4. The bottom row’s cage of 4 is 1 and 3.'],
    walk: 'Top-left is 1. Then use the cages of 3, 4 and 7, which have only two numbers each, and the columns to decide the order.',
    explain: 'Every row and column adds up to 10. Comparing a cage with a whole row (10 − 9 = 1) is a real olympiad trick.' },
  ] });

/* ---------------------------------------------------------------- 5 */
CH3.push({ ch: 3, id: 'tiles', name: 'Tile Hall', emoji: '🧱', creature: '🦔', prize: '🐘', prizeName: 'elephant', concept: 'Tiling, area and perimeter',
  teaches: 'Covering a shape exactly with pieces (turning and flipping them, and filling awkward corners first), area as the number of squares, perimeter as the length of the fence, and that the same area can have different perimeters (and the same fence can hold different areas, the most for a square).',
  puzzles: [
  { type: 'tile', shape: ['####', '####'], pieces: [['##'], ['##'], ['##'], ['##']],
    task: 'Cover the floor with the 4 tiles. No gaps and no overlaps. Click a tile to turn it.',
    hints: ['Each tile covers 2 squares. The floor has 8 squares, so all 4 tiles fit exactly.', 'You can lay them all flat, or stand them all up, or mix.'],
    walk: 'Put two tiles in the top row and two in the bottom row.',
    explain: 'Tiling means covering a shape with no gaps and no overlaps. The area of the floor is 8 squares.' },
  { type: 'tile', shape: ['####', '####', '####'], pieces: [['##', '#.'], ['##', '#.'], ['##', '#.'], ['##', '#.']],
    task: 'Now the tiles are L-shaped. Cover the whole floor with the 4 L tiles.',
    hints: ['Start in a corner. A corner square can only be covered in a few ways.', 'Two L tiles fit together into a 2 × 3 block. Can you make two such blocks?'],
    walk: 'Fit two L tiles together into a 3 × 2 block on the left, and two more on the right.',
    explain: 'Fill corners first: they have the fewest choices. And two L shapes make a rectangle, a handy trick.' },
  { type: 'garden', w: 7, h: 5, area: 6, perim: 10, ex: ['###', '###'],
    task: 'Build a seaweed garden with an area of 6 squares and a fence that is 10 sticks long.',
    hints: ['Plant 6 squares in a row first and count the fence. Is it too long?', 'Squash the garden together to make the fence shorter. Try 2 rows of 3.'],
    walk: 'Plant a rectangle 3 squares wide and 2 squares tall. The fence is 3 + 2 + 3 + 2 = 10.',
    explain: 'Area counts the squares inside. Perimeter counts the fence around the outside. The same 6 squares can need a short or a long fence.' },
  { type: 'garden', w: 8, h: 5, area: 6, perim: 14, ex: ['######'],
    task: 'Now build a garden with an area of 6 squares and a fence of 14 sticks.',
    hints: ['A long fence needs a stretched-out shape, not a squashed one.', 'A straight line of 6 squares has a fence of 6 + 1 + 6 + 1. Other wiggly shapes work too!'],
    walk: 'Plant 6 squares in one long line. The fence is 6 + 1 + 6 + 1 = 14.',
    explain: 'Same area, different perimeter! Every time two squares share a side, the fence gets 2 sticks shorter.' },
  { type: 'tile', shape: ['####', '####', '####', '####'], pieces: [['###', '.#.'], ['###', '.#.'], ['###', '.#.'], ['###', '.#.']],
    task: 'Cover this square floor with the 4 T-shaped tiles.',
    hints: ['Look at a corner square. A T tile can cover it only with the end of its bar.', 'Put a T along each edge, each one turned a quarter turn from the last, like a pinwheel.'],
    walk: 'Place a T along the top edge with its stem pointing down, then go around: each next T is turned a quarter turn, and they lock together.',
    explain: 'Corners are the tricky places. Once each corner is covered, the pieces lock together like a pinwheel.' },
  { type: 'garden', w: 6, h: 6, max: true, area: 9, perim: 12, ex: ['###', '###', '###'],
    task: 'Finn has a fence of exactly 12 sticks. Build the garden with the <b>biggest</b> area he can fence in.',
    hints: ['Try a long thin garden with a fence of 12. How many squares are inside?', 'Long thin shapes waste fence. The more square-like the garden, the more fits inside.'],
    walk: 'A 3 × 3 square: the fence is 3 + 3 + 3 + 3 = 12, and it holds 9 squares. A 2 × 4 holds only 8, and a 1 × 5 only 5.',
    explain: 'For the same fence length, a square holds the most. That is why many animals curl up into round shapes to keep warm.' },
  { type: 'tile', shape: ['#....', '##...', '###..', '####.', '#####'], pieces: [['###'], ['##', '#.'], ['##', '#.'], ['##', '#.'], ['##', '#.']],
    task: 'Cover the staircase with one straight tile and four L tiles.',
    hints: ['Where can the straight tile go? Try the tall left edge or the bottom row.', 'Then fill the steps from the top down. Each step corner needs an L.'],
    walk: 'One way: stand the straight tile at the bottom of the left edge. An L fills the top two steps, and the other three L tiles fill the rest, step by step.',
    explain: 'When pieces are different, place the special one first. Then the others have fewer choices.' },
  { type: 'tile', shape: ['#####', '#####', '##.##', '#####', '#####'], pieces: [['###', '###'], ['###', '###'], ['###', '###'], ['###', '###']],
    task: 'There is a hole in the middle of this floor. Cover all the rest with four 2 × 3 tiles.',
    hints: ['4 tiles × 6 squares = 24, and the floor is 25 squares minus the hole. So it can work!', 'Put the tiles around the hole like the blades of a windmill.'],
    walk: 'Top-left: a tile lying flat, 3 wide and 2 tall. Top-right: a tile standing up. Bottom-right: lying flat. Bottom-left: standing up. They spin round the hole.',
    explain: 'Check the area first: 4 × 6 = 24 = 25 − 1. Then the windmill (pinwheel) pattern leaves exactly the middle square empty.' },
  { type: 'tile', shape: ['#####', '#####', '#####', '#####'], pieces: [['.##', '##.', '.#.'], ['####', '#...'], ['###', '##.'], ['#.#', '###']],
    task: 'The master floor: four different pieces of 5 squares each. Fit them all into the rectangle. Use ⇋ flip if you need to.',
    hints: ['The odd-looking piece (like a twisted plus) is the hardest. Find a spot for it first, against an edge.', 'The U piece likes a long edge. The long L fits along another edge.'],
    walk: 'The long L goes along the top edge and down the right end. The U sits in the bottom-left corner, the twisted piece fits just above it, and the P fills the bottom right.',
    explain: 'Pieces of 5 squares are called pentominoes. There are 12 of them, and fitting them together is a famous puzzle. Big awkward pieces go first.' },
  ] });

/* ---------------------------------------------------------------- 6 */
const N_ = [300, 42], S_ = [300, 318];
const BANK = { rx: 285, ry: 38 };
CH3.push({ ch: 3, id: 'bridges', name: 'Bridge Town', emoji: '🌉', creature: '🦝', prize: '🦒', prizeName: 'giraffe', concept: 'Drawing without lifting, and bridges',
  teaches: 'Euler paths: tracing a figure without lifting the pen or going over a line twice. Counting lines at each dot shows the rule: with no odd dots start anywhere, with two odd dots start at one of them, with more than two it can’t be done (the famous bridges of Königsberg).',
  puzzles: [
  { type: 'trace', nodes: [[110, 180], [220, 80], [330, 180], [220, 280], [470, 90], [470, 270]], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [2, 4], [4, 5], [5, 2]], noCant: true,
    task: 'Help Finn draw this fish in one go: never lift the pen and never go over a line twice. Click a dot to start, then click the next dot.',
    hints: ['Start anywhere. When you get to the middle dot, you have a choice.', 'Go round the tail first, then come back and finish the body.'],
    walk: 'Start at the middle dot. Go round the tail and back, then go round the body and back to the middle.',
    explain: 'Every dot here has an even number of lines (2 or 4), so you can start anywhere and you even end where you started.' },
  { type: 'trace', nodes: [[200, 320], [400, 320], [400, 170], [200, 170], [300, 50]], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3], [3, 4], [4, 2]], noCant: true,
    task: 'Draw the little house with its cross in one go. Where you start matters!',
    hints: ['Try starting at the top of the roof. Do you get stuck?', 'Count the lines at each dot. Start at a dot with an odd number of lines: one of the bottom corners.'],
    walk: 'Start at the bottom left. One good path: bottom right, top left, roof, top right, bottom left, top left, top right, bottom right.',
    explain: 'The two bottom corners have 3 lines each (odd). A drawing like this must start at one odd dot and end at the other.' },
  { type: 'trace', mode: 'odd', nodes: [[100, 180], [240, 70], [240, 290], [380, 180], [510, 80], [510, 280]], edges: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 5], [1, 4, -60]],
    task: 'Be a detective: count the lines at each dot. Click every dot that has an <b>odd</b> number of lines (1, 3, 5…), then press Check.',
    hints: ['Point at one dot and count the lines that touch it.', 'Two of the dots have 3 lines. All the others have 2 or 4.'],
    walk: 'The bottom dot of the left bow has 3 lines, and the top-right dot has 3 lines. The others are even.',
    explain: 'Each line has two ends, so the number of odd dots is always even: 0, 2, 4…' },
  { type: 'trace', nodes: [[100, 180], [240, 70], [240, 290], [380, 180], [510, 80], [510, 280]], edges: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 5], [1, 4, -60]],
    task: 'Now draw the same picture in one go. Use what you found!',
    hints: ['Start at one of the two odd dots.', 'Start at the bottom middle dot. You will finish at the top-right dot.'],
    walk: 'Start at the bottom middle dot and go round the left triangle back to it. Then go to the right middle dot, up to the top dot, over the arch, back down to the right middle dot, round by the bottom right, and finish at the top right.',
    explain: 'Start at an odd dot and you finish at the other odd dot. Every time you pass through a dot you use 2 lines, so the in-between dots must be even.' },
  { type: 'trace', nodes: [[170, 60], [430, 60], [430, 300], [170, 300], [300, 180]], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 2], [1, 4], [4, 3]],
    task: 'Can Finn draw this envelope in one go? If you think it is impossible, press “🙅 It can’t be done”.',
    hints: ['Count the lines at each corner.', 'All four corners have 3 lines. How many odd dots can a one-go drawing have?'],
    walk: 'Four dots have an odd number of lines. A one-go drawing can have at most 2. So it can’t be done.',
    explain: 'Every odd dot must be the start or the end. A drawing has only one start and one end, so more than 2 odd dots makes it impossible.' },
  { type: 'trace', look: 'land', nodes: [N_, S_, [210, 180], [460, 180]],
    lands: [{ name: 'North shore', e: '🏘️', ...BANK }, { name: 'South shore', e: '🏘️', ...BANK }, { name: 'Temple Isle', e: '🏛️', rx: 85, ry: 50 }, { name: 'Tower Isle', e: '🗼', rx: 70, ry: 46 }],
    edges: [[0, 2, 0, [-150, 14], [-45, -30]], [0, 2, 0, [-60, 14], [30, -32]], [1, 2, 0, [-150, -14], [-45, 30]], [1, 2, 0, [-60, -14], [30, 32]], [0, 3, 0, [160, 14], [0, -30]], [1, 3, 0, [160, -14], [0, 30]], [2, 3, 0, [70, 0], [-55, 0]]],
    task: 'The old city has two islands and 7 bridges. Can Carl the crab take a walk that crosses every bridge exactly once? If not, press “🙅 It can’t be done”.',
    hints: ['Count the bridges on each piece of land.', 'Temple Isle has 5 bridges, and the other three lands have 3 each. That is 4 odd lands.'],
    walk: 'All four lands have an odd number of bridges. A walk can start at one odd land and end at another, but 4 is too many. It can’t be done.',
    explain: 'This is a real puzzle from the city of Königsberg, almost 300 years ago. The mathematician Euler solved it by counting bridges, and invented a new kind of maths.' },
  { type: 'trace', look: 'land', nodes: [N_, S_, [210, 180], [460, 180]],
    lands: [{ name: 'North shore', e: '🏘️', ...BANK }, { name: 'South shore', e: '🏘️', ...BANK }, { name: 'Temple Isle', e: '🏛️', rx: 85, ry: 50 }, { name: 'Tower Isle', e: '🗼', rx: 70, ry: 46 }],
    edges: [[0, 2, 0, [-150, 14], [-45, -30]], [0, 2, 0, [-60, 14], [30, -32]], [2, 3, 0, [70, 0], [-55, 0]], [3, 1, 0, [0, 30], [160, -14]], [1, 2, 0, [-100, -14], [-10, 34]], [0, 3, 0, [160, 14], [0, -30]]],
    task: 'A different city. Can Carl cross every bridge exactly once? Click a land to start, then click where to walk.',
    hints: ['Count the bridges on each land. Which lands have an odd number?', 'North shore and Tower Isle each have 3 bridges. Start on one of them.'],
    walk: 'Start on the North shore. Cross to Temple Isle, back to the North shore, to Tower Isle, to Temple Isle, to the South shore, and to Tower Isle.',
    explain: 'Exactly two odd lands: start on one and the walk ends on the other.' },
  { type: 'trace', mode: 'add', look: 'land', nodes: [N_, S_, [190, 180], [390, 180], [530, 180]],
    lands: [{ name: 'North shore', e: '🏘️', ...BANK }, { name: 'South shore', e: '🏘️', ...BANK }, { name: 'Temple Isle', e: '🏛️', rx: 75, ry: 48 }, { name: 'Tower Isle', e: '🗼', rx: 62, ry: 44 }, { name: 'Rock', e: '🪨', rx: 46, ry: 38 }],
    edges: [[0, 2, 0, [-170, 14], [-40, -30]], [0, 2, 0, [-90, 14], [30, -32]], [1, 2, 0, [-170, -14], [-40, 30]], [1, 2, 0, [-90, -14], [30, 32]], [2, 3, 0, [65, 0], [-50, 0]], [0, 3, 0, [90, 14], [0, -30]], [1, 3, 0, [90, -14], [0, 30]], [3, 4, -26, [45, -10], [-30, -10]], [3, 4, 26, [45, 10], [-30, 10]]],
    task: 'Carl can’t cross every bridge once in this city. You may build <b>one</b> new bridge. Build it so the walk works, then take the walk!',
    hints: ['Count the bridges on each land. Which lands are odd?', 'North shore, South shore, Temple Isle and Tower Isle are odd. Join two of them with the new bridge. Don’t use the Rock: it is even.'],
    walk: 'Build a bridge from the North shore to the South shore (or between any two odd lands). Then start on one of the two lands that are still odd.',
    explain: 'A new bridge changes two lands from odd to even. Four odd lands become two, and then the walk is possible.' },
  { type: 'trace', nodes: [[90, 160], [230, 160], [370, 160], [510, 160], [90, 320], [230, 320], [370, 320], [510, 320], [300, 40], [300, 240]],
    edges: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [0, 4], [1, 5], [2, 6], [3, 7], [1, 9], [9, 6], [2, 9], [9, 5], [8, 1], [8, 2]],
    task: 'The master drawing: the old city hall. Draw it in one go. Count first, then plan!',
    hints: ['Count the lines at every dot. Only two dots are odd.', 'The two top corners of the middle square each have 5 lines. Start at one of them and save the long way round for later.'],
    walk: 'Start at the top left of the middle square. A good order: go round the left square, through the middle cross, round the right square, and finish with the roof.',
    explain: 'Big drawings work the same way as small ones. Count the odd dots first: here there are two, so you start at one and finish at the other.' },
  ] });

/* ---------------------------------------------------------------- 7 */
CH3.push({ ch: 3, id: 'streets', name: 'Street Maze', emoji: '🏛️', creature: '🐿️', prize: '🦖', prizeName: 'T. rex', concept: 'Counting routes',
  teaches: 'Counting shortest routes on a street grid, beyond the small reef in Chapter 1: listing routes in order, writing the crossing numbers yourself (each crossing = the number on its left + the number below, like Pascal’s triangle), and handling blocked streets and missing crossings.',
  puzzles: [
  { type: 'routes', w: 3, h: 2, block: [[1, 1, 2, 1]],
    task: 'Finn swims to the 💎, only going right or up. A fallen column blocks one street. Find every route!',
    hints: ['Be organised: first find all the routes that start with a step right, then the ones that start with a step up.', 'There are 6 routes. Any route that would use the blocked street is not allowed.'],
    walk: 'Sort the routes by where Finn first goes up. There are 6 of them.',
    explain: 'Sorting routes by their first step means you never miss one or count one twice.' },
  { type: 'routes', mode: 'label', w: 3, h: 2,
    task: 'Now you write the numbers! At each crossing, write how many ways Finn can get there. Click a crossing and type its number.',
    hints: ['Along the bottom street and up the left street there is only 1 way to each crossing.', 'Finn reaches a crossing only from the left or from below. So add those two numbers.'],
    walk: 'Bottom row: 1 1 1 1. Middle row: 1 2 3 4. Top row: 1 3 6 10. The 💎 gets 10.',
    explain: 'Each crossing’s number is the number on its left plus the number below it. This is Pascal’s triangle, turned on its side.' },
  { type: 'routes', w: 3, h: 2, gone: [[1, 1]],
    task: 'The middle crossing has collapsed 🪨 and Finn can’t swim through it. Find every route now.',
    hints: ['Finn must go round the hole: either along the bottom first, or up the left side first.', 'There are 4 routes.'],
    walk: 'Two routes go along the bottom street first, and two go up the left street first. 4 routes.',
    explain: 'A missing crossing removes every route that went through it. 10 routes became 4.' },
  { type: 'routes', mode: 'label', w: 3, h: 3,
    task: 'Use the crossing-number trick on a bigger grid. How many routes go to the 💎?',
    hints: ['The edges are all 1s. Then each crossing is the one on its left plus the one below.', 'The middle crossings are 2, 3, 3, then 6, then 4, 10, 10, …'],
    walk: 'Row by row from the bottom: 1 1 1 1, then 1 2 3 4, then 1 3 6 10, then 1 4 10 20.',
    explain: 'Listing 20 routes by hand would be slow. The adding trick finds them all quickly.' },
  { type: 'routes', mode: 'label', w: 4, h: 2, block: [[2, 0, 2, 1]],
    task: 'A fallen column blocks a street. Write the numbers at the crossings to count the routes.',
    hints: ['If the street from below is blocked, only the number from the left comes in.', 'The crossing above the column just copies the number on its left.'],
    walk: 'Bottom row: 1 1 1 1 1. Middle row: 1 2, then 2 (only from the left, because the street from below is blocked), then 3 and 4. Top row: 1 3 5 8 12. The 💎 gets 12.',
    explain: 'Blocked streets bring in 0 ways. The adding rule still works: just leave out the blocked street.' },
  { type: 'routes', mode: 'label', w: 4, h: 3, block: [[2, 1, 2, 2]],
    task: 'Another fallen column, on a bigger grid. Count the routes to the 💎.',
    hints: ['Above the column, the crossing gets only the number from its left.', 'Work row by row from the bottom. The 💎 is in the top right.'],
    walk: 'Bottom row 1s, then 1 2 3 4 5. In the next row the crossing above the column gets only the number from its left. The 💎 gets 26.',
    explain: 'The adding trick works on any grid. Just be careful at the blocked streets.' },
  { type: 'routes', mode: 'label', w: 4, h: 4, gone: [[2, 2]],
    task: 'The crossing in the middle has collapsed! Finn can’t swim through it. How many routes are left?',
    hints: ['The collapsed crossing counts as 0.', 'Crossings next to it only get the number from their other side.'],
    walk: 'Work row by row. The middle crossing is 0, so the ones to its right and above it only add the other number. The 💎 gets 34.',
    explain: 'Without the hole there would be 70 routes. 36 of them went through the middle, so 70 − 36 = 34 are left.' },
  { type: 'routes', mode: 'label', w: 5, h: 3, block: [[1, 0, 2, 0], [3, 2, 3, 3]],
    task: 'Two fallen columns this time. Count the routes to the 💎.',
    hints: ['A column on the bottom street means the crossings after it on the bottom street can’t be reached that way.', 'After the first column, the bottom street crossings get 0 from the left.'],
    walk: 'The bottom street after the column is all 0s. Work up row by row, leaving out the two blocked streets. The 💎 gets 29.',
    explain: 'Even a 0 is useful: it tells you no route arrives that way.' },
  { type: 'routes', mode: 'label', w: 5, h: 4, block: [[1, 2, 2, 2], [3, 0, 3, 1]], gone: [[3, 3]],
    task: 'The master maze: two fallen columns and a collapsed crossing. How many routes go to the 💎?',
    hints: ['Start at the bottom and work up, one crossing at a time.', 'Check each crossing: is the street from the left open? Is the street from below open? Add only the open ones.'],
    walk: 'Fill every crossing from the bottom-left, adding only the open streets. The collapsed crossing is 0. The 💎 gets 47.',
    explain: 'Big counting puzzles become simple when you break them into small steps. Mathematicians call this kind of building up “dynamic programming”.' },
  ] });

/* ---------------------------------------------------------------- 8 */
const sqSticks = cells => [...new Set(cells.flatMap(([x, y]) => [`h${x},${y}`, `h${x},${y + 1}`, `v${x},${y}`, `v${x + 1},${y}`]))];
CH3.push({ ch: 3, id: 'sticks', name: 'Driftwood Gate', emoji: '🪵', creature: '🦥', prize: '🦏', prizeName: 'rhino', concept: 'Matchstick puzzles',
  teaches: 'Matchstick puzzles one step on from Chapter 1: a minus that becomes a plus, two-digit numbers, a longer sum, moving two sticks at once, and stick pictures where you change the number of squares. Reading every attempt back to check it.',
  puzzles: [
  { type: 'sticks', eq: '1+6=5', moves: 1,
    task: 'It says 1 + 6 = 5. Move one stick from one number to another to make it true.',
    hints: ['What if the 6 became a 5? How many sticks would that take away?', 'Moving the lower-left stick of the 6 onto the 5 turns 6 into 5 and 5 into 6.'],
    walk: 'Move the lower-left stick of the 6 over to the 5. Now it says 1 + 5 = 6.',
    explain: 'A stick taken from one digit can make another digit bigger. 6 and 5 swap with a single stick.' },
  { type: 'sticks', eq: '2-6=7', moves: 1,
    task: 'It says 2 − 6 = 7. Move one stick to make it true.',
    hints: ['A minus sign needs just one more stick to become a plus.', 'Which digit could give away one upright stick? The 6 can become a 5.'],
    walk: 'Take the lower-left stick of the 6 and stand it up across the minus. Now it says 2 + 5 = 7.',
    explain: 'In Chapter 1 a plus gave away a stick. Here a minus takes one and becomes a plus: 2 + 5 = 7.' },
  { type: 'sticks', lat: { w: 4, h: 2, sticks: ['h0,0', 'h1,0', 'h2,0', 'h0,1', 'h1,1', 'h2,1', 'v0,0', 'v1,0', 'v2,0', 'v3,1'] }, squares: 3, moves: 1,
    task: 'A stick fell out of place. Move one stick to make 3 squares, with no loose sticks.',
    hints: ['Which stick does not belong to any square?', 'The loose stick at the bottom right can close the third square.'],
    walk: 'Move the loose stick up so it closes the right side of the third square.',
    explain: 'A square needs 4 sticks, but squares next to each other share a stick. Three squares in a row need only 10 sticks.' },
  { type: 'sticks', eq: '13+6=21', moves: 1,
    task: 'Bigger numbers: 13 + 6 = 21. Move one stick to make it true.',
    hints: ['13 + 6 is 19, not 21. Which number could change into something else with one stick?', 'Change 13 into 15: move just one stick inside the 3.'],
    walk: 'Move the upper-right stick of the 3 to its upper left. The 3 becomes a 5, and now it says 15 + 6 = 21.',
    explain: 'Try changing each number one at a time and check the sum: 15 + 6 = 21.' },
  { type: 'sticks', lat: { w: 4, h: 2, sticks: sqSticks([[0, 0], [1, 0], [1, 1], [2, 1], [3, 1]]) }, squares: 4, moves: 2,
    task: 'Here are 5 squares. Move <b>two</b> sticks to make exactly 4 squares, with no loose sticks.',
    hints: ['4 squares made of 16 sticks can’t share any sides: 4 × 4 = 16.', 'Look at the empty space in the top row. Build a new square there, using one stick from the top row and one from the bottom row.'],
    walk: 'Move the top stick of the second top square onto the top of the empty space, and the bottom stick of the middle bottom square onto its right side. Now the 4 squares sit like a checkerboard.',
    explain: 'Squares that share sides save sticks. With 16 sticks you can make 4 separate squares, or 5 squares that share some sides.' },
  { type: 'sticks', eq: '1-1+4=2', moves: 1,
    task: 'A longer sum: 1 − 1 + 4 = 2. Move one stick to make it true.',
    hints: ['Try changing a sign. What happens if the plus becomes a minus?', 'Then you have a spare stick. Put it on top of the first 1. What digit is that?'],
    walk: 'Take the upright stick of the + and lay it on top of the first 1. Now it says 7 − 1 − 4 = 2.',
    explain: 'One stick changed two things at once: + became −, and 1 became 7. 7 − 1 − 4 = 2.' },
  { type: 'sticks', eq: '1+0=5', moves: 2,
    task: 'Move <b>two</b> sticks to make 1 + 0 = 5 true.',
    hints: ['The 0 has 6 sticks. A 5 has 5 sticks and a 6 has 6 sticks.', 'Turn the 0 into a 5 (it gives away a stick), and give that stick to the 5 to make a 6.'],
    walk: 'Inside the 0, move the upper-right stick to the middle. Then move its lower-left stick onto the 5. Now it says 1 + 5 = 6.',
    explain: 'With two moves, count sticks: a 0 has 6, a 5 has 5, a 6 has 6. The totals have to stay the same.' },
  { type: 'sticks', lat: { w: 3, h: 2, sticks: sqSticks([[0, 0], [1, 0], [0, 1], [1, 1]]) }, squares: 3, moves: 3,
    task: 'A classic! These 12 sticks make 4 squares. Move <b>three</b> sticks to make exactly 3 squares, with no loose sticks.',
    hints: ['3 squares that don’t share sticks would need 12 sticks: exactly what you have!', 'Take apart one corner square by moving its 2 outside sticks, plus one more stick, and build a new square sticking out on the right.'],
    walk: 'One way: take the top and the left stick of the top-left square, and the bottom stick of the bottom-right square. Use them to build a new square to the right of the bottom-right square.',
    explain: 'Counting sticks first tells you what the answer must look like. 12 sticks make 3 squares only if no sticks are shared.' },
  { type: 'sticks', eq: '11+4=24', moves: 2,
    task: 'The master stick puzzle: 11 + 4 = 24. Move <b>two</b> sticks to make it true.',
    hints: ['A 1 with one more stick on top becomes a 7.', 'Make 17 + 7 = 24: the 4 needs to become a 7, and one of its sticks goes to the 11.'],
    walk: 'The 4 becomes a 7: move its middle stick onto the top. Then move its upper-left stick onto the second 1 of 11 to make 17. Now it says 17 + 7 = 24.',
    explain: 'With two moves there are many tries. Good solvers ask: which numbers can grow, and which can shrink? 17 + 7 = 24.' },
  ] });

/* ---------------------------------------------------------------- 9 */
CH3.push({ ch: 3, id: 'bars', name: 'Bar Bazaar', emoji: '📊', creature: '🐨', prize: '🧞', prizeName: 'genie', concept: 'Bar models',
  teaches: 'Bar models for word problems: sum and difference (take the extra away, then halve), “times as many” (equal parts), three people with sums of pairs, ages (the age gap never changes) and giving away (giving 6 closes a gap of 12).',
  puzzles: [
  { type: 'bars', max: 14, bars: [{ id: 'f', name: 'Fay', e: '🐠', col: '#ff8fb3' }, { id: 'o', name: 'Otto', e: '🐙', col: '#9b6ad6', link: { to: 'f', plus: 4 } }],
    conds: [{ t: 'sum', of: ['f', 'o'], is: 12, text: 'Together they have <b>12</b> shells.' }], ans: { f: 4 },
    task: 'Otto has 4 more shells than Fay. Together they have 12. Drag Fay’s bar to find how many each has.',
    hints: ['Otto’s bar is Fay’s bar plus 4 extra shells (the striped part).', 'Take away the 4 extra: 12 − 4 = 8. That is two bars the same size as Fay’s.'],
    walk: '12 − 4 = 8, and half of 8 is 4. Fay has 4 and Otto has 8.',
    explain: 'Bar model trick: take away the extra part, and what is left splits into equal bars.' },
  { type: 'bars', max: 16, bars: [{ id: 't', name: 'Tess', e: '🐢', col: '#4fbf7a' }, { id: 'c', name: 'Cora', e: '🦀', col: '#ef6a4a', link: { to: 't', times: 2 } }],
    conds: [{ t: 'sum', of: ['t', 'c'], is: 15, text: 'Together they have <b>15</b> pearls.' }], ans: { t: 5 },
    task: 'Cora has twice as many pearls as Tess. Together they have 15. How many does each have?',
    hints: ['Cora’s bar is two of Tess’s bars. So together there are 3 equal bars.', '3 equal bars make 15. How big is one bar?'],
    walk: '3 equal parts make 15, so one part is 5. Tess has 5, Cora has 10.',
    explain: '“Twice as many” means 2 equal parts. Together with Tess’s part that makes 3 parts.' },
  { type: 'bars', max: 12, bars: [{ id: 'p', name: 'Pip', e: '🐡', col: '#ffc93a' }, { id: 'd', name: 'Dot', e: '🐬', col: '#2b8fd6' }],
    conds: [{ t: 'sum', of: ['p', 'd'], is: 10, text: 'Together they have <b>10</b> starfish.' }, { t: 'more', a: 'p', b: 'd', by: 2, text: 'Pip has <b>2 more</b> than Dot.' }], ans: { p: 6, d: 4 },
    task: 'Pip and Dot have 10 starfish together. Pip has 2 more than Dot. Set both bars so that both lines get a tick.',
    hints: ['Make the bars add up to 10 first. Then move one block from one bar to the other and watch the difference.', 'Take the 2 extra away: 10 − 2 = 8. Half of 8 is Dot’s share.'],
    walk: '10 − 2 = 8, half of 8 is 4. Dot has 4 and Pip has 4 + 2 = 6.',
    explain: 'Sum and difference: take away the difference, halve, and you get the smaller number.' },
  { type: 'bars', max: 12, bars: [{ id: 'a', name: 'Ana', e: '🐟', col: '#2fb3ac' }, { id: 'b', name: 'Ben', e: '🐳', col: '#2b8fd6', link: { to: 'a', plus: 2 } }, { id: 'c', name: 'Cal', e: '🦞', col: '#ef6a4a', link: { to: 'a', plus: 4 } }],
    conds: [{ t: 'sum', of: ['a', 'b', 'c'], is: 21, text: 'All three have <b>21</b> coins together.' }], ans: { a: 5 },
    task: 'Ben has 2 more coins than Ana. Cal has 4 more than Ana. Together they have 21. Drag Ana’s bar.',
    hints: ['Take away all the extra pieces: 2 + 4 = 6.', '21 − 6 = 15, and that is three bars the size of Ana’s.'],
    walk: '21 − 2 − 4 = 15, and 15 ÷ 3 = 5. Ana has 5, Ben 7, Cal 9.',
    explain: 'With three bars it is the same trick: remove the extras, then share the rest equally.' },
  { type: 'bars', max: 18, bars: [{ id: 'w', name: 'Whale', e: '🐋', col: '#3a5a9f' }, { id: 's', name: 'Seal', e: '🦭', col: '#8fa3b3' }],
    conds: [{ t: 'times', a: 'w', b: 's', k: 3, text: 'The whale has <b>3 times</b> as many stripes as the seal.' }, { t: 'more', a: 'w', b: 's', by: 10, text: 'The whale has <b>10 more</b> stripes than the seal.' }], ans: { w: 15, s: 5 },
    task: 'The whale has 3 times as many stripes as the seal, and 10 more. Set both bars.',
    hints: ['Draw the whale as 3 seal-bars. Which part is the “10 more”?', 'The whale is 1 seal-bar plus 2 more seal-bars. Those 2 bars are the 10 extra.'],
    walk: '2 seal-bars make 10, so one seal-bar is 5. The seal has 5 stripes, the whale 15.',
    explain: 'Times and difference: 3 parts minus 1 part is 2 parts, and those 2 parts are the difference.' },
  { type: 'bars', max: 14, bars: [{ id: 'm', name: 'Mo', e: '🐙', col: '#9b6ad6', later: 2 }, { id: 'l', name: 'Lu', e: '🦑', col: '#ff8fb3', later: 2 }],
    conds: [{ t: 'more', a: 'm', b: 'l', by: 3, text: 'Mo is <b>3 years older</b> than Lu.' }, { t: 'sumLater', of: ['m', 'l'], years: 2, is: 19, text: 'In <b>2 years</b>, their ages will add up to <b>19</b>.' }], ans: { m: 9, l: 6 },
    task: 'Mo is 3 years older than Lu. In 2 years their ages will add up to 19. How old are they now?',
    hints: ['In 2 years both get 2 years older, so together they grow by 4.', 'Now they add up to 19 − 4 = 15. Then use the “3 years older” trick.'],
    walk: '19 − 2 − 2 = 15 now. 15 − 3 = 12, half is 6. Lu is 6, Mo is 9.',
    explain: 'Ages: everyone gets older at the same speed. Each person adds the same number of years.' },
  { type: 'bars', max: 14, bars: [{ id: 'a', name: 'Ari', e: '🐠', col: '#ff9a3c' }, { id: 'b', name: 'Bo', e: '🐢', col: '#4fbf7a' }, { id: 'c', name: 'Cy', e: '🦀', col: '#ef6a4a' }],
    conds: [{ t: 'sum', of: ['a', 'b'], is: 20, text: 'Ari and Bo have <b>20</b> together.' }, { t: 'sum', of: ['b', 'c'], is: 15, text: 'Bo and Cy have <b>15</b> together.' }, { t: 'sum', of: ['a', 'c'], is: 17, text: 'Ari and Cy have <b>17</b> together.' }], ans: { a: 11, b: 9, c: 6 },
    task: 'Three friends with shells. Each pair’s total is given. Find how many each one has.',
    hints: ['Add all three totals: 20 + 15 + 17. Each friend is counted twice!', '20 + 15 + 17 = 52, so all three together have 26. Ari is 26 minus what Bo and Cy have.'],
    walk: 'All three together: 52 ÷ 2 = 26. Ari = 26 − 15 = 11, Bo = 26 − 17 = 9, Cy = 26 − 20 = 6.',
    explain: 'Adding all the pair totals counts everyone twice. Halving gives the grand total, and then each person is easy.' },
  { type: 'bars', max: 38, bars: [{ id: 'mum', name: 'Mum', e: '🐳', col: '#3a5a9f', fixed: 30, later: 'y' }, { id: 'kid', name: 'Kip', e: '🐟', col: '#2fb3ac', fixed: 6, later: 'y' }, { id: 'y', name: 'Years', e: '⏳', col: '#ffc93a', max: 12 }],
    conds: [{ t: 'timesLater', a: 'mum', b: 'kid', y: 'y', k: 3, text: 'Mum will be exactly <b>3 times</b> as old as Kip.' }], ans: { y: 6 },
    task: 'Mum whale is 30 and Kip is 6. In how many years will Mum be exactly 3 times as old as Kip? Drag the years bar.',
    hints: ['The gap between their ages is always 30 − 6 = 24 years.', 'When Mum is 3 times as old as Kip, the gap is 2 of Kip’s bars. So 2 Kip-bars make 24.'],
    walk: '24 ÷ 2 = 12, so Kip will be 12. That is in 6 years (Mum will be 36, and 3 × 12 = 36).',
    explain: 'The age gap never changes. Turning the question around (“when is the gap 2 Kip-bars?”) makes it easy.' },
  { type: 'bars', max: 20, bars: [{ id: 'a', name: 'Ann', e: '🦭', col: '#8fa3b3' }, { id: 'b', name: 'Bob', e: '🐡', col: '#ffc93a' }],
    conds: [{ t: 'times', a: 'a', b: 'b', k: 3, text: 'Ann has <b>3 times</b> as many pearls as Bob.' }, { t: 'give', from: 'a', to: 'b', n: 6, text: 'If Ann gives Bob <b>6</b> pearls, they will have the <b>same</b>.' }], ans: { a: 18, b: 6 },
    task: 'The master bar puzzle: Ann has 3 times as many pearls as Bob. If Ann gave Bob 6 pearls, they would have the same. How many does each have?',
    hints: ['If giving 6 makes them equal, how big is the gap now? (Ann loses 6, and Bob gains 6.)', 'The gap is 12. Ann is 3 Bob-bars, so the gap is 2 Bob-bars. 2 bars make 12.'],
    walk: 'Giving 6 closes a gap of 6 + 6 = 12. The gap is 2 Bob-bars, so one bar is 6. Bob has 6 and Ann has 18.',
    explain: 'Giving changes both people: one goes down and the other goes up. So giving 6 closes a gap of 12. That is the olympiad trap in this puzzle!' },
  ] });



CH3.forEach(w => WORLDS.push(w));
/* centre each chapter 3 puzzle in the stage (auto margins, so tall puzzles still scroll normally) */
[...new Set(CH3.flatMap(w => w.puzzles.map(p => p.type)))].forEach(t => { const f = R[t]; R[t] = (st, p, api) => { st.classList.add('c3-st'); return f(st, p, api); }; });
if (typeof CNAME !== 'undefined') Object.assign(CNAME, { '🦉': 'owl', '🦄': 'unicorn', '🦚': 'peacock', '🦓': 'zebra', '🐝': 'bee', '🐯': 'tiger', '🐭': 'mouse', '🐼': 'panda', '🦔': 'hedgehog', '🐘': 'elephant', '🦝': 'raccoon', '🦒': 'giraffe', '🐿️': 'chipmunk', '🦖': 'T. rex', '🦥': 'sloth', '🦏': 'rhino', '🐨': 'koala', '🧞': 'genie' });

/* the solvers behind the checkers, for tests */
window.CH3 = { nimLose, nimGood, nimMoves, lineLose, lineGood, lineMoves, runsOf, mirrorTwin, mirrorSrc, foldUnfold, mapInfo, colourMap, mapNeed, latinCheck, latinSolve, latinGrid, tileSolve, cellsOf, orients, gardenStats, degrees, oddNodes, eulerOK, eulerPath, routeWays, allRoutes, matchCells, matchSlots, matchRead, matchTrue, matchSolutions, latSlots, latSquares, barVals, condOK, ids: CH3.map(w => w.id) };






})();
