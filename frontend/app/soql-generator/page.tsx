"use client";

import * as React from "react";
import * as xlsx from "xlsx";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SOQLHighlighter } from "@/components/ui/soql-highlighter";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { dashboardStore, useDashboardStore } from "@/lib/dashboard-store";
import { trackDashboardEvent } from "@/lib/dashboard-tracker";
import { parseAssetTransferPairs } from "@/lib/parsers";
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
  Bookmark,
  Check,
  Activity,
  ArrowRight,
  RefreshCw,
  History,
  BarChart3,
  Ban,
  Box,
  Briefcase,
  Calendar,
  FileText,
  UploadCloud,
  ClipboardPaste,
  Sparkles,
    FileWarning,
    CalendarClock,
    Database,
  CornerRightUp,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { JsonViewer } from "@/components/ui/json-viewer";

interface Template {
  id: string;
  name: string;
  category: string;
  soql: string;
  favourite: boolean;
  type?: "normal" | "asset-transfer" | "child-details-to-parent" | "product-record-type-update";
  source?: "default" | "library";
  usageCount?: number;
}

interface ComponentIdParseResult {
  totalCount: number;
  componentIds: string[];
  duplicateCount: number;
  ignoredCount: number;
}

interface ChildDetailsParentTransformResult {
  output: string;
  sourceRows: number;
  returnedComponentCount: number;
  generatedRows: number;
  skippedRows: number;
  duplicateRows: number;
  unexpectedComponentRows: number;
  missingComponentIdRows: number;
  missingAssetIdRows: number;
  missingParentAccountIdRows: number;
  invalidAssetIdRows: number;
  invalidParentAccountIdRows: number;
  conflictingAssetIds: string[];
  missingComponentIds: string[];
  missingHeaders: string[];
}

interface CancellationExecutionRow {
  id: string;
  ticket: string;
  status: string;
}

interface CaseAssignmentRow {
  id: string;
  status: "Open";
  category?: string;
  openedDate?: number;
}

interface CaseAssignmentResult {
  output: string;
  assignedCount: number;
  unassignedCaseIds: string[];
  ownerCount: number;
  casesPerOwner: number;
  remainder?: number;
  extraOwners?: CaseOwner[];
  startOwner?: CaseOwner;
  nextStartOwner?: CaseOwner;
  nextPointer?: number;
}

interface CaseOwner {
  id: string;
  name: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RoundRobinHistoryEntry {
  batchId: number;
  totalCases: number;
  baseCases: number;
  extraCases: number;
  extraOwners: CaseOwner[];
  startOwner: CaseOwner | null;
  nextStartOwner: CaseOwner | null;
  timestamp: string;
}

interface CumulativeLoadMap {
  [ownerId: string]: { total: number; extra: number };
}

interface QuantityOwnerConfig {
  id: string;
  name: string;
  ownerId: string;
  selected: boolean;
  quantity: string;
}

type CaseAssignMode = "equal" | "owner-wise" | "quantity-wise";

const CHILD_DETAILS_PARENT_TARGET_RECORD_TYPE_ID = "012Ny0000003SvrIAE";
const SALESFORCE_ID_REGEX = /^[A-Za-z0-9]{15}(?:[A-Za-z0-9]{3})?$/;
const CHILD_DETAILS_COMPONENT_ID_HEADERS = [
  "component_id__c",
  "componentid__c",
  "component_id",
  "componentid",
] as const;
const CHILD_DETAILS_PARENT_ACCOUNT_ID_HEADERS = [
  "parent.accountid",
  "parentaccountid",
  "parent_accountid",
  "parent.account.id",
] as const;
const COMPONENT_INPUT_HEADERS = new Set([
  "component",
  "componentid",
  "component_id",
  "componentid__c",
  "component_id__c",
  "id",
]);
const CANCELLATION_QUERY_TEMPLATE = `SELECT Id, Ticket_Number_Read_Only__c, Status
FROM WorkOrder
WHERE Status != 'Completed' AND Ticket_Number_Read_Only__c IN (
{{tickets}}
)`;
const defaultTemplates: Template[] = [
  {
    id: "1",
    name: "Update Accepted and None",
    category: "WorkOrder",
    soql: `SELECT Id, Status
FROM WorkOrder
WHERE Status NOT IN (\'Completed\',\'Canceled\',\'Cancellation Requested\')
AND ParentWorkOrderId = null
AND Ticket_Number_Read_Only__c IN (
{{tickets}}
)`,
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
    id: "19",
    name: "Cancellation Requested",
    category: "WorkOrder",
    soql: `SELECT Id, Ticket_Number_Read_Only__c, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)\nAND Status = 'Cancellation Requested'`,
    favourite: false,
  },
  {
    id: "20",
    name: "CHILD TO PARENT UPDATED",
    category: "Asset",
    soql: "SELECT Id, Component_Id__c, Parent.AccountId, ParentId, RecordTypeId FROM Asset WHERE RecordType.Name = 'Component' and Component_Id__c IN (\n{{tickets}}\n)",
    favourite: false,
  },
  {
    id: "4",
    name: "Case Assign",
    category: "Case",
    soql: "",
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

const CASE_ID_REGEX = /(?:^|[^\p{L}\p{N}])(500[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?)(?![\p{L}\p{N}])/gu;
const SALESFORCE_TICKET_REGEX = /(?:^|[^A-Za-z0-9])([BISXCAD]\d{14,})(?![A-Za-z0-9])/gi;


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

function parseCaseIds(input: string): string[] {
  if (!input.trim()) return [];

  const seen = new Set<string>();
  const caseIds: string[] = [];

  for (const match of input.matchAll(CASE_ID_REGEX)) {
    const caseId = match[1];
    const recordKey = caseId?.slice(0, 15);
    if (!caseId || !recordKey || seen.has(recordKey)) continue;
    seen.add(recordKey);
    caseIds.push(caseId);
  }

  return caseIds;
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

interface ParsedSOQLResult {
  headers: string[];
  rows: Array<Record<string, string>>;
}

function parseSOQLResultWithHeaders(input: string): ParsedSOQLResult {
  if (!input.trim()) return { headers: [], rows: [] };

  const lines = input.split(/[\r\n]+/).filter((line) => line.trim());
  const rows: Array<Record<string, string>> = [];
  let headers: string[] = [];
  const detectedHeaders = new Set<string>();

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
      headers.forEach((header) => {
        if (header) detectedHeaders.add(header);
      });
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

  return { headers: [...detectedHeaders], rows };
}

function parseSOQLResult(input: string): Array<Record<string, string>> {
  return parseSOQLResultWithHeaders(input).rows;
}

function parseComponentIds(input: string): ComponentIdParseResult {
  if (!input.trim()) {
    return { totalCount: 0, componentIds: [], duplicateCount: 0, ignoredCount: 0 };
  }

  const seen = new Set<string>();
  const componentIds: string[] = [];
  let totalCount = 0;
  let duplicateCount = 0;
  let ignoredCount = 0;
  const values = input
    .replace(/^\uFEFF/, "")
    .split(/[\r\n,\t;]+/)
    .flatMap((part) => part.trim().split(/\s+/));

  for (const rawValue of values) {
    const componentId = cleanValue(rawValue).replace(/^'+|'+$/g, "").trim();
    const normalizedHeader = cleanHeader(componentId);

    if (!componentId || COMPONENT_INPUT_HEADERS.has(normalizedHeader)) continue;
    totalCount += 1;

    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{2,39}$/.test(componentId)) {
      ignoredCount += 1;
      continue;
    }

    const componentKey = componentId.toLowerCase();
    if (seen.has(componentKey)) {
      duplicateCount += 1;
      continue;
    }

    seen.add(componentKey);
    componentIds.push(componentId);
  }

  return { totalCount, componentIds, duplicateCount, ignoredCount };
}

function escapeSOQLString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function formatSOQLValues(values: string[]): string {
  return values.map((value) => "    '" + escapeSOQLString(value) + "'").join(",\n");
}

function buildChildDetailsParentSOQL(componentIds: string[]): string {
  if (componentIds.length === 0) return "";

  return [
    "SELECT Id,",
    "Component_Id__c,",
    "Parent.AccountId,",
    "ParentId,",
    "RecordTypeId",
    "FROM Asset",
    "WHERE RecordType.Name = 'Component' and Component_Id__c IN (",
    formatSOQLValues(componentIds),
    ")",
  ].join("\n");
}

function getRowValue(row: Record<string, string>, headers: readonly string[]): string {
  for (const header of headers) {
    const value = row[header]?.trim();
    if (value) return value;
  }

  return "";
}

function hasAnyHeader(headers: string[], candidates: readonly string[]): boolean {
  return candidates.some((candidate) => headers.includes(candidate));
}

function quoteCSVCell(value: string): string {
  return '"' + value.replace(/"/g, '""') + '"';
}

function buildCSVRow(values: string[]): string {
  return values.map(quoteCSVCell).join(",");
}

function buildTSVRow(values: string[]): string {
  return values.map(quoteCSVCell).join("\t");
}

function getSalesforceRecordKey(value: string): string {
  return value.slice(0, 15).toLowerCase();
}

function transformChildDetailsToParent(
  componentIds: string[],
  sourceResult: string
): ChildDetailsParentTransformResult {
  const parsed = parseSOQLResultWithHeaders(sourceResult);
  const requiredColumns = [
    { label: "Id", headers: ["id"] },
    { label: "Component_Id__c", headers: CHILD_DETAILS_COMPONENT_ID_HEADERS },
    { label: "Parent.AccountId", headers: CHILD_DETAILS_PARENT_ACCOUNT_ID_HEADERS },
  ];
  const result: ChildDetailsParentTransformResult = {
    output: "",
    sourceRows: parsed.rows.length,
    returnedComponentCount: 0,
    generatedRows: 0,
    skippedRows: 0,
    duplicateRows: 0,
    unexpectedComponentRows: 0,
    missingComponentIdRows: 0,
    missingAssetIdRows: 0,
    missingParentAccountIdRows: 0,
    invalidAssetIdRows: 0,
    invalidParentAccountIdRows: 0,
    conflictingAssetIds: [],
    missingComponentIds: [],
    missingHeaders: requiredColumns
      .filter((column) => !hasAnyHeader(parsed.headers, column.headers))
      .map((column) => column.label),
  };

  if (result.missingHeaders.length > 0) return result;

  const requestedComponents = new Map<string, string>();
  for (const componentId of componentIds) {
    const componentKey = componentId.toLowerCase();
    if (!requestedComponents.has(componentKey)) {
      requestedComponents.set(componentKey, componentId);
    }
  }

  type Candidate = {
    assetId: string;
    assetKey: string;
    parentAccountId: string;
    accountKey: string;
  };

  const returnedComponentKeys = new Set<string>();
  const candidatesByComponent = new Map<string, Candidate[]>();
  const candidateByAsset = new Map<string, Candidate>();
  const conflictingAssetKeys = new Set<string>();

  for (const sourceRow of parsed.rows) {
    const componentId = getRowValue(sourceRow, CHILD_DETAILS_COMPONENT_ID_HEADERS);
    if (!componentId) {
      result.missingComponentIdRows += 1;
      continue;
    }

    const componentKey = componentId.toLowerCase();
    if (!requestedComponents.has(componentKey)) {
      result.unexpectedComponentRows += 1;
      continue;
    }

    returnedComponentKeys.add(componentKey);

    const assetId = getRowValue(sourceRow, ["id"]);
    if (!assetId) {
      result.missingAssetIdRows += 1;
      continue;
    }
    if (!SALESFORCE_ID_REGEX.test(assetId)) {
      result.invalidAssetIdRows += 1;
      continue;
    }

    const parentAccountId = getRowValue(sourceRow, CHILD_DETAILS_PARENT_ACCOUNT_ID_HEADERS);
    if (!parentAccountId) {
      result.missingParentAccountIdRows += 1;
      continue;
    }
    if (!SALESFORCE_ID_REGEX.test(parentAccountId)) {
      result.invalidParentAccountIdRows += 1;
      continue;
    }

    const assetKey = getSalesforceRecordKey(assetId);
    const accountKey = getSalesforceRecordKey(parentAccountId);
    const existingCandidate = candidateByAsset.get(assetKey);
    if (existingCandidate) {
      if (existingCandidate.accountKey === accountKey) {
        result.duplicateRows += 1;
      } else {
        conflictingAssetKeys.add(assetKey);
      }
      continue;
    }

    const candidate: Candidate = {
      assetId,
      assetKey,
      parentAccountId,
      accountKey,
    };
    candidateByAsset.set(assetKey, candidate);
    const componentCandidates = candidatesByComponent.get(componentKey) ?? [];
    componentCandidates.push(candidate);
    candidatesByComponent.set(componentKey, componentCandidates);
  }

  const processedComponentKeys = new Set<string>();
  const outputRows = [
    buildCSVRow(["_", "Id", "AccountId", "ParentId", "RecordTypeId"]),
  ];

  for (const componentId of componentIds) {
    const componentKey = componentId.toLowerCase();
    if (processedComponentKeys.has(componentKey)) continue;
    processedComponentKeys.add(componentKey);

    for (const candidate of candidatesByComponent.get(componentKey) ?? []) {
      if (conflictingAssetKeys.has(candidate.assetKey)) continue;
      outputRows.push(
        buildCSVRow([
          "[Asset]",
          candidate.assetId,
          candidate.parentAccountId,
          "",
          CHILD_DETAILS_PARENT_TARGET_RECORD_TYPE_ID,
        ])
      );
      result.generatedRows += 1;
    }
  }

  for (const [componentKey, componentId] of requestedComponents) {
    if (!returnedComponentKeys.has(componentKey)) {
      result.missingComponentIds.push(componentId);
    }
  }

  for (const assetKey of conflictingAssetKeys) {
    const candidate = candidateByAsset.get(assetKey);
    if (candidate) result.conflictingAssetIds.push(candidate.assetId);
  }

  result.returnedComponentCount = returnedComponentKeys.size;
  result.skippedRows = Math.max(0, result.sourceRows - result.generatedRows);
  result.output = outputRows.join("\n");

  return result;
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

function buildCancellationCanceledOutput(rows: CancellationExecutionRow[]): string {
  const outputRows = [buildTSVRow(["_", "Id", "Ticket_Number_Read_Only__c", "Status"])];

  for (const row of rows) {
    outputRows.push(buildTSVRow(["[WorkOrder]", row.id, row.ticket, "Canceled"]));
  }

  return outputRows.join("\n");
}

function buildCaseAssignmentRows(input: string): CaseAssignmentRow[] {
  if (!input || !input.trim()) return [];

  const rows: CaseAssignmentRow[] = [];
  const seen = new Set<string>();
  
  const lines = input.split('\n');
  for (const line of lines) {
    for (const match of line.matchAll(CASE_ID_REGEX)) {
      const caseId = match[1];
      const recordKey = caseId?.slice(0, 15);
      if (!caseId || !recordKey || seen.has(recordKey)) continue;
      seen.add(recordKey);

      let openedDate: number | undefined = undefined;
      // Extract date: DD/MM/YYYY or YYYY-MM-DD
      const dateMatch = line.match(/\b(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})\b/);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]!, 10);
        const month = parseInt(dateMatch[2]!, 10) - 1;
        const year = parseInt(dateMatch[3]!, 10);
        openedDate = new Date(year, month, day).getTime();
      } else {
        const isoMatch = line.match(/\b(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})\b/);
        if (isoMatch) {
          const year = parseInt(isoMatch[1]!, 10);
          const month = parseInt(isoMatch[2]!, 10) - 1;
          const day = parseInt(isoMatch[3]!, 10);
          openedDate = new Date(year, month, day).getTime();
        }
      }
      
      rows.push({ id: caseId, status: "Open", openedDate });
    }
  }
  return rows;
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

function getSecureRandomIndex(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const maxUint32 = 0x1_0000_0000;
    const limit = Math.floor(maxUint32 / maxExclusive) * maxExclusive;
    const buffer = new Uint32Array(1);
    let value = 0;

    do {
      crypto.getRandomValues(buffer);
      value = buffer[0] ?? 0;
    } while (value >= limit);

    return value % maxExclusive;
  }

  return Math.floor(Math.random() * maxExclusive);
}

function shuffleItems<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = getSecureRandomIndex(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!];
  }

  return shuffled;
}

function buildBalancedAssignments(
  rows: CaseAssignmentRow[],
  owners: CaseOwner[],
  roundRobinPointer?: number
): CaseAssignmentResult {
  const isRoundRobin = roundRobinPointer !== undefined;
  
  const groups = new Map<string, CaseAssignmentRow[]>();
  rows.forEach(r => {
    const cat = r.category || 'none';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(r);
  });
  
  const shuffledRows: CaseAssignmentRow[] = [];
  const categories = Array.from(groups.keys()).sort((a, b) => {
    if (a === 'none') return 1;
    if (b === 'none') return -1;
    return a.localeCompare(b);
  });
  for (const cat of categories) {
    const sortedGroup = [...groups.get(cat)!].sort((a, b) => {
      const aDate = a.openedDate ?? Infinity;
      const bDate = b.openedDate ?? Infinity;
      return aDate - bDate;
    });
    shuffledRows.push(...sortedGroup);
  }
  
  const shuffledOwners = isRoundRobin ? owners : shuffleItems(owners);

  if (owners.length === 0) {
    return {
      output: buildCaseAssignmentOutput([]),
      assignedCount: 0,
      unassignedCaseIds: rows.map(r => r.id),
      ownerCount: 0,
      casesPerOwner: 0,
    };
  }

  const casesPerOwner = Math.floor(rows.length / owners.length);
  const remainder = isRoundRobin ? (rows.length % owners.length) : 0;
  const totalToAssign = (casesPerOwner * owners.length) + remainder;

  const assignments: Array<{ row: CaseAssignmentRow; owner: Pick<CaseOwner, "ownerId"> }> = [];
  
  const extraOwners: CaseOwner[] = [];
  let nextPointer = roundRobinPointer ?? 0;
  let startOwner: CaseOwner | undefined;
  let nextStartOwner: CaseOwner | undefined;

  if (isRoundRobin) {
    const startIndex = roundRobinPointer % owners.length;
    startOwner = owners[startIndex];
    
    for (let i = 0; i < remainder; i++) {
      extraOwners.push(owners[(startIndex + i) % owners.length]!);
    }
    
    nextPointer = (startIndex + remainder) % owners.length;
    nextStartOwner = owners[nextPointer];
  }

  let rPtr = isRoundRobin ? (roundRobinPointer % owners.length) : 0;
  for (let i = 0; i < totalToAssign; i++) {
     const owner = shuffledOwners[rPtr % shuffledOwners.length]!;
     assignments.push({ row: shuffledRows[i]!, owner });
     rPtr++;
  }

  return {
    output: buildCaseAssignmentOutput(assignments),
    assignedCount: assignments.length,
    unassignedCaseIds: shuffledRows.slice(totalToAssign).map((row) => row.id),
    ownerCount: owners.length,
    casesPerOwner,
    remainder,
    extraOwners,
    startOwner,
    nextStartOwner,
    nextPointer,
  };
}

function buildQuantityWiseAssignments(
  rows: CaseAssignmentRow[],
  ownerConfigs: QuantityOwnerConfig[]
): { result?: CaseAssignmentResult; error?: string } {
  if (!rows.length) return { error: "No Case IDs found" };

  const selectedOwners = ownerConfigs.filter((owner) => owner.selected).map((owner) => ({
    ownerId: owner.ownerId,
    quantity: Number(owner.quantity || 0),
  }));

  if (!selectedOwners.length) {
    return { error: "Select at least one owner" };
  }

  if (selectedOwners.some((owner) => !Number.isSafeInteger(owner.quantity) || owner.quantity < 0)) {
    return { error: "Each quantity must be a whole number of zero or more" };
  }

  const totalQuantity = selectedOwners.reduce((sum, owner) => sum + owner.quantity, 0);
  if (totalQuantity > rows.length) {
    return { error: `Selected quantity (${totalQuantity}) cannot exceed ${rows.length} Case IDs` };
  }

  const groups = new Map<string, CaseAssignmentRow[]>();
  rows.forEach(r => {
    const cat = r.category || 'none';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(r);
  });
  
  const shuffledRows: CaseAssignmentRow[] = [];
  const categories = Array.from(groups.keys()).sort((a, b) => {
    if (a === 'none') return 1;
    if (b === 'none') return -1;
    return a.localeCompare(b);
  });
  for (const cat of categories) {
    const sortedGroup = [...groups.get(cat)!].sort((a, b) => {
      const aDate = a.openedDate ?? Infinity;
      const bDate = b.openedDate ?? Infinity;
      return aDate - bDate;
    });
    shuffledRows.push(...sortedGroup);
  }

  const assignments: Array<{ row: CaseAssignmentRow; owner: { ownerId: string } }> = [];
  let rowIndex = 0;

  const remainingNeeds = selectedOwners.map(o => ({ ownerId: o.ownerId, qty: o.quantity }));
  
  while (rowIndex < totalQuantity) {
     let assignedInRound = false;
     for (const ownerNeed of remainingNeeds) {
        if (ownerNeed.qty > 0 && rowIndex < totalQuantity) {
           assignments.push({ row: shuffledRows[rowIndex]!, owner: { ownerId: ownerNeed.ownerId } });
           ownerNeed.qty--;
           rowIndex++;
           assignedInRound = true;
        }
     }
     if (!assignedInRound) break;
  }

  return {
    result: {
      output: buildCaseAssignmentOutput(assignments),
      assignedCount: assignments.length,
      unassignedCaseIds: shuffledRows.slice(rowIndex).map((row) => row.id),
      ownerCount: selectedOwners.length,
      casesPerOwner: 0,
    } satisfies CaseAssignmentResult,
  };
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


function transformStatus(tsv: string, newStatus: string, expectedType?: "WorkOrder" | "ServiceAppointment"): string {
  if (!tsv.trim()) return "";
  const lines = tsv.split(/\r?\n/);
  if (lines.length < 2) return tsv;

  if (expectedType) {
    const hasWrongType = lines.some((line, i) => {
      if (i === 0 || !line.trim()) return false;
      if (expectedType === "WorkOrder" && (line.includes("[ServiceAppointment]") || line.includes('"08p'))) return true;
      if (expectedType === "ServiceAppointment" && (line.includes("[WorkOrder]") || line.includes('"0WO'))) return true;
      return false;
    });

    if (hasWrongType) {
      return `ERROR: Invalid data pasted.

You pasted the wrong record type. Please ensure you are pasting ${expectedType} results.`;
    }
  }


  const delimiter = tsv.includes('\t') ? '\t' : (tsv.includes(',') ? ',' : '\t');
  
  const headers = (lines[0] || '').split(delimiter).map(h => h.replace(/^"|"$/g, '').trim());
  const statusIdx = headers.findIndex(h => h.toLowerCase() === 'status');
  
  if (statusIdx === -1) return tsv;
  
  const result = [lines[0]];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    
    const cols = line.split(delimiter);
    if (cols.length > statusIdx) {
      const oldVal = cols[statusIdx];
      const hasQuotes = (oldVal || '').startsWith('"') && (oldVal || '').endsWith('"');
      cols[statusIdx] = hasQuotes ? `"${newStatus}"` : newStatus;
    }
    result.push(cols.join(delimiter));
  }
  
  return result.join('\n');
}

function PasteResultCard({
  title,
  subtitle,
  value,
  onChange,
  transformedValue,
  onCopy,
  className,
  step
}: {
  className?: string;
  title: string;
  subtitle: string;
  value: string;
  onChange: (val: string) => void;
  transformedValue: string;
  onCopy: (val: string) => void;
  step?: string;
}) {
  return (
    <Card className={`overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 group relative ${className || 'h-[500px] xl:h-[calc(100vh-120px)] min-h-[350px]'}`}>
      {step && (
        <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
          <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
            {step}
          </span>
        </div>
      )}
      <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
        <div className={`flex flex-row flex-wrap gap-4 items-start justify-between`}>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-3">
              <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground flex-1">{title}</CardTitle>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-5 md:mt-6">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
              onClick={() => { onChange(""); }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
            <MagneticButton
              className="h-8 px-3 gap-2 text-xs font-bold bg-emerald-50 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg shadow-sm backdrop-blur-md"
              onClick={() => onCopy(transformedValue)}
              glowColor="rgba(16, 185, 129, 0.15)"
            >
              <Copy className="h-3.5 w-3.5" /> Copy Output
            </MagneticButton>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1 flex flex-col min-h-0 gap-4 relative z-10 overflow-hidden">
        <textarea
          className="flex-1 min-h-0 w-full rounded-2xl border border-slate-200/50 bg-white/50 dark:bg-white/[0.02] dark:border-white/5 p-4 text-[13px] font-mono leading-relaxed text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all shadow-inner custom-scrollbar"
          placeholder="Paste CSV from Salesforce Inspector here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value.trim() && (
          <div className="flex-1 min-h-0 w-full rounded-2xl border border-indigo-200/50 bg-indigo-50/30 dark:bg-indigo-900/10 dark:border-indigo-500/20 p-4 overflow-auto shadow-inner relative">
            <div className="absolute top-2 right-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/70 dark:text-indigo-400/50">OUTPUT</span>
            </div>
            <SOQLHighlighter query={transformedValue} className="font-mono text-[13px] leading-relaxed text-slate-800 dark:text-sky-200/90 custom-scrollbar whitespace-pre-wrap break-words" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}


function QueryPreviewCard({
  title,
  subtitle,
  batches,
  batchIndex,
  setBatchIndex,
  onCopy,
  isExample,
  step,
  className
}: {
  className?: string;
  title: string;
  subtitle: string;
  batches: string[];
  batchIndex: number;
  setBatchIndex: React.Dispatch<React.SetStateAction<number>>;
  onCopy: (value: string) => void;
    isExample?: boolean;
    step?: string;
  }) {
  const currentBatch = batches[batchIndex] ?? "";

  return (
    <Card className={`overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 group relative ${className || 'h-[500px] xl:h-[calc(100vh-120px)] min-h-[350px]'}`}>
      {step && (
        <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
          <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
            {step}
          </span>
        </div>
      )}

      <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
        <div className={`flex flex-row flex-wrap gap-4 items-start justify-between`}>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-3">
              <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground flex-1">{title}</CardTitle>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-5 md:mt-6">
            <span className="font-black uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400">
              {batches.length} batch{batches.length === 1 ? "" : "es"}
            </span>

            {batches.length > 1 && (
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-white/[0.05] rounded-lg p-0.5 shadow-sm border border-slate-200 dark:border-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-md"
                  disabled={batchIndex <= 0}
                  onClick={() => setBatchIndex((value) => Math.max(0, value - 1))}
                  title="Previous Batch"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-[10px] font-mono font-black px-2 text-slate-600 dark:text-slate-300">
                  {batchIndex + 1} / {batches.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-md"
                  disabled={batchIndex >= batches.length - 1}
                  onClick={() => setBatchIndex((value) => Math.min(batches.length - 1, value + 1))}
                  title="Next Batch"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
                onClick={() => onCopy(currentBatch)}
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>

              {batches.length > 1 && (
                <MagneticButton
                  className="h-8 px-3 gap-2 text-xs font-bold bg-indigo-500/10 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg shadow-sm"
                  onClick={() => onCopy(batches.join("\n\n"))}
                  glowColor="rgba(99, 102, 241, 0.15)"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy All
                </MagneticButton>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">
        {batches.length > 0 ? (
          <div className="rounded-2xl text-foreground flex flex-col min-h-0 flex-1 overflow-hidden relative bg-transparent border-transparent shadow-none transition-all duration-300 group/glass">
            <div className="relative flex-1 min-h-0">
                    <SOQLHighlighter query={currentBatch} className="h-full overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-[13px] leading-relaxed text-slate-700 selection:bg-indigo-500/20 selection:text-indigo-900 dark:text-sky-200/90 dark:selection:text-indigo-100 custom-scrollbar" />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl bg-slate-50/50 dark:bg-white/[0.02]">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {isExample ? "No valid tickets parsed" : "No queries generated"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TemplatePicker({
  templates,
  value,
  onChange,
}: {
  templates: Template[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedId, setHighlightedId] = React.useState(value);
  const [menuPosition, setMenuPosition] = React.useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
    maxHeight: number;
  } | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const listboxId = React.useId();
  const selectedTemplate = templates.find((template) => template.id === value);
  const builtInTemplates = templates.filter((template) => template.source !== "library");
  const savedTemplates = templates.filter((template) => template.source === "library");

  const updateMenuPosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const gap = 8;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const spaceAbove = rect.top - viewportPadding;
    const opensBelow = spaceBelow >= 260 || spaceBelow >= spaceAbove;
    const availableHeight = Math.max(180, Math.min(460, (opensBelow ? spaceBelow : spaceAbove) - gap));

    setMenuPosition({
      left: Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - rect.width - viewportPadding)),
      width: Math.min(rect.width, window.innerWidth - viewportPadding * 2),
      ...(opensBelow ? { top: rect.bottom + gap } : { bottom: window.innerHeight - rect.top + gap }),
      maxHeight: availableHeight,
    });
  }, []);

  const closeMenu = React.useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const openMenu = React.useCallback(() => {
    setHighlightedId(value);
    updateMenuPosition();
    setIsOpen(true);
  }, [updateMenuPosition, value]);

  const selectTemplate = React.useCallback(
    (templateId: string) => {
      onChange(templateId);
      setHighlightedId(templateId);
      closeMenu(true);
    },
    [closeMenu, onChange]
  );

  React.useEffect(() => {
    if (!templates.some((template) => template.id === highlightedId)) {
      setHighlightedId(value);
    }
  }, [highlightedId, templates, value]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        closeMenu();
      }
    };
    const handleViewportChange = () => updateMenuPosition();

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [closeMenu, isOpen, updateMenuPosition]);

  const moveHighlight = (direction: 1 | -1) => {
    const currentIndex = Math.max(0, templates.findIndex((template) => template.id === highlightedId));
    const nextIndex = (currentIndex + direction + templates.length) % templates.length;
    setHighlightedId(templates[nextIndex]?.id ?? value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) openMenu();
      moveHighlight(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!isOpen) openMenu();
      setHighlightedId(event.key === "Home" ? templates[0]?.id ?? value : templates.at(-1)?.id ?? value);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isOpen) selectTemplate(highlightedId);
      else openMenu();
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeMenu();
    }
  };

  const renderTemplate = (template: Template) => {
    const isSelected = template.id === value;
    const isHighlighted = template.id === highlightedId;
    const isLibraryTemplate = template.source === "library";

    return (
      <button
        key={template.id}
        id={`${listboxId}-${template.id}`}
        type="button"
        role="option"
        aria-selected={isSelected}
        onClick={() => selectTemplate(template.id)}
        onMouseEnter={() => setHighlightedId(template.id)}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
          isSelected
            ? "bg-blue-500/10 text-blue-950 shadow-[inset_0_0_0_1px_rgba(1,118,211,0.32)] dark:bg-blue-500/20 dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(96,182,255,0.38)]"
            : isHighlighted
              ? "bg-sky-500/10 text-blue-950 dark:bg-sky-400/10 dark:text-sky-50"
              : "text-slate-700 hover:bg-sky-500/10 hover:text-blue-950 dark:text-slate-300 dark:hover:bg-sky-400/10 dark:hover:text-sky-50"
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
            isSelected
              ? "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:border-blue-300/30 dark:bg-blue-400/15 dark:text-sky-200"
              : "border-slate-200 bg-white/70 text-slate-500 group-hover:border-sky-500/30 group-hover:text-blue-600 dark:border-slate-700/80 dark:bg-slate-800/75 dark:text-slate-400 dark:group-hover:border-sky-400/20 dark:group-hover:text-sky-300"
          )}
        >
          {isLibraryTemplate ? <Bookmark className="h-3.5 w-3.5" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] md:text-xs font-bold leading-tight whitespace-normal pr-1">{template.name}</span>
          <span className={cn("mt-1 block truncate text-[10px] font-semibold uppercase tracking-[0.12em]", isSelected ? "text-blue-600 dark:text-sky-200/80" : "text-slate-500 group-hover:text-blue-500 dark:group-hover:text-sky-200/70")}>
            {template.category}
          </span>
        </span>
        {isSelected && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_0_12px_rgba(96,182,255,0.3)] dark:bg-blue-400 dark:text-slate-950">
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm transition-all duration-300 backdrop-blur-md",
          isOpen
            ? "border-white/30 bg-white/20 text-slate-900 ring-2 ring-white/20 dark:bg-black/40 dark:border-white/20 dark:text-white"
            : "border-slate-300/40 bg-white/10 text-slate-900 hover:border-white/60 hover:bg-white/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100 dark:hover:bg-white/[0.08]"
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:text-blue-300">
          {selectedTemplate?.source === "library" ? <Bookmark className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold leading-tight whitespace-normal">{selectedTemplate?.name ?? "Select a template"}</span>
          <span className="mt-1 block truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {selectedTemplate?.source === "library" ? "Saved template" : selectedTemplate?.category ?? "Choose a query type"}
          </span>
        </span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 group-hover:text-blue-600 dark:group-hover:text-sky-300", isOpen && "rotate-180 text-blue-600 dark:text-sky-300")} />
      </button>

      {isOpen && menuPosition && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/[0.98] p-1.5 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.16),0_0_0_1px_rgba(1,118,211,0.08)] backdrop-blur-2xl dark:border-slate-600/80 dark:bg-[#071426]/[0.98] dark:text-slate-100 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(96,182,255,0.08)]"
            style={{
              left: menuPosition.left,
              minWidth: menuPosition.width, maxWidth: 'calc(100vw - 24px)', width: 'max-content',
              top: menuPosition.top,
              bottom: menuPosition.bottom,
              maxHeight: menuPosition.maxHeight,
            }}
          >
            
            <div
              id={listboxId}
              role="listbox"
              aria-label="Query templates"
              className="space-y-1 overflow-y-auto p-1.5"
              style={{ maxHeight: Math.max(120, menuPosition.maxHeight - 58) }}
            >
              {builtInTemplates.length > 0 && (
                <div className="pb-1 pt-1.5">
                  <span className="px-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Built-in templates</span>
                </div>
              )}
              {builtInTemplates.map(renderTemplate)}
              {savedTemplates.length > 0 && (
                <>
                  <div className="my-1.5 border-t border-slate-200/80 dark:border-slate-700/70" />
                  <div className="flex items-center gap-2 px-2 pb-1 pt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-600 dark:text-amber-300/80">
                    <Bookmark className="h-3 w-3" /> Saved templates
                  </div>
                  {savedTemplates.map(renderTemplate)}
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default function SOQLGeneratorPage() {
  const [tsResultPaste, setTsResultPaste] = React.useState("");
  const [saResultPaste, setSaResultPaste] = React.useState("");
  const [templates, setTemplates] = React.useState<Template[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>("13");
  const [libraryLoadState, setLibraryLoadState] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [ticketsInput, setTicketsInput] = React.useState("");
  const [favourites, setFavourites] = React.useState<Set<string>>(new Set(["1"]));
  const [tsBatchIndex, setTsBatchIndex] = React.useState(0);
  const [saBatchIndex, setSaBatchIndex] = React.useState(0);
  const [otherBatchIndex, setOtherBatchIndex] = React.useState(0);
  const [generatedAtLeastOnce, setGeneratedAtLeastOnce] = React.useState(false);

  const [assetTransferInput, setAssetTransferInput] = React.useState("");
  const [assetSOQLResult, setAssetSOQLResult] = React.useState("");
  const [accountSOQLResult, setAccountSOQLResult] = React.useState("");

  const [childDetailsInput, setChildDetailsInput] = React.useState("");
  const customChildDetailsProcessor = React.useMemo(() => {
    if (!childDetailsInput.trim()) return { output: "", count: 0, skipped: 0, debug: "" };
    
    const lines = childDetailsInput.trim().split("\n");
    const outputLines = [];
    outputLines.push(`"_"	"Id"	"AccountId"	"ParentId"	"RecordTypeId"`);
    
    let count = 0;
    let skipped = 0;
    let debug = "";
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || !line.trim()) continue;
      
      const cols = line.split("\t");
      if (cols.length < 6) {
        skipped++;
        debug += `❌ Line ${i + 1}: Expected 6 columns, found ${cols.length}\n`;
        continue;
      }
      
      const underscore = cols[0] || "";
      const id = cols[1] || "";
      const accountId = cols[4] || "";
      
      if (underscore.includes("_") && id.includes("Id")) {
        continue;
      }
      
      if (!underscore.toLowerCase().includes("asset")) {
        skipped++;
        debug += `❌ Line ${i + 1}: Validation Error - Not an Asset record (Found: ${underscore})\n`;
        continue;
      }
      
      const parentId = '""';
      const recordTypeId = '"012Ny0000003SvrIAE"';
      outputLines.push(`${underscore}\t${id}\t${accountId}\t${parentId}\t${recordTypeId}`);
      
      count++;
      debug += `✅ Mapped: ${id} -> ${accountId}\n`;
    }
    
    return { 
      output: outputLines.join("\n"), 
      count, 
      skipped, 
      debug: debug || "Processing completed." 
    };
  }, [childDetailsInput]);

  const [transferOutput, setTransferOutput] = React.useState("");
  const [transferDebug, setTransferDebug] = React.useState("");

  const [childDetailsComponentInput, setChildDetailsComponentInput] = React.useState("");
  const [childDetailsSOQLResult, setChildDetailsSOQLResult] = React.useState("");
  const [childDetailsOutput, setChildDetailsOutput] = React.useState("");
  const [childDetailsTransformResult, setChildDetailsTransformResult] =
    React.useState<ChildDetailsParentTransformResult | null>(null);
  const [childDetailsBatchIndex, setChildDetailsBatchIndex] = React.useState(0);

  const [cancellationExecutionInput, setCancellationExecutionInput] = React.useState("");
  const [cancellationFailedInput, setCancellationFailedInput] = React.useState("");
  const [cancellationType, setCancellationType] = React.useState<"CCO" | "NAMO" | "NON NAMO" | "CASE">("CCO");
  const [batchSize, setBatchSize] = React.useState(400);
  const [cancellationStoredRows, setCancellationStoredRows] = React.useState<CancellationExecutionRow[]>([]);
  const [cancellationExecutionBatchIndex, setCancellationExecutionBatchIndex] = React.useState(0);

  const [caseAssignOutput, setCaseAssignOutput] = React.useState("");
  const [caseAssignmentResult, setCaseAssignmentResult] = React.useState<CaseAssignmentResult | null>(null);
  const [caseAssignMode, setCaseAssignMode] = React.useState<CaseAssignMode>("equal");
  const [roundRobinPointer, setRoundRobinPointer] = React.useState<number>(0);
  const [roundRobinHistory, setRoundRobinHistory] = React.useState<RoundRobinHistoryEntry[]>([]);
  const [cumulativeLoad, setCumulativeLoad] = React.useState<CumulativeLoadMap>({});
  const [caseOwners, setCaseOwners] = React.useState<CaseOwner[]>([]);
  const [caseOwnerLoadState, setCaseOwnerLoadState] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [caseOwnerAction, setCaseOwnerAction] = React.useState<string | null>(null);
  const [selectedOwnerIds, setSelectedOwnerIds] = React.useState<string[]>([]);
  const [quantityOwnerConfigs, setQuantityOwnerConfigs] = React.useState<QuantityOwnerConfig[]>([]);
  const [ownerForm, setOwnerForm] = React.useState({ name: "", ownerId: "" });
  const [editingOwnerRecordId, setEditingOwnerRecordId] = React.useState<string | null>(null);

  const [uploadState, setUploadState] = React.useState<"idle" | "reading" | "scanning" | "validating" | "success" | "error">("idle");
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadSummary, setUploadSummary] = React.useState<{ file: string; scannedLines: number; total: number; unique: number; valid: number; missing: number; } | null>(null);
  const [missingCases, setMissingCases] = React.useState<string[]>([]);
  const [autoRunPending, setAutoRunPending] = React.useState(false);

  
  const dragCounterRef = React.useRef(0);

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
  const isAssetTransfer = selectedTemplate === "3" || (activeTemplate?.source !== "library" && (activeTemplate?.name?.toLowerCase()?.includes("transfer") ?? false)) || (activeTemplate?.type === "asset-transfer");
  const isChildDetailsToParent =
    selectedTemplate === "20" || activeTemplate?.type === "child-details-to-parent";
  const isCaseAssign = selectedTemplate === "4";
  const isCancellation = selectedTemplate === "13" || selectedTemplate === "14" || selectedTemplate === "19" || (activeTemplate?.name?.toLowerCase()?.includes("cancellation") ?? false) || (activeTemplate?.name?.toLowerCase()?.includes("cancel") ?? false);
  const isUpdateAcceptedAndNone = selectedTemplate === "1" || (activeTemplate?.name?.toLowerCase()?.includes("update accepted and none") ?? false);

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

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedPointer = localStorage.getItem("caseAssignmentRoundRobin");
        if (storedPointer) setRoundRobinPointer(parseInt(storedPointer, 10) || 0);

        const storedHistory = localStorage.getItem("caseAssignmentHistory");
        if (storedHistory) setRoundRobinHistory(JSON.parse(storedHistory));

        const storedLoad = localStorage.getItem("caseAssignmentCumulativeLoad");
        if (storedLoad) setCumulativeLoad(JSON.parse(storedLoad));
      } catch (e) {
        console.error("Failed to parse round robin localStorage state", e);
      }
    }
  }, []);

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

  const activeCaseOwners = React.useMemo(() => {
    const ownerIds = new Set<string>();
    return caseOwners.filter((owner) => {
      const normalizedOwnerId = owner.ownerId.trim();
      if (!owner.isActive || !normalizedOwnerId || ownerIds.has(normalizedOwnerId)) return false;
      ownerIds.add(normalizedOwnerId);
      return true;
    });
  }, [caseOwners]);

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
    return formatSOQLValues(tickets);
  }, []);

  const parsedCaseIds = React.useMemo(() => parseCaseIds(ticketsInput), [ticketsInput]);
  const parsedTickets = React.useMemo(
    () => (isCaseAssign ? parsedCaseIds : parseTickets(ticketsInput)),
    [isCaseAssign, parseTickets, parsedCaseIds, ticketsInput]
  );
  const inputBatchSize = batchSize;
  const inputBatchCount = parsedTickets.length > 0 ? Math.ceil(parsedTickets.length / inputBatchSize) : 0;
  const ticketStats = React.useMemo(() => getTicketStats(parsedTickets), [parsedTickets]);
  const assetPairs = React.useMemo(() => parseAssetTransferPairs(assetTransferInput), [assetTransferInput]);
  const childDetailsComponentParse = React.useMemo(
    () => parseComponentIds(childDetailsComponentInput),
    [childDetailsComponentInput]
  );
  const childDetailsComponentIds = childDetailsComponentParse.componentIds;
  const cancellationExecutionRows = React.useMemo(
    () => parseCancellationExecutionRows(cancellationExecutionInput),
    [cancellationExecutionInput]
  );

  const executableCancellationRows = React.useMemo(
    () => cancellationStoredRows,
    [cancellationStoredRows]
  );

  const skippedCancellationRows = React.useMemo(
    () => cancellationExecutionRows.filter((row) => !SALESFORCE_ID_REGEX.test(row.id)),
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

  const cancellationCanceledOutput = React.useMemo(
    () => buildCancellationCanceledOutput(uniqueExecutableCancellationRows),
    [uniqueExecutableCancellationRows]
  );

  const cancellationStoredTicketKeys = React.useMemo(
    () => new Set(uniqueExecutableCancellationRows.map((row) => row.ticket.trim().toLowerCase()).filter(Boolean)),
    [uniqueExecutableCancellationRows]
  );
  const cancellationRequestedTicketKeys = React.useMemo(
    () => new Set(parsedTickets.map((ticket) => ticket.trim().toLowerCase()).filter(Boolean)),
    [parsedTickets]
  );
  const cancellationMatchedTicketCount = React.useMemo(() => {
    let matchedCount = 0;
    cancellationRequestedTicketKeys.forEach((ticket) => {
      if (cancellationStoredTicketKeys.has(ticket)) matchedCount += 1;
    });
    return matchedCount;
  }, [cancellationRequestedTicketKeys, cancellationStoredTicketKeys]);
  const cancellationUnexpectedResultCount = React.useMemo(() => {
    let unexpectedCount = 0;
    cancellationStoredTicketKeys.forEach((ticket) => {
      if (!cancellationRequestedTicketKeys.has(ticket)) unexpectedCount += 1;
    });
    return unexpectedCount;
  }, [cancellationRequestedTicketKeys, cancellationStoredTicketKeys]);
  const cancellationRemainingTicketCount = Math.max(0, parsedTickets.length - cancellationMatchedTicketCount);

  const cancellationResultBatchCount =
    uniqueExecutableCancellationRows.length > 0
      ? Math.ceil(uniqueExecutableCancellationRows.length / batchSize)
      : 0;

  const cancellationUpdateDebug = React.useMemo(() => {
    if (!cancellationExecutionRows.length) return "";

    const lines: string[] = [];
    lines.push(`Total parsed rows: ${cancellationExecutionRows.length}`);
    lines.push(`Ready for cancel execution: ${uniqueExecutableCancellationRows.length}`);
    lines.push(`Skipped rows: ${skippedCancellationRows.length}`);

    if (skippedCancellationRows.length > 0) {
      lines.push("");
      lines.push("Skipped rows because the WorkOrder Id is missing or invalid:");
      skippedCancellationRows.slice(0, 100).forEach((row) => {
        lines.push(`${row.ticket} | ${row.id} | ${row.status}`);
      });

      if (skippedCancellationRows.length > 100) {
        lines.push(`...and ${skippedCancellationRows.length - 100} more`);
      }
    }

    return lines.join("\n");
  }, [cancellationExecutionRows, uniqueExecutableCancellationRows, skippedCancellationRows]);

  const caseAssignmentRows = React.useMemo(() => buildCaseAssignmentRows(ticketsInput), [ticketsInput]);

  React.useEffect(() => {
    if (autoRunPending && ticketsInput && caseAssignmentRows.length > 0) {
      setAutoRunPending(false);
      // Wait a tick for React to fully commit state before triggering assignment 
      setTimeout(() => handleRunCaseAssignment(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRunPending, ticketsInput, caseAssignmentRows]);

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

  React.useEffect(() => {
    setCaseAssignOutput("");
    setCaseAssignmentResult(null);
  }, [caseAssignmentRows, caseAssignMode, activeCaseOwners, selectedOwnerIds, quantityOwnerConfigs]);

  const buildPreviewBatches = React.useCallback(
    (templateId: string) => {
      let templateSoql = "";
      if (templateId === "2") {
        templateSoql = `SELECT Id, Status
FROM ServiceAppointment
WHERE Work_Order__r.Status NOT IN ('Completed','Canceled','Cancellation Requested')
AND Work_Order__r.ParentWorkOrderId = null
AND Ticket_Numbers__c IN (
{{tickets}}
)`;
      } else {
        const template = templates.find((item) => item.id === templateId);
        if (!template) return [];
        templateSoql = template.soql;
      }

      if (parsedTickets.length === 0) {
        return [templateSoql.replace("{{tickets}}", "")];
      }

      const batches: string[] = [];
      for (let index = 0; index < parsedTickets.length; index += batchSize) {
        const chunk = parsedTickets.slice(index, index + batchSize);
        const formatted = formatTicketsForSOQL(chunk);
        const query = templateSoql.replace("{{tickets}}", formatted);
        batches.push(query);
      }

      return batches;
    },
    [formatTicketsForSOQL, parsedTickets, templates, batchSize]
  );

  const workOrderPreview = React.useMemo(() => buildPreviewBatches("1"), [buildPreviewBatches]);
  const serviceAppointmentPreview = React.useMemo(() => buildPreviewBatches("2"), [buildPreviewBatches]);
  const otherPreview = React.useMemo(() => buildPreviewBatches(selectedTemplate), [buildPreviewBatches, selectedTemplate]);
  const cancellationQueryBatches = React.useMemo(() => {
    let templateSoql = "";
    if (cancellationType === "CCO") {
      templateSoql = `SELECT Id, Ticket_Number_Read_Only__c, Status\nFROM WorkOrder\nWHERE ParentWorkOrderId = null and Status not in ('Completed','Canceled') AND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)`;
    } else if (cancellationType === "NAMO") {
      templateSoql = `Select Id, Ticket_Number_Read_Only__c, Status from WorkOrder Where ParentWorkOrderId = null AND status not in ('Completed','Canceled') and Account.Group__c = 'NAMO' and Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)`;
    } else if (cancellationType === "NON NAMO") {
      templateSoql = `Select Id, Ticket_Number_Read_Only__c, Status from WorkOrder Where ParentWorkOrderId = null AND status not in ('Completed','Canceled') and Account.Group__c = 'NON NAMO' and Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)`;
    } else if (cancellationType === "CASE") {
      templateSoql = `SELECT Id, Status, CaseId, Case.Status, Case.Cancellation_Reason__c, Cancellation_Reason__c\nFROM WorkOrder\nWHERE ParentWorkOrderId = null AND Status != 'Completed' AND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)`;
    }

    if (parsedTickets.length === 0) {
      return [templateSoql.replace("{{tickets}}", "")];
    }

    return chunkArray(parsedTickets, batchSize).map((tickets) =>
      templateSoql.replace("{{tickets}}", formatTicketsForSOQL(tickets))
    );
  }, [formatTicketsForSOQL, parsedTickets, cancellationType, batchSize]);

  const assetTransferComponentSOQL = React.useMemo(() => {
    if (assetPairs.length === 0) return "";
    const componentIds = assetPairs.map((pair) => pair.componentId);
    const formatted = formatTicketsForSOQL(componentIds);

    return `SELECT Component_Id__c, Id, Account.Customer_ID__c, Record_Type__c, Parent.Id, Parent.Account.Id\nFROM Asset\nWHERE status != 'Draft' and Asset_Obligation__c != 'AMC' and Component_Id__c IN (\n${formatted}\n)`;
  }, [assetPairs, formatTicketsForSOQL]);

  const assetTransferAccountSOQL = React.useMemo(() => {
    if (assetPairs.length === 0) return "";
    const cids = [...new Set(assetPairs.map((pair) => pair.newCid))];
    const formatted = formatTicketsForSOQL(cids);

    return `SELECT Customer_ID__c, Id\nFROM Account\nWHERE Customer_ID__c IN (\n${formatted}\n)`;
  }, [assetPairs, formatTicketsForSOQL]);

  const childDetailsSOQLBatches = React.useMemo(
    () =>
      chunkArray(childDetailsComponentIds, batchSize).map((componentIds) =>
        buildChildDetailsParentSOQL(componentIds)
      ),
    [childDetailsComponentIds, batchSize]
  );
  const childDetailsCurrentSOQLBatch =
    childDetailsSOQLBatches[childDetailsBatchIndex] ?? childDetailsSOQLBatches[0] ?? "";
  const childDetailsValidationPreview = React.useMemo(() => {
    if (childDetailsComponentIds.length === 0 || !childDetailsSOQLResult.trim()) return null;
    return transformChildDetailsToParent(childDetailsComponentIds, childDetailsSOQLResult);
  }, [childDetailsComponentIds, childDetailsSOQLResult]);
  const childDetailsVisibleResult = childDetailsTransformResult ?? childDetailsValidationPreview;
  const childDetailsInvalidIdCount =
    (childDetailsVisibleResult?.invalidAssetIdRows ?? 0) +
    (childDetailsVisibleResult?.invalidParentAccountIdRows ?? 0);
  const childDetailsMissingParentAccountCount =
    (childDetailsVisibleResult?.missingParentAccountIdRows ?? 0) +
    (childDetailsVisibleResult?.invalidParentAccountIdRows ?? 0);
  const childDetailsValidationIssues = React.useMemo(() => {
    if (!childDetailsVisibleResult) return [];

    const issues: Array<{ label: string; tone: "danger" | "warning" }> = [];
    if (childDetailsVisibleResult.missingHeaders.length > 0) {
      issues.push({
        label: "Missing columns: " + childDetailsVisibleResult.missingHeaders.join(", "),
        tone: "danger",
      });
    }
    if (childDetailsVisibleResult.missingComponentIds.length > 0) {
      issues.push({
        label:
          childDetailsVisibleResult.missingComponentIds.length +
          " requested Component ID" +
          (childDetailsVisibleResult.missingComponentIds.length === 1 ? " is" : "s are") +
          " missing from the Salesforce result",
        tone: "warning",
      });
    }
    if (childDetailsVisibleResult.duplicateRows > 0) {
      issues.push({
        label:
          childDetailsVisibleResult.duplicateRows +
          " duplicate Asset row" +
          (childDetailsVisibleResult.duplicateRows === 1 ? " was" : "s were") +
          " skipped",
        tone: "warning",
      });
    }
    if (childDetailsVisibleResult.conflictingAssetIds.length > 0) {
      issues.push({
        label:
          childDetailsVisibleResult.conflictingAssetIds.length +
          " Asset ID" +
          (childDetailsVisibleResult.conflictingAssetIds.length === 1 ? " has" : "s have") +
          " conflicting Parent.AccountId values",
        tone: "danger",
      });
    }
    if (childDetailsInvalidIdCount > 0) {
      issues.push({
        label:
          childDetailsInvalidIdCount +
          " invalid Salesforce ID" +
          (childDetailsInvalidIdCount === 1 ? " was" : "s were") +
          " skipped",
        tone: "warning",
      });
    }
    if (childDetailsVisibleResult.missingParentAccountIdRows > 0) {
      issues.push({
        label:
          childDetailsVisibleResult.missingParentAccountIdRows +
          " row" +
          (childDetailsVisibleResult.missingParentAccountIdRows === 1 ? " is" : "s are") +
          " missing Parent.AccountId",
        tone: "warning",
      });
    }
    if (childDetailsVisibleResult.unexpectedComponentRows > 0) {
      issues.push({
        label:
          childDetailsVisibleResult.unexpectedComponentRows +
          " unexpected Component row" +
          (childDetailsVisibleResult.unexpectedComponentRows === 1 ? " was" : "s were") +
          " ignored",
        tone: "warning",
      });
    }

    return issues;
  }, [childDetailsInvalidIdCount, childDetailsVisibleResult]);

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

      const accountId = accountData[pair.newCid];
      if (!accountId) {
        missingCids.push(pair.newCid);
        debugLines.push(`❌ ${pair.componentId} → CID ${pair.newCid} not found in Account SOQL result`);
        continue;
      }

      if (isComponent) {
        const childAssetId = assetRow.id;
        const parentAssetId = assetRow["parent.id"] || assetRow.parentid || assetRow.parent_id;
        let added = false;
        const addedIds: string[] = [];

        if (parentAssetId) {
          rows.push(`"[Asset]","${parentAssetId}","${accountId}"`);
          addedIds.push(`${parentAssetId} (Parent.Id)`);
          added = true;
        }

        if (childAssetId && childAssetId !== parentAssetId) {
          rows.push(`"[Asset]","${childAssetId}","${accountId}"`);
          addedIds.push(`${childAssetId} (Child.Id)`);
          added = true;
        }

        if (!added) {
          debugLines.push(`❌ ${pair.componentId} → No valid asset ID found`);
          continue;
        }

        debugLines.push(`✅ ${pair.componentId} → ${addedIds.join(" & ")} | CID ${pair.newCid} → ${accountId}`);
      } else {
        const assetId = assetRow.id;
        if (!assetId) {
          debugLines.push(`❌ ${pair.componentId} → No valid asset ID found`);
          continue;
        }
        rows.push(`"[Asset]","${assetId}","${accountId}"`);
        debugLines.push(`✅ ${pair.componentId} → ${assetId} (Asset.Id) | CID ${pair.newCid} → ${accountId}`);
      }
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

  const handleProcessChildDetailsToParent = () => {
    if (childDetailsComponentIds.length === 0) {
      toast.error("Paste at least one valid Component ID first");
      return;
    }

    if (!childDetailsSOQLResult.trim()) {
      toast.error("Paste the Asset SOQL result first");
      return;
    }

    const transformResult = transformChildDetailsToParent(
      childDetailsComponentIds,
      childDetailsSOQLResult
    );
    setChildDetailsTransformResult(transformResult);

    if (transformResult.missingHeaders.length > 0) {
      setChildDetailsOutput("");
      toast.error(
        "Missing required result column" +
          (transformResult.missingHeaders.length === 1 ? ": " : "s: ") +
          transformResult.missingHeaders.join(", ")
      );
      return;
    }

    if (transformResult.generatedRows === 0) {
      setChildDetailsOutput("");
      toast.error("No import-ready Asset rows were found. Review the validation summary.");
      return;
    }

    setChildDetailsOutput(transformResult.output);
    const skippedMessage = transformResult.skippedRows
      ? " · " +
        transformResult.skippedRows +
        " row" +
        (transformResult.skippedRows === 1 ? "" : "s") +
        " skipped"
      : "";
    toast.success(
      "Generated " +
        transformResult.generatedRows +
        " parent-ready Asset row" +
        (transformResult.generatedRows === 1 ? "" : "s") +
        skippedMessage
    );
  };

  const handleDownloadChildDetailsQuery = () => {
    if (childDetailsSOQLBatches.length === 0) {
      toast.error("Paste at least one valid Component ID first");
      return;
    }

    downloadTextFile(
      "child-details-to-parent-query-" + Date.now() + ".soql",
      childDetailsSOQLBatches.join("\n\n"),
      "text/plain;charset=utf-8;"
    );
    toast.success("Child Details SOQL downloaded");
  };

  const handleDownloadChildDetailsToParent = () => {
    if (!childDetailsOutput.trim()) {
      toast.error("Generate the parent-ready Asset file first");
      return;
    }

    downloadTextFile(
      "child-details-to-parent-" + Date.now() + ".csv",
      childDetailsOutput,
      "text/csv;charset=utf-8;"
    );
    toast.success("Parent-ready Asset CSV downloaded");
  };

  const appendCancellationResultBatch = React.useCallback(
    (rawResult: string) => {
      const parsedRows = parseCancellationExecutionRows(rawResult);
      const validRows = parsedRows.filter((row) => SALESFORCE_ID_REGEX.test(row.id));

      if (validRows.length === 0) {
        toast.error("No valid WorkOrder rows found in the pasted Salesforce result");
        return;
      }

      const existingKeys = new Set(cancellationStoredRows.map((row) => getSalesforceRecordKey(row.id)));
      const nextRows = [...cancellationStoredRows];
      let addedRows = 0;
      let duplicateRows = 0;

      for (const row of validRows) {
        const rowKey = getSalesforceRecordKey(row.id);
        if (existingKeys.has(rowKey)) {
          duplicateRows += 1;
          continue;
        }

        existingKeys.add(rowKey);
        nextRows.push(row);
        addedRows += 1;
      }

      setCancellationStoredRows(nextRows);

      if (addedRows === 0) {
        toast.info("All pasted WorkOrder rows were already stored");
        return;
      }

      const duplicateMessage = duplicateRows
        ? " · " + duplicateRows + " duplicate" + (duplicateRows === 1 ? "" : "s") + " ignored"
        : "";
      toast.success(
        "Stored " +
          addedRows +
          " cancellation row" +
          (addedRows === 1 ? "" : "s") +
          " as Canceled" +
          duplicateMessage
      );
    },
    [cancellationStoredRows]
  );

  const handleCancellationResultPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = event.clipboardData.getData("text");
    if (!pastedText.trim()) return;

    event.preventDefault();
    setCancellationExecutionInput(pastedText);
    appendCancellationResultBatch(pastedText);
  };

  const handleCancellationResultInputChange = (value: string) => {
    setCancellationExecutionInput(value);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    dragCounterRef.current = 0;
    setIsDragging(false);
    let file: File | null = null;
    
    if ("dataTransfer" in event) {
      event.preventDefault();
      if (event.dataTransfer.items) {
        const item = event.dataTransfer.items[0];
        if (item?.kind === "file") file = item.getAsFile();
      } else {
        file = event.dataTransfer.files[0] ?? null;
      }
    } else {
      file = (event.target as HTMLInputElement).files?.[0] ?? null;
    }

    if (!file) return;

    if (file.size === 0) {
      toast.error("The uploaded file is empty.");
      setUploadState("error");
      return;
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".txt") && !name.endsWith(".xlsx") && !name.endsWith(".xls") && !name.endsWith(".tsv")) {
      toast.error("Unsupported file type. Please upload CSV, XLSX, XLS, or TXT.");
      setUploadState("error");
      return;
    }

    setUploadState("reading");
    
    try {
      const buffer = await file.arrayBuffer();
      let textContent = "";

      if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        try {
          const workbook = xlsx.read(buffer, { type: "array" });
          workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            if (sheet) {
              textContent += xlsx.utils.sheet_to_csv(sheet) + "\n";
            }
          });
        } catch (error) {
          console.warn("Excel parsing failed, falling back to raw text extraction:", error);
          textContent = await file.text();
        }
      } else {
        textContent = await file.text();
      }

      setUploadState("scanning");
      // Use existing parseCaseIds logic
      const extractedIds = parseCaseIds(textContent);
      const scannedLines = textContent.split(/\r\n|\n|\r/).length;
      
      if (extractedIds.length === 0) {
        toast.error("No valid Salesforce Case IDs were detected. Other text/data was ignored.");
        setUploadState("error");
        return;
      }

      setUploadState("validating");
      
      const validCases: string[] = [];
      const missingCaseIds: string[] = [];
      
      for (let i = 0; i < extractedIds.length; i += 400) {
        const batch = extractedIds.slice(i, i + 400);
        try {
          const res = await requestJson<{ valid: string[], missing: string[] }>("/api/cases/validate", {
            method: "POST",
            body: JSON.stringify({ caseIds: batch }),
          });
          
          if (res.valid) validCases.push(...res.valid);
          if (res.missing) missingCaseIds.push(...res.missing);
        } catch (e) {
          toast.error("Unable to validate Case records. Please try again.");
          setUploadState("error");
          return;
        }
      }
      
      if (validCases.length === 0) {
        toast.error("No matching Salesforce Case records were found.");
        setUploadState("error");
        setMissingCases(missingCaseIds);
        return;
      }
      
      setTicketsInput(validCases.join("\n"));
      setMissingCases(missingCaseIds);
      setUploadSummary({
        file: file.name,
        scannedLines, 
        total: extractedIds.length,
        unique: validCases.length + missingCaseIds.length,
        valid: validCases.length,
        missing: missingCaseIds.length,
      });
      
      setUploadState("success");
      setAutoRunPending(true);
      
    } catch (e) {
      toast.error("Unable to read this file.");
      setUploadState("error");
    }
  };

  const handleRunCaseAssignment = () => {
    if (!ticketsInput.trim()) {
      toast.error("Paste one or more Case IDs first");
      return;
    }

    if (caseAssignmentRows.length === 0) {
      toast.error("No valid Case IDs found. Paste 15- or 18-character Salesforce Case IDs beginning with 500.");
      return;
    }

    if (activeCaseOwners.length === 0) {
      toast.error("Add at least one active owner");
      return;
    }

    let result: CaseAssignmentResult;

    if (caseAssignMode === "equal") {
      result = buildBalancedAssignments(caseAssignmentRows, activeCaseOwners, roundRobinPointer);
      
      if (result.nextPointer !== undefined && result.startOwner && result.nextStartOwner && result.extraOwners) {
        setRoundRobinPointer(result.nextPointer);
        localStorage.setItem("caseAssignmentRoundRobin", result.nextPointer.toString());

        const newHistoryEntry: RoundRobinHistoryEntry = {
          batchId: roundRobinHistory.length > 0 ? roundRobinHistory[0]!.batchId + 1 : 1,
          totalCases: caseAssignmentRows.length,
          baseCases: result.casesPerOwner,
          extraCases: result.remainder ?? 0,
          extraOwners: result.extraOwners,
          startOwner: result.startOwner,
          nextStartOwner: result.nextStartOwner,
          timestamp: new Date().toISOString(),
        };
        const updatedHistory = [newHistoryEntry, ...roundRobinHistory].slice(0, 10);
        setRoundRobinHistory(updatedHistory);
        localStorage.setItem("caseAssignmentHistory", JSON.stringify(updatedHistory));

        const updatedLoad = { ...cumulativeLoad };
        activeCaseOwners.forEach((owner) => {
          if (!updatedLoad[owner.ownerId]) {
            updatedLoad[owner.ownerId] = { total: 0, extra: 0 };
          }
          updatedLoad[owner.ownerId]!.total += result.casesPerOwner;
        });
        result.extraOwners.forEach((owner) => {
          updatedLoad[owner.ownerId]!.total += 1;
          updatedLoad[owner.ownerId]!.extra += 1;
        });
        setCumulativeLoad(updatedLoad);
        localStorage.setItem("caseAssignmentCumulativeLoad", JSON.stringify(updatedLoad));
      }
    } else if (caseAssignMode === "owner-wise") {
      if (!selectedOwnerObjects.length) {
        toast.error("Select at least one owner");
        return;
      }

      result = buildBalancedAssignments(caseAssignmentRows, selectedOwnerObjects);
    } else {
      const quantityResult = buildQuantityWiseAssignments(caseAssignmentRows, quantityOwnerConfigs);
      if (quantityResult.error || !quantityResult.result) {
        toast.error(quantityResult.error ?? "Unable to build the quantity-wise assignment");
        return;
      }
      result = quantityResult.result;
    }

    setCaseAssignOutput(result.output);
    setCaseAssignmentResult(result);
    if (result.assignedCount > 0) {
      dashboardStore.recordSOQL("Case assignment", result.assignedCount);
      trackDashboardEvent({
        metricKey: "case_assignment",
        incrementBy: result.assignedCount,
        event: {
          type: "case-assignment",
          label: `Case assignment · ${result.assignedCount} cases assigned`,
          meta: `${result.unassignedCaseIds.length} left unassigned · ${caseAssignMode}`,
          module: "soql-generator",
        },
      });
    }

    const remainderMessage = result.unassignedCaseIds.length
      ? ` ${result.unassignedCaseIds.length} case${result.unassignedCaseIds.length === 1 ? " was" : "s were"} left unassigned.`
      : "";
    toast.success(`Assigned ${result.assignedCount} case${result.assignedCount === 1 ? "" : "s"} across ${result.ownerCount} owner${result.ownerCount === 1 ? "" : "s"}.${remainderMessage}`);
  };

  const handleDownloadCaseAssignment = () => {
    if (!caseAssignOutput.trim()) {
      toast.error("Generate case assignment output first");
      return;
    }

    downloadTextFile(`case-assignment-${Date.now()}.csv`, caseAssignOutput, "text/csv;charset=utf-8;");
    toast.success("Case assignment CSV downloaded");
  };

  const handleDownloadCancellationOutput = () => {
    if (!cancellationCanceledOutput.trim() || uniqueExecutableCancellationRows.length === 0) {
      toast.error("No cancellation update output available");
      return;
    }

    downloadTextFile(`iis-cancellation-all-${Date.now()}.tsv`, cancellationCanceledOutput, "text/tab-separated-values;charset=utf-8;");
    trackDashboardEvent({
      metricKey: "ticket_cancellation",
      incrementBy: uniqueExecutableCancellationRows.length,
      event: {
        type: "ticket-cancellation",
        label: `IIS Cancellation Output Downloaded`,
        meta: `${uniqueExecutableCancellationRows.length} ticket${uniqueExecutableCancellationRows.length === 1 ? "" : "s"}`,
        module: "soql-generator",
      },
    });

    toast.success("Cancellation output downloaded");
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
    setChildDetailsBatchIndex(0);
  }, [childDetailsComponentInput]);

  React.useEffect(() => {
    setChildDetailsOutput("");
    setChildDetailsTransformResult(null);
  }, [childDetailsComponentInput, childDetailsSOQLResult]);

  React.useEffect(() => {
    setCancellationExecutionBatchIndex(0);
  }, [cancellationQueryBatches.length]);

  const handleTemplateChange = (value: string) => {
    

    setTicketsInput("");
    setAssetTransferInput("");
    setAssetSOQLResult("");
    setAccountSOQLResult("");
    setTransferOutput("");
    setTransferDebug("");
    setChildDetailsComponentInput("");
    setChildDetailsInput("");
    setChildDetailsSOQLResult("");
    setChildDetailsOutput("");
    setChildDetailsTransformResult(null);
    setChildDetailsBatchIndex(0);
    setCancellationExecutionInput("");
    setCancellationStoredRows([]);
    setCaseAssignOutput("");
    setCaseAssignmentResult(null);
    setCaseAssignMode("equal");
    resetCaseOwnerSelectionState();
    setSelectedTemplate(value);

    

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
    setAssetTransferInput("");
    setAssetSOQLResult("");
    setAccountSOQLResult("");
    setTransferOutput("");
    setTransferDebug("");
    setChildDetailsComponentInput("");
    setChildDetailsInput("");
    setChildDetailsSOQLResult("");
    setChildDetailsOutput("");
    setChildDetailsTransformResult(null);
    setChildDetailsBatchIndex(0);
    setCancellationExecutionInput("");
    setCancellationFailedInput("");
      setCancellationType("CCO");
    setCancellationStoredRows([]);
    setCaseAssignOutput("");
    setCaseAssignmentResult(null);
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
    if (isChildDetailsToParent) {
      if (childDetailsComponentIds.length === 0) {
        toast.error("Paste at least one valid Component ID");
        return;
      }

      setGeneratedAtLeastOnce(true);
      const templateName = activeTemplate?.name ?? "Child Details to Parent";
      dashboardStore.recordSOQL(templateName, childDetailsComponentIds.length);
      trackDashboardEvent({
        metricKey: "soql_generated",
        incrementBy: 1,
        event: {
          type: "soql-generated",
          label: "SOQL generated · " + templateName,
          meta:
            childDetailsComponentIds.length +
            " Component ID" +
            (childDetailsComponentIds.length === 1 ? "" : "s"),
          module: "soql-generator",
        },
      });
      toast.success(
        "Generated " +
          childDetailsSOQLBatches.length +
          " Asset query batch" +
          (childDetailsSOQLBatches.length === 1 ? "" : "es")
      );
      return;
    }

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

    if (isCaseAssign) {
      handleRunCaseAssignment();
      return;
    }

    const needsTickets = activeTemplate?.soql?.includes("{{tickets}}");
    if (needsTickets && parsedTickets.length === 0) {
      toast.error("Paste at least one ticket number");
      return;
    }

    setGeneratedAtLeastOnce(true);
    const templateName = activeTemplate?.name ?? "Unknown";
    const usageCount = parsedTickets.length || 1;
    dashboardStore.recordSOQL(templateName, usageCount);

    trackDashboardEvent({
      metricKey: "soql_generated",
      incrementBy: 1,
      event: {
        type: "soql-generated",
        label: `SOQL generated · ${templateName}`,
        meta: `${usageCount} ticket${usageCount === 1 ? "" : "s"}`,
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
    }

    toast.success(
      `Generated SOQL for ${usageCount} ticket${usageCount === 1 ? "" : "s"}`
    );
  };

  const showStats = parsedTickets.length > 0;
  const statEntries = Object.entries(ticketStats.breakdown).sort((a, b) => b[1] - a[1]);

  const childDetailsInputStats = [
    { label: "Total Component IDs", value: childDetailsComponentParse.totalCount, tone: "blue" },
    { label: "Duplicate Removed", value: childDetailsComponentParse.duplicateCount, tone: "amber" },
    { label: "Invalid IDs", value: childDetailsComponentParse.ignoredCount, tone: "rose" },
    { label: "Valid IDs", value: childDetailsComponentIds.length, tone: "emerald" },
  ];

  const childDetailsSummaryStats = [
    { label: "Total Component IDs", value: childDetailsComponentIds.length, tone: "blue" },
    { label: "Rows Returned", value: childDetailsVisibleResult?.sourceRows ?? 0, tone: "slate" },
    { label: "Rows Generated", value: childDetailsTransformResult?.generatedRows ?? 0, tone: "emerald" },
    { label: "Duplicate Rows", value: childDetailsVisibleResult?.duplicateRows ?? 0, tone: "amber" },
    { label: "Invalid IDs", value: childDetailsInvalidIdCount, tone: "rose" },
    { label: "Unexpected Rows", value: childDetailsVisibleResult?.unexpectedComponentRows ?? 0, tone: "amber" },
  ];

  const liveStore = useDashboardStore();

  // Chart Data for SOQL Generator
  const soqlTrendData = React.useMemo(() => [
    { time: "09:00", queries: 12 },
    { time: "10:00", queries: 45 },
    { time: "11:00", queries: 78 },
    { time: "12:00", queries: 54 },
    { time: "13:00", queries: 89 },
    { time: "14:00", queries: 112 },
    { time: "15:00", queries: 93 },
    { time: "16:00", queries: 130 + (liveStore.soqlGeneratedCount || 0) },
  ], [liveStore.soqlGeneratedCount]);

  return (
    <div className="workspace-page mx-auto w-full max-w-7xl space-y-6 pb-14 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      {/* ─── Header Section ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-hero relative flex flex-col gap-6 overflow-hidden rounded-3xl p-8"
      >
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#0176d3]/10 blur-3xl pointer-events-none dark:bg-[#0176d3]/20 dark:mix-blend-screen" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none dark:bg-indigo-500/20 dark:mix-blend-screen" />
        
        <div className="relative z-10 flex flex-col gap-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0176d3] to-indigo-600 text-white shadow-lg shadow-[#0176d3]/30 border border-white/10">
              <Terminal className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="sm:text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm uppercase tracking-widest text-[10px] font-black text-slate-500 dark:text-slate-400">
                  SALESFORCE DEVELOPER TOOLS
                </span>
                <span className="font-bold backdrop-blur-sm hidden sm:inline-flex text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Lightning v2.4
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 drop-shadow-sm dark:text-white">
                SOQL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Generator</span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-2 max-w-xl">
                Paste values, pick a template, generate production-ready Salesforce SOQL and Data Loader batches instantly.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 self-start 2xl:w-auto 2xl:self-center">
            <Button variant="outline" onClick={handleClear} className="gap-2 h-12 px-6 rounded-xl border-slate-200 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-slate-600 font-bold transition-all backdrop-blur-sm bg-white/55 shadow-inner dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800/50 dark:hover:text-red-400">
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
              <span className="font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {ticketStats.total}
              </span>
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

            {/* Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 mb-6 relative z-10">
          {(() => {
            const baseShortcuts = [
              { id: "19", name: "CANCELLATION REQUESTED", icon: "FileWarning" },
              { id: "3", name: "ASSET TRANSFER", icon: "ArrowRightLeft" },
              { id: "4", name: "CASE ASSIGN", icon: "Users" },
              { id: "20", name: "CHILD TO PARENT UPDATED", icon: "CornerRightUp" },
              { id: "1", name: "UPDATE ACCEPTED & NONE", icon: "CheckCircle2" }
            ];
            
            const dynamicShortcuts = [...baseShortcuts];
            for (const favId of Array.from(favourites)) {
              if (!dynamicShortcuts.some(s => s.id === favId)) {
                const t = templates.find(temp => temp.id === favId);
                if (t) {
                  dynamicShortcuts.push({ id: t.id, name: t.name.toUpperCase(), icon: "Star" });
                }
              }
            }
            return dynamicShortcuts;
          })().map((shortcut) => {
            const isActive = selectedTemplate === shortcut.id;
            return (
            <button
              key={shortcut.id}
              onClick={() => handleTemplateChange(shortcut.id)}
              className={cn(
                "group p-2.5 rounded-2xl flex flex-col items-center justify-between h-full gap-2 transition-all duration-300 border backdrop-blur-md shadow-sm",
                isActive 
                  ? "bg-white/60 dark:bg-white/[0.15] border-white/80 dark:border-white/30 shadow-[0_8px_32px_rgba(31,38,135,0.15)] scale-[1.02] -translate-y-0.5" 
                  : "hover:shadow-md hover:-translate-y-0.5 border-white/20 bg-white/40 dark:bg-slate-900/40 dark:border-white/10 dark:hover:bg-slate-800/60"
              )}
            >
              {shortcut.icon === "FileWarning" && <FileWarning className="h-7 w-7 text-amber-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />}
              {shortcut.icon === "ArrowRightLeft" && <ArrowRightLeft className="h-7 w-7 text-blue-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />}
              {shortcut.icon === "CalendarClock" && <CalendarClock className="h-7 w-7 text-emerald-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]" />}
              {shortcut.icon === "Users" && <Users className="h-7 w-7 text-purple-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]" />}
              {shortcut.icon === "CornerRightUp" && <CornerRightUp className="h-7 w-7 text-indigo-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(99,102,241,0.6)]" />}
              {shortcut.icon === "CheckCircle2" && <CheckCircle2 className="h-7 w-7 text-rose-500 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]" />}
              {shortcut.icon === "Star" && <Star className="h-7 w-7 text-amber-400 fill-amber-400/20 transition-all duration-500 ease-out group-hover:scale-125 group-hover:-rotate-12 group-hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />}
              <span className={cn("text-[9px] font-black uppercase tracking-widest text-center leading-tight", isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
              {shortcut.name}
            </span>
          </button>
        )})}
      </div>
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-12 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0 flex flex-col h-full min-h-0"
        >
          <Card className="rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group">
              {/* WATERMARK */}
              <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                <span className="text-[25px] md:text-[35px] lg:text-[45px] leading-[0.9] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent flex flex-col">
                  <span>QUERY</span>
                  <span>SELECTION</span>
                </span>
              </div>
            <CardHeader className="pb-4 bg-transparent relative z-10 p-6">
              <div className="flex flex-col pt-8">
                  <div className="flex items-center gap-3 shrink-0">
                      <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight whitespace-nowrap">Query Template</CardTitle>
                    </div>
                  <div className="flex items-center gap-2 shrink-0">
                  <span className="font-black whitespace-nowrap uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400">
                    {defaultTemplateCount} Built-in
                  </span>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", libraryLoadState === "error" ? "text-rose-500" : "text-slate-500 dark:text-slate-400")}>
                    {libraryLoadState === "loading" ? "Loading..." : `${libraryTemplateCount} Saved`}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-6 pt-5 relative z-10">
                <div className="flex items-stretch gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <TemplatePicker
                      templates={templates}
                      value={selectedTemplate}
                      onChange={handleTemplateChange}
                    />
                  </div>
                  <button type="button" onClick={() => toggleFav(selectedTemplate)} className="flex-shrink-0 flex items-center justify-center p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/[0.05] transition-all"
                    aria-label={`Toggle favourite for ${activeTemplate?.name ?? ""}`}
                    title={activeTemplate?.favourite || favourites.has(selectedTemplate) ? "Remove Bookmark" : "Bookmark Template"}
                  >
                    <Star
                      className={`h-[18px] w-[18px] transition-all duration-500 ease-out hover:scale-125 hover:-rotate-12 ${
                        activeTemplate?.source === "library"
                          ? activeTemplate.favourite
                            ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            : "text-slate-400 hover:text-amber-500"
                          : favourites.has(selectedTemplate)
                          ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          : "text-slate-400 hover:text-amber-500"
                      }`}
                    />
                  </button>
                </div>

                {isCancellation && (
                  <div className="flex flex-wrap items-center gap-4 w-full pt-3 pb-2 px-2">
                    {["CCO", "NAMO", "NON NAMO", "CASE"].map((type) => {
                      const isSelected = cancellationType === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setCancellationType(type as any)}
                          className={cn(
                            "px-4 py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex-1 min-w-fit text-center backdrop-blur-md border",
                            isSelected
                              ? "bg-white/30 dark:bg-white/[0.15] border-white/60 dark:border-white/30 shadow-[0_8px_32px_rgba(31,38,135,0.15)] text-blue-700 dark:text-sky-300 scale-105"
                              : "bg-white/10 dark:bg-white/[0.03] border-slate-300/40 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] text-slate-600 dark:text-slate-400 hover:bg-white/20 dark:hover:bg-white/[0.08] hover:text-slate-800 dark:hover:text-slate-200"
                          )}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {(isCancellation || isUpdateAcceptedAndNone) && (
                  <div className="w-full pt-4 pb-2 px-3 border-t border-slate-200/50 dark:border-white/10 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <Database className="h-3.5 w-3.5" />
                        Batch Size Limit
                      </span>
                      <Badge variant="outline" className="text-xs font-black bg-blue-50/50 text-blue-600 border-blue-200/50 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/30 shadow-sm">
                        {batchSize} / BLOCK
                      </Badge>
                    </div>
                    <div className="px-1">
                      <input 
                        type="range" 
                        min="50" 
                        max="2000" 
                        step="50" 
                        value={batchSize}
                        onChange={(e) => setBatchSize(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-sky-500 hover:accent-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 px-0.5">
                        <span>50</span>
                        <span>2000</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>



          {!isAssetTransfer && (
            <Card className="flex flex-col flex-1 min-h-0 rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group transition-all duration-300">
        <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
          <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
            STEP 1
          </span>
        </div>
<CardHeader className="pb-4 bg-transparent p-6 relative">
                <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2">
                    
                    <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight flex-1">
                      {isCancellation ? "Paste Your Tickets" : isCaseAssign ? "Upload or Paste Case IDs" : activeTemplate?.category === "Asset" ? "Paste Component IDs" : "Paste Ticket Numbers"}
                    </CardTitle>
                  </div>
              </CardHeader>

              <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col min-h-0 relative z-10">
                {isCaseAssign && (
                      <div className="flex flex-col space-y-4 flex-1 min-h-0 h-full">
                    <div 
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleFileUpload}
                      className={cn(
                        "relative flex flex-col flex-1 items-center justify-center rounded-2xl p-10 min-h-[200px] text-center transition-all duration-200 overflow-hidden w-full mx-auto group",
                        uploadState === "reading" || uploadState === "scanning" || uploadState === "validating"
                          ? "bg-blue-50/50 dark:bg-blue-900/10"
                          : isDragging
                            ? "bg-[#0176d3]/10 scale-[1.02] shadow-sm"
                            : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      )}
                    >
                      {/* Animated SVG Border */}
                      <svg className={cn(
                        "absolute inset-0 h-full w-full pointer-events-none rounded-2xl transition-colors duration-300",
                        uploadState === "reading" || uploadState === "scanning" || uploadState === "validating"
                          ? "text-blue-400/80 animate-[dash_1s_linear_infinite]"
                          : isDragging
                            ? "animate-[dash_0.5s_linear_infinite]"
                            : "text-slate-300 dark:text-slate-700 group-hover:text-blue-500/80 group-hover:animate-[dash_2s_linear_infinite]"
                      )} xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0176d3" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#0176d3" />
                          </linearGradient>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="none"
                          rx="16"
                          ry="16"
                          stroke={isDragging ? "url(#shimmerGradient)" : "currentColor"}
                          strokeWidth="2"
                          strokeDasharray="10 10"
                        />
                      </svg>
                      <style>{`
                        @keyframes dash {
                          to {
                            stroke-dashoffset: -20;
                          }
                        }
                      `}</style>
                      {/* Transparent overlay when dragging to prevent flickering from child drag events */}
                      {isDragging && <div className="absolute inset-0 z-50 pointer-events-none" />}
                      
                      {uploadState === "reading" || uploadState === "scanning" || uploadState === "validating" ? (
                        <div className="flex flex-col items-center z-10 pointer-events-none">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 mb-3 animate-pulse">
                            <RotateCcw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                          </div>
                          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {uploadState === "reading" ? "Reading file..." : uploadState === "scanning" ? "Scanning for Case IDs..." : "Validating Cases..."}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full mb-4 shadow-sm z-10 transition-colors pointer-events-none",
                            isDragging 
                              ? "bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-300 dark:ring-blue-700" 
                              : "bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700"
                          )}>
                            <Upload className={cn("h-6 w-6 transition-colors", isDragging ? "text-blue-600 dark:text-blue-400" : "text-slate-500")} />
                          </div>
                          <p className={cn("text-base font-black z-10 transition-colors pointer-events-none", isDragging ? "text-blue-600 dark:text-blue-400" : "text-foreground")}>
                            {isDragging ? "Drop your file here!" : "Drag & Drop your Case ID report here"}
                          </p>
                          <p className="text-xs text-slate-500 font-medium mt-1 mb-5 z-10 pointer-events-none">Supports CSV, XLSX, XLS, TXT</p>
                          <div className="z-10">
                            <input type="file" id="case-upload" className="sr-only" onChange={handleFileUpload} accept=".csv,.txt,.xlsx,.xls,.tsv" />
                            <label htmlFor="case-upload" className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                              Browse File
                            </label>
                          </div>
                        </>
                      )}
                    </div>

                    {uploadSummary && uploadState === "success" && (
                      <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10 p-4">
                        <div className="flex items-center gap-2 mb-3 border-b border-emerald-100 dark:border-emerald-800/30 pb-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Upload Complete</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                          <div className="flex justify-between"><span className="text-slate-500 font-medium">File</span><span className="font-bold truncate max-w-[120px]" title={uploadSummary.file}>{uploadSummary.file}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 font-medium">Records Scanned</span><span className="font-bold">{uploadSummary.scannedLines.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 font-medium">Case IDs Detected</span><span className="font-bold">{uploadSummary.total.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 font-medium">Unique Case IDs</span><span className="font-bold">{uploadSummary.unique.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-emerald-600 dark:text-emerald-400 font-bold">Valid Cases</span><span className="font-bold text-emerald-600 dark:text-emerald-400">{uploadSummary.valid.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-rose-500 font-bold">Not Found</span><span className="font-bold text-rose-500">{uploadSummary.missing.toLocaleString()}</span></div>
                        </div>
                        {missingCases.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-800/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{missingCases.length} Cases Not Found</span>
                              <Button variant="ghost" size="sm" className="h-6 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-100/50" onClick={() => handleCopy(missingCases.join("\n"))}>
                                <Copy className="h-3 w-3 mr-1" /> Copy Missing
                              </Button>
                            </div>
                            <div className="max-h-24 overflow-y-auto rounded bg-white/60 dark:bg-black/20 p-2 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                              {missingCases.slice(0, 50).join("\n")}
                              {missingCases.length > 50 && `\n...and ${missingCases.length - 50} more`}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {!isCaseAssign && (
                  <>
                    <div className="flex-1 flex flex-col space-y-2">
                      <div className="relative flex-1 flex flex-col group min-h-[320px] rounded-2xl overflow-hidden bg-slate-50/10 dark:bg-slate-900/10">
                      {/* Animated SVG Border */}
                      <svg className={cn(
                        "absolute inset-0 h-full w-full pointer-events-none rounded-2xl transition-colors duration-300",
                        "animate-[dash_3s_linear_infinite] group-hover:animate-[dash_1.5s_linear_infinite] group-focus-within:animate-[dash_0.75s_linear_infinite]"
                      )} xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="shimmerGradientText" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="none"
                          rx="16"
                          ry="16"
                          stroke="url(#shimmerGradientText)"
                          strokeWidth="2"
                          strokeDasharray="10 10"
                        />
                      </svg>
                      <Textarea
                        placeholder={activeTemplate?.category === "Asset" ? `Paste component IDs here...
CMP-00123
CMP-00124
CMP-00125` : `Paste ticket numbers here...
A26060134750678
A26060134750476
A26060134750619`}
                        className="flex-1 font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y relative z-10"
                        value={ticketsInput}
                        onChange={(event) => {
                          const value = event.target.value;
                          setTicketsInput(value);
                          setGeneratedAtLeastOnce(false);
                          if (selectedTemplate !== "1" && value.trim()) {

                          }
                        }}
                      />
                    </div>
                      <p className="border-l-2 border-blue-400/40 py-1 pl-3 text-xs font-medium leading-relaxed text-muted-foreground">
                        Supports spaces, commas, tabs, or newlines. Values are automatically chunked into {inputBatchSize}-value batches for Salesforce-safe SOQL.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="font-black uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400">
                        {parsedTickets.length === 0 ? "No tickets" : `${parsedTickets.length} ticket${parsedTickets.length === 1 ? "" : "s"}`}
                      </span>
                      <span className="font-black uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400">
                        {inputBatchCount === 0 ? "0 batches" : `${inputBatchCount} batch${inputBatchCount === 1 ? "" : "es"}`}
                      </span>
                      <span className="font-black uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400">
                        Max {inputBatchSize} / block
                      </span>
                      <div className="flex-1" />
                      <Button variant="outline" size="sm" className="gap-2 h-10 px-4 rounded-xl text-xs hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all font-bold border-slate-200 dark:border-slate-700" onClick={handleClear}>
                        <Trash2 className="h-4 w-4" /> Clear
                      </Button>
                      <Button onClick={triggerGenerate} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold gap-2 h-10 px-5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                        <PlayCircle className="h-4 w-4 fill-white/20" /> Generate
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {isAssetTransfer && (
            <Card className="flex flex-col flex-1 min-h-0 rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group transition-all duration-300">
        <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
          <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
            STEP 1
          </span>
        </div>
<CardHeader className="pb-4 bg-transparent p-6 relative">
                <div className="flex items-center gap-3 relative z-10">
                    <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Asset Transfer Data</CardTitle>
                  </div>
              </CardHeader>
              <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col min-h-0 relative z-10">
                <div className="flex-1 flex flex-col space-y-2">
                  <label className="text-xs font-black text-slate-500 block uppercase tracking-widest pl-1">Component & New CID Pairs</label>
                  <div className="relative flex-1 flex flex-col group min-h-[220px] rounded-2xl overflow-hidden bg-slate-50/10 dark:bg-slate-900/10">
                    {/* Animated SVG Border */}
                    <svg className={cn(
                      "absolute inset-0 h-full w-full pointer-events-none rounded-2xl transition-colors duration-300",
                      "animate-[dash_3s_linear_infinite] group-hover:animate-[dash_1.5s_linear_infinite] group-focus-within:animate-[dash_0.75s_linear_infinite]"
                    )} xmlns="http://www.w3.org/2000/svg">
                      <rect
                        width="100%"
                        height="100%"
                        fill="none"
                        rx="16"
                        ry="16"
                        stroke="url(#shimmerGradientText)"
                        strokeWidth="2"
                        strokeDasharray="10 10"
                      />
                    </svg>
                    <Textarea
                      placeholder={`COMPONENT        NEW CID
BSL34933847      CID-2025004
BSL29709797      CID-4206214
BSL22295338      CID-6074821`}
                      className="flex-1 min-h-[220px] font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y relative z-10"
                      value={assetTransferInput}
                      onChange={(event) => {
                        const value = event.target.value;
                        setAssetTransferInput(value);
                      }}
                    />
                  </div>
                  <p className="border-l-2 border-blue-400/40 py-1 pl-3 text-xs font-medium leading-relaxed text-muted-foreground">
                    Paste component ID and new CID pairs. Tab or space separated. One pair per line.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <span className="font-black uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400">
                    {assetPairs.length} pair{assetPairs.length === 1 ? "" : "s"}
                  </span>
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
          className={`2xl:col-span-9 xl:col-span-8 min-w-0 ${(!isTS && !isChildDetailsToParent) ? "grid grid-cols-1 2xl:grid-cols-2 gap-6" : "2xl:relative h-full"}`}
        >
          {isTS && (
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 h-full 2xl:absolute 2xl:inset-0 2xl:grid-rows-2">
              <QueryPreviewCard
                step="STEP 2"
                title="TS (Ticket Status)"
                subtitle="WorkOrder query preview"
                batches={workOrderPreview}
                batchIndex={tsBatchIndex}
                setBatchIndex={setTsBatchIndex}
                className="h-[350px] 2xl:h-full min-h-[320px]"
                  onCopy={handleCopy}
              />
              <PasteResultCard
                step="PASTE"
                title="Paste Ticket result"
                subtitle="Transform Status to Accepted"
                value={tsResultPaste}
                onChange={setTsResultPaste}
                transformedValue={transformStatus(tsResultPaste, "Accepted", "WorkOrder")}
                className="h-[350px] 2xl:h-full min-h-[320px]"
                  onCopy={handleCopy}
              />
              <QueryPreviewCard
                step="STEP 3"
                title="SA (Service Appointment)"
                subtitle="ServiceAppointment query preview"
                batches={serviceAppointmentPreview}
                batchIndex={saBatchIndex}
                setBatchIndex={setSaBatchIndex}
                className="h-[350px] 2xl:h-full min-h-[320px]"
                  onCopy={handleCopy}
              />

              <PasteResultCard
                step="PASTE"
                title="Paste Service Appointment result"
                subtitle="Transform Status to None"
                value={saResultPaste}
                onChange={setSaResultPaste}
                transformedValue={transformStatus(saResultPaste, "None", "ServiceAppointment")}
                className="h-[350px] 2xl:h-full min-h-[320px]"
                  onCopy={handleCopy}
              />
            </div>
          )}

          {isChildDetailsToParent && (
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 h-full 2xl:absolute 2xl:inset-0 2xl:grid-rows-2">
              <QueryPreviewCard
                step="STEP 2"
                title={activeTemplate?.name ?? "Query Preview"}
                subtitle={`${activeTemplate?.category ?? ""} query preview`}
                batches={otherPreview}
                batchIndex={otherBatchIndex}
                setBatchIndex={setOtherBatchIndex}
                className="h-[350px] 2xl:h-full min-h-[320px]"
                onCopy={handleCopy}
              />
              
              <Card className="flex flex-col flex-1 min-h-[320px] h-[350px] 2xl:h-full rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group transition-all duration-300">
                <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                  <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                    STEP 3
                  </span>
                </div>
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10 flex flex-row items-start justify-between">
                  <div className="flex-1 min-w-[200px]">
                    <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Paste Salesforce Result</CardTitle>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-5 md:mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
                      onClick={() => setChildDetailsInput("")}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4 relative z-10 flex-1 flex flex-col min-h-0">
                  <Textarea
                    placeholder={`_\tId\tParent\tParent.AccountId\tParentId\tRecordTypeId\n[Asset]\t02iNy00000CKkhCIAT\t[Asset]\t001Ny00001iPnOgIAK\t02iNy00000CWXGQIA5\t012Ny0000003SvsIAE`}
                    className="flex-1 font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 dark:border dark:border-white/[0.05] focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-none p-4 resize-none h-full min-h-0"
                    value={childDetailsInput}
                    onChange={(e) => setChildDetailsInput(e.target.value)}
                  />
                </CardContent>
              </Card>

              <Card className="flex flex-col flex-1 min-h-[320px] h-[350px] 2xl:h-full rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group transition-all duration-300">
                <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                  <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                    STEP 4
                  </span>
                </div>
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10 flex flex-row items-start justify-between">
                  <div className="flex-1 min-w-[200px]">
                    <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">CHILD TO ASSET</CardTitle>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-5 md:mt-6">
                    {customChildDetailsProcessor.output && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
                        onClick={() => handleCopy(customChildDetailsProcessor.output)}
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy TSV
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4 relative z-10 flex-1 flex flex-col min-h-0">
                  <Textarea
                    readOnly
                    value={customChildDetailsProcessor.output}
                    placeholder={`_\tId\tAccountId\tParentId\tRecordTypeId\n[Asset]\t02iNy00000CKkhCIAT\t001Ny00001iPnOgIAK\t\t012Ny0000003SvrIAE\n[Asset]\t02iNy00000CLDskIAH\t001Ny00000bp44EIAQ\t\t012Ny0000003SvrIAE`}
                    className="flex-1 font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 dark:border dark:border-white/[0.05] focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500 shadow-none p-4 resize-none h-full min-h-0"
                  />
                </CardContent>
              </Card>
            
              <Card className="flex flex-col flex-1 min-h-[320px] h-[350px] 2xl:h-full rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group transition-all duration-300">
                <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                  <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                    DEBUG
                  </span>
                </div>
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground flex-1 flex items-center justify-between">
                    <span>Processing Status</span>
                    <div className="flex gap-3 text-xs">
                      <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-md">
                        Valid: {customChildDetailsProcessor.count}
                      </span>
                      {customChildDetailsProcessor.skipped > 0 && (
                        <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 px-2 py-1 rounded-md">
                          Skipped: {customChildDetailsProcessor.skipped}
                        </span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4 relative z-10 flex-1 flex flex-col min-h-0">
                  <Textarea
                    readOnly
                    value={customChildDetailsProcessor.debug || "No errors. Ready."}
                    className={`flex-1 font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 dark:border dark:border-white/[0.05] shadow-none p-4 resize-none h-full min-h-0 ${customChildDetailsProcessor.skipped > 0 ? "text-red-500 focus-visible:ring-red-500/40 focus-visible:border-red-500" : "text-slate-500 focus-visible:ring-slate-500/40 focus-visible:border-slate-500"}`}
                  />
                </CardContent>
              </Card>
</div>
          )}

          {isAssetTransfer && (
            <>
              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">
                <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                  <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                    STEP 2
                  </span>
                </div>
                  <CardHeader className="pb-3 bg-transparent p-6 relative z-10">
                    <div className="flex flex-col w-full relative mt-5 md:mt-6">
                        <div className="absolute top-0 right-0 -mt-1">
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(assetTransferComponentSOQL)} disabled={!assetTransferComponentSOQL}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                        <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground pr-20">Component SOQL Query</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">
                    <div className="flex flex-col overflow-hidden bg-transparent">
                    <SOQLHighlighter query={assetTransferComponentSOQL || "Paste component pairs to generate Component SOQL"} className={`overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed max-h-[320px] min-h-[100px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 ${!assetTransferComponentSOQL ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-sky-200"}`} />
                  </div>
                </CardContent>
              </Card>

              {/* STEP 3 */}
              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">
                <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                  <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                    STEP 3
                  </span>
                </div>
                <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-2 md:mt-3">
                    <div className="flex flex-col gap-1 w-full relative">
                      <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white">
                        Asset SOQL<br />Result
                      </CardTitle>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Paste Asset SOQL Result
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col min-h-0 relative z-10">
                  <Textarea
                    placeholder={`Paste Asset SOQL result here...
"_"	"Component_Id__c"	"Id"	"Asset_Obligation__c"	"Account.Customer_ID__c"	"Record_Type__c"	"Parent.Id"`}
                    className="flex-1 min-h-[100px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 dark:border dark:border-white/[0.05] focus-visible:ring-fuchsia-500/40 focus-visible:border-fuchsia-500 shadow-none p-4 resize-none"
                    value={assetSOQLResult}
                    onChange={(event) => {
                      const val = event.target.value;
                      setAssetSOQLResult(val);
                      if (!val.trim()) {
                        setAccountSOQLResult("");
                        setTransferOutput("");
                        setTransferDebug("");
                      }
                    }}
                  />
                </CardContent>
              </Card>

              {/* STEP 4 */}
              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">
                <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                  <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                    STEP 4
                  </span>
                </div>
                  <CardHeader className="pb-3 bg-transparent p-6 relative z-10">
                    <div className="flex flex-col w-full relative mt-5 md:mt-6">
                        <div className="absolute top-0 right-0 -mt-1">
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(assetTransferAccountSOQL)} disabled={!assetTransferAccountSOQL}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                        <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground pr-20">Account SOQL Query</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">
                    <div className="flex flex-col overflow-hidden bg-transparent">
                    <SOQLHighlighter query={assetTransferAccountSOQL || "Paste component pairs to generate Account SOQL"} className={`overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed max-h-[320px] min-h-[100px] selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 ${!assetTransferAccountSOQL ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-sky-200"}`} />
                  </div>
                </CardContent>
              </Card>

              {/* STEP 5 */}
              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">
                <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                  <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                    STEP 5
                  </span>
                </div>
                <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-2 md:mt-3">
                    <div className="flex flex-col gap-1 w-full relative">
                      <div className="absolute top-0 right-0">
                        <Button className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold gap-2 h-8 px-4 rounded-lg text-[10px] shadow-md shadow-fuchsia-500/20 transition-all hover:-translate-y-0.5" onClick={handleProcessTransfer} disabled={!assetSOQLResult || !accountSOQLResult}>
                          <ArrowRightLeft className="h-3 w-3" /> Process
                        </Button>
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-[120px]">
                        Account<br />SOQL Result
                      </CardTitle>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Paste Account SOQL Result
                        </p>
                        <Button variant="outline" size="sm" className="gap-2 h-7 px-3 rounded-lg text-[10px] font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" onClick={handleDownloadTransfer} disabled={!transferOutput}>
                          <Download className="h-3.5 w-3.5 text-slate-400" /> CSV
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col min-h-0 relative z-10">
                  <Textarea
                    placeholder={`Paste Account SOQL result here...
"_"	"Customer_ID__c"	"Id"`}
                    className="flex-1 min-h-[100px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 dark:border dark:border-white/[0.05] focus-visible:ring-fuchsia-500/40 focus-visible:border-fuchsia-500 shadow-none p-4 resize-none"
                    value={accountSOQLResult}
                    onChange={(event) => {
                      const val = event.target.value;
                      setAccountSOQLResult(val);
                      if (!val.trim()) {
                        setTransferOutput("");
                        setTransferDebug("");
                      }
                    }}
                  />
                </CardContent>
              </Card>

              {/* STEP 6 */}
              {transferOutput && (
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                    <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                      RESULT
                    </span>
                  </div>
                  <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                    <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-2 md:mt-3">
                      <div className="flex flex-col gap-1 w-full relative">
                        <div className="absolute top-0 right-0">
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(transferOutput)}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-[100px]">
                          Transfer<br />Result
                        </CardTitle>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Processed Transfer Data
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">
                    <div className="flex flex-col overflow-hidden bg-transparent">
                    <SOQLHighlighter query={transferOutput} className="overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 max-h-[320px] min-h-[100px] selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* STEP 7 */}
              {transferDebug && (
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                    <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                      DEBUG
                    </span>
                  </div>
                  <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                    <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-2 md:mt-3">
                      <div className="flex flex-col gap-1 w-full relative">
                        <div className="absolute top-0 right-0">
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(transferDebug)}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-[100px]">
                          Transfer<br />Debug Info
                        </CardTitle>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Processing Logs
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">
                    <div className="flex flex-col overflow-hidden bg-transparent">
                    <SOQLHighlighter query={transferDebug} className="overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed text-slate-800 dark:text-amber-200 max-h-[320px] min-h-[100px] selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-100" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {isCancellation && (
            <>
              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                    <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                      STEP 2
                    </span>
                  </div>
                  <CardHeader className="pb-3 bg-transparent p-6 relative z-10">
                      <div className="flex flex-col w-full relative mt-5 md:mt-6">
                        <div className="absolute top-0 right-0 -mt-1">
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(cancellationQueryBatches[cancellationExecutionBatchIndex] || "")} disabled={!cancellationQueryBatches.length}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                        <div className="flex items-center justify-between gap-4 pr-[80px]">
                          <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                            Cancellation SOQL Batches
                          </CardTitle>
                          <span className="font-black uppercase tracking-widest whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">
                            {cancellationQueryBatches.length} BATCH{cancellationQueryBatches.length === 1 ? "" : "ES"}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">
                    <div className="flex flex-col overflow-hidden bg-transparent">
                    <SOQLHighlighter query={cancellationQueryBatches[cancellationExecutionBatchIndex]} className="overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed max-h-[320px] min-h-[100px] selection:bg-rose-500/20 selection:text-rose-900 dark:selection:text-rose-100 text-slate-800 dark:text-sky-200" />
                    </div>
                    {cancellationQueryBatches.length > 1 && (
                      <div className="flex items-center justify-between gap-3 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1.5 rounded-xl border-slate-200/80 bg-white/50 px-3 text-xs font-bold text-slate-600 shadow-sm transition-all hover:-translate-y-px hover:border-rose-300/60 hover:bg-rose-50 hover:text-rose-700 hover:shadow-md disabled:translate-y-0 disabled:border-slate-200/50 disabled:bg-slate-50/40 disabled:text-slate-400 disabled:shadow-none dark:border-slate-700/80 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-rose-400/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-200 dark:disabled:border-slate-800 dark:disabled:bg-white/[0.02]"
                          onClick={() => setCancellationExecutionBatchIndex((index) => Math.max(0, index - 1))}
                          disabled={cancellationExecutionBatchIndex === 0}
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          Prev
                        </Button>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          Batch {cancellationExecutionBatchIndex + 1} of {cancellationQueryBatches.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1.5 rounded-xl border-slate-200/80 bg-white/50 px-3 text-xs font-bold text-slate-600 shadow-sm transition-all hover:-translate-y-px hover:border-rose-300/60 hover:bg-rose-50 hover:text-rose-700 hover:shadow-md disabled:translate-y-0 disabled:border-slate-200/50 disabled:bg-slate-50/40 disabled:text-slate-400 disabled:shadow-none dark:border-slate-700/80 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-rose-400/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-200 dark:disabled:border-slate-800 dark:disabled:bg-white/[0.02]"
                          onClick={() => setCancellationExecutionBatchIndex((index) => Math.min(cancellationQueryBatches.length - 1, index + 1))}
                          disabled={cancellationExecutionBatchIndex === cancellationQueryBatches.length - 1}
                        >
                          Next
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    
                  </CardContent>
                </Card>


              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
          <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
            <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
              STEP 3
            </span>
          </div>
<CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                        Paste SOQL Result Batch
                      </CardTitle>
                      <span className="font-black uppercase tracking-widest whitespace-nowrap mt-5 md:mt-6 text-[10px] text-slate-500 dark:text-slate-400">
                        {cancellationResultBatchCount} BATCH{cancellationResultBatchCount === 1 ? "" : "ES"}
                      </span>
                    </div>
                  </CardHeader>

                <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 gap-4 relative z-10">
                  <Textarea
                    placeholder={`Paste Salesforce SOQL result here...\n"_"   "Id"   "Ticket_Number_Read_Only__c"   "Status"\n"[WorkOrder]"   "0WONy000008eHgfOAE"   "B25031925463529"   "Cancellation Requested"`}
                    className="flex-1 min-h-[220px] font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y"
                    value={cancellationExecutionInput}
                    onPaste={handleCancellationResultPaste}
                    onChange={(event) => handleCancellationResultInputChange(event.target.value)}
                  />

                  <div className="flex flex-wrap items-center gap-2.5 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      <span>Pasted tickets: {parsedTickets.length}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Parsed: {cancellationExecutionRows.length}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Stored: {uniqueExecutableCancellationRows.length}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Remaining: {cancellationRemainingTicketCount}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Matched: {cancellationMatchedTicketCount}</span>
                      {cancellationUnexpectedResultCount > 0 && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span>Outside: {cancellationUnexpectedResultCount}</span>
                        </>
                      )}
                    </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col 2xl:col-span-1 transition-all duration-300 group relative">
        <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
          <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
            STEP 4
          </span>
        </div>
<CardHeader className="pb-4 bg-transparent p-6 relative z-10">
<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
<div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-4">
                            <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">All Records</CardTitle>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(cancellationCanceledOutput)} disabled={uniqueExecutableCancellationRows.length === 0}>
                        <Copy className="h-3.5 w-3.5" /> Copy All
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={handleDownloadCancellationOutput} disabled={uniqueExecutableCancellationRows.length === 0}>
                        <Download className="h-3.5 w-3.5" /> TSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 gap-4 relative z-10">
                  <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      <span>Pasted: {parsedTickets.length}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Rows: {uniqueExecutableCancellationRows.length}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Status: Canceled</span>
                    </div>
                  <div className="rounded-xl bg-transparent text-foreground flex flex-col min-h-0 flex-1 overflow-hidden border-transparent shadow-none">
                    <SOQLHighlighter query={uniqueExecutableCancellationRows.length > 0 ? cancellationCanceledOutput : "\"_\"   \"Id\"   \"Ticket_Number_Read_Only__c\"   \"Status\"\n\"[WorkOrder]\"   \"0WONy000008eHgfOAE\"   \"B25031925463529\"   \"Canceled\""} className="overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed text-slate-800 dark:text-sky-200 min-h-[180px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100" />
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col 2xl:col-span-1 transition-all duration-300 group relative">
        <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
          <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
            STEP 5
          </span>
        </div>
<CardHeader className="pb-4 bg-transparent p-6 relative z-10">
<div className="flex flex-1 items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-4">
                            <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                              Paste Failed Results
                            </CardTitle>
                          </div>
                      </div>
                      
                    </div>
                    <span className="font-black uppercase tracking-widest mt-1 shrink-0 text-[10px] text-slate-500 dark:text-slate-400">OPTIONAL</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 gap-4 relative z-10">
                  <Textarea
                    placeholder={`Paste Salesforce SOQL result of FAILED tickets here...\n"_"   "Id"   "Ticket_Number_Read_Only__c"   "Status"\n"[WorkOrder]"   "0WONy000008eHgfOAE"   "B25031925463529"   "Cancellation Requested"`}
                    className="flex-1 min-h-[180px] font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y"
                    value={cancellationFailedInput}
                    onChange={(event) => setCancellationFailedInput(event.target.value)}
                  />
                </CardContent>
              </Card>

              {(() => {
                const cancellationTotalTickets = uniqueExecutableCancellationRows.length;
                const hasFailedInput = cancellationFailedInput.trim().length > 0;
                
                // Extract tickets using regex: first a letter, then numbers
                const cancellationFailedTicketsRows = parseCancellationExecutionRows(cancellationFailedInput);
                  const cancellationFailedTickets = Array.from(new Set(cancellationFailedTicketsRows.map(r => r.ticket)));
                
                const cancellationFailedCount = hasFailedInput ? cancellationFailedTickets.length : "(Pending)";
                const cancellationSuccessCount = hasFailedInput ? Math.max(0, cancellationTotalTickets - cancellationFailedTickets.length) : "(Pending)";

                const mailTemplateText = `Dear,\nCancellation has been done successfully.\n\n` +
                  (hasFailedInput && cancellationFailedTickets.length > 0 ? `Failed Tickets:\n${cancellationFailedTickets.join("\n")}\n\n` : "") +
                  `Total Tickets: ${cancellationTotalTickets}\n` +
                  `Cancelled Tickets: ${cancellationSuccessCount}\n` +
                  `Failed Tickets: ${cancellationFailedCount}`;

                const postTemplateText = `@taguser \nCancellation has been done successfully.\n\n` +
                  (hasFailedInput && cancellationFailedTickets.length > 0 ? `Failed Tickets:\n${cancellationFailedTickets.join("\n")}\n\n` : "") +
                  `Total Tickets: ${cancellationTotalTickets}\n` +
                  `Cancelled Tickets: ${cancellationSuccessCount}\n` +
                  `Failed Tickets: ${cancellationFailedCount}`;

                return (
                  <>
                    <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
          <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
            <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
              FOR EMAIL
            </span>
          </div>
<CardHeader className="pb-4 bg-transparent p-6 relative z-10">
<div className="flex items-center justify-between gap-3">
<div className="flex items-center gap-3">
<CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Email Template Output</CardTitle>
                          </div>
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(mailTemplateText)}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">
                        <div className="rounded-xl bg-transparent text-foreground flex flex-col min-h-0 flex-1 overflow-hidden border-transparent shadow-none">
                    <SOQLHighlighter query={mailTemplateText} className="overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 min-h-[160px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                        {/* WATERMARK */}
                        <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                          <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                            FOR POST
                          </span>
                        </div>
                        <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Post Template Output</CardTitle>
                          </div>
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-indigo-500/10 hover:text-indigo-600 hover:border-indigo-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(postTemplateText)}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">
                        <div className="rounded-xl bg-transparent text-foreground flex flex-col min-h-0 flex-1 overflow-hidden border-transparent shadow-none">
                    <SOQLHighlighter query={postTemplateText} className="overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 min-h-[160px] max-h-[320px] selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-100" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}

              {cancellationUpdateDebug && (
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col xl:col-span-2 transition-all duration-300 group relative">
                  <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
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
                    <div className="rounded-xl bg-transparent text-foreground flex flex-col min-h-0 flex-1 overflow-hidden border-transparent shadow-none">
                    <SOQLHighlighter query={cancellationUpdateDebug} className="overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 max-h-[280px] min-h-0 selection:bg-slate-500/20 selection:text-slate-900 dark:selection:text-slate-100" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {isCaseAssign && (
            <div className="space-y-6 w-full col-span-1 2xl:col-span-2 flex flex-col h-full min-h-0">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch w-full flex-1 min-h-0">
                {/* === COLUMN 1: WORKBENCH === */}
              <div className="space-y-4 flex flex-col h-full min-h-0">
                {/* Assignment Mode & Quick Execute Control Box */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 relative group">
                                  {/* Massive Watermark Step 2 */}
                <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                  <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                    STEP 2
                  </span>
                </div>

                <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-2 md:mt-3">
                    <div className="flex flex-col gap-1 w-full relative">
                      <div className="absolute top-0 right-0">
                        <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20 shadow-sm">Randomized</span>
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                        Assignment Mode<br />&amp; Execution
                      </CardTitle>
                      <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <span>{caseAssignmentRows.length} valid IDs</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span>Open status</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className={caseOwnerLoadState === "error" ? "text-rose-500" : ""}>
                          {caseOwnerLoadState === "loading" ? "Roster syncing" : caseOwnerLoadState === "error" ? "Roster offline" : activeCaseOwners.length + " active owners"}\n                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                  <CardContent className="p-5 space-y-4 relative z-10">
                    <div className="grid grid-cols-3 gap-2 bg-slate-50/50 dark:bg-white/[0.03] dark:border-white/[0.05] p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
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
                      <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/[0.03] dark:border-white/[0.05] border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-start gap-3 shadow-inner backdrop-blur-sm">
                        <CheckCircle2 className="h-4.5 w-4.5 text-purple-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          Prioritizes oldest cases first based on opened date, then gives every active owner exactly {activeCaseOwners.length ? Math.floor(caseAssignmentRows.length / activeCaseOwners.length) : 0} case{activeCaseOwners.length && Math.floor(caseAssignmentRows.length / activeCaseOwners.length) === 1 ? "" : "s"}. {activeCaseOwners.length ? caseAssignmentRows.length % activeCaseOwners.length : caseAssignmentRows.length} remainder case{(activeCaseOwners.length ? caseAssignmentRows.length % activeCaseOwners.length : caseAssignmentRows.length) === 1 ? " is" : "s are"} left unassigned.
                        </span>
                      </div>
                    )}

                    {caseAssignMode === "owner-wise" && (
                      <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/[0.03] dark:border-white/[0.05] border border-slate-200/60 dark:border-slate-700/60 space-y-3 shadow-inner backdrop-blur-sm">
                        <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">
                          <span>Target Owners</span>
                          <span className="bg-purple-500/10 text-purple-600 border border-purple-500/20 px-2 py-0.5 rounded-md">{selectedOwnerIds.length} selected</span>
                        </div>
                        <p className="text-[11px] leading-relaxed font-medium text-slate-500">
                          Selected owners receive an equal whole-number share. Any remainders are distributed 1-by-1 to ensure no cases are unassigned.
                        </p>
                        <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1">
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
                      <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/[0.03] dark:border-white/[0.05] border border-slate-200/60 dark:border-slate-700/60 space-y-3 shadow-inner backdrop-blur-sm">
                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                          <span>Set Quantities</span>
                          <span className="bg-purple-500/10 text-purple-600 border border-purple-500/20 px-2 py-0.5 rounded-md">Total: {quantitySelectedTotal} / {caseAssignmentRows.length}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed font-medium text-slate-500">
                          Set any whole-number quantity per owner. Older cases are assigned first; any unallocated new IDs remain unassigned.
                        </p>
                        <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto pr-1">
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
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs gap-2 h-10 px-4 sm:px-5 flex-[2] min-w-[180px] whitespace-nowrap shadow-md shadow-purple-500/20 rounded-xl transition-all hover:-translate-y-0.5" onClick={handleRunCaseAssignment}>
                        <CheckCircle2 className="h-4.5 w-4.5" /> Generate Assignment
                      </Button>
                      <Button variant="outline" size="sm" className="h-10 px-3 sm:px-4 text-xs gap-2 font-bold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm" onClick={() => handleCopy(caseAssignOutput)} disabled={!caseAssignOutput} title="Copy result">
                        <Copy className="h-4 w-4 text-slate-400" /> <span className="hidden sm:inline">Copy</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-10 px-3 sm:px-4 text-xs gap-2 font-bold rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm" onClick={handleDownloadCaseAssignment} disabled={!caseAssignOutput} title="Download CSV">
                        <Download className="h-4 w-4 text-slate-400" /> <span className="hidden sm:inline">CSV</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Paste Manually (Case Assign Mode) */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col flex-1 min-h-0 transition-all duration-300 relative group">
                  {/* Massive Watermark */}
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                    <span className="text-[25px] md:text-[35px] lg:text-[45px] leading-[0.9] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent flex flex-col">
                      <span>ADD</span>
                      <span>MANUALLY</span>
                    </span>
                  </div>

                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                    <div className="flex items-center gap-3 w-full mt-8 md:mt-12">
                      <CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Or Paste Manually</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4 relative z-10 flex-1 flex flex-col min-h-[100px]">
                    <div className="flex-1 flex flex-col space-y-2 h-full">
                      <Textarea
                        placeholder={`Paste Case IDs here...\n1\n500Ny00001RnGoS\n2\n500Ny00001RnTVV`}
                        className="flex-1 font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 dark:border dark:border-white/[0.05] focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-none p-4 resize-none min-h-[100px]"
                        value={ticketsInput}
                        onChange={(event) => {
                          setTicketsInput(event.target.value);
                          setGeneratedAtLeastOnce(false);
                        }}
                      />
                      <p className="border-l-2 border-blue-400/40 py-1 pl-3 text-[11px] font-medium leading-relaxed text-muted-foreground">
                        Paste raw text, spreadsheet rows, or CSV. Only valid 15- or 18-character Case IDs beginning with 500 are extracted.
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="font-black uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400">
                        {parsedCaseIds.length === 0 ? "No case ids" : `${parsedCaseIds.length} case id${parsedCaseIds.length === 1 ? "" : "s"}`}
                      </span>
                      <span className="font-black uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400">
                        Open by default
                      </span>
                      <div className="flex-1" />
                      <Button variant="outline" size="sm" className="gap-2 h-10 px-4 rounded-xl text-xs hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all font-bold border-slate-200 dark:border-slate-700" onClick={handleClear}>
                        <Trash2 className="h-4 w-4" /> Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* === COLUMN 2: RESULTS === */}
              <div className="space-y-4 flex flex-col h-full min-h-0">
                {/* 1. Assignment Output Box (Right at the Top so you see results without scrolling!) */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 relative group shrink-0">
                                  {/* Massive Watermark Step 3 */}
                <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                  <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                    STEP 3
                  </span>
                </div>

                <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-2 md:mt-3">
                    <div className="flex flex-col gap-1 w-full relative">
                      <div className="absolute top-0 right-0 flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(caseAssignOutput)} disabled={!caseAssignOutput}>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={handleDownloadCaseAssignment} disabled={!caseAssignOutput}>
                          <Download className="h-3.5 w-3.5" /> CSV
                        </Button>
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-[160px]">
                        Final Assignment<br />Output
                      </CardTitle>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">
                        Ready for Data Loader
                      </p>
                      {caseAssignmentResult && (
                        <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            <span>{caseAssignmentResult.assignedCount} assigned</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className={caseAssignmentResult.unassignedCaseIds.length ? "text-amber-500" : ""}>
                              {caseAssignmentResult.unassignedCaseIds.length} unassigned
                            </span>
                          </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 relative z-10 flex flex-col">
                  <div className="flex flex-col overflow-hidden bg-transparent">
                      <Textarea
                      readOnly
                      value={caseAssignOutput}
                      placeholder="Click Generate to assign owners..."
                      className={`flex-1 min-h-[100px] w-full resize-none border-0 bg-transparent p-5 font-mono text-xs focus-visible:ring-0 ${!caseAssignOutput ? "text-slate-400/60 font-medium dark:text-slate-500/50" : "text-slate-800 dark:text-sky-200"}`}
                    />
                  </div>
                </CardContent>
              </Card>

            {/* === COLUMN 3: ROSTER === */}
              {/* Owner Roster Box */}
              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 relative group flex-1 min-h-0">
                  {/* Massive Watermark */}
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                    <span className="text-[25px] md:text-[35px] lg:text-[45px] leading-[0.9] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent flex flex-col">
                      <span>OWNER</span>
                      <span>LIST</span>
                    </span>
                  </div>
                <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-1 mt-8 md:mt-12">
                      <CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Owner Management ({caseOwners.length})</CardTitle>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 bg-slate-50/50 dark:bg-white/[0.03] dark:border-white/[0.05] p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner shrink-0">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 gap-0 font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors" onClick={refreshCaseOwners} disabled={caseOwnerAction !== null} title="Refresh DB">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 gap-0 font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors" onClick={handleExportOwners} title="Export JSON">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <label className="inline-flex cursor-pointer group">
                        <input type="file" accept="application/json" className="hidden" onChange={handleImportOwners} disabled={caseOwnerAction !== null} />
                        <span className="flex items-center justify-center h-7 w-7 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-500/10 rounded-lg transition-colors" title="Import JSON">
                          <Upload className="h-3.5 w-3.5" />
                        </span>
                      </label>
                      <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 gap-0 font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" onClick={handleResetOwners} disabled={caseOwnerAction !== null} title="Reset default roster">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4 relative z-10 flex-1 flex flex-col min-h-0">
                  {/* Compact Add/Update Bar */}
                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto_auto] gap-2">
                      <input
                        type="text"
                        placeholder="Employee name..."
                        value={ownerForm.name}
                        onChange={(event) => setOwnerForm((prev) => ({ ...prev, name: event.target.value }))}
                        disabled={caseOwnerAction !== null}
                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/[0.03] dark:border-white/[0.05] px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-inner backdrop-blur-sm transition-all"
                      />
                      <input
                        type="text"
                        placeholder="005Ny00000..."
                        value={ownerForm.ownerId}
                        onChange={(event) => setOwnerForm((prev) => ({ ...prev, ownerId: event.target.value }))}
                        disabled={caseOwnerAction !== null}
                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/[0.03] dark:border-white/[0.05] px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-inner backdrop-blur-sm transition-all"
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
                    <div className="flex-1 relative min-h-[200px] w-full">
                      <div className="absolute inset-0 overflow-y-auto no-scrollbar space-y-2 pr-1 pb-4">
                      {caseOwnerLoadState === "loading" && (
                        <div className="p-8 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-white/[0.03] dark:border-white/[0.05]">
                          <RotateCcw className="h-6 w-6 animate-spin mb-3 text-blue-500" />
                          <span className="text-xs font-black uppercase tracking-widest">Syncing roster...</span>
                        </div>
                      )}
                      {caseOwnerLoadState !== "loading" && caseOwners.length === 0 && (
                        <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-white/[0.03] dark:border-white/[0.05]">
                          <Users className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">No employees saved</p>
                        </div>
                      )}
                      {caseOwners.map((owner) => (
                        <div key={owner.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-white/[0.03] dark:border-white/[0.05] hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/30 hover:shadow-md transition-all group backdrop-blur-sm shadow-inner">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shadow-inner", owner.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                              <span className={cn("h-2 w-2 rounded-full", owner.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-400")} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-foreground whitespace-normal break-words">{owner.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 break-all">{owner.ownerId}</span>
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
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Round Robin UI Cards (Only shown after generation) */}
            {caseAssignmentResult && (caseAssignMode === "equal" || caseAssignMode === "owner-wise") && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 items-start w-full">
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 relative group">
                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-inner">
                        <RefreshCw className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-black tracking-tight text-foreground">Round Robin Status</CardTitle>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Current Batch</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4 relative z-10 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-100/50 dark:bg-white/[0.03] dark:border-white/[0.05] p-2 rounded-lg">
                        <span className="text-[10px] uppercase font-bold text-slate-500">{caseAssignMode === "owner-wise" ? "Selected Owners" : "Active Owners"}</span>
                        <div className="font-black text-sm">{caseAssignMode === "owner-wise" ? selectedOwnerObjects.length : activeCaseOwners.length}</div>
                      </div>
                      <div className="bg-slate-100/50 dark:bg-white/[0.03] dark:border-white/[0.05] p-2 rounded-lg">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Base Cases / Owner</span>
                        <div className="font-black text-sm">{caseAssignmentResult.casesPerOwner}</div>
                      </div>
                      <div className="bg-slate-100/50 dark:bg-white/[0.03] dark:border-white/[0.05] p-2 rounded-lg">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Extra Cases</span>
                        <div className="font-black text-sm">{caseAssignmentResult.remainder}</div>
                      </div>
                      <div className="bg-slate-100/50 dark:bg-white/[0.03] dark:border-white/[0.05] p-2 rounded-lg">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Total Assigned</span>
                        <div className="font-black text-sm">{caseAssignmentResult.assignedCount}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-1">
                        <span>Starting Owner</span>
                        <span className="text-foreground font-black">{caseAssignmentResult.startOwner?.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-1">
                        <span>Next Start</span>
                        <span className="text-foreground font-black">{caseAssignmentResult.nextStartOwner?.name}</span>
                      </div>
                      {caseAssignmentResult.extraOwners && caseAssignmentResult.extraOwners.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Extra Case Owners:</span>
                          <div className="flex flex-wrap gap-1 mt-1 text-[10px] font-black text-slate-500 dark:text-slate-400">
                              {caseAssignmentResult.extraOwners.map(o => o.name).join(', ')}
                            </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 relative group">
                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                        <History className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-black tracking-tight text-foreground">Round Robin History</CardTitle>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Recent Batches</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 relative z-10 text-xs">
                    <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-3 px-5 pb-5">
                      {roundRobinHistory.length === 0 && <div className="text-slate-400 text-center py-4 text-[10px] font-bold uppercase tracking-widest">No history yet</div>}
                      {roundRobinHistory.map((entry, idx) => (
                        <div key={idx} className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-black text-foreground">Batch #{entry.batchId}</span>
                            <span className="text-[10px] font-bold text-slate-400">{entry.totalCases} cases</span>
                          </div>
                          <div className="text-[10px] space-y-1">
                            <div className="flex gap-2">
                              <span className="font-bold text-slate-500 uppercase w-10">Extra:</span>
                              <span className="text-slate-700 dark:text-slate-300 truncate flex-1">{entry.extraOwners.map(o => o.name).join(", ") || "None"}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-bold text-slate-500 uppercase w-10">Next:</span>
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{entry.nextStartOwner?.name || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 relative group">
                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <BarChart3 className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-black tracking-tight text-foreground">Cumulative Load</CardTitle>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fairness Tracker</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 relative z-10 text-xs">
                    <div className="px-5 pb-2 grid grid-cols-2 gap-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                      {(() => {
                        const loads = activeCaseOwners.map(o => (cumulativeLoad[o.ownerId] || { total: 0 }).total);
                        const max = loads.length ? Math.max(...loads) : 0;
                        const min = loads.length ? Math.min(...loads) : 0;
                        const diff = max - min;
                        return (
                          <>
                            <div className="text-[10px] uppercase font-bold text-slate-500 text-center bg-slate-50/50 dark:bg-white/[0.03] dark:border-white/[0.05] rounded-lg p-1.5"><span className="block text-slate-400 text-[8px]">Spread</span>{diff} cases</div>
                            <div className="text-[10px] uppercase font-bold text-slate-500 text-center bg-slate-50/50 dark:bg-white/[0.03] dark:border-white/[0.05] rounded-lg p-1.5"><span className="block text-slate-400 text-[8px]">Max Load</span>{max} cases</div>
                          </>
                        );
                      })()}
                    </div>
                    <div className="max-h-[170px] overflow-y-auto no-scrollbar px-5 pb-5">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[9px] font-black uppercase text-slate-400 border-b border-slate-200 dark:border-slate-700">
                            <th className="pb-1.5">Owner</th>
                            <th className="pb-1.5 text-right">Total</th>
                            <th className="pb-1.5 text-right">Extra</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {activeCaseOwners.map(owner => {
                            const load = cumulativeLoad[owner.ownerId] || { total: 0, extra: 0 };
                            return (
                              <tr key={owner.id} className="text-[11px] group">
                                <td className="py-1.5 font-medium truncate max-w-[100px] text-slate-700 dark:text-slate-300 group-hover:text-foreground">{owner.name}</td>
                                <td className="py-1.5 text-right font-black tabular-nums">{load.total}</td>
                                <td className="py-1.5 text-right font-mono text-[10px] text-slate-500">{load.extra}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              
              <Card className="flex flex-col flex-1 min-h-[320px] h-[350px] 2xl:h-full rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group transition-all duration-300">
                <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                  <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                    DEBUG
                  </span>
                </div>
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground flex-1 flex items-center justify-between">
                    <span>Processing Status</span>
                    <div className="flex gap-3 text-xs">
                      <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-md">
                        Valid: {customChildDetailsProcessor.count}
                      </span>
                      {customChildDetailsProcessor.skipped > 0 && (
                        <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 px-2 py-1 rounded-md">
                          Skipped: {customChildDetailsProcessor.skipped}
                        </span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4 relative z-10 flex-1 flex flex-col min-h-0">
                  <Textarea
                    readOnly
                    value={customChildDetailsProcessor.debug || "No errors. Ready."}
                    className={`flex-1 font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 dark:border dark:border-white/[0.05] shadow-none p-4 resize-none h-full min-h-0 ${customChildDetailsProcessor.skipped > 0 ? "text-red-500 focus-visible:ring-red-500/40 focus-visible:border-red-500" : "text-slate-500 focus-visible:ring-slate-500/40 focus-visible:border-slate-500"}`}
                  />
                </CardContent>
              </Card>
</div>
            )}
            
          </div>
          )}


          {!isTS && !isSA && !isAssetTransfer && !isChildDetailsToParent && !isCancellation && !isCaseAssign && (
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
}
