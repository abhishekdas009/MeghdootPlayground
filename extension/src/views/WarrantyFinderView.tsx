import { useState, useEffect } from 'react';
import { Search, Box, CalendarDays, MapPin, AlertCircle, RefreshCw, Copy } from 'lucide-react';

const BRANCHES = [
  "Mumbai", "Coimbatore", "Thane", "Vizag", "Secunderabad", "Cochin", 
  "Trivandrum", "Chennai", "Puducherry", "Bangalore", "Uttarakhand", 
  "Ghaziabad", "Lucknow", "Jaipur", "Delhi", "Gurgaon", "Jammu and Kashmir", 
  "Chandigarh", "Ludhiana", "Guwahati", "Tripura", "Jamshedpur", "Meghalaya", 
  "Patna", "Kolkata", "Goa", "Pune", "Bhubaneswar", "Raipur", "Bhopal", 
  "Nagpur", "Ahmedabad", "Baroda", "Indore", "Vijayawada", "Kochi", "gurugram", "nashik"
];

export default function WarrantyFinderView({ apiUrl }: { apiUrl: string }) {
  const [modelNumber, setModelNumber] = useState("");
  const [installationDate, setInstallationDate] = useState("");
  const [branch, setBranch] = useState("");
  
  const [dbModels, setDbModels] = useState<string[]>([]);
  const [searchResult, setSearchResult] = useState<any[] | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Assuming Next.js is running on port 3000
  const nextApiUrl = apiUrl.includes('8000') ? apiUrl.replace('8000/api/v1', '3000/api') : apiUrl.replace('/v1', '');

  useEffect(() => {
    fetch(`${nextApiUrl}/warranty-finder/models`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.models) {
          setDbModels(data.models);
        }
      })
      .catch(err => console.error("Failed to load models for autocomplete", err));
  }, [nextApiUrl]);

  const handleDatePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    const match = pasted.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    if (match) {
      e.preventDefault();
      setInstallationDate(`${match[3]}-${match[2]}-${match[1]}`);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError("");
    setSearchResult(null);

    try {
      const res = await fetch(`${nextApiUrl}/warranty-finder/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelNumber, installationDate, branch })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSearchResult(data.conditions);
      } else {
        setSearchError(data.message || 'No matching warranty term found.');
      }
    } catch (err) {
      setSearchError('Network error while searching.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-5 gap-4 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Warranty Finder</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Find applicable warranty terms</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3 shrink-0">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Model Number</label>
          <div className="relative">
            <Box className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text"
              required
              placeholder="Ex: CNHW12GAFU"
              value={modelNumber}
              onChange={e => setModelNumber(e.target.value)}
              list="model-list"
              className="w-full bg-[#0a0a0c] border border-white/5 rounded-xl py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <datalist id="model-list">
              {dbModels.map(m => <option key={m} value={m} />)}
            </datalist>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Installation Date (Optional)</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="date"
              value={installationDate}
              onChange={e => setInstallationDate(e.target.value)}
              onPaste={handleDatePaste}
              className="w-full bg-[#0a0a0c] border border-white/5 rounded-xl py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Branch (Optional)</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Optional branch..."
              value={branch}
              onChange={e => setBranch(e.target.value)}
              list="branch-list"
              className="w-full bg-[#0a0a0c] border border-white/5 rounded-xl py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <datalist id="branch-list">
              {BRANCHES.map(b => <option key={b} value={b} />)}
            </datalist>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isSearching}
          className="mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span>Search Warranty</span>
        </button>
      </form>

      {/* Results */}
      {searchError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="text-xs font-medium">{searchError}</p>
        </div>
      )}

      {searchResult && searchResult.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {searchResult.length} Match{searchResult.length !== 1 ? 'es' : ''} Found
            </h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {searchResult.map((result, idx) => (
              <div key={idx} className="bg-[#0a0a0c] border-l-4 border-indigo-500 rounded-xl p-4 shadow-lg relative flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Warranty Term</p>
                    <h4 className="text-sm font-bold text-slate-200">{result.termName}</h4>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(result.termName)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <div className="h-px w-full bg-white/5" />
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Duration</p>
                    <p className="text-xs font-semibold text-slate-300">{result.duration} {result.unitOfTime}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Branch</p>
                    <p className="text-xs font-semibold text-slate-300">{result.branchOperator ? `${result.branchOperator} ${result.branches ? 'Specific' : ''}` : 'All Branches'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Valid From</p>
                    <p className="text-xs font-semibold text-slate-300">{result.installationFrom ? new Date(result.installationFrom).toLocaleDateString('en-GB') : 'Anytime'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Valid Until</p>
                    <p className="text-xs font-semibold text-slate-300">{result.installationTo ? new Date(result.installationTo).toLocaleDateString('en-GB') : 'Anytime'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
