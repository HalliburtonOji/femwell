import { subDays, formatISO } from 'date-fns';

// Returns { startISO, endISO } for the window cycle+2 days ago through cycle days ago.
// Default cycle length 28 → start=30 days ago, end=28 days ago.
export function getLastCycleDateRange(userCycleLengthDays = 28) {
  const today = new Date();
  const cycle = Number.isFinite(userCycleLengthDays) && userCycleLengthDays > 0 ? userCycleLengthDays : 28;
  const start = subDays(today, cycle + 2);
  const end = subDays(today, cycle);
  return {
    startISO: formatISO(start, { representation: 'date' }),
    endISO: formatISO(end, { representation: 'date' }),
  };
}

// Returns { startISO, endISO } for a 7-day window centered on today minus 180 days.
export function getSixMonthDateRange() {
  const today = new Date();
  const start = subDays(today, 183);
  const end = subDays(today, 177);
  return {
    startISO: formatISO(start, { representation: 'date' }),
    endISO: formatISO(end, { representation: 'date' }),
  };
}

// Joins at most TWO symptoms in prose form.
export function formatSymptomEcho(symptoms) {
  const arr = Array.isArray(symptoms) ? symptoms.filter(Boolean) : [];
  if (arr.length === 0) return '';
  if (arr.length === 1) return String(arr[0]);
  return `${arr[0]} and ${arr[1]}`;
}

// Picks the strongest echo from a snapshot.
// Returns { kind, text, dateISO, id, mood?, symptoms? } or null.
export function pickHeadline(snapshot) {
  const journals = Array.isArray(snapshot?.journalEntries) ? snapshot.journalEntries : [];
  const checkins = Array.isArray(snapshot?.checkins) ? snapshot.checkins : [];

  const namedJournal = journals
    .filter(j => typeof j?.text === 'string' && j.text.trim().length > 40)
    .sort((a, b) => (b.session_date || '').localeCompare(a.session_date || ''))[0];
  if (namedJournal) {
    return {
      kind: 'journal',
      text: namedJournal.text.trim(),
      dateISO: namedJournal.session_date,
      id: namedJournal.id,
    };
  }

  const noteCheckin = checkins
    .filter(c => typeof c?.notes === 'string' && c.notes.trim().length > 0)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
  if (noteCheckin) {
    return {
      kind: 'checkin-notes',
      text: noteCheckin.notes.trim(),
      dateISO: noteCheckin.date,
      id: noteCheckin.id,
      symptoms: Array.isArray(noteCheckin.symptoms) ? noteCheckin.symptoms : [],
      mood: noteCheckin.mood,
    };
  }

  const symptomCheckin = checkins
    .filter(c => Array.isArray(c?.symptoms) && c.symptoms.length > 0)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
  if (symptomCheckin) {
    return {
      kind: 'checkin-symptom',
      text: '',
      dateISO: symptomCheckin.date,
      id: symptomCheckin.id,
      symptoms: symptomCheckin.symptoms,
      mood: symptomCheckin.mood,
    };
  }

  const moodCheckin = checkins
    .filter(c => Number.isFinite(c?.mood))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
  if (moodCheckin) {
    return {
      kind: 'checkin-mood',
      text: '',
      dateISO: moodCheckin.date,
      id: moodCheckin.id,
      symptoms: [],
      mood: moodCheckin.mood,
    };
  }

  return null;
}