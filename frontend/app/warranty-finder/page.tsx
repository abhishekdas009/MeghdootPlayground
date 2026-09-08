"use client";
import { trackDashboardEvent } from "@/lib/dashboard-tracker";
import { TranslucentDatePicker } from "@/components/ui/translucent-date-picker";
import { NoResultsIllustration } from "@/components/ui/illustrations";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Upload,
  CheckCircle2,
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
  icon: Icon,
  required = false,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  icon: React.ElementType;
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
      {" "}
      <div className="flex items-center gap-3">
        {" "}
        <Icon className="h-5 w-5 text-muted-foreground shrink-0" />{" "}
        <div className="w-full relative">
          {" "}
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
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-base font-semibold text-foreground placeholder:text-slate-500 pb-1"
          />{" "}
        </div>{" "}
        {isOpen && (
          <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 transform rotate-180 transition-transform" />
        )}{" "}
        {!isOpen && (
          <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 transition-transform" />
        )}{" "}
      </div>{" "}
      <AnimatePresence>
        {" "}
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 w-full mt-4 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
          >
            {" "}
            {filteredOptions.map((opt, i) => (
              <div
                key={i}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className="px-4 py-3 hover:bg-blue-600-white border-b border-border last:border-0 transition-colors"
              >
                {" "}
                {opt}{" "}
              </div>
            ))}{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
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
      className="p-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
    >
      {" "}
      {copied ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}{" "}
    </button>
  );
}
export default function WarrantyFinderPage() {
  const [modelNumber, setModelNumber] = useState("");
  const [installationDate, setInstallationDate] = useState("");
  const [branch, setBranch] = useState("");
  const [dbModels, setDbModels] = useState<string[]>([]);
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
  const soqlQuery =
    "SELECT Warranty_Term__r.WarrantyTermName, Installation_From__c, Installation_To__c, Warranty_Term__r.WarrantyDuration, Warranty_Term__r.WarrantyUnitOfTime, Branch_Operator__c, Branch__c, Modals__c FROM Warranty_Conditions__c WHERE Warranty_Term__r.IsActive = true";
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
        {/* Search Bar - Unified Block */}{" "}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          onSubmit={handleSearch}
          className="mb-12 relative z-50"
        >
          {" "}
          <div className="flex flex-col md:flex-row app-card !rounded-2xl md:!rounded-full p-2 shadow-2xl relative">
            {" "}
            <div className="flex-1 px-4 py-2 border-b md:border-b-0 md:border-r border-border">
              {" "}
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 ml-8">
                Model Number
              </p>{" "}
              <AutocompleteInput
                icon={Box}
                options={dbModels}
                value={modelNumber}
                onChange={setModelNumber}
                placeholder="Ex: CNHW12GAFU"
                required
              />{" "}
            </div>{" "}
            <div className="flex-1 px-4 py-2 border-b md:border-b-0 md:border-r border-border">
              {" "}
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 ml-8">
                Installation Date
              </p>{" "}
              <div className="flex items-center gap-3">
                {" "}
                <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />{" "}
                <TranslucentDatePicker
                  value={installationDate}
                  onChange={setInstallationDate}
                  className="w-full"
                />{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex-1 px-4 py-2">
              {" "}
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 ml-8">
                Branch / City
              </p>{" "}
              <AutocompleteInput
                icon={MapPin}
                options={BRANCHES}
                value={branch}
                onChange={setBranch}
                placeholder="Optional branch..."
              />{" "}
            </div>{" "}
            <button
              type="submit"
              disabled={isSearching}
              className="mt-4 md:mt-0 md:ml-2 bg-blue-600-white px-8 py-4 md:py-0 rounded-xl md:rounded-full font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {" "}
              {isSearching ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}{" "}
              <span>Search</span>{" "}
            </button>{" "}
          </div>{" "}
        </motion.form>{" "}
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
              {" "}
              <div className="flex items-center gap-2 mb-4">
                {" "}
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />{" "}
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  {" "}
                  {searchResult.length} Match
                  {searchResult.length !== 1 ? "es" : ""} Found{" "}
                </h3>{" "}
              </div>{" "}
              <div className="space-y-6">
                {" "}
                {searchResult.map((result, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    key={idx}
                    className="app-card border-l-4 border-l-blue-500 !border-l-solid p-6 shadow-xl relative overflow-hidden"
                  >
                    {" "}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                      {" "}
                      <div className="flex items-start gap-4">
                        {" "}
                        <div className="relative shrink-0">
                          {" "}
                          <div className="h-14 w-14 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
                            {" "}
                            <Shield className="h-7 w-7 text-blue-500" />{" "}
                          </div>{" "}
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                            {" "}
                            <CheckCircle2 className="h-3 w-3 text-foreground " />{" "}
                          </div>{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">
                            Warranty Term
                          </p>{" "}
                          <div className="flex items-center gap-3">
                            {" "}
                            <h4 className="text-xl md:text-2xl font-bold text-foreground ">
                              {" "}
                              {result.termName}{" "}
                            </h4>{" "}
                            <CopyTermButton text={result.termName} />{" "}
                          </div>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div className="shrink-0 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        {" "}
                        <CheckCircle2 className="h-4 w-4" />{" "}
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Applicable
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="h-px w-full bg-white/5 mb-6" />{" "}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {" "}
                      <div>
                        {" "}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {" "}
                          <Clock className="h-3.5 w-3.5 text-muted-foreground " />{" "}
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Duration
                          </p>{" "}
                        </div>{" "}
                        <p className="text-sm font-semibold text-foreground ">
                          {" "}
                          {result.duration} {result.unitOfTime}{" "}
                        </p>{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {" "}
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground " />{" "}
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Valid From
                          </p>{" "}
                        </div>{" "}
                        <p className="text-sm font-semibold text-foreground ">
                          {" "}
                          {result.installationFrom
                            ? new Date(
                                result.installationFrom,
                              ).toLocaleDateString("en-GB")
                            : "Anytime"}{" "}
                        </p>{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {" "}
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground " />{" "}
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Valid Until
                          </p>{" "}
                        </div>{" "}
                        <p className="text-sm font-semibold text-foreground ">
                          {" "}
                          {result.installationTo
                            ? new Date(
                                result.installationTo,
                              ).toLocaleDateString("en-GB")
                            : "Anytime"}{" "}
                        </p>{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {" "}
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground " />{" "}
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Branch
                          </p>{" "}
                        </div>{" "}
                        <p className="text-sm font-semibold text-foreground ">
                          {" "}
                          {result.branchOperator
                            ? `${result.branchOperator} ${result.branches ? "Specific" : ""}`
                            : "All Branches"}{" "}
                        </p>{" "}
                      </div>{" "}
                    </div>{" "}
                  </motion.div>
                ))}{" "}
              </div>{" "}
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
                      className="shrink-0 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-colors flex items-center justify-center gap-2 h-full"
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
                className={`border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300 relative group ${isDragging ? "border-primary bg-primary/20 scale-[1.02] shadow-lg" : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-md"}`}
              >
                {" "}
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                  {" "}
                  <Upload
                    className={`h-5 w-5 text-foreground transition-all ${isDragging ? "-translate-y-1 animate-bounce" : ""}`}
                  />{" "}
                </div>{" "}
                <p
                  className={`text-sm font-bold transition-colors ${isDragging ? "text-primary " : "text-foreground "}`}
                >
                  {" "}
                  {isDragging ? "Drop CSV File Here!" : "Upload CSV File"}{" "}
                </p>{" "}
                <p className="text-[10px] text-muted-foreground mt-1 text-center">
                  Drag and drop your file here, or click to browse
                </p>{" "}
                <p className="text-[10px] text-slate-500 mt-1 text-center">
                  Supports .csv files up to 10MB
                </p>{" "}
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />{" "}
              </div>{" "}
              <div className="relative">
                {" "}
                <textarea
                  className="w-full h-full min-h-[200px] rounded-xl border-2 border-dashed border-border bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-md p-6 text-xs font-mono focus:outline-none focus:border-primary focus:bg-transparent resize-none text-foreground placeholder:text-muted-foreground transition-all duration-300"
                  placeholder="Or paste raw CSV text here..."
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  disabled={isUploading}
                />{" "}
                {!csvText && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {" "}
                    <FileText className="h-8 w-8 text-muted-foreground/50" />{" "}
                  </div>
                )}{" "}
                <div className="absolute bottom-4 right-4 text-[10px] text-slate-500">
                  {" "}
                  {csvText.length} characters{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="mt-6 flex justify-center">
              {" "}
              <button
                onClick={() => handleUpload(csvText)}
                disabled={isUploading || !csvText.trim()}
                className="w-full md:w-auto px-12 bg-blue-600-white font-semibold text-sm py-3 rounded-full transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {" "}
                {isUploading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}{" "}
                <span>
                  {isUploading ? "Syncing Database..." : "Synchronize Database"}
                </span>{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </motion.div>{" "}
      </div>{" "}
    </div>
  );
}
