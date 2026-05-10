import SealedLetterRow from "./SealedLetterRow";

export default function SealedLetterList({ letters, kind, onOpen }) {
  if (!letters || letters.length === 0) return null;

  const heading = kind === 'unsealed' ? 'Ready to read' : 'Still held';

  return (
    <div style={{ marginTop: 24, padding: "0 16px" }}>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 500, color: "var(--plum-deep)", marginBottom: 8 }}>
        {heading}
      </h3>
      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--ink-line)", borderRadius: 14, overflow: "hidden" }}>
        {letters.map((letter) => (
          <SealedLetterRow key={letter.id} letter={letter} kind={kind} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}