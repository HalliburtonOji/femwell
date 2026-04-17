/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// 5 categories, 5+ books each — one book per category per weekly pick
const BOOK_POOL = {
  fiction: [
    { title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', isbn: '9780593321201', phase_tags: ['follicular', 'ovulatory'] },
    { title: 'The Vanishing Half', author: 'Brit Bennett', isbn: '9780525536291', phase_tags: ['follicular', 'ovulatory'] },
    { title: 'Normal People', author: 'Sally Rooney', isbn: '9780571334650', phase_tags: ['ovulatory', 'follicular'] },
    { title: 'Circe', author: 'Madeline Miller', isbn: '9780316556347', phase_tags: ['menstrual', 'luteal'] },
    { title: 'Tenth of December', author: 'George Saunders', isbn: '9780812984255', phase_tags: ['menstrual', 'luteal'] },
    { title: 'A Little Life', author: 'Hanya Yanagihara', isbn: '9780804172707', phase_tags: ['menstrual', 'luteal'] },
    { title: 'Pachinko', author: 'Min Jin Lee', isbn: '9781455563937', phase_tags: ['follicular', 'ovulatory'] },
  ],
  selfhelp: [
    { title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292', phase_tags: ['follicular', 'ovulatory'] },
    { title: 'The Body Keeps the Score', author: 'Bessel van der Kolk', isbn: '9780143127741', phase_tags: ['menstrual', 'luteal'] },
    { title: 'Attached', author: 'Amir Levine & Rachel Heller', isbn: '9781250310897', phase_tags: ['ovulatory', 'follicular'] },
    { title: 'Maybe You Should Talk to Someone', author: 'Lori Gottlieb', isbn: '9781328662057', phase_tags: ['menstrual', 'luteal'] },
    { title: 'Mindset', author: 'Carol S. Dweck', isbn: '9780345472328', phase_tags: ['follicular', 'ovulatory'] },
    { title: 'The Mountain Is You', author: 'Brianna Wiest', isbn: '9781949759228', phase_tags: ['follicular', 'ovulatory'] },
    { title: 'Set Boundaries Find Peace', author: 'Nedra Tawwab', isbn: '9780593192399', phase_tags: ['luteal', 'menstrual'] },
  ],
  relationships: [
    { title: 'All About Love', author: 'bell hooks', isbn: '9780060959470', phase_tags: ['ovulatory', 'follicular'] },
    { title: 'Hold Me Tight', author: 'Sue Johnson', isbn: '9780316113007', phase_tags: ['ovulatory', 'luteal'] },
    { title: 'The Whole-Brain Child', author: 'Daniel J. Siegel & Tina Payne Bryson', isbn: '9780553386691', phase_tags: ['follicular', 'luteal'] },
    { title: 'Hunt Gather Parent', author: 'Michaeleen Doucleff', isbn: '9781982149680', phase_tags: ['follicular', 'ovulatory'] },
    { title: 'Mating in Captivity', author: 'Esther Perel', isbn: '9780060753641', phase_tags: ['ovulatory', 'follicular'] },
    { title: 'The Seven Principles for Making Marriage Work', author: 'John Gottman', isbn: '9780553447712', phase_tags: ['ovulatory', 'luteal'] },
    { title: 'Come As You Are', author: 'Emily Nagoski', isbn: '9781476762098', phase_tags: ['ovulatory', 'follicular'] },
  ],
  career: [
    { title: 'Big Magic', author: 'Elizabeth Gilbert', isbn: '9781594634727', phase_tags: ['follicular', 'ovulatory'] },
    { title: 'Deep Work', author: 'Cal Newport', isbn: '9781455586691', phase_tags: ['follicular', 'ovulatory'] },
    { title: 'The Psychology of Money', author: 'Morgan Housel', isbn: '9780857197689', phase_tags: ['follicular', 'ovulatory'] },
    { title: 'Bird by Bird', author: 'Anne Lamott', isbn: '9780385480017', phase_tags: ['menstrual', 'luteal'] },
    { title: 'The Multi-Hyphen Method', author: 'Emma Gannon', isbn: '9781473685987', phase_tags: ['follicular', 'ovulatory'] },
    { title: 'Get Good with Money', author: 'Tiffany Aliche', isbn: '9780593187562', phase_tags: ['follicular', 'ovulatory'] },
    { title: 'You Are a Badass at Making Money', author: 'Jen Sincero', isbn: '9780735223134', phase_tags: ['follicular', 'ovulatory'] },
  ],
  wellness: [
    { title: 'Period Power', author: 'Maisie Hill', isbn: '9781472967886', phase_tags: ['menstrual', 'follicular', 'ovulatory', 'luteal'] },
    { title: 'In the FLO', author: 'Alisa Vitti', isbn: '9780062876959', phase_tags: ['menstrual', 'follicular', 'ovulatory', 'luteal'] },
    { title: 'Burnout', author: 'Emily & Amelia Nagoski', isbn: '9781984818324', phase_tags: ['luteal', 'menstrual'] },
    { title: 'Why We Sleep', author: 'Matthew Walker', isbn: '9781501144325', phase_tags: ['luteal', 'menstrual'] },
    { title: 'Outlive', author: 'Peter Attia', isbn: '9780593236598', phase_tags: ['follicular', 'ovulatory'] },
    { title: 'Untamed', author: 'Glennon Doyle', isbn: '9781984801258', phase_tags: ['follicular', 'ovulatory'] },
    { title: 'Roar', author: 'Stacy Sims', isbn: '9781623366179', phase_tags: ['follicular', 'ovulatory'] },
  ],
};

const CATEGORIES = ['fiction', 'selfhelp', 'relationships', 'career', 'wellness'];

const CATEGORY_LABELS = {
  fiction: 'Fiction',
  selfhelp: 'Self-help & Psychology',
  relationships: 'Relationships & Parenting',
  career: 'Career, Money & Creativity',
  wellness: "Women's Wellness",
};

function getWeekStart(offsetWeeks = 0) {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff + offsetWeeks * 7);
  return d.toISOString().slice(0, 10);
}

function pickBooksForWeek(weekStart) {
  const [y, m, dd] = weekStart.split('-').map(Number);
  const weekNum = Math.floor(new Date(y, m - 1, dd).getTime() / (7 * 24 * 3600 * 1000));
  return CATEGORIES.map((cat, i) => {
    const pool = BOOK_POOL[cat];
    const idx = (weekNum + i * 3) % pool.length;
    return { ...pool[idx], category: cat, category_label: CATEGORY_LABELS[cat] };
  });
}

async function generateBookCard(base44, book) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a book editor for FemWell, a women's wellness app. Write a summary card for "${book.title}" by ${book.author} (category: ${book.category_label}).

Return JSON:
- tagline: one punchy sentence that sells this book (max 80 chars)
- summary: 2–3 sentences covering the core message and why women will love it (max 280 chars)
- key_lessons: array of exactly 4 strings, each a specific actionable insight (1–2 sentences)
- best_for: one sentence starting with "You'll love this if..." (max 100 chars)
- quote: one memorable real quote from the book
- read_time_mins: estimated reading time in minutes (fiction: 420–600, non-fiction: 280–420)
- femwell_connection: one sentence connecting this book to a FemWell feature (Journal, Cycle Tracking, Programs, Nutrition, Check-in, Pulse)
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
  return {
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    category: book.category,
    category_label: book.category_label,
    phase_tags: book.phase_tags,
    cover_url: book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg` : null,
    tagline: result.tagline || '',
    summary: result.summary || '',
    key_lessons: result.key_lessons || [],
    best_for: result.best_for || '',
    quote: result.quote || '',
    read_time_mins: result.read_time_mins || 360,
    femwell_connection: result.femwell_connection || '',
    goodreads_url: result.goodreads_url || '',
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const weeksAhead = body.weeks_ahead ?? 1; // how many weeks to generate (default 1)

    const results = [];

    for (let w = 0; w < weeksAhead; w++) {
      const weekStart = getWeekStart(w);
      const existing = await base44.asServiceRole.entities.WeeklyBookPick.filter({ week_start: weekStart });
      if (existing.length > 0 && existing[0].status === 'PUBLISHED' && !body.force) {
        results.push({ week_start: weekStart, skipped: true });
        continue;
      }

      const picks = pickBooksForWeek(weekStart);
      const generatedBooks = [];
      for (const book of picks) {
        try {
          const card = await generateBookCard(base44, book);
          generatedBooks.push(card);
        } catch (e) {
          console.error(`Failed ${book.title}:`, e.message);
        }
      }

      if (existing.length > 0) {
        await base44.asServiceRole.entities.WeeklyBookPick.update(existing[0].id, { books: generatedBooks, status: 'PUBLISHED', updated_at: new Date().toISOString() });
      } else {
        await base44.asServiceRole.entities.WeeklyBookPick.create({ week_start: weekStart, books: generatedBooks, status: 'PUBLISHED', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      }
      results.push({ week_start: weekStart, books_generated: generatedBooks.length });
    }

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});