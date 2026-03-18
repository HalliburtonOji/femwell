import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Sparkles } from "lucide-react";
import AICoachTab from "../components/journal/AICoachTab";

export default function Assistant() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen femwell-gradient flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-300 border-t-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="mx-auto max-w-4xl px-4 pt-12 md:px-6">
        <div className="mb-5 rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                <Sparkles className="h-3.5 w-3.5" /> Femwell Assistant
              </div>
              <h1 className="mt-4 text-3xl font-bold text-gray-900">Femwell Assistant</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
                Ask anything, pull in journal or program context, get recommendations, and jump straight into the next best action.
              </p>
            </div>
            <a href={createPageUrl("Saved")} className="rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600">
              Saved
            </a>
          </div>
        </div>

        <div className="rounded-[28px] border border-rose-100 bg-white p-4 shadow-sm md:p-6">
          <AICoachTab user={user} />
        </div>
      </div>
    </div>
  );
}