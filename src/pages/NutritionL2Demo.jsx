// NutritionL2Demo — ADDITIVE demo of the approved "Nutrition Level Up (+2)" plan.
// IT RENDERS THE FULL CURRENT LIVE PAGE (the real <NutritionEliteShell/>, which mounts EVERY existing
// feature — log a meal / macros & micros / water / shopping / pantry / cook-tonight videos / meal plan /
// the kitchen table) AND THEN appends a clearly-divided "Level +2 — proposed additions" slider.
// Nothing stripped. Non-gated +2 features are real/seeded; the one gated feature (photo→macros vision)
// is a clearly-labelled "needs sign-off" stub. Demo-first; LIVE /Nutrition untouched.
//
// Plan source: src/components/founders/brandDocs/nutrition-levelup.html
import { useState, useMemo } from "react";
import {
  Apple, Camera, Lock, Repeat, ChefHat, Sprout, ShieldCheck, Dumbbell, Baby, Users,
  Heart as HeartIcon, EyeOff, Eye, Check, AlertTriangle, BookOpen, Flower2,
} from "lucide-react";
import {
  PAPER_BG, T, SERIF, UI, InkFilter, EditorialFooter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Pollinator, FlowerGlyph } from "@/components/brand/flora";
import { OXBLOOD, subCard, focusPill, inputBase, Panel, StackedCard, BoardBody, SliderArrows } from "@/components/brand/SliderKit";
import { RECIPE_LIBRARY } from "@/data/recipeLibrary";
import { NUTRITION_MYTHS } from "@/data/nutritionMyths";
import CookVideo from "@/components/nutrition-elite/CookVideo";
// THE FULL CURRENT LIVE PAGE — every existing feature, nothing stripped.
import NutritionEliteShell from "@/components/nutrition-elite/NutritionEliteShell";

const ELITE_MOTION = `
.fw-elite-press{transition:transform .12s ease}.fw-elite-press:active{transform:scale(.97)}
@media (prefers-reduced-motion:reduce){.fw-elite-press{transition:none}}`;

function GatedBadge() {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: T.crimson, border: `1px solid ${T.crimson}`, borderRadius: 999, padding: "2px 8px" }}><Lock size={10} /> Needs sign-off</span>;
}
function L2Badge({ tier = "+2" }) {
  const c = tier === "+1" ? cwOf("sage").petal : cwOf("plum").petal;
  return <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: c, border: `1px solid ${c}`, borderRadius: 999, padding: "2px 7px" }}>Level {tier}</span>;
}

// the divider that separates "the full current live page (above)" from "the +2 additions (below)"
export function L2Divider({ page, tint }) {
  const c = tint || cwOf("crimson").petal;
  return (
    <div style={{ maxWidth: 460, margin: "10px auto 0", padding: "0 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 4px" }}>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${c}, transparent)`, opacity: 0.6 }} />
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: c, whiteSpace: "nowrap" }}>✦ {page} · Level +2 — proposed additions ✦</span>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${c}, transparent)`, opacity: 0.6 }} />
      </div>
      <p style={{ textAlign: "center", fontFamily: UI, fontSize: 11.5, color: T.muted, margin: "0 0 4px", lineHeight: 1.5 }}>Everything above is the <b>current live page</b> (nothing removed). Everything below is the <b>proposed +2 layer</b> — real where you can feel it, labelled where it needs your sign-off.</p>
    </div>
  );
}

export default function NutritionL2Demo() {
  useEditorialFonts();
  const [numbersOff, setNumbersOff] = useState(false);
  const [condition, setCondition] = useState("pcos");
  const [glp1, setGlp1] = useState(false);
  const [shared, setShared] = useState(false);
  const [plants] = useState(18);
  const ref = useMemo(() => ({ current: null }), []);

  const gold = T.gold, sage = cwOf("sage").petal, crim = T.crimson, plum = cwOf("plum").petal;
  const soup = RECIPE_LIBRARY.find((r) => r.nutrient_story === "iron") || RECIPE_LIBRARY[1];
  const harissa = RECIPE_LIBRARY[0];
  const myth = NUTRITION_MYTHS[1] || NUTRITION_MYTHS[0];

  const Macro = ({ kcalRange, note }) => numbersOff
    ? <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: sage }}><Check size={13} style={{ verticalAlign: -2 }} /> Balanced {note ? `· ${note}` : ""}</span>
    : <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>≈ {kcalRange} kcal <span style={{ width: 8, height: 8, borderRadius: 99, background: sage, display: "inline-block", marginLeft: 4 }} /></span>;

  return (
    <div style={{ position: "relative" }}>
      {/* fixed demo badge */}
      <div style={{ position: "fixed", bottom: "calc(80px + env(safe-area-inset-bottom))", left: 12, zIndex: 50, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff", background: gold, borderRadius: 999, padding: "5px 11px", boxShadow: "0 2px 10px rgba(58,44,26,.3)" }}>Nutrition +2 · demo</div>

      {/* ── THE FULL CURRENT LIVE PAGE (all existing features, nothing stripped) ── */}
      <NutritionEliteShell />

      {/* ── THE +2 ADDITIONS ── */}
      <L2Divider page="Nutrition" tint={crim} />
      <div style={{ ...PAPER_BG, fontFamily: SERIF, color: T.ink, overflowX: "clip", paddingBottom: "calc(110px + env(safe-area-inset-bottom))" }}>
        <InkFilter />
        <style>{floraKeyframes}{ELITE_MOTION}</style>
        <div style={{ maxWidth: 460, margin: "0 auto", padding: "8px 18px 0", position: "relative" }}>

          {/* ED-safe "numbers off" global toggle (a +2 feature, felt immediately) */}
          <button onClick={() => setNumbersOff((v) => !v)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", margin: "6px 0 2px", background: numbersOff ? `${sage}1A` : T.paperHi, border: `1px solid ${numbersOff ? sage : T.paperDeep}`, borderRadius: 14, padding: "10px 13px", cursor: "pointer", textAlign: "left" }}>
            {numbersOff ? <EyeOff size={17} color={sage} /> : <Eye size={17} color={T.muted} />}
            <span style={{ flex: 1 }}>
              <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block" }}>Numbers {numbersOff ? "off" : "on"} · ED-safe</span>
              <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{numbersOff ? "Calories & macros hidden — logs read “balanced · iron ✓”." : "Tap to hide every calorie & macro app-wide."}</span>
            </span>
            <L2Badge />
          </button>

          <div ref={(el) => { ref.current = el; }} style={{ marginTop: 14, position: "relative" }}>
            <SliderArrows sliderRef={ref} />
            <ClipboardSlider hint="Slide the +2 additions →" accent={crim}>

              {/* +2 BOARD A — REAL-MEAL ACCURACY */}
              <Clipboard title="Eat today · +2" sub="ACCURACY · HONEST · NEVER A DIET" accent={crim} flower="poppy" idx="cb-eat" titleColor={OXBLOOD}>
                <BoardBody>
                  <StackedCard topAccent={crim} bottomAccent={plum}
                    top={[
                      <Panel key="composite" label="Composite meal · build from ingredients" Icon={Apple} accent={crim}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><L2Badge /><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>not one “lasagne” row</span></div>
                        <div style={{ ...subCard(crim) }}>
                          <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{soup.title}</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "8px 0" }}>
                            {soup.ingredients.slice(0, 5).map((g) => <span key={g.name} style={{ fontFamily: UI, fontSize: 11, color: T.muted, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "3px 8px" }}>{g.name}</span>)}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.paperDeep}`, paddingTop: 8 }}>
                            <Macro kcalRange={`${soup.rough_kcal - 40}–${soup.rough_kcal + 50}`} note="iron ✓" />
                            <span style={{ fontFamily: UI, fontSize: 11, color: sage, fontWeight: 700 }}>+ cooking yield</span>
                          </div>
                        </div>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.5, margin: "10px 2px 0" }}>Ingredients + a yield factor beat a one-food guess. Shown as a <b>range</b> (portion error is real), never false precision.</p>
                      </Panel>,
                      <Panel key="same" label="Same as yesterday" Icon={Repeat} accent={sage}>
                        <div style={{ ...subCard(sage) }}>
                          <div style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5 }}>Porridge + berries · Lentil soup · Salmon &amp; greens</div>
                          <div style={{ marginTop: 8 }}><Macro kcalRange="1,480–1,720" note="balanced day" /></div>
                        </div>
                        <button className="fw-elite-press" style={{ ...focusPill(sage), marginTop: 12 }}><Repeat size={15} /> Re-log yesterday</button>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>One tap, high daily value. <L2Badge tier="+1" /></p>
                      </Panel>,
                    ]}
                    bottom={[
                      <Panel key="photo" label="Snap a photo" Icon={Camera} accent={plum}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><GatedBadge /><span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>capped vision model</span></div>
                        <div style={{ ...subCard(plum) }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <div style={{ width: 52, height: 52, borderRadius: 12, background: `${plum}1A`, border: `1px dashed ${plum}`, display: "grid", placeItems: "center", flexShrink: 0 }}><Camera size={20} color={plum} /></div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>Estimate → you confirm</div>
                              <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.45 }}>“Looks like salad + chicken. ≈ 380–520 kcal?” You accept / swap / resize.</div>
                            </div>
                          </div>
                        </div>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.crimson, lineHeight: 1.5, margin: "10px 2px 0" }}><b>Gated.</b> Each photo is a metered model call — needs sign-off on a capped vision function. The honest “range + confirm” mock only; text logger stays the fallback.</p>
                      </Panel>,
                      <Panel key="intuitive" label="Intuitive eating" Icon={HeartIcon} accent={sage}>
                        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.55, margin: "0 0 10px" }}>A gentle hunger / fullness check-in — joy, not compliance. No streak to guilt you.</p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {["Hungry", "Satisfied", "A bit full", "Ate for comfort — that’s ok"].map((t) => <span key={t} style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.inkSoft, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 12px" }}>{t}</span>)}
                        </div>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>The evidence-backed contrast to diet apps. <L2Badge /></p>
                      </Panel>,
                    ]} />
                </BoardBody>
              </Clipboard>

              {/* +2 BOARD B — YOUR WATCH-LIST (condition + life-stage) */}
              <Clipboard title="Your watch-list · NEW" sub="EVIDENCE-GRADED · NEVER A FAD" accent={plum} flower="iris" idx="cb-watch" titleColor={OXBLOOD}>
                <BoardBody>
                  <StackedCard topAccent={plum} bottomAccent={sage}
                    top={[
                      <Panel key="cond" label="Condition nutrient watch-lists" Icon={ShieldCheck} accent={plum}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                          {[["pcos", "PCOS"], ["endo", "Endometriosis"], ["thyroid", "Thyroid"], ["peri", "Perimenopause"]].map(([id, l]) => (
                            <button key={id} onClick={() => setCondition(id)} className="fw-elite-press" style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, padding: "7px 12px", borderRadius: 999, cursor: "pointer", border: `1px solid ${condition === id ? plum : T.paperDeep}`, background: condition === id ? `${plum}1A` : T.paper, color: condition === id ? plum : T.muted }}>{l}</button>
                          ))}
                        </div>
                        <div style={{ ...subCard(plum) }}>
                          <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: sage }}>● Evidence-graded</span>
                          <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.55, margin: "6px 0 0" }}>{CONDITION_COPY[condition]}</p>
                        </div>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>Opt-in threads with an explicit anti-myth caution. <L2Badge /></p>
                      </Panel>,
                    ]}
                    bottom={[
                      <Panel key="glp1" label="GLP-1 muscle-guardian" Icon={Dumbbell} accent={crim}>
                        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.55, margin: 0 }}>On a GLP-1, ~25–40% of weight lost can be <b>lean mass</b>. This opt-in mode protects it: protein-forward small meals, micros on a shrunk appetite, hydration, “pair with strength”.</p>
                        <button onClick={() => setGlp1((v) => !v)} className="fw-elite-press" style={{ ...focusPill(glp1 ? crim : T.muted), marginTop: 12 }}><Dumbbell size={15} /> {glp1 ? "Guardian mode on" : "Turn on guardian mode"}</button>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>Framed as protection — never weight-loss. <L2Badge /></p>
                      </Panel>,
                      <Panel key="preg" label="Pregnancy & feeding" Icon={Baby} accent={sage}>
                        <div style={{ ...subCard(sage), marginBottom: 8 }}><b style={{ fontFamily: SERIF, fontSize: 14.5 }}>Gestational diabetes</b><p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "3px 0 0", lineHeight: 1.5 }}>No proven GDM diet (NICE 2025) — routes to your NHS dietitian + low-GI. Never a “proven” low-carb plan.</p></div>
                        <div style={{ ...subCard(crim) }}><b style={{ fontFamily: SERIF, fontSize: 14.5 }}>Breastfeeding</b><p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "3px 0 0", lineHeight: 1.5 }}>A gentle ~+500 kcal/day uplift + a “don’t drop below” guardrail for calcium/zinc/B6.</p></div>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>A safety + trust win. <L2Badge /></p>
                      </Panel>,
                    ]} />
                </BoardBody>
              </Clipboard>

              {/* +2 BOARD C — COOK & SHARE + */}
              <Clipboard title="Cook & share · +2" sub="WATCH→LOG · 30 PLANTS · THE TABLE" accent={gold} flower="sunflower" idx="cb-cook" titleColor={OXBLOOD}>
                <BoardBody>
                  <StackedCard topAccent={gold} bottomAccent={sage}
                    top={[
                      <Panel key="watched" label="Watched it → logged it" Icon={ChefHat} accent={gold}>
                        <CookVideo youtubeId={harissa.youtube_id} title={harissa.title} accent={gold} />
                        <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.5, margin: "10px 0 6px" }}>One tap turns the video into an accurate <b>composite</b> meal — its ingredients + cooking yield, not a guess.</p>
                        <div style={{ ...subCard(crim) }}><div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600 }}>{harissa.title}</div><div style={{ marginTop: 6 }}><Macro kcalRange={`${harissa.rough_kcal - 40}–${harissa.rough_kcal + 60}`} note="protein ✓" /></div></div>
                        <button className="fw-elite-press" style={{ ...focusPill(crim), marginTop: 10 }}><Check size={15} /> Log this meal</button>
                      </Panel>,
                      <Panel key="fallback" label="If a video’s gone" Icon={AlertTriangle} accent={sage}>
                        <div style={{ ...subCard(sage) }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><AlertTriangle size={15} color={sage} /><span style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink }}>This clip was removed by its creator.</span></div>
                          <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
                            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: gold, border: `1px solid ${gold}`, borderRadius: 999, padding: "6px 11px" }}>Watch on YouTube ↗</span>
                            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: sage, border: `1px solid ${sage}`, borderRadius: 999, padding: "6px 11px" }}>A backup recipe</span>
                          </div>
                        </div>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>A dead box never appears — auto-detected + replaced. <L2Badge tier="+1" /></p>
                      </Panel>,
                    ]}
                    bottom={[
                      <Panel key="plants" label="30 plants this week" Icon={Sprout} accent={sage}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: sage }}>{plants}</span><span style={{ fontFamily: UI, fontSize: 13, color: T.muted }}>/ 30 different plants</span></div>
                        <div style={{ height: 8, borderRadius: 99, background: T.paperDeep, overflow: "hidden", margin: "8px 0" }}><div style={{ width: `${(plants / 30) * 100}%`, height: "100%", background: sage }} /></div>
                        <div style={{ ...subCard(gold), marginTop: 6 }}><span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: gold, letterSpacing: ".05em", textTransform: "uppercase" }}>Plant of the week</span><div style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, marginTop: 2 }}>Try fennel — 3 women in your season added it this week.</div></div>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>Delight, never a scoreboard. <L2Badge tier="+1" /></p>
                      </Panel>,
                      <Panel key="share" label="Share to the table" Icon={Users} accent={crim}>
                        {shared ? (
                          <div style={{ textAlign: "center", padding: "14px 0" }}><FlowerGlyph variant="clover" size={44} color={sage} idx="shared" /><p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: T.ink, marginTop: 10 }}>Shared to the table — anonymously.</p></div>
                        ) : (<>
                          <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.5, margin: "0 0 8px" }}>Tonight’s plate, “help, what do I make with this?”, a comfort-food confession — anonymous-safe, into the community.</p>
                          <textarea rows={2} placeholder="What’s on your plate tonight?" style={{ ...inputBase, resize: "none" }} />
                          <button onClick={() => setShared(true)} className="fw-elite-press" style={{ ...focusPill(crim), marginTop: 10 }}><Users size={15} /> Share to the table</button>
                        </>)}
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "10px 2px 0" }}>Closes the “coming soon” stub. <L2Badge tier="+1" /></p>
                      </Panel>,
                    ]} />
                </BoardBody>
              </Clipboard>

              {/* +2 BOARD D — THE ANTI-DIET SPINE */}
              <Clipboard title="The table · +2" sub="MYTH-FREE · NEVER GRADE FOOD" accent={sage} flower="clover" idx="cb-table" titleColor={OXBLOOD}>
                <BoardBody>
                  <StackedCard topAccent={sage} bottomAccent={gold}
                    top={[
                      <Panel key="myth" label="Myth vs fact" Icon={BookOpen} accent={gold}>
                        <div style={{ ...subCard(crim), marginBottom: 8 }}><span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, color: crim, textTransform: "uppercase", letterSpacing: ".05em" }}>Myth</span><p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, margin: "3px 0 0", lineHeight: 1.45 }}>{myth.myth}</p></div>
                        <div style={{ ...subCard(sage) }}><span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, color: sage, textTransform: "uppercase", letterSpacing: ".05em" }}>Fact</span><p style={{ fontFamily: SERIF, fontSize: 13.5, color: T.muted, margin: "3px 0 0", lineHeight: 1.5 }}>{myth.fact.slice(0, 180)}</p></div>
                      </Panel>,
                    ]}
                    bottom={[
                      <Panel key="grade" label="We never grade food" Icon={ShieldCheck} accent={sage}>
                        <div style={{ display: "grid", placeItems: "center", padding: "6px 0 10px" }}><Flower2 size={40} color={sage} /></div>
                        <p style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.55, textAlign: "center", margin: 0 }}>No A–E scores. No “good” or “bad” foods. Any product context stays neutral (“higher in salt”) — never moralised.</p>
                        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, textAlign: "center", margin: "12px 2px 0" }}>The opposite of Yuka’s orthorexia risk. <L2Badge /></p>
                      </Panel>,
                    ]} />
                </BoardBody>
              </Clipboard>

            </ClipboardSlider>
          </div>

          <div style={{ display: "grid", placeItems: "center", margin: "20px 0 0" }}><Pollinator kind="bee" size={30} color={gold} color2={cwOf("crimson").tip} pattern="bands" animate idx="nl2-close" /></div>
          <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "6px auto 0", maxWidth: 320, lineHeight: 1.55 }}>The full current page, plus accuracy, personalisation and an anti-diet spine — nothing dropped.</p>
          <div style={{ marginTop: 30 }}><EditorialFooter /></div>
        </div>
      </div>
    </div>
  );
}

const CONDITION_COPY = {
  pcos: "PCOS · inositol is strongest in the insulin-resistant phenotype (~metformin, fewer GI effects). No single “PCOS diet” is superior — behavioural support + movement + a body-neutral frame, not a prescription.",
  endo: "Endometriosis · no diet has RCT superiority. Mediterranean / low-FODMAP may ease pain for some — but influencer elimination diets are under-supported. We flag the anti-myth caution explicitly.",
  thyroid: "Thyroid (Hashimoto’s) · a Mediterranean pattern beats a blanket gluten-free diet for most. Adequate selenium & iodine from food; avoid fad restriction without a clinician.",
  peri: "Perimenopause · women under-eat fibre, vitamin D, calcium and iron — and “the window” is peri, not post. A protein-forward, bone-supportive pattern, gently.",
};
