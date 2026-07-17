// SkyPreview — what she sees BEFORE she has a birth chart (pass 6c).
//
// THE BUG THIS FIXES: HoroscopeTab did `if (!astro) return <OnboardingCard/>` — so a woman with
// no AstroProfile (and there are only 3 in the whole database) saw ONE card and nothing else.
// Fifteen sections sat behind that early return, which is exactly why the surface read as
// "stripped": it wasn't stripped, it was gated on a chart almost nobody has.
//
// So the pre-chart state is now a real sky, not a wall:
//   • the MOON is real and free — getMoonPhase() is a synodic formula, no backend, no key.
//   • her SUN SIGN is derived from the birthday her UserProfile already holds, if it has one —
//     no chart, no setup, no LLM. Date arithmetic.
//   • and it shows, honestly, everything that's inside once she sets it up — the full feature
//     set, named, so nothing looks missing.
// Never empty (the 6a standard): every card here carries real content, not a teaser.
import { getMoonPhase, getSunSign, getElement, getRulingPlanet, prettyBirthday } from "@/utils/astrology";
import MoonPhaseGlyph from "./MoonPhaseGlyph";
import { T, SERIF, UI } from "@/components/journal/Editorial";
import ReadingColumn from "@/components/brand/ReadingColumn";
import { Moon, Sparkles, Sun, HeartHandshake, CalendarDays, Feather, MessageCircleQuestion, Compass } from "lucide-react";

const PLUM = "#6E5A7A";
const GOLD = "#A8893F";

const card = {
  background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18,
  padding: "16px 16px 18px", marginBottom: 12,
  boxShadow: "0 4px 18px rgba(58,44,26,0.08)",
};
const eyebrow = { fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: GOLD, marginBottom: 6 };

// what's actually inside once she has a chart — named honestly, so nothing reads as missing
const INSIDE = [
  { Icon: Sun, title: "Your triad", line: "Sun, moon and rising — who you lead with, what you need, how you arrive." },
  { Icon: Sparkles, title: "Today's weather", line: "A warm daily reading, written for the sky you woke up under." },
  { Icon: Moon, title: "Cycle and moon", line: "Where your own cycle sits against the moon's — the two clocks, side by side." },
  { Icon: CalendarDays, title: "Your year", line: "Annual profections — the house your year is being lived in, and what it asks." },
  { Icon: HeartHandshake, title: "Compatibility", line: "How your sky reads beside someone else's. Partner, friend, or the one you're wondering about." },
  { Icon: MessageCircleQuestion, title: "Ask the sky", line: "A question, answered against your own chart rather than a generic sign." },
  { Icon: Feather, title: "Your sky diary", line: "A quiet log against the moon — what each one stirred." },
  { Icon: Compass, title: "The monthly letter", line: "A longer, hand-crafted read at the turn of each month." },
];

export default function SkyPreview({ userProfile, onOpen }) {
  const moon = (() => { try { return getMoonPhase(new Date()); } catch { return null; } })();
  const birthday = userProfile?.birthday || userProfile?.date_of_birth || null;
  const sun = birthday ? (() => { try { return getSunSign(birthday); } catch { return null; } })() : null;
  const element = sun ? (() => { try { return getElement(sun); } catch { return null; } })() : null;
  const ruler = sun ? (() => { try { return getRulingPlanet(sun); } catch { return null; } })() : null;

  return (
    <div>
      {/* THE MOON — real, computed, free. True whether or not she ever sets up a chart. */}
      <div style={{ ...card, background: `linear-gradient(160deg, ${T.paperHi} 0%, ${PLUM}14 100%)` }}>
        <div style={eyebrow}>Tonight's sky</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <MoonPhaseGlyph phase={moon?.key || "new"} size={54} title={moon?.name} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>
              The moon is {moon ? moon.name.toLowerCase() : "turning"}
            </div>
            <div style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, marginTop: 3 }}>
              {moon ? `${moon.illumination}% lit · ${Math.round((moon.position || 0) * 29.5)} days into her round` : "as she always does"}
            </div>
          </div>
        </div>
        <ReadingColumn variant="card" size={15.5} style={{ paddingInline: 0, marginTop: 12, marginBottom: 0 }}>
          <p>
            {moon && moon.illumination >= 92
              ? "She's full tonight — the whole face of her lit. Old almanacs called this the week for finishing things, and there's decent sleep research suggesting you may rest a little lighter under it."
              : moon && moon.illumination <= 8
                ? "She's dark tonight — nothing to see, which is rather the point. The old books give this one to beginnings: the quiet before a thing is announced."
                : moon && (moon.position || 0) < 0.5
                  ? "She's filling — a little more of her each night. Traditionally the stretch for building, asking, starting the thing you've been circling."
                  : "She's emptying — a little less of her each night. Traditionally the stretch for finishing, releasing, and letting some things go unanswered."}
          </p>
        </ReadingColumn>
      </div>

      {/* HER SUN — free, from the birthday her profile already holds. No chart needed. */}
      {sun && (
        <div style={card}>
          <div style={eyebrow}>Already yours</div>
          <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>
            You're {/^[AEIOU]/.test(sun) ? "an" : "a"} {sun}
          </div>
          <div style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, marginTop: 3 }}>
            {[element && `${element} sign`, ruler && `ruled by ${ruler}`, birthday && prettyBirthday(birthday)].filter(Boolean).join(" · ")}
          </div>
          <ReadingColumn variant="card" size={15.5} style={{ paddingInline: 0, marginTop: 10, marginBottom: 0 }}>
            <p>We worked that out from the birthday already on your profile — no setup needed. Your sun is the part you lead with. Add your birth date properly and the rest of the sky joins it: your moon (what you need), your rising (how you arrive), and a reading written for the day you're actually in.</p>
          </ReadingColumn>
        </div>
      )}

      {/* THE INVITATION — honest about what's optional, and what it costs her (nothing) */}
      <div style={{ ...card, borderLeft: `4px solid ${GOLD}` }}>
        <div style={eyebrow}>Read me the sky</div>
        <ReadingColumn variant="card" size={15.5} style={{ paddingInline: 0, marginBottom: 12 }}>
          <p>FemWell writes you a daily reading from your own chart and your own cycle — not a sign-shaped horoscope written for a twelfth of the world.</p>
          <p><b>Your birth date is all we need to begin.</b> Birth time and place are optional; they unlock your moon and rising. Your birth place is just a city — it isn't your location, we never track you, and you can leave it out.</p>
        </ReadingColumn>
        <button onClick={onOpen} className="fw-ce-press"
          style={{ width: "100%", padding: "13px 16px", borderRadius: 14, background: PLUM, color: "#fff", border: "none", fontFamily: UI, fontSize: 14.5, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 16px ${PLUM}44` }}>
          Set up your sky
        </button>
      </div>

      {/* WHAT'S INSIDE — the full feature set, named. Nothing here is missing; it's waiting. */}
      <div style={card}>
        <div style={eyebrow}>What opens up</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
          {INSIDE.map(({ Icon, title, line }) => (
            <div key={title} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: `${PLUM}1C`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon size={15} color={PLUM} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, lineHeight: 1.25 }}>{title}</span>
                <span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.4, marginTop: 1 }}>{line}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
