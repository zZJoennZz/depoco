"use client";

import Link from 'next/link';
import { ShieldAlert, Database, Mic, Square, Zap, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  isListening?: boolean;
  onToggleListening?: () => void;
  onGetSuggestion?: () => void;
  isLoading?: boolean;
  hasText?: boolean;
  showControls?: boolean; // Only show Mic/Zap on the Depo page
}

export default function Navbar({
  isListening = false,
  onToggleListening,
  onGetSuggestion,
  isLoading = false,
  hasText = false,
  showControls = false
}: NavbarProps) {
  return (
    <nav className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex justify-between items-center">
      {/* Brand / Logo */}
      <Link href="/" className="flex items-center space-x-4 group">
        <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
          <ShieldAlert className="text-white h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white uppercase italic leading-none">depoco</h1>
          <p className="text-[10px] text-slate-500 font-mono mt-1">V0.02_MALPRACTICE_ALPHA</p>
        </div>
      </Link>

      <div className="flex items-center space-x-6">
        {/* Navigation Links */}
        <Link href="/" className="flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors">
          <LayoutDashboard className="h-4 w-4" />
          <span>Live Session</span>
        </Link>
        
        <Link href="/vault" className="flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors">
          <Database className="h-4 w-4" />
          <span>Evidence Vault</span>
        </Link>

        {/* Conditional Controls (Mic & Zap) */}
        {showControls && (
          <>
            <div className="h-4 w-[1px] bg-slate-700" />
            <div className="flex items-center space-x-3">
              <button 
                onClick={onToggleListening}
                className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  isListening 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/50 animate-pulse' 
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isListening ? <Square className="h-3 w-3 fill-current" /> : <Mic className="h-3 w-3" />}
                <span>{isListening ? "STOP LISTENING" : "START LISTENING"}</span>
              </button>
              
              <button 
                onClick={onGetSuggestion} 
                disabled={!hasText || isLoading} 
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 px-5 py-2 rounded-full text-xs font-bold transition-all text-white shadow-lg shadow-blue-600/20"
              >
                <Zap className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? "ANALYZING..." : "GENERATE FOLLOW-UP"}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}