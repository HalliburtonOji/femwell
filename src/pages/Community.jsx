import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CommunityFeed from "../components/community/CommunityFeed";

export default function Community() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
        setProfile(profiles[0] || null);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
           style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return <CommunityFeed user={user} profile={profile} />;
}