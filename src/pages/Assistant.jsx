import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AICoachTab from "../components/journal/AICoachTab";

export default function Assistant() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
      </div>
    );
  }

  return <AICoachTab user={user} />;
}