"use client";

import * as React from "react";
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
    id: "excel-automation",
    name: "Excel Automation (VLOOKUP & Data Reconciler)",
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
    q: "What spreadsheet file formats does Excel Automation support?",
    a: "The Excel Automation module supports standard .xlsx, .xls, and CSV files. All spreadsheet parsing, VLOOKUP reconciliation, and column cleaning are performed 100% in-memory within your browser using specialized SheetJS parsers—guaranteeing high speed without server file uploads.",
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
  { keys: ["Alt", "3"], label: "Switch to Excel Automation", cat: "Quick Jump" },
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
        className="relative flex flex-col gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0176d3]/90 via-[#015ba7] to-indigo-900 p-8 shadow-2xl border border-[#0176d3]/40"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl mix-blend-screen pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl mix-blend-screen pointer-events-none" />
        
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white font-bold backdrop-blur-md shadow-lg border border-white/20">
                <BookOpen className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-white/20 text-white border border-white/30 text-xs font-bold px-3 py-1 flex items-center gap-1.5 shadow-inner backdrop-blur-sm uppercase tracking-widest hover:bg-white/30 transition-colors">
                    <Sparkles className="h-3 w-3" />
                    Lightning v2.4 Docs
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                  Knowledge Center &amp; Architecture Hub
                </h1>
              </div>
            </div>
            <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed max-w-2xl">
              Comprehensive operational guides, component specifications, database telemetry workflows, and best practices for every core utility in the MeghdootPlayground ecosystem.
            </p>
          </div>

          {/* Global Search inside Help */}
          <div className="relative w-full md:w-80 shrink-0 group">
            <div className="absolute inset-0 bg-white/5 rounded-2xl blur group-hover:bg-white/10 transition-colors" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 group-focus-within:text-white transition-colors z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, FAQs..."
              className="relative w-full h-14 pl-12 pr-12 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md text-sm font-bold text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white shadow-inner transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-10"
              >
                <Search className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. INTERACTIVE NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
        {[
          { id: "modules", label: "Module Guides (9)", icon: Layers, count: MODULE_GUIDES.length },
          { id: "faq", label: "Interactive FAQ", icon: MessageCircle, count: FAQS_LIST.length },
          { id: "shortcuts", label: "Hotkeys", icon: Keyboard, count: SHORTCUTS_LIST.length },
          { id: "security", label: "Security & Database", icon: ShieldCheck, count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as HelpTab)}
            className={cn(
              "flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap shrink-0 shadow-sm border",
              activeTab === tab.id
                ? "bg-[#0176d3] text-white border-[#0176d3] shadow-md shadow-[#0176d3]/20"
                : "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-foreground hover:shadow-md"
            )}
          >
            <tab.icon className={cn("h-4.5 w-4.5", activeTab === tab.id ? "text-white" : "text-slate-400")} />
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
            <Card className="border-0 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
              <div className="p-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 uppercase tracking-widest",
                      selectedCategory === cat
                        ? "bg-[#0176d3] text-white border-[#0176d3] shadow-md shadow-[#0176d3]/20"
                        : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-700"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </Card>

            {filteredModules.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl p-12 text-center shadow-inner">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 shadow-inner">
                  <Search className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-black text-foreground">No modules found</h3>
                <p className="mt-2 text-sm text-slate-500 max-w-sm">Try clearing your search term or selecting a different category filter.</p>
                <Button className="mt-6 font-bold" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {filteredModules.map((mod, idx) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="h-full flex flex-col"
                  >
                    <Card className="h-full border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative">
                      <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-blue-500/10 transition-colors" />
                      
                      <CardHeader className="p-6 pb-5 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 flex flex-row items-start justify-between gap-4 relative z-10">
                        <div className="flex items-start gap-4 min-w-0 w-full">
                          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold shadow-md transition-transform group-hover:scale-110", mod.color)}>
                            <mod.icon className="h-6 w-6" />
                          </div>
                          <div className="min-w-0 flex-1 pt-1">
                            <Badge className="mb-2 bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-widest shadow-sm">
                              {mod.category}
                            </Badge>
                            <CardTitle className="text-lg font-black text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                              {mod.name}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-5 relative z-10">
                        <div className="space-y-4">
                          <div className="text-sm text-slate-500 leading-relaxed font-medium">
                            {mod.purpose}
                          </div>

                          <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-blue-500" />
                              Key Features
                            </div>
                            <ul className="space-y-2.5">
                              {mod.features.map((feat, fi) => (
                                <li key={fi} className="text-sm text-foreground flex items-start gap-3 leading-relaxed">
                                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-sm shadow-blue-500/40" />
                                  <span className="font-medium opacity-90">{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Pro Tip Box */}
                        <div className="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 flex items-start gap-3 shadow-inner">
                          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <div className="text-xs leading-relaxed text-blue-900 dark:text-blue-200 font-medium">
                            <span className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">Pro Tip</span>
                            {mod.proTip}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
            className="space-y-6"
          >
            <div className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between flex-wrap gap-3 shadow-sm">
              <div className="text-sm font-bold text-slate-500">
                Showing <span className="font-black text-foreground">{filteredFaqs.length}</span> frequently asked CRM questions
              </div>
              <Badge variant="outline" className="text-xs font-mono text-slate-400 border-slate-200 dark:border-slate-700">Updated for v2.4</Badge>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl p-12 text-center shadow-inner">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 shadow-inner">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <div className="text-lg font-black text-foreground">No FAQs match your query</div>
                <p className="text-sm text-slate-500 mt-2">Try searching for terms like &apos;Salesforce&apos; or &apos;limits&apos;.</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredFaqs.map((faq, idx) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={idx}>
                    <Card className="h-full border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl overflow-hidden hover:shadow-xl transition-all flex flex-col group relative">
                       <div className="absolute top-0 right-0 p-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full blur-2xl pointer-events-none group-hover:from-indigo-500/10 transition-colors" />
                      <CardHeader className="p-6 pb-4 relative z-10">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-black text-[10px] px-2.5 py-0.5 uppercase tracking-widest shrink-0 shadow-sm">
                            Q{idx + 1} • {faq.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-base sm:text-lg font-black text-foreground leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {faq.q}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 text-sm text-slate-500 leading-relaxed font-medium relative z-10 flex-1 flex items-start">
                        {faq.a}
                      </CardContent>
                    </Card>
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
            className="space-y-6"
          >
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl flex items-center justify-between flex-wrap gap-6 relative overflow-hidden border border-blue-500/50">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
              <div className="space-y-2 relative z-10 max-w-2xl">
                <div className="text-xl font-black text-white flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/20">
                    <Keyboard className="h-6 w-6 text-white" />
                  </div>
                  <span>Work Faster with Keyboard Hotkeys</span>
                </div>
                <p className="text-blue-100 font-medium text-sm leading-relaxed">
                  Use these system-wide hotkeys anywhere in MeghdootPlayground to jump between modules, trigger batches, or open global search.
                </p>
              </div>
              <Badge className="bg-white text-blue-600 font-mono text-sm px-4 py-2 font-black shadow-lg relative z-10 rounded-xl border-0">
                12 Active Hotkeys
              </Badge>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SHORTCUTS_LIST.map((sc, idx) => (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.03 }} key={idx}>
                  <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 p-5 flex items-center justify-between gap-4 group">
                    <div className="space-y-2 min-w-0 flex-1">
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest">
                        {sc.cat}
                      </Badge>
                      <div className="text-sm font-bold text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{sc.label}</div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {sc.keys.map((k, ki) => (
                        <React.Fragment key={ki}>
                          <kbd className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-black text-slate-700 dark:text-slate-300 shadow-sm">
                            {k}
                          </kbd>
                          {ki < sc.keys.length - 1 && <span className="text-slate-400 font-black text-xs">+</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </Card>
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
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <Card className="h-full border-0 shadow-xl ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl overflow-hidden p-8 space-y-6 relative group">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none transition-colors" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">Zero External Data Exfiltration</h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mt-1 uppercase tracking-widest">100% Client-Side Local</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium relative z-10">
                  MeghdootPlayground is architected with strict security separation. When you paste raw customer ticket IDs, email chains, or customer account numbers into the SOQL Generator or Ticket Formatter, <strong className="text-foreground">zero data is ever transmitted to external cloud servers, Salesforce APIs, or third-party tracking services.</strong>
                </p>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 text-xs font-mono relative z-10 shadow-inner">
                  <div className="flex items-center justify-between text-foreground font-bold">
                    <span>Salesforce API Connection:</span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] uppercase tracking-wider font-black px-2 py-1">Disabled (Offline)</Badge>
                  </div>
                  <div className="flex items-center justify-between text-foreground font-bold">
                    <span>In-Memory Spreadsheet Parsing:</span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] uppercase tracking-wider font-black px-2 py-1">100% Local SheetJS</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Card className="h-full border-0 shadow-xl ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl overflow-hidden p-8 space-y-6 relative group">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none transition-colors" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0176d3] text-white font-bold shadow-lg shadow-[#0176d3]/30">
                    <Server className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">PostgreSQL Database Engine</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-bold mt-1 uppercase tracking-widest">Prisma ORM Powered</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium relative z-10">
                  Your custom SOQL query templates, employee rosters, case owner workloads, and operational telemetry are stored in a dedicated PostgreSQL database managed via Prisma ORM. This provides enterprise-grade ACID compliance, transaction safety, and instant query filtering.
                </p>
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 text-xs font-mono relative z-10 shadow-inner">
                  <div className="flex items-center justify-between text-foreground font-bold">
                    <span>Database Driver:</span>
                    <span className="text-[#0176d3] font-black uppercase tracking-wider text-[10px] bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">Prisma Pg Adapter</span>
                  </div>
                  <div className="flex items-center justify-between text-foreground font-bold">
                    <span>Automated Event Pruning:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider text-[10px] bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">30-Day Retention</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
