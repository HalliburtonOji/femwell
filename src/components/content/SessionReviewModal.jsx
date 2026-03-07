import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Star, X, BookOpen, Loader2 } from "lucide-react";

const MOOD_OPTIONS = [
  { value: 1, label: "😞", desc: "Low" },
  { value: 2, label: "😐", desc: "Okay" },
  { value: 3, label: "🙂", desc: "Good" },
  { value: 4, label: "😊", desc: "Great" },
  { value: 5, label: "🌟", desc: "Amazing" },
];

const SUGGESTED_TAGS = ["calm", "focused", "peaceful", "energised", "emotional", "grateful", "sleepy", "clear-headed"];

export default function SessionReviewModal({ item, user, onClose }) {
  const [step, setStep] = useState("rating"); // "rating" | "journal" | "done"
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [review, setReview] = useState("");
  const [mood, setMood] = useState(null);
  const [journalText, setJournalText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const saveRating = async () => {
    if (!stars) return;
    setSaving(true);
    await base44.entities.ContentRatings.create({
      user_id: user.id,
      content_id: item.id,
      content_key: item.content_key || "",
      stars,
      review: review.trim(),
    });
    setSaving(false);
    setStep("journal");
  };

  const saveJournal = async () => {
    setSaving(true);
    if (journalText.trim() || mood) {
      await base44.entities.JournalEntries.create({
        user_id: user.id,
        content_id: item.id,
        content_key: item.content_key || "",
        session_date: new Date().toISOString(),
        text: journalText.trim(),
        mood_rating: mood || undefined,
        tags: selectedTags.join(", "),
      });
    }
    setSaving(false);
    setStep("done");
  };

  const skipJournal = () => setStep("done");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-semibold text-gray-700">
              {step === "rating" ? "Rate your session" : step === "journal" ? "Journal" : "All done!"}
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        <div className="px-5 pb-6 pt-3">

          {/* ── RATING STEP ── */}
          {step === "rating" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-gray-400 -mt-1">How was <span className="font-medium text-gray-600">{item.title}</span>?</p>

              {/* Stars */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onMouseEnter={() => setHoverStars(s)}
                    onMouseLeave={() => setHoverStars(0)}
                    onClick={() => setStars(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className="w-9 h-9"
                      fill={(hoverStars || stars) >= s ? "#f59e0b" : "none"}
                      stroke={(hoverStars || stars) >= s ? "#f59e0b" : "#d1d5db"}
                    />
                  </button>
                ))}
              </div>

              {/* Optional text review */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Leave a note (optional)</label>
                <textarea
                  rows={3}
                  placeholder="What did you enjoy? Any thoughts…"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              <button
                onClick={saveRating}
                disabled={!stars || saving}
                className="w-full py-3 rounded-2xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? "Saving…" : "Submit Rating"}
              </button>

              <button onClick={skipJournal} className="text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Skip
              </button>
            </div>
          )}

          {/* ── JOURNAL STEP ── */}
          {step === "journal" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-gray-400 -mt-1">Take a moment to capture how you feel.</p>

              {/* Mood */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Your mood right now</label>
                <div className="flex justify-between gap-1">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      className={`flex flex-col items-center gap-0.5 flex-1 py-2 rounded-xl border transition-all ${
                        mood === m.value
                          ? "border-rose-400 bg-rose-50"
                          : "border-gray-100 bg-gray-50 hover:border-rose-200"
                      }`}
                    >
                      <span className="text-xl">{m.label}</span>
                      <span className="text-[10px] text-gray-500">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal text */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Write your thoughts</label>
                <textarea
                  rows={4}
                  placeholder="How do you feel after this session? Any insights, sensations or reflections…"
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-rose-500 text-white"
                          : "bg-rose-50 text-rose-400 hover:bg-rose-100"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={saveJournal}
                disabled={saving}
                className="w-full py-3 rounded-2xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? "Saving…" : "Save Journal Entry"}
              </button>

              <button onClick={skipJournal} className="text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Skip journaling
              </button>
            </div>
          )}

          {/* ── DONE STEP ── */}
          {step === "done" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="text-5xl">🌸</div>
              <p className="font-semibold text-gray-800">Thank you!</p>
              <p className="text-sm text-gray-400">Your feedback helps us improve and your reflection has been saved.</p>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}