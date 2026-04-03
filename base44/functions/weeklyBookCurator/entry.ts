import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BOOK_SEED_LIST = [
  { title: 'Untamed', author: 'Glennon Doyle', isbn: '9781984801258', category: 'Self Care', phase_tags: ['follicular', 'ovulatory'] },
  { title: 'In the FLO', author: 'Alisa Vitti', isbn: '9780062876959', category: 'Hormones & Cycle', phase_tags: ['menstrual', 'follicular', 'ovulatory', 'luteal'] },
  { title: 'Period Power', author: 'Maisie Hill', isbn: '9781472967886', category: 'Hormones & Cycle', phase_tags: ['menstrual', 'follicular', 'ovulatory', 'luteal'] },
  { title: 'Burnout', author: 'Emily Nagoski & Amelia Nagoski', isbn: '9781984818324', category: 'Stress', phase_tags: ['luteal', 'menstrual'] },
  { title: 'The Body Keeps the Score', author: 'Bessel van der Kolk', isbn: '9780143127741', category: 'Mental Health', phase_tags: ['menstrual', 'luteal'] },
  { title: 'Come As You Are', author: 'Emily Nagoski', isbn: '9781476762098', category: 'Body Image', phase_tags: ['ovulatory', 'follicular'] },
  { title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292', category: 'Lifestyle', phase_tags: ['follicular', 'ovulatory'] },
  { title: 'The Gifts of Imperfection', author: 'Brene Brown', isbn: '9781592858491', category: 'Mental Health', phase_tags: ['menstrual', 'luteal'] },
  { title: 'Woman Code', author: 'Alisa Vitti', isbn: '9780062130792', category: 'Hormones & Cycle', phase_tags: ['menstrual', 'follicular', 'ovulatory', 'luteal'] },
  { title: 'Why We Sleep', author: 'Matthew Walker', isbn: '9781501144325', category: 'Sleep', phase_tags: ['luteal', 'menstrual'] },
  { title: 'Outlive', author: 'Peter Attia', isbn: '9780593236598', category: 'Womens Health', phase_tags: ['follicular', 'ovulatory'] },
  { title: 'The Body Is Not an Apology', author: 'Sonya Renee Taylor', isbn: '9781626569775', category: 'Body Image', phase_tags: ['menstrual', 'luteal'] },
  { title: 'Maybe You Should Talk to Someone', author: 'Lori Gottlieb', isbn: '9781328662057', category: 'Mental Health', phase_tags: ['menstrual', 'luteal'] },
  { title: 'The Mountain Is You', author: 'Brianna Wiest', isbn: '9781949759228', category: 'Self Care', phase_tags: ['follicular', 'ovulatory'] },
  { title: 'Quit Like a Woman', author: 'Holly Whitaker', isbn: '9780525561828', category: 'Lifestyle', phase_tags: ['menstrual', 'follicular'] },
  { title: 'Roar', author: 'Stacy Sims', isbn: '9781623366179', category: 'Fitness', phase_tags: ['follicular', 'ovulatory'] },
  { title: 'Attached', author: 'Amir Levine & Rachel Heller', isbn: '9781250310897', category: 'Relationships', phase_tags: ['ovulatory', 'follicular'] },
  { title: 'The Hormone Cure', author: 'Sara Gottfried', isbn: '9781451666946', category: 'Hormones & Cycle', phase_tags: ['menstrual', 'luteal'] },
  { title: 'How Not to Die', author: 'Michael Greger', isbn: '9781250066114', category: 'Nutrition', phase_tags: ['follicular', 'ovulatory'] },
  { title: 'Eat to Beat Disease', author: 'William Li', isbn: '9781538714621', category: 'Nutrition', phase_tags: ['follicular', 'ovulatory'] },
];

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

function pickBooksForWeek(weekStart) {
  const [y, m, d] = weekStart.split('-').map(Number);
  const weekNum = Math.floor(new Date(y, m - 1, d).getTime() / (7 * 24 * 3600 * 1000));
  const offset = (weekNum * 5) % BOOK_SEED_LIST.length;
  return Array.from({ length: 5 }, (_, i) => BOOK_SEED_LIST[(offset + i) % BOOK_SEED_LIST.length]);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const weekStart = getWeekStart();
    const existing = await base44.asServiceRole.entities.WeeklyBookPick.filter({ week_start: weekStart });
    if (existing.length > 0 && existing[0].status === 'PUBLISHED') {
      return Response.json({ message: 'Already published', week_start: weekStart });
    }

    const picks = pickBooksForWeek(weekStart);
    const generatedBooks = [];

    for (const book of picks) {
      try {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a women's wellness book editor for the FemWell app. Write a summary card for "${book.title}" by ${book.author}.

Return JSON with these exact fields:
- tagline: one sentence that sells this book (max 80 chars, no quotes)
- summary: 3 sentences covering the core message for women (max 300 chars total)
- key_lessons: array of exactly 5 strings, each a specific actionable insight (1-2 sentences each)
- best_for: one sentence starting with "You will love this if..." (max 100 chars)
- quote: one memorable real quote from the book
- read_time_mins: estimated reading time in minutes (typical non-fiction is 300 to 360)
- femwell_connection: which FemWell feature connects to this book, one of: Journal, Cycle Tracking, Programs, Nutrition, Skin and Hair, Check-in, Pulse
- goodreads_url: https://www.goodreads.com/search?q=${encodeURIComponent(book.title + ' ' + book.author)}`,
          response_json_schema: {
            type: 'object',
            properties: {
              tagline: { type: 'string' },
              summary: { type: 'string' },
              key_lessons: { type: 'array', items: { type: 'string' } },
              best_for: { type: 'string' },
              quote: { type: 'string' },
              read_time_mins: { type: 'number' },
              femwell_connection: { type: 'string' },
              goodreads_url: { type: 'string' },
            },
          },
        });
        generatedBooks.push({
          title: book.title, author: book.author, isbn: book.isbn,
          category: book.category, phase_tags: book.phase_tags,
          cover_url: `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`,
          tagline: result.tagline || '', summary: result.summary || '',
          key_lessons: result.key_lessons || [], best_for: result.best_for || '',
          quote: result.quote || '', read_time_mins: result.read_time_mins || 300,
          femwell_connection: result.femwell_connection || '',
          goodreads_url: result.goodreads_url || `https://www.goodreads.com/search?q=${encodeURIComponent(book.title)}`,
        });
      } catch (e) { console.error(`Failed ${book.title}:`, e.message); }
    }

    if (existing.length > 0) {
      await base44.asServiceRole.entities.WeeklyBookPick.update(existing[0].id, { books: generatedBooks, status: 'PUBLISHED' });
    } else {
      await base44.asServiceRole.entities.WeeklyBookPick.create({ week_start: weekStart, books: generatedBooks, status: 'PUBLISHED' });
    }

    return Response.json({ week_start: weekStart, books_generated: generatedBooks.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});