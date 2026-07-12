"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Trash2, Copy, Download, Upload, Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  soql: string;
  favourite: boolean;
  createdAt: string;
  updatedAt: string;
}

const initialTemplates: Template[] = [
  {
    id: "1",
    name: "TS Template",
    description: "Standard ticket status query for WorkOrder",
    category: "WorkOrder",
    soql: `SELECT Id, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)`,
    favourite: true,
    createdAt: "2026-07-01",
    updatedAt: "2026-07-10",
  },
  {
    id: "2",
    name: "Escalation Query",
    description: "Query cases pending escalation",
    category: "Case",
    soql: `SELECT Id, CaseNumber, OwnerId, Status\nFROM Case\nWHERE CaseNumber IN (\n{{tickets}}\n)`,
    favourite: false,
    createdAt: "2026-07-05",
    updatedAt: "2026-07-05",
  },
  {
    id: "3",
    name: "Asset Transfer",
    description: "Check asset transfer status",
    category: "Asset",
    soql: `SELECT Id, Name, Status\nFROM Asset\nWHERE SerialNumber IN (\n{{tickets}}\n)`,
    favourite: false,
    createdAt: "2026-07-08",
    updatedAt: "2026-07-08",
  },
];

const STORAGE_KEY = "meghdoot-templates";

function loadTemplatesFromStorage(): Template[] {
  if (typeof window === "undefined") return initialTemplates;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialTemplates;

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) return parsed as Template[];
  } catch {
    // Fall back to the seeded defaults if storage is corrupted
  }

  return initialTemplates;
}

export default function TemplateManagerPage() {
  const [templates, setTemplates] = React.useState<Template[]>(() => loadTemplatesFromStorage());
  const [search, setSearch] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Template | null>(null);
  const [form, setForm] = React.useState<Partial<Template>>({ category: "WorkOrder" });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch {
      // Ignore storage failures in private/incognito modes
    }
  }, [templates]);

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name || !form.soql) {
      toast.error("Name and SOQL are required");
      return;
    }
    const now = new Date().toISOString().split("T")[0] ?? "";
    if (editing) {
      setTemplates((prev) => prev.map((t) => t.id === editing.id ? { ...t, ...form, updatedAt: now } as Template : t));
      toast.success("Template updated");
    } else {
      const newTemplate: Template = {
        id: Math.random().toString(36).slice(2),
        name: form.name ?? "Untitled Template",
        description: form.description ?? "",
        category: form.category ?? "General",
        soql: form.soql ?? "",
        favourite: false,
        createdAt: now,
        updatedAt: now,
      };
      setTemplates((prev) => [newTemplate, ...prev]);
      toast.success("Template created");
    }
    setShowForm(false);
    setEditing(null);
    setForm({ category: "WorkOrder" });
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  const handleDuplicate = (t: Template) => {
    const now = new Date().toISOString().split("T")[0] ?? "";
    const dup: Template = {
      ...t,
      id: Math.random().toString(36).slice(2),
      name: `${t.name} (Copy)`,
      favourite: false,
      createdAt: now,
      updatedAt: now,
    };
    setTemplates((prev) => [dup, ...prev]);
    toast.success("Template duplicated");
  };

  const toggleFav = (id: string) => {
    setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, favourite: !t.favourite } : t));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "templates.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Templates exported");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (Array.isArray(data)) {
          setTemplates((prev) => [...data, ...prev]);
          toast.success(`Imported ${data.length} templates`);
        }
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Template Manager</h1>
        <p className="text-sm text-muted-foreground">Create, edit, and organize your SOQL templates</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button className="gap-1" onClick={() => { setShowForm(true); setEditing(null); setForm({ category: "WorkOrder" }); }}>
          <Plus className="h-4 w-4" /> New
        </Button>
        <Button variant="outline" className="gap-1" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <label className="cursor-pointer">
          <div className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-hover">
            <Upload className="h-4 w-4" /> Import
          </div>
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{editing ? "Edit Template" : "New Template"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Template Name" value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                <Input placeholder="Category" value={form.category ?? ""} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
              </div>
              <Input placeholder="Description" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              <Textarea
                placeholder={`SOQL query with {{tickets}} variable...\n\nExample:\nSELECT Id, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)`}
                className="min-h-[160px] font-mono text-sm"
                value={form.soql ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, soql: e.target.value }))}
              />
              <div className="flex items-center gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleSave}>{editing ? "Update" : "Save"} Template</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="space-y-3">
        {filtered.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="hover:shadow-card-hover transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
                      <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                      {t.favourite && <Star className="h-3 w-3 fill-warning text-warning" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    <pre className="mt-2 rounded-md bg-muted p-2 text-xs font-mono text-foreground overflow-x-auto">{t.soql}</pre>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Created {t.createdAt}</span>
                      <span>Updated {t.updatedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFav(t.id)}>
                      <Star className={`h-4 w-4 ${t.favourite ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(t); setForm(t); setShowForm(true); }}>
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(t)}>
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-danger" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center p-8 text-sm text-muted-foreground">No templates found</div>
        )}
      </div>
    </div>
  );
}
