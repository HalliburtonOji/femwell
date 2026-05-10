import { addMonths, addYears, differenceInDays, differenceInWeeks, differenceInMonths, parseISO, format } from 'date-fns';

export function formatCountdown(sealDateISO) {
  if (!sealDateISO) return '';
  try {
    const seal = parseISO(sealDateISO);
    const today = new Date();
    const days = differenceInDays(seal, today);
    if (days <= 0) return 'opens today';
    if (days === 1) return 'opens tomorrow';
    if (days < 14) return `opens in ${days} days`;
    if (days < 60) return `opens in ${differenceInWeeks(seal, today)} weeks`;
    if (days < 330) return `opens in ${Math.max(2, differenceInMonths(seal, today))} months`;
    return 'opens in about a year';
  } catch { return ''; }
}

export function formatLetterDate(iso) {
  if (!iso) return '';
  try { return format(parseISO(iso), 'd MMMM yyyy'); } catch { return ''; }
}

export function quickChipDates() {
  const today = new Date();
  return [
    { label: 'In 1 month', dateISO: format(addMonths(today, 1), 'yyyy-MM-dd') },
    { label: 'In 6 months', dateISO: format(addMonths(today, 6), 'yyyy-MM-dd') },
    { label: 'In 1 year', dateISO: format(addYears(today, 1), 'yyyy-MM-dd') },
  ];
}

export function readyToUnseal(letter) {
  if (!letter?.seal_date) return false;
  if (letter.unsealed_at) return false;
  const today = format(new Date(), 'yyyy-MM-dd');
  return letter.seal_date <= today;
}

export function pickUnsealedForToday(letters) {
  const candidates = (letters || []).filter(l => l?.unsealed_at && !l?.unseal_seen_at);
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => (a.unsealed_at || '').localeCompare(b.unsealed_at || ''));
  return candidates[0];
}

export function unsealEligible(letters) {
  return (letters || []).filter(readyToUnseal);
}