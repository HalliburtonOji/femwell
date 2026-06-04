// journalDates — shared date + cycle-day helpers for the Journal surfaces.
//
// Entries don't store a cycle_day field, so Cycle Mirror derives the cycle
// day each entry was *written* on from its date and the user's cycle math
// (same modular algorithm as computeCycleDay, applied to an arbitrary date).

import { parseISO, format, differenceInDays } from "date-fns";

// Best available Date for an entry (session_date is a YYYY-MM-DD string;
// created_date is base44's ISO timestamp; created_at is our own).
export function entryDateObj(entry) {
  if (!entry) return null;
  try {
    if (entry.session_date) return parseISO(entry.session_date);
    if (entry.created_date) return new Date(entry.created_date);
    if (entry.created_at) return new Date(entry.created_at);
  } catch { /* fall through */ }
  return null;
}

// Best available *timestamped* Date for an entry — prefers the real ISO
// timestamps (created_date / created_at) over session_date, which is date-only
// (YYYY-MM-DD) and parses to midnight. Used for the time-of-day label so a
// One-line entry shows its true time instead of "00:00".
export function entryTimeObj(entry) {
  if (!entry) return null;
  try {
    if (entry.created_date) return new Date(entry.created_date);
    if (entry.created_at) return new Date(entry.created_at);
  } catch { /* fall through */ }
  return null;
}

// The cycle day a given calendar date falls on, given the profile's cycle.
// Returns null when there is no period anchor yet.
export function cycleDayForDate(dateObj, profile) {
  if (!dateObj || !profile?.last_period_start_date) return null;
  try {
    const cycleLen = profile.cycle_avg_length || 28;
    const start = new Date(profile.last_period_start_date); start.setHours(0, 0, 0, 0);
    const d = new Date(dateObj); d.setHours(0, 0, 0, 0);
    const raw = Math.floor((d - start) / 86400000) + 1;
    if (raw < 1) {
      // date is before the anchor — wrap backwards onto the cycle
      const norm = ((raw - 1) % cycleLen + cycleLen) % cycleLen + 1;
      return norm;
    }
    return ((raw - 1) % cycleLen + cycleLen) % cycleLen + 1;
  } catch { return null; }
}

// Editorial relative date label ("Today · 09:42", "Yesterday", "4 days ago",
// then an absolute UK date once it's older than a week).
export function relativeDate(entry) {
  const d = entryDateObj(entry);
  if (!d) return "";
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const day = new Date(d); day.setHours(0, 0, 0, 0);
    const diff = differenceInDays(today, day);
    if (diff <= 0) {
      // Time must come from a real timestamp, not session_date (date-only ->
      // midnight), otherwise a One-line entry reads "Today · 00:00".
      const t = entryTimeObj(entry);
      return t ? `Today · ${format(t, "HH:mm")}` : "Today";
    }
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return format(d, "d MMMM");
  } catch { return ""; }
}
