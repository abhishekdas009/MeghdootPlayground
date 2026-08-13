"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import {
  Copy,
  Download,
  Edit2,
  ExternalLink,
  FolderOpen,
  History,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
  Database,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  PlayCircle,
  Code2,
  Check,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trackDashboardEvent } from "@/lib/dashboard-tracker";
import Editor, { useMonaco } from "@monaco-editor/react";

interface LibraryQuery {
  id: string;
  label: string;
  description: string;
  category: string;
  tags: string[];
  soql: string;
  favourite: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

type SortOption = "updated-desc" | "label-asc" | "category-asc" | "usage-desc" | "favourites-first";
type FormState = Pick<LibraryQuery, "label" | "description" | "category" | "tags" | "soql">;
type ViewMode = "grid" | "table";

const defaultForm: FormState = {
  label: "",
  description: "",
  category: "WorkOrder",
  tags: [],
  soql: "",
};

const SAMPLE_QUERIES: Array<Pick<LibraryQuery, "label" | "category" | "tags" | "description" | "soql" | "favourite">> = [
  {
    label: "TS (Ticket Status)",
    category: "WorkOrder",
    tags: ["tracking", "status"],
    description: "Fetch current WorkOrder Status and ParentWorkOrderId for ticket tracking.",
    soql: "SELECT Id, Status, ParentWorkOrderId\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)",
    favourite: true,
  },
  {
    label: "Asset Transfer",
    category: "Asset",
    tags: ["transfer", "hardware"],
    description: "Retrieve hardware asset details, account ownership, and installation status for transfer verification.",
    soql: "SELECT Id, Name, SerialNumber, AccountId, Status, InstallDate\nFROM Asset\nWHERE SerialNumber IN (\n{{tickets}}\n)",
    favourite: false,
  },
  {
    label: "CANCELLATION TICKETS",
    category: "WorkOrder",
    tags: ["cancellation", "open-tickets"],
    description: "Retrieve open, non-completed WorkOrders to prepare tickets for cancellation.",
    soql: "SELECT Id, Ticket_Number_Read_Only__c, Status\nFROM WorkOrder\nWHERE Status != 'Completed' AND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)",
    favourite: false,
  },
  {
    label: "Cancellation Requested",
    category: "WorkOrder",
    tags: ["cancellation", "status"],
    description: "Filter WorkOrders where Status is currently marked as 'Cancellation Requested'.",
    soql: "SELECT Id, Ticket_Number_Read_Only__c, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)\nAND Status = 'Cancellation Requested'",
    favourite: false,
  },
  {
    label: "Case Cancellation",
    category: "WorkOrder",
    tags: ["cancellation", "case"],
    description: "Query parent Case status and cancellation reason fields for open work orders.",
    soql: "SELECT Id, Status, CaseId, Case.Status, Case.Cancellation_Reason__c, Cancellation_Reason__c\nFROM WorkOrder\nWHERE Status != 'Completed' AND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)",
    favourite: false,
  },
  {
    label: "SA (Service Appointment)",
    category: "ServiceAppointment",
    tags: ["appointment", "scheduling"],
    description: "Get Service Appointment ID and scheduling status for given ticket numbers.",
    soql: "SELECT Id, Status\nFROM ServiceAppointment\nWHERE Ticket_Numbers__c IN (\n{{tickets}}\n)",
    favourite: false,
  },
  {
    label: "Case Assign",
    category: "Case",
    tags: ["assignment", "routing"],
    description: "Retrieve Case Status and OwnerId to facilitate ticket reassignment workflows.",
    soql: "SELECT Id,Status,OwnerId\nFROM Case\nWHERE Id IN (\n{{tickets}}\n)",
    favourite: false,
  },
  {
    label: "TC (Technician Check)",
    category: "ServiceAppointment",
    tags: [],
    description: "Check assigned service resource (technician) details and parent work order relationships.",
    soql: "SELECT Id,\n       Work_Order__c,\n       FSSK__FSK_Assigned_Service_Resource__c,\n       FSSK__FSK_Assigned_Service_Resource__r.Name\nFROM ServiceAppointment\nWHERE Ticket_Numbers__c IN (\n{{tickets}}\n)",
    favourite: false,
  },
  {
    label: "TSC (Ticket Status Count)",
    category: "WorkOrder",
    tags: [],
    description: "Aggregate and count WorkOrders grouped by status, ordered by frequency.",
    soql: "SELECT Status,\n       COUNT(Id)\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)\nGROUP BY Status\nORDER BY COUNT(Id) DESC",
    favourite: false,
  },
  {
    label: "PO (Payout / Product Information)",
    category: "WorkOrder",
    tags: [],
    description: "Fetch payout status and product sub-family codes for parent work orders.",
    soql: "SELECT Id,\n       ParentWorkOrderId,\n       Status,\n       Payout__c,\n       Asset.Product_Sub_Family__r.Code__c\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)",
    favourite: false,
  },
  {
    label: "TS (Open Tickets Only)",
    category: "WorkOrder",
    tags: [],
    description: "Retrieve active tickets excluding Completed, Canceled, or Bundled statuses.",
    soql: "SELECT Id, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)\nAND Status NOT IN ('Completed','Canceled','Bundled')",
    favourite: false,
  },
  {
    label: "Account ID Fetch",
    category: "Account",
    tags: [],
    description: "Lookup internal Account Id mapping using external Customer ID.",
    soql: "SELECT Customer_ID__c, Id\nFROM Account\nWHERE Customer_ID__c IN (\n{{tickets}}\n)",
    favourite: false,
  },
  {
    label: "Technician Assessment Link",
    category: "Contact",
    tags: [],
    description: "Retrieve technician contact names and assessment questionnaire URLs.",
    soql: "SELECT Name, Assessment_Link__c\nFROM Contact\nWHERE Technician_Number__c IN (\n{{tickets}}\n)",
    favourite: false,
  },
  {
    label: "Asset by Department",
    category: "Asset",
    tags: [],
    description: "Query assets belonging to specific service department queues and NON NAMO accounts.",
    soql: "SELECT Id, Component_Id__c, Account.Name, RecordType.Name, Account.Id, Account.Group__c, Account.Customer_ID__c, Account.SAP_Customer_Id__c\nFROM Asset\nWHERE Service_Department_L__c = 'a3cNy0000001IStIAM' AND Account_Group__c = 'NON NAMO'",
    favourite: false,
  },
  {
    label: "Asset ID Fetch",
    category: "Asset",
    tags: [],
    description: "Lookup Component Id, record type, and parent account relationships for hardware assets.",
    soql: "SELECT Component_Id__c, Id, Account.Customer_ID__c, Record_Type__c, Parent.Id, Parent.Account.Id\nFROM Asset\nWHERE Component_Id__c IN (\n{{tickets}}\n)",
    favourite: false,
  },
  {
    label: "Child Details to Parent",
    category: "Asset",
    tags: [],
    description: "Retrieve parent asset ID, model numbers, and product families from child components.",
    soql: "SELECT Parent.Id, Model_Number__c, Product_Family__c, Product_Sub_Family__c, Product2Id\nFROM Asset\nWHERE Parent.Component_Id__c IN (\n{{tickets}}\n)",
    favourite: false,
  },
  {
    label: "Deactivate Comment",
    category: "User",
    tags: [],
    description: "Retrieve user deactivation comments for community user nicknames.",
    soql: "SELECT Deactivation_Comment__c\nFROM User\nWHERE CommunityNickname IN (\n{{tickets}}\n)",
    favourite: false,
  },
  {
    label: "Due Date Fix",
    category: "ServiceAppointment",
    tags: [],
    description: "Check appointment due dates, scheduled times, and bundle statuses for open work orders.",
    soql: "SELECT Id, Status, IsBundleMember, IsManuallyBundled, RelatedBundleId, Work_Order__r.Status, DueDate, SchedEndTime, SchedStartTime\nFROM ServiceAppointment\nWHERE Ticket_Numbers__c IN (\n{{tickets}}\n) AND Work_Order__r.Status != 'Completed'",
    favourite: false,
  },
];

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string" && body.error.trim()) return body.error;
  } catch {}

  return "Request failed";
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) throw new Error(await readApiError(response));
  return response.json() as Promise<T>;
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function sortQueries(queries: LibraryQuery[], sortBy: SortOption) {
  const list = [...queries];

  switch (sortBy) {
    case "label-asc":
      return list.sort((a, b) => a.label.localeCompare(b.label));
    case "category-asc":
      return list.sort((a, b) => a.category.localeCompare(b.category) || a.label.localeCompare(b.label));
    case "usage-desc":
      return list.sort((a, b) => b.usageCount - a.usageCount || b.updatedAt.localeCompare(a.updatedAt));
    case "favourites-first":
      return list.sort((a, b) => Number(b.favourite) - Number(a.favourite) || b.updatedAt.localeCompare(a.updatedAt));
    case "updated-desc":
    default:
      return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

const tagColors = [
  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20",
];

const getTagColor = (tag: string) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return tagColors[Math.abs(hash) % tagColors.length];
};

export default function QueryLibraryPage() {
  const [queries, setQueries] = React.useState<LibraryQuery[]>([]);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = React.useState(false);
  const monaco = useMonaco();

  React.useEffect(() => {
    if (monaco) {
      try {
        if (!monaco.languages.getLanguages().some((l) => l.id === "soql")) {
          monaco.languages.register({ id: "soql" });
          monaco.languages.setMonarchTokensProvider("soql", {
            ignoreCase: true,
            keywords: [
              "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "INCLUDES", "EXCLUDES", "LIKE", "ORDER", "BY", "LIMIT", "OFFSET", "ASC", "DESC", "NULLS", "FIRST", "LAST", "GROUP", "HAVING", "WITH", "DATA", "CATEGORY", "UPDATE", "TRACKING", "VIEWSTAT", "FOR", "REFERENCE", "NULL", "TRUE", "FALSE",
            ],
            operators: ["=", "!=", "<", ">", "<=", ">=", ":", "!"],
            symbols: /[=><!~?:&|+\-*\/\^%]+/,
            tokenizer: {
              root: [
                [/[a-zA-Z_]\w*/, { cases: { "@keywords": "keyword", "@default": "identifier" } }],
                [/'[^']*'/, "string"],
                [/\d+/, "number"],
                [/[{}()\[\]]/, "@brackets"],
                [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],
              ],
            },
          });

          monaco.languages.registerCompletionItemProvider("soql", {
            provideCompletionItems: (model, position) => {
              const word = model.getWordUntilPosition(position);
              const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
              };

              const suggestions = [
                ...["SELECT", "FROM", "WHERE", "ORDER BY", "LIMIT", "AND", "OR", "IN"].map((k) => ({
                  label: k,
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: k,
                  range,
                })),
                ...["WorkOrder", "Case", "Asset", "Account", "Contact", "ServiceAppointment", "Product2", "User"].map((obj) => ({
                  label: obj,
                  kind: monaco.languages.CompletionItemKind.Class,
                  insertText: obj,
                  range,
                })),
                ...["Id", "Name", "Status", "Ticket_Number_Read_Only__c", "CreatedDate", "Subject", "Description", "ParentId", "AccountId"].map((field) => ({
                  label: field,
                  kind: monaco.languages.CompletionItemKind.Field,
                  insertText: field,
                  range,
                })),
              ];

              return { suggestions };
            },
          });
        }
      } catch (e) {
        // Ignored
      }
    }
  }, [monaco]);
  const [search, setSearch] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<LibraryQuery | null>(null);
  const [form, setForm] = React.useState<FormState>(defaultForm);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = React.useState<SortOption>("updated-desc");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = React.useState(false);
  const [historyQuery, setHistoryQuery] = React.useState<LibraryQuery | null>(null);
  const [historyRecords, setHistoryRecords] = React.useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const loadQueries = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await requestJson<{ queries: LibraryQuery[] }>("/api/soql-library");
      setQueries(Array.isArray(data.queries) ? data.queries : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load SOQL library");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  const categories = React.useMemo(() => {
    const values = new Set(queries.map((query) => query.category).filter(Boolean));
    return ["all", ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [queries]);

  const stats = React.useMemo(() => {
    return {
      total: queries.length,
      favourites: queries.filter((query) => query.favourite).length,
      categories: new Set(queries.map((query) => query.category)).size,
      uses: queries.reduce((sum, query) => sum + query.usageCount, 0),
    };
  }, [queries]);

  const filtered = React.useMemo(() => {
    const queryText = search.trim().toLowerCase();
    const base = queries.filter((query) => {
      const matchesSearch =
        !queryText ||
        query.label.toLowerCase().includes(queryText) ||
        query.category.toLowerCase().includes(queryText) ||
        query.description.toLowerCase().includes(queryText) ||
        query.soql.toLowerCase().includes(queryText) ||
        (query.tags && query.tags.some(tag => tag.toLowerCase().includes(queryText)));

      return matchesSearch && (categoryFilter === "all" || query.category === categoryFilter);
    });

    return sortQueries(base, sortBy);
  }, [queries, search, categoryFilter, sortBy]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAllSelection = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(q => q.id)));
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm(defaultForm);
    setIsCreatingNewCategory(false);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (query: LibraryQuery) => {
    setEditing(query);
    setForm({
      label: query.label,
      description: query.description,
      category: query.category,
      tags: query.tags || [],
      soql: query.soql,
    });
    setIsCreatingNewCategory(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleFormatSOQL = () => {
    if (!form.soql) return;
    
    // Very basic SOQL formatter for readability
    let formatted = form.soql
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .trim();
      
    formatted = formatted
      .replace(/\b(SELECT|FROM|WHERE|ORDER BY|LIMIT|GROUP BY|HAVING)\b/gi, (match) => `\n${match.toUpperCase()}`)
      .replace(/\b(AND|OR)\b/gi, (match) => `\n  ${match.toUpperCase()}`)
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .trim();
      
    // Fix IN (...) clauses if they contain our special {{tickets}} tag
    formatted = formatted.replace(/IN \(\{\{tickets\}\}\)/gi, "IN (\n{{tickets}}\n)");
    
    // Remove leading newline if present
    formatted = formatted.replace(/^\n/, "");
      
    setForm(current => ({ ...current, soql: formatted }));
    toast.success("Query formatted!");
  };

  const handleTestSOQL = () => {
    if (!form.soql) {
      toast.error("Please enter a SOQL query to test.");
      return;
    }

    const query = form.soql;
    const upperQuery = query.toUpperCase();
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic structure checks
    if (!/SELECT\s+/i.test(query)) errors.push("Missing 'SELECT' clause.");
    if (!/FROM\s+/i.test(query)) errors.push("Missing 'FROM' clause.");
    if (upperQuery.indexOf("FROM") !== -1 && upperQuery.indexOf("SELECT") !== -1 && upperQuery.indexOf("FROM") < upperQuery.indexOf("SELECT")) {
      errors.push("'FROM' clause must appear after 'SELECT' clause.");
    }

    // Unallowed characters / SQL dialects
    if (/[;]/.test(query)) errors.push("Remove semicolons (;). SOQL does not use them.");
    if (/\bSELECT\s+\*\s+FROM\b/i.test(query)) errors.push("SOQL does not support 'SELECT *'. Specify fields explicitly.");
    if (/\b(JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|OUTER JOIN)\b/i.test(query)) {
      errors.push("SOQL does not support 'JOIN'. Use relationship queries (e.g., Contact.Account.Name).");
    }
    if (/\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE)\b/i.test(query)) {
      errors.push("DML/DDL statements are not allowed in SOQL queries.");
    }
    
    // Formatting & Syntax Details
    if (query.includes('"')) {
      errors.push("Use single quotes (') for string literals, not double quotes (\").");
    }

    // Balanced Parentheses & Quotes
    const openParens = (query.match(/\(/g) || []).length;
    const closeParens = (query.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push(`Mismatched parentheses: ${openParens} open vs ${closeParens} close.`);
    }

    const singleQuotes = (query.match(/'/g) || []).length;
    if (singleQuotes % 2 !== 0) {
      errors.push("Unbalanced single quotes detected.");
    }

    // Commas and Clauses Checks
    if (/,\s*FROM/i.test(query)) {
      errors.push("Remove trailing comma before 'FROM'.");
    }
    if (/,\s*WHERE/i.test(query)) {
      errors.push("Remove trailing comma before 'WHERE'.");
    }

    // LIMIT and OFFSET checks
    const limitMatch = query.match(/LIMIT\s+([^\s]+)/i);
    if (limitMatch && isNaN(Number(limitMatch[1]))) {
      errors.push(`Invalid LIMIT value: '${limitMatch[1]}'. Must be a number.`);
    }
    const offsetMatch = query.match(/OFFSET\s+([^\s]+)/i);
    if (offsetMatch && isNaN(Number(offsetMatch[1]))) {
      errors.push(`Invalid OFFSET value: '${offsetMatch[1]}'. Must be a number.`);
    }

    // Missing required tokens
    if (/\bSELECT\s+FROM\b/i.test(query)) {
      errors.push("Missing fields between 'SELECT' and 'FROM'.");
    }
    if (/\bFROM\s+(WHERE|WITH|GROUP|HAVING|ORDER|LIMIT|OFFSET|FOR|UPDATE|$)/i.test(query) || /\bFROM\s*$/i.test(query)) {
      errors.push("Missing object name after 'FROM'.");
    }
    if (/\bWHERE\s+(WITH|GROUP|HAVING|ORDER|LIMIT|OFFSET|FOR|UPDATE|$)/i.test(query) || /\bWHERE\s*$/i.test(query)) {
      errors.push("Missing condition after 'WHERE'.");
    }
    if (/\bGROUP\s+BY\s+(HAVING|ORDER|LIMIT|OFFSET|FOR|UPDATE|$)/i.test(query) || /\bGROUP\s+BY\s*$/i.test(query)) {
      errors.push("Missing fields after 'GROUP BY'.");
    }
    
    // Warning for missing {{tickets}} if applicable
    if (form.soql.toLowerCase().includes("in (") && !form.soql.includes("{{tickets}}")) {
       warnings.push("Tip: Use {{tickets}} placeholder for dynamic injection inside IN () clauses.");
    }

    // Clause order check
    const clauses = ["SELECT", "FROM", "WHERE", "WITH", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "OFFSET", "FOR VIEW", "FOR REFERENCE", "UPDATE TRACKING", "UPDATE VIEWSTAT"];
    let lastFoundIdx = -1;
    let lastFoundName = "";
    
    for (let i = 0; i < clauses.length; i++) {
      const clause = clauses[i];
      const regex = new RegExp(`\\b${clause}\\b`, "i");
      const match = query.match(regex);
      if (match && match.index !== undefined) {
        if (match.index < lastFoundIdx) {
          errors.push(`'${clause}' is out of order. It must appear after '${lastFoundName}'.`);
        }
        lastFoundIdx = match.index;
        lastFoundName = clause;
      }
    }

    if (errors.length > 0) {
      errors.forEach(err => toast.error(`Error: ${err}`));
    } else {
      toast.success("Query passed advanced SOQL syntax validation! ✅");
      warnings.forEach(warn => toast.info(warn));
    }
  };

  const openHistory = async (query: LibraryQuery) => {
    setHistoryQuery(query);
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const data = await requestJson<{ history: any[] }>(`/api/soql-library/${query.id}/history`);
      setHistoryRecords(data.history || []);
    } catch (e) {
      toast.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRestore = async (historyId: string) => {
    if (!historyQuery) return;
    setLoadingHistory(true);
    try {
      const data = await requestJson<{ query: LibraryQuery }>(`/api/soql-library/${historyQuery.id}/rollback`, {
        method: "POST",
        body: JSON.stringify({ historyId })
      });
      setQueries((current) => current.map((q) => (q.id === data.query.id ? data.query : q)));
      toast.success("Query successfully restored to previous version!");
      setHistoryModalOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to restore version");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSave = async () => {
    const payload = {
      label: form.label.trim(),
      category: form.category.trim(),
      tags: form.tags,
      description: form.description.trim(),
      soql: form.soql.trim(),
    };

    if (!payload.label || !payload.category || !payload.soql) {
      toast.error("Label, category and SOQL are required");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const data = await requestJson<{ query: LibraryQuery }>(`/api/soql-library/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setQueries((current) => current.map((query) => (query.id === data.query.id ? data.query : query)));
        toast.success("Query updated successfully");
        trackDashboardEvent({
          metricKey: "templates_created",
          incrementBy: 0,
          event: {
            type: "template-updated",
            label: `Template updated · ${payload.label}`,
            meta: payload.category,
            module: "template",
          },
        });
      } else {
        const data = await requestJson<{ query: LibraryQuery }>("/api/soql-library", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setQueries((current) => [data.query, ...current]);
        toast.success("Query saved to library");
        trackDashboardEvent({
          metricKey: "templates_created",
          incrementBy: 1,
          event: {
            type: "template-created",
            label: `Template created · ${payload.label}`,
            meta: payload.category,
            module: "template",
          },
        });
      }
      closeForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save query");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this saved query?")) return;
    try {
      await requestJson<{ query: LibraryQuery }>(`/api/soql-library/${id}`, { method: "DELETE" });
      setQueries((current) => current.filter((query) => query.id !== id));
      toast.success("Query deleted");
      trackDashboardEvent({
        metricKey: "templates_created",
        incrementBy: -1,
        event: {
          type: "template-deleted",
          label: "Template deleted",
          meta: undefined,
          module: "template",
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete query");
    }
  };

  const toggleFavourite = async (query: LibraryQuery) => {
    try {
      const data = await requestJson<{ query: LibraryQuery }>(`/api/soql-library/${query.id}`, {
        method: "PATCH",
        body: JSON.stringify({ favourite: !query.favourite }),
      });
      setQueries((current) => current.map((item) => (item.id === data.query.id ? data.query : item)));
      toast.success(data.query.favourite ? "Added to favourites" : "Removed from favourites");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update favourite");
    }
  };

  const handleDuplicate = async (query: LibraryQuery) => {
    try {
      const data = await requestJson<{ query: LibraryQuery }>("/api/soql-library", {
        method: "POST",
        body: JSON.stringify({
          label: `${query.label} Copy`,
          category: query.category,
          description: query.description,
          soql: query.soql,
          favourite: false,
        }),
      });
      setQueries((current) => [data.query, ...current]);
      toast.success("Query duplicated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to duplicate query");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} queries?`)) return;

    setLoading(true);
    try {
      await requestJson("/api/soql-library/bulk-delete", {
        method: "POST",
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      setQueries(current => current.filter(q => !selectedIds.has(q.id)));
      setSelectedIds(new Set());
      toast.success(`Successfully deleted ${selectedIds.size} queries!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete queries");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCategorize = async () => {
    if (selectedIds.size === 0) return;
    const newCategory = window.prompt(`Enter new category for ${selectedIds.size} selected queries:`);
    if (!newCategory || !newCategory.trim()) return;

    setLoading(true);
    try {
      await requestJson("/api/soql-library/bulk-categorize", {
        method: "POST",
        body: JSON.stringify({ ids: Array.from(selectedIds), category: newCategory.trim() })
      });
      
      // Reload everything to get updated history and data easily
      await loadQueries();
      setSelectedIds(new Set());
      toast.success(`Updated category for ${selectedIds.size} queries!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update categories");
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (selectedIds.size === 0) return;
    
    const itemsToExport = queries.filter(q => selectedIds.has(q.id)).map(q => ({
      label: q.label,
      category: q.category,
      tags: q.tags,
      description: q.description,
      soql: q.soql,
    }));

    const blob = new Blob([JSON.stringify(itemsToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soql_templates_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${selectedIds.size} queries to JSON!`);
  };





  const handleUse = async (query: LibraryQuery) => {
    try {
      const data = await requestJson<{ query: LibraryQuery }>(`/api/soql-library/${query.id}/use`, { method: "POST" });
      setQueries((current) => current.map((item) => (item.id === data.query.id ? data.query : item)));
    } catch {}
  };

  const handleCopy = async (query: LibraryQuery) => {
    try {
      await navigator.clipboard.writeText(query.soql);
      setCopiedId(query.id);
      setTimeout(() => setCopiedId(null), 2000);
      await handleUse(query);
      toast.success("SOQL syntax copied to clipboard!");
    } catch {
      toast.error("Unable to copy SOQL");
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(queries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `soql-library-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Library exported as JSON");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed)) throw new Error("Invalid JSON file");

        const imported = parsed
          .map((item) => ({
            label: String(item.label ?? item.name ?? "").trim(),
            category: String(item.category ?? "General").trim(),
            description: String(item.description ?? "").trim(),
            soql: String(item.soql ?? "").trim(),
            favourite: Boolean(item.favourite),
          }))
          .filter((item) => item.label && item.category && item.soql);

        const created: LibraryQuery[] = [];
        for (const item of imported) {
          const data = await requestJson<{ query: LibraryQuery }>("/api/soql-library", {
            method: "POST",
            body: JSON.stringify(item),
          });
          created.push(data.query);
        }

        setQueries((current) => [...created, ...current]);
        toast.success(`Successfully imported ${created.length} queries`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Invalid JSON file");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSamples = async () => {
    setLoading(true);
    try {
      const existingLabels = new Set(queries.map((q) => q.label.toLowerCase()));
      const toCreate = SAMPLE_QUERIES.filter((item) => !existingLabels.has(item.label.toLowerCase()));

      if (toCreate.length === 0) {
        toast.info("All 18 standard Salesforce operations queries are already present in your library!");
        setLoading(false);
        return;
      }

      const created: LibraryQuery[] = [];
      for (const item of toCreate) {
        const data = await requestJson<{ query: LibraryQuery }>("/api/soql-library", {
          method: "POST",
          body: JSON.stringify(item),
        });
        created.push(data.query);
      }
      setQueries((current) => [...created, ...current]);
      toast.success(`Successfully loaded ${created.length} new Salesforce operations queries!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load queries");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace-page mx-auto w-full max-w-7xl space-y-5 md:space-y-8 p-3 sm:p-5 lg:p-8">
      {/* ─── 1. FULL-WIDTH SALESFORCE LIGHTNING PAGE HEADER ───────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-hero relative flex flex-col gap-4 md:gap-6 overflow-hidden rounded-3xl p-5 md:p-8"
      >
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/20 dark:mix-blend-screen" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20 dark:mix-blend-screen" />
        
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 flex-wrap">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0176d3] to-indigo-600 shadow-lg shadow-[#0176d3]/30">
                <Database className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-[#0176d3]/10 text-blue-700 border border-[#0176d3]/30 text-xs font-bold px-3 py-1 flex items-center gap-2 shadow-inner backdrop-blur-sm dark:bg-[#0176d3]/20 dark:text-blue-300 dark:border-[#0176d3]/40">
                    Lightning Repository
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">• Salesforce CRM v2.4</span>
                </div>
                <h1 className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-slate-950 drop-shadow-sm dark:text-white">
                  SOQL Query <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Library</span>
                </h1>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
              Save, categorize, and execute custom SOQL query templates. Organize by Salesforce object types and run them directly in your generator workbench.
            </p>
          </div>

          {/* Right: Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 self-start md:self-center">
            <Button
              variant="outline"
              className="h-11 px-5 rounded-xl font-bold border-indigo-500/30 text-indigo-700 hover:bg-indigo-500/10 hover:text-indigo-800 shadow-lg backdrop-blur-md gap-2 whitespace-nowrap transition-all w-full sm:w-auto dark:border-indigo-500/40 dark:text-indigo-300 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-200"
              onClick={handleLoadSamples}
              disabled={loading}
              title="Load 18 standard Salesforce operation queries"
            >
              <Sparkles className="h-4 w-4" />
              <span>Load 18 SFDC Templates</span>
            </Button>

            <Button
              onClick={openCreateForm}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#0176d3] to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 gap-2 whitespace-nowrap w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>New Query</span>
            </Button>
          </div>
        </div>

        {/* Bottom Toolbar Row: Secondary utility tools */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 md:pt-6 mt-2 border-t border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Repository Active & Syncing</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-lg font-bold border-slate-200 bg-white/55 text-slate-700 hover:bg-slate-100 hover:text-slate-950 shadow-sm backdrop-blur-md gap-1.5 transition-all dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              onClick={loadQueries}
              disabled={loading}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-lg font-bold border-slate-200 bg-white/55 text-slate-700 hover:bg-slate-100 hover:text-slate-950 shadow-sm backdrop-blur-md gap-1.5 transition-all dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import JSON</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-lg font-bold border-slate-200 bg-white/55 text-slate-700 hover:bg-slate-100 hover:text-slate-950 shadow-sm backdrop-blur-md gap-1.5 transition-all dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              onClick={handleExport}
              disabled={queries.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </Button>

            <Link href="/soql-generator">
              <Button size="sm" className="h-9 px-4 rounded-lg font-bold bg-[#0176d3]/10 text-blue-700 hover:bg-[#0176d3]/20 border border-[#0176d3]/30 shadow-sm backdrop-blur-md gap-1.5 transition-all ml-2 dark:bg-[#0176d3]/20 dark:text-blue-300 dark:hover:bg-[#0176d3]/40 dark:border-[#0176d3]/50">
                <PlayCircle className="h-3.5 w-3.5" />
                <span>Launch Workbench</span>
              </Button>
            </Link>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
      </motion.div>

      {/* ─── 2. DEDICATED KPI SUMMARY ROW OR FORM ─────────────────── */}
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div
            key="kpi-cards"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { title: "Total Templates", val: stats.total, sub: "Stored in repository", icon: Code2, color: "text-[#0176d3] dark:text-blue-400", bg: "bg-[#0176d3]/10 dark:bg-blue-500/10", border: "border-t-[#0176d3] dark:border-t-blue-500", grad: "from-[#0176d3]/5 dark:from-blue-500/10 to-transparent" },
              { title: "Favourites", val: stats.favourites, sub: "Starred quick access", icon: Star, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10 dark:bg-amber-500/10", border: "border-t-amber-500 dark:border-t-amber-400", grad: "from-amber-500/5 dark:from-amber-500/10 to-transparent" },
              { title: "SFDC Objects", val: stats.categories, sub: "Distinct object types", icon: Layers, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 dark:bg-purple-500/10", border: "border-t-purple-500 dark:border-t-purple-400", grad: "from-purple-500/5 dark:from-purple-500/10 to-transparent" },
              { title: "Executions", val: stats.uses, sub: "Lifetime query runs", icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 dark:bg-emerald-500/10", border: "border-t-emerald-500 dark:border-t-emerald-400", grad: "from-emerald-500/5 dark:from-emerald-500/10 to-transparent" },
            ].map((kpi, i) => (
              <motion.div key={kpi.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className={cn("relative overflow-hidden shadow-lg shadow-black/5 dark:shadow-black/20 ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl transition-all hover:shadow-xl hover:-translate-y-1 rounded-2xl border-t-4", kpi.border)}>
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", kpi.grad)} />
                  <div className="p-6 flex flex-col justify-between h-full relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{kpi.title}</span>
                      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm border border-black/5 dark:border-white/5 transition-transform hover:scale-105", kpi.bg, kpi.color)}>
                        <kpi.icon className={cn("h-5 w-5", kpi.title === "Favourites" ? "fill-current" : "")} />
                      </div>
                    </div>
                    <div className="mt-5">
                      <h3 className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight drop-shadow-sm">{kpi.val}</h3>
                      <p className="mt-1 text-[13px] font-semibold text-slate-500 dark:text-slate-400">{kpi.sub}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="create-form"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
            className="relative z-20"
          >
            <Card className="border-0 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl overflow-hidden relative transition-all duration-500 focus-within:shadow-[0_0_50px_-15px_rgba(59,130,246,0.3)] focus-within:ring-blue-500/40">
              <div className="absolute top-0 right-0 p-40 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 p-40 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              <CardHeader className="bg-gradient-to-r from-slate-100/50 to-transparent dark:from-slate-800/50 px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-row items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight text-foreground">
                      {editing ? "Edit SOQL Query Template" : "Create New SOQL Template"}
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      Tip: Include <code className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-xs font-mono text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">{`{{tickets}}`}</code> placeholder to dynamically inject ticket lists from the generator.
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={closeForm} className="h-10 w-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>

              <CardContent className="p-5 md:p-8 space-y-4 md:space-y-6 relative z-10">
                <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Query Label *</label>
                    <Input
                      placeholder="e.g. Open WorkOrders by Technician"
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-inner text-sm transition-all"
                      value={form.label}
                      onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Category (Folder) *</label>
                    {!isCreatingNewCategory ? (
                      <Select
                        value={form.category || undefined}
                        onValueChange={(value) => {
                          if (value === "__NEW__") {
                            setIsCreatingNewCategory(true);
                            setForm((current) => ({ ...current, category: "" }));
                          } else {
                            setForm((current) => ({ ...current, category: value }));
                          }
                        }}
                      >
                        <SelectTrigger className="h-12 w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-inner font-semibold text-blue-600 dark:text-blue-400 text-sm transition-all px-4">
                          <SelectValue placeholder="Select a category..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
                          {categories.filter(c => c !== "all").map((c) => (
                            <SelectItem key={c} value={c} className="font-semibold text-slate-700 dark:text-slate-300 focus:bg-blue-500/10 focus:text-blue-600 dark:focus:text-blue-400 rounded-lg cursor-pointer my-0.5">
                              {c}
                            </SelectItem>
                          ))}
                          <SelectSeparator className="bg-slate-200 dark:bg-slate-800 my-1" />
                          <SelectItem value="__NEW__" className="font-bold text-blue-600 dark:text-blue-400 focus:bg-blue-500/10 rounded-lg cursor-pointer">
                            + Create New Category
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="relative flex gap-2">
                        <Input
                          placeholder="Type new category name..."
                          className="h-12 flex-1 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-inner font-semibold text-blue-600 dark:text-blue-400 text-sm transition-all pr-10"
                          value={form.category}
                          onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingNewCategory(false);
                            setForm((current) => ({ ...current, category: categories.length > 1 ? categories[1] : "" }));
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Cancel and select existing"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Tags (Press Enter)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.tags && form.tags.map((tag) => (
                      <Badge key={tag} className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1", getTagColor(tag))}>
                        {tag}
                        <button
                          onClick={() => setForm((c) => ({ ...c, tags: c.tags.filter((t) => t !== tag) }))}
                          className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add a tag and press Enter..."
                    className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-inner text-sm transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim().toLowerCase();
                        if (val && !(form.tags || []).includes(val)) {
                          setForm((c) => ({ ...c, tags: [...(c.tags || []), val] }));
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Description (Optional)</label>
                  <Input
                    placeholder="Briefly describe what this query fetches and when to use it..."
                    className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-inner text-sm transition-all"
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">SOQL Query Syntax *</label>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleTestSOQL}
                        className="text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-md transition-colors"
                        type="button"
                      >
                        <PlayCircle className="h-3 w-3" /> Test Query
                      </button>
                      <button 
                        onClick={handleFormatSOQL}
                        className="text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-md transition-colors"
                        type="button"
                      >
                        <Sparkles className="h-3 w-3" /> Format Query
                      </button>
                    </div>
                  </div>
                  <div className="min-h-[180px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/80 overflow-hidden shadow-inner focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 transition-all pt-2 pb-2">
                    <Editor
                      height="180px"
                      language="soql"
                      theme="vs-dark"
                      value={form.soql}
                      onChange={(value) => setForm((current) => ({ ...current, soql: value || "" }))}
                      options={{
                        minimap: { enabled: false },
                        lineNumbers: "on",
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                        fontFamily: "var(--font-inter), monospace",
                        fontSize: 13,
                        renderLineHighlight: "all",
                        roundedSelection: true,
                        scrollbar: { vertical: "hidden", horizontal: "hidden" },
                        padding: { top: 8, bottom: 8 },
                      }}
                      loading={<div className="p-4 text-sm text-slate-500 font-mono">Loading editor...</div>}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <Button variant="outline" onClick={closeForm} disabled={saving} className="h-12 px-8 rounded-xl font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all"
                  >
                    {saving ? "Saving..." : editing ? "Update Template" : "Save to Library"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 3. INTERACTIVE SEARCH & FILTER TOOLBAR ─────── */}
      <div className="flex flex-col lg:flex-row items-center gap-2 md:gap-3 p-2 md:p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 ring-1 ring-black/5 dark:ring-white/10 w-full relative z-10">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full min-w-[280px] group" suppressHydrationWarning data-protonpass-ignore="true">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0176d3] transition-colors z-10" />
          <Input
            placeholder="Search templates by label, SFDC object, description..."
            className="relative z-10 h-12 w-full pl-11 pr-10 text-sm font-medium rounded-xl border-none bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/50 focus-visible:bg-slate-100/80 dark:focus-visible:bg-slate-800/80 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all placeholder:text-slate-400"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            autoComplete="off"
            data-lpignore="true"
            data-protonpass-ignore="true"
            data-form-type="other"
            suppressHydrationWarning
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors z-10"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-200 dark:bg-slate-700 shrink-0" />

        {/* Filters and View Toggles */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
          <div className="relative group flex-1 sm:flex-none">
            <select
              className="h-10 w-full sm:w-auto appearance-none rounded-lg border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800 pl-3 pr-8 text-[13px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#0176d3]/50 focus:border-[#0176d3] shadow-sm cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700/80"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category} className="bg-background">
                  {category === "all" ? "⚡ All SFDC Categories" : `📁 ${category}`}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          <div className="relative group flex-1 sm:flex-none">
            <select
              className="h-10 w-full sm:w-auto appearance-none rounded-lg border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800 pl-3 pr-8 text-[13px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#0176d3]/50 focus:border-[#0176d3] shadow-sm cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700/80"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
            >
              <option value="updated-desc" className="bg-background">🕒 Recently Updated</option>
              <option value="favourites-first" className="bg-background">⭐ Favourites First</option>
              <option value="usage-desc" className="bg-background">🔥 Most Executed</option>
              <option value="label-asc" className="bg-background">🔤 Label (A-Z)</option>
              <option value="category-asc" className="bg-background">🗂️ Category (A-Z)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-900 p-1 shrink-0 h-10 shadow-inner">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex h-8 w-16 justify-center items-center gap-1.5 rounded-md text-[13px] font-black transition-all",
                viewMode === "grid" ? "bg-white dark:bg-slate-700 text-[#0176d3] dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
              title="Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "flex h-8 w-16 justify-center items-center gap-1.5 rounded-md text-[13px] font-black transition-all",
                viewMode === "table" ? "bg-white dark:bg-slate-700 text-[#0176d3] dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>



      {/* ─── 4. CONTENT DISPLAY: PREMIUM GLASSMORPHISM CARDS & TABLES ─────────── */}
      {loading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-12 text-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <RefreshCw className="h-10 w-10 animate-spin text-blue-500 mb-4" />
            <p className="text-base font-bold text-foreground">Loading Salesforce SOQL Library...</p>
            <p className="text-sm text-slate-500 mt-1">Syncing stored query templates from PostgreSQL database</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl p-12 text-center shadow-inner relative overflow-hidden">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-500 shadow-inner">
            <FolderOpen className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-black text-foreground">No SOQL queries found</h3>
          <p className="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
            {search || categoryFilter !== "all"
              ? "No queries match your current filter criteria. Try clearing your search or switching object categories."
              : "Your query repository is currently empty. Create your first SOQL template or load our curated Salesforce CRM samples to get started immediately."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={openCreateForm} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/20 h-12 px-8 rounded-xl transition-all hover:-translate-y-0.5">
              <Plus className="h-5 w-5 stroke-[2.5]" />
              Create First Query
            </Button>
            {!search && categoryFilter === "all" && (
              <Button variant="outline" onClick={handleLoadSamples} className="gap-2 font-bold h-12 px-8 rounded-xl border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 shadow-sm transition-all hover:-translate-y-0.5">
                <Sparkles className="h-5 w-5" />
                Load 18 SFDC Templates
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* ─── Grid View (Premium Glass Cards) ──────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filtered.map((query, index) => (
            <motion.div
              key={query.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex flex-col justify-between h-full rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-5 md:p-6 shadow-lg hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 group relative overflow-hidden ring-1 ring-black/5 dark:ring-white/5"
            >
              <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-blue-500/10 transition-all duration-500" />
              
              <div className="relative z-10">
                {/* Top Row: Category Badge & Star */}
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">
                      {query.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-bold text-slate-500 bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg">
                      {query.usageCount} run{query.usageCount === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <button
                    onClick={() => toggleFavourite(query)}
                    className="text-slate-400 hover:scale-110 transition-transform p-1.5 -mr-1.5 focus:outline-none"
                    title={query.favourite ? "Remove from favourites" : "Add to favourites"}
                  >
                    <Star className={cn("h-5 w-5 transition-colors", query.favourite ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "hover:text-slate-600 dark:hover:text-slate-300")} />
                  </button>
                </div>

                {/* Title & Description */}
                <div className="py-4 md:py-5">
                  <h3 className="text-lg font-black text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 drop-shadow-sm">
                    {query.label}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed min-h-[40px]">
                    {query.description || "No description provided for this SOQL template."}
                  </p>
                  
                  {/* Tags */}
                  {query.tags && query.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {query.tags.map((tag) => (
                        <Badge key={tag} className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md", getTagColor(tag))}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* SOQL Code Snippet */}
                <div className="relative group/code my-2">
                  <pre className="max-h-48 min-h-[100px] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-slate-100/80 dark:bg-slate-950/80 text-slate-800 dark:text-slate-200 p-4 md:p-5 font-mono text-xs leading-relaxed border border-slate-200 dark:border-slate-800 shadow-inner ring-1 ring-inset ring-black/5 dark:ring-white/5 relative z-0">
                    <code className="relative z-10">{query.soql}</code>
                  </pre>
                  <button
                    onClick={() => handleCopy(query)}
                    className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold opacity-0 group-hover/code:opacity-100 transition-all shadow-md z-20 focus:opacity-100"
                  >
                    {copiedId === query.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="relative z-10 flex items-center justify-between pt-5 mt-5 border-t border-slate-200/50 dark:border-slate-700/50">
                <span className="text-xs text-slate-500 font-semibold">
                  Updated {formatDate(query.updatedAt)}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(query)}
                    className="h-9 px-3.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 gap-1.5 rounded-xl transition-colors"
                    title="Copy & Execute"
                  >
                    <Copy className="h-4 w-4" /> Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditForm(query)}
                    className="h-9 w-9 rounded-xl text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Query"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openHistory(query)}
                    className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
                    title="Version History"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicate(query)}
                    className="h-9 w-9 rounded-xl text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Duplicate Query"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(query.id)}
                    className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                    title="Delete Query"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* ─── Table View (Premium Glass Table) ───── */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="border-0 shadow-xl ring-1 ring-black/5 dark:ring-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden rounded-3xl relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
            <div className="overflow-x-auto relative z-10 p-2">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b-2 border-slate-200/50 dark:border-slate-700/50 text-xs font-black uppercase tracking-widest text-slate-500">
                    <th className="py-5 px-6 w-1/4">Template Label</th>
                    <th className="py-5 px-5 w-1/6">Category</th>
                    <th className="py-5 px-6 w-1/3">SOQL Snippet</th>
                    <th className="py-5 px-5 text-center w-28">Executions</th>
                    <th className="py-5 px-5 w-32">Updated</th>
                    <th className="py-5 px-6 text-right w-40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                  {filtered.map((query) => (
                    <tr key={query.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      {/* Label Cell with py-4 px-6 padding */}
                      <td className="py-5 px-6 font-bold text-foreground align-middle">
                        <div className="flex items-center gap-4">
                          <button onClick={() => toggleFavourite(query)} className="shrink-0 p-1.5 -ml-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <Star className={cn("h-4 w-4 transition-colors", query.favourite ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")} />
                          </button>
                          <div className="min-w-0">
                            <span className="block font-black text-base text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{query.label}</span>
                            {query.description && (
                              <p className="text-xs font-medium text-slate-500 line-clamp-1 mt-1 max-w-xs">{query.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Cell */}
                      <td className="py-5 px-5 align-middle">
                        <div className="flex flex-col items-start gap-1.5">
                          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">
                            {query.category}
                          </Badge>
                          {query.tags && query.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {query.tags.map((tag) => (
                                <Badge key={tag} className={cn("text-[8px] font-bold px-1.5 py-0 rounded", getTagColor(tag))}>
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* SOQL Snippet Cell */}
                      <td className="py-5 px-6 align-middle">
                        <div className="max-w-sm md:max-w-md overflow-hidden text-ellipsis whitespace-nowrap rounded-xl bg-slate-100/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 px-4 py-2.5 font-mono text-xs border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                          {query.soql}
                        </div>
                      </td>

                      {/* Executions Cell */}
                      <td className="py-5 px-5 text-center font-bold text-foreground align-middle">
                        <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-bold shadow-sm">
                          {query.usageCount}
                        </span>
                      </td>

                      {/* Updated Date Cell */}
                      <td className="py-5 px-5 text-xs text-slate-500 font-bold align-middle whitespace-nowrap">
                        {formatDate(query.updatedAt)}
                      </td>

                      {/* Actions Cell */}
                      <td className="py-5 px-6 text-right align-middle whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => handleCopy(query)} className="h-9 px-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 gap-1.5 rounded-xl transition-colors">
                            <Copy className="h-4 w-4" /> Copy
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditForm(query)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDuplicate(query)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Sparkles className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(query.id)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
      {/* ─── VERSION HISTORY MODAL ───────────────────────── */}
      <AnimatePresence>
        {historyModalOpen && historyQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/90 shadow-2xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 backdrop-blur-xl flex flex-col"
            >
              <CardHeader className="bg-gradient-to-r from-slate-100/50 to-transparent dark:from-slate-800/50 px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-row items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/20">
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight text-foreground">
                      Version History: {historyQuery.label}
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      View past edits and safely restore previous versions.
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setHistoryModalOpen(false)} className="h-10 w-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/50">
                {loadingHistory ? (
                  <div className="flex items-center justify-center h-40">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : historyRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                    <History className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-bold">No previous versions found.</p>
                    <p className="text-sm">Edits will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {historyRecords.map((record, index) => (
                      <div key={record.id} className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700 last:before:hidden">
                        <div className="absolute left-0 top-1 h-[24px] w-[24px] rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                          <div className="h-2 w-2 rounded-full bg-indigo-500" />
                        </div>
                        <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/10 bg-white dark:bg-slate-800 overflow-hidden rounded-2xl">
                          <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {index === 0 ? "Latest Backup" : `Version ${historyRecords.length - index}`}
                              </p>
                              <p className="text-xs text-slate-500">
                                Saved on {new Date(record.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleRestore(record.id)}
                              className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 text-xs font-bold"
                            >
                              <History className="h-3.5 w-3.5 mr-1.5" /> Restore This Version
                            </Button>
                          </div>
                          <div className="p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-0">{record.category}</Badge>
                              <span className="font-bold text-sm text-foreground">{record.label}</span>
                            </div>
                            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-900 text-slate-200 p-4 font-mono text-xs leading-relaxed shadow-inner">
                              <code>{record.soql}</code>
                            </pre>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
