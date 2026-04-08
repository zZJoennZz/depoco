"use client";

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Loader2, ArrowLeft, Database } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface FileQueueItem {
  file: File;
  id: string;
  status: 'idle' | 'uploading' | 'complete' | 'error';
  progress: number;
}

export default function EvidenceVault() {
  const [files, setFiles] = useState<FileQueueItem[]>([]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incomingFiles = Array.from(e.target.files).map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: 'idle' as const,
      progress: 0
    }));
    setFiles(prev => [...prev, ...incomingFiles]);
  };

  const vectorizeFile = async (id: string, file: File) => {
    // Update status to uploading
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'uploading' } : f));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/ingest-document", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'complete' } : f));
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Vectorization error:", error);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error' } : f));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-10">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 mb-2">
              <Database className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-widest">Core Storage</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Evidence Vault</h1>
            <p className="text-slate-500 mt-2">Upload medical records to populate depoco's semantic memory.</p>
          </div>
          <Link href="/" className="flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <ArrowLeft className="h-4 w-4" />
            <span>BACK TO SESSION</span>
          </Link>
        </header>

        {/* Drop Zone */}
        <div className="relative group border-2 border-dashed border-slate-300 rounded-2xl p-16 bg-white hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center shadow-sm">
          <input 
            type="file" 
            multiple 
            accept=".pdf,.docx,.txt"
            onChange={onFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          />
          <UploadCloud className="mx-auto h-16 w-16 text-slate-400 group-hover:text-blue-500 transition-colors mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">Drop medical records here or click to browse</h3>
          <p className="text-slate-400 mt-1">Supports PDF, DOCX, and TXT for vectorized analysis</p>
        </div>

        {/* File List */}
        <div className="mt-12 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Processing Queue</h2>
            <span className="text-xs font-medium text-slate-400">{files.length} Files Total</span>
          </div>
          
          {files.length === 0 && (
            <div className="p-16 border border-slate-200 rounded-2xl bg-white text-center shadow-inner">
              <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="italic text-slate-400">Queue is empty. Awaiting evidence ingestion...</p>
            </div>
          )}

          {files.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center shadow-sm hover:shadow-md transition-shadow">
              <div className={`p-3 rounded-lg mr-5 ${item.status === 'complete' ? 'bg-green-50' : 'bg-blue-50'}`}>
                <FileText className={`h-6 w-6 ${item.status === 'complete' ? 'text-green-600' : 'text-blue-600'}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-800">
                        {item.file?.name || "Unknown File"}
                    </h4>
                    <p className="text-xs text-slate-400">
                        {item.file ? (item.file.size / 1024 / 1024).toFixed(2) : "0.00"} MB
                    </p>
                    </div>
                  <div className="flex items-center space-x-2">
                    {item.status === 'idle' && (
                      <button 
                        onClick={() => vectorizeFile(item.id, item.file)}
                        className="text-xs font-black bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition shadow-lg shadow-slate-900/10"
                      >
                        VECTORIZE
                      </button>
                    )}
                    {item.status === 'uploading' && (
                      <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase tracking-tighter">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Embedding...</span>
                      </div>
                    )}
                    {item.status === 'complete' && (
                      <div className="flex items-center space-x-1 text-green-600 font-bold text-xs uppercase tracking-tighter">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Ready for Depo</span>
                      </div>
                    )}
                    {item.status === 'error' && (
                      <span className="text-xs font-bold text-red-500 uppercase">Retry Failed</span>
                    )}
                  </div>
                </div>
                
                {item.status === 'uploading' && (
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div className="bg-blue-600 h-1.5 rounded-full animate-progress-indefinite" style={{ width: '100%' }}></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}