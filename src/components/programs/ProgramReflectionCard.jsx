export default function ProgramReflectionCard({ prompt, value, onChange, onSave, saving }) {
  return (
    <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Day notes</p>
          <p className="mt-1 text-sm text-gray-500">Keep a quick reflection so this program feels personal and easier to stick with.</p>
        </div>
      </div>

      {prompt && (
        <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm italic text-gray-600">
          Reflection: {prompt}
        </div>
      )}

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        placeholder="How did today feel? What helped? What do you want to remember for tomorrow?"
        className="mt-4 w-full resize-none rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-rose-200 focus:ring-2 focus:ring-rose-100"
      />

      <div className="mt-4 flex justify-end">
        <button onClick={onSave} disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-70">
          {saving ? "Saving…" : "Save note"}
        </button>
      </div>
    </div>
  );
}