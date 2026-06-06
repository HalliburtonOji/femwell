import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { getSixMonthDateRange, pickHeadline } from '@/utils/mirrorQueries';

export default function FriendFrom6MonthsAgoCard() {
  const [pick, setPick] = useState(undefined); // undefined=loading, null=no data
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!user?.id) { if (mounted) setPick(null); return; }

      const range = getSixMonthDateRange();

      const [journalEntries, checkins] = await Promise.all([
        base44.entities.JournalEntries.filter(
          { user_id: user.id, session_date: { $gte: range.startISO, $lte: range.endISO } },
          '-session_date', 3
        ).catch(() => []),
        base44.entities.DailyCheckins.filter(
          { user_id: user.id, date: { $gte: range.startISO, $lte: range.endISO } },
          '-date', 3
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
    const excerpt = pick.text.slice(0, 60);
    headline = `Six months ago you wrote about ${excerpt}${pick.text.length > 60 ? '\u2026' : ''} Where are you with that now?`;
    tapRoute = createPageUrl(`Journal?date=${pick.dateISO}`);
  } else if (pick.kind === 'checkin-notes' && pick.text) {
    const excerpt = pick.text.slice(0, 60);
    headline = `Six months ago you wrote, "${excerpt}${pick.text.length > 60 ? '\u2026' : ''}" Where are you with that now?`;
  } else {
    headline = 'Six months ago, this same day. Want to see who you were then?';
  }

  return (
    <div
      onClick={() => navigate(tapRoute)}
      className="fw-mirror-6m-card"
      style={{ textDecoration: 'none', display: 'block', marginBottom: 12, cursor: 'pointer' }}
    >
      <style>{`
        @keyframes fwMirror6mIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fw-mirror-6m-card > div { animation: fwMirror6mIn 200ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .fw-mirror-6m-card > div { animation: none; }
        }
      `}</style>
      <div style={{
        borderRadius: 18,
        overflow: 'hidden',
        background: 'linear-gradient(315deg, var(--cream-2) 0%, var(--rose-soft-bg) 100%)',
        padding: '20px 22px 24px',
        border: '1px solid var(--ink-line)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <p style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--mauve)',
          marginBottom: 8,
          marginTop: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <History size={14} />
          SIX MONTHS BACK
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
          Open that day <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
}