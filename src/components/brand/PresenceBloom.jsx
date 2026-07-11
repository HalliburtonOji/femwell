// PresenceBloom — a small bloom that is a woman's VEILED presence in the Community rooms.
// Seeded from the anonymous author_hash (never her account), so it's consistent across her
// thread but can't be linked to her identity or garden, and shows species + colour only.
// Replaces the generic sprout chip. useId namespaces the SVG gradients so many blooms on one
// feed never collide (the faint-render bug). Reused on any surface that renders an anon author.
import { useId } from "react";
import { RichBloomV2, cwOf } from "@/components/brand/flora";
import { presenceBloom } from "@/components/nurture/bloomprint";

export default function PresenceBloom({ hash, size = 22 }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { form, cwKey } = presenceBloom(hash);
  const c = cwOf(cwKey);
  return (
    <span aria-hidden style={{ width: size + 8, height: size + 8, borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0, background: `radial-gradient(circle, ${c.petal}26 0%, ${c.petal}0D 60%, transparent 75%)` }}>
      <RichBloomV2 form={form} color={c.petal} color2={c.tip} accent={c.accent} size={size} soft={false} headOnly animate={false} openness={0.92} idx={`pb${uid}`} />
    </span>
  );
}
