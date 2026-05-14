const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};
const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

export default function ProgramReflectionCard({ prompt, value, onChange, onSave, saving }) {
  return (
    <div className="rounded-[24px] p-5 md:p-6" style={card}>
      <div className="mb-4">
        <p style={sLabel} className="mb-1.5">Day reflection</p>
        <p className="text-sm font-semibold" style={{ color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>
          How did today feel?
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
          A short note here makes this program more personal and easier to return to.
        </p>
      </div>

      {prompt && (
        <div className="mb-4 rounded-[16px] p-3.5"
          style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
          <p className="text-xs italic leading-relaxed" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
            {prompt}
          </p>
        </div>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="What helped today? What do you want to carry forward?"
        className="w-full resize-none rounded-2xl px-4 py-3.5 text-sm outline-none transition-all"
        style={{
          backgroundColor: "var(--ivory)",
          border: "1.5px solid var(--border)",
          color: "var(--plum)",
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.6,
        }}
        onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
        onBlur={e => e.target.style.borderColor = "var(--border)"}
      />

      <div className="mt-4 flex justify-end">
        <button onClick={onSave} disabled={saving}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            backgroundColor: "var(--plum)", color: "white",
            fontFamily: "'Inter', sans-serif",
            opacity: saving ? 0.6 : 1,
          }}>
          {saving ? "Saving…" : "Save note"}
        </button>
      </div>
    </div>
  );
}