import { queryClientInstance } from "@/lib/query-client";
import { base44 } from "@/api/base44Client";

// Nine dedicated Good life rooms ask for this exact public edition. Keep the
// existing full 500-row source and room-specific filters, while sharing a
// successful request briefly during nearby room visits. A failed read is never
// stored as an empty shelf; the next visit retries it.
export function goodLifePublishedCatalog() {
  return queryClientInstance.fetchQuery({
    queryKey: ["good-life", "LifestyleItems", "PUBLISHED", "-engagement_score", 500],
    queryFn: () => base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 500),
    staleTime: 30_000,
    retry: false,
  });
}
