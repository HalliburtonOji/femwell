import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import SavedItemCard from "@/components/saved/SavedItemCard";
import { Bookmark, BookMarked } from "lucide-react";
import { pickProfile } from "@/utils/userProfile";
import { parseSavedMeta } from "@/lib/savedItems";

import { mergeSavedCollections, readOwnerSavedRows } from "@/lib/savedCollections";
export { savedReturnRoute, mergeSavedCollections } from "@/lib/savedCollections";

const BASE_TABS = [
  { id: "ADVICE",    label: "Advice"    },
  { id: "LIFESTYLE", label: "Lifestyle" },
  { id: "CONTENT",   label: "Sessions"  },
  { id: "PROGRAM",   label: "Programs"  },
  { id: "JOURNAL",   label: "Journal"   },
];

const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "20px", boxShadow: "var(--shadow-sm)",
};
const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", };

export default function Saved() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState([]);
  const [removeError, setRemoveError] = useState("");
  const [removing, setRemoving] = useState(null);
  const removingRef = useRef(false);
  const generation = useRef(0);
  const [tab, setTab] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get("tab")?.toUpperCase();
    return BASE_TABS.some(item => item.id === requested) || requested === "EVENT" ? requested : "ADVICE";
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true); setErrors([]);
      try {
        const currentUser = await base44.auth.me();
        if (request !== generation.current) return;
        setUser(currentUser);
        const [savedRead, profileRead] = await Promise.allSettled([
          readOwnerSavedRows(currentUser.id),
          base44.entities.UserProfile.filter({ user_id: currentUser.id }),
        ]);
        const messages = [];
        if (savedRead.status === "rejected") messages.push("Some saves couldn’t load.");
        if (profileRead.status === "rejected") messages.push("Your Lifestyle keeps couldn’t load.");
        const saved = savedRead.status === "fulfilled" ? savedRead.value.filter(row => row.user_id === currentUser.id) : [];
        const profile = profileRead.status === "fulfilled" ? pickProfile(profileRead.value.filter(row => row.user_id === currentUser.id)) : null;
        const ids = [...new Set([
          ...(Array.isArray(profile?.saved_item_ids) ? profile.saved_item_ids : []),
          ...saved.filter(row => row.item_type === "LIFESTYLE" && parseSavedMeta(row)?.kind !== "sky-lesson").map(row => row.item_id),
        ].filter(id => typeof id === "string" && id))];
        const resolutions = new Map();
        // Exact-ID reads also find keeps outside the ranked/capped Lifestyle feed.
        for (let start = 0; start < ids.length; start += 6) {
          const batch = ids.slice(start, start + 6);
          const resolved = await Promise.allSettled(batch.map(id => base44.entities.LifestyleItems.filter({ id }, undefined, 1)));
          resolved.forEach((result, index) => resolutions.set(batch[index], result.status === "fulfilled"
            ? { item: result.value.find(row => row.id === batch[index]) || null } : { error: true }));
          if (request !== generation.current) return;
        }
        if (request !== generation.current) return;
        setItems(mergeSavedCollections(saved, profile, resolutions)); setErrors(messages);
      } catch (err) {
        if (request === generation.current) { setItems([]); setErrors(["Your saves couldn’t open. Sign in, or try again."]); }
      } finally {
        if (request === generation.current) setLoading(false);
      }
  }, []);
  useEffect(() => { load(); return () => { generation.current++; }; }, [load]);

  const tabs = useMemo(() => {
    const extra = tab === "EVENT" || items.some((item) => item.item_type === "EVENT") ? [{ id: "EVENT", label: "Events" }] : [];
    return [...BASE_TABS, ...extra];
  }, [items, tab]);

  const visibleItems = items.filter((item) => item.item_type === tab);

  const removeItem = async (item) => {
    if (!user?.id || removingRef.current || item.user_id !== user.id) return;
    removingRef.current = true; setRemoving(item.id); setRemoveError("");
    try {
      for (const record of item._savedRecords || []) {
        if (record.user_id !== user.id) throw new Error("Owner changed");
        await base44.entities.SavedItems.delete(record.id);
      }
      if (item._profileId) {
        const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
        const ownerProfile = profiles.find(row => row.id === item._profileId && row.user_id === user.id);
        if (!ownerProfile) throw new Error("Profile unavailable");
        await base44.entities.UserProfile.update(ownerProfile.id, { saved_item_ids: (ownerProfile.saved_item_ids || []).filter(id => id !== item.item_id) });
      }
      setItems(current => current.filter(entry => entry.id !== item.id));
      window.dispatchEvent(new CustomEvent("fw_sky_lesson_saved"));
    } catch {
      setRemoveError("That save couldn’t be removed completely. Try again.");
      await load(); // Read back any successful part; never restore a row already removed remotely.
    } finally { removingRef.current = false; setRemoving(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="mx-auto max-w-4xl px-4 pt-12 md:px-6">

        <div style={{ ...card, padding: "20px", marginBottom: "16px" }}>
          <p style={{ ...sLabel, marginBottom: "8px" }}>Your library</p>
          <h1 className="fw-display">
            Saved
          </h1>
          <p style={{ fontSize: "13px", color: "var(--mauve)", marginTop: "6px" }}>
            Advice, lifestyle finds, sessions, and programs.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" style={{ marginBottom: "16px" }}>
          {tabs.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{
                borderRadius: "9999px", padding: "7px 16px",
                fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer",
                border: tab === item.id ? "none" : "1px solid var(--border)",
                backgroundColor: tab === item.id ? "var(--plum)" : "var(--surface)",
                color: tab === item.id ? "white" : "var(--mauve)"
              }}>
              {item.label}
            </button>
          ))}
        </div>

        {errors.length > 0 && <div role="alert" style={{ ...card, padding: 16, marginBottom: 16 }}>{errors.map(message => <p key={message}>{message}</p>)}<button onClick={load}>Try again</button></div>}
        {removeError && <p role="alert">{removeError}</p>}
        {visibleItems.length === 0 && errors.length === 0 ? (
          <div style={{ ...card, padding: "40px 20px", textAlign: "center", marginTop: "8px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px",
              backgroundColor: "var(--rose-dust-subtle)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <Bookmark className="w-5 h-5" style={{ color: "var(--rose-dust)" }} />
            </div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--plum)", }}>Nothing saved here yet</p>
            <p style={{ fontSize: "13px", color: "var(--mauve)", marginTop: "4px" }}>
              {tab === "LIFESTYLE"
                ? (<><BookMarked className="w-3.5 h-3.5" style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} aria-hidden="true" />Nothing saved yet — tap the bookmark icon on any article to save it here.</>)
                : "When you save something around the app, it appears here."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleItems.map((item) => (
              <div key={item.id} aria-busy={removing === item.id} style={removing === item.id ? { pointerEvents: "none", opacity: 0.7 } : undefined}>
                {item._href ? <SavedItemCard item={item} onRemove={removeItem} user={user} disabled={!!removing} /> : <div style={{ ...card, padding: 16 }}><h3>{item.title}</h3>{item.preview_text && <p>{item.preview_text}</p>}<p role={item._unavailable?.includes("couldn’t") ? "alert" : undefined}>{item._unavailable || "The original link isn’t available."}</p><div style={{ display: "flex", gap: 16 }}><button onClick={load}>Try again</button><button onClick={() => removeItem(item)} disabled={!!removing}>Remove this save</button></div></div>}
                {removing === item.id && <p role="status">Removing this save…</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
