import { ArrowRight } from "lucide-react";
import { lifestyleReturnLink } from "@/lib/lifestyleReturns";

export default function PlannerSourceLink({ item, compact = false, disabled = false }) {
  const link = lifestyleReturnLink(item);
  if (!link) return null;
  return <a href={link.href} aria-label={`${link.label}: ${item.title || "your planned item"}`} aria-disabled={disabled || undefined} onClick={event => { event.stopPropagation(); if (disabled) event.preventDefault(); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: compact ? "center" : "flex-start", gap: 6, flexShrink: 0, minWidth: 44, minHeight: 44, color: "#3A2C1A", fontSize: 12, fontWeight: 600, textDecoration: "underline" }}>{!compact && link.label}<ArrowRight size={14} aria-hidden="true" /></a>;
}
