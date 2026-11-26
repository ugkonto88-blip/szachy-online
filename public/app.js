import { Chess } from '/lib/chess.js';
import { NEW_GAMBITS, NEW_OPEN } from '/lines.js';

const $ = (id) => document.getElementById(id);
const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const CATS = { bullet: ['Bullet', '⚡'], blitz: ['Blitz', '🔥'], rapid: ['Rapid', '⏱️'], classical: ['Klasyczne', '🐢'] };
const fmtMode = (t, i) => (i ? `${t} min + ${i} s` : `${t} min`);
const MODE_GROUPS = {
  bullet: [[1, 0], [2, 1]],
  blitz: [[3, 0], [3, 2], [5, 0]],
  rapid: [[10, 0], [15, 10]],
  classical: [[30, 0], [30, 20]],
};
const BOTS = [
  { n: 'Kuba', e: '🐣', lv: 0, d: 'Dopiero się uczy' },
  { n: 'Ola', e: '🐱', lv: 2, d: 'Gra dla zabawy' },
  { n: 'Marek', e: '🐶', lv: 4, d: 'Klubowy amator' },
  { n: 'Zofia', e: '🦊', lv: 7, d: 'Lubi ataki na króla' },
  { n: 'Bartek', e: '🐺', lv: 10, d: 'Solidny taktyk' },
  { n: 'Hanna', e: '🦉', lv: 13, d: 'Cierpliwa pozycyjnie' },
  { n: 'Viktor', e: '🦅', lv: 16, d: 'Mistrz końcówek' },
  { n: 'Maszyna', e: '🤖', lv: 20, d: 'Pełna moc Stockfisha' },
];
const botElo = (lv) => 100 + lv * 140;
const botShownElo = (b) => (b && b.shownElo != null ? b.shownElo : botElo(b ? b.lv : 0));

const COACH_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#8fc3ee"/>
<path d="M18 100 Q50 66 82 100Z" fill="#3b6fb6"/>
<rect x="43" y="62" width="14" height="14" fill="#f2c9a0"/>
<ellipse cx="50" cy="46" rx="22" ry="25" fill="#f7d3ae"/>
<path d="M26 44 Q22 16 50 14 Q80 14 74 44 Q70 28 56 27 Q42 30 36 24 Q30 30 26 44Z" fill="#f3cf5a"/>
<path d="M28 40 Q24 56 30 60 Q28 48 32 40Z" fill="#f3cf5a"/>
<path d="M72 40 Q76 56 70 60 Q72 48 68 40Z" fill="#f3cf5a"/>
<circle cx="40" cy="48" r="5.2" fill="#fff"/><circle cx="60" cy="48" r="5.2" fill="#fff"/>
<circle cx="40.5" cy="48.5" r="3.4" fill="#2f8fe8"/><circle cx="60.5" cy="48.5" r="3.4" fill="#2f8fe8"/>
<circle cx="40.5" cy="48.5" r="1.4" fill="#123"/><circle cx="60.5" cy="48.5" r="1.4" fill="#123"/>
<circle cx="41.5" cy="47.3" r="0.9" fill="#fff"/><circle cx="61.5" cy="47.3" r="0.9" fill="#fff"/>
<path d="M34 41 Q40 38 45 40" stroke="#c9a53c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M55 40 Q60 38 66 41" stroke="#c9a53c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M42 60 Q50 67 58 60" stroke="#b5533c" stroke-width="2.2" fill="none" stroke-linecap="round"/>
<circle cx="34" cy="56" r="3.2" fill="#f4a9a0" opacity=".55"/><circle cx="66" cy="56" r="3.2" fill="#f4a9a0" opacity=".55"/>
</svg>`;

const PIECE_SETS = ['cburnett', 'merida', 'alpha', 'staunty', 'cardinal', 'pixel', 'companion', 'anarcandy', 'caliente', 'california', 'celtic', 'chess7', 'chessnut', 'dubrovny', 'fantasy', 'fresca', 'gioco', 'governor', 'horsey', 'icpieces', 'kiwen-suwi', 'kosal', 'leipzig', 'letter', 'maestro', 'mpchess', 'pirouetti', 'reillycraig', 'riohacha', 'spatial', 'tatiana'];
const BOARD_THEMES = [
  { n: 'Zielony', l: '#ebecd0', d: '#739552' }, { n: 'Brąz', l: '#f0d9b5', d: '#b58863' },
  { n: 'Niebieski', l: '#dee3e6', d: '#8ca2ad' }, { n: 'Szary', l: '#e0e0e0', d: '#8a8a8a' },
  { n: 'Fiolet', l: '#e8dff0', d: '#8877b3' }, { n: 'Róż', l: '#f7e1e8', d: '#d77a9b' },
  { n: 'Drewno', l: '#e8c99b', d: '#a8723d' }, { n: 'Ciemny', l: '#9aa0a6', d: '#3a3f45' },
];
const TINTS = {
  none: ['Bez zmian', 'brightness(1)'],
  red: ['Czerwony', 'sepia(1) saturate(4) hue-rotate(-30deg)'],
  orange: ['Pomarańczowy', 'sepia(1) saturate(4) hue-rotate(0deg)'],
  gold: ['Złoty', 'sepia(1) saturate(3) hue-rotate(10deg) brightness(1.1)'],
  green: ['Zielony', 'sepia(1) saturate(3) hue-rotate(70deg)'],
  teal: ['Morski', 'sepia(1) saturate(3) hue-rotate(130deg)'],
  blue: ['Niebieski', 'sepia(1) saturate(4) hue-rotate(170deg)'],
  purple: ['Fioletowy', 'sepia(1) saturate(3) hue-rotate(220deg)'],
  pink: ['Różowy', 'sepia(1) saturate(3) hue-rotate(290deg) brightness(1.15)'],
};
const STYLE_PRESETS = [
  { n: 'Klasyk', p: 'cburnett', l: '#f0d9b5', d: '#b58863', w: 'none', b: 'none' },
  { n: 'Turniej', p: 'merida', l: '#ebecd0', d: '#739552', w: 'none', b: 'none' },
  { n: 'Lodowy', p: 'alpha', l: '#e6f0f7', d: '#6f9bbd', w: 'teal', b: 'blue' },
  { n: 'Neon', p: 'pixel', l: '#2b2d42', d: '#14151f', w: 'green', b: 'pink' },
  { n: 'Złoto i heban', p: 'staunty', l: '#e8d29a', d: '#7a5a2a', w: 'gold', b: 'none' },
  { n: 'Zachód słońca', p: 'cardinal', l: '#fbe3c8', d: '#d9715a', w: 'orange', b: 'purple' },
  { n: 'Las', p: 'companion', l: '#dfe8d0', d: '#4f7a4a', w: 'green', b: 'none' },
  { n: 'Róża', p: 'cburnett', l: '#f7e1e8', d: '#d77a9b', w: 'pink', b: 'purple' },
  { n: 'Granat', p: 'merida', l: '#c9d3e6', d: '#2f4a7a', w: 'blue', b: 'red' },
  { n: 'Monochrom', p: 'alpha', l: '#e0e0e0', d: '#6b6b6b', w: 'none', b: 'none' },
];
const PAGE_THEMES = [['default', 'Ciemny'], ['midnight', 'Północ'], ['light', 'Jasny'], ['purple', 'Fiolet']];
const ARROWS = { green: '#81b64c', blue: '#4a9eff', red: '#e5484d' };
const DEFAULTS = { tintW: 'none', tintB: 'none', pieces: 'cburnett', light: '#ebecd0', dark: '#739552', hl: '#ffff00', size: 78, coords: true, hints: true, anim: true, arrow: 'green', page: 'default', premove: true, autoQueen: false, confirmResign: true, classify: true, sound: true, soundStyle: 'wood' };
let S = { ...DEFAULTS };
try { S = { ...DEFAULTS, ...JSON.parse(localStorage.getItem('szachy.settings') || '{}') }; } catch {}
if (S.pv !== 2) { S.premove = true; S.pv = 2; try { localStorage.setItem('szachy.settings', JSON.stringify(S)); } catch {} }

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
function applySettings() {
  const r = document.documentElement.style;
  r.setProperty('--light-sq', S.light); r.setProperty('--dark-sq', S.dark);
  r.setProperty('--hl', hexA(S.hl, 0.5)); r.setProperty('--board-pct', S.size);
  r.setProperty('--tint-w', (TINTS[S.tintW] || TINTS.none)[1]);
  r.setProperty('--tint-b', (TINTS[S.tintB] || TINTS.none)[1]);
  if ($('tintW')) $('tintW').value = S.tintW;
  if ($('tintB')) $('tintB').value = S.tintB;
  document.body.classList.toggle('no-coords', !S.coords);
  document.body.classList.toggle('no-hints', !S.hints);
  document.body.classList.toggle('no-anim', !S.anim);
  document.body.className = document.body.className.replace(/theme-\S+/g, '').trim();
  if (S.page !== 'default') document.body.classList.add('theme-' + S.page);
  $('cLight').value = S.light; $('cDark').value = S.dark; $('cHl').value = S.hl;
  $('boardSize').value = S.size; $('optCoords').checked = S.coords;
  $('optHints').checked = S.hints; $('optAnim').checked = S.anim; $('arrowStyle').value = S.arrow;
  $('optPremove').checked = S.premove; $('optAutoQueen').checked = S.autoQueen;
  $('optConfirmResign').checked = S.confirmResign; $('optClassify').checked = S.classify; $('optSound').checked = S.sound;
  document.querySelectorAll('#pieceSets button').forEach((b) => b.classList.toggle('sel', b.dataset.v === S.pieces));
  document.querySelectorAll('#themes button').forEach((b) => b.classList.toggle('sel', b.dataset.l === S.light && b.dataset.d === S.dark));
  document.querySelectorAll('#pageThemes button').forEach((b) => b.classList.toggle('sel', b.dataset.v === S.page));
}
function saveSettings() {
  try { localStorage.setItem('szachy.settings', JSON.stringify(S)); } catch {}
  if (user) wsSend({ t: 'settings', settings: S });
  applySettings(); render();
}
const pieceUrl = (color, type) => `/pieces/${S.pieces}/${color}${type.toUpperCase()}.svg`;

function buildCustomUI() {
  const pr = $('presets');
  STYLE_PRESETS.forEach((s) => {
    const b = document.createElement('button');
    b.innerHTML = `<span style="background:${s.l}"></span><span style="background:${s.d}"></span><em>${s.n}</em>`;
    b.onclick = () => { S.pieces = s.p; S.light = s.l; S.dark = s.d; S.tintW = s.w; S.tintB = s.b; saveSettings(); };
    pr.appendChild(b);
  });
  for (const [id, key] of [['tintW', 'tintW'], ['tintB', 'tintB']]) {
    const sel = $(id);
    Object.entries(TINTS).forEach(([v, [n]]) => { const o = document.createElement('option'); o.value = v; o.textContent = n; sel.appendChild(o); });
    sel.onchange = (e) => { S[key] = e.target.value; saveSettings(); };
  }
  const ps = $('pieceSets');
  PIECE_SETS.forEach((p) => {
    const b = document.createElement('button');
    b.dataset.v = p; b.innerHTML = `<img src="/pieces/${p}/wN.svg" alt=""><span>${p}</span>`;
    b.onclick = () => { S.pieces = p; saveSettings(); };
    ps.appendChild(b);
  });
  const th = $('themes');
  BOARD_THEMES.forEach((t) => {
    const b = document.createElement('button');
    b.dataset.l = t.l; b.dataset.d = t.d;
    b.innerHTML = `<span style="background:${t.l}"></span><span style="background:${t.d}"></span><em>${t.n}</em>`;
    b.onclick = () => { S.light = t.l; S.dark = t.d; saveSettings(); };
    th.appendChild(b);
  });
  const pt = $('pageThemes');
  PAGE_THEMES.forEach(([v, n]) => {
    const b = document.createElement('button');
    b.dataset.v = v; b.textContent = n; b.style.height = '40px';
    b.onclick = () => { S.page = v; saveSettings(); };
    pt.appendChild(b);
  });
  $('cLight').oninput = (e) => { S.light = e.target.value; saveSettings(); };
  $('cDark').oninput = (e) => { S.dark = e.target.value; saveSettings(); };
  $('cHl').oninput = (e) => { S.hl = e.target.value; saveSettings(); };
  $('boardSize').oninput = (e) => { S.size = +e.target.value; saveSettings(); };
  $('optCoords').onchange = (e) => { S.coords = e.target.checked; saveSettings(); };
  $('optHints').onchange = (e) => { S.hints = e.target.checked; saveSettings(); };
  $('optAnim').onchange = (e) => { S.anim = e.target.checked; saveSettings(); };
  $('arrowStyle').onchange = (e) => { S.arrow = e.target.value; saveSettings(); };
  $('optPremove').onchange = (e) => { S.premove = e.target.checked; if (!S.premove) premoves = []; saveSettings(); };
  $('optAutoQueen').onchange = (e) => { S.autoQueen = e.target.checked; saveSettings(); };
  $('optConfirmResign').onchange = (e) => { S.confirmResign = e.target.checked; saveSettings(); };
  $('optClassify').onchange = (e) => { S.classify = e.target.checked; saveSettings(); };
  $('optSound').onchange = (e) => { S.sound = e.target.checked; saveSettings(); };
  $('optSoundStyle').value = S.soundStyle || 'wood';
  $('optSoundStyle').onchange = (e) => { S.soundStyle = e.target.value; saveSettings(); playSound('Nf3'); };
}
let premoves = [];
function premoveBoard(upTo = premoves.length) {
  try {
    const parts = game.fen().split(' ');
    parts[1] = myColor; parts[3] = '-';
    const g = new Chess(parts.join(' '));
    for (let i = 0; i < upTo; i++) {
      const pc = g.get(premoves[i].from);
      if (!pc) break;
      g.remove(premoves[i].from);
      g.put(pc, premoves[i].to);
    }
    const f = g.fen().split(' ');
    f[1] = myColor; f[3] = '-';
    return new Chess(f.join(' '));
  } catch { return null; }
}
function premoveTargets(pg, from) {
  if (!pg) return [];
  const out = new Set(pg.moves({ square: from, verbose: true }).map((m) => m.to));
  try {
    const mover = pg.get(from);
    if (!mover) return [...out];
    const opp = mover.color === 'w' ? 'b' : 'w';
    const g = new Chess(pg.fen());
    const own = [];
    for (const row of pg.board()) for (const c of row) {
      if (c && c.color === mover.color && c.square !== from && c.type !== 'k') own.push(c);
    }
    for (const c of own) { g.remove(c.square); g.put({ type: c.type, color: opp }, c.square); }
    if (mover.type !== 'k') {
      for (const row of pg.board()) for (const c of row) if (c && c.type === 'k' && c.color === mover.color) g.remove(c.square);
    }
    const ownSq = new Set(own.map((c) => c.square));
    for (const m of g.moves({ square: from, verbose: true })) if (ownSq.has(m.to)) out.add(m.to);
  } catch {}
  return [...out];
}

let mode = 'analysis';
let tab = 'play';
let startFen = START_FEN;
let moves = [];
let ply = 0;
let flipped = false;
let selected = null;
let myColor = 'w';
let over = false;
let animate = false;
let botLevel = 8;
let botInfo = null;
let opp = null;
let clk = null;
let lines = [];
let analysisOn = true;
let game = new Chess();
let onlineCat = 'blitz';
let lastEvalWhite = 0;
let coachPending = null;

function currentGame(upTo = ply) {
  const g = new Chess(startFen);
  for (let i = 0; i < upTo; i++) g.move({ from: moves[i].from, to: moves[i].to, promotion: moves[i].promotion });
  return g;
}
const inGame = () => (mode === 'bot' || mode === 'online') && !over;
const analysisActive = () => mode === 'analysis' && ((tab === 'analysis' && analysisOn) || tab === 'coach');
function canMoveNow() {
  if (mode === 'analysis') return true;
  return !over && ply === moves.length && game.turn() === myColor;
}

const boardEl = $('board');
function sqName(i) {
  const r = Math.floor(i / 8), c = i % 8;
  return 'abcdefgh'[flipped ? 7 - c : c] + ((flipped ? r : 7 - r) + 1);
}

function render() {
  game = currentGame();
  if (drag) {
    const hp = game.get(drag.from);
    if (hp && hp.color === myColor) { if (!selected) selected = drag.from; }
    else { drag.ghost.remove(); drag = null; selected = null; }
  }
  boardEl.innerHTML = '';
  const last = ply > 0 ? moves[ply - 1] : null;
  let legal = [];
  if (selected) {
    if (premoveActive()) {
      const pg = premoveBoard();
      legal = pg ? premoveTargets(pg, selected).map((to) => { const t = pg.get(to); return { to, captured: t ? t.type : undefined, flags: '' }; }) : [];
    }
    else legal = game.moves({ square: selected, verbose: true });
  }
  const inCheck = game.inCheck();
  const curQ = (S.classify && mode === 'analysis' && ply > 0 && !retryState) ? computeQuality()[ply - 1] : null;
  const dispG = (premoves.length && premoveActive() && premoveBoard()) || game;
  for (let i = 0; i < 64; i++) {
    const name = sqName(i);
    const f = name.charCodeAt(0) - 97, rk = +name[1] - 1;
    const el = document.createElement('div');
    el.className = 'sq ' + ((f + rk) % 2 === 0 ? 'dark' : 'light');
    el.dataset.sq = name;
    if (last && (last.from === name || last.to === name)) el.classList.add('last');
    if (selected === name) el.classList.add('sel');
    if (premoves.some((p) => p.from === name || p.to === name)) el.classList.add('pre');
    const hint = legal.find((m) => m.to === name);
    if (hint) { el.classList.add('hint'); if (hint.captured || hint.flags.includes('e')) el.classList.add('cap'); }
    const p = dispG.get(name);
    if (p && p.type === 'k' && p.color === game.turn() && inCheck && dispG === game) el.classList.add('check');
    if (i >= 56) { const c = document.createElement('span'); c.className = 'coord file'; c.textContent = name[0]; el.appendChild(c); }
    if (i % 8 === 0) { const c = document.createElement('span'); c.className = 'coord rank'; c.textContent = name[1]; el.appendChild(c); }
    if (p) {
      const pe = document.createElement('div');
      pe.className = 'piece c' + p.color;
      pe.style.backgroundImage = `url(${pieceUrl(p.color, p.type)})`;
      if (animate && last && last.to === name) {
        const fx = last.from.charCodeAt(0) - 97, fy = +last.from[1] - 1;
        const s = flipped ? -1 : 1;
        pe.style.setProperty('--dx', (fx - f) * s * 100 + '%');
        pe.style.setProperty('--dy', (rk - fy) * s * 100 + '%');
        pe.classList.add('slide');
      }
      el.appendChild(pe);
    }
    if (curQ && last && last.to === name) {
      const qb = document.createElement('span');
      qb.className = 'sq-q q ' + curQ;
      qb.textContent = QUAL[curQ][0];
      qb.title = QUAL[curQ][1];
      el.appendChild(qb);
    }
    boardEl.appendChild(el);
  }
  animate = false;
  drawArrows(); drawPuzzleHint(); drawUserMarks(); renderMoves(); renderNames(); renderMaterial(); updateClocks(); updateEvalBar();
  document.body.classList.toggle('no-eval', !analysisActive());
  document.body.classList.toggle('empty-board', moves.length === 0 && mode === 'analysis');
  $('btnUndo').hidden = !(mode === 'analysis' || (mode === 'bot' && !over));
}

const SYM = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' };
const START_CNT = { p: 8, n: 2, b: 2, r: 2, q: 1 };
function renderMaterial() {
  const cnt = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };
  for (const row of game.board()) for (const p of row) if (p && p.type !== 'k') cnt[p.color][p.type]++;
  const lost = (c) => { const out = []; for (const t of ['q', 'r', 'b', 'n', 'p']) for (let i = cnt[c][t]; i < START_CNT[t]; i++) out.push(SYM[t]); return out.join(''); };
  const val = (c) => Object.keys(cnt[c]).reduce((s, t) => s + cnt[c][t] * PVAL[t], 0);
  const diff = val('w') - val('b');
  const bottom = myColorView(), top = bottom === 'w' ? 'b' : 'w';
  const txt = (c) => { const o = c === 'w' ? 'b' : 'w'; const d = (c === 'w' ? diff : -diff); return lost(o) + (d > 0 ? ' +' + d : ''); };
  $('matBottom').textContent = txt(bottom); $('matTop').textContent = txt(top);
}
const myColorView = () => (flipped ? 'b' : 'w');
function renderNames() {
  let me = 'Białe', them = 'Czarne', avMe = '', avThem = '';
  if (mode === 'analysis') {
    if (flipped) [me, them] = [them, me];
  } else if (mode === 'bot') {
    me = user ? user.name : 'Ty';
    them = botInfo.coach ? 'LiLKasteusz (trener)' : `${botInfo.n} (${botShownElo(botInfo)})`;
    avThem = botInfo.coach ? COACH_SVG : botInfo.e;
  } else if (opp) {
    me = `${user ? user.name : 'Ty'} (${user ? user.ratings[onlineCat] : ''})`;
    them = `${opp.name} (${opp.rating})`;
    avThem = '👤'; avMe = '👤';
  }
  $('nameBottom').textContent = me; $('nameTop').textContent = them;
  $('avBottom').innerHTML = avMe; $('avTop').innerHTML = avThem;
  $('avTop').style.background = botInfo && mode === 'bot' && botInfo.coach ? '#8fc3ee' : '';
}

const evalByFen = {};
const evalDepth = {};
const bestByFen = {};
let botT0 = 0, botThinkMs = 0;
const fenKey = (f) => f.split(' ').slice(0, 4).join(' ');
const QUAL = {
  brilliant: ['!!', 'Genialny'], great: ['!', 'Świetny'], best: ['★', 'Najlepszy'], good: ['✓', 'Dobry'],
  book: ['📖', 'Książkowy'], inaccuracy: ['?!', 'Niedokładność'], mistake: ['?', 'Błąd'], blunder: ['??', 'Poważny błąd'],
};
const PVAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
function computeQuality() {
  const out = [];
  const g = new Chess(startFen);
  const sans = [];
  for (let i = 0; i < moves.length; i++) {
    const before = evalByFen[fenKey(g.fen())];
    const mover = g.turn();
    const res = g.move({ from: moves[i].from, to: moves[i].to, promotion: moves[i].promotion });
    sans.push(res.san);
    const after = evalByFen[fenKey(g.fen())];
    if (before === undefined || after === undefined) { out.push(null); continue; }
    const cl = (v) => Math.max(-1000, Math.min(1000, v));
    const sgn = mover === 'w' ? 1 : -1;
    const b = cl(before) * sgn, a = cl(after) * sgn;
    const loss = b - a;
    let cls;
    if (startFen === START_FEN && isBookSeq(sans) && loss <= 80) {
      cls = 'book';
    } else if (loss <= 25) {
      const opp = mover === 'w' ? 'b' : 'w';
      const pv = PVAL[res.piece] || 0;
      let sacrifice = false;
      if (pv >= 3) {
        const atk = g.attackers(res.to, opp).map((s) => PVAL[g.get(s).type]);
        const def = g.attackers(res.to, mover).length;
        const minAtk = atk.length ? Math.min(...atk) : 99;
        const netLoss = pv - (PVAL[res.captured] || 0);
        sacrifice = atk.length > 0 && netLoss >= 2 && (minAtk < pv || def === 0);
      }
      if (sacrifice && a >= -100 && b <= 650) cls = 'brilliant';
      else if (loss <= 15 && b < -50 && a >= -20) cls = 'great';
      else if (loss <= 10) cls = 'best';
      else cls = 'good';
    } else if (loss <= 50) cls = 'good';
    else if (loss <= 100) cls = 'inaccuracy';
    else if (loss <= 250) cls = 'mistake';
    else cls = 'blunder';
    out.push(cls);
  }
  return out;
}

const OPENINGS = [
  ['e4', "King's Pawn Game"], ['d4', "Queen's Pawn Game"], ['c4', 'English Opening'], ['Nf3', 'Zukertort Opening'],
  ['e4 e5', "King's Pawn Game"], ['e4 e5 Nf3 Nc6', "King's Knight Game"],
  ['e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O', 'Ruy Lopez'], ['e4 e5 Nf3 Nc6 Bb5 Nf6', 'Ruy Lopez: Berlin'],
  ['e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4', 'Italian Game: Giuoco Piano'], ['e4 e5 Nf3 Nc6 Bc4 Nf6', 'Italian Game: Two Knights'],
  ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4', 'Scotch Game'], ['e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4', "Petrov's Defense"],
  ['e4 e5 f4 exf4', "King's Gambit"], ['e4 e5 Nc3 Nf6', 'Vienna Game'], ['e4 e5 Bc4 Nf6', "Bishop's Opening"],
  ['e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3', 'Sicilian Defense'], ['e4 c5 Nf3 Nc6 d4 cxd4 Nxd4', 'Sicilian Defense: Open'],
  ['e4 c5 c3 d5', 'Sicilian Defense: Alapin'], ['e4 c5 Nc3 Nc6', 'Sicilian Defense: Closed'],
  ['e4 e6 d4 d5 Nc3 Nf6', 'French Defense'], ['e4 e6 d4 d5 Nd2', 'French Defense: Tarrasch'], ['e4 e6 d4 d5 e5', 'French Defense: Advance'],
  ['e4 c6 d4 d5 Nc3 dxe4 Nxe4', 'Caro-Kann Defense'], ['e4 c6 d4 d5 e5', 'Caro-Kann Defense: Advance'],
  ['e4 d5 exd5 Qxd5 Nc3', 'Scandinavian Defense'], ['e4 d5 exd5 Nf6', 'Scandinavian Defense: Modern'],
  ['e4 d6 d4 Nf6 Nc3', 'Pirc Defense'], ['e4 g6 d4 Bg7', 'Modern Defense'], ['e4 Nf6 e5 Nd5', "Alekhine's Defense"], ['e4 b6', "Owen's Defense"],
  ['d4 d5 c4 e6 Nc3 Nf6', "Queen's Gambit Declined"], ['d4 d5 c4 dxc4 Nf3', "Queen's Gambit Accepted"],
  ['d4 d5 c4 c6 Nf3 Nf6 Nc3', 'Slav Defense'], ['d4 d5 Bf4 Nf6 e3', 'London System'],
  ['d4 Nf6 c4 g6 Nc3 Bg7 e4 d6', "King's Indian Defense"], ['d4 Nf6 c4 e6 Nc3 Bb4 e3', 'Nimzo-Indian Defense'],
  ['d4 Nf6 c4 e6 Nf3 b6', "Queen's Indian Defense"], ['d4 Nf6 Bf4', 'London System'], ['d4 f5 g3', 'Dutch Defense'],
  ['c4 e5 Nc3', 'English Opening: Reversed Sicilian'], ['c4 c5', 'English Opening: Symmetrical'],
  ['Nf3 d5 d4', 'Zukertort Opening'], ['b3', 'Nimzo-Larsen Attack'], ['f4', "Bird's Opening"], ['g3', 'King Pawn Fianchetto'],
];
function isBookSeq(sans) {
  if (!sans.length) return false;
  for (const [seq] of OPENINGS) {
    const a = seq.split(' ');
    if (sans.length <= a.length && sans.every((s, i) => a[i] === s)) return true;
  }
  return false;
}
function openingFor(sans) {
  let best = '';
  for (const [seq, name] of OPENINGS) {
    const a = seq.split(' ');
    if (a.length <= sans.length && a.every((s, i) => sans[i] === s)) best = name;
  }
  return best;
}
function renderOpening() {
  const el = $('openingName');
  if (!el) return;
  el.textContent = openingFor(moves.slice(0, ply).map((m) => m.san));
}
function fmtCp(cp) {
  if (Math.abs(cp) >= 9000) return cp > 0 ? '+M' : '-M';
  const v = (cp / 100).toFixed(1);
  return cp > 0 ? '+' + v : v;
}
let retryState = null;
function renderMoveCard() {
  const el = $('moveCard');
  if (!el) return;
  el.innerHTML = '';
  if (retryState) {
    const av = document.createElement('div'); av.className = 'mc-av'; av.innerHTML = COACH_SVG;
    const body = document.createElement('div'); body.className = 'mc-body';
    const head = document.createElement('div'); head.className = 'mc-head';
    const b = document.createElement('b');
    b.textContent = retryState.solved ? `✅ Brawo! ${retryState.bestSan}!` : '🔄 Spróbuj ponownie';
    head.appendChild(b);
    const msg = document.createElement('div'); msg.className = 'mc-msg';
    if (retryState.solved) msg.textContent = `${retryState.bestSan} był najlepszym ruchem w tej pozycji.`;
    else if (retryState.wrong) msg.textContent = `❌ ${retryState.wrong} to nie najlepszy ruch. Spróbuj jeszcze raz!`;
    else msg.textContent = `Zamiast ${retryState.badSan} znajdź lepszy ruch na planszy.`;
    const acts = document.createElement('div'); acts.className = 'mc-acts';
    if (!retryState.solved) {
      const showBtn = document.createElement('button');
      showBtn.className = 'mc-btn'; showBtn.textContent = 'Pokaż odpowiedź';
      showBtn.onclick = () => {
        const p = retryState.fromPly + 1;
        retryState = null;
        goTo(p);
      };
      acts.appendChild(showBtn);
    }
    const backBtn = document.createElement('button');
    backBtn.className = 'mc-btn primary'; backBtn.textContent = retryState.solved ? 'Wróć do partii' : 'Anuluj';
    backBtn.onclick = () => {
      const p = retryState.fromPly + 1;
      retryState = null;
      goTo(p);
    };
    acts.appendChild(backBtn);
    body.append(head, msg, acts);
    el.append(av, body);
    el.hidden = false;
    return;
  }
  if (!S.classify || ply < 1) { el.hidden = true; return; }
  const q = computeQuality()[ply - 1];
  if (!q) { el.hidden = true; return; }
  const g = new Chess(startFen);
  for (let i = 0; i < ply - 1; i++) g.move({ from: moves[i].from, to: moves[i].to, promotion: moves[i].promotion });
  const fenBefore = g.fen();
  const mover = g.turn();
  const beforeCp = evalByFen[fenKey(fenBefore)];
  const bm = bestByFen[fenKey(fenBefore)];
  let bestSan = '';
  if (bm) { try { bestSan = new Chess(fenBefore).move({ from: bm.slice(0, 2), to: bm.slice(2, 4), promotion: bm[4] }).san; } catch {} }
  const m = moves[ply - 1];
  g.move({ from: m.from, to: m.to, promotion: m.promotion });
  const afterCp = evalByFen[fenKey(g.fen())];
  const good = q === 'book' || q === 'brilliant' || q === 'great' || q === 'best';
  const op = openingFor(moves.slice(0, ply).map((x) => x.san));
  const av = document.createElement('div');
  av.className = 'mc-av';
  av.innerHTML = COACH_SVG;
  const body = document.createElement('div');
  body.className = 'mc-body';
  const head = document.createElement('div');
  head.className = 'mc-head';
  const badge = document.createElement('span');
  badge.className = 'q ' + q; badge.textContent = QUAL[q][0];
  const txt = document.createElement('b');
  txt.textContent = `${m.san} — ${QUAL[q][1]}`;
  head.append(badge, txt);
  if (afterCp !== undefined) {
    const ev = document.createElement('span');
    ev.className = 'mc-eval';
    ev.textContent = fmtCp(afterCp);
    head.append(ev);
  }
  const msg = document.createElement('div');
  msg.className = 'mc-msg';
  const cl = (v) => Math.max(-1000, Math.min(1000, v));
  const sgn = mover === 'w' ? 1 : -1;
  const swing = beforeCp !== undefined && afterCp !== undefined ? Math.round((cl(beforeCp) - cl(afterCp)) * sgn) : 0;
  if (q === 'book') msg.textContent = op ? `Ruch książkowy — ${op}.` : 'Ruch książkowy — standardowa teoria debiutowa.';
  else if (q === 'brilliant') msg.textContent = 'Genialne poświęcenie! Znalazłeś niezwykle trudny ruch taktyczny.';
  else if (q === 'great') msg.textContent = 'Świetny ruch — jedyna droga, która ratuje pozycję lub odwraca losy partii.';
  else if (q === 'best') msg.textContent = op && ply <= 8 ? `Najlepszy ruch w tym wariancie (${op}).` : 'Najlepszy możliwy ruch w tej pozycji.';
  else if (q === 'good') msg.textContent = 'Solidny ruch. Utrzymujesz kontrolę nad pozycją.';
  else if (q === 'inaccuracy') msg.textContent = `Niedokładność${swing > 0 ? ` (−${(swing / 100).toFixed(1)})` : ''}. Był dokładniejszy plan.`;
  else if (q === 'mistake') msg.textContent = `Błąd${swing > 0 ? ` (−${(swing / 100).toFixed(1)})` : ''}, który oddaje przewagę rywalowi.`;
  else msg.textContent = `Poważny błąd${swing > 0 ? ` (−${(swing / 100).toFixed(1)})` : ''}! To kosztuje materiał lub partię.`;
  body.append(head, msg);
  if (!good && bestSan && bestSan !== m.san) {
    const hint = document.createElement('div');
    hint.className = 'mc-best';
    hint.textContent = 'Najlepszy był: ' + bestSan;
    body.appendChild(hint);
    if (q === 'inaccuracy' || q === 'mistake' || q === 'blunder') {
      const acts = document.createElement('div'); acts.className = 'mc-acts';
      const rb = document.createElement('button');
      rb.className = 'mc-btn'; rb.textContent = '🔄 Spróbuj ponownie';
      rb.onclick = () => {
        retryState = { fromPly: ply - 1, badSan: m.san, bestUci: bm, bestSan, solved: false, wrong: '' };
        ply = ply - 1; selected = null; render();
      };
      acts.appendChild(rb);
      body.appendChild(acts);
    }
  }
  el.append(av, body);
  el.hidden = false;
}
function renderMoves() {
  renderOpening();
  renderMoveCard();
  const box = $('moves');
  box.innerHTML = '';
  const qual = S.classify ? computeQuality() : [];
  for (let i = 0; i < moves.length; i += 2) {
    const n = document.createElement('div');
    n.className = 'num'; n.textContent = i / 2 + 1 + '.';
    box.appendChild(n);
    for (let j = i; j < i + 2; j++) {
      const m = document.createElement('div');
      m.className = 'mv' + (j + 1 === ply ? ' cur' : '');
      if (moves[j]) {
        m.textContent = moves[j].san;
        m.onclick = () => goTo(j + 1);
        const q = qual[j];
        if (q) {
          const b = document.createElement('span');
          b.className = 'q ' + q;
          b.textContent = QUAL[q][0];
          b.title = QUAL[q][1];
          m.appendChild(b);
        }
      }
      box.appendChild(m);
    }
  }
  const cur = box.querySelector('.cur');
  if (cur) box.scrollTop = cur.offsetTop - box.clientHeight / 2;
}

function sqCenter(name) {
  const f = name.charCodeAt(0) - 97, r = +name[1] - 1;
  return [(flipped ? 7 - f : f) + 0.5, (flipped ? r : 7 - r) + 0.5];
}
function drawArrows() {
  boardEl.querySelector('.arrows')?.remove();
  if (!$('showArrow').checked || !analysisActive() || game.isGameOver()) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'arrows'); svg.setAttribute('viewBox', '0 0 8 8');
  lines.forEach((l, idx) => {
    if (!l || !l.uci) return;
    const [x1, y1] = sqCenter(l.uci.slice(0, 2));
    const [x2, y2] = sqCenter(l.uci.slice(2, 4));
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (!len) return;
    const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const ex = x2 - ux * 0.32, ey = y2 - uy * 0.32;
    const col = idx === 0 ? ARROWS[S.arrow] || ARROWS.green : '#e8a23a';
    const op = idx === 0 ? 0.85 : 0.5;
    const line = document.createElementNS(svg.namespaceURI, 'line');
    Object.entries({ x1, y1, x2: ex, y2: ey, stroke: col, 'stroke-width': idx === 0 ? 0.13 : 0.09, opacity: op }).forEach(([k, v]) => line.setAttribute(k, v));
    const poly = document.createElementNS(svg.namespaceURI, 'polygon');
    const px = -uy * 0.17, py = ux * 0.17;
    poly.setAttribute('points', `${x2},${y2} ${ex + px},${ey + py} ${ex - px},${ey - py}`);
    poly.setAttribute('fill', col); poly.setAttribute('opacity', op);
    svg.append(line, poly);
  });
  boardEl.appendChild(svg);
}

function fmt(ms) {
  ms = Math.max(0, ms);
  if (ms < 10000) return (ms / 1000).toFixed(1);
  const s = Math.floor(ms / 1000);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
function updateClocks() {
  const top = $('clockTop'), bot = $('clockBottom');
  const drillClk = mode === 'analysis' && window.__drillClk;
  const clockOn = mode === 'online' || (mode === 'bot' && botInfo && botInfo.matched) || drillClk;
  if (!clockOn || !clk) { top.textContent = ''; bot.textContent = ''; return; }
  const t = { w: clk.w, b: clk.b };
  const running = !over && moves.length >= 2 && ply === moves.length && !(drillClk && game.isGameOver());
  const turn = game.turn();
  if (running) t[turn] -= Date.now() - clk.at;
  if (running && drillClk && t[turn] <= 0) { clk = null; window.__drillTimeout && window.__drillTimeout(turn); return; }
  if (running && mode === 'bot' && t[turn] <= 0) { clk = null; endLocal(turn === myColor ? 'Przegrałeś' : 'Wygrałeś!', 'przez czas'); return; }
  const topColor = myColor === 'w' ? 'b' : 'w';
  for (const [el, c] of [[top, topColor], [bot, myColor]]) {
    el.textContent = fmt(t[c]);
    el.classList.toggle('active', running && turn === c);
    el.classList.toggle('low', t[c] < 10000);
  }
}
setInterval(updateClocks, 100);

function askPromotion(color) {
  return new Promise((resolve) => {
    const box = $('promo');
    box.innerHTML = '';
    for (const t of ['q', 'r', 'b', 'n']) {
      const b = document.createElement('button');
      b.innerHTML = `<img src="${pieceUrl(color, t)}" alt="">`;
      b.onclick = () => { box.hidden = true; resolve(t); };
      box.appendChild(b);
    }
    box.hidden = false;
  });
}

async function tryMove(from, to) {
  if (!canMoveNow()) return false;
  const cands = game.moves({ square: from, verbose: true }).filter((m) => m.to === to);
  if (!cands.length) return false;
  let promotion;
  if (cands[0].promotion) promotion = S.autoQueen ? 'q' : await askPromotion(game.turn());
  if (retryState && !retryState.solved) {
    const uci = from + to + (promotion || '');
    const tmp = new Chess(game.fen());
    const mv = tmp.move({ from, to, promotion });
    selected = null;
    if (uci === retryState.bestUci) {
      retryState.solved = true; retryState.wrong = '';
      playSound(mv.san);
      renderMoveCard();
    } else {
      retryState.wrong = mv.san;
      renderMoveCard();
      setTimeout(() => { if (retryState && !retryState.solved) { retryState.wrong = ''; render(); } }, 650);
    }
    return true;
  }
  if (mode === 'online') { wsSend({ t: 'move', from, to, promotion }); selected = null; render(); return true; }
  if (puzzle && !(await puzzleVerify(from, to, promotion))) { selected = null; render(); return false; }
  applyMove(from, to, promotion, true);
  return true;
}

function applyMove(from, to, promotion, byUser = false) {
  const g = currentGame();
  const mover = g.turn();
  let res;
  try { res = g.move({ from, to, promotion }); } catch { return false; }
  if (puzzle && byUser && !puzzleCheck(from, to, promotion)) { selected = null; render(); return false; }
  if (byUser && coachWatching()) coachPending = { mover, prev: lastEvalWhite, san: res.san };
  if (clk && ((mode === 'bot' && botInfo && botInfo.matched) || (mode === 'analysis' && window.__drillClk))) {
    const now = Date.now();
    if (ply >= 2) clk[mover] -= now - clk.at;
    if (ply >= 2) clk[mover] += clk.inc;
    clk.at = now;
  }
  moves = moves.slice(0, ply);
  moves.push({ from, to, promotion, san: res.san });
  ply++; selected = null; lines = []; animate = true;
  playSound(res.san);
  render();
  if (puzzle && byUser) puzzleAfter();
  if (mode === 'bot' && !over && game.isGameOver()) finishBot();
  refresh();
  const pmMode = () => mode === 'bot' || (mode === 'analysis' && window.__drillClk);
  if (!byUser && pmMode() && !over && premoves.length && S.premove) {
    const pm = premoves.shift();
    const cand = game.moves({ square: pm.from, verbose: true }).find((x) => x.to === pm.to);
    if (cand) setTimeout(() => { if (pmMode() && !over && game.turn() === myColor) applyMove(pm.from, pm.to, cand.promotion ? 'q' : undefined, true); }, 60);
    else { premoves = []; render(); }
  }
  return true;
}
function goTo(n) {
  if (retryState) retryState = null;
  n = Math.max(0, Math.min(moves.length, n));
  if (n === ply) return;
  if (mode === 'bot' && !over && n < moves.length) {
    let k = n;
    const g = new Chess(startFen);
    for (let i = 0; i < k; i++) g.move({ from: moves[i].from, to: moves[i].to, promotion: moves[i].promotion });
    if (g.turn() !== myColor && k > 0) k--;
    moves = moves.slice(0, k); ply = k;
    selected = null; lines = []; coachPending = null; botThinking = false;
    render(); refresh();
    return;
  }
  ply = n; selected = null; lines = []; coachPending = null;
  render(); refresh();
}

let drag = null;
let userMarks = [], marksKey = '', rcStart = null;
const markColor = (e) => (e.shiftKey ? '#e5484d' : e.ctrlKey ? '#4a9eff' : e.altKey ? '#f5c431' : '#3fae3f');
function drawUserMarks() {
  const key = ply + ':' + moves.length + ':' + startFen;
  if (key !== marksKey) { marksKey = key; userMarks = []; }
  boardEl.querySelector('.umarks')?.remove();
  if (!userMarks.length) return;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'umarks'); svg.setAttribute('viewBox', '0 0 8 8');
  const set = (el, o) => { for (const k in o) el.setAttribute(k, o[k]); return el; };
  userMarks.forEach((m) => {
    const [x1, y1] = sqCenter(m.from), [x2, y2] = sqCenter(m.to);
    if (m.from === m.to) { svg.appendChild(set(document.createElementNS(NS, 'rect'), { x: x1 - 0.5, y: y1 - 0.5, width: 1, height: 1, fill: m.color, opacity: 0.55 })); return; }
    const adx = Math.abs(x2 - x1), ady = Math.abs(y2 - y1);
    if ((adx === 1 && ady === 2) || (adx === 2 && ady === 1)) {
      const cx = adx > ady ? x2 : x1, cy = adx > ady ? y1 : y2;
      const dx = Math.sign(x2 - cx), dy = Math.sign(y2 - cy);
      const lx = x2 - dx * 0.3, ly = y2 - dy * 0.3, qx = -dy * 0.2, qy = dx * 0.2;
      const sx = x1 + Math.sign(cx - x1) * 0.1, sy = y1 + Math.sign(cy - y1) * 0.1;
      svg.appendChild(set(document.createElementNS(NS, 'path'), { d: `M${sx} ${sy} L${cx} ${cy} L${lx} ${ly}`, fill: 'none', stroke: m.color, 'stroke-width': 0.17, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.85 }));
      svg.appendChild(set(document.createElementNS(NS, 'polygon'), { points: `${x2},${y2} ${lx + qx},${ly + qy} ${lx - qx},${ly - qy}`, fill: m.color, opacity: 0.85 }));
      return;
    }
    const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const ex = x2 - ux * 0.3, ey = y2 - uy * 0.3, px = -uy * 0.2, py = ux * 0.2;
    svg.appendChild(set(document.createElementNS(NS, 'line'), { x1: x1 + ux * 0.1, y1: y1 + uy * 0.1, x2: ex, y2: ey, stroke: m.color, 'stroke-width': 0.17, 'stroke-linecap': 'round', opacity: 0.85 }));
    svg.appendChild(set(document.createElementNS(NS, 'polygon'), { points: `${x2},${y2} ${ex + px},${ey + py} ${ex - px},${ey - py}`, fill: m.color, opacity: 0.85 }));
  });
  boardEl.appendChild(svg);
}
const sqAt = (e) => document.elementFromPoint(e.clientX, e.clientY)?.closest('.sq')?.dataset.sq || null;
boardEl.addEventListener('contextmenu', (e) => e.preventDefault());
boardEl.addEventListener('pointerup', (e) => {
  if (e.button !== 2 || !rcStart) return;
  const to = sqAt(e), from = rcStart; rcStart = null;
  if (!to) return;
  const color = markColor(e);
  const i = userMarks.findIndex((m) => m.from === from && m.to === to);
  if (i >= 0) { const same = userMarks[i].color === color; userMarks.splice(i, 1); if (same) { drawUserMarks(); return; } }
  userMarks.push({ from, to, color });
  drawUserMarks();
});
const premoveActive = () => (mode === 'online' || mode === 'bot' || (mode === 'analysis' && window.__drillClk)) && S.premove && !over && ply === moves.length && game.turn() !== myColor;
boardEl.addEventListener('pointerdown', (e) => {
  if (e.button === 2) {
    rcStart = sqAt(e); selected = null;
    if (premoves.length) { premoves = []; render(); }
    return;
  }
  if (userMarks.length) { userMarks = []; drawUserMarks(); }
  const sq = e.target.closest('.sq');
  if (!sq) return;
  try { if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) e.target.releasePointerCapture(e.pointerId); } catch {}
  const name = sq.dataset.sq;
  const pm = premoveActive();
  const pg = pm ? premoveBoard() : null;
  const p = pm ? (pg && pg.get(name)) : game.get(name);
  if (pm) {
    const mine = p && p.color === myColor;
    if (selected && selected !== name && pg && premoveTargets(pg, selected).includes(name)) { if (premoves.length < (S.premoveMax || 10)) premoves.push({ from: selected, to: name }); selected = null; render(); return; }
    if (!mine) { selected = null; render(); return; }
  }
  if (!pm && selected && selected !== name && game.moves({ square: selected, verbose: true }).some((m) => m.to === name)) { tryMove(selected, name); return; }
  const own = pm || (p && p.color === game.turn() && (mode === 'analysis' || (canMoveNow() && p.color === myColor)));
  if (own) {
    selected = name; render();
    const el = boardEl.querySelector(`.sq[data-sq="${name}"] .piece`);
    if (el) {
      const rect = el.getBoundingClientRect();
      const ghost = el.cloneNode(true);
      ghost.classList.remove('slide'); ghost.classList.add('drag');
      ghost.style.width = rect.width + 'px'; ghost.style.height = rect.height + 'px';
      document.body.appendChild(ghost);
      el.style.opacity = 0.3;
      drag = { from: name, ghost, w: rect.width, h: rect.height };
      moveGhost(e);
    }
  } else { selected = null; render(); }
});
function moveGhost(e) {
  if (!drag) return;
  drag.ghost.style.left = e.clientX - drag.w / 2 + 'px';
  drag.ghost.style.top = e.clientY - drag.h / 2 + 'px';
}
window.addEventListener('pointermove', moveGhost);
window.addEventListener('pointercancel', (e) => { if (drag) window.dispatchEvent(new PointerEvent('pointerup', { clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId })); });
window.addEventListener('pointerup', (e) => {
  if (!drag) return;
  const { from, ghost } = drag;
  drag = null; ghost.remove();
  const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.sq');
  if (target && target.dataset.sq !== from && premoveActive()) {
    const pg = premoveBoard();
    if (pg && premoveTargets(pg, from).includes(target.dataset.sq) && premoves.length < (S.premoveMax || 10)) premoves.push({ from, to: target.dataset.sq });
    selected = null; render();
  }
  else if (target && target.dataset.sq !== from) tryMove(from, target.dataset.sq).then((ok) => { if (!ok) render(); });
  else render();
});

let worker = null;
let engineReady = false;
let searching = false;
let searchKind = null;
let pendingFn = null;
let botThinking = false;
let analysedFen = START_FEN;
let engineLabel = '';

function startEngine() {
  const isolated = self.crossOriginIsolated && typeof SharedArrayBuffer !== 'undefined';
  const file = isolated ? 'stockfish-19.js' : 'stockfish-19-lite-single.js';
  engineLabel = isolated ? 'Stockfish 19 (pełny, wielowątkowy)' : 'Stockfish 19 lite';
  $('engineStatus').textContent = 'Ładowanie silnika…';
  const hw = navigator.hardwareConcurrency || 4;
  const sel = $('threads');
  const maxT = isolated ? hw : 1;
  for (let t = 1; t <= maxT; t++) sel.add(new Option(t, t));
  sel.value = Math.max(1, Math.min(maxT, hw - 1));
  sel.disabled = !isolated;
  if (!isolated) $('hash').value = '64';
  worker = new Worker('/engine/' + file);
  worker.onmessage = (ev) => onEngineLine(String(ev.data));
  worker.onerror = (e) => { $('engineStatus').textContent = 'Błąd silnika: ' + (e.message || '?'); };
  worker.postMessage('uci');
}
const send = (c) => worker.postMessage(c);
function engineRun(fn) {
  if (!engineReady) return;
  if (searching) { pendingFn = fn; send('stop'); } else fn();
}

function onEngineLine(line) {
  if (line === 'uciok') {
    send('setoption name Threads value ' + ($('threads').value || 1));
    send('setoption name Hash value ' + $('hash').value);
    send('isready');
  } else if (line === 'readyok') {
    if (!engineReady) { engineReady = true; $('engineStatus').textContent = engineLabel; refresh(); }
    else if (reviewReadyCb) { const cb = reviewReadyCb; reviewReadyCb = null; cb(); }
  } else if (line.startsWith('bestmove')) {
    searching = false;
    const f = pendingFn; pendingFn = null;
    if (f) { reviewQueue = null; f(); return; }
    if (searchKind === 'review') {
      const bm = line.split(/\s+/)[1];
      if (bm && bm !== '(none)') bestByFen[fenKey(analysedFen)] = bm;
      reviewNext(); return;
    }
    if (searchKind === 'bot' && botThinking) {
      botThinking = false;
      const uci = line.split(/\s+/)[1];
      if (uci && uci !== '(none)' && inGame() && mode === 'bot' && game.turn() !== myColor && ply === moves.length) {
        const fenAt = game.fen();
        const wait = Math.max(0, botThinkMs - (performance.now() - botT0));
        setTimeout(() => {
          if (mode === 'bot' && !over && game.fen() === fenAt && ply === moves.length) applyMove(uci.slice(0, 2), uci.slice(2, 4), uci[4]);
        }, wait);
      }
    }
  } else if (line.startsWith('info') && line.includes(' pv ') && searching && !pendingFn) {
    parseInfo(line);
  }
}

function refresh() {
  if (reviewQueue || searchKind === 'review') return;
  botThinking = false;
  engineRun(() => {
    lines = [];
    renderLines();
    if (mode === 'bot' && !over && ply === moves.length && game.turn() !== myColor && !game.isGameOver()) startBot();
    else if (analysisActive()) startAnalysis();
    drawArrows(); updateEvalBar();
    document.body.classList.toggle('no-eval', !analysisActive());
  });
}
function startAnalysis() {
  if (game.isGameOver()) { showGameOverInfo(); return; }
  analysedFen = game.fen();
  searching = true; searchKind = 'analysis';
  send('setoption name UCI_LimitStrength value false');
  send('setoption name Skill Level value 20');
  send('setoption name MultiPV value ' + (tab === 'coach' ? 1 : $('multipv').value));
  send('position fen ' + analysedFen);
  send('go infinite');
}
function startBot() {
  const elo = botInfo && botInfo.realElo != null ? botInfo.realElo : botElo(botLevel);
  const pRand = elo < 1320 ? Math.min(1, ((1320 - elo) / 1320) * 1.15) : 0;
  if (Math.random() < pRand) {
    const ms = game.moves({ verbose: true });
    if (ms.length) {
      const m = ms[Math.floor(Math.random() * ms.length)];
      const fenAt = game.fen();
      botThinking = false;
      setTimeout(() => {
        if (mode === 'bot' && !over && game.fen() === fenAt) applyMove(m.from, m.to, m.promotion);
      }, 400 + Math.random() * 700);
      return;
    }
  }
  botThinking = true; searching = true; searchKind = 'bot';
  botT0 = performance.now(); botThinkMs = 1200 + Math.random() * 2300;
  analysedFen = game.fen();
  if (elo >= 1320 && elo < 2800) { send('setoption name UCI_LimitStrength value true'); send('setoption name UCI_Elo value ' + Math.min(3190, elo)); }
  else { send('setoption name UCI_LimitStrength value false'); send('setoption name Skill Level value ' + botLevel); }
  send('setoption name MultiPV value 1');
  send('position fen ' + analysedFen);
  send(elo < 1320 ? 'go depth 1' : 'go movetime ' + (150 + botLevel * 60));
}

let reviewQueue = null;
function reviewStepBoard(targetPly) {
  targetPly = Math.max(0, Math.min(moves.length, targetPly));
  if (targetPly === ply) return;
  ply = targetPly;
  selected = null;
  animate = true;
  render();
}
function showReviewLoader(pct, sub, activeMoveIdx) {
  if ($('endCard') && !$('endCard').hidden) return;
  const box = $('reviewLoader');
  if (!box) return;
  box.hidden = false;
  if ($('rlAv') && !$('rlAv').innerHTML) $('rlAv').innerHTML = COACH_SVG;
  if ($('rlFill')) $('rlFill').style.width = Math.max(0, Math.min(100, pct)) + '%';
  if ($('rlPct')) $('rlPct').textContent = Math.round(pct) + '%';
  if ($('rlSub') && sub) $('rlSub').textContent = sub;
  const mvBox = $('rlMoves');
  if (mvBox) {
    if (!mvBox.children.length || mvBox.dataset.len !== String(moves.length)) {
      mvBox.innerHTML = '';
      mvBox.dataset.len = String(moves.length);
      moves.forEach((m, i) => {
        const sp = document.createElement('span');
        sp.className = 'rl-mv';
        sp.textContent = (i % 2 === 0 ? Math.floor(i / 2) + 1 + '.' : '') + m.san;
        mvBox.appendChild(sp);
      });
    }
    const kids = mvBox.children;
    for (let i = 0; i < kids.length; i++) {
      kids[i].classList.toggle('done', i < activeMoveIdx);
      kids[i].classList.toggle('cur', i === activeMoveIdx);
    }
    if (kids[activeMoveIdx]) kids[activeMoveIdx].scrollIntoView({ block: 'nearest', inline: 'center' });
  }
}
function hideReviewLoader() {
  const box = $('reviewLoader');
  if (box) box.hidden = true;
}
function playQuickReviewAnim(cb) {
  if (!moves.length) { cb(); return; }
  if ($('endCard') && !$('endCard').hidden) { cb(); return; }
  const total = moves.length;
  let step = 0;
  reviewStepBoard(0);
  showReviewLoader(0, 'Przygotowuję przegląd partii…', 0);
  const iv = setInterval(() => {
    step += 1;
    const pct = Math.min(100, (step / total) * 100);
    const sub = pct < 35 ? 'Sprawdzam debiut i teorię…' : pct < 75 ? 'Analizuję kluczowe zagrania…' : 'Obliczam dokładność i ocenę gry…';
    reviewStepBoard(step);
    showReviewLoader(pct, sub, Math.min(total - 1, step - 1));
    if (step >= total) {
      clearInterval(iv);
      setTimeout(() => { hideReviewLoader(); cb(); }, 220);
    }
  }, Math.max(35, Math.min(90, Math.round(1400 / total))));
}
function startReview() {
  if (mode !== 'analysis' || !moves.length) return;
  const g = new Chess(startFen);
  const fens = [g.fen()];
  for (const mv of moves) { g.move({ from: mv.from, to: mv.to, promotion: mv.promotion }); fens.push(g.fen()); }
  const todo = [];
  for (const f of fens) {
    const k = fenKey(f);
    if (k === fenKey(START_FEN) && evalByFen[k] !== undefined && Math.abs(evalByFen[k]) > 200) {
      delete evalByFen[k]; delete evalDepth[k];
    }
    if ((evalDepth[k] || 0) >= 8) continue;
    const c = new Chess(f);
    if (c.isCheckmate()) { evalByFen[k] = c.turn() === 'w' ? -10000 : 10000; evalDepth[k] = 99; }
    else if (c.isGameOver()) { evalByFen[k] = 0; evalDepth[k] = 99; }
    else todo.push(f);
  }
  reviewTotal = todo.length;
  if (!todo.length) {
    playQuickReviewAnim(() => {
      renderMoves(); renderSummary(); renderGraph(); attachStats(); updateEndCard(); refresh();
    });
    return;
  }
  if ($('endCard') && $('endCard').hidden) reviewStepBoard(0);
  showReviewLoader(2, 'Uruchamiam silnik Stockfish…', 0);
  engineRun(() => {
    send('setoption name UCI_LimitStrength value false');
    send('setoption name Skill Level value 20');
    send('setoption name MultiPV value 1');
    reviewReadyCb = () => {
      reviewQueue = todo;
      reviewNext();
    };
    send('isready');
  });
}
let reviewTotal = 0, reviewWatchdog = null, reviewForceSkip = null, reviewReadyCb = null;
function reviewNext() {
  clearTimeout(reviewWatchdog);
  clearTimeout(reviewForceSkip);
  if (!reviewQueue || !reviewQueue.length) {
    reviewQueue = null; searchKind = null;
    if ($('endCard') && $('endCard').hidden) reviewStepBoard(moves.length);
    showReviewLoader(100, 'Gotowe! Zestawiam raport…', moves.length - 1);
    setTimeout(() => {
      hideReviewLoader();
      $('reviewInfo').textContent = 'Przegląd zakończony.';
      renderMoves(); renderSummary(); renderGraph(); attachStats(); updateEndCard(); refresh();
    }, 240);
    return;
  }
  const f = reviewQueue.shift();
  const done = reviewTotal - reviewQueue.length;
  const pct = reviewTotal ? (done / reviewTotal) * 100 : 100;
  const sub = pct < 25 ? 'Sprawdzam debiut i teorię…' : pct < 60 ? 'Analizuję taktyki i poświęcenia…' : pct < 90 ? 'Szukam błędów i najlepszych ruchów…' : 'Obliczam dokładność i ocenę gry…';
  const targetPly = reviewTotal > 1 ? Math.round(((done - 1) / (reviewTotal - 1)) * moves.length) : moves.length;
  const mvIdx = Math.max(0, Math.min(moves.length - 1, targetPly - 1));
  if ($('endCard') && $('endCard').hidden) reviewStepBoard(targetPly);
  showReviewLoader(pct, sub, mvIdx);
  $('reviewInfo').textContent = `Analizuję pozycje… ${done}/${reviewTotal}`;
  analysedFen = f; searching = true; searchKind = 'review';
  send('position fen ' + f);
  send('go movetime 140');
  reviewWatchdog = setTimeout(() => {
    if (searchKind === 'review' && reviewQueue) {
      send('stop');
      reviewForceSkip = setTimeout(() => {
        if (searchKind === 'review' && reviewQueue) { searching = false; reviewNext(); }
      }, 400);
    }
  }, 1000);
}
function renderGraph() {
  const box = $('evalGraph');
  box.innerHTML = '';
  if (!moves.length) return;
  const g = new Chess(startFen), vals = [];
  const push = () => { const v = evalByFen[fenKey(g.fen())]; vals.push(v === undefined ? null : Math.max(-800, Math.min(800, v))); };
  push();
  for (const m of moves) { g.move({ from: m.from, to: m.to, promotion: m.promotion }); push(); }
  if (vals.filter((v) => v !== null).length < 2) return;
  const W = 400, H = 96, n = vals.length - 1 || 1;
  const X = (i) => (i / n) * W, Y = (v) => H / 2 - (v / 800) * (H / 2 - 4);
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('preserveAspectRatio', 'none');
  const bgDark = document.createElementNS(NS, 'rect');
  for (const [k, v] of Object.entries({ x: 0, y: 0, width: W, height: H, fill: '#1a1917' })) bgDark.setAttribute(k, v);
  const defs = document.createElementNS(NS, 'defs');
  const clip = document.createElementNS(NS, 'clipPath');
  clip.setAttribute('id', 'egClip');
  let d = '', last = 0;
  vals.forEach((v, i) => { if (v === null) v = last; last = v; d += (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); });
  const clipPath = document.createElementNS(NS, 'path');
  clipPath.setAttribute('d', d + `L${W} ${H}L0 ${H}Z`);
  clip.appendChild(clipPath);
  defs.appendChild(clip);
  const whiteRect = document.createElementNS(NS, 'rect');
  for (const [k, v] of Object.entries({ x: 0, y: 0, width: W, height: H, fill: '#e8e6e3', 'clip-path': 'url(#egClip)' })) whiteRect.setAttribute(k, v);
  const mid = document.createElementNS(NS, 'line');
  for (const [k, v] of Object.entries({ x1: 0, x2: W, y1: H / 2, y2: H / 2, stroke: 'rgba(130,130,130,.5)', 'stroke-width': 1 })) mid.setAttribute(k, v);
  const line = document.createElementNS(NS, 'path');
  line.setAttribute('d', d); line.setAttribute('fill', 'none'); line.setAttribute('stroke', '#81b64c'); line.setAttribute('stroke-width', '1.8'); line.setAttribute('vector-effect', 'non-scaling-stroke');
  const curVal = vals[ply] !== null && vals[ply] !== undefined ? vals[ply] : last;
  const cur = document.createElementNS(NS, 'line');
  for (const [k, v] of Object.entries({ x1: X(ply), x2: X(ply), y1: 0, y2: H, stroke: '#81b64c', 'stroke-width': 1.5, 'stroke-dasharray': '3 2' })) cur.setAttribute(k, v);
  const dot = document.createElementNS(NS, 'circle');
  for (const [k, v] of Object.entries({ cx: X(ply), cy: Y(curVal), r: 4, fill: '#81b64c', stroke: '#fff', 'stroke-width': 1.5 })) dot.setAttribute(k, v);
  svg.append(defs, bgDark, whiteRect, mid, line, cur, dot);
  svg.onclick = (e) => { const r = svg.getBoundingClientRect(); goTo(Math.round(((e.clientX - r.left) / r.width) * n)); };
  box.appendChild(svg);
}
function computeReviewStats() {
  const qual = computeQuality();
  if (!moves.length || !qual.some(Boolean)) return null;
  const winPct = (cp) => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * Math.max(-1000, Math.min(1000, cp)))) - 1);
  const gAcc = new Chess(startFen), moveAcc = [];
  for (let i = 0; i < moves.length; i++) {
    const bf = evalByFen[fenKey(gAcc.fen())], mover = gAcc.turn();
    gAcc.move({ from: moves[i].from, to: moves[i].to, promotion: moves[i].promotion });
    const af = evalByFen[fenKey(gAcc.fen())];
    if (bf === undefined || af === undefined) { moveAcc.push(null); continue; }
    const sgn = mover === 'w' ? 1 : -1;
    const drop = Math.max(0, winPct(bf * sgn) - winPct(af * sgn));
    moveAcc.push(Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * drop) - 3.1669)));
  }
  const side = (parity) => {
    const cnt = {};
    let sum = 0, n = 0;
    qual.forEach((q, i) => {
      if (!q || i % 2 !== parity) return;
      cnt[q] = (cnt[q] || 0) + 1;
      if (moveAcc[i] !== null) { sum += moveAcc[i]; n++; }
    });
    const acc = n ? +(sum / n).toFixed(1) : 0;
    const est = n ? Math.max(100, Math.min(2800, Math.round(150 + (acc / 100) ** 2.2 * 2350))) : 0;
    return { cnt, acc, est };
  };
  return { qual, w: side(0), b: side(1) };
}
function renderSummary() {
  const box = $('reviewSummary');
  box.innerHTML = '';
  const st = computeReviewStats();
  if (!st) { if ($('btnNextKey')) $('btnNextKey').hidden = true; return; }
  const { w, b, qual } = st;
  const hasKey = qual.some((q) => q === 'brilliant' || q === 'great' || q === 'inaccuracy' || q === 'mistake' || q === 'blunder');
  if ($('btnNextKey')) $('btnNextKey').hidden = !hasKey;
  const head = document.createElement('div');
  head.className = 'rs-row rs-head';
  head.innerHTML = '<span></span><b>Białe</b><b>Czarne</b>';
  box.appendChild(head);
  const acc = document.createElement('div');
  acc.className = 'rs-row rs-acc';
  acc.innerHTML = '<span>Dokładność</span><b></b><b></b>';
  acc.children[1].textContent = w.acc + '%'; acc.children[2].textContent = b.acc + '%';
  box.appendChild(acc);
  const est = document.createElement('div');
  est.className = 'rs-row rs-est';
  est.innerHTML = '<span>Ocena gry</span><b></b><b></b>';
  est.children[1].textContent = w.est || '—'; est.children[2].textContent = b.est || '—';
  box.appendChild(est);
  for (const k of Object.keys(QUAL)) {
    const r = document.createElement('div');
    r.className = 'rs-row';
    r.innerHTML = '<span><i class="q ' + k + '"></i> </span><b></b><b></b>';
    r.children[0].append(QUAL[k][1]);
    r.children[1].textContent = w.cnt[k] || 0; r.children[2].textContent = b.cnt[k] || 0;
    box.appendChild(r);
  }
}
function parseInfo(line) {
  const t = line.split(/\s+/);
  const get = (k) => { const i = t.indexOf(k); return i >= 0 ? t[i + 1] : undefined; };
  const si = t.indexOf('score');
  if (si < 0) return;
  const mpv = +(get('multipv') || 1);
  let val = +t[si + 2];
  if (analysedFen.split(' ')[1] === 'b') val = -val;
  const kind = t[si + 1];
  const depth = +get('depth');
  if (mpv === 1) {
    lastEvalWhite = kind === 'mate' ? (val > 0 ? 10000 : -10000) : val;
    const key = fenKey(analysedFen);
    if (key === fenKey(START_FEN) && Math.abs(lastEvalWhite) > 200) return;
    if (depth >= (evalDepth[key] || 0)) {
      const first = !(evalDepth[key] >= 12);
      evalByFen[key] = lastEvalWhite; evalDepth[key] = depth;
      if (depth >= 12 && first && S.classify) renderMoves();
    }
    checkCoach(depth);
  }
  if (searchKind !== 'analysis') return;
  const pv = t.slice(t.indexOf('pv') + 1);
  lines[mpv - 1] = { depth, kind, val, pv, uci: pv[0], nodes: +get('nodes'), nps: +get('nps'), seldepth: +get('seldepth') };
  renderLines();
  if (mpv === 1) updateEvalBar();
  drawArrows();
}

function fmtScore(l) {
  if (l.kind === 'mate') return (l.val > 0 ? '+M' : '-M') + Math.abs(l.val);
  const v = l.val / 100;
  return (v > 0 ? '+' : '') + v.toFixed(2);
}
function pvToSan(l) {
  const g = new Chess(analysedFen);
  const out = [];
  for (let i = 0; i < Math.min(l.pv.length, 14); i++) {
    const u = l.pv[i];
    const prefix = g.turn() === 'w' ? g.moveNumber() + '. ' : i === 0 ? g.moveNumber() + '... ' : '';
    try { out.push(prefix + g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san); } catch { break; }
  }
  return out.join(' ');
}
function renderLines() {
  const ol = $('lines');
  ol.innerHTML = '';
  const top = lines[0];
  if (top) {
    const nps = top.nps ? Math.round(top.nps / 1000) + ' kn/s' : '';
    $('engineInfo').textContent = `głębokość ${top.depth}/${top.seldepth || top.depth} · ${(top.nodes / 1e6).toFixed(1)}M węzłów · ${nps} · nieskończona analiza`;
  } else if (!game.isGameOver()) $('engineInfo').textContent = analysisOn ? 'głębokość –' : 'silnik wyłączony';
  lines.forEach((l) => {
    if (!l) return;
    const li = document.createElement('li');
    const sc = document.createElement('span');
    sc.className = 'score' + (l.val < 0 ? ' neg' : '');
    sc.textContent = fmtScore(l);
    const pv = document.createElement('span');
    pv.className = 'pv'; pv.textContent = pvToSan(l);
    li.append(sc, pv);
    li.onclick = () => tryMove(l.uci.slice(0, 2), l.uci.slice(2, 4));
    ol.appendChild(li);
  });
}
function showGameOverInfo() {
  let msg = 'Remis';
  if (game.isCheckmate()) msg = 'Mat — wygrywają ' + (game.turn() === 'w' ? 'czarne' : 'białe');
  else if (game.isStalemate()) msg = 'Pat';
  $('engineInfo').textContent = msg;
  lines = []; $('lines').innerHTML = '';
}
function updateEvalBar() {
  const blk = $('evalBlack'), lbl = $('evalLabel');
  let frac = 0.5, text = '0.0';
  if (game.isCheckmate()) { frac = game.turn() === 'w' ? 0 : 1; text = game.turn() === 'w' ? '0-1' : '1-0'; }
  else if (lines[0] && analysisActive()) {
    const l = lines[0];
    if (l.kind === 'mate') { frac = l.val > 0 ? 1 : 0; text = 'M' + Math.abs(l.val); }
    else { frac = 1 / (1 + Math.exp(-l.val / 400)); text = Math.abs(l.val / 100).toFixed(1); }
  }
  blk.style.height = (1 - frac) * 100 + '%';
  blk.style.top = flipped ? 'auto' : '0';
  blk.style.bottom = flipped ? '0' : 'auto';
  lbl.textContent = text;
  const whiteAhead = frac >= 0.5;
  const atBottom = whiteAhead !== flipped;
  lbl.style.top = atBottom ? 'auto' : '4px';
  lbl.style.bottom = atBottom ? '4px' : 'auto';
  lbl.style.color = whiteAhead ? '#403d39' : '#fff';
}

$('coachAvatar').innerHTML = COACH_SVG;
$('endAv').innerHTML = COACH_SVG;
const coachWatching = () => $('coachAuto').checked && ((mode === 'analysis' && tab === 'coach') || (mode === 'bot' && botInfo && botInfo.coach));

function coachSay(text) {
  $('coachSay').textContent = text;
  try {
    if (!S.sound || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, ''));
    u.lang = 'pl-PL'; u.rate = 1;
    const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.startsWith('pl'));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch {}
}
function checkCoach(depth) {
  if (!coachPending) return;
  const need = searchKind === 'bot' ? 6 : 12;
  if (depth < need) return;
  const { mover, prev, san } = coachPending;
  coachPending = null;
  const loss = mover === 'w' ? prev - lastEvalWhite : lastEvalWhite - prev;
  let msg;
  if (loss < 30) msg = `${san} — świetny ruch! Dokładnie to bym zagrał. 😎`;
  else if (loss < 80) msg = `${san} — dobry ruch, trzymasz poziom.`;
  else if (loss < 200) msg = `${san} — hmm, niedokładność. Był trochę lepszy ruch.`;
  else if (loss < 400) msg = `${san} — ojoj, to błąd. Sprawdź, czy nie zostawiasz czegoś bez obrony!`;
  else msg = `${san} — poważny błąd! Spokojnie, każdy się uczy. Cofnij i pomyśl jeszcze raz.`;
  coachSay(msg);
}
$('coachHint').onclick = () => {
  if (mode === 'analysis' && lines[0]) {
    const g = new Chess(analysedFen);
    const u = lines[0].uci;
    try { coachSay(`Spróbuj ${g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san}! 💡`); } catch {}
  } else if (mode === 'analysis') coachSay('Daj mi chwilkę, liczę…');
  else coachSay('W lekcji nie podpowiadam, dasz radę sam! 😉');
};
$('coachExplain').onclick = () => {
  if (mode !== 'analysis') return coachSay('Oceniam tylko w trybie swobodnym.');
  const v = lastEvalWhite / 100;
  const side = v > 0 ? 'białe' : 'czarne';
  const a = Math.abs(v);
  if (game.isGameOver()) return coachSay('Partia już skończona!');
  if (a > 50) return coachSay(`Jest mat w polu widzenia! Wygrywają ${side}.`);
  if (a < 0.3) coachSay('Pozycja jest wyrównana. Nikt nie ma przewagi.');
  else if (a < 1) coachSay(`Lekka przewaga ${side === 'białe' ? 'białych' : 'czarnych'} (${a.toFixed(1)}).`);
  else if (a < 3) coachSay(`${side === 'białe' ? 'Białe' : 'Czarne'} stoją wyraźnie lepiej (${a.toFixed(1)}).`);
  else coachSay(`${side === 'białe' ? 'Białe' : 'Czarne'} mają ogromną przewagę (${a.toFixed(1)}), to prawie wygrana!`);
};
$('coachLevel').oninput = (e) => { $('coachLevelVal').textContent = e.target.value; };

function coachLog(who, text) {
  const log = $('coachLog');
  const d = document.createElement('div');
  d.className = 'cl ' + (who === 'me' ? 'me' : 'coach');
  d.textContent = text;
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
}
function coachChat(raw) {
  const text = raw.trim();
  if (!text) return;
  coachLog('me', text);
  const q = text.toLowerCase();
  const has = (...w) => w.some((x) => q.includes(x));
  const say = (t) => { coachLog('coach', t); coachSay(t); };
  if (has('cofnij', 'cofn', 'undo')) {
    if (mode === 'bot' && botInfo && botInfo.coach) { undoWithCoach(); coachLog('coach', 'Jasne, cofamy ruch. Pomyśl jeszcze raz! 🙂'); }
    else if (mode === 'analysis' && ply > 0) { $('btnUndo').click(); coachLog('coach', 'Cofnięte!'); }
    else say('Nie ma czego cofać.');
  } else if (has('podpowied', 'pomoc', 'hint', 'jaki ruch')) {
    if (mode === 'bot') say('W lekcji nie podpowiadam, ale możesz cofnąć ruch. Dasz radę! 😉');
    else if (lines[0]) {
      const g = new Chess(analysedFen), u = lines[0].uci;
      try { say(`Spróbuj ${g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san}! 💡`); } catch { say('Hmm, nie mam pewności.'); }
    } else say('Daj mi chwilkę, liczę…');
  } else if (has('ocen', 'pozycj', 'kto wygrywa', 'przewag')) {
    if (mode !== 'analysis') say('Oceniam tylko w trybie swobodnym, w lekcji gramy na czuja!');
    else { $('coachExplain').click(); coachLog('coach', $('coachSay').textContent); }
  } else if (has('nowa', 'lekcj', 'zagraj', 'gramy')) {
    $('coachPlay').click(); coachLog('coach', $('coachSay').textContent);
  } else if (has('cześć', 'czesc', 'hej', 'siema', 'witaj')) say('Cześć! Co dziś trenujemy? Taktykę, końcówki, czy gramy lekcję?');
  else if (has('dzięk', 'dzieki', 'thx')) say('Nie ma sprawy! Do roboty. 😄');
  else if (has('otwarci', 'debiut')) say('Na start: kontroluj środek, wyprowadzaj skoczki i gońce, zrób roszadę. Hetmanem nie biegaj za wcześnie!');
  else if (has('końców', 'koncow')) say('W końcówce aktywuj króla i twórz wolne piony. Król to silna figura, gdy nie ma hetmanów!');
  else if (has('taktyk')) say('Szukaj szachów, bić i gróźb, w tej kolejności. Przed każdym ruchem sprawdź, co grozi Tobie.');
  else if (has('kto', 'jak masz', 'ile masz')) say('Jestem LiLKasteusz, Twój trener szachowy. Uwielbiam taktykę! ♟');
  else say('Nie do końca rozumiem 😅 Napisz: podpowiedź, ocena, cofnij, nowa lekcja albo zapytaj o debiut, końcówkę lub taktykę.');
}
$('coachSend').onclick = () => { coachChat($('coachIn').value); $('coachIn').value = ''; };
$('coachIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('coachSend').click(); });
$('coachPlay').onclick = () => {
  const lv = +$('coachLevel').value;
  startBotGame(Math.random() < 0.5 ? 'w' : 'b', { n: 'LiLKasteusz', e: '🎓', lv, coach: true });
  coachSay('Gramy lekcję! Będę komentował Twoje ruchy. Powodzenia! 🎓');
};

let selBot = BOTS[3];
function buildBots() {
  const list = $('botList');
  BOTS.forEach((b) => {
    const d = document.createElement('div');
    d.className = 'bot' + (b === selBot ? ' sel' : '');
    d.innerHTML = `<div class="face">${b.e}</div><div><div class="nm"></div><div class="ds"></div></div><div class="el">≈${botElo(b.lv)}</div>`;
    d.querySelector('.nm').textContent = b.n;
    d.querySelector('.ds').textContent = b.d;
    d.onclick = () => { selBot = b; list.querySelectorAll('.bot').forEach((x) => x.classList.toggle('sel', x === d)); };
    list.appendChild(d);
  });
}

function startBotGame(color, info) {
  if (!user) { $('authErr').textContent = 'Aby grać, załóż konto lub się zaloguj.'; $('authModal').hidden = false; return; }
  if (mode === 'online' && !over) return alert('Najpierw dokończ partię online.');
  if (color === 'r') color = Math.random() < 0.5 ? 'w' : 'b';
  botInfo = info || selBot;
  botLevel = botInfo.lv;
  mode = 'bot'; over = false; myColor = color; opp = null; coachPending = null; clk = null; premoves = []; $('endCard').hidden = true;
  startFen = START_FEN; moves = []; ply = 0; selected = null; lines = [];
  flipped = color === 'b';
  $('gamePanel').hidden = false; $('gameTitle').textContent = 'Partia z botem';
  $('btnDraw').hidden = true; $('chatIn').hidden = true; $('chat').hidden = true;
  if (tab !== 'coach') setTab('play'); else { render(); refresh(); }
  if (tab === 'play') { render(); refresh(); }
  playSheet(false);
}
function finishBot() {
  let title = 'Remis', text = 'remis';
  if (game.isCheckmate()) {
    const winner = game.turn() === 'w' ? 'b' : 'w';
    title = winner === myColor ? 'Wygrałeś!' : 'Przegrałeś';
    text = 'przez szach mat';
  } else if (game.isStalemate()) text = 'pat';
  if (botInfo.coach) coachSay(title === 'Wygrałeś!' ? 'Wygrałeś, brawo! Zasłużyłeś. 🏆' : title === 'Remis' ? 'Remis, całkiem dobrze!' : 'Tym razem ja wygrałem, ale świetnie walczyłeś. Zagramy jeszcze?');
  endLocal(title, text);
}
function endLocal(title, text) {
  over = true; botThinking = false;
  const res_ = title.startsWith('Wygra') ? 'w' : title === 'Remis' ? 'd' : 'l';
  saveGame(res_);
  if (botInfo && botInfo.matched && user && moves.length > 1) {
    const oppRt = botShownElo(botInfo);
    if (serverUp()) wsSend({ t: 'botResult', res: res_, cat: botInfo.cat, botElo: oppRt });
    else text += ' ·' + localElo(res_, botInfo.cat, oppRt);
  }
  showResult(title, text);
  mode = 'analysis';
  $('gamePanel').hidden = true;
  botInfo = botInfo ? { ...botInfo, finished: true } : botInfo;
  setTab('analysis');
  if (moves.length) setTimeout(() => { $('reviewInfo').textContent = ''; startReview(); }, 300);
}
let lastBot = null, lastColor = 'w', lastEndInfo = null;
function renderEndPlayers() {
  const box = $('endPlayers');
  if (!box || !lastEndInfo) return;
  const { win, draw, oppName, oppElo, myName, myElo, eloDelta } = lastEndInfo;
  const loss = !win && !draw;
  const mkSide = (name, elo, avText, isWinner, delta) => {
    const d = document.createElement('div');
    d.className = 'ep-side' + (isWinner ? ' winner' : '');
    const av = document.createElement('div');
    av.className = 'ep-av';
    av.textContent = avText;
    const info = document.createElement('div');
    info.className = 'ep-info';
    const nm = document.createElement('div');
    nm.className = 'ep-name';
    nm.textContent = name;
    const rt = document.createElement('div');
    rt.className = 'ep-elo';
    rt.textContent = elo ? `(${elo})` : '';
    if (typeof delta === 'number') {
      const p = document.createElement('span');
      p.className = 'ep-delta ' + (delta > 0 ? 'pos' : delta < 0 ? 'neg' : 'neu');
      p.textContent = (delta >= 0 ? '+' : '') + delta;
      rt.append(' ', p);
    }
    info.append(nm, rt);
    d.append(av, info);
    return d;
  };
  box.innerHTML = '';
  const vs = document.createElement('div');
  vs.className = 'ep-vs';
  vs.textContent = 'vs';
  box.append(
    mkSide(myName, myElo, myName.slice(0, 1).toUpperCase(), win, eloDelta),
    vs,
    mkSide(oppName, oppElo, lastBot ? (lastBot.coach ? '🎓' : lastBot.e || '🤖') : oppName.slice(0, 1).toUpperCase(), loss, null)
  );
}
function showResult(title, text, extra) {
  lastBot = mode === 'bot' && botInfo ? { ...botInfo } : null;
  lastColor = myColor;
  const oppName = lastBot ? (lastBot.coach ? 'Trener LiLKasteusz' : lastBot.n) : opp ? opp.name : 'Przeciwnik';
  const cat = (extra && extra.cat) || (lastBot && lastBot.cat) || onlineCat || 'blitz';
  const myName = user ? user.name : 'Ty';
  const myElo = user && user.ratings ? Math.round(user.ratings[cat] || 100) : null;
  const oppElo = lastBot ? botShownElo(lastBot) : opp ? opp.rating : null;
  const win = title.startsWith('Wygra'), draw = title === 'Remis';
  lastEndInfo = { win, draw, oppName, oppElo, myName, myElo, eloDelta: extra && typeof extra.delta === 'number' ? extra.delta : null, cat };
  const banner = $('endBanner');
  if (banner) banner.className = 'endbanner ' + (win ? 'win' : draw ? 'draw' : 'loss');
  $('endIcon').textContent = win ? '🏆' : draw ? '🤝' : '✖';
  $('endTitle').textContent = win ? 'Wygrałeś!' : draw ? 'Remis' : 'Przegrałeś';
  const cleanReason = String(text || '').replace(/\s*·.*$/, '');
  $('endSub').textContent = cleanReason.charAt(0).toUpperCase() + cleanReason.slice(1);
  $('endMsg').textContent = win ? 'Świetna partia! Sprawdź analizę, żeby zobaczyć najlepsze ruchy.' : draw ? 'Wyrównana walka. Zobacz dokładność w przeglądzie partii.' : 'Każda porażka to lekcja. Sprawdź kluczowe momenty w analizie!';
  renderEndPlayers();
  const accBox = $('endAcc');
  if (accBox) {
    if (moves.length) { accBox.hidden = false; accBox.innerHTML = '<div class="endacc-wait">Analizuję dokładność partii…</div>'; }
    else accBox.hidden = true;
  }
  $('endStats').innerHTML = '';
  $('btnEndRematch').hidden = !lastBot;
  $('endCard').hidden = false;
}
function updateEndCard() {
  if ($('endCard').hidden) return;
  const st = computeReviewStats();
  const accBox = $('endAcc');
  if (accBox && st) {
    const meSide = lastColor === 'w' ? st.w : st.b;
    const opSide = lastColor === 'w' ? st.b : st.w;
    accBox.hidden = false;
    accBox.innerHTML = `
      <div class="ea-col"><span class="ea-lbl">Twoja dokładność</span><b class="ea-val">${meSide.acc}%</b><span class="ea-est">Ocena gry: ~${meSide.est}</span></div>
      <div class="ea-div"></div>
      <div class="ea-col"><span class="ea-lbl">Rywal</span><b class="ea-val">${opSide.acc}%</b><span class="ea-est">Ocena gry: ~${opSide.est}</span></div>
    `;
  }
  const box = $('endStats');
  box.innerHTML = '';
  const par = lastColor === 'w' ? 0 : 1, cnt = {};
  computeQuality().forEach((q, i) => { if (q && i % 2 === par) cnt[q] = (cnt[q] || 0) + 1; });
  for (const k of Object.keys(QUAL)) {
    if (!cnt[k]) continue;
    const d = document.createElement('div');
    d.className = 'es';
    const top = document.createElement('div');
    const i = document.createElement('i'); i.className = 'q ' + k; i.textContent = QUAL[k][0];
    const b = document.createElement('b'); b.textContent = cnt[k];
    top.append(i, b);
    const sp = document.createElement('span'); sp.textContent = QUAL[k][1];
    d.append(top, sp); box.appendChild(d);
  }
}
$('endClose').onclick = () => { $('endCard').hidden = true; };
$('btnEndReview').onclick = () => {
  $('endCard').hidden = true;
  setTab('analysis');
  if (moves.length) {
    if (reviewQueue) showReviewLoader(Math.max(5, ((reviewTotal - reviewQueue.length) / Math.max(1, reviewTotal)) * 100), 'Analizuję partię…', ply);
    else startReview();
  }
};
$('btnEndNew').onclick = () => { $('endCard').hidden = true; setTab('play'); };
$('btnEndRematch').onclick = () => {
  $('endCard').hidden = true;
  if (!lastBot) return;
  const b = { ...lastBot }; delete b.finished;
  startBotGame(lastColor === 'w' ? 'b' : 'w', b);
  if (b.matched) {
    clk = { w: selTime[0] * 60000, b: selTime[0] * 60000, inc: selTime[1] * 1000, at: Date.now() };
    $('gameTitle').textContent = `Partia ${CATS[b.cat][0]} ${fmtMode(selTime[0], selTime[1])}`;
    updateClocks();
  }
};
$('botWhite').onclick = () => startBotGame('w');
$('botBlack').onclick = () => startBotGame('b');
$('botRandom').onclick = () => startBotGame('r');
$('btnResign').onclick = () => {
  if (S.confirmResign && !over && !confirm('Na pewno chcesz się poddać?')) return;
  if (mode === 'online' && !over) wsSend({ t: 'resign' });
  else if (mode === 'bot' && !over) endLocal('Przegrałeś', 'przez poddanie');
};
$('btnDraw').onclick = () => { if (mode === 'online' && !over) { wsSend({ t: 'draw' }); chatLine('System', 'Zaproponowano remis.'); } };

let ws = null;
let user = null;
let queued = false;
let selTime = [5, 0];
let eloCat = 'blitz', gameFlt = 'all';
let rankRows = null;
let rankCat = 'blitz';

function wsSend(m) { if (p2p && p2p.active) return p2pSend(m); if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); }
function connect() {
  ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');
  ws.onopen = () => { const token = localStorage.getItem('szachy.token'); if (token) wsSend({ t: 'resume', token }); };
  ws.onmessage = (ev) => onWs(JSON.parse(ev.data));
  ws.onclose = () => { $('online').textContent = 'offline'; setTimeout(connect, 2000); };
}
function setUser(u) {
  user = u;
  if (u) setTimeout(() => { if (typeof joinDuel === 'function') joinDuel(); }, 0);
  $('me').hidden = !u;
  if (u) $('me').textContent = `${u.name} · ${u.ratings.blitz}`;
  $('btnLogin').textContent = u ? 'Wyloguj' : 'Zaloguj';
  if (typeof puzRender === 'function' && tab === 'puzzle') puzRender(0);
  if (tab === 'profile') renderProfileTab();
  renderRatings();
  renderRank();
}
function renderRatings() {
  const box = $('ratings');
  box.innerHTML = '';
  for (const [c, [name, ic]] of Object.entries(CATS)) {
    const d = document.createElement('div');
    d.className = 'rt';
    d.innerHTML = `<i>${ic}</i><div><b></b><span></span></div>`;
    d.querySelector('b').textContent = user ? user.ratings[c] : 100;
    d.querySelector('span').textContent = name + (user ? ` · ${user.cg[c]} gier` : '');
    box.appendChild(d);
  }
}
function chatLine(who, text) {
  const c = $('chat');
  const d = document.createElement('div');
  const b = document.createElement('b'); b.textContent = who + ': ';
  d.append(b, document.createTextNode(text));
  c.appendChild(d); c.scrollTop = c.scrollHeight;
}

function onWs(m) {
  switch (m.t) {
    case 'auth':
      setUser(m.user);
      localStorage.setItem('szachy.token', m.token);
      $('authModal').hidden = true;
      if (m.user.settings) { S = { ...DEFAULTS, ...m.user.settings }; try { localStorage.setItem('szachy.settings', JSON.stringify(S)); } catch {} applySettings(); render(); }
      break;
    case 'authError': $('authErr').textContent = m.msg; break;
    case 'forgotSent': $('authErr').textContent = 'Jeśli konto z tym e-mailem istnieje, wysłaliśmy link do zmiany hasła.'; break;
    case 'resetOk': $('authErr').textContent = 'Hasło zmienione. Możesz się zalogować.'; $('authModal').hidden = false; break;
    case 'searchResult': renderPlayerList($('searchRes'), m.rows, 'Brak wyników.'); break;
    case 'profile': renderProfile(m); break;
    case 'friends':
      renderPlayerList($('friendList'), m.rows, 'Nie masz jeszcze znajomych.');
      { const n = (m.requests || []).length; if (typeof lastReqN === 'number' && n > lastReqN) notify('Zaproszenie do znajomych', 'Ktoś chce dodać Cię do znajomych.', 'friend'); lastReqN = n; }
      renderRequests(m.requests || []);
      if (viewedProfile) {
        viewedProfile.isFriend = m.rows.some((r) => r.name.toLowerCase() === viewedProfile.name.toLowerCase());
        if (viewedProfile.isFriend) viewedProfile.pending = false;
        $('profFriend').textContent = viewedProfile.isFriend ? 'Usuń ze znajomych' : viewedProfile.pending ? 'Anuluj zaproszenie' : 'Dodaj do znajomych';
      }
      break;
    case 'friendPending':
      if (viewedProfile && viewedProfile.name.toLowerCase() === m.name.toLowerCase()) {
        viewedProfile.pending = m.pending; viewedProfile.isFriend = m.isFriend;
        $('profFriend').textContent = m.isFriend ? 'Usuń ze znajomych' : m.pending ? 'Anuluj zaproszenie' : 'Dodaj do znajomych';
      }
      break;
    case 'challenge':
      pendingChallenge = m.id;
      $('challengeText').innerHTML = '';
      { const av = document.createElement('div'); av.className = 'ch-av'; av.textContent = String(m.from)[0].toUpperCase();
        const bx = document.createElement('div'); bx.className = 'ch-info';
        const nm = document.createElement('b'); nm.textContent = m.from + ' (' + m.rating + ')';
        const sb = document.createElement('span'); sb.textContent = 'Wyzywa Cię na pojedynek ' + m.time + '+' + m.inc;
        bx.append(nm, sb); $('challengeText').append(av, bx); }
      $('challengePanel').hidden = false;
      notify('Wyzwanie na pojedynek', m.from + ' (' + m.rating + ') wyzywa Cię na ' + m.time + '+' + m.inc, 'challenge');
      break;
    case 'challengeGone':
      if (pendingChallenge === m.id) { pendingChallenge = null; $('challengePanel').hidden = true; }
      break;
    case 'challengeInfo': $('duelInfo').textContent = m.msg; break;
    case 'globalHistory': $('globalChat').innerHTML = ''; m.rows.forEach(globalLine); break;
    case 'global': globalLine(m); break;
    case 'online': $('online').textContent = `${m.n} online · w kolejce: ${m.queue}`; break;
    case 'leaderboard': rankRows = m.rows; renderRank(); break;
    case 'queued': queued = true; $('btnQueue').textContent = 'Anuluj szukanie'; $('queueInfo').textContent = 'Szukam rywala o podobnym ELO… (zakres rośnie z czasem)'; break;
    case 'unqueued': queued = false; seekUi(false); $('btnQueue').textContent = 'Szukaj gry'; $('queueInfo').textContent = ''; break;
    case 'start': onlineStart(m); notify('Partia rozpoczęta', 'Znaleziono rywala. Powodzenia!', 'game'); break;
    case 'move':
      moves.push({ from: m.from, to: m.to, promotion: m.promotion, san: m.san });
      ply = moves.length; selected = null; animate = true;
      clk = { ...m.clock, at: Date.now() };
      render();
      playSound(m.san);
      if (premoves.length && S.premove && !over && game.turn() === myColor) {
        const pm = premoves.shift();
        const cand = game.moves({ square: pm.from, verbose: true }).find((x) => x.to === pm.to);
        if (cand) wsSend({ t: 'move', from: pm.from, to: pm.to, promotion: cand.promotion ? 'q' : undefined });
        else { premoves = []; render(); }
      }
      break;
    case 'drawOffer': if (confirm('Przeciwnik proponuje remis. Przyjąć?')) wsSend({ t: 'draw' }); break;
    case 'chat': chatLine(m.from, m.text); break;
    case 'botElo': {
      if (m.user) setUser(m.user);
      const diff = m.after - m.before;
      if (lastEndInfo) {
        lastEndInfo.myElo = m.after;
        lastEndInfo.eloDelta = diff;
        renderEndPlayers();
      }
      break;
    }
    case 'over': onlineOver(m); break;
  }
}
function onlineStart(m) {
  clearTimeout(queueTimer);
  $('endCard').hidden = true;
  mode = 'online'; over = false; myColor = m.color; flipped = m.color === 'b';
  onlineCat = m.cat;
  const o = m.color === 'w' ? m.black : m.white;
  opp = { name: o.name, rating: o.ratings[m.cat] };
  queued = false; seekUi(false); $('btnQueue').textContent = 'Szukaj gry'; $('queueInfo').textContent = '';
  startFen = START_FEN; moves = []; ply = 0; selected = null; lines = []; premoves = [];
  if (m.pgn) {
    const g = new Chess(); g.loadPgn(m.pgn);
    moves = g.history({ verbose: true }).map((x) => ({ from: x.from, to: x.to, promotion: x.promotion, san: x.san }));
    ply = moves.length;
  }
  clk = { ...(m.clock || { w: m.time * 60000, b: m.time * 60000 }), at: Date.now() };
  $('gamePanel').hidden = false;
  $('gameTitle').textContent = `${CATS[m.cat][0]} ${m.time ? fmtMode(m.time, m.inc) : ''}`;
  $('btnDraw').hidden = false; $('chatIn').hidden = false; $('chat').hidden = false; $('chat').innerHTML = '';
  setTab('play');
  playSheet(false);
}
function onlineOver(m) {
  over = true; premoves = [];
  const reasons = { checkmate: 'szach mat', timeout: 'czas', resign: 'poddanie', stalemate: 'pat', repetition: 'trzykrotne powtórzenie', insufficient: 'brak materiału', 'fifty-move': 'reguła 50 ruchów', agreement: 'zgoda na remis', disconnect: 'rozłączenie' };
  const title = m.winner === null ? 'Remis' : m.winner === myColor ? 'Wygrałeś!' : 'Przegrałeś';
  const idx = myColor === 'w' ? 0 : 1;
  const d = m.elo.after[idx] - m.elo.before[idx];
  if (m.me) setUser(m.me);
  saveGame(m.winner === null ? 'd' : m.winner === myColor ? 'w' : 'l');
  const reasonTxt = (['checkmate', 'timeout', 'resign', 'disconnect'].includes(m.reason) ? 'przez ' : '') + (reasons[m.reason] || m.reason);
  showResult(title, reasonTxt, { delta: d, cat: m.cat });
  mode = 'analysis';
  $('gamePanel').hidden = true;
  render(); refresh();
  setTimeout(() => { $('reviewInfo').textContent = ''; startReview(); }, 300);
}

function renderTop() {
  const box = $('topPlayers');
  if (!box) return;
  const rows = (serverUp() ? (rankRows ? rankRows.blitz : []) : localBoard('blitz')).slice(0, 5);
  renderPlayerList(box, rows.map((r) => ({ name: r.name, rating: r.rating, online: !!(user && user.name.toLowerCase() === r.name.toLowerCase()) })), 'Brak graczy w rankingu.');
}
function renderRank() {
  renderTop();
  const seg = $('rankCats');
  seg.innerHTML = '';
  for (const [c, [name, ic]] of Object.entries(CATS)) {
    const b = document.createElement('button');
    b.textContent = `${ic} ${name}`;
    b.className = c === rankCat ? 'sel' : '';
    b.onclick = () => { rankCat = c; renderRank(); };
    seg.appendChild(b);
  }
  const body = $('rankBody');
  body.innerHTML = '';
  const rowsNow = serverUp() ? (rankRows ? rankRows[rankCat] : []) : localBoard(rankCat);
  rowsNow.forEach((r, i) => {
    const tr = document.createElement('tr');
    if (user && r.name.toLowerCase() === user.name.toLowerCase()) tr.className = 'me';
    tr.innerHTML = '<td></td><td></td><td></td>';
    tr.children[0].textContent = i + 1;
    tr.children[1].textContent = `${r.name} (${r.games} gier)`;
    tr.children[2].textContent = r.rating;
    body.appendChild(tr);
  });
}

$('btnLogin').onclick = () => {
  if (user) { localStorage.removeItem('szachy.token'); localStorage.removeItem('szachy.localSession'); location.reload(); }
  else { $('authErr').textContent = ''; $('authModal').hidden = false; }
};
$('btnAuthClose').onclick = () => { $('authModal').hidden = true; };
const serverUp = () => ws && ws.readyState === 1;
const LU_KEY = 'szachy.localUsers', LS_KEY = 'szachy.localSession';
const luLoad = () => { try { return JSON.parse(localStorage.getItem(LU_KEY) || '{}'); } catch { return {}; } };
async function luHash(pw, salt) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pw));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const lrKey = (n) => 'szachy.localRatings.' + n.toLowerCase();
function lrLoad(n) { try { return JSON.parse(localStorage.getItem(lrKey(n)) || '{}'); } catch { return {}; } }
function localElo(res, cat, botElo_) {
  const st = lrLoad(user.name); st.r = st.r || {}; st.c = st.c || {};
  const old = st.r[cat] || 100, n = st.c[cat] || 0;
  const score = res === 'w' ? 1 : res === 'd' ? 0.5 : 0;
  const k = n < 20 ? 40 : 20;
  const now = Math.max(100, Math.round(old + k * (score - 1 / (1 + 10 ** ((botElo_ - old) / 400)))));
  st.r[cat] = now; st.c[cat] = n + 1;
  try { localStorage.setItem(lrKey(user.name), JSON.stringify(st)); } catch {}
  const u = { ...user, ratings: { ...user.ratings, [cat]: now }, cg: { ...user.cg, [cat]: n + 1 } };
  setUser(u);
  return ` ${CATS[cat][0]}: ${old} → ${now} (${now - old >= 0 ? '+' : ''}${now - old})`;
}
function luPublic(u) {
  const r = {}, c = {};
  const st = lrLoad(u.name); for (const k of Object.keys(CATS)) { r[k] = st.r && st.r[k] || 100; c[k] = st.c && st.c[k] || 0; }
  return { name: u.name, ratings: r, cg: c, games: 0, wins: 0, losses: 0, draws: 0, settings: null };
}
function localBoard(cat) {
  return Object.values(luLoad()).map((u) => {
    const st = lrLoad(u.name);
    return { name: u.name, rating: (st.r && st.r[cat]) || 100, games: (st.c && st.c[cat]) || 0 };
  }).sort((a, b) => b.rating - a.rating).slice(0, 50);
}
function localSearch(q) {
  q = String(q || '').trim().toLowerCase();
  if (!q) return [];
  return Object.values(luLoad()).filter((u) => u.name.toLowerCase().includes(q)).slice(0, 20).map((u) => {
    const st = lrLoad(u.name);
    return { name: u.name, rating: (st.r && st.r.blitz) || 100, games: (st.c && st.c.blitz) || 0, online: !!(user && user.name.toLowerCase() === u.name.toLowerCase()) };
  });
}
function luEnter(u) {
  try { localStorage.setItem(LS_KEY, u.name.toLowerCase()); } catch {}
  setUser(luPublic(u));
  $('authModal').hidden = true;
}
async function localAuth(register) {
  const name = $('authUser').value.trim(), pw = $('authPass').value, email = $('authEmail').value.trim().toLowerCase();
  const err = (m) => { $('authErr').textContent = m; };
  const users = luLoad();
  if (register) {
    if (!/^[A-Za-z0-9_]{3,16}$/.test(name)) return err('Nick: 3–16 znaków (litery, cyfry, _)');
    if (pw.length < 4) return err('Hasło min. 4 znaki');
    if (users[name.toLowerCase()]) return err('Nick zajęty');
    const salt = crypto.getRandomValues(new Uint8Array(8)).join('');
    users[name.toLowerCase()] = { name, email, salt, hash: await luHash(pw, salt), created: Date.now() };
    try { localStorage.setItem(LU_KEY, JSON.stringify(users)); } catch { return err('Nie można zapisać konta w przeglądarce.'); }
    return luEnter(users[name.toLowerCase()]);
  }
  const u = users[name.toLowerCase()];
  if (!u || (await luHash(pw, u.salt)) !== u.hash) return err('Zły nick lub hasło');
  luEnter(u);
}
$('btnDoLogin').onclick = () => { if (serverUp()) wsSend({ t: 'login', username: $('authUser').value, password: $('authPass').value }); else localAuth(false); };
$('btnDoRegister').onclick = () => { if (serverUp()) wsSend({ t: 'register', username: $('authUser').value, password: $('authPass').value, email: $('authEmail').value }); else localAuth(true); };
setTimeout(() => {
  if (serverUp() || user) return;
  const k = localStorage.getItem(LS_KEY), u = k && luLoad()[k];
  if (u) setUser(luPublic(u));
}, 1500);
$('authPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('btnDoLogin').click(); });
$('linkForgot').onclick = (e) => {
  e.preventDefault();
  const email = $('authEmail').value.trim();
  if (!email) { $('authErr').textContent = 'Wpisz e-mail konta w polu E-mail, potem kliknij ponownie.'; return; }
  wsSend({ t: 'forgot', email });
};
$('btnDiscord').onclick = () => { location.href = '/auth/discord'; };
{
  const qs = new URLSearchParams(location.search);
  const rt = qs.get('reset'), dt = qs.get('dtoken');
  if (dt) { localStorage.setItem('szachy.token', dt); history.replaceState(null, '', '/'); }
  if (rt) {
    history.replaceState(null, '', '/');
    setTimeout(() => {
      const pw = prompt('Ustaw nowe hasło (min. 4 znaki):');
      if (pw) wsSend({ t: 'reset', token: rt, password: pw });
    }, 600);
  }
}

function buildModes() {
  const box = $('modes');
  for (const [c, list] of Object.entries(MODE_GROUPS)) {
    const g = document.createElement('div');
    g.className = 'modegroup';
    g.innerHTML = `<h3>${CATS[c][1]} ${CATS[c][0]}</h3><div class="timegrid"></div>`;
    list.forEach(([t, i]) => {
      const b = document.createElement('button');
      b.textContent = fmtMode(t, i);
      b.dataset.t = t; b.dataset.i = i;
      if (t === selTime[0] && i === selTime[1]) b.classList.add('sel');
      b.onclick = () => {
        selTime = [t, i];
        box.querySelectorAll('button').forEach((x) => x.classList.toggle('sel', x === b));
      };
      g.querySelector('.timegrid').appendChild(b);
    });
    box.appendChild(g);
  }
}
let queueTimer = null;
const NICK_A = ['witty', 'sleepy', 'brave', 'cosmic', 'lucky', 'silent', 'clever', 'fuzzy', 'sneaky', 'happy', 'grumpy', 'mighty', 'crazy', 'tiny', 'wild', 'chill'];
const NICK_B = ['alien', 'panda', 'fox', 'knight', 'wizard', 'otter', 'falcon', 'goblin', 'tiger', 'robot', 'penguin', 'dragon', 'koala', 'ninja', 'owl', 'wolf'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const randomNick = () => pick(NICK_A) + '_' + pick(NICK_B) + (Math.random() < 0.4 ? Math.floor(Math.random() * 90 + 10) : '');
const catOfTime = (t, i) => { const s = t * 60 + i * 40; return s < 180 ? 'bullet' : s < 480 ? 'blitz' : s < 1500 ? 'rapid' : 'classical'; };
function startMatchedBot() {
  const cat = catOfTime(selTime[0], selTime[1]);
  const elo = user ? user.ratings[cat] : 100;
  const shownElo = Math.max(100, Math.round((elo + (Math.random() * 140 - 70)) / 5) * 5);
  const roll = Math.random();
  let realElo;
  if (roll < 0.30) realElo = Math.min(2600, shownElo + 250 + Math.round(Math.random() * 350)); // smurf: displays ~150-200, plays ~450-650+
  else if (roll < 0.40) realElo = Math.max(100, shownElo - (80 + Math.round(Math.random() * 120)));
  else realElo = Math.max(100, Math.min(2600, shownElo + Math.round(Math.random() * 160 - 60)));
  const lv = Math.max(0, Math.min(20, Math.round((realElo - 100) / 140)));
  const n = randomNick();
  startBotGame('r', { n, e: '👤', lv, shownElo, realElo, matched: true, cat });
  clk = { w: selTime[0] * 60000, b: selTime[0] * 60000, inc: selTime[1] * 1000, at: Date.now() };
  updateClocks();
  $('gameTitle').textContent = `Partia ${CATS[cat][0]} ${fmtMode(selTime[0], selTime[1])}`;
}
let seekTick = null, seekStart = 0;
function seekUi(on) {
  clearInterval(seekTick);
  $('seekBox').hidden = !on;
  if (!on) return;
  seekStart = Date.now();
  const upd = () => {
    const s = Math.floor((Date.now() - seekStart) / 1000);
    $('seekTimer').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    const elo = user ? Math.round(user.ratings[catOfTime(selTime[0], selTime[1])]) : 100;
    const r = 100 + s * 25;
    $('seekRange').textContent = `zakres ELO ${Math.max(100, elo - r)}–${elo + r}`;
  };
  upd(); seekTick = setInterval(upd, 500);
}
const seekModeLabel = () => { $('seekMode').textContent = `${fmtMode(selTime[0], selTime[1])} · ${CATS[catOfTime(selTime[0], selTime[1])][0]}`; };
$('modes').addEventListener('click', () => setTimeout(seekModeLabel, 0));
const timeBtnLabel = () => { $('timeBtnLabel').textContent = `${CATS[catOfTime(selTime[0], selTime[1])][1]} ${fmtMode(selTime[0], selTime[1])}`; };
const timeSheet = (open) => { $('timeSheet').classList.toggle('open', open); document.body.classList.toggle('time-open', open); };
$('timeBtn').onclick = () => timeSheet(true);
$('timeClose').onclick = () => timeSheet(false);
$('modes').addEventListener('click', (e) => { if (e.target.closest('button')) { timeBtnLabel(); timeSheet(false); } });
timeBtnLabel();
seekModeLabel();
$('btnQueue').onclick = () => {
  if (mode !== 'analysis') return alert('Najpierw dokończ trwającą partię.');
  if (!user) { $('authErr').textContent = 'Aby grać, załóż konto lub się zaloguj.'; $('authModal').hidden = false; return; }
  if (!serverUp()) { seekUi(true); $('queueInfo').textContent = 'Szukam rywala…'; setTimeout(() => { seekUi(false); $('queueInfo').textContent = ''; startMatchedBot(); }, 1500 + Math.random() * 1500); return; }
  if (!user) { $('authModal').hidden = false; return; }
  clearTimeout(queueTimer);
  if (queued) { wsSend({ t: 'cancel' }); seekUi(false); }
  else {
    wsSend({ t: 'queue', time: selTime[0], inc: selTime[1] });
    seekUi(true);
    queueTimer = setTimeout(() => { if (queued && mode === 'analysis') { wsSend({ t: 'cancel' }); seekUi(false); startMatchedBot(); } }, 8000);
  }
};

let curRecordId = null;
const histKey = () => 'szachy.games.' + (user ? user.name.toLowerCase() : 'guest');
const histLoad = () => { try { return JSON.parse(localStorage.getItem(histKey()) || '[]'); } catch { return []; } };
const histSave = (l) => { try { localStorage.setItem(histKey(), JSON.stringify(l.slice(-200))); } catch {} };
const Q_SCORE = { brilliant: 100, great: 100, best: 100, good: 85, inaccuracy: 60, mistake: 35, blunder: 10 };
function saveGame(res) {
  if (!moves.length) return;
  const online = mode === 'online' && opp;
  const oppName = online ? `${opp.name} (${opp.rating})` : botInfo && botInfo.coach ? 'Trener LiLKasteusz' : botInfo ? `${botInfo.n} (${botShownElo(botInfo)})` : 'Bot';
  const rec = { id: Date.now(), kind: online ? 'online' : 'bot', opp: oppName, color: myColor, res, plies: moves.length, pgn: currentGame(moves.length).pgn() };
  if (user && user.ratings) rec.rt = { ...user.ratings };
  const l = histLoad(); l.push(rec); histSave(l);
  curRecordId = rec.id;
}
function attachStats() {
  if (!curRecordId) return;
  const l = histLoad();
  const rec = l.find((r) => r.id === curRecordId);
  if (!rec || rec.plies !== moves.length) return;
  const qual = computeQuality(), par = rec.color === 'w' ? 0 : 1;
  const cnt = {}; let sum = 0, n = 0;
  qual.forEach((q, i) => { if (!q || i % 2 !== par) return; cnt[q] = (cnt[q] || 0) + 1; sum += Q_SCORE[q]; n++; });
  if (!n) return;
  rec.q = cnt; rec.acc = Math.round(sum / n);
  histSave(l); curRecordId = null;
  if (tab === 'profile') renderProfileTab();
}
function loadGame(r) {
  if (mode !== 'analysis') return alert('Najpierw dokończ trwającą partię.');
  try {
    const g = new Chess(); g.loadPgn(r.pgn);
    startFen = START_FEN;
    moves = g.history({ verbose: true }).map((x) => ({ from: x.from, to: x.to, promotion: x.promotion, san: x.san }));
    ply = moves.length; flipped = r.color === 'b'; selected = null; lines = [];
    curRecordId = r.q ? null : r.id;
    setTab('analysis');
    $('reviewInfo').textContent = '';
    startReview();
  } catch { alert('Nie udało się wczytać partii.'); }
}
function pgnSans(pgn) {
  if (!pgn) return [];
  return String(pgn).replace(/\[[^\]]*\]/g, '').replace(/\{[^}]*\}/g, '').replace(/\d+\.+/g, '').replace(/\s+(1-0|0-1|1\/2-1\/2|\*)\s*$/, '').trim().split(/\s+/).filter(Boolean).slice(0, 12);
}
function renderProfileTab() {
  $('myProfName').textContent = user ? user.name : 'Gość (zaloguj się, żeby mieć własny profil)';
  $('myAvatar').textContent = user ? user.name[0].toUpperCase() : '?';
  const all = histLoad().slice().reverse();
  const totalG = user ? Math.max(user.games || 0, all.length) : all.length;
  const totalW = user ? Math.max(user.wins || 0, all.filter((r) => r.res === 'w').length) : all.filter((r) => r.res === 'w').length;
  $('myProfSub').textContent = totalG ? `${totalG} rozegranych partii` : 'Brak zapisanych partii';

  const badges = $('myProfBadges');
  if (badges) {
    badges.innerHTML = '';
    const peak = user && user.ratings ? Math.max(...Object.values(user.ratings).map((v) => Math.round(v || 100))) : 100;
    const wr = totalG ? Math.round((totalW / totalG) * 100) : 0;
    let curStreak = 0;
    for (const r of all) { if (r.res === 'w') curStreak++; else break; }
    const addBadge = (txt, hi) => {
      const sp = document.createElement('span');
      sp.className = 'pbadge' + (hi ? ' hi' : '');
      sp.textContent = txt;
      badges.appendChild(sp);
    };
    addBadge(`⭐ Szczyt ELO: ${peak}`, true);
    if (totalG) addBadge(`📈 Skuteczność: ${wr}%`);
    if (curStreak >= 2) addBadge(`🔥 Seria wygranych: ${curStreak}`, true);
    if (user && user.profile && user.profile.country) addBadge(`🌍 ${user.profile.country}`);
  }

  const pr = $('myRatings'); pr.innerHTML = '';
  for (const [c, [n, ic]] of Object.entries(CATS)) {
    const d = document.createElement('div'); d.className = 'pr-card';
    const b = document.createElement('b'); b.textContent = user ? Math.round(user.ratings[c]) : 100;
    const s = document.createElement('span'); s.textContent = `${ic} ${n}`;
    const g = document.createElement('em'); g.textContent = `${user && user.cg ? user.cg[c] || 0 : 0} gier`;
    d.append(b, s, g); pr.appendChild(d);
  }
  const wins = all.filter((r) => r.res === 'w').length, dr = all.filter((r) => r.res === 'd').length, ls = all.length - wins - dr;
  const bar = $('wdlBar'); bar.innerHTML = '';
  if (all.length) {
    [['w', wins, 'Wygrane'], ['d', dr, 'Remisy'], ['l', ls, 'Porażki']].forEach(([k, v, t]) => {
      if (!v) return;
      const s = document.createElement('span'); s.className = 'wdl ' + k; s.style.flex = v;
      s.textContent = Math.round(v / all.length * 100) + '%'; s.title = `${t}: ${v}`; bar.appendChild(s);
    });
  }
  const ec = $('eloCats'); ec.innerHTML = '';
  for (const [c, [n, ic]] of Object.entries(CATS)) {
    const b = document.createElement('button'); b.textContent = `${ic} ${n}`; b.className = c === eloCat ? 'sel' : '';
    b.onclick = () => { eloCat = c; renderProfileTab(); }; ec.appendChild(b);
  }
  const pts = all.slice().reverse().filter((r) => r.rt && r.rt[eloCat] != null).map((r) => r.rt[eloCat]);
  const eg = $('eloGraph');
  if (pts.length < 2) eg.innerHTML = '<div class="muted small pad">Wykres pojawi się po kilku partiach rankingowych w tej kategorii.</div>';
  else {
    const mn = Math.min(...pts), mx = Math.max(...pts), rg = Math.max(1, mx - mn);
    const coords = pts.map((v, i) => [+(i / (pts.length - 1) * 300).toFixed(1), +(70 - (v - mn) / rg * 56).toFixed(1)]);
    const xy = coords.map(([x, y]) => `${x},${y}`).join(' ');
    const areaD = `M${coords[0][0]},${coords[0][1]} ` + coords.slice(1).map(([x, y]) => `L${x},${y}`).join(' ') + ` L300,80 L0,80 Z`;
    eg.innerHTML = `<svg viewBox="0 0 300 80" preserveAspectRatio="none"><defs><linearGradient id="eloGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#81b64c" stop-opacity="0.38"/><stop offset="100%" stop-color="#81b64c" stop-opacity="0"/></linearGradient></defs><path d="${areaD}" fill="url(#eloGrad)"/><polyline points="${xy}" fill="none" stroke="#81b64c" stroke-width="2.2" vector-effect="non-scaling-stroke"/></svg><div class="elorange"><span>Min: ${mn}</span><span>Teraz: ${pts[pts.length - 1]}</span><span>Max: ${mx}</span></div>`;
  }
  const gf = $('gameFilter'); gf.innerHTML = '';
  [['all', 'Wszystkie'], ['w', 'Wygrane'], ['d', 'Remisy'], ['l', 'Porażki']].forEach(([k, n]) => {
    const b = document.createElement('button'); b.textContent = n; b.className = k === gameFlt ? 'sel' : '';
    b.onclick = () => { gameFlt = k; renderProfileTab(); }; gf.appendChild(b);
  });
  const l = gameFlt === 'all' ? all : all.filter((r) => r.res === gameFlt);
  const t = { g: l.length, w: 0, d: 0, l: 0 };
  let accSum = 0, accN = 0, bestStreak = 0, runStreak = 0;
  let wG = 0, wW = 0, bG = 0, bW = 0;
  const opMap = {};
  l.slice().reverse().forEach((r) => {
    t[r.res]++;
    if (r.res === 'w') { runStreak++; if (runStreak > bestStreak) bestStreak = runStreak; } else runStreak = 0;
    if (r.color === 'w') { wG++; if (r.res === 'w') wW++; } else { bG++; if (r.res === 'w') bW++; }
    if (r.acc != null) { accSum += r.acc; accN++; }
    const op = openingFor(pgnSans(r.pgn));
    if (op) {
      if (!opMap[op]) opMap[op] = { name: op, g: 0, w: 0 };
      opMap[op].g++; if (r.res === 'w') opMap[op].w++;
    }
  });
  const box = $('myStats');
  box.innerHTML = '';
  const cell = (label, val) => {
    const d = document.createElement('div');
    d.className = 'ms';
    const b = document.createElement('b'); b.textContent = val;
    const s = document.createElement('span'); s.textContent = label;
    d.append(b, s); box.appendChild(d);
  };
  const winPctAll = t.g ? Math.round((t.w / t.g) * 100) + '%' : '–';
  const wPct = wG ? Math.round((wW / wG) * 100) + '%' : '–';
  const bPct = bG ? Math.round((bW / bG) * 100) + '%' : '–';
  cell('Partie', t.g);
  cell('Wygrane', t.w);
  cell('Remisy', t.d);
  cell('Porażki', t.l);
  cell('Skuteczność', winPctAll);
  cell('Śr. dokładność', accN ? Math.round(accSum / accN) + '%' : '–');
  cell('Najlepsza seria', bestStreak || '0');
  cell('Białe / Czarne', `${wPct} / ${bPct}`);

  const opBox = $('myOpenings');
  if (opBox) {
    opBox.innerHTML = '';
    const topOps = Object.values(opMap).sort((a, b) => b.g - a.g).slice(0, 3);
    if (topOps.length) {
      const h = document.createElement('div');
      h.className = 'po-head';
      h.textContent = 'Najczęstsze debiuty';
      opBox.appendChild(h);
      topOps.forEach((o) => {
        const row = document.createElement('div');
        row.className = 'po-row';
        const nm = document.createElement('span'); nm.className = 'po-name'; nm.textContent = o.name;
        const st = document.createElement('span'); st.className = 'po-stat';
        st.textContent = `${o.g} ${o.g === 1 ? 'gra' : 'gier'} · ${Math.round((o.w / o.g) * 100)}% wygr.`;
        row.append(nm, st);
        opBox.appendChild(row);
      });
    }
  }
  const list = $('myGames');
  list.innerHTML = '';
  if (!l.length) { const e = document.createElement('div'); e.className = 'muted small pad'; e.textContent = 'Nie masz jeszcze zapisanych partii. Zagraj z botem, trenerem lub graczem.'; list.appendChild(e); return; }
  l.forEach((r) => {
    const d = document.createElement('div');
    d.className = 'prow game';
    const badge = document.createElement('span'); badge.className = 'res ' + r.res; badge.textContent = r.res === 'w' ? 'W' : r.res === 'd' ? 'R' : 'P';
    const info = document.createElement('span'); info.className = 'pn';
    info.textContent = `${r.color === 'w' ? '♔' : '♚'} ${r.opp}`;
    const op = openingFor(pgnSans(r.pgn));
    const meta = document.createElement('span'); meta.className = 'muted small';
    meta.textContent = `${new Date(r.id).toLocaleDateString('pl-PL')} · ${Math.ceil(r.plies / 2)} ruchów` + (op ? ` · ${op}` : '') + (r.acc != null ? ` · ${r.acc}%` : '');
    const left = document.createElement('div'); left.style.cssText = 'display:flex;flex-direction:column;gap:2px;flex:1;min-width:0';
    left.append(info, meta);
    d.append(badge, left);
    d.onclick = () => loadGame(r);
    list.appendChild(d);
  });
}
$('chatIn').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.value.trim()) { wsSend({ t: 'chat', text: e.target.value }); e.target.value = ''; }
});

const TITLES = { play: 'Graj', bots: 'Gra z botami', coach: 'Trener LiLKasteusz', analysis: 'Analiza', community: 'Społeczność', rank: 'Ranking', settings: 'Ustawienia', custom: 'Wygląd', profile: 'Profil', puzzle: 'Zadania' };
const GROUPS = {
  play: ['Graj', [['play', 'Nowa gra'], ['bots', 'Boty']]],
  puzzle: ['Zadania', [['puzzle', 'Zadania']]],
  learn: ['Ucz się', [['coach', 'Trener'], ['analysis', 'Analiza']]],
  social: ['Społeczność', [['community', 'Gracze'], ['rank', 'Ranking']]],
  more: ['Więcej', [['profile', 'Profil'], ['settings', 'Ustawienia'], ['custom', 'Wygląd']]],
};
const groupOf = (t) => Object.keys(GROUPS).find((g) => GROUPS[g][1].some(([k]) => k === t)) || 'play';
function renderSubtabs(t) {
  const box = $('subtabs'); box.innerHTML = '';
  const items = GROUPS[groupOf(t)][1];
  box.hidden = items.length < 2 || groupOf(t) === 'more';
  items.forEach(([k, n]) => {
    const b = document.createElement('button');
    b.textContent = n; b.className = k === t ? 'on' : '';
    b.onclick = () => setTab(k);
    box.appendChild(b);
  });
}
let puzzle = null, puzIdx = -1, puzSolved = 0;
const puzKey = () => 'szachy.puz.' + (user ? user.name.toLowerCase() : 'guest');
function puzLoad() { try { return { r: 600, streak: 0, best: 0, solved: 0, failed: 0, ...JSON.parse(localStorage.getItem(puzKey()) || '{}') }; } catch { return { r: 600, streak: 0, best: 0, solved: 0, failed: 0 }; } }
function puzSave(s) { try { localStorage.setItem(puzKey(), JSON.stringify(s)); } catch {} }
function puzRender(delta) {
  const s = puzLoad(), box = $('puzScore');
  box.innerHTML = '';
  const cell = (label, val, extra) => {
    const d = document.createElement('div'); d.className = 'pz';
    const b = document.createElement('b'); b.textContent = val;
    if (extra) { const e = document.createElement('em'); e.textContent = extra; e.className = extra.startsWith('+') ? 'up' : 'down'; b.appendChild(e); }
    const sp = document.createElement('span'); sp.textContent = label;
    d.append(b, sp); box.appendChild(d);
  };
  cell('Ranking zadań', s.r, delta ? (delta > 0 ? '+' : '') + delta : '');
  cell('Seria 🔥', s.streak);
  cell('Najlepsza seria', s.best);
  cell('Rozwiązane', s.solved);
}
function puzPenalize(hintOnly) {
  if (!puzzle || puzzle.pen) return;
  puzzle.pen = true;
  const s = puzLoad();
  let d = 0;
  if (!hintOnly) s.failed++;
  s.streak = 0;
  puzSave(s); puzRender(d);
}
function puzReward() {
  const s = puzLoad();
  let d = 0;
  if (!puzzle.pen) {
    const e = 1 / (1 + 10 ** ((puzzle.r - s.r) / 400));
    d = Math.max(1, Math.round(40 * (1 - e)));
    const secs = (performance.now() - (puzzle.t0 || performance.now())) / 1000;
    if (secs <= 5) d += Math.max(2, Math.round(15 * (5 - Math.max(secs, 1)) / 4));
    s.r += d; s.streak++; s.best = Math.max(s.best, s.streak);
  }
  s.solved++;
  puzSave(s); puzRender(d);
  return d;
}
const puzSeen = [];
const puzApi = async (action, params) => {
  const r = await fetch('/api/puzzle/' + action + '?' + new URLSearchParams(params));
  if (!r.ok) throw new Error('puzzle api');
  return r.json();
};
async function startPuzzle() {
  let p;
  try { p = await puzApi('next', { r: puzLoad().r, seen: puzSeen.join(','), cur: puzIdx }); }
  catch { $('puzMsg').textContent = 'Nie można pobrać zadania. Spróbuj ponownie.'; return; }
  puzIdx = p.id;
  puzSeen.push(p.id); if (puzSeen.length > 60) puzSeen.shift();
  puzzle = { id: p.id, r: p.r, i: 1, ready: false, done: false, busy: false, approved: false, reply: null, finished: false };
  mode = 'analysis'; over = false; startFen = p.fen; moves = []; ply = 0; selected = null; lines = [];
  const turn = new Chess(p.fen).turn() === 'w' ? 'b' : 'w';
  myColor = turn; flipped = turn === 'b';
  $('puzTitle').textContent = `${p.th} · ${p.r}`;
  $('puzNext').disabled = true;
  $('puzMsg').textContent = 'Twój ruch: ' + (turn === 'w' ? 'białe' : 'czarne') + '. Znajdź najlepszy ruch!';
  $('puzStat').textContent = '';
  puzRender(0);
  render();
  const first = p.first, cur = puzzle;
  setTimeout(() => { if (puzzle === cur) { applyMove(first.slice(0, 2), first.slice(2, 4), first[4], false); cur.ready = true; cur.t0 = performance.now(); } }, 500);
}
async function puzzleVerify(from, to, promotion) {
  if (!puzzle.ready || puzzle.done || puzzle.busy) return false;
  const cur = puzzle;
  cur.busy = true;
  let res;
  try { res = await puzApi('check', { id: cur.id, i: cur.i, move: from + to + (promotion || '') }); }
  catch { cur.busy = false; return false; }
  cur.busy = false;
  if (puzzle !== cur) return false;
  if (!res.ok) { $('puzMsg').textContent = 'To nie to. Spróbuj jeszcze raz!'; puzPenalize(false); return false; }
  cur.approved = true; cur.reply = res.reply; cur.finished = res.done;
  return true;
}
function puzzleCheck() {
  const ok = puzzle.approved;
  puzzle.approved = false;
  return ok;
}
function puzzleAfter() {
  puzzle.i++;
  if (puzzle.finished) { puzzle.done = true; $('puzNext').disabled = false; const d = puzReward(); $('puzMsg').textContent = puzzle.pen ? 'Rozwiązane, ale bez punktów (był błąd lub podpowiedź).' : 'Zadanie rozwiązane!' + (d ? ' +' + d : ''); return; }
  $('puzMsg').textContent = 'Dobrze! Kontynuuj…';
  const u = puzzle.reply; puzzle.i++;
  const cur = puzzle;
  setTimeout(() => { if (puzzle === cur) applyMove(u.slice(0, 2), u.slice(2, 4), u[4], false); }, 400);
}
$('puzNext').onclick = () => { if (!puzzle || !puzzle.done) return; startPuzzle(); };
$('puzShow').onclick = async () => {
  if (!puzzle || puzzle.done || !puzzle.ready) return;
  puzPenalize(false);
  const cur = puzzle;
  let rest;
  try { rest = (await puzApi('solution', { id: cur.id, i: cur.i })).rest; } catch { return; }
  if (puzzle !== cur) return;
  cur.done = true;
  $('puzNext').disabled = false;
  $('puzMsg').textContent = 'Rozwiązanie pokazane. Bez punktów za to zadanie.';
  rest.forEach((u, k) => setTimeout(() => { if (puzzle === cur) applyMove(u.slice(0, 2), u.slice(2, 4), u[4], false); }, 500 * (k + 1)));
};
function drawPuzzleHint() {
  boardEl.querySelector('.puzhint')?.remove();
  boardEl.querySelectorAll('.sq.phint').forEach((e) => e.classList.remove('phint'));
  const h = puzzle && !puzzle.done && puzzle.hint;
  if (!h || h.i !== puzzle.i) return;
  const sq = boardEl.querySelector(`.sq[data-sq="${h.from}"]`);
  if (sq) sq.classList.add('phint');
  if (h.stage < 2 || !h.to) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'arrows puzhint'); svg.setAttribute('viewBox', '0 0 8 8');
  const [x1, y1] = sqCenter(h.from), [x2, y2] = sqCenter(h.to);
  const len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len;
  const ex = x2 - ux * 0.32, ey = y2 - uy * 0.32, px = -uy * 0.2, py = ux * 0.2;
  const line = document.createElementNS(svg.namespaceURI, 'line');
  Object.entries({ x1, y1, x2: ex, y2: ey, stroke: '#4caf50', 'stroke-width': 0.16, opacity: 0.9 }).forEach(([k, v]) => line.setAttribute(k, v));
  const poly = document.createElementNS(svg.namespaceURI, 'polygon');
  poly.setAttribute('points', `${x2},${y2} ${ex + px},${ey + py} ${ex - px},${ey - py}`);
  poly.setAttribute('fill', '#4caf50'); poly.setAttribute('opacity', 0.9);
  svg.append(line, poly); boardEl.appendChild(svg);
}
$('puzHint').onclick = async () => {
  if (!puzzle || puzzle.done) return;
  const cur = puzzle;
  const stage = cur.hint && cur.hint.i === cur.i ? 2 : 1;
  puzPenalize(true);
  try {
    const h = await puzApi('hint', { id: cur.id, i: cur.i });
    if (puzzle !== cur || cur.done || !h.from) return;
    cur.hint = { i: cur.i, from: h.from, to: h.to, stage };
    $('puzMsg').textContent = stage === 1 ? 'Podpowiedź: ta figura się rusza. Kliknij jeszcze raz, by zobaczyć dokąd.' : 'Podpowiedź: ruch pokazuje strzałka.';
    drawPuzzleHint();
  } catch {}
};
function setTab(t) {
  if (t !== 'puzzle' && puzzle) {
    puzzle = null;
    startFen = START_FEN; moves = []; ply = 0; selected = null; lines = [];
    myColor = 'w'; flipped = false;
  }
  tab = t;
  document.body.dataset.tab = t;
  renderSubtabs(t);
  if (t === 'puzzle' && !puzzle) startPuzzle();
  if (t === 'rank') renderRank();
  if (t === 'community') {
    if (serverUp()) { wsSend({ t: 'globalHistory' }); if (user) wsSend({ t: 'friends' }); }
    else { renderRank(); renderLocalFriends(); }
  }
  document.querySelectorAll('#tabs > button').forEach((b) => b.classList.toggle('active', b.dataset.group === groupOf(t)));
  document.querySelectorAll('#moreSub button, #navSettings').forEach((b) => b.classList.toggle('active', b.dataset.tab === t));
  { const mt = $('moreToggle'), ms = $('moreSub'); const inMore = ['profile', 'custom', 'rank'].includes(t); if (mt) mt.classList.toggle('active', inMore); if (ms && inMore) { ms.hidden = false; mt.classList.add('open'); } }
  document.querySelectorAll('.tabpane').forEach((p) => { p.hidden = p.id !== 'pane-' + t; });
  $('crumb').textContent = TITLES[t];
  if (t === 'profile') renderProfileTab();
  render(); refresh();
}
const isPhone = () => window.matchMedia('(max-width: 800px)').matches;
const playSheet = (open) => document.body.classList.toggle('play-sheet', !!open && isPhone());
document.addEventListener('click', (e) => { if (e.target === document.body && document.body.classList.contains('play-sheet')) { playSheet(false); if (tab === 'bots') setTab('play'); } });
document.querySelectorAll('#tabs button').forEach((b) => { b.onclick = () => { setTab(b.dataset.tab); playSheet(b.dataset.tab === 'play' && mode === 'analysis'); }; });
$('navSettings').onclick = () => setTab('settings');
$('moreToggle').onclick = () => { const ms = $('moreSub'); ms.hidden = !ms.hidden; $('moreToggle').classList.toggle('open', !ms.hidden); };
$('moreToggle').onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('moreToggle').click(); } };

$('btnStart').onclick = () => goTo(0);
$('btnPrev').onclick = () => goTo(ply - 1);
$('btnNext').onclick = () => goTo(ply + 1);
$('btnEnd').onclick = () => goTo(moves.length);
$('btnFlip').onclick = () => { flipped = !flipped; render(); };
$('btnUndo').onclick = () => {
  if (mode === 'analysis' && ply > 0) { moves = moves.slice(0, ply - 1); ply = moves.length; selected = null; lines = []; coachPending = null; render(); refresh(); }
  else if (mode === 'bot' && !over) undoWithCoach();
};
function undoWithCoach() {
  if (!moves.length) return coachSay('Nie ma czego cofać, partia dopiero się zaczyna!');
  let n = moves.length - 1;
  const g = new Chess(startFen);
  for (let i = 0; i < n; i++) g.move({ from: moves[i].from, to: moves[i].to, promotion: moves[i].promotion });
  if (g.turn() !== myColor && n > 0) n--;
  moves = moves.slice(0, n); ply = moves.length;
  selected = null; lines = []; coachPending = null; botThinking = false;
  render(); refresh();
  coachSay('Jasne, cofamy ruch. Pomyśl jeszcze raz! 🙂');
}
$('btnReset').onclick = () => {
  if (mode !== 'analysis') return;
  startFen = START_FEN; moves = []; ply = 0; selected = null; lines = []; render(); refresh();
};
$('btnReview').onclick = () => { $('reviewInfo').textContent = ''; startReview(); };
if ($('btnNextKey')) $('btnNextKey').onclick = () => {
  const qual = computeQuality();
  const keys = new Set(['brilliant', 'great', 'inaccuracy', 'mistake', 'blunder']);
  let next = qual.findIndex((q, i) => i >= ply && keys.has(q));
  if (next === -1) next = qual.findIndex((q) => keys.has(q));
  if (next >= 0) goTo(next + 1);
};
$('showArrow').onchange = drawArrows;
$('engineToggle').onchange = (e) => {
  analysisOn = e.target.checked;
  if (!analysisOn) $('engineInfo').textContent = 'silnik wyłączony';
  lines = []; renderLines(); render(); refresh();
};
for (const id of ['multipv', 'threads', 'hash']) {
  $(id).onchange = () => {
    lines = [];
    engineRun(() => {
      send('setoption name Threads value ' + ($('threads').value || 1));
      send('setoption name Hash value ' + $('hash').value);
      refresh();
    });
  };
}
$('btnLoad').onclick = () => {
  if (mode !== 'analysis') return;
  const txt = $('ioBox').value.trim();
  if (!txt) return;
  try {
    if (/^[prnbqkPRNBQK1-8]+(\/[prnbqkPRNBQK1-8]+){7}\s/.test(txt)) { new Chess(txt); startFen = txt; moves = []; ply = 0; }
    else {
      const g = new Chess();
      g.loadPgn(txt);
      startFen = g.getHeaders().FEN || START_FEN;
      moves = g.history({ verbose: true }).map((m) => ({ from: m.from, to: m.to, promotion: m.promotion, san: m.san }));
      ply = moves.length;
    }
    selected = null; lines = [];
    render(); refresh();
  } catch (err) { alert('Nie udało się wczytać: ' + err.message); }
};
$('btnFen').onclick = () => { $('ioBox').value = game.fen(); };
$('btnPgn').onclick = () => { $('ioBox').value = currentGame(moves.length).pgn(); };

window.addEventListener('keydown', (e) => {
  if (['TEXTAREA', 'SELECT', 'INPUT'].includes(e.target.tagName)) return;
  if (e.key === 'ArrowLeft') goTo(ply - 1);
  else if (e.key === 'ArrowRight') goTo(ply + 1);
  else if (e.key === 'Home') goTo(0);
  else if (e.key === 'End') goTo(moves.length);
  else if (e.key === 'f' || e.key === 'F') { flipped = !flipped; render(); }
});

let audioCtx = null;
function playSound(san = '') {
  try {
    if (navigator.vibrate && window.matchMedia('(pointer: coarse)').matches) {
      navigator.vibrate(/[#+]/.test(san) ? [30, 40, 60] : san.includes('x') ? 25 : 10);
    }
  } catch {}
  if (!S.sound) return;
  try {
    const ac = audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = ac.currentTime;
    const out = ac.createGain(); out.gain.value = 0.5; out.connect(ac.destination);
    const thud = (f0, f1, dur, vol) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.02);
    };
    const noise = (dur, vol, freq) => {
      const len = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ac.createBufferSource(); src.buffer = buf;
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq;
      const g = ac.createGain(); g.gain.value = vol;
      src.connect(f); f.connect(g); g.connect(out); src.start(t);
    };
    const tone = (f, at, dur, vol) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(vol, t + at); g.gain.exponentialRampToValueAtTime(0.001, t + at + dur);
      o.connect(g); g.connect(out); o.start(t + at); o.stop(t + at + dur + 0.02);
    };
    if (san.includes('#')) { tone(523, 0, 0.5, 0.3); tone(659, 0.08, 0.5, 0.25); tone(784, 0.16, 0.7, 0.25); }
    else if (san.startsWith('O-O')) { thud(200, 90, 0.1, 0.8); noise(0.05, 0.6, 1800); setTimeout(() => playSound('Nf3'), 110); }
    else {
      const cap = san.includes('x');
      const style = S.soundStyle || 'wood';
      const knock = (freq, q, dur, vol) => {
        const len = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
        const src = ac.createBufferSource(); src.buffer = buf;
        const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
        const g = ac.createGain(); g.gain.value = vol;
        src.connect(f); f.connect(g); g.connect(out); src.start(t);
      };
      const jitter = 1 + (Math.random() - 0.5) * 0.08;
      if (style === 'click') { knock(2400 * jitter, 6, 0.03, cap ? 3.2 : 2.4); knock(900 * jitter, 4, 0.05, 1.2); }
      else if (style === 'soft') { knock((cap ? 260 : 340) * jitter, 5, 0.09, cap ? 5 : 4); thud(cap ? 110 : 140, 60, 0.1, 0.35); }
      else if (style === 'pop') { thud((cap ? 420 : 620) * jitter, 180, 0.07, 0.7); knock(1800, 3, 0.015, 1); }
      else if (cap) { knock(480 * jitter, 7, 0.1, 6); knock(1500 * jitter, 5, 0.03, 2.5); thud(130, 70, 0.08, 0.4); }
      else { knock(620 * jitter, 8, 0.07, 5); knock(1900 * jitter, 5, 0.02, 1.8); thud(150, 80, 0.05, 0.25); }
    }
    if (san.includes('+')) tone(880, 0.07, 0.25, 0.2);
  } catch {}
}

let viewedProfile = null;
function playerRow(r) {
  const d = document.createElement('div');
  d.className = 'prow';
  d.innerHTML = '<span class="dot"></span><span class="pn"></span><span class="pr"></span>';
  d.querySelector('.dot').classList.toggle('on', !!r.online);
  d.querySelector('.pn').textContent = r.name;
  d.querySelector('.pr').textContent = r.rating;
  d.onclick = () => {
    if (serverUp()) return wsSend({ t: 'profile', name: r.name });
    const u = luLoad()[r.name.toLowerCase()];
    if (!u) return;
    const p = luPublic(u);
    let fr = []; try { fr = JSON.parse(localStorage.getItem('szachy.localFriends.' + (user ? user.name.toLowerCase() : '')) || '[]'); } catch {}
    renderProfile({ ...p, created: u.created || Date.now(), online: !!(user && user.name.toLowerCase() === u.name.toLowerCase()), isFriend: fr.includes(u.name.toLowerCase()), pending: false });
  };
  return d;
}
function renderPlayerList(box, rows, empty) {
  box.innerHTML = '';
  if (!rows.length) { const e = document.createElement('div'); e.className = 'muted small pad'; e.textContent = empty; box.appendChild(e); return; }
  rows.forEach((r) => box.appendChild(playerRow(r)));
}
function renderProfile(m) {
  const panel = $('profilePanel');
  if (m.missing) { panel.hidden = true; return; }
  viewedProfile = m;
  panel.hidden = false;
  $('profName').textContent = m.name + (m.online ? ' · online' : '');
  const body = $('profBody');
  body.innerHTML = '';
  const hero = document.createElement('div'); hero.className = 'profhero'; hero.style.padding = '0';
  const av = document.createElement('div'); av.className = 'profavatar'; av.textContent = m.name[0].toUpperCase();
  const who = document.createElement('div'); who.className = 'profwho';
  const nm = document.createElement('h2'); nm.textContent = m.name;
  const sub = document.createElement('div'); sub.className = 'muted small';
  sub.textContent = (m.online ? 'Online · ' : 'Offline · ') + 'dołączył ' + new Date(m.created).toLocaleDateString('pl-PL');
  who.append(nm, sub); hero.append(av, who); body.appendChild(hero);
  const cards = document.createElement('div'); cards.className = 'profratings'; cards.style.padding = '10px 0 0';
  for (const [c, [n, ic]] of Object.entries(CATS)) {
    const d = document.createElement('div'); d.className = 'pr-card';
    const b = document.createElement('b'); b.textContent = m.ratings[c];
    const s = document.createElement('span'); s.textContent = `${ic} ${n}`;
    const g = document.createElement('em'); g.textContent = `${m.cg[c] || 0} gier`;
    d.append(b, s, g); cards.appendChild(d);
  }
  body.appendChild(cards);
  const tot = (m.wins || 0) + (m.losses || 0) + (m.draws || 0);
  if (tot) {
    const bar = document.createElement('div'); bar.className = 'wdlbar'; bar.style.margin = '10px 0 0';
    [['w', m.wins, 'Wygrane'], ['d', m.draws, 'Remisy'], ['l', m.losses, 'Porażki']].forEach(([k, v, t]) => {
      if (!v) return;
      const s = document.createElement('span'); s.className = 'wdl ' + k; s.style.flex = v;
      s.textContent = Math.round(v / tot * 100) + '%'; s.title = `${t}: ${v}`; bar.appendChild(s);
    });
    body.appendChild(bar);
  }
  const st = document.createElement('div'); st.className = 'muted small';
  st.textContent = `Partie: ${m.games} · W ${m.wins} / R ${m.draws} / P ${m.losses}`;
  body.appendChild(st);
  const fb = $('profFriend');
  const self = user && user.name.toLowerCase() === m.name.toLowerCase();
  fb.hidden = !user || self;
  fb.textContent = m.isFriend ? 'Usuń ze znajomych' : m.pending ? 'Anuluj zaproszenie' : 'Dodaj do znajomych';
  const db = $('profDuel');
  db.hidden = !user || self || !m.online;
  $('duelInfo').textContent = '';
}
$('searchBtn').onclick = () => {
  if (serverUp()) return wsSend({ t: 'search', q: $('searchIn').value });
  renderPlayerList($('searchRes'), localSearch($('searchIn').value), 'Brak wyników.');
};
$('searchIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('searchBtn').click(); });
$('profClose').onclick = () => { $('profilePanel').hidden = true; };
$('profFriend').onclick = () => {
  if (!viewedProfile) return;
  const on = !(viewedProfile.isFriend || viewedProfile.pending);
  if (!serverUp()) {
    const key = viewedProfile.name.toLowerCase();
    let fr = lfLoad().filter((x) => x !== key);
    if (on) fr.push(key);
    lfSave(fr);
    viewedProfile.isFriend = on;
    $('profFriend').textContent = on ? 'Usuń ze znajomych' : 'Dodaj do znajomych';
    renderLocalFriends();
    return;
  }
  wsSend({ t: 'friend', name: viewedProfile.name, on });
};
const lfKey = () => 'szachy.localFriends.' + (user ? user.name.toLowerCase() : '');
function lfLoad() { try { return JSON.parse(localStorage.getItem(lfKey()) || '[]'); } catch { return []; } }
function lfSave(a) { try { localStorage.setItem(lfKey(), JSON.stringify(a)); } catch {} }
function renderLocalFriends() {
  if (!user) return renderPlayerList($('friendList'), [], 'Zaloguj się, aby zobaczyć znajomych.');
  const users = luLoad();
  const rows = lfLoad().filter((k) => users[k]).map((k) => {
    const st = lrLoad(users[k].name);
    return { name: users[k].name, rating: (st.r && st.r.blitz) || 100, online: user.name.toLowerCase() === k };
  });
  renderPlayerList($('friendList'), rows, 'Nie masz jeszcze znajomych.');
  $('reqPanel').hidden = true;
}
$('profDuel').onclick = () => {
  if (!viewedProfile) return;
  wsSend({ t: 'challenge', name: viewedProfile.name, time: +$('duelTime').value || 5, inc: +$('duelInc').value || 0 });
};
let pendingChallenge = null;
$('chAccept').onclick = () => {
  if (!pendingChallenge) return;
  wsSend({ t: 'challengeReply', id: pendingChallenge, accept: true });
  pendingChallenge = null; $('challengePanel').hidden = true;
};
$('chDecline').onclick = () => {
  if (!pendingChallenge) return;
  wsSend({ t: 'challengeReply', id: pendingChallenge, accept: false });
  pendingChallenge = null; $('challengePanel').hidden = true;
};
function renderRequests(rows) {
  const box = $('reqList');
  $('reqPanel').hidden = !rows.length;
  box.innerHTML = '';
  rows.forEach((r) => {
    const d = playerRow(r);
    const ok = document.createElement('button'); ok.textContent = '✓';
    ok.onclick = (e) => { e.stopPropagation(); wsSend({ t: 'friendReply', name: r.name, accept: true }); };
    const no = document.createElement('button'); no.textContent = '✕';
    no.onclick = (e) => { e.stopPropagation(); wsSend({ t: 'friendReply', name: r.name, accept: false }); };
    d.append(ok, no);
    box.appendChild(d);
  });
}
function globalLine(m) {
  const c = $('globalChat');
  const d = document.createElement('div');
  const b = document.createElement('b'); b.textContent = m.from + ': ';
  d.append(b, document.createTextNode(m.text));
  c.appendChild(d); c.scrollTop = c.scrollHeight;
}
$('globalIn').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || !e.target.value.trim()) return;
  if (!user) { $('authModal').hidden = false; return; }
  wsSend({ t: 'global', text: e.target.value });
  e.target.value = '';
});
renderPlayerList($('searchRes'), [], 'Wpisz nick, aby wyszukać graczy.');
renderPlayerList($('friendList'), [], 'Zaloguj się, aby zobaczyć znajomych.');

try { if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('/sw.js'); } catch {}
buildCustomUI();
buildModes();
buildBots();
renderRatings();
renderRank();
applySettings();
(function termsGate() {
  const KEY = 'szachy.termsAccepted';
  let ok = false;
  try { ok = localStorage.getItem(KEY) === '1'; } catch {}
  if (ok) return;
  const modal = $('termsModal'), chk = $('termsCheck'), btn = $('btnTerms');
  modal.hidden = false;
  chk.onchange = () => { btn.disabled = !chk.checked; };
  btn.onclick = () => {
    if (!chk.checked) return;
    try { localStorage.setItem(KEY, '1'); } catch {}
    modal.hidden = true;
    if (!user) { $('authErr').textContent = 'Aby grać, załóż konto lub się zaloguj.'; $('authModal').hidden = false; }
  };
})();
render();
startEngine();
connect();

let lastReqN = null;
function notify(title, text, kind) {
  const box = document.getElementById('toasts');
  if (box) {
    const d = document.createElement('div');
    d.className = 'toast ' + (kind || '');
    const ic = document.createElement('div'); ic.className = 'toast-ic';
    ic.textContent = kind === 'challenge' ? '\u2694' : kind === 'friend' ? '\u263A' : kind === 'game' ? '\u265F' : '\u2139';
    const tx = document.createElement('div'); tx.className = 'toast-tx';
    const b = document.createElement('b'); b.textContent = title;
    const s = document.createElement('span'); s.textContent = text;
    tx.append(b, s);
    const x = document.createElement('button'); x.className = 'toast-x'; x.textContent = '\u2715';
    const close = () => { d.classList.add('out'); setTimeout(() => d.remove(), 250); };
    x.onclick = close;
    d.append(ic, tx, x);
    box.appendChild(d);
    while (box.children.length > 4) box.firstChild.remove();
    setTimeout(close, 7000);
  }
  try {
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') new Notification(title, { body: text });
  } catch {}
}
document.addEventListener('click', () => {
  try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch {}
}, { once: true });

(function () {
  const origOnWs = onWs;
  onWs = function (m) {
    if (m && m.t === 'pwResult') {
      $('pwInfo').textContent = m.msg;
      if (m.ok) { $('pwOld').value = ''; $('pwNew').value = ''; $('pwNew2').value = ''; }
      return;
    }
    if (m && m.t === 'profileSaved') {
      if (user) setUser({ ...user, profile: m.profile });
      $('spInfo').textContent = 'Profil zapisany.';
      return;
    }
    return origOnWs(m);
  };

  const origLuPublic = luPublic;
  luPublic = function (u) { return { ...origLuPublic(u), profile: u.profile || {}, created: u.created || Date.now() }; };

  let pendingAvatar;
  function avColor(p) { return p && p.color ? p.color : ''; }
  function paintAvatar(el, p) {
    const a = p && typeof p.avatar === 'string' && p.avatar.startsWith('data:image/') ? p.avatar : '';
    if (a) { el.style.background = 'center/cover url("' + a + '")'; el.style.color = 'transparent'; }
    else { el.style.background = avColor(p) || ''; el.style.color = ''; }
  }
  function updateNav() {
    $('navAv').textContent = user ? user.name[0].toUpperCase() : '?';
    $('navMyName').textContent = user ? user.name : 'Mój profil';
    paintAvatar($('navAv'), user && user.profile);
    const p = (user && user.profile) || {};
    $('spCountry').value = p.country || '';
    $('spBio').value = p.bio || '';
    $('spColor').value = p.color || '#81b64c';
    pendingAvatar = undefined;
    const pv = $('spAvatarPrev'); pv.hidden = !p.avatar; if (p.avatar) pv.src = p.avatar;
    $('spAvatarClear').hidden = !p.avatar;
  }

  const origSetUser = setUser;
  setUser = function (u) { origSetUser(u); updateNav(); };

  const origRPT = renderProfileTab;
  renderProfileTab = function () {
    origRPT();
    const p = (user && user.profile) || {};
    paintAvatar($('myAvatar'), p);
    const extra = [p.country, p.bio].filter(Boolean).join(' · ');
    if (extra) $('myProfSub').textContent = extra + ' — ' + $('myProfSub').textContent;
  };

  const origRP = renderProfile;
  renderProfile = function (m) {
    origRP(m);
    if (m.missing) return;
    const p = m.profile || {};
    const body = $('profBody');
    const av = body.querySelector('.profavatar');
    if (av) paintAvatar(av, p);
    const extra = [p.country, p.bio].filter(Boolean).join(' · ');
    if (extra) {
      const d = document.createElement('div'); d.className = 'muted small'; d.style.marginTop = '8px';
      d.textContent = extra; body.appendChild(d);
    }
  };

  $('navMyProfile').onclick = () => setTab('profile');

  $('spSave').onclick = async () => {
    if (!user) { $('spInfo').textContent = 'Zaloguj się, żeby edytować profil.'; return; }
    const profile = { country: $('spCountry').value.trim().slice(0, 40), bio: $('spBio').value.trim().slice(0, 200), color: $('spColor').value };
    profile.avatar = pendingAvatar !== undefined ? pendingAvatar : ((user.profile && user.profile.avatar) || '');
    if (serverUp()) { wsSend({ t: 'saveProfile', profile }); return; }
    const users = luLoad(), k = user.name.toLowerCase();
    if (!users[k]) { $('spInfo').textContent = 'Nie znaleziono konta.'; return; }
    users[k].profile = profile;
    try { localStorage.setItem(LU_KEY, JSON.stringify(users)); } catch { $('spInfo').textContent = 'Nie można zapisać w przeglądarce.'; return; }
    setUser({ ...user, profile });
    $('spInfo').textContent = 'Profil zapisany.';
  };

  $('pwSave').onclick = async () => {
    const o = $('pwOld').value, n = $('pwNew').value, n2 = $('pwNew2').value, info = $('pwInfo');
    if (!user) { info.textContent = 'Zaloguj się, żeby zmienić hasło.'; return; }
    if (!o) { info.textContent = 'Podaj obecne hasło.'; return; }
    if (n.length < 4) { info.textContent = 'Nowe hasło musi mieć min. 4 znaki.'; return; }
    if (n !== n2) { info.textContent = 'Nowe hasła nie są takie same.'; return; }
    if (serverUp()) { wsSend({ t: 'changePassword', oldPassword: o, newPassword: n }); return; }
    const users = luLoad(), u = users[user.name.toLowerCase()];
    if (!u || (await luHash(o, u.salt)) !== u.hash) { info.textContent = 'Obecne hasło jest nieprawidłowe.'; return; }
    u.salt = crypto.getRandomValues(new Uint8Array(8)).join('');
    u.hash = await luHash(n, u.salt);
    try { localStorage.setItem(LU_KEY, JSON.stringify(users)); } catch { info.textContent = 'Nie można zapisać w przeglądarce.'; return; }
    $('pwOld').value = ''; $('pwNew').value = ''; $('pwNew2').value = '';
    info.textContent = 'Hasło zostało zmienione.';
  };
  $('spAvatarFile').onchange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const img = new Image(), url = URL.createObjectURL(f);
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const sz = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - sz) / 2, (img.height - sz) / 2, sz, sz, 0, 0, 128, 128);
      pendingAvatar = c.toDataURL('image/png'); URL.revokeObjectURL(url);
      const pv = $('spAvatarPrev'); pv.src = pendingAvatar; pv.hidden = false; $('spAvatarClear').hidden = false;
      $('spInfo').textContent = 'Kliknij „Zapisz profil”, żeby zastosować awatar.';
    };
    img.onerror = () => { $('spInfo').textContent = 'Nie udało się wczytać obrazu.'; };
    img.src = url;
  };
  $('spAvatarClear').onclick = () => { pendingAvatar = ''; $('spAvatarPrev').hidden = true; $('spAvatarClear').hidden = true; $('spAvatarFile').value = ''; $('spInfo').textContent = 'Kliknij „Zapisz profil”, żeby usunąć awatar.'; };
  updateNav();
})();

var p2p = null;
const OVER_ELO = { before: [0, 0], after: [0, 0] };
const inboxId = (n) => 'szachymat-' + String(n).toLowerCase();
let inbox = null, inboxFor = '', pend = null;
function p2pSend(m) {
  if (!p2p) return;
  if (p2p.host) hostHandle(m, p2p.hostColor);
  else if (p2p.conn && p2p.conn.open) p2p.conn.send(m);
}
function hostDeliver(color, msg) {
  if (color === p2p.hostColor) onWs(msg);
  else if (p2p.conn && p2p.conn.open) p2p.conn.send(msg);
}
function hostBoth(msg) { hostDeliver('w', msg); hostDeliver('b', msg); }
function hostClocks(g) { const c = { ...g.clock }; if (g.turnStart && g.moves >= 2) c[g.chess.turn()] -= Date.now() - g.turnStart; return c; }
function hostTimer(g) {
  clearTimeout(g.timer);
  if (g.over || g.moves < 2) return;
  const t = g.chess.turn();
  const left = g.clock[t] - (Date.now() - g.turnStart);
  g.timer = setTimeout(() => hostEnd(t === 'w' ? 'b' : 'w', 'timeout'), Math.max(0, left) + 20);
}
function p2pDrop() {
  const conn = p2p && p2p.conn;
  setTimeout(() => { try { if (conn) conn.close(); } catch {} if (p2p && p2p.conn === conn) p2p = null; }, 800);
}
function hostEnd(winner, reason) {
  const g = p2p && p2p.g;
  if (!g || g.over) return;
  g.over = true; clearTimeout(g.timer); p2p.active = false;
  hostBoth({ t: 'over', winner, reason, elo: OVER_ELO });
  p2pDrop();
}
function hostHandle(m, color) {
  const g = p2p && p2p.g;
  if (!g || g.over || !m) return;
  const other = color === 'w' ? 'b' : 'w';
  if (m.t === 'resign') return hostEnd(other, 'resign');
  if (m.t === 'draw') {
    if (g.drawOffer && g.drawOffer !== color) return hostEnd(null, 'agreement');
    g.drawOffer = color;
    return hostDeliver(other, { t: 'drawOffer' });
  }
  if (m.t === 'chat') return hostBoth({ t: 'chat', from: g.names[color], text: String(m.text || '').slice(0, 200) });
  if (m.t !== 'move') return;
  if (g.chess.turn() !== color) return hostDeliver(color, { t: 'illegal' });
  const now = Date.now();
  if (g.moves >= 2) {
    g.clock[color] -= now - g.turnStart;
    if (g.clock[color] <= 0) return hostEnd(other, 'timeout');
  }
  let res; try { res = g.chess.move({ from: m.from, to: m.to, promotion: m.promotion }); } catch { res = null; }
  if (!res) return hostDeliver(color, { t: 'illegal' });
  g.moves++;
  if (g.moves > 2) g.clock[color] += g.inc;
  g.turnStart = now; g.drawOffer = null;
  hostBoth({ t: 'move', from: res.from, to: res.to, promotion: res.promotion, san: res.san, fen: g.chess.fen(), clock: hostClocks(g) });
  if (g.chess.isCheckmate()) return hostEnd(color, 'checkmate');
  if (g.chess.isStalemate()) return hostEnd(null, 'stalemate');
  if (g.chess.isThreefoldRepetition()) return hostEnd(null, 'repetition');
  if (g.chess.isInsufficientMaterial()) return hostEnd(null, 'insufficient');
  if (g.chess.isDraw()) return hostEnd(null, 'fifty-move');
  hostTimer(g);
}
function hostStart(h) {
  const hc = Math.random() < 0.5 ? 'w' : 'b';
  p2p.hostColor = hc; p2p.guestColor = hc === 'w' ? 'b' : 'w'; p2p.active = true;
  const me = { name: user.name, ratings: { ...user.ratings } };
  const gu = { name: String((h && h.name) || 'Gość').slice(0, 16), ratings: (h && h.ratings) || {} };
  const cat = catOfTime(p2p.time, p2p.inc);
  const white = hc === 'w' ? me : gu, black = hc === 'w' ? gu : me;
  p2p.g = { chess: new Chess(), clock: { w: p2p.time * 60000, b: p2p.time * 60000 }, inc: p2p.inc * 1000, turnStart: null, timer: null, over: false, drawOffer: null, moves: 0, names: { w: white.name, b: black.name } };
  const base = { t: 'start', cat, time: p2p.time, inc: p2p.inc, white, black };
  setTab('play');
  hostDeliver('w', { ...base, color: 'w' });
  hostDeliver('b', { ...base, color: 'b' });
}
function ensureInbox() {
  if (!user || typeof Peer === 'undefined') return;
  if (inbox && inboxFor === user.name.toLowerCase()) return;
  try { if (inbox) inbox.destroy(); } catch {}
  inboxFor = user.name.toLowerCase();
  const peer = inbox = new Peer(inboxId(user.name));
  peer.on('error', (e) => { if (e.type !== 'peer-unavailable') console.warn('peer', e.type); });
  peer.on('disconnected', () => { try { peer.reconnect(); } catch {} });
  peer.on('connection', (conn) => {
    conn.on('data', (m) => {
      if (!m) return;
      if (m.t === 'challenge') {
        if (pend || (p2p && p2p.active) || mode !== 'analysis') { try { conn.send({ t: 'busy' }); } catch {} return; }
        pend = { conn, m };
        $('challengeText').textContent = String(m.from).slice(0, 16) + ' (' + (+m.rating || 100) + ') wyzywa Cię na ' + (+m.time) + '+' + (+m.inc);
        $('challengePanel').hidden = false;
        notify('Wyzwanie na pojedynek', String(m.from).slice(0, 16) + ' wyzywa Cię na ' + (+m.time) + '+' + (+m.inc), 'challenge');
      } else if (p2p && p2p.conn === conn && !p2p.host) {
        onWs(m);
        if (m.t === 'over') { p2p.active = false; p2pDrop(); }
      }
    });
    conn.on('close', () => {
      if (pend && pend.conn === conn) { pend = null; $('challengePanel').hidden = true; }
      if (p2p && p2p.conn === conn && !p2p.host && p2p.active && mode === 'online' && !over) { p2p.active = false; onWs({ t: 'over', winner: myColor, reason: 'disconnect', elo: OVER_ELO }); }
    });
  });
}
function sendChallenge() {
  const info = $('duelInfo');
  if (!user) { $('authErr').textContent = 'Aby grać, załóż konto lub się zaloguj.'; $('authModal').hidden = false; return; }
  if (!viewedProfile) return;
  if (mode !== 'analysis' || (p2p && p2p.active)) return alert('Najpierw dokończ trwającą partię.');
  if (!inbox || !inbox.open) { info.textContent = 'Łączę z siecią pojedynków… spróbuj za chwilę.'; ensureInbox(); return; }
  const time = Math.min(60, Math.max(1, +$('duelTime').value || 5)), inc = Math.min(30, Math.max(0, +$('duelInc').value || 0));
  const target = viewedProfile.name;
  const conn = inbox.connect(inboxId(target), { reliable: true });
  p2p = { host: true, peer: inbox, conn, time, inc, active: false };
  info.textContent = 'Wysłano wyzwanie do ' + target + '. Czekam na odpowiedź…';
  const fail = (msg) => { if (p2p && p2p.conn === conn && !p2p.active) { p2p = null; info.textContent = msg; } };
  const to = setTimeout(() => { fail(target + ' nie odpowiada (jest offline?).'); try { conn.close(); } catch {} }, 45000);
  conn.on('open', () => conn.send({ t: 'challenge', from: user.name, rating: user.ratings[catOfTime(time, inc)] || 100, time, inc }));
  conn.on('data', (m) => {
    if (!m) return;
    if (m.t === 'hello' && !p2p.g) { clearTimeout(to); hostStart(m); }
    else if (m.t === 'declined') { clearTimeout(to); fail(target + ' odrzucił wyzwanie.'); }
    else if (m.t === 'busy') { clearTimeout(to); fail(target + ' jest teraz zajęty.'); }
    else if (p2p && p2p.conn === conn && p2p.active) hostHandle(m, p2p.guestColor);
  });
  conn.on('close', () => {
    clearTimeout(to);
    if (p2p && p2p.conn === conn) { if (p2p.g && !p2p.g.over) hostEnd(p2p.hostColor, 'disconnect'); else fail('Połączenie zamknięte.'); }
  });
  inbox.once('error', (e) => { if (e.type === 'peer-unavailable') { clearTimeout(to); fail(target + ' jest offline. Wyzwanie działa tylko, gdy gracz ma otwartą stronę.'); } });
}
function acceptChallenge(ok) {
  if (!pend) return;
  const { conn } = pend; pend = null; $('challengePanel').hidden = true;
  if (!ok) { try { conn.send({ t: 'declined' }); setTimeout(() => conn.close(), 300); } catch {} return; }
  if (mode !== 'analysis') { try { conn.send({ t: 'busy' }); } catch {} return; }
  p2p = { host: false, peer: inbox, conn, active: true };
  setTab('play');
  conn.send({ t: 'hello', name: user.name, ratings: { ...user.ratings } });
}
$('profDuel').onclick = sendChallenge;
$('chAccept').onclick = () => acceptChallenge(true);
$('chDecline').onclick = () => acceptChallenge(false);
(function () {
  const prev = setUser;
  setUser = function (u) { prev(u); ensureInbox(); if (viewedProfile && user) { const self = user.name.toLowerCase() === viewedProfile.name.toLowerCase(); $('profDuel').hidden = self; } };
  const prevRP = renderProfile;
  renderProfile = function (m) { prevRP(m); if (!m.missing) $('profDuel').hidden = !user || (user.name.toLowerCase() === m.name.toLowerCase()); };
  ensureInbox();
})();

(function () {
  const sel = $('optPremoveMax');
  const sync = () => { sel.value = String(S.premoveMax || 10); if (!sel.value) sel.value = '10'; };
  sel.onchange = () => { S.premoveMax = +sel.value; if (premoves.length > S.premoveMax) premoves = premoves.slice(0, S.premoveMax); saveSettings(); render(); };
  const prev = applySettings;
  applySettings = function () { prev(); sync(); };
  sync();
})();

(function () {
  const hue = (n) => { let h = 0; for (const c of String(n)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const origPR = playerRow;
  playerRow = function (r) {
    const d = origPR(r);
    const av = document.createElement('span'); av.className = 'pav';
    av.textContent = String(r.name)[0].toUpperCase();
    av.style.background = 'linear-gradient(135deg,hsl(' + hue(r.name) + ' 50% 42%),hsl(' + hue(r.name) + ' 45% 26%))';
    d.insertBefore(av, d.querySelector('.pn'));
    return d;
  };
  const origRPf = renderProfile;
  renderProfile = function (m) {
    origRPf(m);
    if (m.missing) return;
    const body = $('profBody');
    body.querySelectorAll('div[style*="margin-top: 8px"], div[style*="margin-top:8px"]').forEach((e) => e.remove());
    const p = m.profile || {};
    const hero = body.querySelector('.profhero');
    if (hero) {
      hero.classList.add('pubhero');
      const av = hero.querySelector('.profavatar');
      if (av) { av.style.background = ''; av.style.color = ''; av.textContent = m.name[0].toUpperCase();
        if (typeof p.avatar === 'string' && p.avatar.startsWith('data:image/')) { av.style.background = 'center/cover url("' + p.avatar + '")'; av.style.color = 'transparent'; }
        else av.style.background = p.color || 'linear-gradient(135deg,hsl(' + hue(m.name) + ' 50% 42%),hsl(' + hue(m.name) + ' 45% 26%))'; }
      const who = hero.querySelector('.profwho');
      if (who) {
        const chips = document.createElement('div'); chips.className = 'chips';
        const chip = (t, c) => { const e = document.createElement('span'); e.className = 'chip ' + (c || ''); e.textContent = t; chips.appendChild(e); };
        chip(m.online ? '● Online' : '○ Offline', m.online ? 'on' : '');
        if (p.country) chip('🌍 ' + p.country);
        if (m.created) chip('📅 Dołączył ' + new Date(m.created).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }));
        who.appendChild(chips);
        const sub = who.querySelector('.muted.small'); if (sub) sub.remove();
      }
    }
    if (p.bio) { const q = document.createElement('blockquote'); q.className = 'probio'; q.textContent = p.bio; const rt = body.querySelector('.profratings'); body.insertBefore(q, rt || null); }
    const st = body.querySelector('.muted.small:last-child');
    if (st && /^Partie:/.test(st.textContent)) st.remove();
    const g = m.games || 0, w = m.wins || 0, l = m.losses || 0, dr = m.draws || 0;
    const tiles = document.createElement('div'); tiles.className = 'protiles';
    [[g, 'Partie'], [w, 'Wygrane'], [dr, 'Remisy'], [l, 'Porażki'], [g ? Math.round(w / g * 100) + '%' : '–', 'Skuteczność']].forEach(([v, t]) => {
      const e = document.createElement('div'); const b = document.createElement('b'); b.textContent = v; const s = document.createElement('span'); s.textContent = t; e.append(b, s); tiles.appendChild(e);
    });
    body.appendChild(tiles);
    $('profilePanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  const origGL = globalLine;
  globalLine = function (m) {
    const c = $('globalChat');
    const mine = user && m.from && user.name.toLowerCase() === String(m.from).toLowerCase();
    const d = document.createElement('div'); d.className = 'cmsg' + (mine ? ' mine' : '');
    const av = document.createElement('span'); av.className = 'pav sm'; av.textContent = String(m.from)[0].toUpperCase();
    av.style.background = 'linear-gradient(135deg,hsl(' + hue(m.from) + ' 50% 42%),hsl(' + hue(m.from) + ' 45% 26%))';
    const bub = document.createElement('div'); bub.className = 'cb';
    const n = document.createElement('b'); n.textContent = m.from;
    const t = document.createElement('span'); t.textContent = m.text;
    bub.append(n, t); d.append(av, bub); c.appendChild(d); c.scrollTop = c.scrollHeight;
  };
  $('quickTimes').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $('duelTime').value = b.dataset.t; $('duelInc').value = b.dataset.i;
    [...$('quickTimes').children].forEach((x) => x.classList.toggle('sel', x === b));
  };
  const setStat = () => {
    const o = document.getElementById('online'); const t = o ? o.textContent.replace(/\D+/g, '') : '';
    $('comOnline').textContent = t || '–';
    $('comFriends').textContent = $('friendList').querySelectorAll('.prow').length;
  };
  new MutationObserver(setStat).observe($('friendList'), { childList: true });
  new MutationObserver(setStat).observe($('online'), { childList: true, characterData: true, subtree: true });
  setStat();
})();

(function () {
  const prev = renderNames;
  renderNames = function () {
    prev();
    const av = $('avBottom');
    if (!user || (mode !== 'bot' && mode !== 'online')) { av.style.background = ''; av.style.color = ''; return; }
    const cat = (mode === 'online' && typeof onlineCat !== 'undefined' && onlineCat) || 'blitz';
    const elo = user.ratings[cat] != null ? user.ratings[cat] : user.ratings.blitz;
    $('nameBottom').textContent = `${user.name} (${elo})`;
    const p = user.profile || {};
    av.innerHTML = ''; av.textContent = user.name[0].toUpperCase();
    av.style.display = 'flex'; av.style.alignItems = 'center'; av.style.justifyContent = 'center';
    av.style.fontWeight = '800'; av.style.color = '#fff';
    if (typeof p.avatar === 'string' && p.avatar.startsWith('data:image/')) { av.style.background = 'center/cover url("' + p.avatar + '")'; av.style.color = 'transparent'; }
    else av.style.background = p.color || '#81b64c';
  };
  renderNames();
})();

(function () {
  const box = $('quickTimes');
  box.innerHTML = '';
  box.classList.add('modes-in-profile');
  const setSel = () => box.querySelectorAll('button').forEach((x) => x.classList.toggle('sel', +x.dataset.t === +$('duelTime').value && +x.dataset.i === +$('duelInc').value));
  for (const [c, list] of Object.entries(MODE_GROUPS)) {
    const g = document.createElement('div'); g.className = 'modegroup';
    g.innerHTML = `<h3>${CATS[c][1]} ${CATS[c][0]}</h3><div class="timegrid"></div>`;
    list.forEach(([t, i]) => {
      const b = document.createElement('button'); b.type = 'button';
      b.textContent = fmtMode(t, i); b.dataset.t = t; b.dataset.i = i;
      g.querySelector('.timegrid').appendChild(b);
    });
    box.appendChild(g);
  }
  box.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; $('duelTime').value = b.dataset.t; $('duelInc').value = b.dataset.i; setSel(); };
  setSel();
})();

(function () {
  const OPEN = [
    { name: 'Caro-Kann (Advance)', side: 'b', vs: 'Białe grają e4', desc: 'Solidna obrona czarnych z pewną strukturą pionową.', line: 'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2' },
    { name: 'Obrona Sycylijska (Najdorf)', side: 'b', vs: 'Białe grają e4', desc: 'Ostra, bojowa obrona z kontratakiem.', line: 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6' },
    { name: 'Obrona Francuska', side: 'b', vs: 'Białe grają e4', desc: 'Twarda struktura, kontratak w centrum.', line: 'e4 e6 d4 d5 Nc3 Nf6 Bg5 Be7 e5 Nfd7 Bxe7 Qxe7' },
    { name: 'Partia Włoska', side: 'w', vs: 'Czarne grają e5', desc: 'Szybki rozwój i gra na f7.', line: 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+' },
    { name: 'Partia Hiszpańska', side: 'w', vs: 'Czarne grają e5', desc: 'Klasyk gry na presję w centrum.', line: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O' },
    { name: 'Gambit Hetmański (odrzucony)', side: 'w', vs: 'Czarne grają d5', desc: 'Walka o centrum pionem c.', line: 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3' },
    { name: 'Obrona Królewsko-Indyjska', side: 'b', vs: 'Białe grają d4', desc: 'Hipernowoczesne podejście: centrum atakujesz później.', line: 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5' },
    { name: 'System Londyński', side: 'w', vs: 'Czarne grają d5', desc: 'Prosty i uniwersalny system białych.', line: 'd4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6' },
  ];
  const GAMBITS = [
    { name: 'Oryginalny Alien Gambit', side: 'w', vs: 'Bot gra Caro-Kann', desc: 'Grasz białymi przeciw Caro-Kann i poświęcasz materiał dla inicjatywy. Przy złym ruchu zobaczysz strzałkę z właściwym.', line: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Ng5 h6 Nxf7 Kxf7' },
  ];
  OPEN.push(...NEW_OPEN); GAMBITS.push(...NEW_GAMBITS);
  TITLES.openings = 'Otwarcia'; TITLES.gambits = 'Gambity';
  delete GROUPS.puzzle;
  GROUPS.learn = ['Ucz się', [['puzzle', 'Zadania'], ['openings', 'Otwarcia'], ['gambits', 'Gambity'], ['coach', 'Trener'], ['analysis', 'Analiza']]];

  let drill = null, hint = null, savedArrow = null, last = null;
  const msgs = (t, c) => document.querySelectorAll('.drillmsg').forEach((e) => { e.textContent = t; e.className = 'drillmsg ' + (c || ''); });
  const clean = (s) => String(s).replace(/[+#!?]/g, '');
  const find = (san) => game.moves({ verbose: true }).find((m) => clean(m.san) === san);
  function endDrill() {
    if (savedArrow !== null) { try { $('showArrow').checked = savedArrow; } catch {} }
    drill = null; hint = null; savedArrow = null; last = null;
    document.body.classList.remove('drilling');
    window.__drillClk = false; clk = null; premoves = [];
  }
  window.__drillTimeout = (turn) => {
    const d = drill;
    if (!d) return;
    const won = turn !== d.color;
    over = true; premoves = [];
    msgs(won ? '⏱ Rywalowi skończył się czas, wygrałeś!' : '⏱ Skończył Ci się czas.', won ? 'ok' : 'bad');
    showResult(won ? 'Wygrałeś!' : 'Przegrałeś', 'przez czas');
    $('endTitle').textContent = won ? 'Wygrałeś na czas w gambicie ' + d.name + '!' : 'Przegrana na czas';
    updateEndCard();
  };
  const prevApply = applyMove;
  applyMove = function (from, to, promotion, byUser) {
    const d = drill;
    if (d && d.fin && byUser && mode === 'analysis') {
      if (game.turn() !== d.color) return false;
      if (d.top && d.top.length && !d.top.some((u) => u.slice(0, 4) === from + to)) {
        hint = { from: d.top[0].slice(0, 2), to: d.top[0].slice(2, 4) };
        msgs('✗ Słaby ruch. Spróbuj ruchu ze strzałki.', 'bad'); render(); return false;
      }
      hint = null; d.top = null;
      const r2 = prevApply(from, to, promotion, true);
      setTimeout(() => nextTurn(d), 80);
      return r2;
    }
    if (!d || mode !== 'analysis' || !byUser || d.i >= d.line.length) return prevApply(from, to, promotion, byUser);
    if (game.turn() !== d.color) return false;
    const cand = game.moves({ verbose: true }).find((m) => m.from === from && m.to === to);
    if (cand && clean(cand.san) === d.line[d.i]) {
      hint = null; d.i++;
      const r = prevApply(from, to, promotion, true);
      step(d);
      return r;
    }
    const exp = find(d.line[d.i]);
    hint = exp ? { from: exp.from, to: exp.to } : null;
    msgs('✗ To nie ruch z tej linii. Zagraj ruch wskazany strzałką (' + d.line[d.i] + ').', 'bad');
    render();
    return false;
  };
  function step(d) {
    if (drill !== d) return;
    if (d.i >= d.line.length) {
      if (finOn()) { d.fin = true; msgs('✓ Linia ukończona! Teraz dokończ partię. Zły ruch zostanie poprawiony strzałką.', 'ok'); nextTurn(d); return; }
      msgs('✓ Brawo! Linia „' + d.name + '” ukończona. Możesz grać dalej lub zacząć od nowa.', 'ok'); return;
    }
    if (game.turn() === d.color) { msgs('Twój ruch (' + (d.color === 'w' ? 'Białe' : 'Czarne') + '). Postęp: ' + Math.floor(d.i / 2 + 1) + '/' + Math.ceil(d.line.length / 2), ''); return; }
    msgs('Bot odpowiada…', '');
    setTimeout(() => {
      if (drill !== d) return;
      const m = find(d.line[d.i]);
      if (!m) { msgs('Błąd w danych linii.', 'bad'); return; }
      d.i++; prevApply(m.from, m.to, m.promotion, false); step(d);
    }, 650);
  }
  function start(item) {
    if (mode !== 'analysis') { alert('Najpierw dokończ trwającą partię.'); return; }
    if (savedArrow === null) savedArrow = $('showArrow').checked;
    $('showArrow').checked = false;
    last = item;
    document.body.classList.add('drilling');
    window.__drillClk = true;
    clk = { w: 5 * 60000, b: 5 * 60000, inc: 3000, at: Date.now() };
    over = false;
    drill = { line: item.line.split(' '), i: 0, color: item.side, name: item.name };
    startFen = START_FEN; moves = []; ply = 0; selected = null; lines = []; hint = null;
    myColor = item.side; flipped = item.side === 'b';
    render(); refresh();
    step(drill);
  }
  const prevRender = render;
  render = function () {
    prevRender();
    boardEl.querySelector('.drillarrow')?.remove();
    if (!hint || !drill) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'arrows drillarrow'); svg.setAttribute('viewBox', '0 0 8 8');
    const [x1, y1] = sqCenter(hint.from), [x2, y2] = sqCenter(hint.to);
    const len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const ex = x2 - ux * 0.32, ey = y2 - uy * 0.32, px = -uy * 0.2, py = ux * 0.2;
    const line = document.createElementNS(svg.namespaceURI, 'line');
    Object.entries({ x1, y1, x2: ex, y2: ey, stroke: '#f2c230', 'stroke-width': 0.16, opacity: 0.95 }).forEach(([k, v]) => line.setAttribute(k, v));
    const poly = document.createElementNS(svg.namespaceURI, 'polygon');
    poly.setAttribute('points', x2 + ',' + y2 + ' ' + (ex + px) + ',' + (ey + py) + ' ' + (ex - px) + ',' + (ey - py));
    poly.setAttribute('fill', '#f2c230'); poly.setAttribute('opacity', 0.95);
    svg.append(line, poly); boardEl.appendChild(svg);
  };
  function build(box, items) {
    box.innerHTML = '';
    items.forEach((it) => {
      const c = document.createElement('div'); c.className = 'drillcard';
      const h = document.createElement('h3'); h.textContent = it.name;
      const tag = document.createElement('span'); tag.className = 'drilltag'; tag.textContent = (it.side === 'w' ? '♔ Grasz Białymi' : '♚ Grasz Czarnymi') + ' · ' + it.vs;
      const p = document.createElement('p'); p.textContent = it.desc;
      const ln = document.createElement('code'); ln.textContent = it.line;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'primary'; b.textContent = '▶ Ćwicz';
      b.onclick = () => start(it);
      c.append(h, tag, p, ln, b); box.appendChild(c);
    });
  }
  const finOn = () => { const e = document.querySelector('.finOn'); return !!(e && e.checked); };
  let tok = 0;
  function ask(fen, o, cb) {
    if (!engineReady) { setTimeout(() => ask(fen, o, cb), 300); return; }
    engineRun(() => {
      const my = ++tok, infos = {};
      searching = true; searchKind = 'drill';
      if (o.elo) { send('setoption name UCI_LimitStrength value true'); send('setoption name UCI_Elo value ' + Math.min(3190, Math.max(1320, o.elo))); }
      else { send('setoption name UCI_LimitStrength value false'); send('setoption name Skill Level value 20'); }
      send('setoption name MultiPV value ' + o.mpv);
      send('position fen ' + fen); send('go movetime ' + o.ms);
      const h = (ev) => {
        const l = String(ev.data);
        if (l.startsWith('info') && l.includes(' multipv ')) { const m = l.match(/multipv (\d+).* pv (\S+)/); if (m) infos[m[1]] = m[2]; }
        else if (l.startsWith('bestmove')) { worker.removeEventListener('message', h); cb(my === tok, l.split(/\s+/)[1], Object.values(infos)); }
      };
      worker.addEventListener('message', h);
    });
  }
  function nextTurn(d) {
    if (drill !== d) return;
    if (game.isGameOver()) {
      const mated = game.isCheckmate(), won = mated && game.turn() !== d.color;
      msgs(mated ? (won ? '🏆 Szach mat, wygrałeś!' : 'Mat. Tym razem przegrana.') : 'Koniec partii: remis.', 'ok');
      showResult(won ? 'Wygrałeś!' : mated ? 'Przegrałeś' : 'Remis', mated ? 'przez szach mat' : 'remis');
      $('endTitle').textContent = won ? 'Wygrałeś w gambicie ' + d.name + '!' : mated ? 'Przegrana w gambicie' : 'Remis';
      $('endMsg').textContent = won ? 'Świetnie! Zobacz przegląd partii albo zagraj od nowa.' : 'Przejrzyj partię i spróbuj jeszcze raz.';
      updateEndCard();
      return;
    }
    const fen = game.fen();
    if (game.turn() === d.color) {
      msgs('Twój ruch. Analizuję pozycję do podpowiedzi…', '');
      ask(fen, { mpv: 3, ms: 500 }, (ok, best, list) => {
        if (drill !== d || game.fen() !== fen) return;
        d.top = list.length ? list : (best && best !== '(none)' ? [best] : null);
        msgs('Twój ruch (' + (d.color === 'w' ? 'Białe' : 'Czarne') + ').', '');
      });
      return;
    }
    msgs('Bot myśli…', '');
    const elo = +(document.querySelector('.finElo') || { value: 100 }).value;
    const pRand = elo < 1320 ? Math.min(1, ((1320 - elo) / 1320) * 1.15) : 0;
    const play = (u) => { if (drill !== d || game.fen() !== fen) return; prevApply(u.slice(0, 2), u.slice(2, 4), u[4], false); nextTurn(d); };
    if (Math.random() < pRand) { const ms = game.moves({ verbose: true }); const m = ms[Math.floor(Math.random() * ms.length)]; setTimeout(() => play(m.from + m.to + (m.promotion || '')), 600); return; }
    ask(fen, { mpv: 1, ms: 300, elo }, (ok, best) => { if (best && best !== '(none)') setTimeout(() => play(best), 400); });
  }
  [['openList', 'drillmsg'], ['gambitList', 'drillmsg']].forEach(([id]) => {
    const w = document.createElement('div'); w.className = 'finctl';
    w.innerHTML = '<label class="finrow"><span><b>Dokończ partię po linii</b><small>Po ukończeniu wariantu grasz dalej z botem, z podpowiedziami</small></span><span class="switch"><input type="checkbox" class="finOn" checked><i></i></span></label><label class="finrow"><span><b>Siła bota (ELO)</b><small>100 = prawie losowe ruchy</small></span><select class="finElo setselect"><option value="100" selected>100</option><option value="400">400</option><option value="800">800</option><option value="1200">1200</option><option value="1500">1500</option><option value="1800">1800</option><option value="2200">2200</option></select></label>';
    $(id).parentNode.insertBefore(w, $(id).parentNode.firstChild);
  });
  document.addEventListener('change', (e) => {
    if (e.target.classList && e.target.classList.contains('finOn')) document.querySelectorAll('.finOn').forEach((x) => { x.checked = e.target.checked; });
    if (e.target.classList && e.target.classList.contains('finElo')) document.querySelectorAll('.finElo').forEach((x) => { x.value = e.target.value; });
  });
  build($('openList'), OPEN); build($('gambitList'), GAMBITS);
  const reset = () => { if (last) start(last); };
  $('drillResetO').onclick = reset; $('drillResetG').onclick = reset;

  const lt = $('learnToggle'), ls = $('learnSub');
  lt.onclick = () => { ls.hidden = !ls.hidden; lt.classList.toggle('open', !ls.hidden); };
  lt.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lt.click(); } };
  ls.querySelectorAll('button').forEach((b) => { b.onclick = () => setTab(b.dataset.tab); });
  const prevSetTab = setTab;
  setTab = function (t) {
    if (drill && t !== 'openings' && t !== 'gambits') endDrill();
    prevSetTab(t);
    const inLearn = groupOf(t) === 'learn';
    lt.classList.toggle('active', inLearn);
    if (inLearn) { ls.hidden = false; lt.classList.add('open'); }
    ls.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.tab === t));
  };
  window.__drillLines = [...OPEN, ...GAMBITS].map((x) => x.line);
})();

(function () {
  const mob = () => window.matchMedia('(max-width: 800px)').matches;
  const sheets = ['moreSub', 'learnSub'];
  const closeAll = () => sheets.forEach((id) => { const e = $(id); if (e && mob()) { e.hidden = true; } });
  const ms = $('moreSub');
  if (ms && !ms.querySelector('[data-tab="settings"]')) {
    const b = document.createElement('button'); b.dataset.tab = 'settings'; b.dataset.group = 'more'; b.className = 'mobonly';
    b.innerHTML = '<span>Ustawienia</span>'; ms.appendChild(b);
  }
  ms.querySelectorAll('button').forEach((b) => { b.onclick = () => { setTab(b.dataset.tab); closeAll(); }; });
  $('learnSub').querySelectorAll('button').forEach((b) => { const o = b.onclick; b.onclick = () => { o(); closeAll(); }; });
  ['moreToggle', 'learnToggle'].forEach((id, i) => {
    const t = $(id); const o = t.onclick;
    t.onclick = () => { if (mob()) { const other = $(sheets[1 - i]); other.hidden = true; } o(); };
  });
  document.addEventListener('click', (e) => { if (mob() && !e.target.closest('.sidenav')) closeAll(); });
  document.querySelectorAll('#tabs > button').forEach((b) => b.addEventListener('click', () => { closeAll(); ['moreToggle', 'learnToggle'].forEach((id) => $(id).classList.remove('open')); }));
})();
