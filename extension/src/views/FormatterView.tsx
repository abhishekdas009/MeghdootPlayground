import { useState } from 'react';
import { Copy, Check, Trash2, ChevronRight } from 'lucide-react';
import { parseCaseIds } from '../lib/parsers';

export default function FormatterView() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleProcess = () => {
    const ids = parseCaseIds(input);
    if (ids.length > 0) {
      setOutput(ids.join('\\n'));
    } else {
      setOutput('No Case IDs found in input.');
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
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Ticket Formatter</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Extract and format Salesforce Case IDs</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1 min-h-0">
        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Raw Input</label>
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text containing case numbers (e.g., 00123456)..."
          className="flex-1 min-h-0 resize-none rounded-xl border border-transparent bg-transparent p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-transparent transition-colors custom-scrollbar placeholder:text-slate-600"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={handleProcess}
          className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          Format Tickets <ChevronRight className="h-4 w-4" />
        </button>
        <button 
          onClick={() => { setInput(''); setOutput(''); }}
          className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2 flex-1 min-h-0">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Cleaned Output</label>
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
          placeholder="Cleaned IDs will appear here..."
          className="flex-1 min-h-0 resize-none rounded-xl border border-transparent bg-transparent p-4 text-xs font-mono text-slate-400 focus:outline-none custom-scrollbar placeholder:text-slate-600"
        />
      </div>
    </div>
  );
}

