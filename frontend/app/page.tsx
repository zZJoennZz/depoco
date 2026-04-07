"use client";
import { useState } from 'react';
import { useSpeech } from '@/hooks/useSpeech';

export default function DepoPage() {
  const { text, isListening, start, stop } = useSpeech();
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getSuggestion = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/suggest-question", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, session_id: "demo-1" }),
      });
      const data = await res.json();
      setSuggestion(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 font-mono">
      <header className="border-b border-slate-700 pb-4 mb-8 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tighter text-blue-400">DEPO_COPILOT_v0.1_ALPHA</h1>
        <div className="space-x-4">
          <button 
            onClick={isListening ? stop : start}
            className={`px-4 py-2 rounded ${isListening ? 'bg-red-600' : 'bg-blue-600'}`}
          >
            {isListening ? "■ STOP LISTENING" : "● START LISTENING"}
          </button>
          <button onClick={getSuggestion} disabled={!text || loading} className="bg-emerald-600 px-4 py-2 rounded disabled:opacity-50">
            {loading ? "ANALYZING..." : "⚡ SUGGEST QUESTION"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* TRANSCRIPT PANEL */}
        <section className="col-span-4 bg-slate-800 p-4 border border-slate-700 h-[70vh] overflow-y-auto">
          <h2 className="text-xs text-slate-500 mb-2 uppercase">Live Transcript</h2>
          <p className="text-lg leading-relaxed">{text || "Silence..."}</p>
        </section>

        {/* SUGGESTION PANEL */}
        <section className="col-span-4 bg-slate-950 p-4 border border-blue-900/50 shadow-lg shadow-blue-900/20">
          <h2 className="text-xs text-blue-500 mb-2 uppercase font-bold">Suggested Follow-up</h2>
          {suggestion ? (
            <div className="space-y-4">
              <p className="text-xl text-blue-200 font-semibold italic">"{suggestion.suggestion}"</p>
            </div>
          ) : (
            <p className="text-slate-600 italic">Awaiting testimony analysis...</p>
          )}
        </section>

        {/* EVIDENCE PANEL */}
        <section className="col-span-4 bg-slate-800 p-4 border border-slate-700">
          <h2 className="text-xs text-slate-500 mb-2 uppercase">Supporting Evidence</h2>
          {suggestion?.evidence_used?.map((ev: any, i: number) => (
            <div key={i} className="mb-4 p-2 bg-slate-700 rounded text-sm">
              <p className="font-bold text-emerald-400 mb-1">DOC: {ev.title}</p>
              <p className="italic text-slate-300">"...{ev.content}..."</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}