// fmtDuration — the ONE human-duration formatter for every Lifestyle surface.
//
// Some ingested rows store `duration_label` as RAW SECONDS ("2700") instead of a real label,
// so printing `duration_label` verbatim leaks "2700" / "3242" onto cards. This trusts a label
// only when it is genuinely a label (contains a non-digit), otherwise formats seconds → "45 min".
// Every board, the shell, the media players and the listen grid import THIS — never re-implement
// it inline, or a raw-seconds label leaks again (it has, twice).
export function fmtDuration(item) {
  if (!item) return "";
  const dl = item.duration_label;
  const dlStr = dl == null ? "" : String(dl).trim();
  if (dlStr && !/^\d+$/.test(dlStr)) return dlStr;          // a real label like "45 min" / "1h 12m"
  const s = Number(item.duration_seconds || (/^\d+$/.test(dlStr) ? dlStr : 0)) || 0;
  if (!s) return "";
  const m = Math.round(s / 60);
  if (m < 1) return "1 min";
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ""}`.trim() : `${m} min`;
}

export default fmtDuration;
