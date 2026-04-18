// Browser Blob download helper
export function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function todayStamp() {
  return new Date().toISOString().split("T")[0];
}

// Escape a single value for CSV output
function csvCell(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows, headers) {
  const head = headers.join(",");
  const body = rows.map((r) => headers.map((h) => csvCell(r[h])).join(",")).join("\n");
  return head + "\n" + body;
}

// Cycle-day calculation (matches rest of app)
export function cycleDayFor(dateStr, lastPeriodStart, cycleLen = 28) {
  if (!lastPeriodStart) return null;
  const d = new Date(dateStr);
  const start = new Date(lastPeriodStart);
  const diff = Math.floor((d - start) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  return (diff % cycleLen) + 1;
}

// Filter a list of date-bearing records to the last N months
export function withinLastMonths(items, months, dateField = "date") {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return items.filter((it) => {
    const v = it[dateField];
    if (!v) return false;
    return new Date(v) >= cutoff;
  });
}