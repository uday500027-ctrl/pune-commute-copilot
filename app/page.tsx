"use client";

import { useState, useRef } from "react";

interface CommuteStep {
  mode: "walk" | "auto" | "metro" | "bus" | string;
  from: string;
  to: string;
  durationMin: number;
  costINR: number;
  instruction: string;
  line: string | null;
}

interface PlanResponse {
  summary: string;
  totalMin: number;
  totalCostINR: number;
  steps: CommuteStep[];
}

const EXAMPLE_QUERIES = [
  "Vanaz to Pune Railway Station, fastest",
  "Shivajinagar to Hinjewadi by 9am, cheapest",
  "मुझे स्वारगेट से कल्याणी नगर जाना है",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handlePlanTrip = async (queryToSubmit?: string) => {
    const textToSubmit = (queryToSubmit ?? query).trim();
    if (!textToSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: textToSubmit }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Unable to plan trip. Please try again.");
      }

      const data: PlanResponse = await res.json();
      setPlan(data);

      // Smooth scroll to results on mobile devices
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while planning your journey."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExample = (exampleText: string) => {
    setQuery(exampleText);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#070c17] text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-slate-950">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-[128px]" />
      </div>

      <main className="relative z-10 w-full max-w-xl mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col gap-6">
        {/* 1. Header */}
        <header className="flex flex-col items-center text-center space-y-2.5 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-400 text-xs font-medium tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
            </span>
            Pune Metro Navigator
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-200 via-teal-400 to-cyan-300 bg-clip-text text-transparent">
            Pune Commute Copilot
          </h1>

          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-md">
            Your AI guide to getting around Pune by Metro
          </p>
        </header>

        {/* 2 & 3 & 4. Input Box, Example Chips, & Action Button */}
        <section className="bg-[#0e1628]/85 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/30 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="trip-query"
              className="block text-xs font-semibold uppercase tracking-wider text-teal-400/90"
            >
              Where do you want to go?
            </label>
            <textarea
              id="trip-query"
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Kothrud to Kalyani Nagar by 6pm, cheapest way"
              className="w-full bg-[#080d19] border border-slate-700/80 rounded-xl px-3.5 py-3 text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 resize-none transition duration-200"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePlanTrip();
                }
              }}
            />
          </div>

          {/* 3. Three Clickable Example Chips */}
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400 font-medium">Or try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectExample(example)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left ${
                    query === example
                      ? "bg-teal-950/80 border-teal-400 text-teal-300 ring-1 ring-teal-400/30"
                      : "bg-[#131d33] border-slate-700/70 text-slate-300 hover:border-teal-500/60 hover:text-teal-200 hover:bg-[#18243f]"
                  }`}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Plan My Trip Button with Loading State */}
          <button
            type="button"
            id="plan-trip-button"
            onClick={() => handlePlanTrip()}
            disabled={loading || !query.trim()}
            className="w-full py-3.5 px-5 rounded-xl font-semibold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-teal-400 to-teal-300 hover:from-teal-300 hover:to-teal-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-slate-950"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Planning your trip...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Plan my trip</span>
              </>
            )}
          </button>
        </section>

        {/* 6. Error State */}
        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-3 backdrop-blur-sm shadow-md"
          >
            <svg
              className="w-5 h-5 text-rose-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-rose-300">Route Planning Failed</p>
              <p className="text-rose-200/90 text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 5. Results Section */}
        {plan && (
          <section
            ref={resultsRef}
            className="space-y-4 pt-1 animate-in fade-in duration-300"
            aria-label="Trip Results"
          >
            {/* Top Summary Card */}
            <div className="bg-gradient-to-br from-[#121d36] to-[#0d162a] border border-teal-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col gap-3 relative z-10">
                <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                  <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
                    Recommended Route
                  </span>
                  <div className="flex items-center gap-3">
                    {/* Time */}
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-100 bg-[#080d19]/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                      <svg
                        className="w-4 h-4 text-teal-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span>{plan.totalMin} mins</span>
                    </div>

                    {/* Cost */}
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-100 bg-[#080d19]/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                      <span className="text-teal-400 font-bold text-sm">₹</span>
                      <span>{plan.totalCostINR}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm sm:text-base font-medium text-slate-200">
                  {plan.summary}
                </p>
              </div>
            </div>

            {/* Vertical List of Step Cards */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Step-by-step Itinerary
              </h2>

              <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-teal-500/80 before:via-teal-600/40 before:to-slate-700">
                {plan.steps.map((step, index) => {
                  const isMetro = step.mode.toLowerCase() === "metro";
                  const isPurple =
                    step.line?.toLowerCase().includes("purple") ||
                    step.instruction?.toLowerCase().includes("purple");
                  const isAqua =
                    step.line?.toLowerCase().includes("aqua") ||
                    step.instruction?.toLowerCase().includes("aqua") ||
                    (isMetro && !isPurple);

                  return (
                    <div
                      key={index}
                      className="relative bg-[#0d1527] border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-md transition-all hover:border-slate-700"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-4 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#070c17] bg-teal-400 shadow-sm shadow-teal-400/50" />

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Mode Icon */}
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              isMetro
                                ? isPurple
                                  ? "bg-purple-950/80 text-purple-300 border border-purple-500/30"
                                  : "bg-teal-950/80 text-teal-300 border border-teal-500/30"
                                : step.mode === "walk"
                                ? "bg-slate-800 text-slate-300 border border-slate-700"
                                : step.mode === "bus"
                                ? "bg-blue-950/80 text-blue-300 border border-blue-500/30"
                                : "bg-amber-950/80 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            <ModeIcon mode={step.mode} />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Route: from -> to */}
                            <div className="flex items-center gap-1.5 flex-wrap text-sm font-semibold text-slate-100">
                              <span className="truncate">{step.from}</span>
                              <span className="text-teal-400 text-xs">→</span>
                              <span className="truncate">{step.to}</span>
                            </div>

                            {/* Instruction */}
                            <p className="text-xs sm:text-sm text-slate-300 mt-1">
                              {step.instruction}
                            </p>

                            {/* Metro Line Badge */}
                            {step.line && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border ${
                                    isPurple
                                      ? "bg-purple-950 text-purple-300 border-purple-500/40"
                                      : "bg-teal-950 text-teal-300 border-teal-500/40"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isPurple ? "bg-purple-400" : "bg-teal-400"
                                    }`}
                                  />
                                  {step.line}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Step Duration & Cost */}
                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <span className="text-xs font-semibold text-slate-200 bg-[#121c32] px-2 py-0.5 rounded border border-slate-700/60">
                            {step.durationMin} min
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {step.costINR > 0 ? `₹${step.costINR}` : "Free"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Estimate Disclaimer Note */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              <svg
                className="w-4 h-4 text-teal-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Times and fares are AI estimates. Check official sources before travelling.</span>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-4 text-xs text-slate-400 border-t border-slate-800/80">
        <p>Pune Commute Copilot • Pune Metro Transit Assistant</p>
      </footer>
    </div>
  );
}

function ModeIcon({ mode }: { mode: string }) {
  const normalized = mode.toLowerCase();

  if (normalized === "metro") {
    return (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Metro Train Front */}
        <rect x="4" y="3" width="16" height="15" rx="3" />
        <path d="M4 11h16" />
        <line x1="12" y1="3" x2="12" y2="11" />
        <circle cx="8" cy="15" r="1" fill="currentColor" />
        <circle cx="16" cy="15" r="1" fill="currentColor" />
        <path d="M6 18l-2 3" />
        <path d="M18 18l2 3" />
      </svg>
    );
  }

  if (normalized === "bus") {
    return (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="3" width="16" height="14" rx="2" />
        <path d="M4 10h16" />
        <circle cx="7.5" cy="14.5" r="1" fill="currentColor" />
        <circle cx="16.5" cy="14.5" r="1" fill="currentColor" />
        <path d="M6 17l-1 3" />
        <path d="M18 17l1 3" />
      </svg>
    );
  }

  if (normalized === "auto") {
    return (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Auto rickshaw / Cab icon */}
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M4 16h16" />
        <path d="M4 16l2-8h8l3 4h3v4" />
        <path d="M10 8v8" />
      </svg>
    );
  }

  // Default: walk
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Walking person */}
      <circle cx="13" cy="4" r="2" />
      <path d="M7 21l3-5 3 2 2 5" />
      <path d="M11 13l2-4 3 2 2-2" />
      <path d="M7 11l4 2" />
    </svg>
  );
}
