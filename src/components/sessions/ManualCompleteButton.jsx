import { useState } from "react";
import { CheckCircle, Undo2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ManualCompleteButton({ item, user, source = "CONTENT_PLAYER", durationSeconds = 0, onDone }) {
  const [state, setstate] = useState("idle"); // idle | saving | done | undoing
  const [recordId, setRecordId] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);

  const handleComplete = async () => {
    setstate("saving");
    const res = await base44.functions.invoke("markSessionComplete", {
      content_id: item.id,
      content_key: item.content_key,
      duration_seconds: durationSeconds,
      target_seconds: item.target_seconds || 0,
      completion_source: source,
    });
    const id = res.data?.record?.id;
    setRecordId(id);
    setstate("done");
    if (onDone) onDone(res.data?.record);

    // Undo window: 8 seconds
    const t = setTimeout(() => {
      setUndoTimer(null);
    }, 8000);
    setUndoTimer(t);
  };

  const handleUndo = async () => {
    if (undoTimer) clearTimeout(undoTimer);
    setUndoTimer(null);
    if (recordId) {
      await base44.entities.ContentHistory.update(recordId, { is_deleted: true });
    }
    setstate("idle");
    setRecordId(null);
  };

  if (state === "done") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Logged ✓
        </div>
        {undoTimer && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-gray-100 text-gray-500 text-xs hover:bg-gray-200 transition-colors"
          >
            <Undo2 className="w-3 h-3" /> Undo
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={state === "saving"}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-100 text-rose-600 text-sm font-medium hover:bg-rose-200 transition-colors disabled:opacity-60"
    >
      <CheckCircle className="w-4 h-4" />
      {state === "saving" ? "Saving..." : "Mark as Complete"}
    </button>
  );
}