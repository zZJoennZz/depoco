"use client";
import { useState } from 'react';
import { useSpeech } from '@/hooks/useSpeech';
import Link from 'next/link';
import { Mic, Square, Zap, Database, ShieldAlert, FileText, History } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function DepoPage() {
  const { text, setText, isListening, start, stop } = useSpeech();
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleToggleListening = () => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  };

  const getSuggestion = async () => {
    if (!text) return;
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
    <main className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
      <Navbar 
        showControls={true}
        isListening={isListening}
        onToggleListening={isListening ? stop : start}
        onGetSuggestion={getSuggestion}
        isLoading={loading}
        hasText={!!text}
      />

      <div className="p-8 grid grid-cols-12 gap-8 h-[calc(100vh-80px)]">
        
        {/* LEFT: LIVE TRANSCRIPT VIEW (NOW EDITABLE) */}
        <section className="col-span-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Transcript</h2>
              <span className="bg-slate-800 text-slate-500 text-[9px] px-1.5 py-0.5 rounded border border-slate-700 uppercase font-bold">Editable</span>
            </div>
            <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-slate-700'}`} />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Awaiting verbal input..."
            className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 overflow-y-auto outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-xl font-medium leading-relaxed text-slate-300 antialiased resize-none scrollbar-hide ring-1 ring-inset ring-white/5"
          />
        </section>

        {/* MIDDLE: THE "GOTCHA" ALERT PANEL */}
        <section className="col-span-5 flex flex-col">
           <div className="px-1 mb-4">
            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Strategy Suggestion</h2>
          </div>
          <div className={`flex-1 rounded-2xl p-8 transition-all duration-700 flex flex-col justify-center border-2 ${
            suggestion 
            ? 'bg-blue-600/5 border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.15)]' 
            : 'bg-slate-900/30 border-slate-800'
          }`}>
            {suggestion ? (
              <div className="space-y-6">
                <div className="bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded w-fit uppercase tracking-tighter">
                  Contradiction Detected
                </div>
                <p className="text-3xl font-bold leading-tight text-white tracking-tight">
                  {suggestion.suggestion}
                </p>
                <div className="pt-6 border-t border-blue-500/20">
                  <p className="text-sm text-blue-300/80 leading-relaxed italic">
                    <span className="font-bold text-blue-400 not-italic mr-2">ANALYSIS:</span>
                    Witness testimony contradicts established medical documentation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-slate-800/50 h-12 w-12 rounded-full flex items-center justify-center mx-auto">
                  <History className="text-slate-600 h-6 w-6" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Cross-referencing testimony with <br/>Evidence Vault in real-time...</p>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: SUPPORTING RECORDS */}
        <section className="col-span-3 flex flex-col space-y-4">
          <div className="px-1">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Found Records</h2>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
            {suggestion?.evidence_used?.length > 0 ? (
              suggestion.evidence_used.map((ev: any, i: number) => (
                <div key={i} className="group bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-blue-500/50 transition-all hover:bg-slate-800/50">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="h-3 w-3 text-blue-400" />
                    <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{ev.title || "Record Segment"}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400 group-hover:text-slate-200 transition-colors italic">
                    "{ev.content}"
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full border border-dashed border-slate-800 rounded-2xl flex items-center justify-center p-8 text-center bg-slate-900/20">
                <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest leading-loose">
                  No active <br/>links found
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}