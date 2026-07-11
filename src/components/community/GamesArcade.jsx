// GamesArcade — Community FEATURE #5 (deep): real games, not health prompts.
//
// A proper client-side arcade — ZERO new backend, all deterministic/local:
//   • The Daily Word — a Wordle-style 5-letter puzzle (same word for everyone each day),
//     6 guesses, on-screen keyboard, private streak, share your result (no emoji — block chars).
//   • Daily Trivia — 5 rotating fun questions, instant feedback, a warm score.
//   • Tic-tac-toe vs the app — a smart-but-beatable opponent, instant play.
//   • Hangman — guess the word, endless bank.
// Calm safety: no leaderboards / no ranking-shame; private streaks; a missed day breaks nothing.
// Multiplayer (play a real woman) is FLAGGED separately (needs a GameMatch entity + move fn).

import { useMemo, useState, useEffect, useCallback } from "react";
import { ChevronLeft, Share2, RotateCcw, Trophy, Dices, Type, HelpCircle, Puzzle, Grid3x3 } from "lucide-react";
import { T, SERIF, UI, Eyebrow, Script, Hand, useEditorialFonts } from "@/components/journal/Editorial";
import { cwOf } from "@/components/brand/flora";

const HANDFAM = '"Cormorant Garamond","Fraunces",Georgia,serif';
const gold = () => cwOf("gold").petal, sage = () => cwOf("sage").petal, crim = () => cwOf("crimson").petal, plum = () => cwOf("plum").petal;

// deterministic "day index" (same for everyone, changes at local midnight)
function dayIndex() { try { const d = new Date(); return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000); } catch { return 0; } }
const todayKey = () => { try { return new Date().toISOString().slice(0, 10); } catch { return ""; } }
const lsGet = (k, d = null) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

// ── word lists ────────────────────────────────────────────────────────────────
const ANSWERS = "peace bloom heart light dream shine grace field river stone brave quiet spark story cosec water plant sweet fresh green earth ocean cloud storm night dance smile laugh dwell trust bloom charm faith glory honey ivory jolly lemon maple noble olive pearl amber daisy tulip poppy lupin fern lilac roses linen cocoa mocha latte toast berry apple mango peach melon grape lemon herbs basil thyme mints candy fudge cakes scone bread cream sugar spice ember flame frost glean gleam bliss cheer merry happy dizzy fancy giddy witty sassy zesty balmy comfy cosy petal stems roots vines seeds sprig".split(/\s+/).filter((w) => w.length === 5);
const KEYROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

// ── trivia bank (fun, general — NOT health-gated) ───────────────────────────────
const TRIVIA = [
  { q: "Which planet is known as the Red Planet?", o: ["Venus", "Mars", "Jupiter", "Saturn"], a: 1 },
  { q: "How many strings does a standard violin have?", o: ["Four", "Five", "Six", "Seven"], a: 0 },
  { q: "What is the capital of Australia?", o: ["Sydney", "Melbourne", "Canberra", "Perth"], a: 2 },
  { q: "In which country would you find the Colosseum?", o: ["Greece", "Italy", "Spain", "France"], a: 1 },
  { q: "What colour do you get mixing blue and yellow?", o: ["Purple", "Orange", "Green", "Brown"], a: 2 },
  { q: "Who wrote 'Pride and Prejudice'?", o: ["Emily Brontë", "Jane Austen", "Mary Shelley", "George Eliot"], a: 1 },
  { q: "What is the largest ocean on Earth?", o: ["Atlantic", "Indian", "Arctic", "Pacific"], a: 3 },
  { q: "How many days are there in a leap year?", o: ["364", "365", "366", "367"], a: 2 },
  { q: "Which metal is liquid at room temperature?", o: ["Iron", "Mercury", "Copper", "Zinc"], a: 1 },
  { q: "What is the tallest animal in the world?", o: ["Elephant", "Giraffe", "Horse", "Camel"], a: 1 },
  { q: "In 'The Wizard of Oz', what colour is the yellow brick road?", o: ["Red", "Gold", "Yellow", "White"], a: 2 },
  { q: "What is the main ingredient in guacamole?", o: ["Avocado", "Pea", "Courgette", "Broccoli"], a: 0 },
  { q: "Which UK city is home to the Beatles?", o: ["Manchester", "London", "Liverpool", "Leeds"], a: 2 },
  { q: "How many sides does a hexagon have?", o: ["Five", "Six", "Seven", "Eight"], a: 1 },
  { q: "What is the fastest land animal?", o: ["Lion", "Cheetah", "Horse", "Greyhound"], a: 1 },
  { q: "Which fruit is traditionally used to make cider?", o: ["Pear", "Grape", "Apple", "Plum"], a: 2 },
  { q: "What is the national flower of England?", o: ["Tulip", "Rose", "Daffodil", "Lily"], a: 1 },
  { q: "Which sea creature has eight arms?", o: ["Squid", "Octopus", "Starfish", "Jellyfish"], a: 1 },
  { q: "What is frozen water called?", o: ["Steam", "Ice", "Mist", "Frost"], a: 1 },
  { q: "Who painted the Mona Lisa?", o: ["Van Gogh", "Picasso", "Da Vinci", "Monet"], a: 2 },
  { q: "How many colours are in a rainbow?", o: ["Five", "Six", "Seven", "Eight"], a: 2 },
  { q: "Which is the largest planet in our solar system?", o: ["Saturn", "Jupiter", "Neptune", "Earth"], a: 1 },
  { q: "What is a baby kangaroo called?", o: ["Cub", "Kit", "Joey", "Pup"], a: 2 },
  { q: "In cooking, what does 'al dente' describe?", o: ["Overcooked", "Firm to the bite", "Very soft", "Burnt"], a: 1 },
  { q: "Which country gave us the tango?", o: ["Spain", "Brazil", "Argentina", "Mexico"], a: 2 },
];

// ── hangman words ───────────────────────────────────────────────────────────────
const HANG = "garden sunshine kindness laughter compass blossom lantern harmony journey meadow whisper velvet cottage library autumn feather cinnamon melody breeze twilight ceramic vintage cardigan biscuit umbrella marmalade festival memory freedom courage".split(/\s+/);

// ── shared UI bits ──────────────────────────────────────────────────────────────
function GameShell({ title, sub, onBack, children }) {
  return (
    <div>
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 10, padding: "7px 11px", fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.ink, cursor: "pointer", marginBottom: 12 }}><ChevronLeft size={14} /> Games Room</button>
      <Script size={30} color="#7A1A12" style={{ marginBottom: 2 }}>{title}</Script>
      {sub && <Hand size={15} color={T.muted} style={{ marginBottom: 14 }}>{sub}</Hand>}
      {children}
    </div>
  );
}
const bigBtn = (c) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: c, color: "#fff", border: "none", borderRadius: 12, padding: "12px 18px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" });

// ════════════════════════════════════════════════ THE DAILY WORD ═══════════════
function scoreGuess(guess, answer) {
  // returns array of 'c' (correct), 'p' (present), 'a' (absent) — standard Wordle logic
  const res = Array(5).fill("a"); const used = Array(5).fill(false);
  for (let i = 0; i < 5; i++) { if (guess[i] === answer[i]) { res[i] = "c"; used[i] = true; } }
  for (let i = 0; i < 5; i++) {
    if (res[i] === "c") continue;
    for (let j = 0; j < 5; j++) { if (!used[j] && guess[i] === answer[j]) { res[i] = "p"; used[j] = true; break; } }
  }
  return res;
}
function DailyWord({ onBack, onShare }) {
  const answer = useMemo(() => ANSWERS[((dayIndex() % ANSWERS.length) + ANSWERS.length) % ANSWERS.length].toUpperCase(), []);
  const day = todayKey();
  const saved = lsGet("fw_word_" + day, null);
  const [rows, setRows] = useState(() => saved?.rows || []);   // [{guess, marks}]
  const [cur, setCur] = useState("");
  const [done, setDone] = useState(() => !!saved?.done);
  const [won, setWon] = useState(() => !!saved?.won);
  const [msg, setMsg] = useState("");

  const persist = (nextRows, isDone, isWon) => {
    lsSet("fw_word_" + day, { rows: nextRows, done: isDone, won: isWon });
    if (isDone) {
      const lastDay = lsGet("fw_word_lastday", null);
      if (lastDay !== day) {   // update streak once per day
        const prev = lsGet("fw_word_streak", 0);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        lsSet("fw_word_streak", isWon ? (lastDay === yesterday ? prev + 1 : 1) : 0);
        lsSet("fw_word_lastday", day);
      }
    }
  };
  const streak = lsGet("fw_word_streak", 0);

  const submit = () => {
    if (done || cur.length !== 5) { if (cur.length !== 5) { setMsg("Five letters, love."); setTimeout(() => setMsg(""), 1400); } return; }
    const g = cur.toUpperCase();
    const marks = scoreGuess(g, answer);
    const nextRows = [...rows, { guess: g, marks }];
    const isWon = g === answer;
    const isDone = isWon || nextRows.length >= 6;
    setRows(nextRows); setCur("");
    if (isDone) { setDone(true); setWon(isWon); setMsg(isWon ? "Lovely — you got it." : `It was ${answer}. Tomorrow's a fresh one.`); }
    persist(nextRows, isDone, isWon);
  };
  const tapKey = (k) => { if (done) return; if (k === "ENT") return submit(); if (k === "DEL") return setCur((c) => c.slice(0, -1)); if (cur.length < 5 && /^[a-z]$/.test(k)) setCur((c) => c + k); };
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Enter") submit(); else if (e.key === "Backspace") setCur((c) => c.slice(0, -1)); else if (/^[a-zA-Z]$/.test(e.key)) setCur((c) => (c.length < 5 ? c + e.key.toLowerCase() : c)); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });   // eslint-disable-line react-hooks/exhaustive-deps

  // letter state for the keyboard tint
  const kbState = {};
  rows.forEach((r) => r.guess.split("").forEach((ch, i) => { const m = r.marks[i]; const cur2 = kbState[ch]; if (m === "c" || (m === "p" && cur2 !== "c") || (m === "a" && !cur2)) kbState[ch] = m; }));
  const cellCol = (m) => m === "c" ? sage() : m === "p" ? gold() : m === "a" ? T.muted : T.paperDeep;

  const shareText = () => {
    const grid = rows.map((r) => r.marks.map((m) => m === "c" ? "▩" : m === "p" ? "▧" : "□").join("")).join("\n");
    return `FemWell Daily Word · ${won ? rows.length : "X"}/6\n${grid}`;
  };

  return (
    <GameShell title="The Daily Word" sub="Guess the 5-letter word in six tries — a fresh one every day, the same for everyone." onBack={onBack}>
      {streak > 0 && <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: gold(), marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 6 }}><Trophy size={13} /> {streak}-day streak (just for you)</div>}
      <div style={{ display: "grid", gridTemplateRows: "repeat(6, 1fr)", gap: 6, maxWidth: 300, margin: "0 auto 14px" }}>
        {Array.from({ length: 6 }).map((_, ri) => {
          const r = rows[ri]; const isCur = ri === rows.length && !done;
          const letters = r ? r.guess.split("") : (isCur ? cur.padEnd(5, " ").split("") : Array(5).fill(" "));
          return (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {letters.map((ch, ci) => (
                <div key={ci} style={{ aspectRatio: "1", display: "grid", placeItems: "center", borderRadius: 8, border: `2px solid ${r ? cellCol(r.marks[ci]) : (ch !== " " ? T.muted : T.paperDeep)}`, background: r ? cellCol(r.marks[ci]) : "transparent", color: r ? "#fff" : T.ink, fontFamily: UI, fontSize: 22, fontWeight: 800, textTransform: "uppercase" }}>{ch.trim()}</div>
              ))}
            </div>
          );
        })}
      </div>
      {msg && <div style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.oxblood || "#7A1A12", marginBottom: 10 }}>{msg}</div>}
      {done ? (
        <div style={{ display: "flex", gap: 9, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => onShare && onShare(shareText())} style={bigBtn(T.ink)}><Share2 size={15} /> Share your result</button>
          <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, alignSelf: "center" }}>Come back tomorrow for a new word.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          {KEYROWS.map((row, i) => (
            <div key={i} style={{ display: "flex", gap: 4, justifyContent: "center" }}>
              {i === 2 && <button onClick={() => tapKey("ENT")} style={{ ...kbKey, flex: "0 0 46px", fontSize: 11 }}>ENTER</button>}
              {row.split("").map((k) => (
                <button key={k} onClick={() => tapKey(k)} style={{ ...kbKey, background: kbState[k] ? cellCol(kbState[k]) : T.paperHi, color: kbState[k] ? "#fff" : T.ink }}>{k}</button>
              ))}
              {i === 2 && <button onClick={() => tapKey("DEL")} style={{ ...kbKey, flex: "0 0 46px", fontSize: 11 }}>DEL</button>}
            </div>
          ))}
        </div>
      )}
    </GameShell>
  );
}
const kbKey = { flex: "1 1 0", minWidth: 26, maxWidth: 34, height: 46, borderRadius: 7, border: `1px solid ${T.paperDeep}`, background: "#F4EFE3", color: "#0B0805", fontFamily: "ui-sans-serif, system-ui", fontSize: 14, fontWeight: 700, textTransform: "uppercase", cursor: "pointer", display: "grid", placeItems: "center", padding: 0 };

// ════════════════════════════════════════════════ DAILY TRIVIA ═════════════════
function DailyTrivia({ onBack, onShare }) {
  const day = todayKey();
  const qs = useMemo(() => { const start = ((dayIndex() * 5) % TRIVIA.length + TRIVIA.length) % TRIVIA.length; return Array.from({ length: 5 }, (_, i) => TRIVIA[(start + i) % TRIVIA.length]); }, []);
  const saved = lsGet("fw_trivia_" + day, null);
  const [i, setI] = useState(() => saved?.done ? 5 : 0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(() => saved?.score || 0);
  const done = i >= 5;

  const choose = (oi) => {
    if (picked !== null) return;
    setPicked(oi);
    const correct = oi === qs[i].a;
    const ns = score + (correct ? 1 : 0);
    setScore(ns);
    setTimeout(() => {
      const next = i + 1; setPicked(null); setI(next);
      if (next >= 5) lsSet("fw_trivia_" + day, { done: true, score: ns });
    }, 950);
  };

  if (done) {
    return (
      <GameShell title="Daily Trivia" sub="Five fun questions, fresh every day." onBack={onBack}>
        <div style={{ textAlign: "center", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "26px 18px" }}>
          <Puzzle size={30} color={gold()} style={{ marginBottom: 8 }} />
          <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 24, color: T.ink, marginBottom: 4 }}>You scored {score}/5</div>
          <Hand size={15} color={T.muted}>{score >= 4 ? "Sharp today." : score >= 2 ? "Nicely played." : "A tricky set — tomorrow's a fresh five."}</Hand>
          <div style={{ marginTop: 14, display: "flex", gap: 9, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => onShare && onShare(`FemWell Daily Trivia · ${score}/5 today. How would you do?`)} style={bigBtn(T.ink)}><Share2 size={15} /> Share your score</button>
          </div>
        </div>
      </GameShell>
    );
  }
  const q = qs[i];
  return (
    <GameShell title="Daily Trivia" sub={`Question ${i + 1} of 5`} onBack={onBack}>
      <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontWeight: 600, fontSize: 21, color: T.ink, lineHeight: 1.3, marginBottom: 16 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {q.o.map((opt, oi) => {
          const isPick = picked === oi; const isAns = oi === q.a; const show = picked !== null;
          const bg = show && isAns ? `${sage()}22` : show && isPick ? `${crim()}18` : T.paperHi;
          const bd = show && isAns ? sage() : show && isPick ? crim() : T.paperDeep;
          return (
            <button key={oi} onClick={() => choose(oi)} disabled={picked !== null} style={{ textAlign: "left", background: bg, border: `1px solid ${bd}`, borderRadius: 12, padding: "13px 15px", fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, cursor: picked === null ? "pointer" : "default" }}>{opt}</button>
          );
        })}
      </div>
      <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 12 }}>No timer, no pressure — just for fun.</div>
    </GameShell>
  );
}

// ════════════════════════════════════════════════ TIC-TAC-TOE (vs app) ═════════
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
function winner(b) { for (const [a, c, d] of LINES) { if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]; } return b.every(Boolean) ? "draw" : null; }
function bestMove(b) {   // minimax for O
  const score = (bd, depth) => { const w = winner(bd); if (w === "O") return 10 - depth; if (w === "X") return depth - 10; if (w === "draw") return 0; return null; };
  const mm = (bd, turn, depth) => {
    const s = score(bd, depth); if (s !== null) return { s };
    let best = turn === "O" ? { s: -Infinity } : { s: Infinity };
    for (let i = 0; i < 9; i++) if (!bd[i]) { const nb = bd.slice(); nb[i] = turn; const r = mm(nb, turn === "O" ? "X" : "O", depth + 1); if (turn === "O" ? r.s > best.s : r.s < best.s) best = { s: r.s, i }; }
    return best;
  };
  return mm(b, "O", 0).i;
}
function TicTacToe({ onBack }) {
  const [b, setB] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");   // X = you
  const w = winner(b);
  const play = (i) => {
    if (b[i] || w || turn !== "X") return;
    const nb = b.slice(); nb[i] = "X"; setB(nb); setTurn("O");
  };
  useEffect(() => {
    if (turn === "O" && !winner(b)) {
      const t = setTimeout(() => {
        // 80% optimal, 20% random → smart but beatable
        const empties = b.map((v, i) => v ? -1 : i).filter((i) => i >= 0);
        const mv = (Math.random() < 0.8) ? bestMove(b) : empties[Math.floor(Math.random() * empties.length)];
        const nb = b.slice(); nb[mv] = "O"; setB(nb); setTurn("X");
      }, 420);
      return () => clearTimeout(t);
    }
  }, [turn, b]);
  const reset = () => { setB(Array(9).fill(null)); setTurn("X"); };
  return (
    <GameShell title="Tic-tac-toe" sub="You're the crimson discs. Line up three before the app does — it's smart, but beatable." onBack={onBack}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, maxWidth: 260, margin: "0 auto 14px" }}>
        {b.map((v, i) => (
          <button key={i} onClick={() => play(i)} style={{ aspectRatio: "1", borderRadius: 12, border: `1px solid ${T.paperDeep}`, background: T.paperHi, display: "grid", placeItems: "center", cursor: v || w ? "default" : "pointer" }}>
            {v === "X" ? <span style={{ width: 30, height: 30, borderRadius: "50%", background: crim() }} /> : v === "O" ? <span style={{ width: 30, height: 30, borderRadius: "50%", border: `5px solid ${plum()}` }} /> : null}
          </button>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 20, color: T.ink, marginBottom: 10 }}>
          {w === "X" ? "You win — lovely." : w === "O" ? "The app got that one." : w === "draw" ? "A draw — well matched." : turn === "X" ? "Your move" : "Thinking…"}
        </div>
        <button onClick={reset} style={bigBtn(sage())}><RotateCcw size={15} /> New game</button>
      </div>
    </GameShell>
  );
}

// ════════════════════════════════════════════════ HANGMAN ══════════════════════
function Hangman({ onBack }) {
  const [word, setWord] = useState(() => HANG[Math.floor(Math.random() * HANG.length)].toUpperCase());
  const [guessed, setGuessed] = useState([]);
  const wrong = guessed.filter((g) => !word.includes(g));
  const lost = wrong.length >= 6;
  const won = word.split("").every((ch) => guessed.includes(ch));
  const over = lost || won;
  const guess = (l) => { if (over || guessed.includes(l)) return; setGuessed((g) => [...g, l]); };
  const reset = () => { setWord(HANG[Math.floor(Math.random() * HANG.length)].toUpperCase()); setGuessed([]); };
  return (
    <GameShell title="Hangman" sub="Guess the word letter by letter — six wrong tries before the vine wilts." onBack={onBack}>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 7, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
          {word.split("").map((ch, i) => (
            <span key={i} style={{ width: 26, borderBottom: `2px solid ${T.muted}`, fontFamily: UI, fontSize: 22, fontWeight: 800, color: T.ink, textAlign: "center" }}>{(guessed.includes(ch) || lost) ? ch : ""}</span>
          ))}
        </div>
        <div style={{ fontFamily: UI, fontSize: 12, color: wrong.length >= 4 ? crim() : T.muted, marginBottom: 4 }}>{6 - wrong.length} tries left{wrong.length ? ` · missed: ${wrong.join(" ")}` : ""}</div>
      </div>
      {over ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: HANDFAM, fontStyle: "italic", fontSize: 21, color: T.ink, marginBottom: 10 }}>{won ? "You got it — nicely done." : `It was ${word}.`}</div>
          <button onClick={reset} style={bigBtn(gold())}><RotateCcw size={15} /> New word</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", maxWidth: 340, margin: "0 auto" }}>
          {"abcdefghijklmnopqrstuvwxyz".split("").map((l) => { const L = l.toUpperCase(); const used = guessed.includes(L); const bad = used && !word.includes(L); return (
            <button key={l} onClick={() => guess(L)} disabled={used} style={{ width: 30, height: 38, borderRadius: 7, border: `1px solid ${T.paperDeep}`, background: used ? (bad ? `${crim()}18` : `${sage()}22`) : T.paperHi, color: used ? (bad ? crim() : sage()) : T.ink, fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: used ? "default" : "pointer" }}>{L}</button>
          ); })}
        </div>
      )}
    </GameShell>
  );
}

// ════════════════════════════════════════════════ ARCADE HOME ══════════════════
function Tile({ Icon, name, note, accent, badge, onClick }) {
  return (
    <button onClick={onClick} style={{ textAlign: "left", background: `linear-gradient(160deg, ${T.paperHi} 0%, ${accent}12 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${accent}`, borderRadius: 14, padding: "14px 14px", cursor: "pointer", position: "relative" }}>
      {badge && <span style={{ position: "absolute", top: 10, right: 10, fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: accent, background: `${accent}1F`, borderRadius: 999, padding: "3px 8px" }}>{badge}</span>}
      <span style={{ width: 34, height: 34, borderRadius: 10, background: `${accent}1F`, display: "grid", placeItems: "center", marginBottom: 9 }}><Icon size={18} color={accent} /></span>
      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 16.5, color: T.ink, lineHeight: 1.15, marginBottom: 2 }}>{name}</div>
      <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.35 }}>{note}</div>
    </button>
  );
}

export default function GamesArcade({ onShareToRoom }) {
  useEditorialFonts();
  const [game, setGame] = useState(null);
  const onShare = useCallback((text) => { if (navigator.share) navigator.share({ text }).catch(() => {}); else if (onShareToRoom) onShareToRoom(text); else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener"); }, [onShareToRoom]);

  if (game === "word") return <DailyWord onBack={() => setGame(null)} onShare={onShare} />;
  if (game === "trivia") return <DailyTrivia onBack={() => setGame(null)} onShare={onShare} />;
  if (game === "ttt") return <TicTacToe onBack={() => setGame(null)} />;
  if (game === "hangman") return <Hangman onBack={() => setGame(null)} />;

  const wordDone = lsGet("fw_word_" + todayKey(), null)?.done;
  const triviaDone = lsGet("fw_trivia_" + todayKey(), null)?.done;
  return (
    <div>
      <Eyebrow color={gold()} mb={8}>Today's puzzles</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        <Tile Icon={Type} name="The Daily Word" note="Guess the word in six" accent={crim()} badge={wordDone ? "done" : "new"} onClick={() => setGame("word")} />
        <Tile Icon={Puzzle} name="Daily Trivia" note="Five fun questions" accent={plum()} badge={triviaDone ? "done" : "new"} onClick={() => setGame("trivia")} />
      </div>
      <Eyebrow color={gold()} mb={8}>Play now, vs the app</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Tile Icon={Grid3x3} name="Tic-tac-toe" note="Beat the app" accent={sage()} onClick={() => setGame("ttt")} />
        <Tile Icon={HelpCircle} name="Hangman" note="Guess the word" accent={gold()} onClick={() => setGame("hangman")} />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: `${plum()}0E`, border: `1px dashed ${T.paperDeep}`, borderRadius: 12, padding: "11px 13px", marginTop: 16 }}>
        <Dices size={15} color={plum()} style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.5 }}><b>Coming with sign-off:</b> play a real woman — async Connect-4, Ludo, Whot (needs a small match entity). For now it's solo + the room's party rounds below.</span>
      </div>
    </div>
  );
}
