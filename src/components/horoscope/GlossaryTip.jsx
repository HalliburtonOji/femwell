import { useState, useRef, useEffect } from "react";

const GLOSSARY = {
  "transit": "A transit occurs when a planet in the sky today forms an angle to a planet in your birth chart, activating that energy in your life.",
  "natal chart": "A map of the sky at the exact moment you were born. It shows the positions of the Sun, Moon, and planets, forming the blueprint of your personality and potential.",
  "synastry": "The comparison of two birth charts to assess relationship compatibility. It examines how one person's planets interact with another's.",
  "annual profection": "An ancient timing technique that activates one house of your chart per year of life, revealing the dominant themes and ruling planet for that year.",
  "profection": "An ancient timing technique that activates one house of your chart per year of life, revealing the dominant themes and ruling planet for that year.",
  "saturn return": "The period, roughly every 29 years, when Saturn returns to the exact position it held at your birth. It marks a major life restructuring and coming of age.",
  "time-lord": "In traditional astrology, the planet that 'rules' a given period of your life — activated by a timing technique such as annual profections.",
  "void-of-course": "The Moon is void-of-course when it has made its last major aspect to another planet before changing signs. Traditionally, plans started now may not bear fruit.",
  "ascendant": "The zodiac sign rising on the eastern horizon at your birth. It shapes your outward personality, first impressions, and physical appearance.",
  "rising": "See ascendant — the sign on the eastern horizon at birth, defining how you present yourself to the world.",
  "midheaven": "The highest point in your chart at birth, representing your public reputation, career path, and life goals.",
  "house": "One of twelve divisions of the birth chart, each governing a different life area — identity, money, communication, home, creativity, health, relationships, and more.",
  "aspect": "An angle between two planets in a chart (e.g. conjunction, trine, square) that describes how those planetary energies interact.",
  "conjunction": "Two planets within a few degrees of each other, merging their energies into a single powerful focus.",
  "opposition": "Planets roughly 180 degrees apart, creating tension that calls for balance and integration.",
  "trine": "Planets 120 degrees apart — a harmonious aspect suggesting natural ease and flow between those energies.",
  "square": "Planets 90 degrees apart — a challenging aspect that drives growth through friction and necessary change.",
  "north node": "A mathematical point in your chart indicating your soul's evolutionary direction and the qualities you are developing in this lifetime.",
  "chiron": "An asteroid known as the 'wounded healer' — its placement shows your deepest wound and, through healing, your greatest gift to offer others.",
  "stellium": "Three or more planets clustered in the same sign or house, intensifying the themes of that area in your chart.",
  "retrograde": "When a planet appears to move backwards from Earth's perspective. Linked to revisiting, reviewing, and internalising that planet's themes.",
  "ingress": "The moment a planet moves into a new zodiac sign, shifting the collective energy around that planet's themes.",
  "eclipse": "A supercharged New or Full Moon that accelerates change, often triggering major beginnings or endings in your life.",
  "lunar return": "The moment each month when the Moon returns to the exact position it held at your birth — a mini reset for your emotional cycle.",
  "solar return": "The moment each year when the Sun returns to your birth degree, marking your personal new year and setting the themes for the year ahead.",
  "dispositor": "The planet that rules the sign another planet occupies. It 'receives' and shapes the energy of that planet.",
  "exaltation": "A sign where a planet is especially powerful and expresses its highest qualities.",
  "detriment": "A sign where a planet is in the opposite sign it rules, making its energy feel less comfortable or more challenged.",
};

export default function GlossaryTip({ term, children }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const definition = GLOSSARY[term?.toLowerCase()] || null;

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!definition) return <>{children}</>;

  const show = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
    timerRef.current = setTimeout(() => setOpen(false), 5000);
  };
  const hide = () => {
    clearTimeout(timerRef.current);
    setOpen(false);
  };

  return (
    <span style={{ position: "relative", display: "inline" }}>
      <button
        type="button"
        onClick={show}
        onMouseEnter={show}
        onMouseLeave={hide}
        aria-label={`Define: ${term}`}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "help",
          display: "inline",
          fontFamily: "inherit",
          fontSize: "inherit",
          fontWeight: "inherit",
          fontStyle: "inherit",
          color: "inherit",
          textDecoration: "underline dotted currentColor",
          textUnderlineOffset: 3,
        }}
      >
        {children}
      </button>
      {open && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            background: "#1a1025",
            color: "#f5f0ff",
            fontSize: 12,
            lineHeight: 1.5,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            padding: "8px 12px",
            borderRadius: 8,
            width: 220,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            pointerEvents: "none",
            whiteSpace: "normal",
            textAlign: "left",
          }}
        >
          <strong style={{ display: "block", marginBottom: 3, textTransform: "capitalize", color: "#d4a8f0" }}>
            {term}
          </strong>
          {definition}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #1a1025",
            }}
          />
        </span>
      )}
    </span>
  );
}