import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Shield, Database, Mic } from "lucide-react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "depoco | AI Deposition Assistant",
  description: "Real-time contradiction detection for medical malpractice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full bg-slate-50 flex flex-col md:flex-row">
        {/* Simple Side Navigation */}
        <nav className="w-full md:w-64 bg-slate-900 text-white flex flex-col p-6 space-y-8">
          <div className="flex items-center space-x-3 px-2">
            <Shield className="text-blue-400 h-8 w-8" />
            <span className="text-xl font-bold tracking-tight uppercase">depoco</span>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Link href="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition text-slate-300 hover:text-white">
              <Mic className="h-5 w-5" />
              <span>Live Session</span>
            </Link>
            <Link href="/vault" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition text-slate-300 hover:text-white bg-slate-800 text-white">
              <Database className="h-5 w-5" />
              <span>Evidence Vault</span>
            </Link>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}