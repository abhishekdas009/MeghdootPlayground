"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  Terminal,
  Palette,
  ArrowRight,
  Copy,
  ExternalLink,
  Star,
  Clock,
  X,
  Database,
  LayoutDashboard,
  FileSearch,
  FileText,
  Calculator,
  Settings,
  HelpCircle,
  History,
  Sparkles,
  Check,
  ChevronRight,
  Filter,
  Layers,
  Wand2,
  Keyboard,
  ShieldCheck,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

// Define search item types
export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "navigation" | "soql" | "recent" | "command" | "action";
  typeTag?: string; // e.g., "WorkOrder", "Asset", "Module", "Action", "Command"
  url?: string;
  soql?: string;
  icon: React.ReactNode;
  favourite?: boolean;
  onExecute?: () => void;
  shortcut?: string;
}

const NAVIGATION_ITEMS: SearchItem[] = [
  {
    id: "nav-daily-report",
    title: "Daily Report Generator & WhatsApp Dispatch",
    subtitle: "Automated daily category summaries, Excel workbooks with native formulas, and WhatsApp chat simulation",
    category: "navigation",
    typeTag: "Report",
    url: "/daily-report-generator",
    icon: <Sparkles className="h-5 w-5 text-emerald-500" />,
  },
  {
    id: "nav-soql-generator",
    title: "SOQL Query & Utility Generator",
    subtitle: "Paste ticket numbers or case IDs to generate batched production SOQL and Data Loader files",
    category: "navigation",
    typeTag: "Module",
    url: "/soql-generator",
    icon: <Terminal className="h-5 w-5 text-[#0176d3]" />,
  },
  {
    id: "nav-template-manager",
    title: "SOQL Query Library",
    subtitle: "Explore, search, bookmark, and execute 37+ operational Salesforce SOQL templates",
    category: "navigation",
    typeTag: "Library",
    url: "/template-manager",
    icon: <Database className="h-5 w-5 text-emerald-500" />,
  },
  {
    id: "nav-dashboard",
    title: "CRM Executive Dashboard",
    subtitle: "Real-time ticket cancellation tracking, case assignment KPIs, and operational health metrics",
    category: "navigation",
    typeTag: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "nav-analytics",
    title: "Analytics & KPI Arena",
    subtitle: "Deep-dive ticket status charts, historical performance trends, and volume analytics",
    category: "navigation",
    typeTag: "Analytics",
    url: "/analytics",
    icon: <Sparkles className="h-5 w-5 text-purple-500" />,
  },
  {
    id: "nav-warranty",
    title: "Warranty Finder & Timeline Gauge",
    subtitle: "Fuzzy appliance model search, comprehensive vs compressor warranty, and interactive date timeline",
    category: "navigation",
    typeTag: "Utility",
    url: "/warranty-finder",
    icon: <ShieldCheck className="h-5 w-5 text-cyan-500" />,
  },
  {
    id: "nav-user-manuals",
    title: "User Manuals & Technical Reader",
    subtitle: "Search Blue Star appliance technical service manuals, wiring schematics, and fault codes (E1–E9)",
    category: "navigation",
    typeTag: "Manuals",
    url: "/user-manuals",
    icon: <HelpCircle className="h-5 w-5 text-indigo-500" />,
  },
  {
    id: "nav-ticket-validator",
    title: "Ticket Validator & Inspector",
    subtitle: "Compare a subset of tickets against a master list and inspect duplicates with prune counts",
    category: "navigation",
    typeTag: "Utility",
    url: "/ticket-validator",
    icon: <CheckCheck className="h-5 w-5 text-emerald-500" />,
  },
  {
    id: "nav-ticket-formatter",
    title: "Ticket Formatter & Cleanser",
    subtitle: "Clean raw ticket lists into structured CSV, SQL IN syntax, Excel columns, or Jira/Slack lists",
    category: "navigation",
    typeTag: "Utility",
    url: "/ticket-formatter",
    icon: <FileText className="h-5 w-5 text-amber-500" />,
  },
  {
    id: "nav-formula",
    title: "Salesforce Formula Generator",
    subtitle: "Build, debug, and validate complex Salesforce formula field expressions with syntax hints",
    category: "navigation",
    typeTag: "Utility",
    url: "/formula-generator",
    icon: <Calculator className="h-5 w-5 text-indigo-500" />,
  },
  {
    id: "nav-history",
    title: "Execution History & Audit Logs",
    subtitle: "Review past SOQL generation runs, exported batches, and system activity logs",
    category: "navigation",
    typeTag: "System",
    url: "/history",
    icon: <History className="h-5 w-5 text-slate-500" />,
  },
  {
    id: "nav-help",
    title: "Help & Developer Docs",
    subtitle: "Learn SOQL limits, keyboard shortcuts, Data Loader tips, and workflow guidelines",
    category: "navigation",
    typeTag: "Docs",
    url: "/help",
    icon: <HelpCircle className="h-5 w-5 text-cyan-500" />,
  },
];

const SLASH_COMMANDS: SearchItem[] = [
  {
    id: "cmd-report",
    title: "/report",
    subtitle: "Jump to Daily Report Generator & WhatsApp Dispatch Simulator",
    category: "command",
    typeTag: "Command",
    url: "/daily-report-generator",
    icon: <Sparkles className="h-4 w-4 text-emerald-500" />,
    shortcut: "Enter",
  },
  {
    id: "cmd-soql",
    title: "/soql",
    subtitle: "Draft and execute production Salesforce SOQL queries with IN-clause generator",
    category: "command",
    typeTag: "Command",
    url: "/soql-generator",
    icon: <Terminal className="h-4 w-4 text-blue-500" />,
    shortcut: "Enter",
  },
  {
    id: "cmd-templates",
    title: "/templates",
    subtitle: "Browse 37+ operational Salesforce SOQL library templates",
    category: "command",
    typeTag: "Command",
    url: "/template-manager",
    icon: <Database className="h-4 w-4 text-indigo-500" />,
    shortcut: "Enter",
  },
  {
    id: "cmd-warranty",
    title: "/warranty",
    subtitle: "Search appliance models & interactive compressor warranty gauge",
    category: "command",
    typeTag: "Command",
    url: "/warranty-finder",
    icon: <ShieldCheck className="h-4 w-4 text-cyan-500" />,
    shortcut: "Enter",
  },
  {
    id: "cmd-manuals",
    title: "/manuals",
    subtitle: "Technical User Manuals, split PDF reader & fault code lookup",
    category: "command",
    typeTag: "Command",
    url: "/user-manuals",
    icon: <HelpCircle className="h-4 w-4 text-purple-500" />,
    shortcut: "Enter",
  },
  {
    id: "cmd-validate",
    title: "/validate",
    subtitle: "Compare ticket subsets against master list and inspect duplicates",
    category: "command",
    typeTag: "Command",
    url: "/ticket-validator",
    icon: <CheckCheck className="h-4 w-4 text-emerald-500" />,
    shortcut: "Enter",
  },
  {
    id: "cmd-tickets",
    title: "/tickets",
    subtitle: "Format, clean, and export tickets into SQL IN, CSV, and Jira formats",
    category: "command",
    typeTag: "Command",
    url: "/ticket-formatter",
    icon: <FileText className="h-4 w-4 text-amber-500" />,
    shortcut: "Enter",
  },
  {
    id: "cmd-dock",
    title: "/dock",
    subtitle: "Open Multi-Tasking Split Dock to work without switching pages",
    category: "command",
    typeTag: "Action",
    icon: <Layers className="h-4 w-4 text-blue-500" />,
    shortcut: "Alt+D",
  },
  {
    id: "cmd-shortcuts",
    title: "/shortcuts",
    subtitle: "View the complete Universal Keyboard Shortcuts cheat sheet",
    category: "command",
    typeTag: "Help",
    icon: <Keyboard className="h-4 w-4 text-slate-400" />,
    shortcut: "?",
  },
  {
    id: "cmd-wallpaper",
    title: "/wallpaper",
    subtitle: "Open Wallpaper & Ambient Atmosphere Selector (Animated & Static options)",
    category: "command",
    typeTag: "Theme",
    icon: <Palette className="h-4 w-4 text-pink-500" />,
    shortcut: "Alt+B",
  },
  {
    id: "cmd-background",
    title: "/background",
    subtitle: "Configure animated canvas and static wallpapers for light/dark mode",
    category: "command",
    typeTag: "Theme",
    icon: <Palette className="h-4 w-4 text-purple-500" />,
    shortcut: "Alt+B",
  },
];

const BUILTIN_SOQL_ITEMS: SearchItem[] = [
  {
    id: "soql-1",
    title: "TS (Ticket Status)",
    subtitle: "Fetch current WorkOrder Status and ParentWorkOrderId for ticket tracking",
    category: "soql",
    typeTag: "WorkOrder",
    soql: "SELECT Id, Status, ParentWorkOrderId\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)",
    icon: <Terminal className="h-4 w-4 text-[#0176d3]" />,
    favourite: true,
  },
  {
    id: "soql-2",
    title: "Asset Transfer",
    subtitle: "Retrieve hardware asset details, account ownership, and installation status",
    category: "soql",
    typeTag: "Asset",
    soql: "SELECT Id, Name, SerialNumber, AccountId, Status, InstallDate\nFROM Asset\nWHERE SerialNumber IN (\n{{tickets}}\n)",
    icon: <Database className="h-4 w-4 text-emerald-500" />,
  },
  {
    id: "soql-3",
    title: "CANCELLATION TICKETS",
    subtitle: "Retrieve open, non-completed WorkOrders to prepare tickets for cancellation",
    category: "soql",
    typeTag: "WorkOrder",
    soql: "SELECT Id, Ticket_Number_Read_Only__c, Status\nFROM WorkOrder\nWHERE Status != 'Completed' AND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)",
    icon: <Terminal className="h-4 w-4 text-[#0176d3]" />,
  },
  {
    id: "soql-4",
    title: "Cancellation Requested",
    subtitle: "Filter WorkOrders where Status is currently marked as 'Cancellation Requested'",
    category: "soql",
    typeTag: "WorkOrder",
    soql: "SELECT Id, Ticket_Number_Read_Only__c, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)\nAND Status = 'Cancellation Requested'",
    icon: <Terminal className="h-4 w-4 text-[#0176d3]" />,
  },
  {
    id: "soql-5",
    title: "Case Cancellation",
    subtitle: "Query parent Case status and cancellation reason fields for open work orders",
    category: "soql",
    typeTag: "WorkOrder",
    soql: "SELECT Id, Status, CaseId, Case.Status, Case.Cancellation_Reason__c, Cancellation_Reason__c\nFROM WorkOrder\nWHERE Status != 'Completed' AND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)",
    icon: <Terminal className="h-4 w-4 text-[#0176d3]" />,
  },
  {
    id: "soql-6",
    title: "SA (Service Appointment)",
    subtitle: "Get Service Appointment ID and scheduling status for given ticket numbers",
    category: "soql",
    typeTag: "ServiceAppointment",
    soql: "SELECT Id, Status\nFROM ServiceAppointment\nWHERE Ticket_Numbers__c IN (\n{{tickets}}\n)",
    icon: <Clock className="h-4 w-4 text-amber-500" />,
  },
  {
    id: "soql-7",
    title: "Case Assign",
    subtitle: "Retrieve Case Status and OwnerId to facilitate ticket reassignment workflows",
    category: "soql",
    typeTag: "Case",
    soql: "SELECT Id,Status,OwnerId\nFROM Case\nWHERE Id IN (\n{{tickets}}\n)",
    icon: <FileText className="h-4 w-4 text-blue-500" />,
  },
  {
    id: "soql-8",
    title: "TC (Technician Check)",
    subtitle: "Check assigned service resource (technician) details and parent work orders",
    category: "soql",
    typeTag: "ServiceAppointment",
    soql: "SELECT Id,\n       Work_Order__c,\n       FSSK__FSK_Assigned_Service_Resource__c,\n       FSSK__FSK_Assigned_Service_Resource__r.Name\nFROM ServiceAppointment\nWHERE Ticket_Numbers__c IN (\n{{tickets}}\n)",
    icon: <Clock className="h-4 w-4 text-amber-500" />,
  },
  {
    id: "soql-9",
    title: "TSC (Ticket Status Count)",
    subtitle: "Aggregate and count WorkOrders grouped by status, ordered by frequency",
    category: "soql",
    typeTag: "WorkOrder",
    soql: "SELECT Status,\n       COUNT(Id)\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)\nGROUP BY Status\nORDER BY COUNT(Id) DESC",
    icon: <Terminal className="h-4 w-4 text-[#0176d3]" />,
  },
  {
    id: "soql-10",
    title: "PO (Payout / Product Info)",
    subtitle: "Fetch payout status and product sub-family codes for parent work orders",
    category: "soql",
    typeTag: "WorkOrder",
    soql: "SELECT Id,\n       ParentWorkOrderId,\n       Status,\n       Payout__c,\n       Asset.Product_Sub_Family__r.Code__c\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)",
    icon: <Terminal className="h-4 w-4 text-[#0176d3]" />,
  },
  {
    id: "soql-11",
    title: "TS (Open Tickets Only)",
    subtitle: "Retrieve active tickets excluding Completed, Canceled, or Bundled statuses",
    category: "soql",
    typeTag: "WorkOrder",
    soql: "SELECT Id, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)\nAND Status NOT IN ('Completed','Canceled','Bundled')",
    icon: <Terminal className="h-4 w-4 text-[#0176d3]" />,
  },
  {
    id: "soql-12",
    title: "Account ID Fetch",
    subtitle: "Lookup internal Account Id mapping using external Customer ID",
    category: "soql",
    typeTag: "Account",
    soql: "SELECT Customer_ID__c, Id\nFROM Account\nWHERE Customer_ID__c IN (\n{{tickets}}\n)",
    icon: <Database className="h-4 w-4 text-indigo-500" />,
  },
];

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FilterTab = "all" | "commands" | "navigation" | "soql" | "favorites";

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const router = useRouter();
  const { toggleDock, setShortcutsModalOpen, setWallpaperModalOpen } = useUIStore();
  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<FilterTab>("all");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [libraryQueries, setLibraryQueries] = React.useState<SearchItem[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("meghdoot_recent_searches");
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load recent searches", e);
      }
    }
  }, []);

  // Fetch saved database queries when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetch("/api/soql-library")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const mapped: SearchItem[] = data.map((item: any) => ({
              id: `lib-${item.id}`,
              title: item.label || "Saved Query",
              subtitle: item.description || `Saved ${item.category || "SOQL"} query from library`,
              category: "soql",
              typeTag: item.category || "Library",
              soql: item.soql,
              favourite: item.favourite,
              icon: <Database className="h-4 w-4 text-emerald-500" />,
            }));
            setLibraryQueries(mapped);
          }
        })
        .catch((err) => console.error("Error fetching library queries for search:", err));
    } else {
      setQuery("");
      setActiveTab("all");
      setSelectedIndex(0);
    }
  }, [open]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim() || typeof window === "undefined") return;
    try {
      const updated = [term.trim(), ...recentSearches.filter((s) => s.toLowerCase() !== term.trim().toLowerCase())].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem("meghdoot_recent_searches", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("meghdoot_recent_searches");
    }
    toast.info("Recent search history cleared");
  };

  // Combine items
  const allItems = React.useMemo(() => {
    const libTitles = new Set(libraryQueries.map((q) => q.title.toLowerCase()));
    const filteredBuiltin = BUILTIN_SOQL_ITEMS.filter((b) => !libTitles.has(b.title.toLowerCase()));
    return [...SLASH_COMMANDS, ...NAVIGATION_ITEMS, ...filteredBuiltin, ...libraryQueries];
  }, [libraryQueries]);

  // Deep Ticket Number / Case ID Recognizer Actions
  const ticketActions = React.useMemo<SearchItem[]>(() => {
    const trimmed = query.trim();
    const ticketMatch = trimmed.match(/\b\d{7,8}\b|\b500[0-9a-zA-Z]{12,15}\b/);
    if (!ticketMatch || !ticketMatch[0]) return [];

    const tNum = ticketMatch[0];
    return [
      {
        id: `act-warranty-${tNum}`,
        title: `Lookup Warranty for #${tNum}`,
        subtitle: `Check compressor & comprehensive warranty status for ticket/model ${tNum}`,
        category: "action",
        typeTag: "Action",
        url: `/warranty-finder?q=${tNum}`,
        icon: <Sparkles className="h-4 w-4 text-cyan-500" />,
      },
      {
        id: `act-soql-${tNum}`,
        title: `Generate SOQL IN-Clause with #${tNum}`,
        subtitle: `Draft a Salesforce query filtered specifically by ticket ${tNum}`,
        category: "action",
        typeTag: "Action",
        url: `/soql-generator?tickets=${tNum}`,
        icon: <Terminal className="h-4 w-4 text-blue-500" />,
      },
      {
        id: `act-validate-${tNum}`,
        title: `Validate & Format Ticket #${tNum}`,
        subtitle: `Check format validity, character length, and deduplication for ${tNum}`,
        category: "action",
        typeTag: "Action",
        url: `/ticket-validator?ticket=${tNum}`,
        icon: <CheckCheck className="h-4 w-4 text-emerald-500" />,
      },
      {
        id: `act-manual-${tNum}`,
        title: `Search Manuals & Schematics for #${tNum}`,
        subtitle: `Locate wiring schematics or model service documents matching ${tNum}`,
        category: "action",
        typeTag: "Action",
        url: `/user-manuals?q=${tNum}`,
        icon: <HelpCircle className="h-4 w-4 text-purple-500" />,
      },
    ];
  }, [query]);

  // Filter items
  const filteredItems = React.useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    // If query starts with '/', prioritize slash commands
    if (trimmed.startsWith("/")) {
      const cmdQuery = trimmed.slice(1);
      return SLASH_COMMANDS.filter((cmd) => cmd.title.toLowerCase().includes(trimmed) || cmd.subtitle?.toLowerCase().includes(cmdQuery));
    }

    const baseFiltered = allItems.filter((item) => {
      // Tab filtering
      if (activeTab === "commands" && item.category !== "command") return false;
      if (activeTab === "navigation" && item.category !== "navigation") return false;
      if (activeTab === "soql" && item.category !== "soql") return false;
      if (activeTab === "favorites" && !item.favourite) return false;

      // Text filtering
      if (!trimmed) {
        // When empty, show commands + top navigation
        return item.category === "command" || item.category === "navigation";
      }

      const matchTitle = item.title.toLowerCase().includes(trimmed);
      const matchSubtitle = item.subtitle?.toLowerCase().includes(trimmed);
      const matchTag = item.typeTag?.toLowerCase().includes(trimmed);
      const matchSoql = item.soql?.toLowerCase().includes(trimmed);
      return matchTitle || matchSubtitle || matchTag || matchSoql;
    });

    // Prepend deep ticket actions if detected
    return [...ticketActions, ...baseFiltered];
  }, [allItems, ticketActions, query, activeTab]);

  // Reset selectedIndex when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length, activeTab]);

  const handleCopySOQL = (e: React.MouseEvent, item: SearchItem) => {
    e.stopPropagation();
    if (!item.soql) return;
    navigator.clipboard.writeText(item.soql);
    setCopiedId(item.id);
    toast.success(`Copied "${item.title}" SOQL to clipboard!`);
    if (query.trim()) saveRecentSearch(query);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelect = (item: SearchItem) => {
    if (query.trim()) saveRecentSearch(query);
    onOpenChange(false);

    if (item.id === "cmd-dock") {
      toggleDock();
      toast.success("Toggled Multi-Tasking Split Dock");
      return;
    }
    if (item.id === "cmd-shortcuts") {
      setShortcutsModalOpen(true);
      return;
    }
    if (item.id === "cmd-wallpaper" || item.id === "cmd-background") {
      setWallpaperModalOpen(true);
      return;
    }
    if (item.onExecute) {
      item.onExecute();
      return;
    }
    if (item.url) {
      router.push(item.url);
      toast.info(`Navigated to ${item.title}`);
    } else if (item.category === "soql") {
      router.push(`/template-manager?search=${encodeURIComponent(item.title)}`);
      toast.success(`Opened ${item.title} in Query Library`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + Math.max(1, filteredItems.length)) % Math.max(1, filteredItems.length));
    } else if (e.key === "Tab" && filteredItems[selectedIndex]?.title.startsWith("/")) {
      e.preventDefault();
      setQuery(filteredItems[selectedIndex].title + " ");
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[10vh] backdrop-blur-md animate-in fade-in duration-200"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Raycast Spotlight Command Palette"
        className="relative flex w-full max-w-[720px] max-h-[78vh] flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#090b10] shadow-2xl animate-in zoom-in-95 duration-200"
        onKeyDown={handleKeyDown}
      >
        {/* Top Specular Rim */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Sleek Search Input Bar */}
        <div className="relative bg-slate-50/70 dark:bg-[#06070a]/80 p-3 sm:p-4 border-b border-slate-100 dark:border-white/[0.06] space-y-2.5">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0b0c10] px-3.5 py-2.5 shadow-sm transition-all focus-within:border-sky-500/50 focus-within:ring-2 focus-within:ring-sky-500/20">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
              <Search className="h-4 w-4" />
            </span>
            <div className="relative flex-1" suppressHydrationWarning data-protonpass-ignore="true">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type '/' for commands, paste ticket # (e.g. 2713009), or search keywords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent pr-6 text-sm sm:text-base font-semibold tracking-tight text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                autoComplete="off"
                data-lpignore="true"
                data-protonpass-ignore="true"
                data-form-type="other"
                suppressHydrationWarning
              />
            </div>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-slate-200"
                title="Clear text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {!query && (
              <kbd className="hidden rounded-md border border-slate-200 dark:border-white/[0.1] bg-slate-100 dark:bg-[#06070a] px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 sm:inline-flex">ESC</kbd>
            )}
          </div>

          {/* Quick Filter Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
            {[
              { id: "all" as FilterTab, label: "All Items" },
              { id: "commands" as FilterTab, label: "Commands (/)" },
              { id: "navigation" as FilterTab, label: "Modules" },
              { id: "soql" as FilterTab, label: "SOQL Library" },
              { id: "favorites" as FilterTab, label: "Favorites" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results List Area */}
        <div className="custom-scrollbar flex-1 min-h-[250px] max-h-[55vh] space-y-1.5 overflow-y-auto p-3 bg-white dark:bg-[#0b0c10]">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#06070a] text-slate-400 mb-3 border border-slate-200 dark:border-white/[0.08]">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching commands or results</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Try typing &apos;/report&apos;, &apos;/soql&apos;, or paste a ticket number like &apos;2713009&apos;</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "group flex cursor-pointer items-center justify-between gap-3.5 rounded-2xl border p-2.5 sm:p-3 transition-all duration-150",
                    isSelected
                      ? "border-sky-500/40 bg-sky-50/50 dark:bg-sky-500/10 shadow-sm"
                      : "border-transparent hover:border-slate-200 dark:hover:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  )}
                >
                  {/* Left Icon + Info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all",
                      isSelected ? "border-sky-500/30 bg-white dark:bg-[#06070a] shadow-xs" : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#06070a]"
                    )}>
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          "text-xs sm:text-sm font-bold truncate transition-colors",
                          item.category === "command" && "font-mono text-blue-600 dark:text-blue-400",
                          isSelected ? "text-sky-600 dark:text-sky-400" : "text-slate-900 dark:text-slate-100"
                        )}>
                          {item.title}
                        </span>
                        {item.typeTag && (
                          <span className={cn(
                            "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                            item.category === "action"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                              : item.category === "command"
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                              : "border border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400"
                          )}>
                            {item.typeTag}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className={cn(
                          "text-xs truncate",
                          isSelected ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-500 dark:text-slate-400"
                        )}>{item.subtitle}</p>
                      )}
                      {item.soql && (
                        <div className="mt-1.5 truncate rounded-lg border border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-[#06070a] px-2 py-1 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                          {item.soql.replace(/\n/g, " ")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-muted/60 text-[10px] font-mono text-muted-foreground border">
                        {item.shortcut}
                      </kbd>
                    )}

                    {item.category === "soql" && item.soql && (
                      <button
                        type="button"
                        onClick={(e) => handleCopySOQL(e, item)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all shadow-xs",
                          copiedId === item.id
                            ? "bg-emerald-500 text-white shadow-emerald-500/20"
                            : "border border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-[#06070a] text-slate-700 dark:text-slate-300 hover:border-sky-500/40"
                        )}
                        title="Copy SOQL"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </button>
                    )}

                    <div className={cn(
                      "flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold shadow-xs transition-colors",
                      isSelected 
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-500/20" 
                        : "border border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-[#06070a] text-slate-700 dark:text-slate-300"
                    )}>
                      <span>{item.category === "action" ? "Route" : item.category === "command" ? "Run" : item.category === "navigation" ? "Open" : "Use"}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Command Center Footer Tips */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-[#06070a]/90 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-muted font-mono font-bold">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-muted font-mono font-bold">↵</kbd> Select</span>
            <span><kbd className="px-1 py-0.5 rounded bg-muted font-mono font-bold">Tab</kbd> Autocomplete</span>
          </div>
          <span className="hidden sm:inline font-medium">Meghdoot Command Center v2.4</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
