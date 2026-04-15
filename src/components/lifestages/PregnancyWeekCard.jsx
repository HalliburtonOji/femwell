import { differenceInDays, parseISO } from "date-fns";

const WEEK_DATA = {
  1:  { size: "a poppy seed",  development: "The egg has just been fertilised. Cells are dividing rapidly." },
  2:  { size: "a sesame seed",  development: "The blastocyst is forming. Implantation is beginning." },
  3:  { size: "a poppy seed",  development: "The embryo is implanting into the uterine wall." },
  4:  { size: "a lentil",      development: "The embryo's heart is beginning to form." },
  5:  { size: "an apple seed", development: "The neural tube is forming — the foundation of the brain and spinal cord." },
  6:  { size: "a pea",         development: "The heartbeat is now detectable. The face is beginning to take shape." },
  7:  { size: "a blueberry",   development: "Arm and leg buds are appearing. Brain growth is rapid." },
  8:  { size: "a raspberry",   development: "All major organs are beginning to develop." },
  9:  { size: "a grape",       development: "Fingers and toes are forming. The embryo becomes a fetus." },
  10: { size: "a strawberry",  development: "All vital organs are formed. The fetus can now swallow." },
  11: { size: "a fig",         development: "Bones are hardening. The face is becoming more distinct." },
  12: { size: "a lime",        development: "Baby can now make a fist. Reflexes are developing." },
  13: { size: "a peach",       development: "The second trimester begins. Risk of miscarriage drops significantly." },
  14: { size: "a lemon",       development: "Baby can make facial expressions. Fingerprints are forming." },
  15: { size: "an apple",      development: "Baby is forming taste buds. Bones are getting stronger." },
  16: { size: "an avocado",    development: "Baby can hear your voice. Movement may be felt soon." },
  17: { size: "a pear",        development: "Baby is developing fat stores. Skeleton is hardening." },
  18: { size: "a sweet potato","development": "Baby is yawning, hiccuping, and rolling." },
  19: { size: "a mango",       development: "Baby is covered in vernix — a protective coating." },
  20: { size: "a banana",      development: "Halfway there! Baby is moving regularly." },
  21: { size: "a carrot",      development: "Baby can now hear outside sounds. Eyebrows are forming." },
  22: { size: "a papaya",      development: "Sense of touch is developing. Baby grips the umbilical cord." },
  23: { size: "a grapefruit",  development: "Baby's face is fully formed. Rapid brain development continues." },
  24: { size: "a corn cob",    development: "Lungs are developing. Baby responds to sound." },
  25: { size: "a rutabaga",    development: "Baby is gaining weight. Hair is growing." },
  26: { size: "a kale leaf",   development: "Eyes are beginning to open. Baby is inhaling amniotic fluid." },
  27: { size: "a cauliflower", development: "Brain waves are measurable. Baby has a sleep-wake cycle." },
  28: { size: "an aubergine",  development: "Baby can open and close eyes. Brain development is rapid." },
  29: { size: "a butternut squash", "development": "Baby is practicing breathing. Muscles and lungs are maturing." },
  30: { size: "a cabbage",     development: "Baby's brain is forming grooves. Fat stores are building." },
  31: { size: "a coconut",     development: "All five senses are working. Baby is gaining rapidly." },
  32: { size: "a pineapple",   development: "Baby is practising breathing movements." },
  33: { size: "a pineapple",   development: "Baby's skull bones are still soft to allow for birth." },
  34: { size: "a butternut squash", "development": "Central nervous system and lungs are maturing fast." },
  35: { size: "a honeydew melon", "development": "Baby is filling out. Most organs are now fully mature." },
  36: { size: "a melon",       development: "Baby is nearly full term. Getting into position." },
  37: { size: "a winter melon", development: "Baby is considered early term. Practising sucking." },
  38: { size: "a leek",        development: "Baby is ready. Organs are fully functional." },
  39: { size: "a watermelon",  development: "Baby may drop lower in preparation for birth." },
  40: { size: "a watermelon",  development: "Full term. Baby is ready to meet you." },
};

function getWeekData(week) {
  const w = Math.max(1, Math.min(40, Math.round(week)));
  return WEEK_DATA[w] || WEEK_DATA[40];
}

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

export default function PregnancyWeekCard({ profile }) {
  let week = null;
  if (profile?.pregnancy_start_date) {
    const days = differenceInDays(new Date(), parseISO(profile.pregnancy_start_date));
    week = Math.floor(days / 7) + 1;
  } else if (profile?.pregnancy_week) {
    week = Number(profile.pregnancy_week);
  }

  if (!week) {
    return (
      <div style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 20, padding: 18, marginBottom: 14 }}>
        <p style={sLabel}>Your pregnancy</p>
        <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 6 }}>Set your pregnancy start date in your profile to see week-by-week tracking.</p>
      </div>
    );
  }

  const weekInfo = getWeekData(week);
  const pct = Math.min(100, Math.round((week / 40) * 100));

  return (
    <div style={{ background: "linear-gradient(135deg, var(--rose-dust-subtle) 0%, var(--mauve-subtle) 100%)", border: "1px solid var(--rose-dust-light)", borderRadius: 20, padding: 20, marginBottom: 14 }}>
      <p style={sLabel}>Your pregnancy</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 8, marginBottom: 4 }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "var(--plum)", lineHeight: 1 }}>Week {week}</p>
        <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>of 40</p>
      </div>
      <div style={{ height: 6, backgroundColor: "rgba(196,132,154,0.2)", borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: `${pct}%`, backgroundColor: "var(--rose-dust)", borderRadius: 3 }} />
      </div>
      <div style={{ backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 14, padding: "12px 14px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>
          👶 About the size of {weekInfo.size}
        </p>
        <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, margin: 0 }}>
          {weekInfo.development}
        </p>
      </div>
    </div>
  );
}