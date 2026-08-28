import { useState, useEffect } from 'react';
import { Database, Settings, FolderGit2, XCircle, ArrowRightLeft, UserPlus, CheckCircle2, Ban, FileSearch } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import SOQLView from './views/SOQLView';
import FormatterView from './views/FormatterView';
import SettingsView from './views/SettingsView';
import WarrantyFinderView from './views/WarrantyFinderView';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'soql' | 'formatter' | 'settings' | 'warranty'>('soql');
  const [apiUrl, setApiUrl] = useState('http://localhost:8000/api/v1');

  useEffect(() => {
    const saved = localStorage.getItem('meghdoot_api_url');
    if (saved) setApiUrl(saved);
  }, []);

  const saveApiUrl = (url: string) => {
    localStorage.setItem('meghdoot_api_url', url);
    setApiUrl(url);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#0a0a0c] border-b border-white/5 shrink-0">
        <div className="group relative flex items-center h-8 cursor-pointer">
          {/* Default State */}
          <div className="flex items-center gap-3 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2 group-hover:pointer-events-none">
            <img src="/icon.png" alt="Meghdoot" className="h-7 w-7 rounded-md shadow-lg shadow-indigo-500/20" onError={(e) => { e.currentTarget.style.display='none' }} />
            <h1 className="font-bold text-sm tracking-wide text-white">Meghdoot</h1>
          </div>
          
          {/* Hover State */}
          <div className="absolute inset-y-0 left-0 flex items-center gap-2 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none">
            <span className="text-xs font-bold tracking-tight text-slate-400 italic whitespace-nowrap">
              Made by
            </span>
            <div className="h-6 w-20">
              <img
                src="/signature-white-cropped.png"
                alt="Abhishek signature"
                className="h-full w-full object-contain object-left opacity-90"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">DB Connected</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar */}
        <div className="w-16 sm:w-56 bg-[#0a0a0c] border-r border-white/5 flex flex-col py-3 gap-2 shrink-0">
          <div className="px-3">
            <button 
              onClick={() => setActiveTab('soql')}
              className={cn("w-full flex items-center gap-3 p-2.5 sm:px-3 sm:py-2.5 rounded-xl transition-all shadow-sm", activeTab === 'soql' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200")}
            >
              <Database className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold hidden sm:block">SOQL Builder</span>
            </button>
          </div>
          
          <div className="mt-4 px-4 hidden sm:block">
            <h3 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2">Quick Actions</h3>
            <div className="flex flex-col gap-1">
              <button className="flex items-center gap-3 py-2 px-1 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                <span className="text-[11px] font-medium">Cancellation</span>
              </button>
              <button className="flex items-center gap-3 py-2 px-1 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <ArrowRightLeft className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-[11px] font-medium">Asset Transfer</span>
              </button>
              <button className="flex items-center gap-3 py-2 px-1 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <UserPlus className="h-4 w-4 text-yellow-500 shrink-0" />
                <span className="text-[11px] font-medium">Case Assign</span>
              </button>
              <button className="flex items-center gap-3 py-2 px-1 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium">Update Accepted</span>
              </button>
              <button className="flex items-center gap-3 py-2 px-1 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <Ban className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-[11px] font-medium">Update None</span>
              </button>
            </div>
          </div>

          <div className="px-3 mt-2 border-t border-white/5 pt-3 flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('formatter')}
              className={cn("w-full flex items-center gap-3 p-2.5 sm:px-3 sm:py-2.5 rounded-xl transition-all shadow-sm", activeTab === 'formatter' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200")}
            >
              <FolderGit2 className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold hidden sm:block">Formatter</span>
            </button>
            <button 
              onClick={() => setActiveTab('warranty')}
              className={cn("w-full flex items-center gap-3 p-2.5 sm:px-3 sm:py-2.5 rounded-xl transition-all shadow-sm", activeTab === 'warranty' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200")}
            >
              <FileSearch className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold hidden sm:block">Warranty Finder</span>
            </button>
          </div>

          <div className="mt-auto px-3">
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn("w-full flex items-center gap-3 p-2.5 sm:px-3 sm:py-2.5 rounded-xl transition-all shadow-sm", activeTab === 'settings' ? "bg-white/10 text-slate-200" : "text-slate-400 hover:bg-white/5 hover:text-slate-200")}
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold hidden sm:block">Settings</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col bg-[#050505] min-w-0">
          {activeTab === 'soql' && <SOQLView apiUrl={apiUrl} />}
          {activeTab === 'formatter' && <FormatterView />}
          {activeTab === 'settings' && <SettingsView apiUrl={apiUrl} onSave={saveApiUrl} />}
          {activeTab === 'warranty' && <WarrantyFinderView apiUrl={apiUrl} />}
        </div>
      </div>
    </div>
  );
}
