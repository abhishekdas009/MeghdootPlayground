"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  Terminal,
  ArrowRight,
  Copy,
  ExternalLink,
  Star,
  Clock,
  X,
  Database,
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Calculator,
  Settings,
  HelpCircle,
  History,
  Sparkles,
  Check,
  ChevronRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Define search item types
export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "navigation" | "soql" | "recent";
  typeTag?: string; // e.g., "WorkOrder", "Asset", "Module", "KPI"
  url?: string;
  soql?: string;
  icon: React.ReactNode;
  favourite?: boolean;
}

const NAVIGATION_ITEMS: SearchItem[] = [
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
    id: "nav-excel",
    title: "Excel Automation Arena",
    subtitle: "Automate spreadsheet formatting, VLOOKUP reconciliations, and bulk data processing",
    category: "navigation",
    typeTag: "Utility",
    url: "/excel-automation",
    icon: <FileSpreadsheet className="h-5 w-5 text-green-600" />,
  },
  {
    id: "nav-ticket-formatter",
    title: "Ticket Formatter & Cleanser",
    subtitle: "Clean raw ticket lists into structured CSV, SQL IN syntax, or newline separated strings",
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
  {
    id: "soql-13",
    title: "Technician Assessment Link",
    subtitle: "Retrieve technician contact names and assessment questionnaire URLs",
    category: "soql",
    typeTag: "Contact",
    soql: "SELECT Name, Assessment_Link__c\nFROM Contact\nWHERE Technician_Number__c IN (\n{{tickets}}\n)",
    icon: <FileText className="h-4 w-4 text-purple-500" />,
  },
  {
    id: "soql-14",
    title: "Asset by Department",
    subtitle: "Query assets belonging to specific service department queues and NON NAMO accounts",
    category: "soql",
    typeTag: "Asset",
    soql: "SELECT Id, Component_Id__c, Account.Name, RecordType.Name, Account.Id, Account.Group__c, Account.Customer_ID__c, Account.SAP_Customer_Id__c\nFROM Asset\nWHERE Service_Department_L__c = 'a3cNy0000001IStIAM' AND Account_Group__c = 'NON NAMO'",
    icon: <Database className="h-4 w-4 text-emerald-500" />,
  },
  {
    id: "soql-15",
    title: "Asset ID Fetch",
    subtitle: "Lookup Component Id, record type, and parent account relationships for hardware assets",
    category: "soql",
    typeTag: "Asset",
    soql: "SELECT Component_Id__c, Id, Account.Customer_ID__c, Record_Type__c, Parent.Id, Parent.Account.Id\nFROM Asset\nWHERE Component_Id__c IN (\n{{tickets}}\n)",
    icon: <Database className="h-4 w-4 text-emerald-500" />,
  },
  {
    id: "soql-16",
    title: "Child Details to Parent",
    subtitle: "Retrieve parent asset ID, model numbers, and product families from child components",
    category: "soql",
    typeTag: "Asset",
    soql: "SELECT Parent.Id, Model_Number__c, Product_Family__c, Product_Sub_Family__c, Product2Id\nFROM Asset\nWHERE Parent.Component_Id__c IN (\n{{tickets}}\n)",
    icon: <Database className="h-4 w-4 text-emerald-500" />,
  },
  {
    id: "soql-17",
    title: "Deactivate Comment",
    subtitle: "Retrieve user deactivation comments for community user nicknames",
    category: "soql",
    typeTag: "User",
    soql: "SELECT Deactivation_Comment__c\nFROM User\nWHERE CommunityNickname IN (\n{{tickets}}\n)",
    icon: <FileText className="h-4 w-4 text-slate-500" />,
  },
  {
    id: "soql-18",
    title: "Due Date Fix",
    subtitle: "Check appointment due dates, scheduled times, and bundle statuses for open work orders",
    category: "soql",
    typeTag: "ServiceAppointment",
    soql: "SELECT Id, Status, IsBundleMember, IsManuallyBundled, RelatedBundleId, Work_Order__r.Status, DueDate, SchedEndTime, SchedStartTime\nFROM ServiceAppointment\nWHERE Ticket_Numbers__c IN (\n{{tickets}}\n) AND Work_Order__r.Status != 'Completed'",
    icon: <Clock className="h-4 w-4 text-amber-500" />,
  },
];

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FilterTab = "all" | "navigation" | "soql" | "favorites" | "workorder" | "asset" | "case";

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const router = useRouter();
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
    // Avoid exact duplicate titles between built-in and library
    const libTitles = new Set(libraryQueries.map((q) => q.title.toLowerCase()));
    const filteredBuiltin = BUILTIN_SOQL_ITEMS.filter((b) => !libTitles.has(b.title.toLowerCase()));
    return [...NAVIGATION_ITEMS, ...filteredBuiltin, ...libraryQueries];
  }, [libraryQueries]);

  // Filter items
  const filteredItems = React.useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    
    return allItems.filter((item) => {
      // Tab filtering
      if (activeTab === "navigation" && item.category !== "navigation") return false;
      if (activeTab === "soql" && item.category !== "soql") return false;
      if (activeTab === "favorites" && !item.favourite) return false;
      if (activeTab === "workorder" && item.typeTag?.toLowerCase() !== "workorder") return false;
      if (activeTab === "asset" && item.typeTag?.toLowerCase() !== "asset") return false;
      if (activeTab === "case" && !["case", "serviceappointment"].includes(item.typeTag?.toLowerCase() || "")) return false;

      // Text filtering
      if (!trimmed) return true;
      const matchTitle = item.title.toLowerCase().includes(trimmed);
      const matchSubtitle = item.subtitle?.toLowerCase().includes(trimmed);
      const matchTag = item.typeTag?.toLowerCase().includes(trimmed);
      const matchSoql = item.soql?.toLowerCase().includes(trimmed);
      return matchTitle || matchSubtitle || matchTag || matchSoql;
    });
  }, [allItems, query, activeTab]);

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
    if (item.category === "navigation" && item.url) {
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
      className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/30 px-4 pt-[10vh] backdrop-blur-sm animate-in fade-in duration-200 dark:bg-black/55"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="relative flex w-full max-w-[700px] max-h-[75vh] flex-col overflow-hidden rounded-[1.35rem] border border-white/65 bg-white/70 shadow-[0_24px_70px_-22px_rgba(15,23,42,0.38)] backdrop-blur-[28px] backdrop-saturate-150 animate-in zoom-in-95 duration-200 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[0_24px_70px_-22px_rgba(0,0,0,0.7)]"
        onKeyDown={handleKeyDown}
      >
        {/* Sleek Search Input Bar */}
        <div className="relative bg-white/15 p-3 sm:p-4 dark:bg-white/[0.025]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/50 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition-colors focus-within:border-blue-400/50 focus-within:bg-white/65 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:focus-within:border-sky-400/35 dark:focus-within:bg-white/[0.07]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-[#0176d3] ring-1 ring-blue-500/15 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-300/15">
              <Search className="h-5 w-5" />
            </span>
            <div className="relative flex-1" suppressHydrationWarning data-protonpass-ignore="true">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search modules, pages, or SOQL queries..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent pr-8 text-base font-semibold tracking-tight text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500 sm:text-lg"
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
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/55 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-100"
                title="Clear text"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {!query && (
              <kbd className="hidden rounded-md border border-slate-200/70 bg-white/40 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 sm:inline-flex dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-500">ESC</kbd>
            )}
          </div>
        </div>
        
        {/* Soft Divider */}
        <div className="h-px w-full bg-white/65 dark:bg-white/[0.07]" />

        {/* Simple Results List Area */}
        <div className="custom-scrollbar flex-1 min-h-[250px] max-h-[55vh] space-y-1.5 overflow-y-auto bg-white/[0.14] p-2.5 dark:bg-slate-950/[0.18]">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Search className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-base font-bold text-slate-600 dark:text-slate-400">No results found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try a different search term or category</p>
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
                    "group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-transparent bg-white/[0.16] p-3 transition-all duration-200 dark:bg-white/[0.035]",
                    isSelected
                      ? "border-blue-400/25 bg-blue-500/10 shadow-[0_8px_24px_-16px_rgba(37,99,235,0.65)] ring-1 ring-blue-500/10 dark:border-sky-300/15 dark:bg-sky-400/[0.09]"
                      : "hover:border-white/70 hover:bg-white/45 hover:shadow-[0_8px_20px_-18px_rgba(15,23,42,0.3)] dark:hover:border-white/[0.08] dark:hover:bg-white/[0.065]"
                  )}
                >
                  {/* Left Icon + Info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105",
                      isSelected ? "border-white/70 bg-white/50 shadow-sm dark:border-white/10 dark:bg-white/[0.06]" : "border-white/55 bg-white/30 dark:border-white/[0.06] dark:bg-white/[0.035]"
                    )}>
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          "text-sm font-bold truncate transition-colors",
                          isSelected ? "text-[#0176d3] dark:text-blue-400" : "text-slate-700 dark:text-slate-200"
                        )}>
                          {item.title}
                        </span>
                        {item.typeTag && (
                          <span className="inline-flex shrink-0 items-center rounded-md border border-white/55 bg-white/35 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-slate-400">
                            {item.typeTag}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className={cn(
                          "text-[13px] truncate",
                          isSelected ? "text-slate-600 dark:text-slate-400 font-medium" : "text-slate-500 dark:text-slate-500"
                        )}>{item.subtitle}</p>
                      )}
                      {item.soql && (
                        <div className="mt-2 truncate rounded-lg border border-white/45 bg-white/20 px-2 py-1.5 font-mono text-[10px] text-slate-500 shadow-inner dark:border-white/[0.06] dark:bg-black/15 dark:text-slate-400">
                          {item.soql.replace(/\n/g, " ")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.category === "soql" && item.soql && (
                      <button
                        type="button"
                        onClick={(e) => handleCopySOQL(e, item)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm",
                          copiedId === item.id
                            ? "bg-emerald-500 text-white shadow-emerald-500/20"
                            : "border border-white/70 bg-white/45 text-slate-600 hover:border-blue-300/60 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:border-sky-300/25"
                        )}
                        title="Copy SOQL"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </>
                        )}
                      </button>
                    )}

                    <div className={cn(
                      "flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm transition-colors",
                      isSelected 
                        ? "bg-[#0176d3] text-white shadow-blue-500/20" 
                        : "border border-white/70 bg-white/45 text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300"
                    )}>
                      <span>{item.category === "navigation" ? "Open" : "Run"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
