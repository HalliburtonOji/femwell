import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Generates 10 pieces of readable content weekly:
// 5 articles + 3 short stories + 2 book summaries
// Also handles user custom requests (2/week limit)

const ARTICLE_TOPICS = [
  { category: "Hormones & Cycle", phase_tags: ["menstrual"], hint: "How oestrogen dropping in your menstrual phase affects your energy, skin and mood" },
  { category: "Hormones & Cycle", phase_tags: ["follicular"], hint: "The follicular phase window: why this is your most productive, creative week" },
  { category: "Hormones & Cycle", phase_tags: ["ovulatory"], hint: "Ovulation and the testosterone surge: what really happens to your confidence and libido" },
  { category: "Hormones & Cycle", phase_tags: ["luteal"], hint: "Progesterone, PMS and the luteal phase: separating fact from myth" },
  { category: "Mental Health", phase_tags: ["luteal", "menstrual"], hint: "PMDD and premenstrual mood shifts: what every woman should know" },
  { category: "Mental Health", phase_tags: ["follicular", "ovulatory"], hint: "Cycle syncing for anxiety: how your hormones shape your mental health week to week" },
  { category: "Nutrition", phase_tags: ["menstrual"], hint: "Iron, magnesium and dark chocolate: what to eat on your period" },
  { category: "Nutrition", phase_tags: ["follicular"], hint: "Cruciferous vegetables and oestrogen metabolism: a guide for women" },
  { category: "Nutrition", phase_tags: ["luteal"], hint: "Why you crave carbs before your period — and how to work with it" },
  { category: "Gut Health", phase_tags: [], hint: "The gut-hormone axis: how your microbiome shapes your cycle" },
  { category: "Sleep", phase_tags: ["luteal"], hint: "Why sleep gets worse before your period — and what to do about it" },
  { category: "Fitness", phase_tags: ["follicular", "ovulatory"], hint: "How to build strength in your follicular and ovulatory phases" },
  { category: "Skin & Hair", phase_tags: ["luteal"], hint: "Hormonal acne: why the luteal phase triggers breakouts and what to do" },
  { category: "Relationships", phase_tags: ["ovulatory"], hint: "Desire, attraction and ovulation: what changes and why" },
  { category: "Stress", phase_tags: ["luteal"], hint: "Cortisol and progesterone: why stress hits harder in the luteal phase" },
  { category: "Supplements", phase_tags: [], hint: "Magnesium glycinate, B6 and ashwagandha: evidence-based supplements for women" },
  { category: "Fertility", phase_tags: [], hint: "Understanding your fertile window: cervical mucus, LH surges and timing" },
  { category: "Body Image", phase_tags: [], hint: "Why your weight fluctuates across your cycle — and why that is completely normal" },
  { category: "Women's Health", phase_tags: [], hint: "PCOS, endometriosis and fibroids: understanding the three most common gynaecological conditions" },
  { category: "Menopause", phase_tags: [], hint: "Perimenopause symptoms no one talks about: brain fog, joint pain and rage" },
  { category: "Self Care", phase_tags: ["menstrual"], hint: "The anti-hustle: building a self-care practice that aligns with your cycle" },
  { category: "Career & Money", phase_tags: [], hint: "Cycle syncing your work week: when to negotiate, present and strategise" },
  { category: "Mindfulness", phase_tags: ["menstrual"], hint: "The science of inward rest: menstrual phase and contemplative practices" },
  { category: "Mental Wellness", phase_tags: [], hint: "Rest is productive: the science of recovery and nervous system reset" },
  { category: "Nutrition", phase_tags: [], hint: "Seed cycling for hormonal balance: what the evidence actually says" },
];

const STORY_PROMPTS = [
  { category: "Mental Health", hint: "A woman navigating anxiety during her luteal phase and the small ritual that helped her find ground" },
  { category: "Body Image", hint: "Learning to trust a body that bleeds: one woman's journey from shame to cycle awareness" },
  { category: "Relationships", hint: "The conversation I finally had with my partner about my premenstrual mood" },
  { category: "Hormones & Cycle", hint: "The month I tracked my cycle obsessively and what it taught me about myself" },
  { category: "Self Care", hint: "What burnout looked like from inside: a personal essay on cortisol, exhaustion and coming back" },
  { category: "Women's Health", hint: "Three years to a diagnosis: my experience with endometriosis and learning to advocate for myself" },
  { category: "Mental Wellness", hint: "I started treating my period week like a retreat — here is what changed" },
  { category: "Relationships", hint: "On desire and its disappearance: a personal essay about libido, hormones and honesty in a long relationship" },
  { category: "Body Image", hint: "My body in every phase: a meditation on how I look and feel differently across the month" },
  { category: "Career & Money", hint: "I rescheduled my biggest pitch to my follicular phase — it changed everything" },
];

const BOOK_TOPICS = [
  { title: "Untamed", author: "Glennon Doyle", category: "Self Care" },
  { title: "In the FLO", author: "Alisa Vitti", category: "Hormones & Cycle" },
  { title: "Period Power", author: "Maisie Hill", category: "Hormones & Cycle" },
  { title: "Burnout", author: "Emily and Amelia Nagoski", category: "Stress" },
  { title: "Come As You Are", author: "Emily Nagoski", category: "Body Image" },
  { title: "Why We Sleep", author: "Matthew Walker", category: "Sleep" },
  { title: "Attached", author: "Amir Levine and Rachel Heller", category: "Relationships" },
  { title: "Maybe You Should Talk to Someone", author: "Lori Gottlieb", category: "Mental Health" },
  { title: "Invisible Women", author: "Caroline Criado Perez", category: "Women's Health" },
  { title: "The Gifts of Imperfection", author: "Brene Brown", category: "Mental Health" },
  { title: "Atomic Habits", author: "James Clear", category: "Self Care" },
  { title: "The Mountain Is You", author: "Brianna Wiest", category: "Self Care" },
  { title: "Set Boundaries Find Peace", author: "Nedra Glennon Tawwab", category: "Relationships" },
  { title: "Roar", author: "Stacy Sims", category: "Fitness" },
  { title: "The Body Keeps the Score", author: "Bessel van der Kolk", category: "Mental Health" },
];

function getWeekIndex() {
  return Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
}

function pickForWeek(list, weekIndex, count) {
  const offset = (weekIndex * count) % list.length;
  return Array.from({ length: count }, (_, i) => list[(offset + i) % list.length]);
}

async function generateArticle(base44, topic) {
  const phaseCtx = topic.phase_tags?.length
    ? `Particularly relevant for the ${topic.phase_tags.join(' and ')} phase(s).`
    : 'Relevant across all cycle phases.';

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are FemWell's editorial team — a women's wellness publication that is evidence-based, warm and empowering.

Write a full magazine-quality wellness article on: "${topic.hint}"
${phaseCtx}

Return JSON:
- title: compelling editorial title (max 80 chars)
- lede: 2-sentence hook (max 200 chars)
- summary: 4-5 sentence overview (max 400 chars)
- body: full article, 600-800 words, flowing paragraphs, no markdown headers or bullets, warm tone, name hormones/mechanisms, practical suggestions
- takeaway_1: first key takeaway (1 sentence)
- takeaway_2: second key takeaway (1 sentence)
- takeaway_3: third key takeaway (1 sentence)
- why_it_matters: one powerful sentence on why this matters for women
- author_name: "FemWell Editorial"
- emotional_tag: one of: Body, Identity, Relationships, Mental Health, Self-Discovery, Motherhood, Career, Grief`,
    response_json_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' }, lede: { type: 'string' }, summary: { type: 'string' },
        body: { type: 'string' }, takeaway_1: { type: 'string' }, takeaway_2: { type: 'string' },
        takeaway_3: { type: 'string' }, why_it_matters: { type: 'string' },
        author_name: { type: 'string' }, emotional_tag: { type: 'string' },
      },
    },
  });

  const now = new Date().toISOString();
  const saved = await base44.asServiceRole.entities.LifestyleItems.create({
    title: result.title, lede: result.body || result.lede, summary: result.summary,
    takeaway_1: result.takeaway_1, takeaway_2: result.takeaway_2, takeaway_3: result.takeaway_3,
    why_it_matters: result.why_it_matters, author_name: result.author_name || 'FemWell Editorial',
    emotional_tag: result.emotional_tag || '', category: topic.category,
    phase_tags: topic.phase_tags || [], content_type: 'ARTICLE', media_type: 'ARTICLE',
    provider: 'FEMWELL_AI', status: 'PUBLISHED',
    pub_date: now, published_at: now, ingested_at: now, content_url: '',
  });
  return { id: saved.id, title: result.title, type: 'article' };
}

async function generateStory(base44, prompt) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a personal essay editor for FemWell — a women's wellness platform. Write a vivid, honest first-person personal essay on: "${prompt.hint}"

The essay should feel real, intimate and relatable — like something from The Cut or Longreads. 700-900 words. No subheadings. Flowing paragraphs. Honest and specific. Use "I" voice throughout.

Return JSON:
- title: evocative essay title (max 80 chars)
- lede: opening hook sentence (max 180 chars)
- summary: what this essay is about, 2-3 sentences (max 300 chars)
- body: the full personal essay, 700-900 words, first person, no headers, flowing paragraphs
- emotional_tag: one of: Body, Identity, Relationships, Mental Health, Self-Discovery, Motherhood, Career, Grief
- author_name: "FemWell Stories"`,
    response_json_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' }, lede: { type: 'string' }, summary: { type: 'string' },
        body: { type: 'string' }, emotional_tag: { type: 'string' }, author_name: { type: 'string' },
      },
    },
  });

  const now = new Date().toISOString();
  const saved = await base44.asServiceRole.entities.LifestyleItems.create({
    title: result.title, lede: result.body || result.lede, summary: result.summary,
    author_name: result.author_name || 'FemWell Stories',
    emotional_tag: result.emotional_tag || '', category: prompt.category,
    phase_tags: [], content_type: 'STORY', media_type: 'ARTICLE',
    provider: 'FEMWELL_AI', status: 'PUBLISHED',
    pub_date: now, published_at: now, ingested_at: now, content_url: '',
  });
  return { id: saved.id, title: result.title, type: 'story' };
}

async function generateBookSummary(base44, book) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a women's wellness book editor for FemWell. Write a rich, engaging book summary card for "${book.title}" by ${book.author}.

Return JSON:
- title: use the book's real title
- tagline: one compelling sentence that sells this book (max 80 chars)
- summary: 3-4 sentences covering the core message and why it matters for women (max 400 chars)
- body: a rich expanded summary of the book — 500-600 words. Cover the main arguments, key stories, and most useful frameworks. Write as if summarising for a busy woman who wants the full picture without reading all 300 pages. Warm, intelligent prose.
- key_lessons: 5 specific actionable insights from the book (array of strings, 1-2 sentences each)
- best_for: "You'll love this if..." (one sentence, max 100 chars)
- quote: one memorable real quote from the book
- author_name: "${book.author}"
- emotional_tag: one of: Body, Identity, Relationships, Mental Health, Self-Discovery, Motherhood, Career, Grief`,
    response_json_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' }, tagline: { type: 'string' }, summary: { type: 'string' },
        body: { type: 'string' }, key_lessons: { type: 'array', items: { type: 'string' } },
        best_for: { type: 'string' }, quote: { type: 'string' },
        author_name: { type: 'string' }, emotional_tag: { type: 'string' },
      },
    },
  });

  const now = new Date().toISOString();
  const saved = await base44.asServiceRole.entities.LifestyleItems.create({
    title: result.title || book.title,
    lede: result.body || result.summary,
    summary: result.summary || result.tagline,
    takeaway_1: result.key_lessons?.[0] || '',
    takeaway_2: result.key_lessons?.[1] || '',
    takeaway_3: result.key_lessons?.[2] || '',
    why_it_matters: result.best_for || '',
    author_name: result.author_name || book.author,
    emotional_tag: result.emotional_tag || '',
    category: book.category, phase_tags: [],
    content_type: 'GUIDE', media_type: 'ARTICLE',
    provider: 'FEMWELL_AI', status: 'PUBLISHED',
    pub_date: now, published_at: now, ingested_at: now, content_url: '',
    tags: ['book summary', result.tagline || ''],
  });
  return { id: saved.id, title: book.title, type: 'book_summary' };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { custom_topic, custom_category, content_type: customType, force_run } = body;

    // Handle user custom requests (2/week limit)
    if (custom_topic) {
      try {
        const user = await base44.auth.me();
        if (user) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const ws = weekStart.toISOString().split('T')[0];
          const recent = await base44.asServiceRole.entities.LifestyleItems.filter({ created_by: user.email });
          const thisWeekCount = recent.filter(i =>
            i.provider === 'FEMWELL_AI_USER_REQUEST' && (i.created_date || '') >= ws
          ).length;
          if (thisWeekCount >= 2) {
            return Response.json({ error: 'Weekly limit reached. You can request 2 custom topics per week.' }, { status: 429 });
          }
        }
      } catch {}

      // Generate user custom request
      const type = customType || 'article';
      const now = new Date().toISOString();
      let generated;

      if (type === 'story') {
        generated = await generateStory(base44, { category: custom_category || "Women's Health", hint: custom_topic });
      } else if (type === 'book') {
        generated = await generateBookSummary(base44, { title: custom_topic, author: 'Various', category: custom_category || "Women's Health" });
      } else {
        generated = await generateArticle(base44, { category: custom_category || "Women's Health", phase_tags: [], hint: custom_topic });
      }

      // Mark as user request
      await base44.asServiceRole.entities.LifestyleItems.update(generated.id, {
        provider: 'FEMWELL_AI_USER_REQUEST',
      });

      return Response.json({ success: true, generated: 1, articles: [generated] });
    }

    // Scheduled/manual full weekly generation: 5 articles + 3 stories + 2 book summaries = 10
    const weekIdx = getWeekIndex();
    const articleTopics = pickForWeek(ARTICLE_TOPICS, weekIdx, 5);
    const storyPrompts = pickForWeek(STORY_PROMPTS, weekIdx, 3);
    const bookTopics = pickForWeek(BOOK_TOPICS, weekIdx, 2);

    const generated = [];
    const errors = [];

    for (const topic of articleTopics) {
      try {
        const r = await generateArticle(base44, topic);
        generated.push(r);
        console.log(`Article: ${r.title}`);
      } catch (e) { errors.push(e.message); console.error('Article fail:', e.message); }
    }

    for (const prompt of storyPrompts) {
      try {
        const r = await generateStory(base44, prompt);
        generated.push(r);
        console.log(`Story: ${r.title}`);
      } catch (e) { errors.push(e.message); console.error('Story fail:', e.message); }
    }

    for (const book of bookTopics) {
      try {
        const r = await generateBookSummary(base44, book);
        generated.push(r);
        console.log(`Book: ${r.title}`);
      } catch (e) { errors.push(e.message); console.error('Book fail:', e.message); }
    }

    return Response.json({ success: true, generated: generated.length, articles: generated, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});