/* ============================================================
   Sound Safari - app logic
   ============================================================ */

/* ---- CONFIG you can edit ---- */
const WHATSAPP_NUMBER = "27836553095"; // your number in international format (0836553095 -> 27836553095)
const WHATSAPP_MESSAGE = "Hi! I'd like to unlock the Full Safari (once-off R200) on Sound Safari. How do I pay?";
const CONTACT_HINT = "WhatsApp us on 083 655 3095 to sort out payment and get your code.";

/* Device-bound backend (Google Apps Script web-app URL). See SETUP-BACKEND.txt.
   Leave "" to run in simple/honesty mode using the local list in codes.js. */
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbzEjC8cmk8eQrzsVgrlK8_YBJGx7ObNQouf9kykUhbeJHtZvlAenJcFcd4W5DAhtUL2Yg/exec";

/* Your personal master code. Always unlocks, on ANY device, and is never
   device-bound by the backend. For demos and your own phones. */
const MASTER_CODE = "DANI-MASTER";
const isMasterCode = c => (c || "").trim().toUpperCase() === MASTER_CODE;

/* ---- tiny helpers ---- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const shuffle = a => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = (i * 7 + 3) % (i + 1); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const pick = (arr, i) => arr[i % arr.length];

/* ---- grammar: keep carrier phrases/sentences correct ----
   indefinite article: "a" / "an", or "some" for mass & plural nouns.
   demonstrative: "this" / "these". */
function wordKind(w) {
  if (typeof PLURAL !== "undefined" && PLURAL.has(w)) return "plural";
  if (typeof UNCOUNTABLE !== "undefined" && UNCOUNTABLE.has(w)) return "uncountable";
  return "singular";
}
function demonstrative(w) { return wordKind(w) === "plural" ? "these" : "this"; }
/* Fill a carrier template. `shown` lets the on-screen version blank the
   target word while the spoken version uses the real word. */
function fillCarrier(tpl, w, shown) {
  const noun = shown === undefined ? w : shown;
  let out = tpl;
  if (out.includes("{a}")) {
    let art;
    if (wordKind(w) !== "singular") {
      art = "some";                 // mass & plural nouns: "some milk", "some glasses"
    } else {
      // a/an agrees with the word right after the article (could be an adjective)
      const next = out.split("{a}")[1].trim().split(/\s+/)[0];
      const head = next === "___" ? w : next;
      art = /^[aeiou]/i.test(head) ? "an" : "a";
    }
    out = out.replace("{a}", art);
  }
  return out.replace("{this}", demonstrative(w)).replace("___", noun);
}

/* ---- voice: prefer a British (en-GB) voice ----
   Voices load asynchronously (Safari fires `voiceschanged` late), so we
   cache the best match and refresh it when the list arrives. */
let GB_VOICE = null;
function refreshVoice() {
  if (!("speechSynthesis" in window)) return null;
  const vs = speechSynthesis.getVoices();
  if (!vs.length) return GB_VOICE;
  const isGB = v => /en[-_]?GB/i.test(v.lang) || /\bUK\b|British|Daniel|Kate|Serena|Arthur|Oliver/i.test(v.name);
  GB_VOICE =
    vs.find(v => isGB(v) && /^en/i.test(v.lang)) ||
    vs.find(v => /^en/i.test(v.lang)) ||
    vs[0];
  return GB_VOICE;
}
function britishVoice() { return GB_VOICE || refreshVoice(); }
if ("speechSynthesis" in window) {
  refreshVoice();
  speechSynthesis.onvoiceschanged = refreshVoice;
}

/* ============================================================
   DEVICE ID  (stable per browser/device, used for device-binding)
   ============================================================ */
function deviceId() {
  let id = localStorage.getItem("ss_device");
  if (!id) {
    id = (crypto && crypto.randomUUID) ? crypto.randomUUID()
      : "dev-" + Array.from({ length: 16 }, (_, i) => ((i * 2654435761) % 36).toString(36)).join("") + "-" + (localStorage.length + 1);
    localStorage.setItem("ss_device", id);
  }
  return id;
}

/* ============================================================
   UNLOCK STATE  (lifetime once-off)
   ============================================================ */
const Store = {
  isUnlocked() { return localStorage.getItem("ss_unlocked") === "1"; },
  code() { return localStorage.getItem("ss_code") || ""; },
  setUnlocked(code) {
    localStorage.setItem("ss_unlocked", "1");
    if (code) localStorage.setItem("ss_code", code);
  },
  lock() { localStorage.removeItem("ss_unlocked"); },
};

function refreshLockBadge() {
  const el = $("#lockState");
  if (Store.isUnlocked()) {
    el.className = "lock-state unlocked";
    el.textContent = "🔓 Full Safari unlocked";
  } else {
    el.className = "lock-state locked";
    el.textContent = "🔒 Free version";
  }
}

/* ============================================================
   CODE REDEMPTION  (backend if configured, else local list)
   Returns { ok:boolean, reason?:string }
   ============================================================ */
async function redeemCode(code) {
  // master code: always valid on any device, never hits the backend
  if (isMasterCode(code)) return { ok: true };
  if (BACKEND_URL) {
    try {
      const url = `${BACKEND_URL}?action=redeem&code=${encodeURIComponent(code)}&device=${encodeURIComponent(deviceId())}`;
      const res = await fetch(url);
      const data = await res.json();
      return data; // { ok, reason }
    } catch (e) {
      return { ok: false, reason: "Couldn't reach the server. Check your internet and try again." };
    }
  }
  // simple/honesty mode: local list
  const valid = VALID_CODES.map(c => c.toUpperCase()).includes(code.toUpperCase());
  return valid ? { ok: true } : { ok: false, reason: "wrong-code" };
}

/* Re-checks an already-unlocked device against the backend on load.
   Only LOCKS on an explicit "no" — never on a network error (offline grace). */
async function verifyOnLoad() {
  if (!BACKEND_URL || !Store.isUnlocked() || !Store.code()) return;
  if (isMasterCode(Store.code())) return; // master code is never re-checked or locked
  try {
    const url = `${BACKEND_URL}?action=check&code=${encodeURIComponent(Store.code())}&device=${encodeURIComponent(deviceId())}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.ok === false) {
      Store.lock();
      refreshLockBadge(); buildSetup(); buildResources();
    }
  } catch (e) { /* offline: keep current unlock */ }
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function go(screen) {
  $$(".screen").forEach(s => s.classList.remove("active"));
  $(`#screen-${screen}`).classList.add("active");
  $$(".nav nav button").forEach(b => b.classList.toggle("active", b.dataset.go === screen));
  $("#nav").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (screen === "game") buildSetup();
}
$$("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));

/* ============================================================
   SETUP SCREEN
   ============================================================ */
const sel = { sound: "s", position: "initial", level: "word", goal: 10 };

function locked(premium) { return premium && !Store.isUnlocked(); }

function buildSetup() {
  // sounds
  const sc = $("#soundChips"); sc.innerHTML = "";
  Object.entries(SOUNDS).forEach(([key, s]) => {
    const isLocked = locked(!s.free);
    const c = document.createElement("button");
    c.className = "chip" + (sel.sound === key ? " on" : "") + (isLocked ? " locked" : "");
    c.innerHTML = s.label + (isLocked ? '<span class="mini-lock">🔒</span>' : (s.free ? '<span class="mini-lock">free</span>' : ""));
    c.onclick = () => {
      if (isLocked) return nudgeToPricing("That sound is part of the Full Safari.");
      sel.sound = key; buildSetup();
    };
    sc.appendChild(c);
  });

  // positions  (available positions depend on the chosen sound)
  const pc = $("#posChips"); pc.innerHTML = "";
  POSITIONS.forEach(p => {
    const exists = !!SOUNDS[sel.sound].words[p.id];
    if (!exists) return;
    const c = document.createElement("button");
    c.className = "chip" + (sel.position === p.id ? " on" : "");
    c.textContent = p.label;
    c.onclick = () => { sel.position = p.id; buildSetup(); };
    pc.appendChild(c);
  });
  if (!SOUNDS[sel.sound].words[sel.position]) sel.position = "initial";

  // levels
  const lc = $("#levelChips"); lc.innerHTML = "";
  LEVELS.forEach(l => {
    const isLocked = locked(l.premium);
    const c = document.createElement("button");
    c.className = "chip" + (sel.level === l.id ? " on" : "") + (isLocked ? " locked" : "");
    c.innerHTML = l.label + (isLocked ? '<span class="mini-lock">🔒</span>' : "");
    c.onclick = () => {
      if (isLocked) return nudgeToPricing("Phrase and sentence levels are part of the Full Safari.");
      sel.level = l.id; buildSetup();
    };
    lc.appendChild(c);
  });

  $("#goalVal").textContent = sel.goal;
}

function nudgeToPricing(msg) {
  go("pricing");
  const m = $("#unlockMsg");
  m.className = "unlock-msg bad";
  m.textContent = "🔒 " + msg + " Unlock with a once-off R200 below.";
}

$("#goalMinus").onclick = () => { sel.goal = Math.max(5, sel.goal - 5); $("#goalVal").textContent = sel.goal; };
$("#goalPlus").onclick = () => { sel.goal = Math.min(50, sel.goal + 5); $("#goalVal").textContent = sel.goal; };

/* ============================================================
   GAME ENGINE
   ============================================================ */
const Game = {
  queue: [], idx: 0, hits: 0, attempts: 0, goal: 10, sound: null,
  recURL: null, mediaRec: null, chunks: [],

  start() {
    const sound = SOUNDS[sel.sound];
    const bank = sound.words[sel.position] || [];
    if (!bank.length) return;

    // build the round: shuffle and repeat the bank to fill the goal
    const shuffled = shuffle(bank);
    this.queue = Array.from({ length: sel.goal }, (_, i) => pick(shuffled, i));
    this.idx = 0; this.hits = 0; this.attempts = 0; this.goal = sel.goal; this.sound = sound;

    $("#setup").style.display = "none";
    $("#board").style.display = "block";
    $("#shelf").innerHTML = "";
    $("#tip").textContent = "👄 " + sound.tip;
    this.render();
  },

  current() { return this.queue[this.idx]; },

  decorate(word) {
    // returns {emoji, carrier, displayHTML, speakText}
    const hl = w => w; // (kept simple; word shown plain with highlighted sound below)
    if (sel.level === "word") {
      return { emoji: word.e, carrier: "", text: word.w, speak: word.w };
    }
    const tpl = pick(CARRIERS[sel.level], this.idx);
    return {
      emoji: word.e,
      carrier: fillCarrier(tpl, word.w, "____"),
      text: word.w,
      speak: fillCarrier(tpl, word.w),
    };
  },

  render() {
    const w = this.current();
    const d = this.decorate(w);
    $("#wordEmoji").textContent = d.emoji;
    $("#wordText").textContent = d.text;
    const carrierEl = $("#wordCarrier");
    if (d.carrier) { carrierEl.style.display = "block"; carrierEl.textContent = d.carrier; }
    else carrierEl.style.display = "none";

    $("#trialCount").textContent = `${this.idx} / ${this.goal}`;
    $("#progFill").style.width = (this.idx / this.goal * 100) + "%";

    // scene changes as the explorer travels
    const sceneIdx = Math.min(SCENES.length - 1, Math.floor(this.idx / this.goal * SCENES.length));
    const scene = SCENES[sceneIdx];
    $("#sceneLabel").textContent = `${scene.emoji} ${scene.name}`;
    $("#board").style.setProperty("--scene-sky", scene.sky);

    // reset playback for the new word
    this.resetRecording();
  },

  speak() {
    if (!("speechSynthesis" in window)) return;
    const d = this.decorate(this.current());
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(d.speak);
    const v = britishVoice();
    if (v) u.voice = v;
    u.lang = (v && v.lang) || "en-GB";
    u.rate = 0.85; u.pitch = 1.05;
    speechSynthesis.speak(u);
  },

  /* ---- recording ---- */
  async toggleRecord(btn) {
    if (this.mediaRec && this.mediaRec.state === "recording") {
      this.mediaRec.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.chunks = [];
      // Safari can't record webm - it uses mp4/aac. Pick a supported type
      // instead of forcing webm, or the recording won't play back.
      const supports = t => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t);
      const mime = ["audio/webm", "audio/mp4", "audio/aac"].find(supports) || "";
      this.mediaRec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      this.mediaRec.ondataavailable = e => { if (e.data && e.data.size) this.chunks.push(e.data); };
      this.mediaRec.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mediaRec.mimeType || mime || "audio/mp4" });
        this.recURL = URL.createObjectURL(blob);
        $("#playBtn").disabled = false;
        btn.classList.remove("recording");
        btn.querySelector("span.g").textContent = "🎤";
        stream.getTracks().forEach(t => t.stop());
      };
      this.mediaRec.start();
      btn.classList.add("recording");
      btn.querySelector("span.g").textContent = "⏹";
      // safety auto-stop after 5s
      setTimeout(() => { if (this.mediaRec && this.mediaRec.state === "recording") this.mediaRec.stop(); }, 5000);
    } catch (e) {
      alert("To record, allow microphone access. You can still play without recording.");
    }
  },

  playBack() {
    if (!this.recURL) return;
    const a = new Audio(this.recURL);
    const p = a.play();
    if (p && p.catch) p.catch(() => alert("Couldn't play that recording. Try recording again."));
  },

  resetRecording() {
    this.recURL = null;
    $("#playBtn").disabled = true;
    const rb = $("#recBtn");
    rb.classList.remove("recording");
    rb.querySelector("span.g").textContent = "🎤";
  },

  /* ---- judging ---- */
  judge(result) {
    this.attempts++;
    if (result === "hit") {
      this.hits++;
      addSticker(this.current().e);
      confettiBurst(6);
    }
    this.idx++;
    if (this.idx >= this.goal) return this.finish();
    this.render();
  },

  finish() {
    const acc = this.attempts ? Math.round(this.hits / this.attempts * 100) : 0;
    $("#statTotal").textContent = this.attempts;
    $("#statHit").textContent = this.hits;
    $("#statAcc").textContent = acc + "%";
    const soundLabel = this.sound.label;
    $("#modalSub").textContent = `${this.attempts} productions of the ${soundLabel.replace(" sound","")} sound today.`;

    // data summary line is a premium perk
    const note = $("#dataNote");
    if (Store.isUnlocked()) {
      const posLabel = (POSITIONS.find(p => p.id === sel.position) || {}).label || "";
      note.textContent = `For your notes: ${soundLabel}, ${posLabel.toLowerCase()}, ${sel.level} level — ${this.hits}/${this.attempts} correct (${acc}%).`;
    } else {
      note.textContent = "🔒 Unlock the Full Safari for session data summaries you can copy into your notes.";
    }
    confettiBurst(40);
    $("#modalBack").classList.add("show");
  },
};

/* board controls */
$("#startBtn").onclick = () => Game.start();
$("#hearBtn").onclick = () => Game.speak();
$("#recBtn").onclick = e => Game.toggleRecord(e.currentTarget);
$("#playBtn").onclick = () => Game.playBack();
$("#judgeYes").onclick = () => Game.judge("hit");
$("#judgeAlmost").onclick = () => Game.judge("almost");
$("#judgeHelp").onclick = () => Game.judge("skip");

$("#againBtn").onclick = () => { $("#modalBack").classList.remove("show"); $("#board").style.display = "none"; $("#setup").style.display = "block"; buildSetup(); };
$("#closeModal").onclick = () => { $("#modalBack").classList.remove("show"); $("#board").style.display = "none"; $("#setup").style.display = "block"; buildSetup(); };

/* stickers + confetti */
function addSticker(emoji) {
  const s = document.createElement("span");
  s.className = "s"; s.textContent = emoji;
  $("#shelf").appendChild(s);
}
function confettiBurst(n) {
  const bits = ["🦁","🦒","🐘","🦓","⭐","🌟","🎉","🍃"];
  for (let i = 0; i < n; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.textContent = pick(bits, i + n);
    c.style.left = (5 + (i * 89) % 90) + "vw";
    c.style.animationDelay = (i % 8 * 0.08) + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2800);
  }
}

/* ============================================================
   RESOURCES
   ============================================================ */
const RESOURCES = [
  { key: "hierarchy", ico: "📄", title: "Articulation hierarchy cheat-sheet", desc: "The 6 therapy levels from isolated sound to conversation, with worked examples and the 80% rule. One-page reference.", premium: false },
  { key: "cuecards",  ico: "🃏", title: "Mouth-placement cue cards", desc: "Cut-out cards for all 9 sounds: how to place the mouth, plus picture-word examples. Great for desk or fridge.", premium: false },
  { key: "homework",  ico: "🏠", title: "Home practice pack (all 9 sounds)", desc: "A send-home worksheet per sound: target pictures, parent instructions and a weekly practice log to tick off.", premium: true },
  { key: "tracker",   ico: "📊", title: "Session data tracker", desc: "Printable data sheet to log trials, correct productions and accuracy across sessions, ready for your notes.", premium: true },
  { key: "wordbank",  ico: "🎯", title: "Word lists by sound & position", desc: "The full target word bank laid out by sound and word position, with pictures, for offline therapy.", premium: true },
  { key: "rewards",   ico: "🏆", title: "Reward chart & certificate", desc: "A safari sticker chart to colour in and a printable 'Sound Champion' certificate to award.", premium: true },
];

function buildResources() {
  const list = $("#resList"); list.innerHTML = "";
  RESOURCES.forEach(r => {
    const isLocked = r.premium && !Store.isUnlocked();
    const row = document.createElement("div");
    row.className = "res-item";
    row.innerHTML = `
      <div class="ri">${r.ico}</div>
      <div class="meta"><b>${r.title}</b><p>${r.desc}</p></div>
      ${isLocked
        ? '<button class="btn secondary">🔒 Premium</button>'
        : '<button class="btn">⬇ Open</button>'}`;
    row.querySelector("button").onclick = () => {
      if (isLocked) return nudgeToPricing("That resource is part of the Full Safari.");
      openResource(r);
    };
    list.appendChild(row);
  });
}

/* ---- shared printable shell ---- */
const PRINT_CSS = `
  *{box-sizing:border-box}
  body{font-family:'Baloo 2',system-ui,sans-serif;color:#2b2a28;margin:0 auto;max-width:840px;padding:30px;line-height:1.45}
  .brandbar{display:flex;align-items:center;gap:10px;border-bottom:3px solid #2f8f6b;padding-bottom:10px;margin-bottom:16px}
  .brandbar .lg{font-size:1.7rem} .brandbar b{color:#1f6e51;font-size:1.15rem} .brandbar .r{margin-left:auto;color:#999;font-size:.8rem}
  h1{color:#1f6e51;font-size:1.7rem;margin:0 0 4px} .sub{color:#6f6a62;margin:0 0 16px}
  h2{color:#e8714e;font-size:1.25rem;margin:20px 0 8px}
  table{width:100%;border-collapse:collapse;margin:10px 0}
  th,td{border:1px solid #cdbf9f;padding:8px 10px;text-align:left;font-size:.92rem;vertical-align:top}
  th{background:#f1e7cf;color:#1f6e51}
  td.empty{height:30px}
  .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .cue{border:2px dashed #2f8f6b;border-radius:14px;padding:14px 10px;text-align:center}
  .cue .bigl{font-size:2.2rem;font-weight:800;color:#e8714e;line-height:1}
  .cue .tip{font-size:.8rem;color:#444;margin:8px 0}
  .cue .ex{font-size:1.6rem} .cue .exw{font-size:.78rem;color:#666;margin-top:2px}
  .wordgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:10px 0}
  .wcell{border:1px solid #e0d4b5;border-radius:12px;padding:10px 6px;text-align:center}
  .wcell .e{font-size:2rem;line-height:1.2} .wcell .w{font-weight:700;font-size:.9rem}
  .line{border-bottom:2px solid #999;display:inline-block;min-width:220px}
  .chips{display:flex;flex-wrap:wrap;gap:6px} .chip{background:#eaf5ee;color:#1f6e51;border-radius:8px;padding:4px 9px;font-size:.85rem;font-weight:700}
  .circles{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-top:14px}
  .circle{aspect-ratio:1;border:3px solid #2f8f6b;border-radius:50%;display:grid;place-items:center;font-size:2rem;color:#d9ece2}
  .cert{border:10px double #2f8f6b;border-radius:18px;padding:34px;text-align:center}
  .cert .big{font-size:1.9rem;color:#e8714e;font-weight:800;margin:6px 0}
  .note{background:#fbf3e0;border-left:4px solid #f6b93b;padding:10px 14px;border-radius:8px;color:#5a4a1f;font-size:.9rem;margin:12px 0}
  .page{page-break-after:always}
  .btnp{margin:26px 0;padding:12px 24px;border:none;background:#2f8f6b;color:#fff;border-radius:10px;font:inherit;font-size:1rem;cursor:pointer}
  @media print{.noprint{display:none}body{padding:0;max-width:none}.cards{gap:8px}}
`;

function printDoc(title, inner) {
  const win = window.open("", "_blank");
  win.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8">
    <title>${title} · Sound Safari</title>
    <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap" rel="stylesheet">
    <style>${PRINT_CSS}</style></head><body>
    <div class="brandbar"><span class="lg">🦁</span><b>Sound Safari</b><span class="r">${title}</span></div>
    ${inner}
    <button class="btnp noprint" onclick="window.print()">🖨 Print this sheet</button>
    </body></html>`);
  win.document.close();
}

const exampleWords = s => Object.values(s.words).flat().slice(0, 3);
const firstWords = (s, n) => (s.words.initial || Object.values(s.words)[0]).slice(0, n);

/* ---- individual resource builders ---- */
const RES_BUILD = {
  hierarchy() {
    const rows = [
      ["1", "Isolation", "The sound completely on its own", "sss"],
      ["2", "Syllable", "Sound joined to a vowel", "sa · see · so · soo"],
      ["3", "Word", "Sound at the start, middle or end of words", "sun · bicycle · bus"],
      ["4", "Phrase", "Target word inside a short carrier phrase", "a big sun · my sock"],
      ["5", "Sentence", "Target word used in a full sentence", "I can see the sun."],
      ["6", "Conversation", "Sound kept correct in free, spontaneous talking", "retelling a story"],
    ].map(r => `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("");
    return `<h1>Articulation hierarchy</h1>
      <p class="sub">Work from the top down. The example column uses the /s/ sound.</p>
      <table><tr><th>Step</th><th>Level</th><th>What it means</th><th>Example</th></tr>${rows}</table>
      <div class="note"><b>The 80% rule:</b> move up to the next level once the child is around 80% accurate at the current one. If they drop below ~60%, step back down for a bit.</div>`;
  },

  cuecards() {
    const cards = Object.entries(SOUNDS).map(([k, s]) => {
      const ex = exampleWords(s);
      return `<div class="cue">
        <div class="bigl">${k.toUpperCase()}</div>
        <div class="tip">${s.tip}</div>
        <div class="ex">${ex.map(w => w.e).join(" ")}</div>
        <div class="exw">${ex.map(w => w.w).join(" · ")}</div>
      </div>`;
    }).join("");
    return `<h1>Mouth-placement cue cards</h1>
      <p class="sub">Cut along the dashed lines. Keep a card on the desk or fridge for the sound you're working on.</p>
      <div class="cards">${cards}</div>`;
  },

  homework() {
    return Object.entries(SOUNDS).map(([k, s], i, arr) => {
      const words = firstWords(s, 8);
      const grid = words.map(w => `<div class="wcell"><div class="e">${w.e}</div><div class="w">${w.w}</div></div>`).join("");
      const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
      const log = `<table><tr><th>Practised today?</th>${days.map(d => `<th>${d}</th>`).join("")}</tr>
        <tr><td>Colour a star ⭐</td>${days.map(() => "<td class='empty'></td>").join("")}</tr></table>`;
      const last = i === arr.length - 1;
      return `<div class="${last ? "" : "page"}">
        <h1>Practising the "${k.toUpperCase()}" sound at home</h1>
        <p class="sub">${s.tip}</p>
        <p>Say each word together <b>5 times</b>, looking at the picture. Keep it playful — turn it into a game or find the real thing around the house. A little every day works best.</p>
        <div class="wordgrid">${grid}</div>
        <h2>This week's practice log</h2>${log}
        <p style="text-align:center;color:#1f6e51;font-weight:700;margin-top:14px">Brilliant practising, little explorer! 🦁</p>
      </div>`;
    }).join("");
  },

  tracker() {
    const head = `<tr><th>Date</th><th>Sound</th><th>Position</th><th>Level</th><th>Trials</th><th>Correct</th><th>%</th><th>Notes</th></tr>`;
    const rows = Array.from({ length: 16 }, () =>
      `<tr>${Array.from({ length: 8 }, () => "<td class='empty'></td>").join("")}</tr>`).join("");
    return `<h1>Session data tracker</h1>
      <p class="sub">Child: <span class="line"></span> &nbsp;&nbsp; Clinician: <span class="line"></span></p>
      <table>${head}${rows}</table>
      <div class="note">Tip: "Trials" is total productions, "Correct" is accurate ones. % = Correct ÷ Trials × 100. Aim to move up a level at ~80%.</div>`;
  },

  wordbank() {
    return "<h1>Target word bank</h1><p class='sub'>By sound and word position. Use it for offline practice or to plan a session.</p>" +
      Object.entries(SOUNDS).map(([k, s]) => {
        const cols = POSITIONS.filter(p => s.words[p.id]);
        const head = cols.map(p => `<th>${p.label}</th>`).join("");
        const maxLen = Math.max(...cols.map(p => s.words[p.id].length));
        let body = "";
        for (let i = 0; i < maxLen; i++) {
          body += "<tr>" + cols.map(p => {
            const w = s.words[p.id][i];
            return `<td>${w ? `${w.e} ${w.w}` : ""}</td>`;
          }).join("") + "</tr>";
        }
        return `<h2>${s.label}</h2><table><tr>${head}</tr>${body}</table>`;
      }).join("");
  },

  rewards() {
    const animals = ["🦁","🦒","🐘","🦓","🦜","🐅","🦛","🦏","🐊","🦩"];
    const circles = animals.map(a => `<div class="circle">${a}</div>`).join("");
    return `<div class="page">
        <h1>My Sound Safari sticker chart</h1>
        <p class="sub">Name: <span class="line" style="min-width:160px"></span> &nbsp; My sound: <span class="line" style="min-width:90px"></span></p>
        <p>Colour in or sticker an animal every time you practise. Fill them all to finish the safari!</p>
        <div class="circles">${circles}</div>
      </div>
      <div class="cert">
        <div style="font-size:1.8rem">🦁 🦒 🐘</div>
        <div class="big">Sound Champion!</div>
        <p>This certificate is proudly awarded to</p>
        <p style="font-size:1.4rem;margin:12px 0"><span class="line" style="min-width:280px"></span></p>
        <p>for fantastic practising of the <span class="line" style="min-width:80px"></span> sound</p>
        <p style="margin-top:20px">Date: <span class="line" style="min-width:130px"></span> &nbsp; Signed: <span class="line" style="min-width:130px"></span></p>
      </div>`;
  },
};

function openResource(r) {
  const build = RES_BUILD[r.key];
  printDoc(r.title, build ? build() : `<h1>${r.title}</h1><p>${r.desc}</p>`);
}

/* ============================================================
   PRICING / UNLOCK
   ============================================================ */
$("#payBtn").href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

$("#unlockBtn").onclick = async () => {
  const code = $("#codeInput").value.trim().toUpperCase();
  const msg = $("#unlockMsg");
  const btn = $("#unlockBtn");
  if (!code) { msg.className = "unlock-msg bad"; msg.textContent = "Type your code first."; return; }

  btn.disabled = true; const label = btn.textContent; btn.textContent = "Checking…";
  msg.className = "unlock-msg"; msg.textContent = "";
  const result = await redeemCode(code);
  btn.disabled = false; btn.textContent = label;

  if (result.ok) {
    Store.setUnlocked(code);
    msg.className = "unlock-msg ok";
    msg.textContent = "✓ Unlocked! The Full Safari is yours on this device. Have fun 🦁";
    refreshLockBadge(); buildSetup(); buildResources();
  } else {
    msg.className = "unlock-msg bad";
    const reasons = {
      "wrong-code": "That code isn't valid.",
      "used-elsewhere": "This code is already in use on another device. Codes work on one device only — message us if you've changed phones.",
      "disabled": "This code has been switched off. Get in touch if that's a mistake.",
    };
    msg.textContent = "✗ " + (reasons[result.reason] || result.reason || "That code didn't work.") + " " + CONTACT_HINT;
  }
};
$("#codeInput").addEventListener("keydown", e => { if (e.key === "Enter") $("#unlockBtn").click(); });

/* ============================================================
   INIT
   ============================================================ */
refreshLockBadge();
buildResources();
buildSetup();
verifyOnLoad();
