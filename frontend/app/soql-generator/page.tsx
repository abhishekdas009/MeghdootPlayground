"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { dashboardStore } from "@/lib/dashboard-store";
import { trackDashboardEvent } from "@/lib/dashboard-tracker";
import {
  Copy,
  Trash2,
  Star,
  ChevronDown,
  Mail,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  Filter,
  FileSpreadsheet,
  PlayCircle,
  Users,
  UserPlus,
  UserMinus,
  Pencil,
  RotateCcw,
  Save,
  Power,
  Upload,
  Terminal,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  soql: string;
  favourite: boolean;
  type?: "normal" | "asset-transfer";
  source?: "default" | "library";
  usageCount?: number;
}

interface AssetTransferPair {
  componentId: string;
  newCid: string;
}

interface CancellationExecutionRow {
  id: string;
  ticket: string;
  status: string;
}

interface CaseAssignmentRow {
  rawType: string;
  id: string;
  status: string;
  ownerId: string;
}

interface CaseOwner {
  id: string;
  name: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface QuantityOwnerConfig {
  id: string;
  name: string;
  ownerId: string;
  selected: boolean;
  quantity: string;
}

type CancellationViewMode = "query" | "update-output" | "requested-query";
type CaseAssignMode = "equal" | "owner-wise" | "quantity-wise";

const defaultTemplates: Template[] = [
  {
    id: "1",
    name: "TS (Ticket Status)",
    category: "WorkOrder",
    soql: `SELECT Id, Status, ParentWorkOrderId\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)`,
    favourite: true,
  },
  {
    id: "3",
    name: "Asset Transfer",
    category: "Asset",
    soql: "",
    favourite: false,
    type: "asset-transfer",
  },
  {
    id: "13",
    name: "CANCELLATION TICKETS",
    category: "WorkOrder",
    soql: `SELECT Id, Ticket_Number_Read_Only__c, Status\nFROM WorkOrder\nWHERE Status != 'Completed' AND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)`,
    favourite: false,
  },
  {
    id: "19",
    name: "Cancellation Requested",
    category: "WorkOrder",
    soql: `SELECT Id, Ticket_Number_Read_Only__c, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)\nAND Status = 'Cancellation Requested'`,
    favourite: false,
  },
  {
    id: "14",
    name: "Case Cancellation",
    category: "WorkOrder",
    soql: `SELECT Id, Status, CaseId, Case.Status, Case.Cancellation_Reason__c, Cancellation_Reason__c\nFROM WorkOrder\nWHERE Status != 'Completed' AND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)`,
    favourite: false,
  },
  {
    id: "2",
    name: "SA (Service Appointment)",
    category: "ServiceAppointment",
    soql: `SELECT Id, Status\nFROM ServiceAppointment\nWHERE Ticket_Numbers__c IN (\n{{tickets}}\n)`,
    favourite: false,
  },
  {
    id: "4",
    name: "Case Assign",
    category: "Case",
    soql: `SELECT Id,Status,OwnerId\nFROM Case\nWHERE Id IN (\n{{tickets}}\n)`,
    favourite: false,
  },
  {
    id: "5",
    name: "TC (Technician Check)",
    category: "ServiceAppointment",
    soql: `SELECT Id,\n       Work_Order__c,\n       FSSK__FSK_Assigned_Service_Resource__c,\n       FSSK__FSK_Assigned_Service_Resource__r.Name\nFROM ServiceAppointment\nWHERE Ticket_Numbers__c IN (\n{{tickets}}\n)`,
    favourite: false,
  },
  {
    id: "6",
    name: "TSC (Ticket Status Count)",
    category: "WorkOrder",
    soql: `SELECT Status,\n       COUNT(Id)\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)\nGROUP BY Status\nORDER BY COUNT(Id) DESC`,
    favourite: false,
  },
  {
    id: "7",
    name: "PO (Payout / Product Information)",
    category: "WorkOrder",
    soql: `SELECT Id,\n       ParentWorkOrderId,\n       Status,\n       Payout__c,\n       Asset.Product_Sub_Family__r.Code__c\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)`,
    favourite: false,
  },
  {
    id: "8",
    name: "TS (Open Tickets Only)",
    category: "WorkOrder",
    soql: `SELECT Id, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)\nAND Status NOT IN ('Completed','Canceled','Bundled')`,
    favourite: false,
  },
  {
    id: "9",
    name: "Account ID Fetch",
    category: "Account",
    soql: `SELECT Customer_ID__c, Id\nFROM Account\nWHERE Customer_ID__c IN (\n{{tickets}}\n)`,
    favourite: false,
  },
  {
    id: "10",
    name: "Technician Assessment Link",
    category: "Contact",
    soql: `SELECT Name, Assessment_Link__c\nFROM Contact\nWHERE Technician_Number__c IN (\n{{tickets}}\n)`,
    favourite: false,
  },
  {
    id: "11",
    name: "Asset by Department",
    category: "Asset",
    soql: `SELECT Id, Component_Id__c, Account.Name, RecordType.Name, Account.Id, Account.Group__c, Account.Customer_ID__c, Account.SAP_Customer_Id__c\nFROM Asset\nWHERE Service_Department_L__c = 'a3cNy0000001IStIAM' AND Account_Group__c = 'NON NAMO'`,
    favourite: false,
  },
  {
    id: "12",
    name: "Asset ID Fetch",
    category: "Asset",
    soql: `SELECT Component_Id__c, Id, Account.Customer_ID__c, Record_Type__c, Parent.Id, Parent.Account.Id\nFROM Asset\nWHERE Component_Id__c IN (\n{{tickets}}\n)`,
    favourite: false,
  },
  {
    id: "15",
    name: "Child Details to Parent",
    category: "Asset",
    soql: `SELECT Parent.Id, Model_Number__c, Product_Family__c, Product_Sub_Family__c, Product2Id\nFROM Asset\nWHERE Parent.Component_Id__c IN (\n{{tickets}}\n)`,
    favourite: false,
  },
  {
    id: "16",
    name: "Deactivate Comment",
    category: "User",
    soql: `SELECT Deactivation_Comment__c\nFROM User\nWHERE CommunityNickname IN (\n{{tickets}}\n)`,
    favourite: false,
  },
  {
    id: "17",
    name: "Due Date Fix",
    category: "ServiceAppointment",
    soql: `SELECT Id, Status, IsBundleMember, IsManuallyBundled, RelatedBundleId, Work_Order__r.Status, DueDate, SchedEndTime, SchedStartTime\nFROM ServiceAppointment\nWHERE Ticket_Numbers__c IN (\n{{tickets}}\n) AND Work_Order__r.Status != 'Completed'`,
    favourite: false,
  },
  {
    id: "18",
    name: "Service Appointment",
    category: "ServiceAppointment",
    soql: `SELECT Id, Status\nFROM ServiceAppointment\nWHERE Ticket_Numbers__c IN (\n{{tickets}}\n)`,
    favourite: false,
  },
];

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  B: { label: "Breakdown", color: "bg-red-500" },
  I: { label: "Installation", color: "bg-blue-500" },
  S: { label: "Regular Service", color: "bg-green-500" },
  X: { label: "Stock Defective", color: "bg-orange-500" },
  C: { label: "Commissioning", color: "bg-purple-500" },
  A: { label: "AutoPMS", color: "bg-teal-500" },
  D: { label: "Demo", color: "bg-pink-500" },
};

const EMAIL_TEMPLATE = `Hello,\nYour service ticket status has been updated to Accepted. Kindly check and revert.\n`;

const POST_TEMPLATE = `@tag_user Your service ticket status has been updated to Accepted. Kindly check and revert.`;

const TICKET_REGEX = /[BISXCAD]\d{14,}/g;
const SOQL_BATCH_SIZE = 400;
const UPDATE_BATCH_SIZE = 200;

interface TicketStats {
  total: number;
  breakdown: Record<string, number>;
  unknown: number;
}

function createOwnerId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `owner-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getDefaultCaseOwners(): CaseOwner[] {
  const now = new Date().toISOString();
  return [
    { id: createOwnerId(), name: "Salesforce Team", ownerId: "005Ny00000QgwYTIAZ", isActive: true, createdAt: now, updatedAt: now },
    { id: createOwnerId(), name: "Pankaj Singh", ownerId: "005Ny00000R1Nr3IAF", isActive: true, createdAt: now, updatedAt: now },
    { id: createOwnerId(), name: "Ranjith", ownerId: "005Ny00000Ab3R1IAJ", isActive: true, createdAt: now, updatedAt: now },
    { id: createOwnerId(), name: "Rutuja", ownerId: "005Ny00000Ab3QzIAJ", isActive: true, createdAt: now, updatedAt: now },
    { id: createOwnerId(), name: "Sanket", ownerId: "005Ny00000Ab3R0IAJ", isActive: true, createdAt: now, updatedAt: now },
    { id: createOwnerId(), name: "Shalini Awasthi", ownerId: "005Ny00000Ab3R2IAJ", isActive: true, createdAt: now, updatedAt: now },
    { id: createOwnerId(), name: "Sidhant Giri", ownerId: "005Ny00000Ab3R5IAJ", isActive: true, createdAt: now, updatedAt: now },
    { id: createOwnerId(), name: "Sreejith", ownerId: "005Ny00000Ab3R4IAJ", isActive: true, createdAt: now, updatedAt: now },
    { id: createOwnerId(), name: "Sunil Badampudi", ownerId: "005Ny00000Ab3R3IAJ", isActive: true, createdAt: now, updatedAt: now },
    { id: createOwnerId(), name: "JP Mohapatra", ownerId: "005Ny00000SHAKcIAP", isActive: true, createdAt: now, updatedAt: now },
  ];
}

function isValidOwnerRecord(value: unknown): value is CaseOwner {
  if (!value || typeof value !== "object") return false;
  const record = value as CaseOwner;

  return Boolean(
    typeof record.id === "string" &&
      typeof record.name === "string" &&
      typeof record.ownerId === "string" &&
      typeof record.isActive === "boolean" &&
      typeof record.createdAt === "string" &&
      typeof record.updatedAt === "string"
  );
}

function buildQuantityConfig(owners: CaseOwner[]): QuantityOwnerConfig[] {
  return owners
    .filter((owner) => owner.isActive)
    .map((owner) => ({
      id: owner.id,
      name: owner.name,
      ownerId: owner.ownerId,
      selected: true,
      quantity: "",
    }));
}

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string" && body.error.trim()) return body.error;
  } catch {
    // Ignore JSON parsing errors and use a generic message below.
  }

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

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<T>;
}

function getTicketStats(tickets: string[]): TicketStats {
  const stats: TicketStats = { total: tickets.length, breakdown: {}, unknown: 0 };

  for (const ticket of tickets) {
    const firstChar = ticket.charAt(0).toUpperCase();
    if (CATEGORY_MAP[firstChar]) {
      stats.breakdown[firstChar] = (stats.breakdown[firstChar] || 0) + 1;
    } else {
      stats.unknown += 1;
    }
  }

  return stats;
}

function parseFailedTickets(input: string): string[] {
  if (!input.trim()) return [];
  const lines = input.split(/[\r\n]+/).filter((line) => line.trim());
  const failed: string[] = [];
  const hasFailedLines = lines.some((line) => line.toLowerCase().includes("failed"));

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.includes("Ticket_Number_Read_Only__c") ||
      trimmed.includes("__Status") ||
      trimmed.includes("_Id") ||
      trimmed.includes("_Errors")
    ) {
      continue;
    }

    if (hasFailedLines) {
      if (trimmed.toLowerCase().includes("failed") && !trimmed.toLowerCase().includes("succeeded")) {
        const matches = trimmed.match(TICKET_REGEX);
        if (matches) failed.push(matches[0]);
      }
    } else {
      const matches = trimmed.match(TICKET_REGEX);
      if (matches) failed.push(matches[0]);
    }
  }

  return [...new Set(failed)];
}

function parseAssetTransferPairs(input: string): AssetTransferPair[] {
  if (!input.trim()) return [];
  const lines = input.split(/[\r\n]+/).filter((line) => line.trim());
  const pairs: AssetTransferPair[] = [];
  const cidRegex = /CID-?\d+/i;

  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    if (lower.includes("component") && (lower.includes("new cid") || lower.includes("cid"))) continue;

    const parts = trimmed.split(/[\s,\t]+/).filter(Boolean);

    if (parts.length >= 2) {
      const componentId = parts[0]?.trim() ?? "";
      const newCid = parts[1]?.trim() ?? "";
      if (componentId && newCid && /^CID/i.test(newCid)) {
        pairs.push({ componentId, newCid });
      }
    } else {
      const cidMatch = trimmed.match(cidRegex);
      if (cidMatch && cidMatch.index !== undefined) {
        const componentId = trimmed.slice(0, cidMatch.index).trim();
        const newCid = cidMatch[0];
        if (componentId) {
          pairs.push({ componentId, newCid });
        }
      }
    }
  }

  return pairs;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        i += 1;
      }
    } else if ((char === "," || char === "\t") && !inQuotes) {
      values.push(current);
      current = "";
      i += 1;
    } else {
      current += char;
      i += 1;
    }
  }

  values.push(current);
  return values;
}

function cleanHeader(value: string): string {
  return value.replace(/["\[\]]/g, "").trim().toLowerCase().replace(/[^a-z0-9_.]/g, "");
}

function cleanValue(value: string): string {
  return value.replace(/["\[\]]/g, "").trim();
}

function parseSOQLResult(input: string): Array<Record<string, string>> {
  if (!input.trim()) return [];

  const lines = input.split(/[\r\n]+/).filter((line) => line.trim());
  const rows: Array<Record<string, string>> = [];
  let headers: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const values = parseCSVLine(trimmed);
    if (values.length === 0) continue;

    const firstVal = cleanValue(values[0] ?? "");

    if (
      firstVal === "_" ||
      firstVal === "" ||
      firstVal.toLowerCase() === "component" ||
      firstVal.toLowerCase() === "id"
    ) {
      headers = values.map(cleanHeader);
      continue;
    }

    if (headers.length === 0) continue;

    const row: Record<string, string> = {};
    for (let index = 0; index < values.length; index += 1) {
      const rawValue = values[index];
      const header = headers[index];
      if (!rawValue || !header) continue;
      row[header] = cleanValue(rawValue);
    }

    rows.push(row);
  }

  return rows;
}

function parseAssetResult(input: string): Record<string, Record<string, string>> {
  const rows = parseSOQLResult(input);
  const result: Record<string, Record<string, string>> = {};

  for (const row of rows) {
    const componentId = row.component_id__c || row.componentid__c || row.component_id;
    if (componentId) result[componentId] = row;
  }

  return result;
}

function parseAccountResult(input: string): Record<string, string> {
  const rows = parseSOQLResult(input);
  const result: Record<string, string> = {};

  for (const row of rows) {
    const cid = row.customer_id__c || row.customerid__c || row.customer_id;
    const id = row.id;
    if (cid && id) result[cid] = id;
  }

  return result;
}

function parseCancellationExecutionRows(input: string): CancellationExecutionRow[] {
  const rows = parseSOQLResult(input);

  return rows
    .map((row) => {
      const id = row.id || "";
      const ticket = row.ticket_number_read_only__c || row.ticketnumberreadonly__c || "";
      const status = row.status || "";
      return { id, ticket, status };
    })
    .filter((row) => row.id && row.ticket && row.status);
}

function parseCaseAssignmentRows(input: string): CaseAssignmentRow[] {
  const rows = parseSOQLResult(input);

  return rows
    .map((row) => ({
      rawType: "[Case]",
      id: row.id || "",
      status: row.status || "",
      ownerId: row.ownerid || row.owner_id || "",
    }))
    .filter((row) => row.id && row.status);
}

function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function downloadTextFile(filename: string, content: string, type = "text/plain;charset=utf-8;") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildCaseAssignmentOutput(assignments: Array<{ row: CaseAssignmentRow; owner: Pick<CaseOwner, "ownerId"> }>) {
  const outputLines: string[] = ['"_","Id","Status","OwnerId"'];

  assignments.forEach(({ row, owner }) => {
    outputLines.push(`"[Case]","${row.id}","${row.status}","${owner.ownerId}"`);
  });

  return outputLines.join("\n");
}

function buildEqualAssignments(rows: CaseAssignmentRow[], owners: CaseOwner[]) {
  if (!rows.length || !owners.length) return "";

  const baseCount = Math.floor(rows.length / owners.length);
  const extraCount = rows.length % owners.length;
  const assignments: Array<{ row: CaseAssignmentRow; owner: Pick<CaseOwner, "ownerId"> }> = [];
  let rowIndex = 0;

  owners.forEach((owner, index) => {
    const count = baseCount + (index < extraCount ? 1 : 0);
    for (let i = 0; i < count; i += 1) {
      const row = rows[rowIndex];
      if (!row) break;
      assignments.push({ row, owner });
      rowIndex += 1;
    }
  });

  return buildCaseAssignmentOutput(assignments);
}

function buildOwnerWiseAssignments(rows: CaseAssignmentRow[], owners: CaseOwner[]) {
  if (!rows.length || !owners.length) return "";

  const assignments: Array<{ row: CaseAssignmentRow; owner: Pick<CaseOwner, "ownerId"> }> = [];

  rows.forEach((row, index) => {
    const owner = owners[index % owners.length];
    if (!owner) return;
    assignments.push({ row, owner });
  });

  return buildCaseAssignmentOutput(assignments);
}

function buildQuantityWiseAssignments(rows: CaseAssignmentRow[], ownerConfigs: QuantityOwnerConfig[]) {
  if (!rows.length) return { output: "", error: "No rows found" };

  const selectedOwners = ownerConfigs
    .filter((owner) => owner.selected)
    .map((owner) => ({
      ownerId: owner.ownerId,
      quantity: Number(owner.quantity || 0),
    }));

  if (!selectedOwners.length) {
    return { output: "", error: "Select at least one owner" };
  }

  const totalQuantity = selectedOwners.reduce((sum, owner) => sum + owner.quantity, 0);
  if (totalQuantity !== rows.length) {
    return { output: "", error: `Selected owner quantity total must equal parsed rows count (${rows.length})` };
  }

  const assignments: Array<{ row: CaseAssignmentRow; owner: { ownerId: string } }> = [];
  let rowIndex = 0;

  selectedOwners.forEach((owner) => {
    for (let i = 0; i < owner.quantity; i += 1) {
      const row = rows[rowIndex];
      if (!row) break;
      assignments.push({ row, owner: { ownerId: owner.ownerId } });
      rowIndex += 1;
    }
  });

  return { output: buildCaseAssignmentOutput(assignments), error: "" };
}

function StatPill({ code, count }: { code: string; count: number }) {
  const info = CATEGORY_MAP[code];
  if (!info) return null;

  return (
    <div className="group flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-3.5 py-2 shadow-sm transition-all hover:border-blue-500/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm ${info.color}`} />
      <span className="text-xs font-bold text-slate-500 group-hover:text-foreground transition-colors">
        {info.label}: <strong className="text-foreground font-black tabular-nums ml-1">{count}</strong>
      </span>
    </div>
  );
}

function QueryPreviewCard({
  title,
  subtitle,
  batches,
  batchIndex,
  setBatchIndex,
  onCopy,
}: {
  title: string;
  subtitle: string;
  batches: string[];
  batchIndex: number;
  setBatchIndex: React.Dispatch<React.SetStateAction<number>>;
  onCopy: (value: string) => void;
}) {
  const currentBatch = batches[batchIndex] ?? "";

  return (
    <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl flex flex-col transition-all duration-300 hover:shadow-xl group relative h-full">
      <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-indigo-500/10 transition-colors" />
      <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              <CardTitle className="text-base font-black tracking-tight text-foreground">{title}</CardTitle>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
              {batches.length} batch{batches.length === 1 ? "" : "es"}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-2 text-xs font-bold hover:bg-indigo-500/10 hover:text-indigo-600 hover:border-indigo-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" 
              onClick={() => onCopy(batches.join("\n\n"))}
            >
              <Copy className="h-3.5 w-3.5" /> Copy All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
        {batches.length > 0 ? (
          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 text-foreground flex flex-col min-h-0 flex-1 shadow-inner overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.4)]" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                </div>
                <span className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">
                  SOQL QUERY · BATCH {batchIndex + 1} OF {batches.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  disabled={batchIndex <= 0}
                  onClick={() => setBatchIndex((value) => Math.max(0, value - 1))}
                  title="Previous Batch"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  disabled={batchIndex >= batches.length - 1}
                  onClick={() => setBatchIndex((value) => Math.min(batches.length - 1, value + 1))}
                  title="Next Batch"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </Button>
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1.5" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 gap-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 px-3 text-xs font-bold rounded-lg transition-colors" 
                  onClick={() => onCopy(currentBatch)}
                >
                  <Copy className="h-3.5 w-3.5 text-indigo-400" /> Copy
                </Button>
              </div>
            </div>
            <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-sky-200 min-h-0 max-h-[320px] selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-100">
              {currentBatch}
            </pre>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-8 text-center shadow-inner">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-400 mb-3 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
              <PlayCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-black text-foreground">No Query Generated Yet</p>
            <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-xs">Paste your tickets or Case IDs on the left and select a template to generate a preview</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CancellationModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center min-h-[40px] w-full rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 border shadow-2xs",
        active
          ? "bg-accent text-white border-accent shadow-sm ring-2 ring-accent/20"
          : "bg-card text-muted-foreground border-border/80 hover:bg-hover/80 hover:text-foreground hover:border-border"
      )}
    >
      <span className="block w-full text-center leading-tight">{children}</span>
    </button>
  );
}

export default function SOQLGeneratorPage() {
  const [templates, setTemplates] = React.useState<Template[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>("13");
  const [libraryLoadState, setLibraryLoadState] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [ticketsInput, setTicketsInput] = React.useState("");
  const [excelInput, setExcelInput] = React.useState("");
  const [favourites, setFavourites] = React.useState<Set<string>>(new Set(["1"]));
  const [tsBatchIndex, setTsBatchIndex] = React.useState(0);
  const [saBatchIndex, setSaBatchIndex] = React.useState(0);
  const [otherBatchIndex, setOtherBatchIndex] = React.useState(0);
  const [generatedAtLeastOnce, setGeneratedAtLeastOnce] = React.useState(false);

  const [assetTransferInput, setAssetTransferInput] = React.useState("");
  const [assetSOQLResult, setAssetSOQLResult] = React.useState("");
  const [accountSOQLResult, setAccountSOQLResult] = React.useState("");
  const [transferOutput, setTransferOutput] = React.useState("");
  const [transferDebug, setTransferDebug] = React.useState("");

  const [cancellationExecutionInput, setCancellationExecutionInput] = React.useState("");
  const [cancellationExecutionBatchIndex, setCancellationExecutionBatchIndex] = React.useState(0);
  const [cancellationViewMode, setCancellationViewMode] = React.useState<CancellationViewMode>("query");

  const [caseAssignInput, setCaseAssignInput] = React.useState("");
  const [caseAssignOutput, setCaseAssignOutput] = React.useState("");
  const [caseAssignMode, setCaseAssignMode] = React.useState<CaseAssignMode>("equal");
  const [caseOwners, setCaseOwners] = React.useState<CaseOwner[]>([]);
  const [caseOwnerLoadState, setCaseOwnerLoadState] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [caseOwnerAction, setCaseOwnerAction] = React.useState<string | null>(null);
  const [selectedOwnerIds, setSelectedOwnerIds] = React.useState<string[]>([]);
  const [quantityOwnerConfigs, setQuantityOwnerConfigs] = React.useState<QuantityOwnerConfig[]>([]);
  const [ownerForm, setOwnerForm] = React.useState({ name: "", ownerId: "" });
  const [editingOwnerRecordId, setEditingOwnerRecordId] = React.useState<string | null>(null);

  const savedTicketsRef = React.useRef("");

  const activeTemplate = templates.find((template) => template.id === selectedTemplate);
  const defaultTemplateCount = React.useMemo(
    () => templates.filter((template) => template.source !== "library").length,
    [templates]
  );
  const libraryTemplateCount = React.useMemo(
    () => templates.filter((template) => template.source === "library").length,
    [templates]
  );
  const isTS = selectedTemplate === "1";
  const isSA = selectedTemplate === "2";
  const isAssetTransfer = selectedTemplate === "3" || (activeTemplate?.name?.toLowerCase()?.includes("transfer") ?? false) || (activeTemplate?.type === "asset-transfer");
  const isCaseAssign = selectedTemplate === "4";
  const isCancellation = selectedTemplate === "13" || selectedTemplate === "14" || selectedTemplate === "19" || (activeTemplate?.name?.toLowerCase()?.includes("cancellation") ?? false);

  const refreshCaseOwners = React.useCallback(async () => {
    setCaseOwnerLoadState("loading");

    try {
      const data = await requestJson<{ owners: unknown[] }>("/api/case-owners");
      const owners = Array.isArray(data.owners) ? data.owners.filter(isValidOwnerRecord) : [];
      setCaseOwners(owners);
      setCaseOwnerLoadState("ready");
    } catch (error) {
      setCaseOwnerLoadState("error");
      toast.error(error instanceof Error ? error.message : "Unable to load employee master");
    }
  }, []);

  React.useEffect(() => {
    refreshCaseOwners();
  }, [refreshCaseOwners]);

  const refreshSOQLLibrary = React.useCallback(async () => {
    setLibraryLoadState("loading");

    try {
      const data = await requestJson<{
        queries: Array<{
          id: string;
          label: string;
          category: string;
          soql: string;
          favourite: boolean;
          usageCount: number;
        }>;
      }>("/api/soql-library");

      // Deduplicate against defaultTemplates by checking template names
      const defaultNames = new Set(defaultTemplates.map(t => t.name.toLowerCase()));

      const libraryTemplates = data.queries
        .filter((query) => query.label && query.category && query.soql)
        .filter((query) => !defaultNames.has(query.label.toLowerCase()))
        .map((query) => ({
          id: `library:${query.id}`,
          name: query.label,
          category: query.category,
          soql: query.soql,
          favourite: query.favourite,
          source: "library" as const,
          usageCount: query.usageCount,
        }));

      setTemplates([...defaultTemplates, ...libraryTemplates]);
      setLibraryLoadState("ready");
    } catch (error) {
      setTemplates(defaultTemplates);
      setLibraryLoadState("error");
      toast.error(error instanceof Error ? error.message : "Unable to load SOQL library");
    }
  }, []);

  React.useEffect(() => {
    refreshSOQLLibrary();
  }, [refreshSOQLLibrary]);

  const activeCaseOwners = React.useMemo(
    () => caseOwners.filter((owner) => owner.isActive),
    [caseOwners]
  );

  React.useEffect(() => {
    setSelectedOwnerIds(activeCaseOwners.map((owner) => owner.ownerId));
    setQuantityOwnerConfigs((previous) => {
      const previousMap = new Map(previous.map((item) => [item.ownerId, item]));
      return activeCaseOwners.map((owner) => {
        const existing = previousMap.get(owner.ownerId);
        return {
          id: owner.id,
          name: owner.name,
          ownerId: owner.ownerId,
          selected: existing?.selected ?? true,
          quantity: existing?.quantity ?? "",
        };
      });
    });
  }, [activeCaseOwners]);

  const parseTickets = React.useCallback((input: string): string[] => {
    if (!input.trim()) return [];
    const cleaned = input.replace(/'/g, "").replace(/,/g, " ").replace(/[\t\r\n]+/g, " ");
    return cleaned
      .split(/\s+/)
      .map((ticket) => ticket.trim())
      .filter((ticket) => ticket.length > 0);
  }, []);

  const formatTicketsForSOQL = React.useCallback((tickets: string[]): string => {
    if (tickets.length === 0) return "";
    return tickets.map((ticket) => `    '${ticket}'`).join(",\n");
  }, []);

  const parsedTickets = React.useMemo(() => parseTickets(ticketsInput), [parseTickets, ticketsInput]);
  const batchCount = parsedTickets.length > 0 ? Math.ceil(parsedTickets.length / SOQL_BATCH_SIZE) : 0;
  const ticketStats = React.useMemo(() => getTicketStats(parsedTickets), [parsedTickets]);
  const failedTickets = React.useMemo(() => parseFailedTickets(excelInput), [excelInput]);
  const assetPairs = React.useMemo(() => parseAssetTransferPairs(assetTransferInput), [assetTransferInput]);
  const cancellationExecutionRows = React.useMemo(
    () => parseCancellationExecutionRows(cancellationExecutionInput),
    [cancellationExecutionInput]
  );

  const executableCancellationRows = React.useMemo(
    () => cancellationExecutionRows.filter((row) => row.status.trim().toLowerCase() === "cancellation requested"),
    [cancellationExecutionRows]
  );

  const skippedCancellationRows = React.useMemo(
    () => cancellationExecutionRows.filter((row) => row.status.trim().toLowerCase() !== "cancellation requested"),
    [cancellationExecutionRows]
  );

  const uniqueExecutableCancellationRows = React.useMemo(() => {
    const seen = new Set<string>();
    return executableCancellationRows.filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });
  }, [executableCancellationRows]);

  const cancellationUpdateBatches = React.useMemo(() => {
    const chunks = chunkArray(uniqueExecutableCancellationRows, UPDATE_BATCH_SIZE);

    return chunks.map((chunk) => {
      const rows = ['"_","Id","Status"'];
      for (const item of chunk) {
        rows.push(`"[WorkOrder]","${item.id}","Canceled"`);
      }
      return rows.join("\n");
    });
  }, [uniqueExecutableCancellationRows]);

  const cancellationUpdateDebug = React.useMemo(() => {
    if (!cancellationExecutionRows.length) return "";

    const lines: string[] = [];
    lines.push(`Total parsed rows: ${cancellationExecutionRows.length}`);
    lines.push(`Ready for cancel execution: ${uniqueExecutableCancellationRows.length}`);
    lines.push(`Skipped rows: ${skippedCancellationRows.length}`);

    if (skippedCancellationRows.length > 0) {
      lines.push("");
      lines.push("Skipped rows because status is not 'Cancellation Requested':");
      skippedCancellationRows.slice(0, 100).forEach((row) => {
        lines.push(`${row.ticket} | ${row.id} | ${row.status}`);
      });

      if (skippedCancellationRows.length > 100) {
        lines.push(`...and ${skippedCancellationRows.length - 100} more`);
      }
    }

    return lines.join("\n");
  }, [cancellationExecutionRows, uniqueExecutableCancellationRows, skippedCancellationRows]);

  const cancellationBody = React.useMemo(() => {
    const total = parsedTickets.length;
    if (total === 0) return "";

    let message = "Cancellation has been done successfully for this slot.";
    if (failedTickets.length > 0) {
      message += "\n\nExcept ST:\n" + failedTickets.join("\n");
    }
    message += `\n\nTotal Tickets Count : ${total}`;
    return message;
  }, [parsedTickets, failedTickets]);

  const cancellationEmail = React.useMemo(() => {
    if (!cancellationBody) return "";
    return `Hello,\n${cancellationBody}\n\n`;
  }, [cancellationBody]);

  const cancellationPost = React.useMemo(() => {
    if (!cancellationBody) return "";
    return `@_tag_user ${cancellationBody}`;
  }, [cancellationBody]);

  const caseAssignmentRows = React.useMemo(() => parseCaseAssignmentRows(caseAssignInput), [caseAssignInput]);

  const selectedOwnerObjects = React.useMemo(
    () => activeCaseOwners.filter((owner) => selectedOwnerIds.includes(owner.ownerId)),
    [activeCaseOwners, selectedOwnerIds]
  );

  const quantitySelectedTotal = React.useMemo(
    () =>
      quantityOwnerConfigs
        .filter((owner) => owner.selected)
        .reduce((sum, owner) => sum + Number(owner.quantity || 0), 0),
    [quantityOwnerConfigs]
  );

  const buildPreviewBatches = React.useCallback(
    (templateId: string) => {
      const template = templates.find((item) => item.id === templateId);
      if (!template) return [];

      if (parsedTickets.length === 0) {
        return [template.soql.replace("{{tickets}}", "")];
      }

      const batches: string[] = [];
      for (let index = 0; index < parsedTickets.length; index += SOQL_BATCH_SIZE) {
        const chunk = parsedTickets.slice(index, index + SOQL_BATCH_SIZE);
        const formatted = formatTicketsForSOQL(chunk);
        const query = template.soql.replace("{{tickets}}", formatted);
        batches.push(query);
      }

      return batches;
    },
    [formatTicketsForSOQL, parsedTickets, templates]
  );

  const workOrderPreview = React.useMemo(() => buildPreviewBatches("1"), [buildPreviewBatches]);
  const serviceAppointmentPreview = React.useMemo(() => buildPreviewBatches("2"), [buildPreviewBatches]);
  const otherPreview = React.useMemo(() => buildPreviewBatches(selectedTemplate), [buildPreviewBatches, selectedTemplate]);
  const cancellationRequestedPreview = React.useMemo(() => buildPreviewBatches("19"), [buildPreviewBatches]);

  const assetTransferComponentSOQL = React.useMemo(() => {
    if (assetPairs.length === 0) return "";
    const componentIds = assetPairs.map((pair) => pair.componentId);
    const formatted = formatTicketsForSOQL(componentIds);

    return `SELECT Component_Id__c, Id, Account.Customer_ID__c, Record_Type__c, Parent.Id, Parent.Account.Id\nFROM Asset\nWHERE Component_Id__c IN (\n${formatted}\n)`;
  }, [assetPairs, formatTicketsForSOQL]);

  const assetTransferAccountSOQL = React.useMemo(() => {
    if (assetPairs.length === 0) return "";
    const cids = [...new Set(assetPairs.map((pair) => pair.newCid))];
    const formatted = formatTicketsForSOQL(cids);

    return `SELECT Customer_ID__c, Id\nFROM Account\nWHERE Customer_ID__c IN (\n${formatted}\n)`;
  }, [assetPairs, formatTicketsForSOQL]);

  const handleProcessTransfer = () => {
    const assetData = parseAssetResult(assetSOQLResult);
    const accountData = parseAccountResult(accountSOQLResult);

    if (Object.keys(assetData).length === 0) {
      toast.error("Paste Asset SOQL result first");
      return;
    }

    if (Object.keys(accountData).length === 0) {
      toast.error("Paste Account SOQL result first");
      return;
    }

    const rows: string[] = ['"_","Id","AccountId"'];
    const debugLines: string[] = [];
    const missingAssets: string[] = [];
    const missingCids: string[] = [];

    for (const pair of assetPairs) {
      const assetRow = assetData[pair.componentId];
      if (!assetRow) {
        missingAssets.push(pair.componentId);
        debugLines.push(`❌ ${pair.componentId} → Asset not found in Component SOQL result`);
        continue;
      }

      const recordType = assetRow.record_type__c || assetRow.recordtype || "";
      const isComponent = recordType.toLowerCase().includes("component");

      let assetId: string | undefined;
      let sourceNote: string;

      if (isComponent) {
        assetId = assetRow["parent.id"] || assetRow.parentid || assetRow.parent_id || assetRow.id;
        sourceNote = "Parent.Id (Component record type)";
      } else {
        assetId = assetRow.id;
        sourceNote = "Asset.Id";
      }

      const accountId = accountData[pair.newCid];
      if (!accountId) {
        missingCids.push(pair.newCid);
        debugLines.push(`❌ ${pair.componentId} → CID ${pair.newCid} not found in Account SOQL result`);
        continue;
      }

      if (!assetId) {
        debugLines.push(`❌ ${pair.componentId} → No valid asset ID found`);
        continue;
      }

      rows.push(`"[Asset]","${assetId}","${accountId}"`);
      debugLines.push(`✅ ${pair.componentId} → ${assetId} (${sourceNote}) | CID ${pair.newCid} → ${accountId}`);
    }

    setTransferOutput(rows.join("\n"));
    setTransferDebug(debugLines.join("\n"));

    if (rows.length === 1) {
      toast.error(`No records generated. Missing: ${missingAssets.length} assets, ${missingCids.length} CIDs`);
    } else {
      toast.success(`Generated ${rows.length - 1} transfer records`);
    }
  };

  const handleDownloadTransfer = () => {
    if (!transferOutput.trim()) {
      toast.error("Generate transfer output first");
      return;
    }
    downloadTextFile(`asset-transfer-${Date.now()}.csv`, transferOutput, "text/csv;charset=utf-8;");
    toast.success("Transfer CSV downloaded");
  };

  const handleRunCaseAssignment = () => {
    if (!caseAssignInput.trim()) {
      toast.error("Paste Case SOQL result first");
      return;
    }

    if (caseAssignmentRows.length === 0) {
      toast.error("No valid Case rows found");
      return;
    }

    if (activeCaseOwners.length === 0) {
      toast.error("Add at least one active owner");
      return;
    }

    if (caseAssignMode === "equal") {
      const output = buildEqualAssignments(caseAssignmentRows, activeCaseOwners);
      setCaseAssignOutput(output);
      toast.success(`Assigned ${caseAssignmentRows.length} case(s) equally`);
      return;
    }

    if (caseAssignMode === "owner-wise") {
      if (!selectedOwnerObjects.length) {
        toast.error("Select at least one owner");
        return;
      }

      const output = buildOwnerWiseAssignments(caseAssignmentRows, selectedOwnerObjects);
      setCaseAssignOutput(output);
      toast.success(`Assigned ${caseAssignmentRows.length} case(s) owner wise`);
      return;
    }

    const result = buildQuantityWiseAssignments(caseAssignmentRows, quantityOwnerConfigs);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    setCaseAssignOutput(result.output);
    toast.success(`Assigned ${caseAssignmentRows.length} case(s) quantity wise`);
  };

  const handleDownloadCaseAssignment = () => {
    if (!caseAssignOutput.trim()) {
      toast.error("Generate case assignment output first");
      return;
    }

    downloadTextFile(`case-assignment-${Date.now()}.csv`, caseAssignOutput, "text/csv;charset=utf-8;");
    toast.success("Case assignment CSV downloaded");
  };

  const handleDownloadCancellationBatch = () => {
    const currentBatch = cancellationUpdateBatches[cancellationExecutionBatchIndex] ?? "";
    if (!currentBatch.trim()) {
      toast.error("No cancellation update batch available");
      return;
    }
    downloadTextFile(`iis-cancellation-batch-${cancellationExecutionBatchIndex + 1}.csv`, currentBatch, "text/csv;charset=utf-8;");
    trackDashboardEvent({
      metricKey: "ticket_cancellation",
      incrementBy: uniqueExecutableCancellationRows.length || 1,
      event: {
        type: "ticket-cancellation",
        label: `IIS Cancellation Update Downloaded`,
        meta: `${uniqueExecutableCancellationRows.length} ticket${uniqueExecutableCancellationRows.length === 1 ? "" : "s"}`,
        module: "soql-generator",
      },
    });
    toast.success("Cancellation batch downloaded & KPI recorded");
  };

  const handleDownloadAllCancellationBatches = () => {
    if (cancellationUpdateBatches.length === 0) {
      toast.error("No cancellation update output available");
      return;
    }

    cancellationUpdateBatches.forEach((batch, index) => {
      downloadTextFile(`iis-cancellation-batch-${index + 1}.csv`, batch, "text/csv;charset=utf-8;");
    });
    trackDashboardEvent({
      metricKey: "ticket_cancellation",
      incrementBy: uniqueExecutableCancellationRows.length || cancellationUpdateBatches.length,
      event: {
        type: "ticket-cancellation",
        label: `IIS Cancellation All Batches Downloaded`,
        meta: `${uniqueExecutableCancellationRows.length || cancellationUpdateBatches.length} ticket${(uniqueExecutableCancellationRows.length || cancellationUpdateBatches.length) === 1 ? "" : "s"}`,
        module: "soql-generator",
      },
    });

    toast.success(`Downloaded ${cancellationUpdateBatches.length} cancellation batch files & KPI recorded`);
  };

  const resetCaseOwnerSelectionState = React.useCallback(() => {
    setSelectedOwnerIds(activeCaseOwners.map((owner) => owner.ownerId));
    setQuantityOwnerConfigs(buildQuantityConfig(activeCaseOwners));
  }, [activeCaseOwners]);

  const clearCaseOwnerForm = () => {
    setOwnerForm({ name: "", ownerId: "" });
    setEditingOwnerRecordId(null);
  };

  const replaceCaseOwners = async (owners: CaseOwner[], successMessage: string) => {
    setCaseOwnerAction("replace");

    try {
      const data = await requestJson<{ owners: unknown[] }>("/api/case-owners", {
        method: "PUT",
        body: JSON.stringify({ owners }),
      });
      const savedOwners = Array.isArray(data.owners) ? data.owners.filter(isValidOwnerRecord) : [];
      setCaseOwners(savedOwners);
      clearCaseOwnerForm();
      toast.success(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save employee master");
    } finally {
      setCaseOwnerAction(null);
    }
  };

  const handleAddOrUpdateOwner = async () => {
    const name = ownerForm.name.trim();
    const ownerId = ownerForm.ownerId.trim();

    if (!name || !ownerId) {
      toast.error("Enter employee name and owner id");
      return;
    }

    const duplicateOwnerId = caseOwners.some(
      (owner) =>
        owner.ownerId.toLowerCase() === ownerId.toLowerCase() && owner.id !== editingOwnerRecordId
    );

    if (duplicateOwnerId) {
      toast.error("Owner id already exists");
      return;
    }

    if (editingOwnerRecordId) {
      setCaseOwnerAction("save");

      try {
        const data = await requestJson<{ owner: unknown }>(`/api/case-owners/${editingOwnerRecordId}`, {
          method: "PATCH",
          body: JSON.stringify({ name, ownerId }),
        });

        if (!isValidOwnerRecord(data.owner)) {
          throw new Error("Invalid employee response");
        }

        const savedOwner = data.owner;
        setCaseOwners((prev) => prev.map((owner) => (owner.id === editingOwnerRecordId ? savedOwner : owner)));
        toast.success("Employee updated");
        clearCaseOwnerForm();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to update employee");
      } finally {
        setCaseOwnerAction(null);
      }
      return;
    }

    setCaseOwnerAction("save");

    try {
      const data = await requestJson<{ owner: unknown }>("/api/case-owners", {
        method: "POST",
        body: JSON.stringify({ name, ownerId }),
      });

      if (!isValidOwnerRecord(data.owner)) {
        throw new Error("Invalid employee response");
      }

      setCaseOwners((prev) => [...prev, data.owner as CaseOwner].sort((a, b) => a.name.localeCompare(b.name)));
      setOwnerForm({ name: "", ownerId: "" });
      toast.success("Employee added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add employee");
    } finally {
      setCaseOwnerAction(null);
    }
  };

  const handleEditOwner = (owner: CaseOwner) => {
    setEditingOwnerRecordId(owner.id);
    setOwnerForm({ name: owner.name, ownerId: owner.ownerId });
  };

  const handleDeleteOwner = async (ownerIdRecord: string) => {
    setCaseOwnerAction(ownerIdRecord);

    try {
      await requestJson<{ owner: unknown }>(`/api/case-owners/${ownerIdRecord}`, {
        method: "DELETE",
      });
      setCaseOwners((prev) => prev.filter((owner) => owner.id !== ownerIdRecord));
      if (editingOwnerRecordId === ownerIdRecord) {
        clearCaseOwnerForm();
      }
      toast.success("Employee deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete employee");
    } finally {
      setCaseOwnerAction(null);
    }
  };

  const handleToggleOwnerStatus = async (ownerIdRecord: string) => {
    const targetOwner = caseOwners.find((owner) => owner.id === ownerIdRecord);
    if (!targetOwner) return;

    setCaseOwnerAction(ownerIdRecord);

    try {
      const data = await requestJson<{ owner: unknown }>(`/api/case-owners/${ownerIdRecord}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !targetOwner.isActive }),
      });

      if (!isValidOwnerRecord(data.owner)) {
        throw new Error("Invalid employee response");
      }

      const savedOwner = data.owner;
      setCaseOwners((prev) => prev.map((owner) => (owner.id === ownerIdRecord ? savedOwner : owner)));
      toast.success("Employee status updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update employee status");
    } finally {
      setCaseOwnerAction(null);
    }
  };

  const handleResetOwners = async () => {
    const defaults = getDefaultCaseOwners();
    await replaceCaseOwners(defaults, "Default employee list restored");
  };

  const handleExportOwners = () => {
    if (!caseOwners.length) {
      toast.error("No employee records available");
      return;
    }

    downloadTextFile(
      `case-owner-master-${Date.now()}.json`,
      JSON.stringify(caseOwners, null, 2),
      "application/json;charset=utf-8;"
    );
    toast.success("Employee master exported");
  };

  const handleImportOwners = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = String(reader.result ?? "[]");
        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
          toast.error("Invalid import file");
          return;
        }

        const validOwners = parsed.filter(isValidOwnerRecord);
        if (!validOwners.length) {
          toast.error("No valid employee records found in file");
          return;
        }

        replaceCaseOwners(validOwners, "Employee master imported");
      } catch {
        toast.error("Unable to import file");
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  React.useEffect(() => {
    setTsBatchIndex(0);
    setSaBatchIndex(0);
    setOtherBatchIndex(0);
  }, [ticketsInput]);

  React.useEffect(() => {
    setCancellationExecutionBatchIndex(0);
  }, [cancellationExecutionInput, cancellationViewMode]);

  const handleTemplateChange = (value: string) => {
    if (selectedTemplate === "1" && ticketsInput.trim()) {
      savedTicketsRef.current = ticketsInput;
    }

    setTicketsInput("");
    setExcelInput("");
    setAssetTransferInput("");
    setAssetSOQLResult("");
    setAccountSOQLResult("");
    setTransferOutput("");
    setTransferDebug("");
    setCancellationExecutionInput("");
    setCancellationViewMode("query");
    setCaseAssignInput("");
    setCaseAssignOutput("");
    setCaseAssignMode("equal");
    resetCaseOwnerSelectionState();
    setSelectedTemplate(value);

    if (value === "1" && savedTicketsRef.current.trim()) {
      setTicketsInput(savedTicketsRef.current);
    }

    const selected = templates.find((template) => template.id === value);
    if (selected?.source === "library") {
      void requestJson<{ query: { usageCount: number } }>(`/api/soql-library/${value.replace("library:", "")}/use`, {
        method: "POST",
      })
        .then((data) => {
          setTemplates((current) =>
            current.map((template) =>
              template.id === value ? { ...template, usageCount: data.query.usageCount } : template
            )
          );
        })
        .catch(() => undefined);
    }
  };

  const handleCopy = async (value: string) => {
    if (!value.trim()) return;
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  const handleClear = () => {
    setTicketsInput("");
    setExcelInput("");
    setAssetTransferInput("");
    setAssetSOQLResult("");
    setAccountSOQLResult("");
    setTransferOutput("");
    setTransferDebug("");
    setCancellationExecutionInput("");
    setCancellationViewMode("query");
    setCaseAssignInput("");
    setCaseAssignOutput("");
    setCaseAssignMode("equal");
    resetCaseOwnerSelectionState();
  };

  const toggleFav = (id: string) => {
    const template = templates.find((template) => template.id === id);
    const isAdding = !favourites.has(id);

    if (template?.source === "library") {
      void requestJson<{ query: { favourite: boolean } }>(`/api/soql-library/${id.replace("library:", "")}`, {
        method: "PATCH",
        body: JSON.stringify({ favourite: !template.favourite }),
      })
        .then((data) => {
          setTemplates((current) =>
            current.map((item) =>
              item.id === id ? { ...item, favourite: data.query.favourite } : item
            )
          );
          if (data.query.favourite) dashboardStore.recordFavourite(template.name);
          else dashboardStore.removeFavourite(template.name);
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Unable to update favourite");
        });
      return;
    }

    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    if (!template) return;

    if (isAdding) dashboardStore.recordFavourite(template.name);
    else dashboardStore.removeFavourite(template.name);
  };

  const triggerGenerate = () => {
    if (isAssetTransfer) {
      if (assetPairs.length === 0) {
        toast.error("Paste at least one Component ID & New CID pair");
        return;
      }
      setGeneratedAtLeastOnce(true);
      const templateName = activeTemplate?.name ?? "Asset Transfer";
      dashboardStore.recordSOQL(templateName, assetPairs.length);

      trackDashboardEvent({
        metricKey: "soql_generated",
        incrementBy: 1,
        event: {
          type: "soql-generated",
          label: `SOQL generated · ${templateName}`,
          meta: `${assetPairs.length} pair${assetPairs.length === 1 ? "" : "s"}`,
          module: "soql-generator",
        },
      });

      trackDashboardEvent({
        metricKey: "asset_transfer",
        incrementBy: assetPairs.length,
        event: {
          type: "asset-transfer",
          label: `Asset transfer · ${assetPairs.length} pairs`,
          meta: `${assetPairs.length} pair${assetPairs.length === 1 ? "" : "s"}`,
          module: "soql-generator",
        },
      });

      toast.success(
        `Generated Asset Transfer queries for ${assetPairs.length} pair${assetPairs.length === 1 ? "" : "s"}`
      );
      return;
    }

    if (parsedTickets.length === 0) {
      toast.error(isCaseAssign ? "Paste at least one Case ID" : "Paste at least one ticket number");
      return;
    }

    setGeneratedAtLeastOnce(true);
    const templateName = activeTemplate?.name ?? "Unknown";
    dashboardStore.recordSOQL(templateName, parsedTickets.length);

    trackDashboardEvent({
      metricKey: "soql_generated",
      incrementBy: 1,
      event: {
        type: "soql-generated",
        label: `SOQL generated · ${templateName}`,
        meta: `${parsedTickets.length} ticket${parsedTickets.length === 1 ? "" : "s"}`,
        module: "soql-generator",
      },
    });

    if (isCancellation) {
      trackDashboardEvent({
        metricKey: "ticket_cancellation",
        incrementBy: parsedTickets.length,
        event: {
          type: "ticket-cancellation",
          label: `Ticket cancellation · ${templateName}`,
          meta: `${parsedTickets.length} ticket${parsedTickets.length === 1 ? "" : "s"}`,
          module: "soql-generator",
        },
      });
    } else if (isCaseAssign) {
      trackDashboardEvent({
        metricKey: "case_assignment",
        incrementBy: parsedTickets.length,
        event: {
          type: "case-assignment",
          label: `Case assignment · ${parsedTickets.length} cases`,
          meta: `${parsedTickets.length} case${parsedTickets.length === 1 ? "" : "s"}`,
          module: "soql-generator",
        },
      });
    }

    toast.success(
      `Generated SOQL for ${parsedTickets.length} ${isCaseAssign ? "case id" : "ticket"}${parsedTickets.length === 1 ? "" : "s"}`
    );
  };

  const showStats = parsedTickets.length > 0;
  const statEntries = Object.entries(ticketStats.breakdown).sort((a, b) => b[1] - a[1]);

  const visibleCancellationBatches =
    cancellationViewMode === "update-output"
      ? cancellationUpdateBatches
      : cancellationViewMode === "requested-query"
      ? cancellationRequestedPreview
      : otherPreview;

  const visibleCancellationTitle =
    cancellationViewMode === "update-output"
      ? "ALL IN ONE CANCELLATION ARENA"
      : cancellationViewMode === "requested-query"
      ? "CANCELLATION REQUESTED QUERY"
      : activeTemplate?.name ?? "Query Preview";

  const visibleCancellationSubtitle =
    cancellationViewMode === "update-output"
      ? 'Data Loader update file to set Status = "Canceled"'
      : cancellationViewMode === "requested-query"
      ? "Fetch only rows in Cancellation Requested"
      : `${activeTemplate?.category ?? ""} query preview`;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 lg:space-y-8 pb-14 p-4 sm:p-6 lg:p-8">
      {/* ─── Header Section ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 shadow-2xl border border-slate-700/80"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#0176d3]/20 blur-3xl mix-blend-screen pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl mix-blend-screen pointer-events-none" />
        
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0176d3] to-indigo-600 text-white shadow-lg shadow-[#0176d3]/30 border border-white/10">
              <Terminal className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-[#0176d3]/20 text-blue-300 border border-[#0176d3]/40 text-[10px] sm:text-xs font-bold px-3 py-1 flex items-center gap-1.5 shadow-inner backdrop-blur-sm uppercase tracking-widest">
                  SALESFORCE DEVELOPER TOOLS
                </Badge>
                <Badge className="bg-white/10 text-slate-300 border border-white/20 text-[10px] font-bold px-2 py-1 shadow-inner backdrop-blur-sm hidden sm:inline-flex">
                  Lightning v2.4
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                SOQL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Generator</span>
              </h1>
              <p className="text-sm text-slate-400 font-medium mt-2 max-w-xl">
                Paste values, pick a template, generate production-ready Salesforce SOQL and Data Loader batches instantly.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <Button variant="outline" onClick={handleClear} className="gap-2 h-12 px-6 rounded-xl border-slate-600 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-slate-300 font-bold transition-all backdrop-blur-sm bg-slate-800/50 shadow-inner">
              <Trash2 className="h-4.5 w-4.5" /> Clear All
            </Button>
            <Button
              onClick={triggerGenerate}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/25 h-12 px-8 rounded-xl transition-all hover:-translate-y-0.5 gap-2 text-base"
            >
              <PlayCircle className="h-5 w-5 fill-white/20" /> Generate SOQL
            </Button>
          </div>
        </div>
      </motion.div>

      {showStats && !isAssetTransfer && !isCaseAssign && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 p-4 shadow-sm backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Total Parsed</span>
              <Badge className="text-sm font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 shadow-inner">
                {ticketStats.total}
              </Badge>
            </div>

            {statEntries.map(([code, count]) => (
              <StatPill key={code} code={code} count={count} />
            ))}

            {ticketStats.unknown > 0 && (
              <div className="group flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-3.5 py-2 shadow-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                <span className="text-xs font-bold text-slate-500 group-hover:text-foreground transition-colors">
                  Other: <strong className="text-foreground font-black tabular-nums ml-1">{ticketStats.unknown}</strong>
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="xl:col-span-3 lg:col-span-4 md:col-span-12 space-y-4"
        >
          <Card className="border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl overflow-hidden group">
            <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-blue-500/10 transition-colors" />
            <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 relative z-10 p-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-black tracking-tight whitespace-nowrap">Query Template</CardTitle>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 whitespace-nowrap text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm uppercase tracking-widest">
                    {defaultTemplateCount} Built-in
                  </Badge>
                  <Badge className={cn("text-[10px] font-black px-3 py-1 whitespace-nowrap shadow-sm uppercase tracking-widest border", libraryLoadState === "error" ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20")}>
                    {libraryLoadState === "loading" ? "Loading..." : `${libraryTemplateCount} Saved`}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-6 pt-5 relative z-10">
              <div className="relative group/select">
                <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl blur-md group-hover/select:bg-slate-100/50 transition-colors pointer-events-none" />
                <select
                  value={selectedTemplate}
                  onChange={(event) => handleTemplateChange(event.target.value)}
                  className="relative w-full appearance-none rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-5 py-3.5 pr-12 text-sm font-bold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all truncate cursor-pointer hover:border-blue-500/50"
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id} className="font-bold text-sm py-2">
                      {template.source === "library" ? `⭐ [Library] ${template.name}` : template.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-transform group-hover/select:-translate-y-1 group-focus-within/select:rotate-180" />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950/50 px-4 py-3 border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                <div className="flex items-center gap-3 min-w-0">
                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 shrink-0">
                    {activeTemplate?.category || "SOQL"}
                  </Badge>
                  {activeTemplate?.source === "library" && activeTemplate.usageCount !== undefined && (
                    <span className="text-[11px] font-bold text-slate-400 truncate">
                      Used {activeTemplate.usageCount} time{activeTemplate.usageCount === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toggleFav(selectedTemplate)}
                  className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-xs font-bold"
                  aria-label={`Toggle favourite for ${activeTemplate?.name ?? ""}`}
                  title={activeTemplate?.favourite || favourites.has(selectedTemplate) ? "Remove Bookmark" : "Bookmark Template"}
                >
                  <Star
                    className={`h-4.5 w-4.5 transition-transform hover:scale-110 ${
                      activeTemplate?.source === "library"
                        ? activeTemplate.favourite
                          ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          : "text-slate-400 hover:text-amber-500"
                        : favourites.has(selectedTemplate)
                        ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                        : "text-slate-400 hover:text-amber-500"
                    }`}
                  />
                  <span className="text-[11px] font-black text-slate-500">
                    {activeTemplate?.source === "library"
                      ? activeTemplate.favourite
                        ? "Saved"
                        : "Favorite"
                      : favourites.has(selectedTemplate)
                      ? "Saved"
                      : "Favorite"}
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>

          {showStats && !isAssetTransfer && !isCaseAssign && (
            <Card className="border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl overflow-hidden group">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                  <CardTitle className="text-base font-black tracking-tight">Category Breakdown</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-5">
                <div className="space-y-3">
                  {statEntries.map(([code, count]) => {
                    const info = CATEGORY_MAP[code];
                    const pct = Math.round((count / ticketStats.total) * 100);

                    return (
                      <div key={code} className="flex items-center gap-3 text-sm">
                        <span className={`inline-block h-2 w-2 shrink-0 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm ${info?.color ?? "bg-slate-400"}`} />
                        <span className="font-bold text-slate-500 w-28 truncate transition-colors group-hover:text-foreground">{info?.label ?? code}</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-500 shadow-sm ${info?.color ?? "bg-slate-400"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-black text-foreground w-10 text-right tabular-nums">{count}</span>
                        <span className="text-xs font-bold text-slate-400 w-8 text-right tabular-nums">{pct}%</span>
                      </div>
                    );
                  })}

                  {ticketStats.unknown > 0 && (
                    <div className="flex items-center gap-3 text-sm pt-3 border-t border-slate-200/50 dark:border-slate-700/50 mt-3">
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-slate-400 ring-2 ring-white dark:ring-slate-900 shadow-sm" />
                      <span className="font-bold text-slate-500 w-28 truncate transition-colors group-hover:text-foreground">Other / Uncategorized</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow-inner">
                        <div
                          className="h-full rounded-full bg-slate-400 transition-all duration-500 shadow-sm"
                          style={{ width: `${Math.round((ticketStats.unknown / ticketStats.total) * 100)}%` }}
                        />
                      </div>
                      <span className="font-black text-foreground w-10 text-right tabular-nums">{ticketStats.unknown}</span>
                      <span className="text-xs font-bold text-slate-400 w-8 text-right tabular-nums">
                        {Math.round((ticketStats.unknown / ticketStats.total) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {!isAssetTransfer && (
            <Card className="flex flex-col border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative">
                 <div className="absolute top-0 right-0 p-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3 flex-wrap relative z-10">
                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 shadow-sm flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white shadow-inner">1</span>
                    Step 1
                  </Badge>
                  <CardTitle className="text-base font-black tracking-tight">
                    {isCaseAssign ? "Paste Case IDs" : "Paste Ticket Numbers"}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col relative z-10">
                <div className="flex-1 flex flex-col space-y-2">
                  <Textarea
                    placeholder={
                      isCaseAssign
                        ? `Paste Case IDs here...\n500Ny00001RnGoS\n500Ny00001RnK0r\n500Ny00001RnTVV`
                        : `Paste ticket numbers here...\nA26060134750678\nA26060134750476\nA26060134750619`
                    }
                    className="flex-1 min-h-[320px] font-mono text-xs leading-relaxed rounded-2xl border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-inner backdrop-blur-sm p-4 resize-y"
                    value={ticketsInput}
                    onChange={(event) => {
                      const value = event.target.value;
                      setTicketsInput(value);
                      setGeneratedAtLeastOnce(false);
                      if (selectedTemplate !== "1" && value.trim()) {
                        savedTicketsRef.current = "";
                      }
                    }}
                  />
                  <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                    {isCaseAssign
                      ? "Supports spaces, commas, tabs, or newlines. Case IDs are automatically chunked into 400-value batches for Salesforce-safe SOQL."
                      : "Supports spaces, commas, tabs, or newlines. Values are automatically chunked into 400-value batches for Salesforce-safe SOQL."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                    {parsedTickets.length === 0
                      ? isCaseAssign
                        ? "No case ids"
                        : "No tickets"
                      : `${parsedTickets.length} ${isCaseAssign ? "case id" : "ticket"}${parsedTickets.length === 1 ? "" : "s"}`}
                  </Badge>
                  <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                    {batchCount === 0 ? "0 batches" : `${batchCount} batch${batchCount === 1 ? "" : "es"}`}
                  </Badge>
                  <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                    Max 400 / block
                  </Badge>
                  <div className="flex-1" />
                  <Button variant="outline" size="sm" className="gap-2 h-10 px-4 rounded-xl text-xs hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all font-bold border-slate-200 dark:border-slate-700" onClick={handleClear}>
                    <Trash2 className="h-4 w-4" /> Clear
                  </Button>
                  <Button onClick={triggerGenerate} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold gap-2 h-10 px-5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                    <PlayCircle className="h-4 w-4 fill-white/20" /> Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isAssetTransfer && (
            <Card className="flex flex-col border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative">
                 <div className="absolute top-0 right-0 p-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                    <ArrowRightLeft className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-black tracking-tight">Asset Transfer Data</CardTitle>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Component ID → New CID mapping</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col relative z-10">
                <div className="flex-1 flex flex-col space-y-2">
                  <label className="text-xs font-black text-slate-500 block uppercase tracking-widest pl-1">Component & New CID Pairs</label>
                  <Textarea
                    placeholder={`COMPONENT        NEW CID\nBSL34933847      CID-2025004\nBSL29709797      CID-4206214\nBSL22295338      CID-6074821`}
                    className="flex-1 min-h-[220px] font-mono text-xs leading-relaxed rounded-2xl border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-inner backdrop-blur-sm p-4 resize-y"
                    value={assetTransferInput}
                    onChange={(event) => setAssetTransferInput(event.target.value)}
                  />
                  <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                    Paste component ID and new CID pairs. Tab or space separated. One pair per line.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                    {assetPairs.length} pair{assetPairs.length === 1 ? "" : "s"}
                  </Badge>
                  <div className="flex-1" />
                  <Button variant="outline" size="sm" className="gap-2 h-10 px-4 rounded-xl text-xs hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all font-bold border-slate-200 dark:border-slate-700" onClick={handleClear}>
                    <Trash2 className="h-4 w-4" /> Clear
                  </Button>
                  <Button onClick={triggerGenerate} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold gap-2 h-10 px-5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                    <PlayCircle className="h-4 w-4 fill-white/20" /> Generate Queries
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className="xl:col-span-9 lg:col-span-8 md:col-span-12 grid grid-cols-1 xl:grid-cols-2 gap-6"
        >
          {isTS && (
            <>
              <QueryPreviewCard
                title="TS (Ticket Status)"
                subtitle="WorkOrder query preview"
                batches={workOrderPreview}
                batchIndex={tsBatchIndex}
                setBatchIndex={setTsBatchIndex}
                onCopy={handleCopy}
              />
              <QueryPreviewCard
                title="SA (Service Appointment)"
                subtitle="ServiceAppointment query preview"
                batches={serviceAppointmentPreview}
                batchIndex={saBatchIndex}
                setBatchIndex={setSaBatchIndex}
                onCopy={handleCopy}
              />

              <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl h-full flex flex-col transition-all duration-300 hover:shadow-xl group relative">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-blue-500/10 transition-colors" />
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                        <Mail className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base font-black tracking-tight text-foreground">Email Template Output</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(EMAIL_TEMPLATE)}>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 text-foreground flex flex-col min-h-0 flex-1 shadow-inner overflow-hidden backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2.5">
                      <span className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">
                        STANDARD EMAIL FORMAT
                      </span>
                    </div>
                    <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-sky-200 max-h-[220px] min-h-0 selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100">
                      {EMAIL_TEMPLATE}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl h-full flex flex-col transition-all duration-300 hover:shadow-xl group relative">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-amber-500/10 transition-colors" />
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base font-black tracking-tight text-foreground">Chatter / Post Template</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(POST_TEMPLATE)}>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 text-foreground flex flex-col min-h-0 flex-1 shadow-inner overflow-hidden backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2.5">
                      <span className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">
                        CHATTER POST FORMAT
                      </span>
                    </div>
                    <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-sky-200 max-h-[220px] min-h-0 selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-100">
                      {POST_TEMPLATE}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {isSA && (
            <QueryPreviewCard
              title="SA (Service Appointment)"
              subtitle="ServiceAppointment query preview"
              batches={serviceAppointmentPreview}
              batchIndex={saBatchIndex}
              setBatchIndex={setSaBatchIndex}
              onCopy={handleCopy}
            />
          )}

          {isAssetTransfer && (
            <>
              <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl h-full flex flex-col transition-all duration-300 hover:shadow-xl group relative">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-blue-500/10 transition-colors" />
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <CardTitle className="text-base font-black tracking-tight text-foreground">Component SOQL Query</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(assetTransferComponentSOQL)} disabled={!assetTransferComponentSOQL}>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 text-foreground flex flex-col min-h-0 flex-1 shadow-inner overflow-hidden backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2.5">
                      <span className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">
                        COMPONENT MASTER QUERY
                      </span>
                    </div>
                    <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-sky-200 max-h-[320px] min-h-0 selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100">
                      {assetTransferComponentSOQL || "Paste component pairs to generate Component SOQL"}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl h-full flex flex-col transition-all duration-300 hover:shadow-xl group relative">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-emerald-500/10 transition-colors" />
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <CardTitle className="text-base font-black tracking-tight text-foreground">Account SOQL Query</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(assetTransferAccountSOQL)} disabled={!assetTransferAccountSOQL}>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 text-foreground flex flex-col min-h-0 flex-1 shadow-inner overflow-hidden backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2.5">
                      <span className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">
                        ACCOUNT MASTER QUERY
                      </span>
                    </div>
                    <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-sky-200 max-h-[320px] min-h-0 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">
                      {assetTransferAccountSOQL || "Paste component pairs to generate Account SOQL"}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl h-full flex flex-col xl:col-span-2 transition-all duration-300 hover:shadow-xl group relative">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-fuchsia-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-fuchsia-500/10 transition-colors" />
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 shadow-inner">
                      <ArrowRightLeft className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-black tracking-tight text-foreground">SOQL Results Processing</CardTitle>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Paste results from both SOQL queries to generate transfer file
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <label className="text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">Asset SOQL Result</label>
                      <Textarea
                        placeholder={`Paste Asset SOQL result here...\n"_"\t"Component_Id__c"\t"Id"\t"Account.Customer_ID__c"\t"Record_Type__c"\t"Parent.Id"`}
                        className="flex-1 min-h-[160px] font-mono text-xs leading-relaxed rounded-2xl border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 focus-visible:ring-fuchsia-500/40 focus-visible:border-fuchsia-500 shadow-inner backdrop-blur-sm p-4 resize-y"
                        value={assetSOQLResult}
                        onChange={(event) => setAssetSOQLResult(event.target.value)}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">Account SOQL Result</label>
                      <Textarea
                        placeholder={`Paste Account SOQL result here...\n"_"\t"Customer_ID__c"\t"Id"`}
                        className="flex-1 min-h-[160px] font-mono text-xs leading-relaxed rounded-2xl border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 focus-visible:ring-fuchsia-500/40 focus-visible:border-fuchsia-500 shadow-inner backdrop-blur-sm p-4 resize-y"
                        value={accountSOQLResult}
                        onChange={(event) => setAccountSOQLResult(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold gap-2 h-10 px-5 rounded-xl text-xs shadow-md shadow-fuchsia-500/20 transition-all hover:-translate-y-0.5" onClick={handleProcessTransfer} disabled={!assetSOQLResult || !accountSOQLResult}>
                      <ArrowRightLeft className="h-4 w-4" /> Process Transfer
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 h-10 px-4 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" onClick={handleDownloadTransfer} disabled={!transferOutput}>
                      <Download className="h-4 w-4 text-slate-400" /> Download CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {transferOutput && (
                <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl h-full flex flex-col xl:col-span-2 transition-all duration-300 hover:shadow-xl group relative">
                  <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-emerald-500/10 transition-colors" />
                  <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                          <FileSpreadsheet className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base font-black tracking-tight text-foreground">Transfer Output (Excel Ready)</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(transferOutput)}>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={handleDownloadTransfer}>
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 text-foreground flex flex-col min-h-0 flex-1 shadow-inner overflow-hidden backdrop-blur-sm">
                      <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 max-h-[320px] min-h-0 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">
                        {transferOutput}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {transferDebug && (
                <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl h-full flex flex-col xl:col-span-2 transition-all duration-300 hover:shadow-xl group relative">
                  <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-amber-500/10 transition-colors" />
                  <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base font-black tracking-tight text-foreground">Transfer Debug Log</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(transferDebug)}>
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 text-foreground flex flex-col min-h-0 flex-1 shadow-inner overflow-hidden backdrop-blur-sm">
                      <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-amber-200 max-h-[240px] min-h-0 selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-100">
                        {transferDebug}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {isCancellation && (
            <>
              <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl h-full flex flex-col transition-all duration-300 hover:shadow-xl group relative">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-rose-500/10 transition-colors" />
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4 items-start">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-inner mt-1">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-black tracking-tight text-foreground">{visibleCancellationTitle}</CardTitle>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{visibleCancellationSubtitle}</p>
                        </div>
                      </div>
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm self-start mt-2 sm:mt-0">
                        {visibleCancellationBatches.length} batch{visibleCancellationBatches.length === 1 ? "" : "es"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mt-2">
                      <CancellationModeButton active={cancellationViewMode === "query"} onClick={() => setCancellationViewMode("query")}>
                        Normal Query
                      </CancellationModeButton>
                      <CancellationModeButton active={cancellationViewMode === "update-output"} onClick={() => setCancellationViewMode("update-output")}>
                        Update Output
                      </CancellationModeButton>
                      <CancellationModeButton active={cancellationViewMode === "requested-query"} onClick={() => setCancellationViewMode("requested-query")}>
                        Cancellation Requested Query
                      </CancellationModeButton>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-5 space-y-4 flex-1 flex flex-col relative z-10">
                  {visibleCancellationBatches.length > 0 ? (
                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 text-foreground flex flex-col min-h-0 flex-1 shadow-inner overflow-hidden backdrop-blur-sm">
                      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2.5">
                        <span className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">
                          Batch {cancellationExecutionBatchIndex + 1} / {visibleCancellationBatches.length}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors" disabled={cancellationExecutionBatchIndex <= 0} onClick={() => setCancellationExecutionBatchIndex((value) => Math.max(0, value - 1))}>
                            <ChevronLeft className="h-4.5 w-4.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors" disabled={cancellationExecutionBatchIndex >= visibleCancellationBatches.length - 1} onClick={() => setCancellationExecutionBatchIndex((value) => Math.min(visibleCancellationBatches.length - 1, value + 1))}>
                            <ChevronRight className="h-4.5 w-4.5" />
                          </Button>
                          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1.5" />
                          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 px-3 text-xs font-bold rounded-lg transition-colors" onClick={() => handleCopy(visibleCancellationBatches[cancellationExecutionBatchIndex] ?? "")}>
                            <Copy className="h-3.5 w-3.5 text-rose-400" /> Copy
                          </Button>
                        </div>
                      </div>
                      <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-rose-200 min-h-0 max-h-[320px] selection:bg-rose-500/20 selection:text-rose-900 dark:selection:text-rose-100">
                        {visibleCancellationBatches[cancellationExecutionBatchIndex] ?? ""}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-8 text-center shadow-inner">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-400 mb-3 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
                        <PlayCircle className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-black text-foreground max-w-[250px] mx-auto">
                        {cancellationViewMode === "update-output"
                          ? "Paste IIS cancellation SOQL result to generate update output"
                          : cancellationViewMode === "requested-query"
                          ? "Paste tickets to generate Cancellation Requested query"
                          : "Paste tickets to generate normal cancellation query"}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 transition-all shadow-sm" onClick={() => handleCopy(visibleCancellationBatches.join("\n\n"))} disabled={visibleCancellationBatches.length === 0}>
                      <Copy className="h-4 w-4 mr-1.5" /> Copy All
                    </Button>

                    {cancellationViewMode === "update-output" && (
                      <>
                        <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm" onClick={handleDownloadCancellationBatch} disabled={cancellationUpdateBatches.length === 0}>
                          <Download className="h-4 w-4 mr-1.5 text-slate-400" /> Download Current Batch
                        </Button>
                        <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm" onClick={handleDownloadAllCancellationBatches} disabled={cancellationUpdateBatches.length === 0}>
                          <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-500" /> Download All Batches
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl h-full flex flex-col transition-all duration-300 hover:shadow-xl group relative">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-blue-500/10 transition-colors" />
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 shadow-sm flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white shadow-inner">3</span>
                      Step 3
                    </Badge>
                    <CardTitle className="text-base font-black tracking-tight text-foreground">Paste SOQL Result for email /post ticket entry</CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 gap-4 relative z-10">
                  <Textarea
                    placeholder={`Paste SOQL result here...\n"_","Id","Ticket_Number_Read_Only__c","Status"`}
                    className="flex-1 min-h-[220px] font-mono text-xs leading-relaxed rounded-2xl border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-inner backdrop-blur-sm p-4 resize-y"
                    value={cancellationExecutionInput}
                    onChange={(event) => setCancellationExecutionInput(event.target.value)}
                  />

                  <div className="flex flex-wrap gap-2.5 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                    <Badge className="bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Parsed: {cancellationExecutionRows.length}</Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Ready: {uniqueExecutableCancellationRows.length}</Badge>
                    <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Skipped: {skippedCancellationRows.length}</Badge>
                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Update batches: {cancellationUpdateBatches.length}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl h-full flex flex-col transition-all duration-300 hover:shadow-xl group relative">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-teal-500/10 transition-colors" />
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shadow-inner">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-black tracking-tight text-foreground">Paste Excel / Data Loader Output</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">
                  <Textarea
                    placeholder={`Paste Excel / Data Loader output here...`}
                    className="flex-1 min-h-[180px] font-mono text-xs leading-relaxed rounded-2xl border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 focus-visible:ring-teal-500/40 focus-visible:border-teal-500 shadow-inner backdrop-blur-sm p-4 resize-y"
                    value={excelInput}
                    onChange={(event) => setExcelInput(event.target.value)}
                  />
                  {failedTickets.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase px-3 py-1.5 tracking-widest shadow-sm">
                        {failedTickets.length} failed ticket{failedTickets.length === 1 ? "" : "s"} extracted
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl h-full flex flex-col transition-all duration-300 hover:shadow-xl group relative">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-blue-500/10 transition-colors" />
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                        <Mail className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base font-black tracking-tight text-foreground">Email</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(cancellationEmail)}>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">
                  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 text-foreground flex flex-col min-h-0 flex-1 shadow-inner overflow-hidden backdrop-blur-sm">
                    <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-sky-200 max-h-[220px] min-h-0 selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100">
                      {cancellationEmail || "Paste tickets to generate cancellation email"}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl h-full flex flex-col xl:col-span-2 transition-all duration-300 hover:shadow-xl group relative">
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-amber-500/10 transition-colors" />
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base font-black tracking-tight text-foreground">Post</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(cancellationPost)}>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">
                  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 text-foreground flex flex-col min-h-0 flex-1 shadow-inner overflow-hidden backdrop-blur-sm">
                    <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-amber-200 max-h-[220px] min-h-0 selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-100">
                      {cancellationPost || "Paste tickets to generate cancellation post"}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {cancellationUpdateDebug && (
                <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl h-full flex flex-col xl:col-span-2 transition-all duration-300 hover:shadow-xl group relative">
                  <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-slate-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-slate-500/10 transition-colors" />
                  <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-6 relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 shadow-inner">
                          <Filter className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base font-black tracking-tight text-foreground">Cancellation Execution Summary</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-slate-500/10 hover:text-slate-600 hover:border-slate-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(cancellationUpdateDebug)}>
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">
                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 text-foreground flex flex-col min-h-0 flex-1 shadow-inner overflow-hidden backdrop-blur-sm">
                      <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 max-h-[280px] min-h-0 selection:bg-slate-500/20 selection:text-slate-900 dark:selection:text-slate-100">
                        {cancellationUpdateDebug}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {isCaseAssign && (
            <div className="xl:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
              {/* === LEFT WORKBENCH COLUMN === */}
              <div className="space-y-4 flex flex-col">
                {/* 1. Case Query Preview Card (Compact) */}
                <QueryPreviewCard
                  title="Case Assign"
                  subtitle="Case query preview"
                  batches={otherPreview}
                  batchIndex={otherBatchIndex}
                  setBatchIndex={setOtherBatchIndex}
                  onCopy={handleCopy}
                />

                {/* 2. Step 3: Paste fetched Case output (Compact 140px textarea) */}
                <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl flex flex-col transition-all duration-300 hover:shadow-xl relative group">
                  <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-[#0176d3]/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-[#0176d3]/10 transition-colors" />
                  <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-5 relative z-10">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0176d3]/10 text-[#0176d3] shadow-inner">
                          <Users className="h-4.5 w-4.5" />
                        </div>
                        <CardTitle className="text-sm font-black tracking-tight text-foreground">Step 2: Paste fetched Case output</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">Rows: {caseAssignmentRows.length}</Badge>
                        <Badge className="bg-[#0176d3]/10 text-[#0176d3] border border-[#0176d3]/20 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">Active: {activeCaseOwners.length}</Badge>
                        <Badge variant={caseOwnerLoadState === "error" ? "danger" : "outline"} className={cn("text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm", caseOwnerLoadState === "error" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20")}>
                          DB: {caseOwnerLoadState === "loading" ? "Syncing" : caseOwnerLoadState === "error" ? "Offline" : "Ready"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 pl-12">
                      Paste SOQL result from Workbench. Format: Id, Status, OwnerId.
                    </p>
                  </CardHeader>
                  <CardContent className="p-5 relative z-10">
                    <Textarea
                      placeholder={`"_","Id","Status","OwnerId"\n"[Case]","500Ny00001RpOgFIAV","Open","00GNy000009qbJFMAY"`}
                      className="min-h-[120px] max-h-[140px] font-mono text-xs leading-relaxed rounded-2xl border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 focus-visible:ring-[#0176d3]/40 focus-visible:border-[#0176d3] shadow-inner backdrop-blur-sm p-4 resize-y"
                      value={caseAssignInput}
                      onChange={(event) => setCaseAssignInput(event.target.value)}
                    />
                  </CardContent>
                </Card>

                {/* 3. Assignment Mode & Quick Execute Control Box */}
                <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl flex flex-col transition-all duration-300 hover:shadow-xl relative group">
                  <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-purple-500/10 transition-colors" />
                  <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-5 relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-inner">
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        </div>
                        <CardTitle className="text-sm font-black tracking-tight text-foreground">Assignment Mode &amp; Execution</CardTitle>
                      </div>
                      <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20 shadow-sm">Round Robin</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4 relative z-10">
                    <div className="grid grid-cols-3 gap-2 bg-slate-50/50 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                      <Button size="sm" variant={caseAssignMode === "equal" ? "primary" : "ghost"} onClick={() => setCaseAssignMode("equal")} className={cn("text-xs h-9 font-bold rounded-lg transition-all", caseAssignMode === "equal" ? "bg-purple-500 hover:bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-slate-500 hover:text-purple-600")}>
                        Equally
                      </Button>
                      <Button size="sm" variant={caseAssignMode === "owner-wise" ? "primary" : "ghost"} onClick={() => setCaseAssignMode("owner-wise")} className={cn("text-xs h-9 font-bold rounded-lg transition-all", caseAssignMode === "owner-wise" ? "bg-purple-500 hover:bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-slate-500 hover:text-purple-600")}>
                        Owner Wise
                      </Button>
                      <Button size="sm" variant={caseAssignMode === "quantity-wise" ? "primary" : "ghost"} onClick={() => setCaseAssignMode("quantity-wise")} className={cn("text-xs h-9 font-bold rounded-lg transition-all", caseAssignMode === "quantity-wise" ? "bg-purple-500 hover:bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-slate-500 hover:text-purple-600")}>
                        Qty Wise
                      </Button>
                    </div>

                    {/* Mode Specific Compact Configurations */}
                    {caseAssignMode === "equal" && (
                      <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-start gap-3 shadow-inner backdrop-blur-sm">
                        <CheckCircle2 className="h-4.5 w-4.5 text-purple-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Automatically distributes cases as evenly as possible across all {activeCaseOwners.length} active employees.</span>
                      </div>
                    )}

                    {caseAssignMode === "owner-wise" && (
                      <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3 shadow-inner backdrop-blur-sm">
                        <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">
                          <span>Target Owners</span>
                          <span className="bg-purple-500/10 text-purple-600 border border-purple-500/20 px-2 py-0.5 rounded-md">{selectedOwnerIds.length} selected</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto no-scrollbar pr-1">
                          {activeCaseOwners.map((owner) => {
                            const checked = selectedOwnerIds.includes(owner.ownerId);
                            return (
                              <label key={owner.id} className={cn("flex items-center gap-2.5 rounded-xl border p-2 cursor-pointer transition-all", checked ? "bg-purple-500/5 border-purple-500/30 shadow-sm" : "bg-card border-slate-200 dark:border-slate-700 hover:border-purple-500/30")}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(event) => {
                                    setSelectedOwnerIds((prev) => {
                                      if (event.target.checked) return [...prev, owner.ownerId];
                                      return prev.filter((id) => id !== owner.ownerId);
                                    });
                                  }}
                                  className="rounded text-purple-500 focus:ring-purple-500"
                                />
                                <span className={cn("text-xs font-bold truncate", checked ? "text-purple-700 dark:text-purple-300" : "text-foreground")}>{owner.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {caseAssignMode === "quantity-wise" && (
                      <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3 shadow-inner backdrop-blur-sm">
                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                          <span>Set Quantities</span>
                          <span className="bg-purple-500/10 text-purple-600 border border-purple-500/20 px-2 py-0.5 rounded-md">Total: {quantitySelectedTotal} / {caseAssignmentRows.length}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto no-scrollbar pr-1">
                          {quantityOwnerConfigs.map((owner, index) => (
                            <div key={owner.id} className={cn("flex items-center justify-between gap-3 rounded-xl border p-2 transition-all", owner.selected ? "bg-purple-500/5 border-purple-500/30 shadow-sm" : "bg-card border-slate-200 dark:border-slate-700")}>
                              <label className="flex items-center gap-2.5 cursor-pointer min-w-0">
                                <input
                                  type="checkbox"
                                  checked={owner.selected}
                                  onChange={(event) => {
                                    setQuantityOwnerConfigs((prev) =>
                                      prev.map((item, itemIndex) =>
                                        itemIndex === index ? { ...item, selected: event.target.checked } : item
                                      )
                                    );
                                  }}
                                  className="rounded text-purple-500 focus:ring-purple-500"
                                />
                                <span className={cn("text-xs font-bold truncate", owner.selected ? "text-purple-700 dark:text-purple-300" : "text-foreground")}>{owner.name}</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={owner.quantity}
                                disabled={!owner.selected}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setQuantityOwnerConfigs((prev) =>
                                    prev.map((item, itemIndex) =>
                                      itemIndex === index ? { ...item, quantity: value } : item
                                    )
                                  );
                                }}
                                className="w-16 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-center font-mono font-bold disabled:opacity-40 outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 shadow-inner"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Execution Action Bar */}
                    <div className="pt-4 flex items-center justify-between gap-3 flex-wrap">
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs gap-2 h-10 px-5 flex-1 shadow-md shadow-purple-500/20 rounded-xl transition-all hover:-translate-y-0.5" onClick={handleRunCaseAssignment}>
                        <CheckCircle2 className="h-4.5 w-4.5" /> Generate Assignment
                      </Button>
                      <Button variant="outline" size="sm" className="h-10 px-4 text-xs gap-2 font-bold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm" onClick={() => handleCopy(caseAssignOutput)} disabled={!caseAssignOutput} title="Copy result">
                        <Copy className="h-4 w-4 text-slate-400" /> Copy
                      </Button>
                      <Button variant="outline" size="sm" className="h-10 px-4 text-xs gap-2 font-bold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm" onClick={handleDownloadCaseAssignment} disabled={!caseAssignOutput} title="Download CSV">
                        <Download className="h-4 w-4 text-slate-400" /> CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* === RIGHT RESULTS & MASTER MANAGEMENT COLUMN === */}
              <div className="space-y-4 flex flex-col">
                {/* 1. Assignment Output Box (Right at the Top so you see results without scrolling!) */}
                <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl flex flex-col transition-all duration-300 hover:shadow-xl relative group">
                  <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-emerald-500/10 transition-colors" />
                  <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-5 relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-black tracking-tight text-foreground">Final Assignment Output</CardTitle>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ready for Data Loader</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(caseAssignOutput)} disabled={!caseAssignOutput}>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={handleDownloadCaseAssignment} disabled={!caseAssignOutput}>
                          <Download className="h-3.5 w-3.5" /> CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 relative z-10">
                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 text-foreground flex flex-col min-h-0 flex-1 shadow-inner overflow-hidden backdrop-blur-sm">
                      <pre className="overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 h-[140px] max-h-[140px] no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">
                        {caseAssignOutput || `"_","Id","Status","OwnerId"\n"[Case]","500Ny00001RpOgFIAV","Open","005Ny00000QgwYTIAZ"`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Compact High-Density Owner Master Management */}
                <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl flex flex-col flex-1 transition-all duration-300 hover:shadow-xl relative group">
                  <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-blue-500/10 transition-colors" />
                  <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 p-5 relative z-10">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                          <Users className="h-4.5 w-4.5" />
                        </div>
                        <CardTitle className="text-sm font-black tracking-tight text-foreground">Owner Master Roster ({caseOwners.length})</CardTitle>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-[11px] gap-1.5 font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors" onClick={refreshCaseOwners} disabled={caseOwnerAction !== null} title="Refresh DB">
                          <RotateCcw className="h-3 w-3" /> Refresh
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-[11px] gap-1.5 font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors" onClick={handleExportOwners} title="Export JSON">
                          <Download className="h-3 w-3" /> Export
                        </Button>
                        <label className="inline-flex">
                          <input type="file" accept="application/json" className="hidden" onChange={handleImportOwners} disabled={caseOwnerAction !== null} />
                          <span className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg cursor-pointer transition-colors">
                            <Upload className="h-3 w-3" /> Import
                          </span>
                        </label>
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-[11px] gap-1.5 font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" onClick={handleResetOwners} disabled={caseOwnerAction !== null} title="Reset default roster">
                          <RotateCcw className="h-3 w-3" /> Reset
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4 relative z-10">
                    {/* Compact Add/Update Bar */}
                    <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2">
                      <input
                        type="text"
                        placeholder="Employee name..."
                        value={ownerForm.name}
                        onChange={(event) => setOwnerForm((prev) => ({ ...prev, name: event.target.value }))}
                        disabled={caseOwnerAction !== null}
                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-inner backdrop-blur-sm transition-all"
                      />
                      <input
                        type="text"
                        placeholder="005Ny00000..."
                        value={ownerForm.ownerId}
                        onChange={(event) => setOwnerForm((prev) => ({ ...prev, ownerId: event.target.value }))}
                        disabled={caseOwnerAction !== null}
                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-inner backdrop-blur-sm transition-all"
                      />
                      <Button size="sm" className="h-10 px-4 gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all" onClick={handleAddOrUpdateOwner} disabled={caseOwnerAction !== null}>
                        {editingOwnerRecordId ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                        {editingOwnerRecordId ? "Save" : "Add"}
                      </Button>
                      <Button variant="outline" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 rounded-xl transition-all shadow-sm" onClick={clearCaseOwnerForm} disabled={caseOwnerAction !== null} title="Clear inputs">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Scrollable High-Density Roster Panel */}
                    <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-2 pr-1">
                      {caseOwnerLoadState === "loading" && (
                        <div className="p-8 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                          <RotateCcw className="h-6 w-6 animate-spin mb-3 text-blue-500" />
                          <span className="text-xs font-black uppercase tracking-widest">Syncing roster...</span>
                        </div>
                      )}
                      {caseOwnerLoadState !== "loading" && caseOwners.length === 0 && (
                        <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                          <Users className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">No employees saved</p>
                        </div>
                      )}
                      {caseOwners.map((owner) => (
                        <div key={owner.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/30 hover:shadow-md transition-all group backdrop-blur-sm shadow-inner">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shadow-inner", owner.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                              <span className={cn("h-2 w-2 rounded-full", owner.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-400")} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-foreground whitespace-nowrap">{owner.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">{owner.ownerId}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors" onClick={() => handleEditOwner(owner)} title="Edit Employee"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => handleToggleOwnerStatus(owner.id)} title={owner.isActive ? "Disable Employee" : "Enable Employee"}><Power className={cn("h-4 w-4", owner.isActive ? "text-emerald-500" : "text-amber-500")} /></Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors" onClick={() => handleDeleteOwner(owner.id)} title="Delete Employee"><UserMinus className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}


          {!isTS && !isSA && !isAssetTransfer && !isCancellation && !isCaseAssign && (
            <QueryPreviewCard
              title={activeTemplate?.name ?? "Query Preview"}
              subtitle={`${activeTemplate?.category ?? ""} query preview`}
              batches={otherPreview}
              batchIndex={otherBatchIndex}
              setBatchIndex={setOtherBatchIndex}
              onCopy={handleCopy}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}456