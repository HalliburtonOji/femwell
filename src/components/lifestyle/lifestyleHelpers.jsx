import { base44 } from "@/api/base44Client";

// ── Cycle phase from UserProfile (replicates pages/Today.js logic) ──────────
export function getCyclePhase(profile) {
  if (!profile?.last_period_start_date) return null;
  const cycleLen = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length || 5;
  const last = new Date(profile.last_period_start_date);
  const today = new Date();
  const days = Math.floor((today - last) / 86400000);
  const day = (days % cycleLen) + 1;
  let phase;
  if (day <= periodLen) phase = "menstrual";
  else if (day <= Math.round(cycleLen * 0.4)) phase = "follicular";
  else if (day <= Math.round(cycleLen * 0.55)) phase = "ovulatory";
  else phase = "luteal";
  return { phase, day };
}

// ── Approximate moon phase ─────────────────────────────────────────────────
export function getMoonPhase(date = new Date()) {
  const lp = 2551443; // synodic month in seconds
  const ref = new Date(1970, 0, 7, 20, 35, 0).getTime() / 1000;
  const phase = ((date.getTime() / 1000 - ref) % lp) / lp;
  if (phase < 0.03 || phase > 0.97) return "new moon";
  if (phase < 0.22) return "waxing crescent";
  if (phase < 0.28) return "first quarter";
  if (phase < 0.47) return "waxing gibbous";
  if (phase < 0.53) return "full moon";
  if (phase < 0.72) return "waning gibbous";
  if (phase < 0.78) return "last quarter";
  return "waning crescent";
}

const VIDEO_TYPES = ["VIDEO", "TIKTOK", "INSTAGRAM", "CLIP"];
export const VIDEO_MEDIA_TYPES = VIDEO_TYPES;

// ── Get or create the user's LifestyleProfile ──────────────────────────────
export async function loadLifestyleProfile(userId) {
  if (!userId) return null;
  const existing = await base44.entities.LifestyleProfile.filter({ user_id: userId }).catch(() => []);
  if (existing[0]) return existing[0];
  return base44.entities.LifestyleProfile.create({
    user_id: userId,
    followed_topics: [],
    followed_sources: [],
    saved_item_ids: [],
    hidden_item_ids: [],
    blocked_categories: [],
    blocked_sources: [],
    category_weights: {},
  });
}

// ── Toggle save ────────────────────────────────────────────────────────────
export async function toggleSaveItem(profile, item) {
  if (!profile) return profile;
  const ids = Array.isArray(profile.saved_item_ids) ? profile.saved_item_ids : [];
  const isSaved = ids.includes(item.id);
  const next = isSaved ? ids.filter(id => id !== item.id) : [item.id, ...ids];
  const updated = await base44.entities.LifestyleProfile.update(profile.id, { saved_item_ids: next });
  await base44.entities.LifestyleInteractions.create({
    user_id: profile.user_id, item_id: item.id, action: "save",
    category: item.category, source_id: item.source_id,
    acted_at: new Date().toISOString(),
  }).catch(() => {});
  return { ...profile, ...updated, saved_item_ids: next };
}

// ── Hide item (30 day push) ────────────────────────────────────────────────
export async function hideItem(profile, item) {
  if (!profile) return profile;
  const ids = Array.isArray(profile.hidden_item_ids) ? profile.hidden_item_ids : [];
  if (ids.includes(item.id)) return profile;
  const next = [item.id, ...ids];
  const updated = await base44.entities.LifestyleProfile.update(profile.id, { hidden_item_ids: next });
  await base44.entities.LifestyleInteractions.create({
    user_id: profile.user_id, item_id: item.id, action: "hide",
    category: item.category, source_id: item.source_id,
    acted_at: new Date().toISOString(),
  }).catch(() => {});
  return { ...profile, ...updated, hidden_item_ids: next };
}

// ── Toggle follow source ───────────────────────────────────────────────────
export async function toggleFollowSource(profile, sourceId) {
  if (!profile) return profile;
  const ids = Array.isArray(profile.followed_sources) ? profile.followed_sources : [];
  const isFollowed = ids.includes(sourceId);
  const next = isFollowed ? ids.filter(id => id !== sourceId) : [...ids, sourceId];
  const updated = await base44.entities.LifestyleProfile.update(profile.id, { followed_sources: next });
  return { ...profile, ...updated, followed_sources: next };
}

// ── Bump category weight ───────────────────────────────────────────────────
export async function bumpCategoryWeight(profile, category) {
  if (!profile || !category) return profile;
  const weights = { ...(profile.category_weights || {}) };
  weights[category] = (weights[category] || 0) + 0.05;
  const updated = await base44.entities.LifestyleProfile.update(profile.id, { category_weights: weights });
  return { ...profile, ...updated, category_weights: weights };
}

// ── Log a generic interaction (open / try_this / share) ───────────────────
export async function logInteraction(profile, item, action) {
  if (!profile?.user_id || !item?.id) return;
  await base44.entities.LifestyleInteractions.create({
    user_id: profile.user_id, item_id: item.id, action,
    category: item.category, source_id: item.source_id,
    acted_at: new Date().toISOString(),
  }).catch(() => {});
}

// ── Compute a personalised ranking key (does NOT mutate engagement_score) ──
export function rankKey(item, profile, currentPhase) {
  let score = item.engagement_score || 0;
  if (Array.isArray(item.phase_tags) && currentPhase && item.phase_tags.includes(currentPhase)) score += 1; // phase match wins
  if (Array.isArray(profile?.followed_sources) && profile.followed_sources.includes(item.source_id)) score += 0.15;
  if (item.is_editor_pick) score += 0.05;
  return score;
}