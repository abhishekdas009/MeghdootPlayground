import { useState } from 'react';
import { Database, Check, Zap } from 'lucide-react';

export default function SettingsView({ apiUrl, onSave }: { apiUrl: string, onSave: (url: string) => void }) {
  const [inputUrl, setInputUrl] = useState(apiUrl);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    let finalUrl = inputUrl.trim();
    if (finalUrl && !finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl;
    }
    // ensure no trailing slash
    if (finalUrl.endsWith('/')) {
      finalUrl = finalUrl.slice(0, -1);
    }
    // ensure it points to /api/v1 if they just entered the domain
    if (!finalUrl.includes('/api/v1')) {
      finalUrl = finalUrl + '/api/v1';
    }

    onSave(finalUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Extension Settings</h2>
        <p className="text-xs text-slate-400">Configure your connection to the Meghdoot Database Backend.</p>
      </div>

      <div className="space-y-4 bg-[#0a0a0c] p-5 rounded-2xl border border-white/5 shadow-lg">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2 mb-1">
            <Database className="h-4 w-4 text-indigo-400" /> API Endpoint URL
          </label>
          <p className="text-[11px] text-slate-500 mb-3">
            Enter the URL where your FastAPI backend is running. This enables live SOQL templates and database synchronization.
          </p>
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="http://localhost:8000/api/v1"
            className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-sm font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
          />
        </div>
        
        <button 
          onClick={handleSave}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          {saved ? <Check className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          {saved ? 'Connection Saved!' : 'Update Connection'}
        </button>
      </div>
      
      <div className="mt-auto pt-4 border-t border-white/5">
        <p className="text-[10px] text-slate-500 text-center">
          Meghdoot Chrome Extension v1.0<br />
          Highly Stable & Optimized Native Build
        </p>
      </div>
    </div>
  );
}

