"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  MessageCircle,
  Keyboard,
  ShieldCheck,
  Terminal,
  FileSpreadsheet,
  Database,
  FileText,
  Users,
  ArrowRightLeft,
  CheckCircle2,
  Star,
  RefreshCw,
  Clock,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Copy,
  Check,
  Server,
  Zap,
  Sparkles,
  ChevronRight,
  Search,
  Download,
  Layers,
  HelpCircle,
  Lightbulb,
  Sliders,
  Cpu,
  History,
  LayoutDashboard,
  Code2,
  Table,
  Workflow,
  Share2,
} from "lucide-react";

type HelpTab = "modules" | "faq" | "shortcuts" | "security";

// Comprehensive details for each and every component in the ecosystem
const MODULE_GUIDES = [
  {
    id: "dashboard",
    name: "Dashboard (Operational Command Center)",
    icon: LayoutDashboard,
    color: "bg-[#0176d3]/10 text-[#0176d3] border-[#0176d3]/30",
    badgeColor: "bg-[#0176d3]",
    category: "Core Navigation",
    purpose: "The centralized real-time executive hub that tracks query generation volume, Excel spreadsheet operations, ticket formatting precision, and active case assignments.",
    features: [
      "Real-time telemetry synchronization with the local PostgreSQL database.",
      "Interactive KPI cards with live trend indicators and volume progress bars.",
      "Quick activity feed displaying chronological user actions and system events.",
      "1-click navigation shortcuts to all high-frequency CRM utilities.",
    ],
    proTip: "Click the 'Sync DB' button on any KPI card or header to trigger an immediate atomic transaction update from PostgreSQL.",
  },
  {
    id: "soql-generator",
    name: "SOQL Generator (Batch Query Engine)",
    icon: Terminal,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    badgeColor: "bg-blue-500",
    category: "Query Engine",
    purpose: "A powerhouse query generator designed to convert raw lists of ticket numbers, asset CIDs, or case IDs into valid, syntax-perfect Salesforce Object Query Language (SOQL) queries without manual string formatting.",
    features: [
      "Automatic data cleansing: strips quotes, whitespace, commas, and formatting artifacts from pasted lists.",
      "Intelligent batching: automatically splits large ticket lists into chunks of 200 items to avoid Salesforce IN-clause character limits.",
      "Dynamic variable injection: replaces {{tickets}}, {{cids}}, or custom variables inside your template text instantly.",
      "Dual Master Queries: features specialized Component & Account SOQL generation for complex asset transfer workflows.",
    ],
    proTip: "Use the top category pills (TS Template, Escalation, WorkOrder, Asset) to load pre-validated master queries in 1 click.",
  },
  {
    id: "warranty-finder",
    name: "Warranty Finder (VLOOKUP & Data Reconciler)",
    icon: FileSpreadsheet,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    badgeColor: "bg-emerald-500",
    category: "Spreadsheet Suite",
    purpose: "An in-memory spreadsheet automation suite built to process messy CRM exports (.xlsx / .xls), reconcile ticket numbers, cross-reference data columns, and export pristine spreadsheets in seconds.",
    features: [
      "100% In-browser & local processing: spreadsheet data never leaves your machine or travels over external networks.",
      "Automated column mapping and cross-referencing between customer escalation reports and internal database dumps.",
      "Instant duplicate detection, whitespace stripping, and cell formatting standardization.",
      "1-click export to clean CSV or re-formatted Excel workbooks ready for management reporting.",
    ],
    proTip: "Drag and drop raw customer escalation spreadsheets directly onto the drop zone; the system auto-detects ticket number headers.",
  },
  {
    id: "formula-generator",
    name: "Formula Generator (Salesforce Formula Builder)",
    icon: Code2,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    badgeColor: "bg-purple-500",
    category: "CRM Setup Tools",
    purpose: "An intelligent formula creation utility that builds complex Salesforce Validation Rules, Workflow formulas, Process Builder criteria, and custom formula fields without syntax errors.",
    features: [
      "Visual logical operator builders for complex nested statements (AND, OR, IF, ISBLANK, REGEX, ISPICKVAL).",
      "Real-time syntax verification to catch missing parentheses or invalid data type comparisons before deployment.",
      "Built-in library of common CRM formulas (e.g., SLA calculation, business hours validation, escalation triggers).",
      "One-click copy formatted specifically for Salesforce Setup & Object Manager text areas.",
    ],
    proTip: "Use the built-in 'Validation Rule Templates' dropdown to generate bulletproof SLA violation check formulas instantly.",
  },
  {
    id: "ticket-formatter",
    name: "Ticket Formatter (Data Cleanser & Deduplicator)",
    icon: FileText,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    badgeColor: "bg-amber-500",
    category: "Data Cleanser",
    purpose: "The ultimate data preparation tool for support engineers. Converts messy email threads, multiline chat logs, or Excel columns into clean, comma-separated quote strings ('0001', '0002').",
    features: [
      "Automatic whitespace trimming, newline conversion, and invisible unicode character removal.",
      "Instant duplicate identification and removal to prevent redundant query processing.",
      "Customizable prefix and suffix injection for SQL, SOQL, or JSON array formatting.",
      "Live preview pane showing exact character count, item count, and deduplication statistics.",
    ],
    proTip: "Paste an entire messy email chain containing ticket numbers; the Formatter isolates and deduplicates alphanumeric ticket IDs automatically.",
  },
  {
    id: "template-manager",
    name: "Query Library & Template Manager",
    icon: Database,
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    badgeColor: "bg-cyan-500",
    category: "Database Repository",
    purpose: "A centralized database repository for storing, sharing, and organizing reusable SOQL queries and SQL templates across support and operations teams.",
    features: [
      "Categorization by CRM module: WorkOrder, Case, Asset, Account, and ServiceAppointment.",
      "Database favorite bookmarking: bookmarked queries appear at the top of your quick search and analytics leaderboards.",
      "Automated usage tracking: records execution counts in PostgreSQL every time a template is executed.",
      "Team collaboration: full JSON import and export capabilities to share standardized template libraries across engineers.",
    ],
    proTip: "Bookmark your top 5 daily queries; they will automatically pin to the top of the Global Search modal (Ctrl + K) for instant execution.",
  },
  {
    id: "history",
    name: "History (Audit Log & Activity Tracker)",
    icon: History,
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    badgeColor: "bg-indigo-500",
    category: "Audit Ledger",
    purpose: "A searchable historical ledger of every query generated, spreadsheet processed, and ticket formatted within your workspace.",
    features: [
      "Precise chronological timestamps and execution metadata for every operational action.",
      "Full output restoration: re-open and copy exact batch SOQL queries generated days or weeks ago.",
      "Filter by activity type: isolate query generations, Excel runs, or template creations in seconds.",
      "Automated 30-day retention pruning to keep your local database fast and optimized.",
    ],
    proTip: "If you accidentally close a query window or lose your Workbench tab, visit History to recover the exact batch text in 1 click.",
  },
  {
    id: "analytics",
    name: "Analytics (Executive DB Telemetry Arena)",
    icon: BarChart3,
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    badgeColor: "bg-rose-500",
    category: "Executive Telemetry",
    purpose: "A state-of-the-art telemetry dashboard integrated with PostgreSQL that visualizes team productivity, template popularity, and workload distribution.",
    features: [
      "Real-time database connection status with live atomic transaction updates.",
      "Interactive Leaderboard ranking your top 8 most executed queries with 1-click 'Copy SOQL' actions.",
      "Visual category distribution charts breaking down WorkOrder vs Asset vs Case query volume.",
      "1-click CSV Telemetry Export to download operational volume spreadsheets for stakeholder reporting.",
    ],
    proTip: "Export your monthly telemetry CSV to report support team efficiency gains and automated query hours to management.",
  },
  {
    id: "case-owners",
    name: "Case Assignment & Roster Management",
    icon: Users,
    color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
    badgeColor: "bg-teal-500",
    category: "Workload Routing",
    purpose: "A CRM employee workload balancing module designed to manage active Case Owners, track Salesforce Owner IDs, and distribute escalation tickets.",
    features: [
      "Active / Offline roster toggles to manage real-time employee availability.",
      "Duplicate Salesforce Owner ID prevention with automatic case-insensitive validation.",
      "Capacity and assignment load tracking persisted directly in PostgreSQL.",
      "Seamless integration with escalation query builders to route unassigned pools.",
    ],
    proTip: "Toggle an owner to 'Offline' before running automated case distribution batches to prevent routing tickets to staff on leave.",
  },
];

// Expanded 10 Real-World CRM FAQs
const FAQS_LIST = [
  {
    q: "Does MeghdootPlayground connect directly to my Salesforce org?",
    a: "No. MeghdootPlayground never makes direct OAuth or API connections to your Salesforce instance. It acts as an offline, high-speed string generation and spreadsheet processing engine. You copy the generated SOQL text into your Workbench, Developer Console, or Inspector.",
    category: "Security & Privacy",
  },
  {
    q: "Why does the SOQL Generator split my ticket numbers into batches of 200?",
    a: "Salesforce imposes strict URL character limits and IN-clause governor limits (typically around 20,000 characters or ~200–500 IDs depending on ID length). By automatically chunking your tickets into batches of 200, Meghdoot ensures your query never throws a 'URL Too Long' or 'Too Many Elements in IN Clause' error in Salesforce.",
    category: "Query Engine",
  },
  {
    q: "How does variable injection like {{tickets}} or {{cids}} work?",
    a: "When you create a template in the Query Library, you can insert placeholder tags like {{tickets}}, {{cids}}, or {{cases}}. When you paste raw alphanumeric strings into the SOQL Generator, the engine cleans the list, formats it into 'id1', 'id2', and substitutes the placeholder in your template automatically.",
    category: "Query Library",
  },
  {
    q: "Where is my telemetry and query template data stored?",
    a: "All your templates, execution counts, case owners, and activity logs are stored securely in your local PostgreSQL database (via Prisma ORM) and browser local storage. No proprietary customer data leaves your local machine or network.",
    category: "Security & Privacy",
  },
  {
    q: "How do I share my custom SOQL template library with my support team?",
    a: "Navigate to the Query Library (Template Manager) and click the 'Export JSON' button. This generates a clean JSON file containing all your categorized templates and bookmarks. Send this file to your teammates; they can click 'Import JSON' to merge your queries into their database instantly.",
    category: "Collaboration",
  },
  {
    q: "What spreadsheet file formats does Warranty Finder support?",
    a: "The Warranty Finder module supports standard .xlsx, .xls, and CSV files. All spreadsheet parsing, VLOOKUP reconciliation, and column cleaning are performed 100% in-memory within your browser using specialized SheetJS parsers—guaranteeing high speed without server file uploads.",
    category: "Spreadsheet Suite",
  },
  {
    q: "Can I customize the 30-day activity retention policy?",
    a: "By default, the database telemetry engine automatically purges raw activity events older than 30 days during atomic transaction updates to keep your PostgreSQL instance lightweight. Aggregate metric counters (total lifetime queries, favorites) are preserved indefinitely.",
    category: "Database & Telemetry",
  },
  {
    q: "How does the Ticket Formatter handle invisible characters or HTML formatting?",
    a: "When copying from Outlook, Teams, or Excel, hidden unicode characters (such as zero-width spaces, non-breaking spaces \u00A0, or carriage returns \r\n) are frequently included. The Ticket Formatter runs a deep Regex sanitization pass that strips all non-alphanumeric artifacts before generating your clean IN clause.",
    category: "Data Cleanser",
  },
  {
    q: "What happens if I enter duplicate Salesforce Owner IDs in Case Assignment?",
    a: "The Case Assignment API includes built-in duplicate detection. If you attempt to save an employee with a Salesforce Owner ID (e.g., 005G00000012345) that already exists in the roster, the system will reject the duplicate and alert you with an error message to maintain roster integrity.",
    category: "Workload Routing",
  },
  {
    q: "How do I quickly search across all 9 modules without clicking the sidebar?",
    a: "Press Ctrl + K (or Cmd + K on Mac) anywhere in the application to launch the Global Search Modal. You can type query names, module titles, or ticket variables to jump directly to any workflow in under 1 second.",
    category: "Navigation & Speed",
  },
];

// Complete Keyboard Shortcuts Reference
const SHORTCUTS_LIST = [
  { keys: ["Ctrl", "K"], label: "Launch Global Search Modal", cat: "Navigation" },
  { keys: ["Ctrl", "/"], label: "Open Help & Documentation", cat: "Navigation" },
  { keys: ["Ctrl", "B"], label: "Toggle Left Navigation Sidebar", cat: "Navigation" },
  { keys: ["Ctrl", "Shift", "G"], label: "Trigger SOQL Generation Batch", cat: "Query Engine" },
  { keys: ["Ctrl", "Shift", "C"], label: "Copy Current Batch to Clipboard", cat: "Query Engine" },
  { keys: ["Ctrl", "Shift", "D"], label: "Download Output as Text File", cat: "Query Engine" },
  { keys: ["Alt", "1"], label: "Switch to Dashboard Module", cat: "Quick Jump" },
  { keys: ["Alt", "2"], label: "Switch to SOQL Generator", cat: "Quick Jump" },
  { keys: ["Alt", "3"], label: "Switch to Warranty Finder", cat: "Quick Jump" },
  { keys: ["Alt", "4"], label: "Switch to Query Library", cat: "Quick Jump" },
  { keys: ["Alt", "5"], label: "Switch to Analytics Arena", cat: "Quick Jump" },
  { keys: ["Esc"], label: "Close Active Modal or Preview Panel", cat: "General" },
];

export default function HelpPage() {
  const [activeTab, setActiveTab] = React.useState<HelpTab>("modules");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [copiedShortcut, setCopiedShortcut] = React.useState<string | null>(null);

  // Filter modules by search
  const filteredModules = React.useMemo(() => {
    if (!searchQuery.trim() && selectedCategory === "All") return MODULE_GUIDES;
    return MODULE_GUIDES.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === "All" || m.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  // Filter FAQs by search
  const filteredFaqs = React.useMemo(() => {
    if (!searchQuery.trim()) return FAQS_LIST;
    return FAQS_LIST.filter(
      (f) =>
        f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const categories = ["All", "Core Navigation", "Query Engine", "Spreadsheet Suite", "Data Cleanser", "Database Repository", "Audit Ledger", "Executive Telemetry", "Workload Routing"];

  return (
    <div className="workspace-page mx-auto w-full max-w-7xl space-y-8 p-4 pb-14 sm:p-6 lg:p-8">
      {/* 1. HEADER BANNER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col gap-6 overflow-hidden rounded-3xl p-8 border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0b0c10] shadow-sm"
      >
        {/* Top Specular Rim */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none dark:bg-sky-500/10" />
        
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3.5 flex-wrap">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-200 dark:border-sky-500/20 shadow-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 text-[10px] font-bold px-2.5 py-0.5 flex items-center gap-1.5 uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" />
                    Lightning v2.4 Docs
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Knowledge Center &amp; Architecture Hub
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
              Comprehensive operational guides, component specifications, database telemetry workflows, and production best practices for every core utility in the MeghdootPlayground ecosystem.
            </p>
          </div>

          {/* Global Search inside Help */}
          <div className="relative w-full md:w-80 shrink-0 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, FAQs..."
              className="relative w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#06070a] text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-5 rounded-full bg-slate-200 dark:bg-white/[0.1] text-slate-500 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/[0.2] transition-colors z-10 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Signature Card */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
        className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0b0c10] px-6 py-6 sm:px-8 sm:py-6 shadow-sm transition-all duration-300 hover:border-sky-500/30"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Star className="h-3 w-3 fill-amber-500" />
              </div>
              <Badge className="bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                Personal Trademark
              </Badge>
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center relative z-10">
              <h2 className="shrink-0 text-xl sm:text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                Made by
              </h2>
              <div className="relative h-14 w-full max-w-[20rem] transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="/signature-black-cropped.png"
                  alt="Abhishek signature trademark"
                  fill
                  sizes="(min-width: 1024px) 20rem, 100vw"
                  className="object-contain object-left dark:hidden relative z-10"
                  priority
                />
                <Image
                  src="/signature-white-cropped.png"
                  alt="Abhishek signature trademark"
                  fill
                  sizes="(min-width: 1024px) 20rem, 100vw"
                  className="hidden object-contain object-left dark:block relative z-10"
                  priority
                />
              </div>
            </div>
            
            <p className="max-w-2xl text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-sky-500 shrink-0" />
              Built, tuned, and signed for fast, reliable enterprise Salesforce operations.
            </p>
          </div>

          <div className="relative hidden overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#06070a] p-px lg:block transition-all duration-300">
            <div className="relative flex h-full w-full flex-col items-end justify-center rounded-2xl px-5 py-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Meghdoot Playground
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-black tracking-tight text-slate-900 dark:text-white">
                Signature Edition
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. INTERACTIVE NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar px-0.5">
        {[
          { id: "modules", label: "Module Guides (9)", icon: Layers, count: MODULE_GUIDES.length },
          { id: "faq", label: "Interactive FAQ", icon: MessageCircle, count: FAQS_LIST.length },
          { id: "shortcuts", label: "Hotkeys Reference", icon: Keyboard, count: SHORTCUTS_LIST.length },
          { id: "security", label: "Security & Database", icon: ShieldCheck, count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as HelpTab)}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 border",
              activeTab === tab.id
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400/30 shadow-md shadow-sky-500/20 font-bold"
                : "bg-white/80 dark:bg-[#0a0d14]/85 backdrop-blur-xl border-slate-200/80 dark:border-white/[0.12] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.22] dark:shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
            )}
          >
            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-white" : "text-slate-400 dark:text-slate-500")} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENT ARENA */}
      <AnimatePresence mode="wait">
        {/* TAB 1: MODULE GUIDES */}
        {activeTab === "modules" && (
          <motion.div
            key="modules"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Category Filter Chips */}
            <div className="border border-slate-200/80 dark:border-white/[0.08] shadow-sm bg-white dark:bg-[#0b0c10] rounded-2xl overflow-hidden p-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 uppercase tracking-widest",
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400/30 shadow-sm shadow-sky-500/20"
                        : "bg-slate-50/70 dark:bg-[#06070a] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.08] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredModules.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-white/[0.12] bg-slate-50/50 dark:bg-[#0b0c10]/40 p-10 text-center shadow-sm">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No modules found</h3>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-sm">Try clearing your search term or selecting a different category filter.</p>
                <Button className="mt-5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {filteredModules.map((mod, idx) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.04 }}
                    className="h-full flex flex-col"
                  >
                    <div className="h-full app-card rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0c10] shadow-sm hover:shadow-xl hover:border-sky-500/30 transition-all duration-300 flex flex-col group relative overflow-hidden">
                      {/* Top Specular Rim */}
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                      
                      <div className="p-5 pb-4 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#06070a]/60 flex items-start gap-3.5 relative z-10">
                        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold shadow-sm transition-transform group-hover:scale-105 border", mod.color)}>
                          <mod.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <Badge className="mb-1.5 bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.08] text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                            {mod.category}
                          </Badge>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-tight">
                            {mod.name}
                          </h3>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 relative z-10">
                        <div className="space-y-4">
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                            {mod.purpose}
                          </p>

                          <div className="space-y-2.5 pt-3.5 border-t border-slate-100 dark:border-white/[0.06]">
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                              Key Capabilities
                            </div>
                            <ul className="space-y-2">
                              {mod.features.map((feat, fi) => (
                                <li key={fi} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 leading-relaxed">
                                  <div className="h-1.5 w-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0 shadow-sm shadow-sky-500/40" />
                                  <span className="font-medium opacity-90">{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Pro Tip Box */}
                        <div className="mt-4 p-3.5 rounded-xl bg-sky-50/60 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/20 flex items-start gap-2.5 shadow-sm">
                          <Lightbulb className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                          <div className="text-xs leading-relaxed text-sky-950 dark:text-sky-200 font-medium">
                            <span className="font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block text-[10px] mb-0.5">Pro Tip</span>
                            {mod.proTip}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: INTERACTIVE FAQ */}
        {activeTab === "faq" && (
          <motion.div
            key="faq"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="p-4 px-5 rounded-2xl bg-white dark:bg-[#0b0c10] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between flex-wrap gap-3 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Displaying <span className="font-bold text-slate-900 dark:text-white">{filteredFaqs.length}</span> verified operational answers
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/[0.08]">Updated for v2.4</Badge>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-white/[0.12] bg-slate-50/50 dark:bg-[#0b0c10]/40 p-10 text-center shadow-sm">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#06070a] text-slate-400">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">No FAQs match your search</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try querying keywords such as &apos;Salesforce&apos;, &apos;batch&apos;, or &apos;limits&apos;.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredFaqs.map((faq, idx) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} key={idx}>
                    <div className="h-full app-card rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0c10] shadow-sm hover:border-sky-500/30 hover:shadow-md transition-all flex flex-col group relative overflow-hidden p-5">
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <Badge className="bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 font-bold text-[9px] px-2 py-0.5 uppercase tracking-wider shrink-0">
                          Q{idx + 1} • {faq.category}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors mb-2">
                        {faq.q}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal flex-1">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: KEYBOARD SHORTCUTS REFERENCE */}
        {activeTab === "shortcuts" && (
          <motion.div
            key="shortcuts"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 shadow-xl flex items-center justify-between flex-wrap gap-4 border border-sky-400/30 text-white relative overflow-hidden">
              <div className="space-y-1.5 relative z-10 max-w-2xl">
                <div className="text-lg font-bold flex items-center gap-2.5">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm border border-white/20">
                    <Keyboard className="h-5 w-5 text-white" />
                  </div>
                  <span>High-Velocity Keyboard Accelerators</span>
                </div>
                <p className="text-sky-100 font-medium text-xs leading-relaxed">
                  Execute repetitive actions without leaving the keyboard. Global shortcuts work seamlessly across all 9 MeghdootPlayground modules.
                </p>
              </div>
              <Badge className="bg-white text-sky-700 font-mono text-xs px-3.5 py-1.5 font-bold shadow-md relative z-10 rounded-lg border-0">
                12 System Hotkeys
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SHORTCUTS_LIST.map((sc, idx) => (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.02 }} key={idx}>
                  <div className="app-card rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0c10] shadow-sm p-4 flex items-center justify-between gap-3 group hover:border-sky-500/30 transition-all">
                    <div className="space-y-1 min-w-0 flex-1">
                      <Badge className="bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.08] text-[9px] font-bold uppercase px-2 py-0.5 tracking-wider">
                        {sc.cat}
                      </Badge>
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{sc.label}</div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {sc.keys.map((k, ki) => (
                        <React.Fragment key={ki}>
                          <kbd className="px-2 py-1 rounded-md bg-slate-100 dark:bg-[#06070a] border border-slate-200 dark:border-white/[0.12] text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                            {k}
                          </kbd>
                          {ki < sc.keys.length - 1 && <span className="text-slate-400 font-bold text-[10px]">+</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 4: SECURITY & DATABASE ARCHITECTURE */}
        {activeTab === "security" && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <div className="h-full app-card rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0c10] shadow-sm p-6 sm:p-7 space-y-5 relative group overflow-hidden">
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold shadow-sm">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Zero External Exfiltration</h3>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 uppercase tracking-wider">100% Client-Side Local</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal relative z-10">
                  MeghdootPlayground is architected with strict confidentiality boundaries. When processing ticket IDs, email chains, or customer account numbers, <strong className="text-slate-900 dark:text-white">zero sensitive data is ever transmitted to external cloud endpoints, Salesforce APIs, or public LLMs.</strong>
                </p>
                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#06070a] border border-slate-200 dark:border-white/[0.08] space-y-3 text-xs font-mono relative z-10">
                  <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-medium">
                    <span>Salesforce API Connection:</span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-bold px-2 py-0.5">Air-Gapped (Offline)</Badge>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-medium">
                    <span>In-Memory Spreadsheet Parsing:</span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-bold px-2 py-0.5">100% Local SheetJS</Badge>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
              <div className="h-full app-card rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0c10] shadow-sm p-6 sm:p-7 space-y-5 relative group overflow-hidden">
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-bold shadow-sm">
                    <Server className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">PostgreSQL Architecture</h3>
                    <p className="text-[11px] text-sky-600 dark:text-sky-400 font-bold mt-0.5 uppercase tracking-wider">Prisma ORM Powered</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal relative z-10">
                  Custom SOQL query templates, employee rosters, case owner workloads, and operational telemetry are stored in a dedicated local PostgreSQL instance. This provides enterprise ACID compliance, transaction safety, and sub-millisecond query filtering.
                </p>
                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#06070a] border border-slate-200 dark:border-white/[0.08] space-y-3 text-xs font-mono relative z-10">
                  <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-medium">
                    <span>Database Adapter:</span>
                    <span className="text-sky-600 dark:text-sky-400 font-bold uppercase text-[10px] bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">Prisma Pg Driver</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-medium">
                    <span>Automated Event Pruning:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">30-Day Retention</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
