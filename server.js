const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const { Chess } = require('chess.js');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'users.json');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon',
};
const ROUTES = [
  ['/engine/', path.join(ROOT, 'node_modules/stockfish/bin/')],
  ['/lib/chess.js', path.join(ROOT, 'node_modules/chess.js/dist/esm/chess.js')],
  ['/', path.join(ROOT, 'public/')],
];
function resolve(urlPath) {
  for (const [prefix, target] of ROUTES) {
    const dir = prefix.endsWith('/');
    if (dir ? urlPath.startsWith(prefix) : urlPath === prefix) {
      if (!dir) return target;
      const full = path.normalize(path.join(target, urlPath.slice(prefix.length)));
      return full.startsWith(target) ? full : null;
    }
  }
  return null;
}
const server = http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(req.url.split('?')[0]); } catch { res.writeHead(400); return res.end(); }
  if (urlPath === '/') urlPath = '/index.html';
  if (urlPath.startsWith('/api/puzzle/')) return puzzleApi(req, res, urlPath);
  if (urlPath === '/auth/discord' || urlPath === '/auth/discord/callback') return discordAuth(req, res, urlPath);
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  const file = resolve(urlPath);
  if (!file) { res.writeHead(404); return res.end('Not found'); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Content-Length': st.size, 'Cache-Control': 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
  });
});

const discordStates = new Map(); // state -> expiry
const PUZZLES = JSON.parse(fs.readFileSync(path.join(ROOT, 'puzzles-data/puzzles.json'), 'utf8'));
function puzzleApi(req, res, urlPath) {
  const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
  const q = new URL(req.url, 'http://x').searchParams;
  const action = urlPath.slice('/api/puzzle/'.length);
  if (action === 'next') {
    const r = +q.get('r') || 600;
    const seen = new Set((q.get('seen') || '').split(',').map(Number));
    const cur = Number(q.get('cur'));
    let best = -1, bd = 1e9;
    PUZZLES.forEach((p, i) => {
      if (seen.has(i) || i === cur) return;
      const d = Math.abs(p.r - r) + Math.random() * 120;
      if (d < bd) { bd = d; best = i; }
    });
    if (best < 0) best = Number.isInteger(cur) ? (cur + 1) % PUZZLES.length : 0;
    const p = PUZZLES[best];
    return send(200, { id: best, fen: p.fen, r: p.r, th: p.th, first: p.moves[0] });
  }
  const id = Number(q.get('id')), i = Number(q.get('i'));
  const p = PUZZLES[id];
  if (!p || !Number.isInteger(i) || i < 1 || i > p.moves.length) return send(400, { error: 'bad request' });
  if (action === 'hint') return send(200, { from: p.moves[i] ? p.moves[i].slice(0, 2) : null, to: p.moves[i] ? p.moves[i].slice(2, 4) : null });
  if (action === 'solution') return send(200, { rest: p.moves.slice(i) });
  if (action === 'check') {
    const move = String(q.get('move') || '');
    if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)) return send(400, { error: 'bad move' });
    if (move === p.moves[i]) {
      const last = i + 1 >= p.moves.length;
      return send(200, { ok: true, done: last, reply: last ? null : p.moves[i + 1] });
    }
    try {
      const g = new Chess(p.fen);
      for (let k = 0; k < i; k++) g.move({ from: p.moves[k].slice(0, 2), to: p.moves[k].slice(2, 4), promotion: p.moves[k][4] });
      g.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] });
      if (g.isCheckmate()) return send(200, { ok: true, done: true, reply: null });
    } catch {}
    return send(200, { ok: false });
  }
  send(404, { error: 'not found' });
}
function discordAuth(req, res, urlPath) {
  const id = process.env.DISCORD_CLIENT_ID, secret = process.env.DISCORD_CLIENT_SECRET;
  const redirect = `${process.env.PUBLIC_URL || `http://localhost:${PORT}`}/auth/discord/callback`;
  const page = (msg) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<meta charset="utf-8"><body style="font-family:sans-serif;padding:2em"><p>${msg}</p><a href="/">Wróć do gry</a></body>`);
  };
  if (!id || !secret) return page('Logowanie przez Discord nie jest skonfigurowane. Ustaw DISCORD_CLIENT_ID i DISCORD_CLIENT_SECRET i uruchom serwer ponownie.');
  if (urlPath === '/auth/discord') {
    const state = crypto.randomBytes(16).toString('hex');
    discordStates.set(state, Date.now() + 600000);
    res.writeHead(302, { Location: 'https://discord.com/oauth2/authorize?' + new URLSearchParams({ client_id: id, redirect_uri: redirect, response_type: 'code', scope: 'identify email', state }) });
    return res.end();
  }
  const q = new URL(req.url, 'http://localhost').searchParams;
  const exp = discordStates.get(q.get('state'));
  discordStates.delete(q.get('state'));
  if (!exp || exp < Date.now() || !q.get('code')) return page('Logowanie przez Discord nie powiodło się (nieprawidłowy lub wygasły stan).');
  (async () => {
    const tr = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: 'authorization_code', code: q.get('code'), redirect_uri: redirect }),
    });
    const tok = await tr.json();
    if (!tok.access_token) throw new Error('no token');
    const me = await (await fetch('https://discord.com/api/users/@me', { headers: { Authorization: 'Bearer ' + tok.access_token } })).json();
    if (!me.id) throw new Error('no user');
    let u = Object.values(db.users).find((x) => x.discordId === me.id);
    if (!u) {
      let base = String(me.username || 'gracz').replace(/[^A-Za-z0-9_]/g, '').slice(0, 14) || 'gracz';
      if (base.length < 3) base += '_dc';
      let name = base, n = 1;
      while (db.users[name.toLowerCase()]) name = base.slice(0, 12) + (++n);
      const email = String(me.email || '').toLowerCase();
      const salt = crypto.randomBytes(16).toString('hex');
      u = db.users[name.toLowerCase()] = {
        name, email: email && !Object.values(db.users).some((x) => x.email === email) ? email : '', discordId: me.id,
        salt, hash: hashPw(crypto.randomBytes(24).toString('hex'), salt), // random password: Discord-only account
        ratings: newRatings(), cg: newCg(), games: 0, wins: 0, losses: 0, draws: 0, settings: null, friends: [], created: Date.now(),
      };
      saveDb();
    }
    // Discord avatar -> profile.avatar (only if the user has no avatar yet)
    if (me.avatar && !(u.profile && u.profile.avatar)) {
      for (const size of [128, 64]) {
        try {
          const ar = await fetch(`https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png?size=${size}`);
          if (!ar.ok) continue;
          const uri = 'data:image/png;base64,' + Buffer.from(await ar.arrayBuffer()).toString('base64');
          if (uri.length < 80000) { u.profile = { ...(u.profile || {}), avatar: uri }; saveDb(); break; }
        } catch (e) { /* ignore, login still works */ }
      }
    }
    const token = crypto.randomBytes(24).toString('hex');
    tokens.set(token, u.name.toLowerCase());
    db.tokens[token] = u.name.toLowerCase();
    saveDb();
    res.writeHead(302, { Location: '/?dtoken=' + token });
    res.end();
  })().catch(() => page('Logowanie przez Discord nie powiodło się. Spróbuj ponownie.'));
}

const CATS = ['bullet', 'blitz', 'rapid', 'classical'];
const START_ELO = 100;
const newRatings = () => Object.fromEntries(CATS.map((c) => [c, START_ELO]));
const newCg = () => Object.fromEntries(CATS.map((c) => [c, 0]));
function catOf(time, inc) {
  const s = time * 60 + inc * 40; // estimated game length in seconds
  return s < 180 ? 'bullet' : s < 480 ? 'blitz' : s < 1500 ? 'rapid' : 'classical';
}

fs.mkdirSync(DATA_DIR, { recursive: true });
let db = { users: {} };
try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch {}
let saveTimer = null;
function saveDb() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => fs.writeFile(DB_FILE, JSON.stringify(db, null, 1), () => {}), 300);
}
// migrate accounts from the old single-ELO format (old value is kept in legacyElo)
for (const u of Object.values(db.users)) {
  if (!u.ratings) { u.legacyElo = u.elo; u.ratings = newRatings(); delete u.elo; }
  if (!u.cg) u.cg = newCg();
  if (!u.friends) u.friends = [];
  if (!u.created) u.created = Date.now();
}
saveDb();

const ACC_JSON = path.join(DATA_DIR, 'accounts-backup.json');
const ACC_TXT = path.join(DATA_DIR, 'accounts-backup.txt');
let accBackup = {};
try { accBackup = JSON.parse(fs.readFileSync(ACC_JSON, 'utf8')); } catch {}
function saveAccountBackup(name, password, email) {
  if (!name || !password) return;
  const k = name.toLowerCase();
  accBackup[k] = { username: name, password, email: email || (accBackup[k] && accBackup[k].email) || '', updatedAt: new Date().toISOString() };
  fs.writeFile(ACC_JSON, JSON.stringify(accBackup, null, 2), () => {});
  const lines = Object.values(accBackup).map((a) => `${a.username} | ${a.password} | ${a.email} | ${a.updatedAt}`);
  fs.writeFile(ACC_TXT, lines.join('\n') + '\n', () => {});
}
if (!db.tokens) db.tokens = {};
const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 32).toString('hex');
const tokens = new Map(Object.entries(db.tokens)); // token -> username key
function issueToken(key) {
  const token = crypto.randomBytes(24).toString('hex');
  tokens.set(token, key);
  db.tokens[token] = key;
  saveDb();
  return token;
}

function publicUser(u) {
  const ratings = Object.fromEntries(CATS.map((c) => [c, Math.round(u.ratings[c])]));
  return { name: u.name, ratings, cg: u.cg, games: u.games, wins: u.wins, losses: u.losses, draws: u.draws, settings: u.settings || null, profile: u.profile || {} };
}
function leaderboard() {
  const out = {};
  for (const c of CATS) {
    out[c] = Object.values(db.users).sort((a, b) => b.ratings[c] - a.ratings[c]).slice(0, 20)
      .map((u) => ({ name: u.name, rating: Math.round(u.ratings[c]), games: u.cg[c] }));
  }
  return out;
}

function kFactor(u, cat) { return u.cg[cat] < 20 ? 40 : u.ratings[cat] >= 2300 ? 10 : 20; }
function applyElo(white, black, result, cat) { // result: 1 white wins, 0 black wins, 0.5 draw
  const rw = white.ratings[cat], rb = black.ratings[cat];
  const ea = 1 / (1 + 10 ** ((rb - rw) / 400));
  const dw = kFactor(white, cat) * (result - ea);
  const db_ = kFactor(black, cat) * ((1 - result) - (1 - ea));
  const before = [Math.round(rw), Math.round(rb)];
  white.ratings[cat] = Math.max(START_ELO, rw + dw); // never below the starting 100
  black.ratings[cat] = Math.max(START_ELO, rb + db_);
  for (const [u, s] of [[white, result], [black, 1 - result]]) {
    u.games++; u.cg[cat]++;
    if (s === 1) u.wins++; else if (s === 0) u.losses++; else u.draws++;
  }
  return { before, after: [Math.round(white.ratings[cat]), Math.round(black.ratings[cat])], cat };
}

const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set();
const queue = []; // {ws, name, elo, time, inc, since}
const games = new Map();
let gid = 1;

const send = (ws, msg) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg)); };
const globalLog = [];
const resetTokens = new Map(); // token -> {key, exp}
// No SMTP configured: the message (with reset link) is printed in the server console.
// With SMTP_URL set and nodemailer installed, it is sent as a real e-mail.
function sendMail(to, subject, text) {
  if (process.env.SMTP_URL) {
    try {
      require('nodemailer').createTransport(process.env.SMTP_URL)
        .sendMail({ from: process.env.MAIL_FROM || 'szachy@localhost', to, subject, text })
        .catch((e) => console.log('Błąd wysyłki maila:', e.message));
      return;
    } catch (e) { console.log('nodemailer niedostępny:', e.message); }
  }
  console.log(`\n[MAIL do ${to}] ${subject}\n${text}\n`);
}
const isOnline = (key) => [...clients].some((c) => c.user === key);
function friendRows(me) {
  return me.friends.filter((f) => db.users[f]).map((f) => {
    const u = db.users[f];
    return { name: u.name, rating: Math.round(u.ratings.blitz), online: isOnline(f) };
  });
}
const challenges = new Map(); // id -> {id, from, fromName, to, time, inc, at}
let cid = 1;
// sends the friend list plus incoming friend requests to every open connection of this user
function pushFriendState(key) {
  const u = db.users[key];
  if (!u) return;
  const requests = (u.requests || []).filter((r) => db.users[r]).map((r) => ({ name: db.users[r].name, rating: Math.round(db.users[r].ratings.blitz), online: isOnline(r) }));
  for (const c of clients) if (c.user === key) send(c, { t: 'friends', rows: friendRows(u), requests });
}
function broadcastOnline() {
  const n = [...clients].filter((c) => c.user).length;
  for (const c of clients) send(c, { t: 'online', n, queue: queue.length });
}
function leaveQueue(ws) {
  const i = queue.findIndex((q) => q.ws === ws);
  if (i >= 0) queue.splice(i, 1);
}

function tryMatch() {
  const now = Date.now();
  for (let i = 0; i < queue.length; i++) {
    for (let j = i + 1; j < queue.length; j++) {
      const a = queue[i], b = queue[j];
      if (a.time !== b.time || a.inc !== b.inc || a.name === b.name) continue;
      // acceptable ELO gap widens by 25 per second of waiting
      const rangeA = 100 + Math.floor((now - a.since) / 1000) * 25;
      const rangeB = 100 + Math.floor((now - b.since) / 1000) * 25;
      if (Math.abs(a.elo - b.elo) <= Math.max(rangeA, rangeB)) {
        queue.splice(j, 1); queue.splice(i, 1);
        startGame(a, b);
        return tryMatch();
      }
    }
  }
}
setInterval(tryMatch, 1000);

function startGame(a, b) {
  const [w, bl] = Math.random() < 0.5 ? [a, b] : [b, a];
  const g = {
    id: gid++, chess: new Chess(), white: w.ws, black: bl.ws,
    wName: w.name, bName: bl.name, cat: catOf(w.time, w.inc),
    clock: { w: w.time * 60000, b: w.time * 60000 }, inc: w.inc * 1000,
    turnStart: null, timer: null, over: false, drawOffer: null, moves: 0,
  };
  games.set(g.id, g);
  w.ws.game = g; bl.ws.game = g;
  const base = {
    t: 'start', id: g.id, cat: g.cat, time: w.time, inc: w.inc, fen: g.chess.fen(),
    white: publicUser(db.users[w.name]), black: publicUser(db.users[bl.name]),
  };
  send(w.ws, { ...base, color: 'w' });
  send(bl.ws, { ...base, color: 'b' });
  broadcastOnline();
}

function clocksNow(g) {
  const c = { ...g.clock };
  if (g.turnStart && g.moves >= 2) c[g.chess.turn()] -= Date.now() - g.turnStart;
  return c;
}
function armTimer(g) {
  clearTimeout(g.timer);
  if (g.over || g.moves < 2) return; // clocks start after both sides moved once
  const left = g.clock[g.chess.turn()] - (Date.now() - g.turnStart);
  g.timer = setTimeout(() => endGame(g, g.chess.turn() === 'w' ? 'b' : 'w', 'timeout'), Math.max(0, left) + 20);
}

function endGame(g, winner, reason) { // winner: 'w' | 'b' | null
  if (g.over) return;
  g.over = true;
  clearTimeout(g.timer);
  const wu = db.users[g.wName], bu = db.users[g.bName];
  const result = winner === 'w' ? 1 : winner === 'b' ? 0 : 0.5;
  const elo = applyElo(wu, bu, result, g.cat);
  saveDb();
  const msg = { t: 'over', winner, reason, elo, cat: g.cat, pgn: g.chess.pgn() };
  for (const [ws, name] of [[g.white, g.wName], [g.black, g.bName]]) {
    if (!ws) continue;
    send(ws, { ...msg, me: publicUser(db.users[name]) });
    if (ws.game === g) ws.game = null;
  }
  games.delete(g.id);
  for (const c of clients) send(c, { t: 'leaderboard', rows: leaderboard() });
}

function handleMove(ws, m) {
  const g = ws.game;
  if (!g || g.over) return;
  const color = g.white === ws ? 'w' : 'b';
  if (g.chess.turn() !== color) return send(ws, { t: 'illegal' });
  const now = Date.now();
  if (g.moves >= 2) {
    g.clock[color] -= now - g.turnStart;
    if (g.clock[color] <= 0) return endGame(g, color === 'w' ? 'b' : 'w', 'timeout');
  }
  let res;
  try { res = g.chess.move({ from: m.from, to: m.to, promotion: m.promotion }); } catch { res = null; }
  if (!res) return send(ws, { t: 'illegal' });
  g.moves++;
  if (g.moves > 2) g.clock[color] += g.inc;
  g.turnStart = now;
  g.drawOffer = null;
  const out = { t: 'move', from: res.from, to: res.to, promotion: res.promotion, san: res.san, fen: g.chess.fen(), clock: clocksNow(g) };
  send(g.white, out); send(g.black, out);
  if (g.chess.isCheckmate()) return endGame(g, color, 'checkmate');
  if (g.chess.isStalemate()) return endGame(g, null, 'stalemate');
  if (g.chess.isThreefoldRepetition()) return endGame(g, null, 'repetition');
  if (g.chess.isInsufficientMaterial()) return endGame(g, null, 'insufficient');
  if (g.chess.isDraw()) return endGame(g, null, 'fifty-move');
  armTimer(g);
}

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.user = null; ws.game = null;
  send(ws, { t: 'leaderboard', rows: leaderboard() });
  ws.on('message', (raw) => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    switch (m.t) {
      case 'register': {
        const name = String(m.username || '').trim();
        const pw = String(m.password || '');
        if (!/^[A-Za-z0-9_]{3,16}$/.test(name)) return send(ws, { t: 'authError', msg: 'Nick: 3–16 znaków (litery, cyfry, _)' });
        if (pw.length < 4) return send(ws, { t: 'authError', msg: 'Hasło min. 4 znaki' });
        if (db.users[name.toLowerCase()]) return send(ws, { t: 'authError', msg: 'Nick zajęty' });
        const email = String(m.email || '').trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return send(ws, { t: 'authError', msg: 'Podaj poprawny e-mail (potrzebny do odzyskania hasła)' });
        if (Object.values(db.users).some((u) => u.email === email)) return send(ws, { t: 'authError', msg: 'Ten e-mail jest już użyty' });
        const salt = crypto.randomBytes(16).toString('hex');
        db.users[name.toLowerCase()] = { name, email, salt, hash: hashPw(pw, salt), ratings: newRatings(), cg: newCg(), games: 0, wins: 0, losses: 0, draws: 0, settings: null, friends: [], created: Date.now() };
        saveDb();
        saveAccountBackup(name, pw, email);
        return login(ws, name.toLowerCase());
      }
      case 'login': {
        const u = db.users[String(m.username || '').trim().toLowerCase()];
        if (!u || hashPw(String(m.password || ''), u.salt) !== u.hash) return send(ws, { t: 'authError', msg: 'Zły nick lub hasło' });
        saveAccountBackup(u.name, String(m.password || ''), u.email);
        return login(ws, u.name.toLowerCase());
      }
      case 'forgot': {
        const email = String(m.email || '').trim().toLowerCase();
        const u = Object.values(db.users).find((x) => x.email === email);
        if (u) {
          const tok = crypto.randomBytes(24).toString('hex');
          resetTokens.set(tok, { key: u.name.toLowerCase(), exp: Date.now() + 3600000 });
          sendMail(email, 'Reset hasła Szachy.local', `Link do ustawienia nowego hasła (ważny 1 godzinę):\nhttp://localhost:${PORT}/?reset=${tok}`);
        }
        // same answer whether or not the e-mail exists
        return send(ws, { t: 'forgotSent' });
      }
      case 'reset': {
        const r = resetTokens.get(String(m.token || ''));
        const pw = String(m.password || '');
        if (!r || r.exp < Date.now() || !db.users[r.key]) return send(ws, { t: 'authError', msg: 'Link wygasł lub jest nieprawidłowy' });
        if (pw.length < 4) return send(ws, { t: 'authError', msg: 'Hasło min. 4 znaki' });
        const u = db.users[r.key];
        u.salt = crypto.randomBytes(16).toString('hex');
        u.hash = hashPw(pw, u.salt);
        resetTokens.delete(m.token);
        saveDb();
        saveAccountBackup(u.name, pw, u.email);
        return send(ws, { t: 'resetOk' });
      }
      case 'resume': {
        const key = tokens.get(m.token);
        if (key && db.users[key]) return login(ws, key, m.token);
        return send(ws, { t: 'authError', msg: '' });
      }
      case 'settings':
        if (ws.user) { db.users[ws.user].settings = m.settings; saveDb(); }
        return;
      case 'changePassword': {
        if (!ws.user) return send(ws, { t: 'pwResult', ok: false, msg: 'Zaloguj się, żeby zmienić hasło.' });
        const u = db.users[ws.user];
        const oldPw = String(m.oldPassword || ''), newPw = String(m.newPassword || '');
        if (hashPw(oldPw, u.salt) !== u.hash) return send(ws, { t: 'pwResult', ok: false, msg: 'Obecne hasło jest nieprawidłowe.' });
        if (newPw.length < 4) return send(ws, { t: 'pwResult', ok: false, msg: 'Nowe hasło musi mieć min. 4 znaki.' });
        u.salt = crypto.randomBytes(16).toString('hex');
        u.hash = hashPw(newPw, u.salt);
        saveDb();
        saveAccountBackup(u.name, newPw, u.email);
        return send(ws, { t: 'pwResult', ok: true, msg: 'Hasło zostało zmienione.' });
      }
      case 'saveProfile': {
        if (!ws.user) return;
        const u = db.users[ws.user];
        const p = m.profile || {};
        u.profile = {
          bio: String(p.bio || '').slice(0, 200),
          country: String(p.country || '').slice(0, 40),
          color: /^#[0-9a-fA-F]{6}$/.test(String(p.color || '')) ? p.color : '',
          avatar: /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+\/=]+$/.test(String(p.avatar || '')) && String(p.avatar).length < 80000 ? p.avatar : '',
        };
        saveDb();
        return send(ws, { t: 'profileSaved', profile: u.profile });
      }
      case 'queue': {
        if (!ws.user || ws.game) return;
        leaveQueue(ws);
        const u = db.users[ws.user];
        const time = Math.min(60, Math.max(1, +m.time || 10)), inc = Math.min(30, Math.max(0, +m.inc || 0));
        queue.push({ ws, name: ws.user, elo: u.ratings[catOf(time, inc)], time, inc, since: Date.now() });
        send(ws, { t: 'queued' });
        broadcastOnline(); tryMatch();
        return;
      }
      case 'search': {
        const q = String(m.q || '').trim().toLowerCase().slice(0, 16);
        const rows = q ? Object.values(db.users).filter((u) => u.name.toLowerCase().includes(q)).slice(0, 20)
          .map((u) => ({ name: u.name, rating: Math.round(u.ratings.blitz), games: u.games, online: isOnline(u.name.toLowerCase()) })) : [];
        return send(ws, { t: 'searchResult', rows });
      }
      case 'profile': {
        const u = db.users[String(m.name || '').toLowerCase()];
        if (!u) return send(ws, { t: 'profile', missing: true });
        const me = ws.user ? db.users[ws.user] : null;
        return send(ws, {
          t: 'profile', name: u.name, ratings: Object.fromEntries(CATS.map((c) => [c, Math.round(u.ratings[c])])),
          cg: u.cg, games: u.games, wins: u.wins, losses: u.losses, draws: u.draws, created: u.created, profile: u.profile || {},
          online: isOnline(u.name.toLowerCase()), isFriend: !!(me && me.friends.includes(u.name.toLowerCase())), pending: !!(me && (u.requests || []).includes(ws.user)),
        });
      }
      case 'friend': {
        if (!ws.user) return;
        const key = String(m.name || '').toLowerCase();
        const me = db.users[ws.user];
        if (!db.users[key] || key === ws.user) return;
        const them = db.users[key];
        if (!me.requests) me.requests = [];
        if (!them.requests) them.requests = [];
        if (m.on) {
          if (me.friends.includes(key)) return;
          if (me.requests.includes(key)) { // they already asked me: accept
            me.requests = me.requests.filter((r) => r !== key);
            me.friends.push(key); if (!them.friends.includes(ws.user)) them.friends.push(ws.user);
          } else if (!them.requests.includes(ws.user)) {
            them.requests.push(ws.user);
            pushFriendState(key);
          }
        } else {
          me.friends = me.friends.filter((f) => f !== key);
          them.friends = (them.friends || []).filter((f) => f !== ws.user);
          them.requests = them.requests.filter((r) => r !== ws.user); // cancel my pending request
          pushFriendState(key);
        }
        saveDb();
        pushFriendState(ws.user);
        return send(ws, { t: 'friendPending', name: them.name, pending: them.requests.includes(ws.user), isFriend: me.friends.includes(key) });
      }
      case 'friendReply': { // accept / decline an incoming request
        if (!ws.user) return;
        const key = String(m.name || '').toLowerCase();
        const me = db.users[ws.user], them = db.users[key];
        if (!them || !me.requests || !me.requests.includes(key)) return;
        me.requests = me.requests.filter((r) => r !== key);
        if (m.accept) {
          if (!me.friends.includes(key)) me.friends.push(key);
          if (!them.friends.includes(ws.user)) them.friends.push(ws.user);
          pushFriendState(key);
        }
        saveDb();
        return pushFriendState(ws.user);
      }
      case 'friends': {
        if (!ws.user) return;
        return pushFriendState(ws.user);
      }
      case 'challenge': { // duel: challenge an online friend/player to a game with chosen time control
        if (!ws.user || ws.game) return;
        const key = String(m.name || '').toLowerCase();
        if (key === ws.user || !db.users[key]) return;
        const target = [...clients].find((c) => c.user === key);
        if (!target) return send(ws, { t: 'challengeInfo', msg: 'Gracz jest offline.' });
        if (target.game) return send(ws, { t: 'challengeInfo', msg: 'Gracz jest w trakcie partii.' });
        const time = Math.min(60, Math.max(1, +m.time || 10)), inc = Math.min(30, Math.max(0, +m.inc || 0));
        for (const [id, c] of challenges) if (c.from === ws) challenges.delete(id); // one open challenge per player
        const id = cid++;
        challenges.set(id, { id, from: ws, fromName: ws.user, to: target, time, inc, at: Date.now() });
        send(target, { t: 'challenge', id, from: db.users[ws.user].name, rating: Math.round(db.users[ws.user].ratings[catOf(time, inc)]), time, inc });
        return send(ws, { t: 'challengeInfo', msg: `Wysłano wyzwanie do ${db.users[key].name}. Czekam na odpowiedź…`, id });
      }
      case 'challengeReply': {
        const c = challenges.get(+m.id);
        if (!c || c.to !== ws) return;
        challenges.delete(c.id);
        if (!m.accept) return send(c.from, { t: 'challengeInfo', msg: `${db.users[ws.user].name} odrzucił wyzwanie.` });
        if (c.from.game || ws.game || !clients.has(c.from)) return send(ws, { t: 'challengeInfo', msg: 'Wyzwanie wygasło.' });
        leaveQueue(c.from); leaveQueue(ws);
        return startGame({ ws: c.from, name: c.fromName, time: c.time, inc: c.inc }, { ws, name: ws.user, time: c.time, inc: c.inc });
      }
      case 'challengeCancel': {
        for (const [id, c] of challenges) if (c.from === ws) { challenges.delete(id); send(c.to, { t: 'challengeGone', id }); }
        return;
      }
      case 'global': {
        if (!ws.user) return;
        const text = String(m.text || '').trim().slice(0, 200);
        if (!text) return;
        const now = Date.now();
        if (ws.lastGlobal && now - ws.lastGlobal < 800) return; // anti-spam
        ws.lastGlobal = now;
        const msg = { t: 'global', from: db.users[ws.user].name, text, at: now };
        globalLog.push(msg); if (globalLog.length > 50) globalLog.shift();
        for (const c of clients) if (c.user) send(c, msg);
        return;
      }
      case 'globalHistory': return send(ws, { t: 'globalHistory', rows: globalLog });
      case 'cancel': leaveQueue(ws); send(ws, { t: 'unqueued' }); broadcastOnline(); return;
      case 'botResult': {
        if (!ws.user || !CATS.includes(m.cat)) return;
        const score = m.res === 'w' ? 1 : m.res === 'd' ? 0.5 : m.res === 'l' ? 0 : null;
        if (score === null) return;
        const now = Date.now();
        if (ws.lastBotResult && now - ws.lastBotResult < 3000) return;
        ws.lastBotResult = now;
        const u = db.users[ws.user];
        if (!u) return;
        const botElo = Math.max(100, Math.min(3200, Math.round(Number(m.botElo) || 800)));
        const old = u.ratings[m.cat];
        const ea = 1 / (1 + 10 ** ((botElo - old) / 400));
        const d = kFactor(u, m.cat) * (score - ea);
        const before = Math.round(old);
        u.ratings[m.cat] = Math.max(START_ELO, old + d);
        u.games++; u.cg[m.cat]++;
        if (score === 1) u.wins++; else if (score === 0) u.losses++; else u.draws++;
        saveDb();
        const after = Math.round(u.ratings[m.cat]);
        send(ws, { t: 'botElo', user: publicUser(u), cat: m.cat, before, after });
        for (const c of clients) send(c, { t: 'leaderboard', rows: leaderboard() });
        return;
      }
      case 'move': return handleMove(ws, m);
      case 'resign': {
        const g = ws.game; if (!g) return;
        return endGame(g, g.white === ws ? 'b' : 'w', 'resign');
      }
      case 'draw': {
        const g = ws.game; if (!g || g.over) return;
        const color = g.white === ws ? 'w' : 'b';
        if (g.drawOffer && g.drawOffer !== color) return endGame(g, null, 'agreement');
        g.drawOffer = color;
        send(color === 'w' ? g.black : g.white, { t: 'drawOffer' });
        return;
      }
      case 'chat': {
        const g = ws.game; if (!g) return;
        const out = { t: 'chat', from: ws.user, text: String(m.text || '').slice(0, 200) };
        send(g.white, out); send(g.black, out);
      }
    }
  });
  ws.on('close', () => {
    clients.delete(ws);
    leaveQueue(ws);
    for (const [id, c] of challenges) {
      if (c.from === ws) { challenges.delete(id); send(c.to, { t: 'challengeGone', id }); }
      else if (c.to === ws) { challenges.delete(id); send(c.from, { t: 'challengeInfo', msg: 'Gracz się rozłączył.' }); }
    }
    const g = ws.game;
    if (g && !g.over) { // disconnect = resignation after short grace
      const color = g.white === ws ? 'w' : 'b';
      if (color === 'w') g.white = null; else g.black = null;
      setTimeout(() => { if (!g.over && !(color === 'w' ? g.white : g.black)) endGame(g, color === 'w' ? 'b' : 'w', 'disconnect'); }, 15000);
    }
    broadcastOnline();
  });
});

function login(ws, key, token) {
  const u = db.users[key];
  ws.user = key;
  if (!token) token = issueToken(key);
  // reattach to a running game after reconnect
  for (const g of games.values()) {
    if (g.over) continue;
    if (g.wName.toLowerCase() === key && !g.white) { g.white = ws; ws.game = g; }
    if (g.bName.toLowerCase() === key && !g.black) { g.black = ws; ws.game = g; }
    if (ws.game === g) {
      send(ws, { t: 'auth', user: publicUser(u), token });
      return send(ws, {
        t: 'start', id: g.id, cat: g.cat, color: g.white === ws ? 'w' : 'b', time: 0, inc: g.inc / 1000, fen: g.chess.fen(),
        white: publicUser(db.users[g.wName.toLowerCase()]), black: publicUser(db.users[g.bName.toLowerCase()]),
        pgn: g.chess.pgn(), clock: clocksNow(g), resumed: true,
      });
    }
  }
  send(ws, { t: 'auth', user: publicUser(u), token });
  broadcastOnline();
}

server.listen(PORT, process.env.HOST || '127.0.0.1', () => console.log(`Szachy: http://localhost:${PORT}`));
