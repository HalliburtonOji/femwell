import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Generate AI-written FemWell content articles covering all wellness categories
// Run 2x per week via scheduled automation. Saves to LifestyleItems with provider=FEMWELL_AI.

const CONTENT_TOPICS = [
  // Cycle & Hormones
  { category: "Hormones & Cycle", phase_tags: ["menstrual"], title_hint: "How oestrogen dropping in your menstrual phase affects your energy, skin and mood" },
  { category: "Hormones & Cycle", phase_tags: ["follicular"], title_hint: "The follicular phase window: why this is your most productive, creative week" },
  { category: "Hormones & Cycle", phase_tags: ["ovulatory"], title_hint: "Ovulation and the testosterone surge: what really happens to your confidence and libido" },
  { category: "Hormones & Cycle", phase_tags: ["luteal"], title_hint: "Progesterone, PMS and the luteal phase: separating fact from myth" },
  // Mental Health
  { category: "Mental Health", phase_tags: ["luteal", "menstrual"], title_hint: "PMDD and premenstrual mood shifts: what every woman should know" },
  { category: "Mental Health", phase_tags: ["follicular", "ovulatory"], title_hint: "Cycle syncing for anxiety: how your hormones shape your mental health week to week" },
  { category: "Mental Wellness", phase_tags: ["menstrual"], title_hint: "Why rest is productive: the science of recovery and restorative rest" },
  // Nutrition
  { category: "Nutrition", phase_tags: ["menstrual"], title_hint: "Iron, magnesium and dark chocolate: what to eat on your period" },
  { category: "Nutrition", phase_tags: ["follicular"], title_hint: "Cruciferous vegetables and oestrogen metabolism: a guide for women" },
  { category: "Nutrition", phase_tags: ["luteal"], title_hint: "Why you crave carbs before your period — and how to work with it" },
  { category: "Nutrition", phase_tags: [], title_hint: "Seed cycling for hormonal balance: what the evidence actually says" },
  { category: "Gut Health", phase_tags: [], title_hint: "The gut-hormone axis: how your microbiome shapes your cycle" },
  // Sleep
  { category: "Sleep", phase_tags: ["luteal"], title_hint: "Why sleep gets worse before your period — and what to do about it" },
  { category: "Sleep", phase_tags: ["menstrual", "follicular"], title_hint: "Sleep tracking and your cycle: what your data is actually telling you" },
  // Fitness
  { category: "Fitness", phase_tags: ["follicular", "ovulatory"], title_hint: "How to build strength in your follicular and ovulatory phases" },
  { category: "Fitness", phase_tags: ["menstrual", "luteal"], title_hint: "Low-impact movement for your period: why rest and gentle flow matter" },
  // Skin & Hair
  { category: "Skin & Hair", phase_tags: ["luteal"], title_hint: "Hormonal acne: why the luteal phase triggers breakouts and what to do" },
  { category: "Skin & Hair", phase_tags: ["follicular", "ovulatory"], title_hint: "The oestrogen glow: skincare in your follicular and ovulatory phases" },
  // Relationships & Sex
  { category: "Relationships", phase_tags: ["ovulatory"], title_hint: "Desire, attraction and ovulation: what changes and why" },
  { category: "Sex Education", phase_tags: [], title_hint: "Cycle-aware intimacy: understanding how your libido shifts across the month" },
  // Stress & Calm
  { category: "Stress", phase_tags: ["luteal"], title_hint: "Cortisol and progesterone: why stress hits harder in the luteal phase" },
  { category: "Mindfulness", phase_tags: ["menstrual"], title_hint: "The science of inward rest: menstrual phase and contemplative practices" },
  // Supplements
  { category: "Supplements", phase_tags: [], title_hint: "Magnesium glycinate, B6 and ashwagandha: evidence-based supplements for women" },
  { category: "Supplements", phase_tags: ["luteal", "menstrual"], title_hint: "Supplements for PMS: what works, what doesn't, and what's overrated" },
  // Fertility
  { category: "Fertility", phase_tags: [], title_hint: "Understanding your fertile window: cervical mucus, LH surges and timing" },
  // Body Image
  { category: "Body Image", phase_tags: [], title_hint: "Why your weight fluctuates across your cycle — and why that is completely normal" },
  // Women's Health
  { category: "Women's Health", phase_tags: [], title_hint: "PCOS, endometriosis and fibroids: understanding the three most common gynaecological conditions" },
  { category: "Menopause", phase_tags: [], title_hint: "Perimenopause symptoms no one talks about: brain fog, joint pain and rage" },
  // Self Care
  { category: "Self Care", phase_tags: ["menstrual"], title_hint: "The anti-hustle: building a self-care practice that aligns with your cycle" },
  // Career & Money
  { category: "Career & Money", phase_tags: [], title_hint: "Cycle syncing your work week: when to negotiate, present and strategise" },
];

function pickTopicsForRun(runIndex, count = 3) {
  // Deterministic rotation so each run covers different topics
  const topics = [];
  for (let i = 0; i < count; i++) {
    topics.push(CONTENT_TOPICS[(runIndex * count + i) % CONTENT_TOPICS.length]);
  }
  return topics;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both scheduled (service role) and admin manual trigger
    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      if (user?.role === 'admin') isAuthorized = true;
    } catch {}
    // Also allow scheduled automations which won't have a user
    const authHeader = req.headers.get('Authorization') || '';
    if (!isAuthorized && !authHeader) {
      // Scheduled automation — check for service role header
      // Allow if no user context (scheduled)
      isAuthorized = true;
    }

    const body = await req.json().catch(() => ({}));
    const { custom_topic, custom_category, force_run } = body;

    // Check weekly user-request limit (2 per week)
    if (custom_topic) {
      try {
        const user = await base44.auth.me();
        if (user) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekStartStr = weekStart.toISOString().split('T')[0];
          const recentUserItems = await base44.asServiceRole.entities.LifestyleItems.filter({
            created_by: user.email,
          });
          const thisWeekCount = recentUserItems.filter(item =>
            item.provider === 'FEMWELL_AI_USER_REQUEST' &&
            item.created_date >= weekStartStr
          ).length;
          if (thisWeekCount >= 2) {
            return Response.json({ error: 'Weekly limit reached. You can request 2 custom topics per week.' }, { status: 429 });
          }
        }
      } catch {}
    }

    // Pick topics for this run
    const runIndex = Math.floor(Date.now() / (3 * 24 * 3600 * 1000)); // changes every 3 days
    let topicsToGenerate;
    if (custom_topic) {
      topicsToGenerate = [{ category: custom_category || "Women's Health", phase_tags: [], title_hint: custom_topic }];
    } else {
      topicsToGenerate = pickTopicsForRun(runIndex, 3);
    }

    const generated = [];

    for (const topic of topicsToGenerate) {
      try {
        // Check if very similar content already exists (avoid duplicates)
        if (!force_run && !custom_topic) {
          const existing = await base44.asServiceRole.entities.LifestyleItems.filter({
            category: topic.category,
          });
          const publishedCount = existing.filter(i => i.provider === 'FEMWELL_AI' && i.status === 'PUBLISHED').length;
          if (publishedCount >= 4) {
            console.log(`Skipping ${topic.category} — already has ${publishedCount} FemWell articles`);
            continue;
          }
        }

        const phaseContext = topic.phase_tags?.length
          ? `This article is particularly relevant for the ${topic.phase_tags.join(' and ')} phase(s) of the menstrual cycle.`
          : 'This article is relevant across all cycle phases.';

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are FemWell's editorial team — a women's wellness publication that is evidence-based, warm, empowering and non-judgmental.

Write a full magazine-quality wellness article on: "${topic.title_hint}"

${phaseContext}

Return JSON with these exact fields:
- title: compelling article title (max 80 chars, not the hint verbatim — make it editorial)
- lede: 2-sentence hook that draws the reader in (max 200 chars)
- summary: 4-5 sentence overview of the article's key message (max 400 chars)
- body: full article body, 600-800 words. Use plain text only — no markdown headers, no bullet points inside the body. Write in flowing, warm paragraphs. Be specific with science (name hormones, mechanisms). Be empowering, not prescriptive. Address the reader as "you". Include: the hormonal mechanism, what women typically experience, evidence-based practical suggestions, and a closing thought.
- takeaway_1: first key takeaway (1 sentence, specific and actionable)
- takeaway_2: second key takeaway (1 sentence)
- takeaway_3: third key takeaway (1 sentence)
- why_it_matters: one powerful sentence on why this topic matters for women specifically
- author_name: use "FemWell Editorial"
- emotional_tag: one of: Body, Identity, Relationships, Mental Health, Self-Discovery, Motherhood, Career, Grief — pick the most relevant

Return valid JSON only.`,
          response_json_schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              lede: { type: 'string' },
              summary: { type: 'string' },
              body: { type: 'string' },
              takeaway_1: { type: 'string' },
              takeaway_2: { type: 'string' },
              takeaway_3: { type: 'string' },
              why_it_matters: { type: 'string' },
              author_name: { type: 'string' },
              emotional_tag: { type: 'string' },
            },
          },
        });

        const now = new Date().toISOString();
        const saved = await base44.asServiceRole.entities.LifestyleItems.create({
          title: result.title,
          lede: result.lede,
          summary: result.summary,
          takeaway_1: result.takeaway_1,
          takeaway_2: result.takeaway_2,
          takeaway_3: result.takeaway_3,
          why_it_matters: result.why_it_matters,
          author_name: result.author_name || 'FemWell Editorial',
          emotional_tag: result.emotional_tag || '',
          category: topic.category,
          phase_tags: topic.phase_tags || [],
          content_type: 'ARTICLE',
          media_type: 'ARTICLE',
          provider: custom_topic ? 'FEMWELL_AI_USER_REQUEST' : 'FEMWELL_AI',
          status: 'PUBLISHED',
          pub_date: now,
          published_at: now,
          ingested_at: now,
          content_url: '',
          // Store body in lede field if long enough, otherwise use summary
          // Body stored in a try-catch to handle field limits
        });

        // Store full body separately via update (lede supports longer text)
        if (result.body) {
          await base44.asServiceRole.entities.LifestyleItems.update(saved.id, {
            lede: result.body,
          });
        }

        generated.push({ id: saved.id, title: result.title, category: topic.category });
        console.log(`Generated: ${result.title}`);
      } catch (e) {
        console.error(`Failed to generate for topic "${topic.title_hint}":`, e.message);
      }
    }

    return Response.json({
      success: true,
      generated: generated.length,
      articles: generated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});