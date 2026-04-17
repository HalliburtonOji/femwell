import { base44 } from "@/api/base44Client";

// Fire-and-forget lightweight telemetry. Never throws.
export async function logAppEvent(type, meta = {}, userId = null) {
  try {
    await base44.entities.AppEvent.create({
      type,
      user_id: userId || undefined,
      meta,
      created_at: new Date().toISOString(),
    });
  } catch {
    /* silent — telemetry must never break a user flow */
  }
}