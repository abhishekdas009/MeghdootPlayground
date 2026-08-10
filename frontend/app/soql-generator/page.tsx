"use client";

import * as React from "react";
import * as xlsx from "xlsx";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { dashboardStore, useDashboardStore } from "@/lib/dashboard-store";
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
  Bookmark,
  Check,
  Activity,
  ArrowRight,
  RefreshCw,
  History,
  BarChart3,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Template {
  id: string;
  name: string;
  category: string;
  soql: string;
  favourite: boolean;
  type?: "normal" | "asset-transfer" | "child-details-to-parent";
  source?: "default" | "library";
  usageCount?: number;
}

interface AssetTransferPair {
  componentId: string;
  newCid: string;
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
const CANCELLATION_BATCH_SIZE = 400;

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
    soql: CANCELLATION_QUERY_TEMPLATE,
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
    soql: `SELECT Id,\nComponent_Id__c,\nParent.AccountId,\nParentId,\nRecordTypeId\nFROM Asset\nWHERE Component_Id__c IN (\n{{tickets}}\n)`,
    favourite: false,
    type: "child-details-to-parent",
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
const SOQL_BATCH_SIZE = 400;

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
    "WHERE Component_Id__c IN (",
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
    buildCSVRow(["_", "Id", "RecordTypeId", "ParentId", "AccountId"]),
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
          CHILD_DETAILS_PARENT_TARGET_RECORD_TYPE_ID,
          "",
          candidate.parentAccountId,
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

function buildCaseAssignmentRows(caseIds: string[]): CaseAssignmentRow[] {
  return caseIds.map((id) => ({ id, status: "Open" }));
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
  const shuffledRows = shuffleItems(rows);
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
  
  const assignments: Array<{ row: CaseAssignmentRow; owner: Pick<CaseOwner, "ownerId"> }> = [];
  let rowIndex = 0;

  shuffledOwners.forEach((owner) => {
    for (let i = 0; i < casesPerOwner; i++) {
      if (rowIndex < shuffledRows.length) {
        assignments.push({ row: shuffledRows[rowIndex]!, owner });
        rowIndex++;
      }
    }
  });

  const extraOwners: CaseOwner[] = [];
  let nextPointer = roundRobinPointer ?? 0;
  let startOwner: CaseOwner | undefined;
  let nextStartOwner: CaseOwner | undefined;

  if (isRoundRobin) {
    const startIndex = roundRobinPointer % owners.length;
    startOwner = owners[startIndex];
    
    for (let i = 0; i < remainder; i++) {
      const extraOwnerIndex = (startIndex + i) % owners.length;
      const owner = owners[extraOwnerIndex]!;
      extraOwners.push(owner);
      
      if (rowIndex < shuffledRows.length) {
         assignments.push({ row: shuffledRows[rowIndex]!, owner });
         rowIndex++;
      }
    }
    
    nextPointer = (startIndex + remainder) % owners.length;
    nextStartOwner = owners[nextPointer];
  } else {
    // If not round robin (e.g. owner-wise mode), we only assigned casesPerOwner * owners.length cases
    // and rowIndex is already correctly set to that amount.
  }

  return {
    output: buildCaseAssignmentOutput(assignments),
    assignedCount: assignments.length,
    unassignedCaseIds: shuffledRows.slice(rowIndex).map((row) => row.id),
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

  const shuffledRows = shuffleItems(rows);
  const assignments: Array<{ row: CaseAssignmentRow; owner: { ownerId: string } }> = [];
  let rowIndex = 0;

  selectedOwners.forEach((owner) => {
    for (let i = 0; i < owner.quantity; i += 1) {
      const row = shuffledRows[rowIndex];
      if (!row) break;
      assignments.push({ row, owner: { ownerId: owner.ownerId } });
      rowIndex += 1;
    }
  });

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
    <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 group relative h-full">
      <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
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
          <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
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
          <span className="block truncate text-sm font-bold leading-tight">{template.name}</span>
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
          "group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm transition-all duration-200",
          isOpen
            ? "border-blue-400/60 bg-white/90 text-slate-950 ring-2 ring-blue-400/20 dark:bg-slate-900 dark:text-white"
            : "border-slate-200/80 bg-white/75 text-slate-900 hover:border-sky-400/45 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-900"
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:text-blue-300">
          {selectedTemplate?.source === "library" ? <Bookmark className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold leading-tight">{selectedTemplate?.name ?? "Select a template"}</span>
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
              width: menuPosition.width,
              top: menuPosition.top,
              bottom: menuPosition.bottom,
              maxHeight: menuPosition.maxHeight,
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-3 py-2.5 dark:border-slate-700/70">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Choose a query template</span>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">{templates.length}</span>
            </div>
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

  const savedTicketsRef = React.useRef("");
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
    selectedTemplate === "15" || activeTemplate?.type === "child-details-to-parent";
  const isCaseAssign = selectedTemplate === "4";
  const isCancellation = selectedTemplate === "13" || selectedTemplate === "14" || selectedTemplate === "19" || (activeTemplate?.name?.toLowerCase()?.includes("cancellation") ?? false) || (activeTemplate?.name?.toLowerCase()?.includes("cancel") ?? false);

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
  const inputBatchSize = isCancellation ? CANCELLATION_BATCH_SIZE : SOQL_BATCH_SIZE;
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
      ? Math.ceil(uniqueExecutableCancellationRows.length / CANCELLATION_BATCH_SIZE)
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

  const caseAssignmentRows = React.useMemo(() => buildCaseAssignmentRows(parsedCaseIds), [parsedCaseIds]);

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
  const cancellationQueryBatches = React.useMemo(() => {
    if (parsedTickets.length === 0) {
      if (!activeTemplate?.soql?.includes("{{tickets}}") && activeTemplate?.soql) {
        return [activeTemplate.soql];
      }
      return [];
    }

    const templateSoql = activeTemplate?.soql || CANCELLATION_QUERY_TEMPLATE;

    return chunkArray(parsedTickets, CANCELLATION_BATCH_SIZE).map((tickets) =>
      templateSoql.replace("{{tickets}}", formatTicketsForSOQL(tickets))
    );
  }, [formatTicketsForSOQL, parsedTickets, activeTemplate]);

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

  const childDetailsSOQLBatches = React.useMemo(
    () =>
      chunkArray(childDetailsComponentIds, SOQL_BATCH_SIZE).map((componentIds) =>
        buildChildDetailsParentSOQL(componentIds)
      ),
    [childDetailsComponentIds]
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
        const workbook = xlsx.read(buffer, { type: "array" });
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          if (sheet) {
            textContent += xlsx.utils.sheet_to_csv(sheet) + "\n";
          }
        });
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
    if (selectedTemplate === "1" && ticketsInput.trim()) {
      savedTicketsRef.current = ticketsInput;
    }

    setTicketsInput("");
    setAssetTransferInput("");
    setAssetSOQLResult("");
    setAccountSOQLResult("");
    setTransferOutput("");
    setTransferDebug("");
    setChildDetailsComponentInput("");
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
    setAssetTransferInput("");
    setAssetSOQLResult("");
    setAccountSOQLResult("");
    setTransferOutput("");
    setTransferDebug("");
    setChildDetailsComponentInput("");
    setChildDetailsSOQLResult("");
    setChildDetailsOutput("");
    setChildDetailsTransformResult(null);
    setChildDetailsBatchIndex(0);
    setCancellationExecutionInput("");
    setCancellationFailedInput("");
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
                <Badge className="bg-[#0176d3]/10 text-blue-700 border border-[#0176d3]/30 text-[10px] sm:text-xs font-bold px-3 py-1 flex items-center gap-1.5 shadow-inner backdrop-blur-sm uppercase tracking-widest dark:bg-[#0176d3]/20 dark:text-blue-300 dark:border-[#0176d3]/40">
                  SALESFORCE DEVELOPER TOOLS
                </Badge>
                <Badge className="bg-white/60 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-1 shadow-inner backdrop-blur-sm hidden sm:inline-flex dark:bg-white/10 dark:text-slate-300 dark:border-white/20">
                  Lightning v2.4
                </Badge>
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

      {showStats && !isAssetTransfer && !isChildDetailsToParent && !isCaseAssign && (
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

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-12 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0"
        >
          <Card className="rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden group">
            <CardHeader className="pb-4 bg-transparent relative z-10 p-6">
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
              <TemplatePicker
                templates={templates}
                value={selectedTemplate}
                onChange={handleTemplateChange}
              />

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

          {showStats && !isAssetTransfer && !isChildDetailsToParent && !isCaseAssign && (
            <Card className="rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden group">
              <CardHeader className="pb-4 bg-transparent p-6">
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



          {!isAssetTransfer && !isChildDetailsToParent && (
            <Card className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden">
              <CardHeader className="pb-4 bg-transparent p-6 relative">
                <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2">
                  {!isCaseAssign && (
                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 shadow-sm flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white shadow-inner">1</span>
                      Step 1
                    </Badge>
                  )}
                  <CardTitle className="text-base font-black tracking-tight flex-1">
                    {isCancellation ? "Paste Cancellation Tickets" : isCaseAssign ? "Upload or Paste Case IDs" : "Paste Ticket Numbers"}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col relative z-10">
                {isCaseAssign && (
                  <div className="flex flex-col space-y-4">
                    <div 
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleFileUpload}
                      className={cn(
                        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 min-h-[200px] text-center transition-all duration-200 overflow-hidden w-full mx-auto",
                        uploadState === "reading" || uploadState === "scanning" || uploadState === "validating" 
                          ? "border-blue-400/50 bg-blue-50/50 dark:bg-blue-900/10" 
                          : isDragging 
                            ? "border-[#0176d3] bg-[#0176d3]/10 scale-[1.02] shadow-sm"
                            : "border-slate-300 dark:border-slate-700 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      )}
                    >
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
                      <Textarea
                        placeholder={`Paste ticket numbers here...\nA26060134750678\nA26060134750476\nA26060134750619`}
                        className="flex-1 font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-none p-4 resize-y min-h-[320px]"
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
                      <p className="border-l-2 border-blue-400/40 py-1 pl-3 text-xs font-medium leading-relaxed text-muted-foreground">
                        Supports spaces, commas, tabs, or newlines. Values are automatically chunked into {inputBatchSize}-value batches for Salesforce-safe SOQL.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                        {parsedTickets.length === 0 ? "No tickets" : `${parsedTickets.length} ticket${parsedTickets.length === 1 ? "" : "s"}`}
                      </Badge>
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                        {inputBatchCount === 0 ? "0 batches" : `${inputBatchCount} batch${inputBatchCount === 1 ? "" : "es"}`}
                      </Badge>
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                        Max {inputBatchSize} / block
                      </Badge>
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
            <Card className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden">
              <CardHeader className="pb-4 bg-transparent p-6 relative">
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
                    className="flex-1 min-h-[220px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-none p-4 resize-y"
                    value={assetTransferInput}
                    onChange={(event) => setAssetTransferInput(event.target.value)}
                  />
                  <p className="border-l-2 border-blue-400/40 py-1 pl-3 text-xs font-medium leading-relaxed text-muted-foreground">
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
          className="2xl:col-span-9 xl:col-span-8 grid grid-cols-1 2xl:grid-cols-2 gap-6 min-w-0"
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

              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
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
                  <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
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

              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
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
                  <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
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

          {isChildDetailsToParent && (
            <div className="xl:col-span-2 space-y-3">
              <div className="rounded-2xl border border-slate-200/50 bg-white/45 p-2.5 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { step: "1", label: "Component IDs", active: childDetailsComponentIds.length > 0 },
                    { step: "2", label: "Salesforce Result", active: childDetailsSOQLResult.trim().length > 0 },
                    { step: "3", label: "Parent CSV", active: childDetailsOutput.trim().length > 0 },
                  ].map((item) => (
                    <div key={item.step} className={cn("flex min-h-12 items-center gap-2 rounded-xl border px-2.5 py-2 transition-all", item.active ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-slate-200/70 bg-white/35 text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/40")}>
                      <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black shadow-inner", item.active ? "bg-emerald-500 text-white" : "bg-blue-500 text-white")}>{item.step}</span>
                      <span className="min-w-0 text-[12px] font-black leading-tight">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                <Card className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45">
                  <CardHeader className="p-4 pb-3 bg-transparent relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-black text-white shadow-inner">1</span>
                          <CardTitle className="text-sm font-black leading-tight text-foreground">Paste Component IDs</CardTitle>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500">Clean IDs and generate the Asset query.</p>
                      </div>
                      <Badge className="shrink-0 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-black text-emerald-600 shadow-sm dark:text-emerald-300">AUTO</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3 relative z-10">
                    <Textarea
                      placeholder={`2400895187\n2400895188\n2400895189`}
                      className="h-[118px] min-h-[118px] resize-none rounded-xl border border-transparent bg-slate-100/40 p-3 font-mono text-xs leading-relaxed shadow-none focus-visible:border-blue-500 focus-visible:ring-blue-500/40 dark:bg-black/20"
                      value={childDetailsComponentInput}
                      onChange={(event) => setChildDetailsComponentInput(event.target.value)}
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {childDetailsInputStats.map((item) => (
                        <div key={item.label} className={cn("rounded-xl border px-2 py-2 shadow-inner", item.tone === "blue" && "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300", item.tone === "amber" && "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300", item.tone === "rose" && "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300", item.tone === "emerald" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300")}>
                          <div className="text-base font-black tabular-nums leading-none">{item.value}</div>
                          <div className="mt-1 text-[8px] font-black uppercase leading-tight opacity-75">{item.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-slate-50/60 shadow-inner dark:border-slate-700/60 dark:bg-slate-900/50">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 px-3 py-2 dark:border-slate-700/60">
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500">
                          <Terminal className="h-3.5 w-3.5 text-blue-500" />
                          Batch {childDetailsSOQLBatches.length ? childDetailsBatchIndex + 1 : 0}/{childDetailsSOQLBatches.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 rounded-lg p-0 text-slate-400 hover:bg-blue-500/10 hover:text-blue-600" disabled={childDetailsBatchIndex <= 0} onClick={() => setChildDetailsBatchIndex((value) => Math.max(0, value - 1))} title="Previous query batch">
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 rounded-lg p-0 text-slate-400 hover:bg-blue-500/10 hover:text-blue-600" disabled={childDetailsBatchIndex >= childDetailsSOQLBatches.length - 1} onClick={() => setChildDetailsBatchIndex((value) => Math.min(childDetailsSOQLBatches.length - 1, value + 1))} title="Next query batch">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 rounded-lg px-2 text-[11px] font-bold text-slate-500 hover:bg-blue-500/10 hover:text-blue-600" onClick={() => handleCopy(childDetailsCurrentSOQLBatch)} disabled={!childDetailsCurrentSOQLBatch}>
                            <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 rounded-lg px-2 text-[11px] font-bold text-slate-500 hover:bg-blue-500/10 hover:text-blue-600" onClick={handleDownloadChildDetailsQuery} disabled={childDetailsSOQLBatches.length === 0}>
                            <Download className="mr-1 h-3.5 w-3.5" /> SOQL
                          </Button>
                        </div>
                      </div>
                      <pre className="h-[155px] overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[11px] leading-relaxed text-slate-800 selection:bg-blue-500/20 selection:text-blue-900 dark:text-sky-200 dark:selection:text-blue-100">
                        {childDetailsCurrentSOQLBatch || "Paste valid Component IDs to generate the Asset SOQL query"}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45">
                  <CardHeader className="p-4 pb-3 bg-transparent relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-xs font-black text-white shadow-inner">2</span>
                          <CardTitle className="text-sm font-black leading-tight text-foreground">Paste Salesforce Result</CardTitle>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500">Validate export rows before CSV.</p>
                      </div>
                      <Badge className={cn("shrink-0 border px-2 py-1 text-[10px] font-black shadow-sm", childDetailsVisibleResult?.missingHeaders.length ? "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20" : childDetailsVisibleResult ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700")}>
                        {childDetailsVisibleResult?.missingHeaders.length ? "FIX" : childDetailsVisibleResult ? "VALID" : "WAIT"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3 relative z-10">
                    <Textarea
                      placeholder={`"_","Id","Component_Id__c","Parent.AccountId"\n"[Asset]","02iNy00000CKkhCIAT","2400895187","001Ny00001iPnOgIAK"`}
                      className="h-[210px] min-h-[210px] resize-none rounded-xl border border-transparent bg-slate-100/40 p-3 font-mono text-[11px] leading-relaxed shadow-none focus-visible:border-indigo-500 focus-visible:ring-indigo-500/40 dark:bg-black/20"
                      value={childDetailsSOQLResult}
                      onChange={(event) => setChildDetailsSOQLResult(event.target.value)}
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: "Rows", value: childDetailsVisibleResult?.sourceRows ?? 0 },
                        { label: "Ready", value: childDetailsVisibleResult?.generatedRows ?? 0 },
                        { label: "Columns", value: childDetailsVisibleResult?.missingHeaders.length ?? 0 },
                        { label: "Skipped", value: childDetailsVisibleResult?.skippedRows ?? 0 },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-slate-200/60 bg-white/45 px-2 py-2 text-slate-600 shadow-inner dark:border-slate-700/60 dark:bg-slate-900/50 dark:text-slate-300">
                          <div className="text-base font-black leading-none tabular-nums">{item.value}</div>
                          <div className="mt-1 text-[8px] font-black uppercase leading-tight text-slate-400">{item.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className={cn("h-[90px] overflow-auto rounded-xl border px-3 py-2.5", !childDetailsVisibleResult ? "border-slate-200/70 bg-slate-50/70 text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/40" : childDetailsValidationIssues.some((issue) => issue.tone === "danger") ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-200" : childDetailsValidationIssues.length > 0 ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200")}>
                      <div className="flex items-start gap-2">
                        {!childDetailsVisibleResult ? (
                          <Filter className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                        ) : childDetailsValidationIssues.length > 0 ? (
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-black uppercase">
                            {!childDetailsVisibleResult ? "Validation" : childDetailsValidationIssues.length > 0 ? "Review" : "Ready"}
                          </div>
                          <div className="mt-1 space-y-1 text-[11px] font-semibold leading-relaxed">
                            {!childDetailsVisibleResult ? (
                              <p>Paste export to validate columns and rows.</p>
                            ) : childDetailsValidationIssues.length > 0 ? (
                              childDetailsValidationIssues.map((issue) => <p key={issue.label}>{issue.label}</p>)
                            ) : (
                              <p>Required columns are present and rows are import-ready.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45">
                  <CardHeader className="p-4 pb-3 bg-transparent relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white shadow-inner">3</span>
                          <CardTitle className="text-sm font-black leading-tight text-foreground">Generate Parent CSV</CardTitle>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500">Fixed RecordTypeId and blank ParentId.</p>
                      </div>
                      <Badge className="shrink-0 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-black text-emerald-600 shadow-sm dark:text-emerald-300">CSV</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3 relative z-10">
                    <Button className="h-9 w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-[12px] font-black text-white shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:from-emerald-500 hover:to-teal-500" onClick={handleProcessChildDetailsToParent}>
                      <FileSpreadsheet className="h-4 w-4" /> Generate Parent Asset CSV
                    </Button>

                    <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-slate-50/60 shadow-inner dark:border-slate-700/60 dark:bg-slate-900/50">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 px-3 py-2 dark:border-slate-700/60">
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500">
                          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" /> Output CSV
                        </span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 rounded-lg px-2 text-[11px] font-bold text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-600" onClick={() => handleCopy(childDetailsOutput)} disabled={!childDetailsOutput}>
                            <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 rounded-lg px-2 text-[11px] font-bold text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-600" onClick={handleDownloadChildDetailsToParent} disabled={!childDetailsOutput}>
                            <Download className="mr-1 h-3.5 w-3.5" /> CSV
                          </Button>
                        </div>
                      </div>
                      <pre className="h-[145px] overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[11px] leading-relaxed text-slate-800 selection:bg-emerald-500/20 selection:text-emerald-900 dark:text-emerald-200 dark:selection:text-emerald-100">
                        {childDetailsOutput || `"_","Id","RecordTypeId","ParentId","AccountId"\n"[Asset]","02iNy00000CKkhCIAT","${CHILD_DETAILS_PARENT_TARGET_RECORD_TYPE_ID}","","001Ny00001iPnOgIAK"`}
                      </pre>
                    </div>

                    {childDetailsTransformResult && (
                      <div className={cn("rounded-xl border px-3 py-2 text-[11px] font-bold leading-relaxed", childDetailsTransformResult.generatedRows > 0 ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200" : "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-200")}>
                        {childDetailsTransformResult.generatedRows > 0 ? `${childDetailsTransformResult.generatedRows} row${childDetailsTransformResult.generatedRows === 1 ? "" : "s"} generated for Data Loader.` : "No rows generated. Fix validation and try again."}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {childDetailsSummaryStats.map((item) => (
                        <div key={item.label} className={cn("rounded-xl border px-2 py-2 shadow-inner", item.tone === "blue" && "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300", item.tone === "slate" && "border-slate-200/70 bg-slate-50/70 text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/50 dark:text-slate-300", item.tone === "emerald" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", item.tone === "amber" && "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300", item.tone === "rose" && "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300")}>
                          <div className="text-sm font-black leading-none tabular-nums">{item.value}</div>
                          <div className="mt-1 text-[8px] font-black uppercase leading-tight opacity-75">{item.label}</div>
                        </div>
                      ))}
                    </div>

                    {childDetailsVisibleResult?.missingComponentIds.length ? (
                      <div className="max-h-[54px] overflow-auto rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] font-semibold leading-relaxed text-amber-700 dark:text-amber-200">
                        Missing: {childDetailsVisibleResult.missingComponentIds.slice(0, 8).join(", ")}
                        {childDetailsVisibleResult.missingComponentIds.length > 8 ? "..." : ""}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {isAssetTransfer && (
            <>
              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
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
                  <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
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

              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
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
                  <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
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

              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col xl:col-span-2 transition-all duration-300 group relative">
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
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
                        className="flex-1 min-h-[160px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-fuchsia-500/40 focus-visible:border-fuchsia-500 shadow-none p-4 resize-y"
                        value={assetSOQLResult}
                        onChange={(event) => setAssetSOQLResult(event.target.value)}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">Account SOQL Result</label>
                      <Textarea
                        placeholder={`Paste Account SOQL result here...\n"_"\t"Customer_ID__c"\t"Id"`}
                        className="flex-1 min-h-[160px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-fuchsia-500/40 focus-visible:border-fuchsia-500 shadow-none p-4 resize-y"
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
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col xl:col-span-2 transition-all duration-300 group relative">
                  <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
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
                    <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                      <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 max-h-[320px] min-h-0 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">
                        {transferOutput}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {transferDebug && (
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col xl:col-span-2 transition-all duration-300 group relative">
                  <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
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
                    <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
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
              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4 items-start">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-inner mt-1">
                        <Terminal className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">Step 2</Badge>
                          <CardTitle className="text-base font-black tracking-tight text-foreground">Cancellation SOQL Batches</CardTitle>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Status not completed, 500 tickets per query
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm self-start">
                      {cancellationQueryBatches.length} batch{cancellationQueryBatches.length === 1 ? "" : "es"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-5 space-y-4 flex-1 flex flex-col relative z-10">
                  {cancellationQueryBatches.length > 0 ? (
                    <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2.5">
                        <span className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">
                          Batch {Math.min(cancellationExecutionBatchIndex + 1, cancellationQueryBatches.length)} / {cancellationQueryBatches.length}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors" disabled={cancellationExecutionBatchIndex <= 0} onClick={() => setCancellationExecutionBatchIndex((value) => Math.max(0, value - 1))}>
                            <ChevronLeft className="h-4.5 w-4.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors" disabled={cancellationExecutionBatchIndex >= cancellationQueryBatches.length - 1} onClick={() => setCancellationExecutionBatchIndex((value) => Math.min(cancellationQueryBatches.length - 1, value + 1))}>
                            <ChevronRight className="h-4.5 w-4.5" />
                          </Button>
                          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1.5" />
                          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 px-3 text-xs font-bold rounded-lg transition-colors" onClick={() => handleCopy(cancellationQueryBatches[cancellationExecutionBatchIndex] ?? "")}>
                            <Copy className="h-3.5 w-3.5 text-rose-400" /> Copy
                          </Button>
                        </div>
                      </div>
                      <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-rose-200 min-h-0 max-h-[320px] selection:bg-rose-500/20 selection:text-rose-900 dark:selection:text-rose-100">
                        {cancellationQueryBatches[cancellationExecutionBatchIndex] ?? ""}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-8 text-center shadow-inner">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-400 mb-3 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
                        <PlayCircle className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-black text-foreground max-w-[250px] mx-auto">Paste tickets on the left to generate the cancellation query</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 transition-all shadow-sm" onClick={() => handleCopy(cancellationQueryBatches.join("\n\n"))} disabled={cancellationQueryBatches.length === 0}>
                      <Copy className="h-4 w-4 mr-1.5" /> Copy All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">Step 3</Badge>
                          <CardTitle className="text-base font-black tracking-tight text-foreground">Paste SOQL Result Batch</CardTitle>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Each paste is stored and converted to Canceled
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm self-start">
                      {cancellationResultBatchCount} stored batch{cancellationResultBatchCount === 1 ? "" : "es"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 gap-4 relative z-10">
                  <Textarea
                    placeholder={`Paste Salesforce SOQL result here...\n"_"\t"Id"\t"Ticket_Number_Read_Only__c"\t"Status"\n"[WorkOrder]"\t"0WONy000008eHgfOAE"\t"B25031925463529"\t"Cancellation Requested"`}
                    className="flex-1 min-h-[220px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-none p-4 resize-y"
                    value={cancellationExecutionInput}
                    onPaste={handleCancellationResultPaste}
                    onChange={(event) => handleCancellationResultInputChange(event.target.value)}
                  />

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Pasted tickets: {parsedTickets.length}</Badge>
                    <Badge className="bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Parsed: {cancellationExecutionRows.length}</Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Stored: {uniqueExecutableCancellationRows.length}</Badge>
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Remaining: {cancellationRemainingTicketCount}</Badge>
                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Matched: {cancellationMatchedTicketCount}</Badge>
                    {cancellationUnexpectedResultCount > 0 && (
                      <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Outside pasted tickets: {cancellationUnexpectedResultCount}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col 2xl:col-span-1 transition-all duration-300 group relative">
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">Final</Badge>
                          <CardTitle className="text-base font-black tracking-tight text-foreground">All Records</CardTitle>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Copy table when done
                        </p>
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
                  <div className="flex flex-wrap gap-2.5">
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Pasted: {parsedTickets.length}</Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Rows: {uniqueExecutableCancellationRows.length}</Badge>
                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">Status: Canceled</Badge>
                  </div>
                  <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                    <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-sky-200 min-h-[180px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100">
                      {uniqueExecutableCancellationRows.length > 0
                        ? cancellationCanceledOutput
                        : "\"_\"\t\"Id\"\t\"Ticket_Number_Read_Only__c\"\t\"Status\"\n\"[WorkOrder]\"\t\"0WONy000008eHgfOAE\"\t\"B25031925463529\"\t\"Canceled\""}
                    </pre>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col 2xl:col-span-1 transition-all duration-300 group relative">
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">Step 4 (Optional)</Badge>
                        <CardTitle className="text-base font-black tracking-tight text-foreground">Paste Failed Results</CardTitle>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Paste failed tickets to generate stats
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 gap-4 relative z-10">
                  <Textarea
                    placeholder={`Paste Salesforce SOQL result of FAILED tickets here...\n"_"\t"Id"\t"Ticket_Number_Read_Only__c"\t"Status"\n"[WorkOrder]"\t"0WONy000008eHgfOAE"\t"B25031925463529"\t"Cancellation Requested"`}
                    className="flex-1 min-h-[180px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-amber-500/40 focus-visible:border-amber-500 shadow-none p-4 resize-y"
                    value={cancellationFailedInput}
                    onChange={(event) => setCancellationFailedInput(event.target.value)}
                  />
                </CardContent>
              </Card>

              {(() => {
                const cancellationTotalTickets = parsedTickets.length;
                const hasFailedInput = cancellationFailedInput.trim().length > 0;
                
                // Extract tickets using regex: first a letter, then numbers
                const cancellationFailedTickets = Array.from(new Set(cancellationFailedInput.match(/[a-zA-Z]\d{5,20}/g) || []));
                
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
                      <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                              <Mail className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-base font-black tracking-tight text-foreground">Email Template Output</CardTitle>
                          </div>
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(mailTemplateText)}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                        <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                          <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 min-h-[160px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100">
                            {mailTemplateText}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                      <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-inner">
                              <MessageSquare className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-base font-black tracking-tight text-foreground">Post Template Output</CardTitle>
                          </div>
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-indigo-500/10 hover:text-indigo-600 hover:border-indigo-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(postTemplateText)}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                        <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                          <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 min-h-[160px] max-h-[320px] selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-100">
                            {postTemplateText}
                          </pre>
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
                    <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
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
            <div className="space-y-6 w-full">
              <div className="col-span-1 2xl:col-span-2 xl:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                {/* === LEFT WORKBENCH COLUMN === */}
              <div className="space-y-4 flex flex-col">
                {/* Assignment Mode & Quick Execute Control Box */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 relative group">
                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-inner">
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        </div>
                        <CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Assignment Mode &amp; Execution</CardTitle>
                      </div>
                      <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20 shadow-sm">Randomized</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">{caseAssignmentRows.length} valid IDs</Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">Open status</Badge>
                      <Badge variant={caseOwnerLoadState === "error" ? "danger" : "outline"} className={cn("text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm", caseOwnerLoadState === "error" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20")}>
                        {caseOwnerLoadState === "loading" ? "Roster syncing" : caseOwnerLoadState === "error" ? "Roster offline" : `${activeCaseOwners.length} active owners`}
                      </Badge>
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
                        <span className="leading-relaxed">
                          Securely shuffles Case IDs, then gives every active owner exactly {activeCaseOwners.length ? Math.floor(caseAssignmentRows.length / activeCaseOwners.length) : 0} case{activeCaseOwners.length && Math.floor(caseAssignmentRows.length / activeCaseOwners.length) === 1 ? "" : "s"}. {activeCaseOwners.length ? caseAssignmentRows.length % activeCaseOwners.length : caseAssignmentRows.length} remainder case{(activeCaseOwners.length ? caseAssignmentRows.length % activeCaseOwners.length : caseAssignmentRows.length) === 1 ? " is" : "s are"} left unassigned.
                        </span>
                      </div>
                    )}

                    {caseAssignMode === "owner-wise" && (
                      <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3 shadow-inner backdrop-blur-sm">
                        <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">
                          <span>Target Owners</span>
                          <span className="bg-purple-500/10 text-purple-600 border border-purple-500/20 px-2 py-0.5 rounded-md">{selectedOwnerIds.length} selected</span>
                        </div>
                        <p className="text-[11px] leading-relaxed font-medium text-slate-500">
                          Selected owners receive an equal whole-number share after the Case IDs are shuffled. Any remainder stays unassigned.
                        </p>
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
                        <p className="text-[11px] leading-relaxed font-medium text-slate-500">
                          Set any whole-number quantity per owner. IDs are shuffled before assignment; any unallocated IDs remain unassigned.
                        </p>
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
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 relative group">
                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                        <Terminal className="h-4.5 w-4.5" />
                      </div>
                      <CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Or Paste Manually</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4 relative z-10 flex-1 flex flex-col min-h-[220px]">
                    <div className="flex-1 flex flex-col space-y-2 h-full">
                      <Textarea
                        placeholder={`Paste Case IDs here...\n1\n500Ny00001RnGoS\n2\n500Ny00001RnTVV`}
                        className="flex-1 font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-none p-4 resize-y min-h-[140px]"
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
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                        {parsedCaseIds.length === 0 ? "No case ids" : `${parsedCaseIds.length} case id${parsedCaseIds.length === 1 ? "" : "s"}`}
                      </Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                        Open by default
                      </Badge>
                      <div className="flex-1" />
                      <Button variant="outline" size="sm" className="gap-2 h-10 px-4 rounded-xl text-xs hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all font-bold border-slate-200 dark:border-slate-700" onClick={handleClear}>
                        <Trash2 className="h-4 w-4" /> Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* === RIGHT RESULTS & MASTER MANAGEMENT COLUMN === */}
              <div className="space-y-4 flex flex-col">
                {/* 1. Assignment Output Box (Right at the Top so you see results without scrolling!) */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 relative group">
                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
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
                    {caseAssignmentResult && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">
                          {caseAssignmentResult.assignedCount} assigned
                        </Badge>
                        <Badge className={cn("text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm border", caseAssignmentResult.unassignedCaseIds.length ? "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700")}>
                          {caseAssignmentResult.unassignedCaseIds.length} unassigned
                        </Badge>
                        {caseAssignMode !== "quantity-wise" && (
                          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">
                            {caseAssignmentResult.casesPerOwner} each
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-5 relative z-10">
                    <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                      <pre className="overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 h-[140px] max-h-[140px] no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">
                        {caseAssignOutput || `"_","Id","Status","OwnerId"\n"[Case]","500Ny00001RpOgFIAV","Open","005Ny00000QgwYTIAZ"`}
                      </pre>
                    </div>
                    {caseAssignmentResult && caseAssignmentResult.unassignedCaseIds.length > 0 && (
                      <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-[11px] leading-relaxed text-amber-700 dark:text-amber-200">
                        <strong className="font-black">{caseAssignmentResult.unassignedCaseIds.length} Case ID{caseAssignmentResult.unassignedCaseIds.length === 1 ? "" : "s"} not included:</strong>{" "}
                        Kept out of this Data Loader file by the current allocation. {caseAssignmentResult.unassignedCaseIds.slice(0, 3).join(", ")}{caseAssignmentResult.unassignedCaseIds.length > 3 ? "…" : ""}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2. Compact High-Density Owner Master Management */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col flex-1 transition-all duration-300 relative group">
                  <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                          <Users className="h-4.5 w-4.5" />
                        </div>
                        <CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Owner Master Roster ({caseOwners.length})</CardTitle>
                      </div>
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner shrink-0">
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

                  <CardContent className="p-5 space-y-4 relative z-10">
                    {/* Compact Add/Update Bar */}
                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto_auto] gap-2">
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

            {/* Round Robin UI Cards (Only shown after generation) */}
            {caseAssignmentResult && caseAssignMode === "equal" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6 items-start">
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 relative group">
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
                      <div className="bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-lg">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Active Owners</span>
                        <div className="font-black text-sm">{activeCaseOwners.length}</div>
                      </div>
                      <div className="bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-lg">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Base Cases / Owner</span>
                        <div className="font-black text-sm">{caseAssignmentResult.casesPerOwner}</div>
                      </div>
                      <div className="bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-lg">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Extra Cases</span>
                        <div className="font-black text-sm">{caseAssignmentResult.remainder}</div>
                      </div>
                      <div className="bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-lg">
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
                          <div className="flex flex-wrap gap-1 mt-1">
                            {caseAssignmentResult.extraOwners.map(o => (
                              <Badge key={o.id} className="bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[9px] px-1.5 py-0">{o.name}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 relative group">
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

                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 relative group">
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
                            <div className="text-[10px] uppercase font-bold text-slate-500 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-lg p-1.5"><span className="block text-slate-400 text-[8px]">Spread</span>{diff} cases</div>
                            <div className="text-[10px] uppercase font-bold text-slate-500 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-lg p-1.5"><span className="block text-slate-400 text-[8px]">Max Load</span>{max} cases</div>
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
