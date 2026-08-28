import { useState, useEffect } from 'react';
import { Copy, Check, ChevronRight, Search, FileWarning, ArrowRightLeft, RefreshCw } from 'lucide-react';
import { parseAssetTransferPairs, parseProductRecordResults } from '../lib/parsers';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function SOQLView({ apiUrl }: { apiUrl: string }) {
  const [mode, setMode] = useState<'asset' | 'product' | 'template'>('asset');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Database Templates
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  useEffect(() => {
    if (mode === 'template') {
      fetchTemplates();
    }
  }, [mode, apiUrl]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/templates/`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
        if (data.length > 0 && !selectedTemplate) {
          setSelectedTemplate(data[0].id);
        }
      }
    } catch (e) {
      console.error("DB Connection Failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = () => {
    if (!input.trim()) return;
    
    if (mode === 'asset') {
      const pairs = parseAssetTransferPairs(input);
      if (pairs.length > 0) {
        const out = pairs.map(p => `"${p.componentId}"\\t"${p.newCid}"`).join('\\n');
        setOutput(`"Id"\\t"New_CID__c"\\n` + out);
      } else {
        setOutput('No valid Asset Transfer IDs found.');
      }
    } else if (mode === 'product') {
      const result = parseProductRecordResults(input);
      if (result.output) {
        setOutput(result.output);
      } else {
        setOutput('No valid Product records found.');
      }
    } else if (mode === 'template') {
      // Basic substitution logic for templates fetched from DB
      const tmpl = templates.find(t => t.id === selectedTemplate);
      if (tmpl) {
        const ids = input.split(/[\\n\\s,]+/).filter(Boolean);
        const formattedIds = ids.map(id => `'${id}'`).join(',\\n');
        const generated = tmpl.content.replace('{{tickets}}', formattedIds);
        setOutput(generated);
      } else {
        setOutput('Please select a valid template from the Database.');
      }
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full p-5 gap-4">
      {/* Tool Selector */}
      <div className="flex bg-[#0a0a0c] p-1 rounded-xl border border-white/5 shrink-0">
        <button 
          onClick={() => { setMode('asset'); setOutput(''); }}
          className={cn("flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2", mode === 'asset' ? "bg-indigo-600/20 text-indigo-400" : "text-slate-500 hover:text-slate-300 hover:bg-white/5")}
        >
          <ArrowRightLeft className="h-4 w-4" /> Asset
        </button>
        <button 
          onClick={() => { setMode('product'); setOutput(''); }}
          className={cn("flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2", mode === 'product' ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300 hover:bg-white/5")}
        >
          <FileWarning className="h-4 w-4" /> Product
        </button>
        <button 
          onClick={() => { setMode('template'); setOutput(''); }}
          className={cn("flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2", mode === 'template' ? "bg-blue-500/20 text-blue-400" : "text-slate-500 hover:text-slate-300 hover:bg-white/5")}
        >
          <Search className="h-4 w-4" /> DB Templates
        </button>
      </div>

      {mode === 'template' && (
        <div className="flex items-center gap-2 shrink-0">
          <select 
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="flex-1 bg-[#0a0a0c] border border-white/10 rounded-lg p-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {templates.length === 0 ? (
              <option value="">No templates found in DB</option>
            ) : (
              templates.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))
            )}
          </select>
          <button onClick={fetchTemplates} className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 flex-1 min-h-0">
        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Input Data</label>
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste IDs, rows, or spreadsheet data here..."
          className="flex-1 min-h-0 resize-none rounded-xl border border-white/5 bg-[#0a0a0c] p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors custom-scrollbar placeholder:text-slate-600"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={handleProcess}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          Execute Process <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2 flex-1 min-h-0">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Result Output</label>
          <button 
            onClick={handleCopy} 
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 bg-[#0a0a0c]"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span className="text-[11px] font-bold uppercase">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <textarea 
          readOnly
          value={output}
          placeholder="Results will be generated here..."
          className="flex-1 min-h-0 resize-none rounded-xl border border-white/5 bg-[#0a0a0c] p-4 text-xs font-mono text-slate-400 focus:outline-none custom-scrollbar placeholder:text-slate-600"
        />
      </div>
    </div>
  );
}

