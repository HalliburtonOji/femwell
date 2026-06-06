import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { getLastCycleDateRange, formatSymptomEcho, pickHeadline } from '@/utils/mirrorQueries';

export default function OnThisDayLastCycleCard() {
  const [pick, setPick] = useState(undefined); // undefined=loading, null=no data
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!user?.id) { if (mounted) setPick(null); return; }

      const cycleLen = user.cycle_avg_length;
      const range = getLastCycleDateRange(cycleLen);

      const [checkins, journalEntries] = await Promise.all([
        base44.entities.DailyCheckins.filter(
          { user_id: user.id, date: { $gte: range.startISO, $lte: range.endISO } },
          '-date', 5
        ).catch(() => []),
        base44.entities.JournalEntries.filter(
          { user_id: user.id, session_date: { $gte: range.startISO, $lte: range.endISO } },
          '-session_date', 3
        ).catch(() => []),
      ]);

      if (!mounted) return;
      setPick(pickHeadline({ checkins, journalEntries }));
    })();
    return () => { mounted = false; };
  }, []);

  if (pick === undefined || pick === null) return null;

  let headline = '';
  let tapRoute = createPageUrl('Today?tab=track');

  if (pick.kind === 'journal') {
    const excerpt = pick.text.slice(0, 90);
    headline = `Thirty days ago you wrote, "${excerpt}${pick.text.length > 90 ? '\u2026' : ''}"`;
    tapRoute = createPageUrl(`Journal?date=${pick.dateISO}`);
  } else if (pick.kind === 'checkin-notes' && pick.symptoms.length > 0) {
    headline = `Last cycle, around now, you noted ${formatSymptomEcho(pick.symptoms)}. Where are you today?`;
  } else if (pick.kind === 'checkin-notes') {
    const excerpt = pick.text.slice(0, 80);
    headline = `Last cycle, around now, you wrote, "${excerpt}${pick.text.length > 80 ? '\u2026' : ''}"`;
  } else if (pick.kind === 'checkin-symptom') {
    headline = `Last cycle, around now, you noted ${formatSymptomEcho(pick.symptoms)}. Where are you today?`;
  } else if (pick.kind === 'checkin-mood') {
    headline = `Last cycle this day landed at ${pick.mood}/5. And today?`;
  }

  return (
    <div
      onClick={() => navigate(tapRoute)}
      className="fw-mirror-cycle-card"
      style={{ textDecoration: 'none', display: 'block', marginBottom: 12, cursor: 'pointer' }}
    >
      <style>{`
        @keyframes fwMirrorIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fw-mirror-cycle-card > div { animation: fwMirrorIn 200ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .fw-mirror-cycle-card > div { animation: none; }
        }
      `}</style>
      <div style={{
        borderRadius: 18,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--cream-2) 100%)',
        padding: '20px 22px',
        border: '1px solid var(--ink-line)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <p style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--plum-mute)',
          marginBottom: 8,
          marginTop: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <Repeat size={14} />
          A NOTE FROM LAST CYCLE
        </p>
        <p style={{
          fontSize: 17,
          fontWeight: 400,
          fontStyle: 'italic',
          color: 'var(--plum-deep)',
          lineHeight: 1.55,
          marginBottom: 14,
          marginTop: 0,
        }}>
          {headline}
        </p>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--rose-primary)',
        }}>
          Revisit that day <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
}