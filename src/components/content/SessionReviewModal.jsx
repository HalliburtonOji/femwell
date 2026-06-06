import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Star, X, BookOpen, Loader2 } from "lucide-react";

const MOOD_OPTIONS = [
  { value: 1, label: "1", desc: "Low" },
  { value: 2, label: "2", desc: "Okay" },
  { value: 3, label: "3", desc: "Good" },
  { value: 4, label: "4", desc: "Great" },
  { value: 5, label: "5", desc: "Amazing" },
];

const SUGGESTED_TAGS = ["calm", "focused", "peaceful", "energised", "emotional", "grateful", "sleepy", "clear-headed"];

export default function SessionReviewModal({ item, user, onClose }) {
  const [step, setStep] = useState("rating");
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [review, setReview] = useState("");
  const [mood, setMood] = useState(null);
  const [journalText, setJournalText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag) => setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const saveRating = async () => {
    if (!stars) return;
    setSaving(true);
    await base44.entities.ContentRatings.create({ user_id: user.id, content_id: item.id, content_key: item.content_key || "", stars, review: review.trim() });
    setSaving(false);
    setStep("journal");
  };

  const saveJournal = async () => {
    setSaving(true);
    if (journalText.trim() || mood) {
      await base44.entities.JournalEntries.create({ user_id: user.id, content_id: item.id, content_key: item.content_key || "", session_date: new Date().toISOString(), text: journalText.trim(), mood_rating: mood || undefined, tags: selectedTags.join(", ") });
    }
    setSaving(false);
    setStep("done");
  };

  const skipJournal = () => setStep("done");

  const inputStyle = { width: "100%", border: "1px solid var(--border)", borderRadius: 12, padding: "8px 12px", fontSize: 13, color: "var(--plum)", backgroundColor: "var(--ivory)", outline: "none", resize: "none", boxSizing: "border-box" };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-4 sm:pb-0" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden" style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow-lg)" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <div className="flex items-center gap-2">
            <BookOpen style={{ width: 16, height: 16, color: "var(--rose-dust)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--plum)" }}>
              {step === "rating" ? "Rate your session" : step === "journal" ? "Journal" : "All done"}
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--ivory-dark)", border: "none", cursor: "pointer" }}>
            <X style={{ width: 14, height: 14, color: "var(--mauve)" }} />
          </button>
        </div>

        <div className="px-5 pb-6 pt-3">
          {step === "rating" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs -mt-1" style={{ color: "var(--mauve)" }}>How was <span className="font-medium" style={{ color: "var(--plum)" }}>{item.title}</span>?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onMouseEnter={() => setHoverStars(s)} onMouseLeave={() => setHoverStars(0)} onClick={() => setStars(s)} className="transition-transform hover:scale-110" style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <Star className="w-9 h-9" fill={(hoverStars || stars) >= s ? "#f59e0b" : "none"} stroke={(hoverStars || stars) >= s ? "#f59e0b" : "var(--border)"} />
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--mauve)" }}>Leave a note (optional)</label>
                <textarea rows={3} placeholder="What did you enjoy? Any thoughts..." value={review} onChange={(e) => setReview(e.target.value)} style={inputStyle} />
              </div>
              <button onClick={saveRating} disabled={!stars || saving}
                className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: "var(--rose-dust)", color: "white", border: "none", cursor: "pointer", opacity: (!stars || saving) ? 0.5 : 1 }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? "Saving..." : "Submit Rating"}
              </button>
              <button onClick={skipJournal} className="text-center text-xs" style={{ color: "var(--mauve)", background: "none", border: "none", cursor: "pointer" }}>Skip</button>
            </div>
          )}

          {step === "journal" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs -mt-1" style={{ color: "var(--mauve)" }}>Take a moment to capture how you feel.</p>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--mauve)" }}>Your mood right now</label>
                <div className="flex justify-between gap-1">
                  {MOOD_OPTIONS.map((m) => (
                    <button key={m.value} onClick={() => setMood(m.value)}
                      className="flex flex-col items-center gap-0.5 flex-1 py-2 rounded-xl transition-all"
                      style={{ border: mood === m.value ? "1.5px solid var(--rose-dust)" : "1px solid var(--border)", backgroundColor: mood === m.value ? "var(--rose-dust-subtle)" : "var(--ivory)", cursor: "pointer" }}>
                      <span className="text-lg font-bold" style={{ color: mood === m.value ? "var(--rose-dust)" : "var(--mauve)" }}>{m.label}</span>
                      <span className="text-[10px]" style={{ color: "var(--mauve)" }}>{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--mauve)" }}>Write your thoughts</label>
                <textarea rows={4} placeholder="How do you feel after this session? Any insights, sensations or reflections..." value={journalText} onChange={(e) => setJournalText(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--mauve)" }}>Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                      style={{ backgroundColor: selectedTags.includes(tag) ? "var(--rose-dust)" : "var(--rose-dust-subtle)", color: selectedTags.includes(tag) ? "white" : "var(--rose-dust)", border: "none", cursor: "pointer" }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={saveJournal} disabled={saving}
                className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: "var(--rose-dust)", color: "white", border: "none", cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? "Saving..." : "Save Journal Entry"}
              </button>
              <button onClick={skipJournal} className="text-center text-xs" style={{ color: "var(--mauve)", background: "none", border: "none", cursor: "pointer" }}>Skip journaling</button>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--rose-dust-subtle)" }}>
                <span style={{ fontSize: 24 }}>&#10003;</span>
              </div>
              <p className="font-semibold" style={{ color: "var(--plum)" }}>Thank you</p>
              <p className="text-sm" style={{ color: "var(--mauve)" }}>Your feedback helps us improve and your reflection has been saved.</p>
              <button onClick={onClose} className="w-full py-3 rounded-2xl font-semibold text-sm"
                style={{ backgroundColor: "var(--rose-dust)", color: "white", border: "none", cursor: "pointer" }}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}