"use client";
import { trackDashboardEvent } from "@/lib/dashboard-tracker";
import { TranslucentDatePicker } from "@/components/ui/translucent-date-picker";
import { NoResultsIllustration } from "@/components/ui/illustrations";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search,
  Upload,
  CheckCircle2,
  Check,
  AlertCircle,
  RefreshCw,
  Database,
  MapPin,
  Box,
  CalendarDays,
  Copy,
  X,
  ShieldCheck,
  Shield,
  ChevronDown,
  Clock,
  Building2,
  FileText,
} from "lucide-react";
const BRANCHES = [
  "Mumbai",
  "Coimbatore",
  "Thane",
  "Vizag",
  "Secunderabad",
  "Cochin",
  "Trivandrum",
  "Chennai",
  "Puducherry",
  "Bangalore",
  "Uttarakhand",
  "Ghaziabad",
  "Lucknow",
  "Jaipur",
  "Delhi",
  "Gurgaon",
  "Jammu and Kashmir",
  "Chandigarh",
  "Ludhiana",
  "Guwahati",
  "Tripura",
  "Jamshedpur",
  "Meghalaya",
  "Patna",
  "Kolkata",
  "Goa",
  "Pune",
  "Bhubaneswar",
  "Raipur",
  "Bhopal",
  "Nagpur",
  "Ahmedabad",
  "Baroda",
  "Indore",
  "Vijayawada",
  "Kochi",
  "gurugram",
  "nashik",
];
function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder,
  required = false,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(value.toLowerCase()),
  );
  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="glass-field-well px-3.5 py-1.5 flex items-center justify-between transition-all">
        <input
          type="text"
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-transparent border-none outline-none focus:ring-0 shadow-none text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 p-0"
          style={{ border: "none", outline: "none", boxShadow: "none", background: "transparent" }}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-muted-foreground hover:text-foreground shrink-0 ml-1.5 focus:outline-none"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180 text-sky-500",
            )}
          />
        </button>
      </div>
      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 w-full mt-2 rounded-2xl border border-slate-200/90 dark:border-white/15 bg-white/95 dark:bg-[#080b12]/95 backdrop-blur-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5"
          >
            {filteredOptions.map((opt, i) => (
              <div
                key={i}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-500/10 hover:text-sky-500 rounded-xl transition-colors cursor-pointer"
              >
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function CopyTermButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy Warranty Term"
      className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 border border-sky-300/40 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] transition-all shrink-0 active:scale-90 flex items-center justify-center cursor-pointer"
    >
      {copied ? (
        <Check className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white stroke-[3.5]" />
      ) : (
        <Copy className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white" />
      )}
    </button>
  );
}
export default function WarrantyFinderPage() {
  const [modelNumber, setModelNumber] = useState("");
  const [installationDate, setInstallationDate] = useState("");
  const [branch, setBranch] = useState("");
  const [activeTab, setActiveTab] = useState<'model' | 'subfamily'>('model');
  const [subFamily, setSubFamily] = useState("");
  const [dbModels, setDbModels] = useState<string[]>([]);
  const [dbSubFamilies, setDbSubFamilies] = useState<string[]>([]);
  const [searchResult, setSearchResult] = useState<any[] | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const soqlQuery = activeTab === 'model'
    ? "SELECT Warranty_Term__r.WarrantyTermName, Installation_From__c, Installation_To__c, Warranty_Term__r.WarrantyDuration, Warranty_Term__r.WarrantyUnitOfTime, Branch_Operator__c, Branch__c, Modals__c FROM Warranty_Conditions__c WHERE Warranty_Term__r.IsActive = true"
    : "SELECT Id, Product_Sub_Family__c, Product_Sub_Family_Operator__c, Warranty_Term__r.WarrantyTermName FROM Warranty_Conditions__c WHERE Warranty_Term__r.IsActive = true";

  useEffect(() => {
    fetch("/api/warranty-finder/models")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.models) {
          setDbModels(data.models);
        }
      })
      .catch((err) =>
        console.error("Failed to load models for autocomplete", err),
      );

    fetch("/api/warranty-finder/sub-families")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.subFamilies) {
          setDbSubFamilies(data.subFamilies);
        }
      })
      .catch((err) =>
        console.error("Failed to load sub-families for autocomplete", err),
      );
  }, []);
  useEffect(() => {
    if (uploadStatus.message) {
      const timer = setTimeout(() => {
        setUploadStatus({});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus.message]);
  const handleCopyQuery = () => {
    navigator.clipboard.writeText(soqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
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
      const res = await fetch("/api/warranty-finder/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelNumber, installationDate, branch }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSearchResult(data.conditions);
        trackDashboardEvent({
          metricKey: "warranty_checks",
          incrementBy: 1,
          event: {
            type: "warranty-check",
            label: "Warranty check",
            meta: modelNumber,
            module: "warranty-finder",
          }
        });
      } else {
        setSearchError(data.message || "No matching warranty term found.");
      }
    } catch (err) {
      setSearchError("Network error while searching.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubFamilySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError("");
    setSearchResult(null);
    try {
      const res = await fetch("/api/warranty-finder/search-sub-family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSubFamily: subFamily }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSearchResult(data.conditions);
        trackDashboardEvent({
          metricKey: "warranty_checks",
          incrementBy: 1,
          event: {
            type: "warranty-check",
            label: "Warranty check by sub-family",
            meta: subFamily,
            module: "warranty-finder",
          }
        });
      } else {
        setSearchError(data.message || "No matching warranty term found.");
      }
    } catch (err) {
      setSearchError("Network error while searching.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpload = async (content: string | File) => {
    setIsUploading(true);
    setUploadStatus({ message: "Uploading and syncing database..." });
    try {
      const formData = new FormData();
      if (typeof content === "string") {
        formData.append("csvText", content);
      } else {
        formData.append("csvFile", content);
      }
      formData.append("type", activeTab);
      const res = await fetch("/api/warranty-finder/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUploadStatus({
          success: true,
          message: `Successfully updated ${data.count} warranty terms in database.`,
        });
        setCsvText("");
      } else {
        setUploadStatus({
          success: false,
          message: `Upload failed: ${data.error || "Unknown error"}`,
        });
      }
    } catch (err) {
      setUploadStatus({
        success: false,
        message: "Network error during upload.",
      });
    } finally {
      setIsUploading(false);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };
  return (
    <div className="min-h-screen bg-transparent text-foreground font-sans selection:bg-primary/30 overflow-x-hidden relative">
      {" "}
      {/* Background Glows */}{" "}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />{" "}
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />{" "}
      {/* Navbar */}{" "}
      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {" "}
        {/* Hero Section */}{" "}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-12"
        >
          {" "}
          <h2 className="text-4xl font-extrabold text-foreground mb-4">
            Find Applicable Warranties
          </h2>{" "}
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            {" "}
            Enter the exact model number. Optionally refine by installation date
            or branch to find the exact matching term.{" "}
          </p>{" "}
        </motion.div>{" "}
        {/* Search Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
          className="flex justify-center mb-8 relative z-50"
        >
          <div className="glass-mode-toggle p-1.5 inline-flex relative">
            <button
              type="button"
              onClick={() => { setActiveTab('model'); setSearchError(""); setSearchResult(null); }}
              className={cn(
                "relative px-6 py-2 rounded-full text-sm font-bold transition-colors duration-200 z-10",
                activeTab === 'model'
                  ? "text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {activeTab === 'model' && (
                <motion.div
                  layoutId="activeTabBadge"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 rounded-full shadow-md shadow-blue-500/40 z-[-1] border border-sky-300/40"
                />
              )}
              Search by Model
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('subfamily'); setSearchError(""); setSearchResult(null); }}
              className={cn(
                "relative px-6 py-2 rounded-full text-sm font-bold transition-colors duration-200 z-10",
                activeTab === 'subfamily'
                  ? "text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {activeTab === 'subfamily' && (
                <motion.div
                  layoutId="activeTabBadge"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 rounded-full shadow-md shadow-blue-500/40 z-[-1] border border-sky-300/40"
                />
              )}
              Search by Sub Family
            </button>
          </div>
        </motion.div>

        {/* Search Bar - Unified Block */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          onSubmit={activeTab === 'model' ? handleSearch : handleSubFamilySearch}
          className="mb-12 relative z-50"
        >
          <div className="glass-search-bar p-2.5 sm:p-3 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 relative">
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === 'model' ? (
                  <motion.div
                    key="tab-model"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 w-full"
                  >
                    {/* Field 1: Model Number */}
                    <div className="flex-1 flex items-center gap-3 px-1 sm:px-2 py-1">
                      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-sky-500/10 dark:bg-sky-400/15 border border-sky-300/40 dark:border-sky-400/30 flex items-center justify-center text-sky-600 dark:text-sky-300 shrink-0 shadow-xs dark:shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                        <Box className="h-5 w-5" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-sky-200 uppercase tracking-wider mb-1 pl-0.5">
                          Model Number
                        </label>
                        <AutocompleteInput
                          options={dbModels}
                          value={modelNumber}
                          onChange={setModelNumber}
                          placeholder="Ex: CNHW12GAFU"
                          required
                        />
                      </div>
                    </div>

                    {/* Divider 1 */}
                    <div className="hidden md:block w-px h-10 bg-slate-300/70 dark:bg-white/15 shrink-0 self-center" />

                    {/* Field 2: Installation Date */}
                    <div className="flex-1 flex items-center gap-3 px-1 sm:px-2 py-1">
                      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-sky-500/10 dark:bg-sky-400/15 border border-sky-300/40 dark:border-sky-400/30 flex items-center justify-center text-sky-600 dark:text-sky-300 shrink-0 shadow-xs dark:shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                        <CalendarDays className="h-5 w-5" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-sky-200 uppercase tracking-wider mb-1 pl-0.5">
                          Installation Date
                        </label>
                        <TranslucentDatePicker
                          value={installationDate}
                          onChange={setInstallationDate}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Divider 2 */}
                    <div className="hidden md:block w-px h-10 bg-slate-300/70 dark:bg-white/15 shrink-0 self-center" />

                    {/* Field 3: Branch / City */}
                    <div className="flex-1 flex items-center gap-3 px-1 sm:px-2 py-1">
                      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-sky-500/10 dark:bg-sky-400/15 border border-sky-300/40 dark:border-sky-400/30 flex items-center justify-center text-sky-600 dark:text-sky-300 shrink-0 shadow-xs dark:shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                        <MapPin className="h-5 w-5" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-sky-200 uppercase tracking-wider mb-1 pl-0.5">
                          Branch / City
                        </label>
                        <AutocompleteInput
                          options={BRANCHES}
                          value={branch}
                          onChange={setBranch}
                          placeholder="Optional branch..."
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="tab-subfamily"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex-1 flex items-center gap-3 px-2 sm:px-3 py-1 w-full"
                  >
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-sky-500/10 dark:bg-sky-400/15 border border-sky-300/40 dark:border-sky-400/30 flex items-center justify-center text-sky-600 dark:text-sky-300 shrink-0 shadow-xs dark:shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                      <Box className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-sky-200 uppercase tracking-wider mb-1 pl-0.5">
                        Product Sub Family
                      </label>
                      <AutocompleteInput
                        options={dbSubFamilies}
                        value={subFamily}
                        onChange={setSubFamily}
                        placeholder="Ex: F1201, F1210..."
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={isSearching}
              className="bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 hover:from-sky-300 hover:via-blue-500 hover:to-blue-600 text-white rounded-full px-7 py-3 md:py-3.5 font-bold flex items-center justify-center gap-2.5 transition-all shadow-[0_8px_25px_rgba(2,132,199,0.38)] hover:shadow-[0_10px_30px_rgba(2,132,199,0.5)] active:scale-[0.98] disabled:opacity-50 shrink-0"
            >
              {isSearching ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5 text-white" strokeWidth={2.3} />
              )}
              <span className="w-px h-4 bg-white/40 inline-block" />
              <span className="text-sm font-bold tracking-wide">Search</span>
            </button>
          </div>
        </motion.form>
        {/* Results Section */}{" "}
        <AnimatePresence mode="wait">
          {" "}
          {searchError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-8 bg-muted/30 border border-border/50 rounded-2xl flex flex-col items-center justify-center text-center backdrop-blur-sm shadow-sm"
            >
              <NoResultsIllustration className="mb-4 text-slate-400 dark:text-slate-500 drop-shadow-sm" />
              <h3 className="text-base font-bold text-foreground">No Results Found</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1 max-w-sm">{searchError}</p>
            </motion.div>
          )}{" "}
          {searchResult && searchResult.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-2.5 w-2.5 rounded-full bg-sky-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(14,165,233,0.6)] dark:shadow-[0_0_10px_#22d3ee] shrink-0" />
                <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-sky-100 tracking-[0.2em] uppercase shrink-0">
                  {searchResult.length} MATCH{searchResult.length !== 1 ? "ES" : ""} FOUND
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-sky-400/50 via-slate-200 to-transparent dark:from-sky-400/40 dark:via-sky-500/20 dark:to-transparent" />
              </div>

              <div className="space-y-6">
                {searchResult.map((result, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.1 }}
                    key={idx}
                    className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-b from-white/75 via-sky-50/40 to-blue-50/50 dark:from-[#091738]/50 dark:via-[#061026]/42 dark:to-[#030816]/45 border border-sky-200/90 dark:border-sky-400/50 shadow-[0_20px_45px_rgba(14,165,233,0.12),0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_0_35px_rgba(14,165,233,0.22),0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl transition-all group"
                  >
                    {/* Top specular edge highlight */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 dark:via-sky-300/70 to-transparent pointer-events-none" />

                    {/* Cyber wave background overlay on top-right (Light Mode) */}
                    <div className="dark:hidden absolute top-0 right-0 w-80 h-48 pointer-events-none overflow-hidden select-none">
                      <svg viewBox="0 0 320 200" fill="none" className="w-full h-full opacity-80">
                        <defs>
                          <linearGradient id={`cyberGlow_light_${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.75" />
                            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id={`cyberFill_light_${idx}`} x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.12" />
                            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.04" />
                            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 60 0 C 130 70, 200 95, 320 100 L 320 0 Z"
                          fill={`url(#cyberFill_light_${idx})`}
                        />
                        <path
                          d="M 40 0 C 120 75, 210 105, 320 110"
                          stroke={`url(#cyberGlow_light_${idx})`}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          className="drop-shadow-[0_2px_8px_rgba(2,132,199,0.3)]"
                        />
                        <path
                          d="M 90 0 C 160 55, 240 80, 320 85"
                          stroke="#0284c7"
                          strokeWidth="1.2"
                          strokeOpacity="0.3"
                          className="drop-shadow-[0_1px_4px_rgba(2,132,199,0.2)]"
                        />
                      </svg>
                    </div>

                    {/* Cyber wave background overlay on top-right (Dark Mode) */}
                    <div className="hidden dark:block absolute top-0 right-0 w-80 h-48 pointer-events-none overflow-hidden select-none">
                      <svg viewBox="0 0 320 200" fill="none" className="w-full h-full opacity-90">
                        <defs>
                          <linearGradient id={`cyberGlow_${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id={`cyberFill_${idx}`} x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                            <stop offset="60%" stopColor="#0369a1" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 60 0 C 130 70, 200 95, 320 100 L 320 0 Z"
                          fill={`url(#cyberFill_${idx})`}
                        />
                        <path
                          d="M 40 0 C 120 75, 210 105, 320 110"
                          stroke={`url(#cyberGlow_${idx})`}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]"
                        />
                        <path
                          d="M 90 0 C 160 55, 240 80, 320 85"
                          stroke="#38bdf8"
                          strokeWidth="1.2"
                          strokeOpacity="0.4"
                          className="drop-shadow-[0_0_5px_rgba(56,189,248,0.6)]"
                        />
                      </svg>
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/10 dark:bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-10 w-48 h-48 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Row: Shield Avatar + Info on Left, Applicable Badge on Right */}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-7">
                      <div className="flex items-center gap-4 sm:gap-5">
                        {/* Circular Shield Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-[74px] h-[74px] sm:w-[82px] sm:h-[82px] rounded-full p-[2.5px] bg-gradient-to-b from-sky-400 via-blue-500 to-sky-600 dark:to-sky-700 shadow-[0_4px_20px_rgba(14,165,233,0.35)] dark:shadow-[0_0_25px_rgba(14,165,233,0.45),inset_0_0_15px_rgba(14,165,233,0.3)]">
                            <div className="w-full h-full rounded-full bg-gradient-to-b from-sky-50 to-blue-100/90 dark:from-[#0b224d] dark:to-[#040e22] flex items-center justify-center border border-sky-200 dark:border-sky-400/40">
                              <Shield className="w-9 h-9 sm:w-10 sm:h-10 text-sky-600 fill-sky-500/15 drop-shadow-[0_2px_8px_rgba(14,165,233,0.35)] dark:text-sky-400 dark:fill-sky-400/10 stroke-[1.8] dark:drop-shadow-[0_0_10px_rgba(56,189,248,0.85)]" />
                            </div>
                          </div>
                          {/* Attached Green Check Badge */}
                          <div className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-white dark:border-[#061026] flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.5)] dark:shadow-[0_0_12px_rgba(16,185,129,0.8)]">
                            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white stroke-[3.5]" />
                          </div>
                        </div>

                        {/* Title & Badge */}
                        <div>
                          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-300/80 dark:border-sky-400/40 text-[11px] font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-400 shadow-xs dark:shadow-[0_0_10px_rgba(14,165,233,0.2)] mb-2">
                            WARRANTY TERM
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="text-2xl sm:text-3xl lg:text-3.5xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-none dark:drop-shadow-sm">
                              {result.termName}
                            </h4>
                            <CopyTermButton text={result.termName} />
                          </div>
                        </div>
                      </div>

                      {/* APPLICABLE Badge */}
                      <div className="shrink-0 self-start md:self-center">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-50 dark:bg-[#031d13]/85 border-2 border-emerald-500/80 dark:border-emerald-500/70 shadow-[0_4px_16px_rgba(16,185,129,0.18)] dark:shadow-[0_0_24px_rgba(16,185,129,0.35),inset_0_0_12px_rgba(16,185,129,0.2)] backdrop-blur-md">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.5)] dark:shadow-[0_0_10px_rgba(16,185,129,0.9)]">
                            <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                          </div>
                          <span className="text-xs sm:text-sm font-black tracking-widest text-emerald-800 dark:text-emerald-300 uppercase">
                            APPLICABLE
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Recessed Stats Container */}
                    <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-sky-50/70 dark:bg-[#030919]/75 border border-sky-200/80 dark:border-sky-500/25 shadow-inner backdrop-blur-xl">
                      {activeTab === 'model' ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-sky-200/80 dark:divide-sky-500/15">
                          {/* Duration */}
                          <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-3 pt-3 md:pt-0">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-white to-sky-50 dark:from-[#0a234f] dark:to-[#051126] border border-sky-200 dark:border-sky-400/40 flex items-center justify-center shadow-xs dark:shadow-[0_0_15px_rgba(14,165,233,0.35)] shrink-0">
                              <Clock className="w-5 h-5 text-sky-600 dark:text-sky-300 stroke-[2]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                DURATION
                              </p>
                              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
                                {result.duration} {result.unitOfTime}
                              </p>
                            </div>
                          </div>

                          {/* Valid From */}
                          <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-3 pt-3 md:pt-0">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-white to-sky-50 dark:from-[#0a234f] dark:to-[#051126] border border-sky-200 dark:border-sky-400/40 flex items-center justify-center shadow-xs dark:shadow-[0_0_15px_rgba(14,165,233,0.35)] shrink-0">
                              <CalendarDays className="w-5 h-5 text-sky-600 dark:text-sky-300 stroke-[2]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                VALID FROM
                              </p>
                              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
                                {result.installationFrom
                                  ? new Date(result.installationFrom).toLocaleDateString("en-GB")
                                  : "Anytime"}
                              </p>
                            </div>
                          </div>

                          {/* Valid Until */}
                          <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-3 pt-3 md:pt-0">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-white to-sky-50 dark:from-[#0a234f] dark:to-[#051126] border border-sky-200 dark:border-sky-400/40 flex items-center justify-center shadow-xs dark:shadow-[0_0_15px_rgba(14,165,233,0.35)] shrink-0">
                              <CalendarDays className="w-5 h-5 text-sky-600 dark:text-sky-300 stroke-[2]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                VALID UNTIL
                              </p>
                              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
                                {result.installationTo
                                  ? new Date(result.installationTo).toLocaleDateString("en-GB")
                                  : "Anytime"}
                              </p>
                            </div>
                          </div>

                          {/* Branch */}
                          <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-3 pt-3 md:pt-0">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-white to-sky-50 dark:from-[#0a234f] dark:to-[#051126] border border-sky-200 dark:border-sky-400/40 flex items-center justify-center shadow-xs dark:shadow-[0_0_15px_rgba(14,165,233,0.35)] shrink-0">
                              <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-300 stroke-[2]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                BRANCH
                              </p>
                              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
                                {result.branchOperator
                                  ? `${result.branchOperator} ${result.branches ? "Specific" : ""}`
                                  : "All Branches"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-sky-200/80 dark:divide-sky-500/15">
                          {/* Match Rule */}
                          <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-3 pt-3 md:pt-0">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-white to-sky-50 dark:from-[#0a234f] dark:to-[#051126] border border-sky-200 dark:border-sky-400/40 flex items-center justify-center shadow-xs dark:shadow-[0_0_15px_rgba(14,165,233,0.35)] shrink-0">
                              <Box className="w-5 h-5 text-sky-600 dark:text-sky-300 stroke-[2]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                MATCH RULE
                              </p>
                              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
                                {result.operator || "Equals"}
                              </p>
                            </div>
                          </div>

                          {/* Sub Family */}
                          <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-3 pt-3 md:pt-0">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-white to-sky-50 dark:from-[#0a234f] dark:to-[#051126] border border-sky-200 dark:border-sky-400/40 flex items-center justify-center shadow-xs dark:shadow-[0_0_15px_rgba(14,165,233,0.35)] shrink-0">
                              <FileText className="w-5 h-5 text-sky-600 dark:text-sky-300 stroke-[2]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                SUB FAMILY
                              </p>
                              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
                                {result.subFamily || subFamily || "All"}
                              </p>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-3 pt-3 md:pt-0">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-white to-sky-50 dark:from-[#0a234f] dark:to-[#051126] border border-sky-200 dark:border-sky-400/40 flex items-center justify-center shadow-xs dark:shadow-[0_0_15px_rgba(14,165,233,0.35)] shrink-0">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 stroke-[2]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                STATUS
                              </p>
                              <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 tracking-tight truncate">
                                Active Condition
                              </p>
                            </div>
                          </div>

                          {/* Branch */}
                          <div className="flex items-center gap-3.5 sm:gap-4 px-2 sm:px-3 pt-3 md:pt-0">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-white to-sky-50 dark:from-[#0a234f] dark:to-[#051126] border border-sky-200 dark:border-sky-400/40 flex items-center justify-center shadow-xs dark:shadow-[0_0_15px_rgba(14,165,233,0.35)] shrink-0">
                              <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-300 stroke-[2]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                BRANCH
                              </p>
                              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
                                All Branches
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}{" "}
        </AnimatePresence>{" "}
        {/* Sync Data Section (Admin) */}{" "}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="max-w-5xl mx-auto mt-16 relative z-0"
        >
          {" "}
          <div className="app-card p-6 md:p-8 shadow-xl">
            {" "}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              {" "}
              <div>
                {" "}
                <h2 className="text-base font-bold flex items-center gap-2 text-foreground mb-4">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  Database Synchronization
                </h2>
                <div className="p-4 rounded-xl bg-muted/30 border border-border flex flex-col gap-3 mb-2">
                  <p className="text-sm text-foreground">
                    For update the model list, kindly copy this query and paste
                    it in Salesforce Inspector. Then, upload the extracted CSV
                    data below.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <pre className="flex-1 p-3 rounded-lg bg-background text-primary font-mono text-xs overflow-x-auto border border-border shadow-inner whitespace-pre-wrap">
                      {soqlQuery}
                    </pre>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCopyQuery();
                      }}
                      className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 hover:from-sky-300 hover:via-blue-500 hover:to-blue-600 text-white font-bold transition-all shadow-[0_4px_16px_rgba(2,132,199,0.35)] hover:shadow-[0_6px_22px_rgba(2,132,199,0.45)] active:scale-[0.98] flex items-center justify-center gap-2 h-full"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy Query</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <AnimatePresence>
              {" "}
              {uploadStatus.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${uploadStatus.success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
                >
                  {" "}
                  {uploadStatus.success ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0" />
                  )}{" "}
                  <p className="text-sm font-medium">
                    {uploadStatus.message}
                  </p>{" "}
                </motion.div>
              )}{" "}
            </AnimatePresence>{" "}
            <div className="grid md:grid-cols-2 gap-6">
              {" "}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed border-border/80 dark:border-white/[0.1] rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 relative group",
                  isDragging ? "border-primary bg-primary/20 scale-[1.02] shadow-lg" : "bg-surface-recessed/40 dark:bg-[#06070a]/60 hover:bg-surface-recessed/60 dark:hover:bg-[#06070a]/80"
                )}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4">
                  <Upload
                    className={cn("h-5 w-5 transition-all", isDragging ? "-translate-y-1 animate-bounce" : "")}
                  />
                </div>
                <p className={cn("text-sm font-bold transition-colors", isDragging ? "text-primary" : "text-foreground")}>
                  {isDragging ? "Drop CSV File Here!" : "Upload CSV File"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 text-center">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1 text-center">
                  Supports .csv files up to 10MB
                </p>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
              <div className="relative">
                <textarea
                  className="w-full h-full min-h-[200px] rounded-2xl border-2 border-dashed border-border/80 dark:border-white/[0.1] bg-surface-recessed/40 dark:bg-[#06070a]/60 p-6 text-xs font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 resize-none text-foreground placeholder:text-muted-foreground/60 transition-all duration-300"
                  placeholder="Or paste raw CSV text here..."
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  disabled={isUploading}
                />
                {!csvText && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute bottom-4 right-4 text-[10px] text-muted-foreground/60">
                  {csvText.length} characters
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => handleUpload(csvText)}
                disabled={isUploading || !csvText.trim()}
                className="w-full md:w-auto px-10 bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 hover:from-sky-300 hover:via-blue-500 hover:to-blue-600 text-white font-bold text-sm py-3.5 rounded-full transition-all flex justify-center items-center gap-2 shadow-[0_6px_20px_rgba(2,132,199,0.35)] hover:shadow-[0_8px_25px_rgba(2,132,199,0.45)] active:scale-[0.98] disabled:opacity-50"
              >
                {isUploading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>
                  {isUploading ? "Syncing Database..." : "Synchronize Database"}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
