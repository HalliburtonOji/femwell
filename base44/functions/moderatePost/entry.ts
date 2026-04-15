/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // This function is called by entity automation — use service role
    const body = await req.json();
    const { post_id, content } = body;

    if (!post_id || !content) {
      return Response.json({ error: 'post_id and content required' }, { status: 400 });
    }

    const prompt = `You are a content moderator for a women's health app community. Review this post for safety.

Post content: "${content}"

Check for:
1. Self-harm content or crisis signals
2. Medical misinformation that could cause harm
3. Harassment, hate speech, or discrimination
4. Spam or promotional content
5. Explicit sexual content

Respond with JSON only:
{
  "safe": true,
  "flags": [],
  "action": "approve",
  "reason": ""
}

If safe = true, action must be "approve". For borderline content, use "require_review". For clearly harmful content, use "auto_hide".`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          safe: { type: 'boolean' },
          flags: { type: 'array', items: { type: 'string' } },
          action: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    });

    const moderated_at = new Date().toISOString();

    if (result.action === 'auto_hide') {
      await base44.asServiceRole.entities.Posts.update(post_id, {
        moderation_status: 'hidden',
        moderation_flag: result.reason,
        moderated_at,
      });
    } else if (result.action === 'require_review') {
      await base44.asServiceRole.entities.Posts.update(post_id, {
        moderation_status: 'flagged',
        moderation_flag: result.flags?.join(', ') || 'review required',
        moderated_at,
      });
    } else {
      await base44.asServiceRole.entities.Posts.update(post_id, {
        moderation_status: 'approved',
        moderation_flag: null,
        moderated_at,
      });
    }

    return Response.json({ success: true, action: result.action, safe: result.safe });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});