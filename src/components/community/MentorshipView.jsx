// Community · MENTORSHIP (F1, 2026-08-06). A quiet, consented, ANONYMOUS pairing — a woman a little
// further along accompanies one earlier in a similar SEASON (never location). Peer companionship,
// NOT expert/clinical advice. Messaging reuses the DM thread (fully screened + identity-gated).
// One pairing at a time; either can end or report any time.
import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, HeartHandshake, ShieldCheck, EyeOff, Flag, MessageCircle, Sprout, Hand as HandIcon } from "lucide-react";
import { T, UI, Hand, PAPER_BG } from "@/components/journal/Editorial";
import { mentorApi } from "./mentor";

const OXBLOOD = "#7A1A12";
const SAGE = "#5F7A56";
const PLUM = "#8E6E8E";
const card = { background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "16px 16px" };
const primaryBtn = (bg) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: bg, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" });
const ghostBtn = { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 12px", fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.muted, cursor: "pointer" };

// season/stage labels — the ONLY match signal (never location, never her details)
const SEASON_LABEL = {
  teen: "the teen years", reproductive: "the reproductive years", "pre-ttc": "thinking about trying",
  ttc: "trying to conceive", pregnant: "pregnancy", "pregnant-t1": "pregnancy", "pregnant-t2": "pregnancy",
  "pregnant-t3": "pregnancy", postpartum: "the postpartum stretch", perimenopause: "perimenopause",
  menopause: "menopause", "post-menopause": "after menopause",
};
const seasonWord = (s) => SEASON_LABEL[s] || "a similar season";

export default function MentorshipView({ user, lifeStage, onBack, onOpenMessages, onCrisis }) {
  const [pair, setPair] = useState(null);
  const [busy, setBusy] = useState(true);
  const [acting, setActing] = useState(false);
  const season = lifeStage || "";

  const load = useCallback(async () => {
    setBusy(true);
    try { const r = await mentorApi.mine(user); setPair(r?.pair || null); }
    catch { setPair(null); } finally { setBusy(false); }
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const optin = async (role) => {
    setActing(true);
    try { const r = await mentorApi.optin(user, { role, season }); setPair(r?.pair || null); }
    catch { /* stay */ } finally { setActing(false); }
  };
  const end = async () => {
    if (!pair?.id) return;
    setActing(true);
    try { await mentorApi.end(user, pair.id, "left"); setPair(null); }
    finally { setActing(false); }
  };
  const report = async () => {
    if (!pair?.id) return;
    setActing(true);
    try { await mentorApi.report(user, pair.id); } finally { setActing(false); }
  };

  const Header = (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <button onClick={onBack} style={ghostBtn}><ChevronLeft size={15} /> Community</button>
      <h1 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 25, fontWeight: 600, color: OXBLOOD, letterSpacing: -0.3, display: "inline-flex", alignItems: "center", gap: 8 }}><HeartHandshake size={20} color={SAGE} /> Walk with someone</h1>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", ...PAPER_BG }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "22px 18px calc(60px + env(safe-area-inset-bottom))" }}>
        {Header}

        {/* what it is — set the frame BEFORE any opt-in: companionship, not advice */}
        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: SAGE, marginBottom: 8 }}>What this is</div>
          <Hand size={17} color={T.inkSoft} style={{ marginBottom: 10, lineHeight: 1.5 }}>
            A quiet pairing with one woman in {season ? seasonWord(season) : "a similar season"} — one a little further along, one earlier in it. Someone to check in with, at your own pace.
          </Hand>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[[ShieldCheck, "Anonymous both ways", "A botanical alias, never a name. Matched on your season — never your location, never your details."],
              [HeartHandshake, "Company, not expert advice", "She's a woman who's been there, not a clinician. For anything medical, your Health room and a real professional come first."],
              [EyeOff, "Yours to end, any time", "Every message is screened, and you can end or report the pairing whenever you like — no explanation owed."]].map(([Ic, h, b]) => (
              <div key={h} style={{ display: "flex", gap: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: `${SAGE}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Ic size={14} color={SAGE} /></span>
                <div><div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.ink }}>{h}</div><div style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.4 }}>{b}</div></div>
              </div>
            ))}
          </div>
        </div>

        {busy && <p style={{ fontFamily: UI, fontSize: 13, color: T.muted }}>Finding where you're up to…</p>}

        {/* NO PAIR → choose a role */}
        {!busy && !pair && (
          <div style={{ ...card }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: OXBLOOD, marginBottom: 4 }}>Which feels right, right now?</div>
            <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, lineHeight: 1.5, margin: "0 0 14px" }}>You can only be in one pairing at a time — and you can swap or stop whenever.</p>
            <button disabled={acting} onClick={() => optin("mentee")} style={{ ...primaryBtn(PLUM), marginBottom: 10 }}><Sprout size={16} /> I'd like to be accompanied</button>
            <button disabled={acting} onClick={() => optin("mentor")} style={primaryBtn(SAGE)}><HandIcon size={16} /> I'd like to accompany someone</button>
          </div>
        )}

        {/* SEEKING → waiting for a match */}
        {!busy && pair && pair.status === "seeking" && (
          <div style={{ ...card, textAlign: "center" }}>
            <span style={{ width: 40, height: 40, borderRadius: 999, background: `${SAGE}1F`, display: "grid", placeItems: "center", margin: "2px auto 10px" }}><Sprout size={20} color={SAGE} /></span>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: OXBLOOD, marginBottom: 4 }}>We're looking for your person</div>
            <p style={{ fontFamily: UI, fontSize: 13, color: T.muted, lineHeight: 1.5, margin: "0 0 14px" }}>
              You're {pair.my_role === "mentor" ? "offering to accompany" : "waiting to be paired with"} someone in {season ? seasonWord(season) : "a similar season"}. It can take a little while — we'll pair you the moment there's a gentle match. Nothing else to do.
            </p>
            <button disabled={acting} onClick={end} style={ghostBtn}>Stop looking for now</button>
          </div>
        )}

        {/* ACTIVE → paired */}
        {!busy && pair && pair.status === "active" && (
          <div style={{ ...card }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ width: 34, height: 34, borderRadius: 999, background: `${PLUM}1F`, display: "grid", placeItems: "center" }}><HeartHandshake size={17} color={PLUM} /></span>
              <div>
                <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>{pair.my_role === "mentor" ? "Someone earlier in her journey" : "A woman a little further along"}</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 600, color: OXBLOOD }}>{pair.my_role === "mentor" ? pair.mentee_alias : pair.mentor_alias}</div>
              </div>
            </div>
            <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, lineHeight: 1.5, margin: "0 0 14px" }}>You're paired, quietly. Say hello when you're ready — a sentence is plenty. Everything's screened and anonymous.</p>
            <button onClick={() => onOpenMessages?.(pair.conversation_id)} style={{ ...primaryBtn(PLUM), marginBottom: 12 }}><MessageCircle size={16} /> Open your messages</button>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button disabled={acting} onClick={end} style={ghostBtn}>End pairing</button>
              <button disabled={acting} onClick={report} style={{ ...ghostBtn, color: OXBLOOD }}><Flag size={12} /> Report</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
