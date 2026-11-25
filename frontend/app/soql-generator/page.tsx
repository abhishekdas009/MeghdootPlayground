"use client";







import * as React from "react";



import * as xlsx from "xlsx";



import { createPortal } from "react-dom";



import { motion, AnimatePresence } from "framer-motion";



import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";



import { Button } from "@/components/ui/button";



import { Textarea } from "@/components/ui/textarea";



import { SOQLHighlighter } from "@/components/ui/soql-highlighter";







import { SOQLRelationshipGraph } from "@/components/soql/soql-relationship-graph";



import { Network, Info } from "lucide-react";



import { Badge } from "@/components/ui/badge";



import { toast } from "sonner";



import { cn } from "@/lib/utils";



import { dashboardStore, useDashboardStore } from "@/lib/dashboard-store";



import { trackDashboardEvent } from "@/lib/dashboard-tracker";



import { classifyTicketPrefix, processAlgo1TicketClassification, processAlgo1CcoStep3Classification, type CcoAlgoResult, type CcoTicketItem, processAlgo2NamoClassification, type NamoAlgo2Result, processAlgo3NonNamoClassification, type NonNamoAlgo3Result, processAccountCheckClassification, type AccountCheckResult, type AccountCheckRow, buildNonNamoExecutionSummary, buildNamoExecutionSummary, isEntityLockedError, parseCancellationFailedResults, type ParsedFailedResult, buildCancellationStep5Output, isStatusCanceled, isStatusCompleted } from "@/lib/cancellation-algo";
import { downloadExcludedInsightsExcel } from "@/lib/cancellation-excel";
import { parseAssetTransferPairs } from "@/lib/parsers";



import {



  Copy,



  ExternalLink,



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



  GitCompare,



  Search,



  X,



  FileSearch,



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



  isMaterialConsumed?: boolean;



  isApprovalSent?: boolean;



  accountGroup?: string;



  resultStatus?: string;



  errorMessage?: string;



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



    soql: `SELECT Id, Ticket_Number_Read_Only__c, Status\nFROM WorkOrder\nWHERE ParentWorkOrderId = null and Status not in ('Completed','Canceled') AND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)`,



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



const SALESFORCE_TICKET_REGEX = /(?:^|[^A-Za-z0-9])([BISXCAD]\d{8,})(?![A-Za-z0-9])/gi;











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







function cleanHeader(value?: string | null): string {



  return String(value ?? "").replace(/["\[\]]/g, "").trim().toLowerCase().replace(/[^a-z0-9_.]/g, "");



}







function cleanValue(value?: string | null): string {



  return String(value ?? "")



    .replace(/^\uFEFF/, "")



    .replace(/[\u00A0\u200B\u200C\u200D]/g, " ")



    .replace(/^["']+|["']+$/g, "")



    .replace(/["\[\]]/g, "")



    .trim();



}







function cleanTicket(ticket?: string | null): string {
  if (!ticket || isEntityLockedError(ticket)) return "";
  return String(ticket)
    .replace(/['"\s\u00A0\u200B\uFEFF[\]]+/g, "")
    .toUpperCase();
}







function cleanSalesforceId(id?: string | null): string {



  return String(id ?? "")



    .replace(/['"\s\u00A0\u200B\uFEFF[\]]+/g, "")



    .trim();



}







function parseCSVLine(line: string): string[] {



  const cleanLine = line



    .replace(/^\uFEFF/, "")



    .replace(/[\u00A0\u200B\u200C\u200D]/g, " ")



    .trim();







  if (!cleanLine) return [];







  // 1. Tab separated (TSV, Excel copy)



  if (cleanLine.includes("\t")) {



    return cleanLine.split("\t").map(cleanValue);



  }







  // 2. Space-separated tokens / Workbench table (e.g. "_" "Id" or _ "Id" or "[WorkOrder]" "0WO...")
  if (/"\s+"/.test(cleanLine) || /^"[^"]+"\s+/.test(cleanLine) || /\s{2,}/.test(cleanLine)) {
    const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
    const tokens: string[] = [];
    let m = regex.exec(cleanLine);
    while (m) {
      const g1 = m[1];
      const g2 = m[2];
      const g3 = m[3];
      const val = (g1 !== undefined ? g1 : (g2 !== undefined ? g2 : (g3 ?? ""))).trim();
      tokens.push(val);
      m = regex.exec(cleanLine);
    }
    if (tokens.length > 1) {
      return tokens;
    }
  }







  // 3. Pipe-separated



  if (cleanLine.includes("|")) {



    return cleanLine.split("|").map(cleanValue);



  }







  // 4. Comma-separated (CSV with quoted fields)



  if (cleanLine.includes(",")) {



    const values: string[] = [];



    let current = "";



    let inQuotes = false;



    let i = 0;







    while (i < cleanLine.length) {



      const char = cleanLine[i];



      const nextChar = cleanLine[i + 1];







      if (char === '"') {



        if (inQuotes && nextChar === '"') {



          current += '"';



          i += 2;



        } else {



          inQuotes = !inQuotes;



          i += 1;



        }



      } else if (char === "," && !inQuotes) {



        values.push(cleanValue(current));



        current = "";



        i += 1;



      } else {



        current += char;



        i += 1;



      }



    }



    values.push(cleanValue(current));



    return values;



  }







  // 5. Multi-space separated (fixed width / terminal / dev console)



  if (/\s{2,}/.test(cleanLine)) {



    return cleanLine.split(/\s{2,}/).map(cleanValue);



  }







  return cleanLine.split(/\s+/).map(cleanValue);



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







    let values = parseCSVLine(trimmed);



    if (values.length === 0) continue;







    const lowerValues = values.map((v) => cleanHeader(v));



    const firstVal = cleanValue(values[0] ?? "").toLowerCase();



    const isRecordPrefix = firstVal === "asset" || firstVal === "account" || firstVal === "case" || firstVal === "contact" || firstVal === "workorder";



    const hasSalesforceId = values.some((v) => SALESFORCE_ID_REGEX.test(cleanSalesforceId(v)));







    const isHeaderLine =



      !hasSalesforceId &&



      !isRecordPrefix &&



      lowerValues.some((v) =>



        v === "id" ||



        v.endsWith(".id") ||



        v === "workorderid" ||



        v.includes("ticket") ||



        v.includes("casenumber") ||



        v === "_" ||



        (headers.length === 0 && v === "component") ||



        v === "component_id__c" ||



        v.includes("status")



      );







    if (isHeaderLine) {



      headers = lowerValues;



      headers.forEach((header) => {



        if (header) detectedHeaders.add(header);



      });



      continue;



    }







    if (headers.length === 0) {



      headers = values.map((_, i) => `col_${i}`);



    }







    if (



      headers.length > values.length &&



      headers.includes("account") &&



      headers.includes("account.customer_id__c") &&



      headers.includes("record_type__c")



    ) {



      const acctIdx = headers.indexOf("account");



      const recTypeIdx = headers.indexOf("record_type__c");



      if (



        acctIdx !== -1 &&



        recTypeIdx !== -1 &&



        values[acctIdx] === "" &&



        (values[acctIdx + 1] === "Component" || values[acctIdx + 1] === "Asset")



      ) {



        values.splice(acctIdx + 1, 0, "");



      }



    }







    const row: Record<string, string> = {};



    for (let index = 0; index < values.length; index += 1) {



      const rawValue = values[index];



      const header = headers[index] || `col_${index}`;



      if (rawValue !== undefined && header) {



        row[header] = cleanValue(rawValue);



      }



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







function parseCancellationExecutionRows(input: string, expectedTickets: string[] = []): CancellationExecutionRow[] {
  if (!input || !input.trim()) return [];

  const expectedSet = new Set(expectedTickets.map(cleanTicket));
  const lines = input.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
  const results: CancellationExecutionRow[] = [];
  const seenIds = new Set<string>();

  let idIdx = -1;
  let ticketIdx = -1;
  let statusIdx = -1;
  let resultStatusIdx = -1;
  let errorIdx = -1;

  for (const line of lines) {
    const tokens = parseCSVLine(line);
    if (tokens.length === 0) continue;
    const lowerTokens = tokens.map((t) => cleanHeader(t));

    const isHeader = lowerTokens.some((t) =>
      t === "id" || t.endsWith(".id") || t === "workorderid" || t.includes("ticket") || t.includes("status") || t.includes("error")
    );

    if (isHeader) {
      lowerTokens.forEach((token, idx) => {
        if (token === "__status" || token === "resultstatus") resultStatusIdx = idx;
        else if (token === "id" || token.endsWith(".id") || token === "workorderid") { if (idIdx === -1) idIdx = idx; }
        else if (token.includes("ticket") || token.includes("casenumber") || token === "number") ticketIdx = idx;
        else if (token === "status") statusIdx = idx;
        else if (token.includes("error")) errorIdx = idx;
      });
      continue;
    }

    let rowId = "";
    let rowTicket = "";
    let rowStatus = "Canceled";
    let resultStatus = "";
    let errorMessage = "";

    if (idIdx !== -1 && tokens[idIdx]) {
      const candidate = cleanSalesforceId(tokens[idIdx]);
      if (SALESFORCE_ID_REGEX.test(candidate)) rowId = candidate;
    }
    if (ticketIdx !== -1 && tokens[ticketIdx]) {
      const candidate = cleanTicket(tokens[ticketIdx]);
      if (candidate !== rowId && !candidate.toUpperCase().startsWith("0WO")) rowTicket = candidate;
    }
    if (statusIdx !== -1 && tokens[statusIdx]) {
      const candidate = cleanValue(tokens[statusIdx]);
      if (candidate && candidate !== rowTicket && candidate !== rowId) rowStatus = candidate;
    }
    if (resultStatusIdx !== -1 && tokens[resultStatusIdx]) {
      resultStatus = cleanValue(tokens[resultStatusIdx]);
    }
    if (errorIdx !== -1 && tokens[errorIdx]) {
      errorMessage = cleanValue(tokens[errorIdx]);
    }

    // Fallbacks
    if (!rowId) {
      for (const tok of tokens) {
        const cleaned = cleanSalesforceId(tok);
        if (SALESFORCE_ID_REGEX.test(cleaned)) {
          rowId = cleaned;
          break;
        }
      }
    }
    if (!rowTicket) {
      for (const tok of tokens) {
        const cleaned = cleanTicket(tok);
        if (cleaned && cleaned !== rowId && expectedSet.has(cleaned)) {
          rowTicket = cleaned;
          break;
        }
      }
      if (!rowTicket) {
        for (const tok of tokens) {
          const cleaned = cleanTicket(tok);
          const upper = cleaned.toUpperCase();
          if (cleaned && cleaned !== rowId && !upper.startsWith("0WO") && upper !== "WORKORDER" && upper !== "[WORKORDER]" && upper !== "_" && /^[A-Za-z0-9_-]{6,35}$/.test(cleaned)) {
            rowTicket = cleaned;
            break;
          }
        }
      }
    }

    if (rowId && rowTicket) {
      const idKey = rowId.toLowerCase();
      if (!seenIds.has(idKey)) {
        seenIds.add(idKey);
        results.push({
          id: rowId,
          ticket: rowTicket,
          status: rowStatus,
          resultStatus,
          errorMessage,
        });
      }
    }
  }

  return results;
}

function buildCancellationCanceledOutput(rows: CancellationExecutionRow[], _cancellationType?: string): string {
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







interface DiscrepancyDiffItem {



  ticket: string;



  step1Count: number;



  isRequested: boolean;



  isDuplicateInStep1: boolean;



  salesforceRow?: CancellationExecutionRow;



  status: "matched" | "missing" | "unexpected";



  diagnosis: string;



}







function DiscrepancyAuditDiffModal({



  isOpen,



  onClose,



  items,



  missingTickets,



  onCopyMissing,



  onAuditQuery,



}: {



  isOpen: boolean;



  onClose: () => void;



  items: DiscrepancyDiffItem[];



  missingTickets: string[];



  onCopyMissing: () => void;



  onAuditQuery: () => void;



}) {



  const [mounted, setMounted] = React.useState(false);



  const [activeFilter, setActiveFilter] = React.useState<"all" | "missing" | "matched" | "duplicates" | "unexpected">("all");



  const [searchQuery, setSearchQuery] = React.useState("");







  React.useEffect(() => {



    setMounted(true);



  }, []);







  if (!mounted || !isOpen || typeof document === "undefined") return null;







  const totalRequested = items.filter((i) => i.isRequested).length;



  const matchedCount = items.filter((i) => i.status === "matched").length;



  const missingCount = items.filter((i) => i.status === "missing").length;



  const duplicateCount = items.filter((i) => i.isDuplicateInStep1).length;



  const unexpectedCount = items.filter((i) => i.status === "unexpected").length;







  const filteredItems = items.filter((item) => {



    if (activeFilter === "missing" && item.status !== "missing") return false;



    if (activeFilter === "matched" && item.status !== "matched") return false;



    if (activeFilter === "duplicates" && !item.isDuplicateInStep1) return false;



    if (activeFilter === "unexpected" && item.status !== "unexpected") return false;







    if (searchQuery.trim()) {



      const q = searchQuery.toLowerCase().trim();



      const matchTicket = item.ticket.toLowerCase().includes(q);



      const matchId = item.salesforceRow?.id?.toLowerCase().includes(q) || false;



      const matchDiagnosis = item.diagnosis.toLowerCase().includes(q);



      return matchTicket || matchId || matchDiagnosis;



    }



    return true;



  });







  const handleExportCSV = () => {



    if (!items.length) {



      toast.error("No items to export");



      return;



    }







    const headers = ["Ticket Number", "Step 1 Count", "Reconciliation Status", "Salesforce WorkOrder Id", "Salesforce Status", "Diagnosis"];



    const rows = filteredItems.map((item) => [



      quoteCSVCell(item.ticket),



      String(item.step1Count),



      quoteCSVCell(item.status.toUpperCase()),



      quoteCSVCell(item.salesforceRow?.id || ""),



      quoteCSVCell(item.salesforceRow?.status || "Not Returned"),



      quoteCSVCell(item.diagnosis),



    ]);







    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");



    downloadTextFile(`discrepancy-audit-${activeFilter}-${Date.now()}.csv`, csvContent, "text/csv;charset=utf-8;");



    toast.success(`Exported ${filteredItems.length} records to CSV!`);



  };







  const handleCopySingle = (text: string, label: string) => {



    navigator.clipboard.writeText(text);



    toast.success(`Copied ${label}: ${text}`);



  };







  return createPortal(



    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">



      <div



        className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border border-border/80 dark:border-white/[0.12] bg-background dark:bg-[#07090e] shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden"



        onClick={(e) => e.stopPropagation()}



      >



        {/* Modal Header */}



        <div className="p-5 sm:p-6 border-b border-border/70 dark:border-white/[0.08] flex items-center justify-between gap-4 bg-muted/20 dark:bg-white/[0.02]">



          <div className="flex items-center gap-3">



            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 shadow-xs">



              <GitCompare className="h-5 w-5" />



            </div>



            <div>



              <div className="flex items-center gap-2 flex-wrap">



                <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">



                  Discrepancy Audit Diff Viewer



                </h3>



                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">



                  Step 1 vs Step 3



                </span>



              </div>



              <p className="text-xs text-muted-foreground mt-0.5 font-medium">



                Line-by-line reconciliation tracking which tickets returned, went missing, or had duplicate inputs.



              </p>



            </div>



          </div>



          <button



            onClick={onClose}



            className="h-9 w-9 rounded-xl border border-border/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all shrink-0"



            title="Close Viewer"



          >



            <X className="h-4 w-4" />



          </button>



        </div>







        {/* KPI Metric Summary Bar */}



        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-4 sm:p-5 border-b border-border/70 dark:border-white/[0.06] bg-slate-50/60 dark:bg-[#05060a]">



          <div className="p-3 rounded-2xl bg-card dark:bg-white/[0.03] border border-border/60 dark:border-white/[0.06] shadow-xs">



            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Requested (Step 1)</span>



            <div className="text-lg sm:text-xl font-black text-foreground mt-0.5 tracking-tight">



              {totalRequested}



            </div>



          </div>



          <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-xs">



            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Ready to Cancel</span>



            <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 tracking-tight flex items-center gap-1.5">



              <Check className="h-4 w-4" /> {matchedCount}



            </div>



          </div>



          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-xs">



            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Missing from SF</span>



            <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 tracking-tight flex items-center gap-1.5">



              <AlertTriangle className="h-4 w-4" /> {missingCount}



            </div>



          </div>



          <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 shadow-xs">



            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Duplicates (Step 1)</span>



            <div className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5 tracking-tight">



              {duplicateCount}



            </div>



          </div>



          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-purple-500/5 border border-purple-500/20 shadow-xs">



            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">Outside SF Rows</span>



            <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5 tracking-tight">



              {unexpectedCount}



            </div>



          </div>



        </div>







        {/* Filter Controls & Search */}



        <div className="p-4 sm:p-5 border-b border-border/70 dark:border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card">



          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">



            <button



              onClick={() => setActiveFilter("all")}



              className={cn(



                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",



                activeFilter === "all"



                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"



                  : "text-muted-foreground hover:text-foreground hover:bg-muted"



              )}



            >



              All ({items.length})



            </button>



            <button



              onClick={() => setActiveFilter("missing")}



              className={cn(



                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5",



                activeFilter === "missing"



                  ? "bg-amber-500 text-slate-950 shadow-sm"



                  : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"



              )}



            >



              <AlertTriangle className="h-3 w-3" /> Missing ({missingCount})



            </button>



            <button



              onClick={() => setActiveFilter("matched")}



              className={cn(



                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5",



                activeFilter === "matched"



                  ? "bg-emerald-600 text-white shadow-sm"



                  : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"



              )}



            >



              <Check className="h-3 w-3" /> Matched ({matchedCount})



            </button>



            {duplicateCount > 0 && (



              <button



                onClick={() => setActiveFilter("duplicates")}



                className={cn(



                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",



                  activeFilter === "duplicates"



                    ? "bg-blue-600 text-white shadow-sm"



                    : "text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"



                )}



              >



                Duplicates ({duplicateCount})



              </button>



            )}



            {unexpectedCount > 0 && (



              <button



                onClick={() => setActiveFilter("unexpected")}



                className={cn(



                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",



                  activeFilter === "unexpected"



                    ? "bg-purple-600 text-white shadow-sm"



                    : "text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"



                )}



              >



                Outside ({unexpectedCount})



              </button>



            )}



          </div>







          <div className="flex items-center gap-2">



            <div className="relative flex-1 sm:w-64">



              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />



              <input



                type="text"



                placeholder="Search ticket, 0WO ID..."



                value={searchQuery}



                onChange={(e) => setSearchQuery(e.target.value)}



                className="w-full pl-9 pr-7 py-1.5 text-xs font-medium bg-muted/40 border border-border/80 rounded-xl focus:outline-none focus:border-sky-400 transition-all placeholder:text-muted-foreground/60"



              />



              {searchQuery && (



                <button



                  onClick={() => setSearchQuery("")}



                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"



                >



                  <X className="h-3 w-3" />



                </button>



              )}



            </div>



            <Button



              variant="outline"



              size="sm"



              onClick={handleExportCSV}



              className="h-8 gap-1.5 text-xs font-bold shrink-0 border-border/80"



              title="Download CSV"



            >



              <Download className="h-3.5 w-3.5" /> Export CSV



            </Button>



          </div>



        </div>







        {/* Diff Table */}



        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2 sm:p-4 bg-muted/10">



          {filteredItems.length === 0 ? (



            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">



              <FileSearch className="h-10 w-10 text-muted-foreground/40 mb-3" />



              <p className="text-sm font-bold">No discrepancy rows found</p>



              <p className="text-xs text-muted-foreground/70 mt-1">



                {searchQuery ? "Try a different search query." : "No records match this filter condition."}



              </p>



            </div>



          ) : (



            <div className="rounded-2xl border border-border/70 dark:border-white/[0.08] overflow-hidden bg-card shadow-xs">



              <table className="w-full text-left text-xs border-collapse">



                <thead>



                  <tr className="border-b border-border/70 dark:border-white/[0.08] bg-muted/40 dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-wider text-muted-foreground">



                    <th className="py-3 px-3.5 w-12 text-center">#</th>



                    <th className="py-3 px-3.5">Ticket Number</th>



                    <th className="py-3 px-3.5">Step 1 Input</th>



                    <th className="py-3 px-3.5">Salesforce Record ID</th>



                    <th className="py-3 px-3.5">Reconciliation Status</th>



                    <th className="py-3 px-3.5">Audit Diagnosis</th>



                  </tr>



                </thead>



                <tbody className="divide-y divide-border/50 dark:divide-white/[0.04] font-mono text-[11px]">



                  {filteredItems.map((item, idx) => (



                    <tr



                      key={item.ticket + "_" + idx}



                      className={cn(



                        "transition-colors hover:bg-muted/30",



                        item.status === "missing" && "bg-amber-500/[0.03] dark:bg-amber-500/[0.05]",



                        item.status === "unexpected" && "bg-purple-500/[0.03] dark:bg-purple-500/[0.05]"



                      )}



                    >



                      <td className="py-2.5 px-3.5 text-center text-muted-foreground font-sans text-xs">



                        {idx + 1}



                      </td>



                      <td className="py-2.5 px-3.5 font-bold text-foreground">



                        <div className="flex items-center gap-1.5">



                          <span>{item.ticket}</span>



                          <button



                            onClick={() => handleCopySingle(item.ticket, "Ticket")}



                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"



                            title="Copy Ticket"



                          >



                            <Copy className="h-3 w-3" />



                          </button>



                        </div>



                      </td>



                      <td className="py-2.5 px-3.5 font-sans">



                        {item.isRequested ? (



                          <span



                            className={cn(



                              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold",



                              item.isDuplicateInStep1



                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"



                                : "bg-muted text-muted-foreground"



                            )}



                          >



                            {item.step1Count}x {item.isDuplicateInStep1 ? "(Duplicate)" : ""}



                          </span>



                        ) : (



                          <span className="text-muted-foreground/60">— Not in Step 1</span>



                        )}



                      </td>



                      <td className="py-2.5 px-3.5">



                        {item.salesforceRow?.id ? (



                          <div className="flex items-center gap-1.5 font-semibold text-sky-600 dark:text-sky-400">



                            <span>{item.salesforceRow.id}</span>



                            <button



                              onClick={() => handleCopySingle(item.salesforceRow!.id, "WorkOrder ID")}



                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"



                              title="Copy WorkOrder ID"



                            >



                              <Copy className="h-3 w-3" />



                            </button>



                          </div>



                        ) : (



                          <span className="text-muted-foreground/60 font-sans italic">Not Returned</span>



                        )}



                      </td>



                      <td className="py-2.5 px-3.5 font-sans">



                        {item.status === "matched" && (



                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">



                            <Check className="h-3 w-3" /> Ready



                          </span>



                        )}



                        {item.status === "missing" && (



                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">



                            <AlertTriangle className="h-3 w-3" /> Missing from SF



                          </span>



                        )}



                        {item.status === "unexpected" && (



                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">



                            Outside



                          </span>



                        )}



                      </td>



                      <td className="py-2.5 px-3.5 font-sans text-xs text-muted-foreground">



                        {item.diagnosis}



                      </td>



                    </tr>



                  ))}



                </tbody>



              </table>



            </div>



          )}



        </div>







        {/* Bottom Action Footer */}



        <div className="p-4 sm:p-5 border-t border-border/70 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 bg-muted/20 dark:bg-white/[0.02]">



          <div className="text-xs text-muted-foreground font-medium">



            Showing <strong className="text-foreground">{filteredItems.length}</strong> of <strong className="text-foreground">{items.length}</strong> records



          </div>



          <div className="flex items-center gap-2">



            {missingCount > 0 && (



              <>



                <Button



                  variant="outline"



                  size="sm"



                  onClick={onCopyMissing}



                  className="h-8 gap-1.5 text-xs font-bold border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200"



                >



                  <Copy className="h-3.5 w-3.5" /> Copy {missingCount} Missing



                </Button>



                <Button



                  variant="outline"



                  size="sm"



                  onClick={onAuditQuery}



                  className="h-8 gap-1.5 text-xs font-bold border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200"



                >



                  <Terminal className="h-3.5 w-3.5" /> Audit SOQL



                </Button>



              </>



            )}



            <Button



              variant="primary"



              size="sm"



              onClick={onClose}



              className="h-8 px-4 text-xs font-bold rounded-xl"



            >



              Done



            </Button>



          </div>



        </div>



      </div>



    </div>,



    document.body



  );



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



    <div className="group flex items-center gap-2.5 rounded-xl border border-border/70 bg-card/70 dark:bg-[#0b0c10]/80 dark:border-white/[0.08] backdrop-blur-md px-3.5 py-2 shadow-sm transition-all hover:border-primary/40 hover:bg-card dark:hover:bg-[#12141a] hover:shadow-md">



      <span className={`inline-block h-2.5 w-2.5 rounded-full ring-2 ring-background dark:ring-[#030305] shadow-sm ${info.color}`} />



      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">



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



    <Card className={cn("overflow-hidden rounded-3xl border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col transition-all duration-300 group relative", className || 'h-[500px] xl:h-[calc(100vh-120px)] min-h-[350px]')}>



      {step && (



        <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



          <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/40 dark:to-transparent bg-clip-text text-transparent">



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



            <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest">{subtitle}</p>



          </div>



          <div className="flex flex-wrap items-center gap-3 mt-5 md:mt-6">



            <Button



              variant="outline"



              size="sm"



              className="h-8 px-3 gap-1.5 text-xs font-bold border-border/70 dark:border-white/[0.08] shadow-sm bg-card/80 dark:bg-[#06070a]/80 hover:bg-surface-elevated"



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



          className="flex-1 min-h-0 w-full rounded-2xl border border-border/70 bg-surface-recessed/60 dark:bg-black/25 dark:border-white/[0.08] p-4 text-[13px] font-mono leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-all shadow-inner custom-scrollbar backdrop-blur-sm"



          placeholder="Paste CSV from Salesforce Inspector here..."



          value={value}



          onChange={(e) => onChange(e.target.value)}



        />



        {value.trim() && (



          <div className="flex-1 min-h-0 w-full rounded-2xl border border-primary/20 bg-primary/5 dark:bg-black/25 dark:border-primary/30 p-4 overflow-auto shadow-inner relative backdrop-blur-sm">



            <div className="absolute top-2 right-3">



              <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">OUTPUT</span>



            </div>



            <SOQLHighlighter query={transformedValue} className="font-mono text-[13px] leading-relaxed text-foreground dark:text-sky-200/90 custom-scrollbar whitespace-pre-wrap break-words" />



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



    <Card className={cn("overflow-hidden rounded-3xl border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col transition-all duration-300 group relative", className || 'h-[500px] xl:h-[calc(100vh-120px)] min-h-[350px]')}>



      {step && (



        <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



          <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/40 dark:to-transparent bg-clip-text text-transparent">



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



            <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest">{subtitle}</p>



          </div>



          <div className="flex flex-wrap items-center gap-3 mt-5 md:mt-6">



            <span className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">



              {batches.length} batch{batches.length === 1 ? "" : "es"}



            </span>







            {batches.length > 1 && (



              <div className="flex items-center gap-0.5 bg-muted/60 dark:bg-white/[0.04] rounded-lg p-0.5 shadow-sm border border-border/70 dark:border-white/[0.08]">



                <Button



                  variant="ghost"



                  size="sm"



                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/10 rounded-md"



                  disabled={batchIndex <= 0}



                  onClick={() => setBatchIndex((value) => Math.max(0, value - 1))}



                  title="Previous Batch"



                >



                  <ChevronLeft className="h-3 w-3" />



                </Button>



                <span className="text-[10px] font-mono font-black px-2 text-foreground">



                  {batchIndex + 1} / {batches.length}



                </span>



                <Button



                  variant="ghost"



                  size="sm"



                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/10 rounded-md"



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



                className="h-8 px-3 gap-1.5 text-xs font-bold border-border/70 dark:border-white/[0.08] shadow-sm bg-card/80 dark:bg-[#06070a]/80 hover:bg-surface-elevated"



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



          <div className="flex flex-1 items-center justify-center rounded-2xl bg-surface-recessed/50 dark:bg-white/[0.02] border border-dashed border-border/60 dark:border-white/[0.06]">



            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">



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



              ? "border-primary/30 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/20 dark:text-sky-300"



              : "border-border/70 bg-muted/50 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400 dark:group-hover:border-primary/40 dark:group-hover:text-sky-300"



          )}



        >



          {isLibraryTemplate ? <Bookmark className="h-3.5 w-3.5" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}



        </span>



        <span className="min-w-0 flex-1">



          <span className="block text-[11px] md:text-xs font-bold leading-tight whitespace-normal pr-1 text-foreground">{template.name}</span>



          <span className={cn("mt-1 block truncate text-[10px] font-semibold uppercase tracking-[0.12em]", isSelected ? "text-primary dark:text-sky-300" : "text-muted-foreground group-hover:text-primary")}>



            {template.category}



          </span>



        </span>



        {isSelected && (



          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">



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



          "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-300 backdrop-blur-md",



          isOpen



            ? "border-sky-500/50 bg-white/80 ring-2 ring-sky-500/20 dark:bg-white/[0.08] dark:border-sky-400/50 text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"



            : "border-slate-900/[0.08] bg-white/40 text-foreground hover:border-sky-500/40 hover:bg-white/70 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:hover:border-sky-400/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"



        )}



      >



        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/25 bg-sky-500/10 text-sky-600 dark:border-sky-400/25 dark:bg-sky-400/15 dark:text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.15)] transition-transform duration-200 group-hover:scale-105">



          {selectedTemplate?.source === "library" ? <Bookmark className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}



        </span>



        <span className="min-w-0 flex-1">



          <span className="block text-xs font-bold leading-tight whitespace-normal text-slate-900 dark:text-white">{selectedTemplate?.name ?? "Select a template"}</span>



          <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">



            {selectedTemplate?.source === "library" ? "Saved template" : selectedTemplate?.category ?? "Choose a query type"}



          </span>



        </span>



        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:text-sky-500 dark:group-hover:text-sky-400", isOpen && "rotate-180 text-sky-500 dark:text-sky-400")} />



      </button>







      {isOpen && menuPosition && typeof document !== "undefined" &&



        createPortal(



          <div



            ref={menuRef}



            className="fixed z-[100] overflow-hidden rounded-2xl border border-border/80 bg-popover/98 p-1.5 text-foreground shadow-2xl backdrop-blur-2xl dark:border-white/[0.1] dark:bg-[#07080c]/95 dark:shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)]"



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



                  <span className="px-2 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Built-in templates</span>



                </div>



              )}



              {builtInTemplates.map(renderTemplate)}



              {savedTemplates.length > 0 && (



                <>



                  <div className="my-1.5 border-t border-border/60 dark:border-white/[0.08]" />



                  <div className="flex items-center gap-2 px-2 pb-1 pt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400">



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







const cardContainerVariants = {



  hidden: { opacity: 0 },



  visible: {



    opacity: 1,



    transition: {



      staggerChildren: 0.07,



      delayChildren: 0.02,



    },



  },



  exit: {



    opacity: 0,



    y: -14,



    filter: "blur(6px)",



    transition: {



      duration: 0.18,



      ease: [0.32, 0, 0.67, 0] as const,



    },



  },



};







const cardItemVariants = {



  hidden: {



    opacity: 0,



    y: 28,



    scale: 0.95,



    filter: "blur(8px)",



  },



  visible: {



    opacity: 1,



    y: 0,



    scale: 1,



    filter: "blur(0px)",



    transition: {



      type: "spring" as const,



      stiffness: 380,



      damping: 26,



      mass: 0.75,



    },



  },



};







const step1CardVariants = {



  hidden: {



    opacity: 0,



    y: 22,



    scale: 0.96,



    filter: "blur(6px)",



  },



  visible: {



    opacity: 1,



    y: 0,



    scale: 1,



    filter: "blur(0px)",



    transition: {



      type: "spring" as const,



      stiffness: 380,



      damping: 26,



      mass: 0.8,



    },



  },



  exit: {



    opacity: 0,



    y: -14,



    scale: 0.97,



    filter: "blur(6px)",



    transition: {



      duration: 0.18,



      ease: [0.32, 0, 0.67, 0] as const,



    },



  },



};







interface PendingTransferException {

  componentId: string;

  newCid: string;

  status: "Draft" | "AMC";

  remark: string;

}



const buildPendingAsciiTable = (exceptions: PendingTransferException[]) => {
  if (exceptions.length === 0) return "";
  const amcIds = exceptions.filter((e) => e.status === "AMC").map((e) => e.componentId);
  const draftIds = exceptions.filter((e) => e.status === "Draft").map((e) => e.componentId);

  const maxIdLen = Math.max(12, ...exceptions.map((e) => e.componentId.length));
  const col1Width = maxIdLen + 4;
  const col2Width = 8;
  const col3Width = 84;

  const pad = (str?: string, width: number = 0) => {
    const s = str ?? "";
    return s + " ".repeat(Math.max(0, width - s.length));
  };

  const border = `+${"-".repeat(col1Width + 2)}+${"-".repeat(col2Width + 2)}+${"-".repeat(col3Width + 2)}+`;
  const header = `| ${pad("Component ID", col1Width)} | ${pad("Status", col2Width)} | ${pad("Remarks / Required Action", col3Width)} |`;

  const lines: string[] = [border, header, border];

  if (amcIds.length > 0) {
    const remark = "Kindly coordinate with the CBO Team to complete the asset transfer.";
    lines.push(`| ${pad(amcIds[0] ?? "", col1Width)} | ${pad("AMC", col2Width)} | ${pad(remark, col3Width)} |`);
    for (let i = 1; i < amcIds.length; i++) {
      lines.push(`| ${pad(amcIds[i] ?? "", col1Width)} | ${pad("", col2Width)} | ${pad("", col3Width)} |`);
    }
    lines.push(border);
  }

  if (draftIds.length > 0) {
    const remark = "Kindly coordinate with the SSG Team to complete the asset registration before proceeding with the asset transfer.";
    lines.push(`| ${pad(draftIds[0] ?? "", col1Width)} | ${pad("Draft", col2Width)} | ${pad(remark, col3Width)} |`);
    for (let i = 1; i < draftIds.length; i++) {
      lines.push(`| ${pad(draftIds[i] ?? "", col1Width)} | ${pad("", col2Width)} | ${pad("", col3Width)} |`);
    }
    lines.push(border);
  }

  return lines.join("\n");
};

const buildPendingHtmlTable = (exceptions: PendingTransferException[]) => {

  if (exceptions.length === 0) return "";

  const amcIds = exceptions.filter((e) => e.status === "AMC").map((e) => e.componentId);

  const draftIds = exceptions.filter((e) => e.status === "Draft").map((e) => e.componentId);



  const rows: string[] = [];



  if (amcIds.length > 0) {

    rows.push(`    <tr>

      <td style="border: 1px solid #444; padding: 6px 12px; vertical-align: top; font-family: monospace, sans-serif;">${amcIds.join("<br/>")}</td>

      <td style="border: 1px solid #444; padding: 6px 12px; vertical-align: top; font-weight: bold;">AMC</td>

      <td style="border: 1px solid #444; padding: 6px 12px; vertical-align: top;">Kindly coordinate with the CBO Team to complete the asset transfer.</td>

    </tr>`);

  }



  if (draftIds.length > 0) {

    rows.push(`    <tr>

      <td style="border: 1px solid #444; padding: 6px 12px; vertical-align: top; font-family: monospace, sans-serif;">${draftIds.join("<br/>")}</td>

      <td style="border: 1px solid #444; padding: 6px 12px; vertical-align: top; font-weight: bold;">Draft</td>

      <td style="border: 1px solid #444; padding: 6px 12px; vertical-align: top;">Kindly coordinate with the SSG Team to complete the asset registration before proceeding with the asset transfer.</td>

    </tr>`);

  }



  return `<table style="border-collapse: collapse; width: 100%; border: 1px solid #444; font-family: Calibri, Arial, sans-serif; font-size: 13px; margin: 12px 0;">

  <thead>

    <tr style="background-color: #f2f2f2;">

      <th style="border: 1px solid #444; padding: 8px 12px; text-align: left; font-weight: bold; width: 25%;">Component ID</th>

      <th style="border: 1px solid #444; padding: 8px 12px; text-align: left; font-weight: bold; width: 15%;">Status</th>

      <th style="border: 1px solid #444; padding: 8px 12px; text-align: left; font-weight: bold;">Remarks / Required Action</th>

    </tr>

  </thead>

  <tbody>

${rows.join("\n")}

  </tbody>

</table>`;

};



// =============================================================================
// ACCOUNT CHECK: EXECUTIVE SHIFT HANDOVER & ESCALATION MODAL
// =============================================================================
function AccountCheckHandoverModal({
  isOpen,
  onClose,
  result,
}: {
  isOpen: boolean;
  onClose: () => void;
  result: AccountCheckResult;
}) {
  const [activeTab, setActiveTab] = React.useState<"teams" | "email" | "visual">("teams");
  const [copiedFormat, setCopiedFormat] = React.useState<string | null>(null);

  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const summaryData = React.useMemo(() => {
    if (!result || result.totalCount === 0) return null;

    const total = result.totalCount;
    const namo = result.namoCount;
    const nonNamo = result.nonNamoCount;
    const unclassified = result.unclassifiedGroupCount;
    const parents = result.parentCount;
    const children = result.childCount;
    const pms = result.pmsCount;
    const nonPms = result.nonPmsCount;
    const approvals = result.approvalSentCount;
    const mr = result.mrCreatedCount;

    const bothApprovalAndMr = result.allRows.filter(
      (r) => r.isApprovalSent && r.isMrCreated
    ).length;

    const notReturned = result.allRows.filter(
      (r) => r.status === "Not Returned" || r.accountGroup === "Not Returned by SF"
    );

    const statusCounts: Record<string, number> = {};
    for (const r of result.allRows) {
      const s = r.status || "Unknown";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    }

    const safeToProcess = result.allRows.filter(
      (r) =>
        r.isParent &&
        !r.isApprovalSent &&
        !r.isMrCreated &&
        r.status !== "Completed" &&
        r.status !== "Canceled" &&
        r.status !== "Not Returned"
    ).length;

    const blockedOrActionRequired = total - safeToProcess;

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const timestamp = `${dateStr}, ${timeStr} IST`;

    // 1. Teams / Slack Markdown Format
    const teamsMarkdown = [
      `*📋 ACCOUNT CHECK: EXECUTIVE SHIFT HANDOVER REPORT*`,
      `_Generated: ${timestamp} | Meghdoot Operations Playground_`,
      ``,
      `*📊 Executive Summary:*`,
      `• *Total WorkOrders Analyzed:* \`${total}\``,
      `• *Ready to Process (Clean):* \`${safeToProcess}\` (${((safeToProcess / total) * 100).toFixed(1)}%)`,
      `• *Action Required / Blocked:* \`${blockedOrActionRequired}\` (${((blockedOrActionRequired / total) * 100).toFixed(1)}%)`,
      ``,
      `*🏢 Account Group Distribution:*`,
      `• *NAMO Accounts:* \`${namo}\` (${((namo / total) * 100).toFixed(1)}%)`,
      `• *NON-NAMO Accounts:* \`${nonNamo}\` (${((nonNamo / total) * 100).toFixed(1)}%)`,
      unclassified > 0 ? `• *Unclassified / Unknown:* \`${unclassified}\`` : null,
      ``,
      `*🔗 Hierarchy & Bundling:*`,
      `• *Standalone / Parent Tickets:* \`${parents}\` (${((parents / total) * 100).toFixed(1)}%)`,
      `• *Bundled Child Tickets:* \`${children}\` (${((children / total) * 100).toFixed(1)}%) [Must action parent first]`,
      ``,
      `*⚙️ WorkOrder Type:*`,
      `• *Auto PMS ('A' Prefix):* \`${pms}\` (${((pms / total) * 100).toFixed(1)}%)`,
      `• *Non-PMS Tickets:* \`${nonPms}\` (${((nonPms / total) * 100).toFixed(1)}%)`,
      ``,
      `*⚡ Critical Operational Flags & Risks:*`,
      `• *Approval Requests Pending:* \`${approvals}\``,
      `• *Material Requests (MR) Created:* \`${mr}\``,
      bothApprovalAndMr > 0
        ? `• ⚠️ *High Risk (Both Approval + MR Active):* \`${bothApprovalAndMr}\``
        : null,
      notReturned.length > 0
        ? `• ❌ *Unmatched / Missing in SF:* \`${notReturned.length}\``
        : null,
      ``,
      `*📈 WorkOrder Lifecycle Status:*`,
      Object.entries(statusCounts)
        .map(([st, cnt]) => `• ${st}: \`${cnt}\``)
        .join("\n"),
      ``,
      `*🎯 Operational Next Actions & Recommendations:*`,
      approvals > 0
        ? `> • *[APPROVALS]*: Escalate \`${approvals}\` approval requests to Team Lead for sign-off.`
        : `> • *[APPROVALS]*: No pending approval blockers.`,
      mr > 0
        ? `> • *[MATERIAL]*: Verify warehouse parts return before canceling \`${mr}\` Material Request tickets.`
        : `> • *[MATERIAL]*: No material request blockers.`,
      children > 0
        ? `> • *[BUNDLING]*: \`${children}\` child tickets must be processed via their parent WorkOrder.`
        : null,
      `> • *[READY]*: \`${safeToProcess}\` clean WorkOrders can proceed directly.`,
    ]
      .filter((line) => line !== null)
      .join("\n");

    // 2. Plain Text / Email Format
    const emailPlainText = [
      `================================================================================`,
      `📋 ACCOUNT CHECK: EXECUTIVE SHIFT HANDOVER & ESCALATION REPORT`,
      `Generated: ${timestamp}`,
      `Scope    : Salesforce WorkOrder Classification & Cancellation Audit`,
      `Source   : Meghdoot Operations Playground`,
      `================================================================================`,
      ``,
      `1. EXECUTIVE OVERVIEW`,
      `--------------------------------------------------------------------------------`,
      `• Total WorkOrders Analyzed : ${total}`,
      `• Safe to Process (Clean)   : ${safeToProcess} (${((safeToProcess / total) * 100).toFixed(1)}%)`,
      `• Attention / Action Req'd  : ${blockedOrActionRequired} (${((blockedOrActionRequired / total) * 100).toFixed(1)}%)`,
      ``,
      `2. ACCOUNT GROUP CLASSIFICATION`,
      `--------------------------------------------------------------------------------`,
      `• NAMO Accounts             : ${namo} (${((namo / total) * 100).toFixed(1)}%)`,
      `• NON-NAMO Accounts         : ${nonNamo} (${((nonNamo / total) * 100).toFixed(1)}%)`,
      unclassified > 0 ? `• Unclassified Group        : ${unclassified}` : null,
      ``,
      `3. HIERARCHY & BUNDLING`,
      `--------------------------------------------------------------------------------`,
      `• Standalone / Parent Tickets: ${parents} (${((parents / total) * 100).toFixed(1)}%)`,
      `• Bundled Child Tickets      : ${children} (${((children / total) * 100).toFixed(1)}%)`,
      `  * Note: Child tickets require processing via their parent WorkOrder.`,
      ``,
      `4. WORKORDER TYPE`,
      `--------------------------------------------------------------------------------`,
      `• Auto PMS (Prefix 'A')      : ${pms} (${((pms / total) * 100).toFixed(1)}%)`,
      `• Non-PMS Tickets            : ${nonPms} (${((nonPms / total) * 100).toFixed(1)}%)`,
      ``,
      `5. OPERATIONAL FLAGS & RISKS`,
      `--------------------------------------------------------------------------------`,
      `• Approval Requests Sent    : ${approvals}`,
      `• Material Requests (MR)    : ${mr}`,
      bothApprovalAndMr > 0
        ? `• High Risk (Both Flags)    : ${bothApprovalAndMr} [Escalate Immediately]`
        : null,
      notReturned.length > 0
        ? `• Missing / Not in SF       : ${notReturned.length}`
        : null,
      ``,
      `6. STATUS BREAKDOWN`,
      `--------------------------------------------------------------------------------`,
      ...Object.entries(statusCounts).map(
        ([st, cnt]) => `• ${st.padEnd(26)} : ${cnt}`
      ),
      ``,
      notReturned.length > 0
        ? [
            `7. MISSING TICKETS DETAIL`,
            `--------------------------------------------------------------------------------`,
            `• Not Returned by SF: ${notReturned.map((r) => r.ticket).join(", ")}`,
            `• Action: Verify ticket numbers for typos or check cross-org sandbox context.`,
            ``,
          ].join("\n")
        : null,
      `8. NEXT ACTIONS & ESCALATION DIRECTIVES`,
      `--------------------------------------------------------------------------------`,
      approvals > 0
        ? `• [APPROVALS]: Escalate ${approvals} pending approval tickets to Lead/TL for expedited review.`
        : `• [APPROVALS]: All tickets clear of approval holds.`,
      mr > 0
        ? `• [MATERIAL]: Coordinate with logistics/store to verify ${mr} Material Requests before cancellation.`
        : `• [MATERIAL]: No material request holds detected.`,
      children > 0
        ? `• [HIERARCHY]: ${children} child tickets must be bundled; cancel parent tickets to cascade.`
        : null,
      `• [OPERATIONS]: ${safeToProcess} clean tickets ready for batch processing now.`,
      ``,
      `================================================================================`,
      `Report automatically compiled by Meghdoot Operations Playground`,
      `================================================================================`,
    ]
      .filter((line) => line !== null)
      .join("\n");

    return {
      total,
      safeToProcess,
      blockedOrActionRequired,
      namo,
      nonNamo,
      parents,
      children,
      pms,
      nonPms,
      approvals,
      mr,
      bothApprovalAndMr,
      notReturned,
      statusCounts,
      timestamp,
      teamsMarkdown,
      emailPlainText,
    };
  }, [result]);

  if (!isOpen || !summaryData) return null;

  const handleCopy = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    toast.success(`Copied ${formatName} Handover Summary to clipboard!`);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([summaryData.emailPlainText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AccountCheck_Shift_Handover_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded Handover Summary .txt file!");
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200/50 dark:border-white/10 bg-background dark:bg-[#07090e] shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/70 dark:border-white/[0.08] flex items-center justify-between gap-4 bg-muted/20 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                  Executive Shift Handover & Escalation Summary
                </h3>
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-300 border-blue-500/25 px-2 py-0.5">
                  Live Report
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Instant operational handover ready for Team Leads, MS Teams, Slack, or Escalation Emails.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl border border-border/70 dark:border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* KPI Mini-Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:p-6 pb-2 border-b border-border/40 dark:border-white/[0.05] bg-muted/10 dark:bg-white/[0.01]">
          <div className="p-3 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02]">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Analyzed</span>
            <div className="text-xl font-black text-foreground mt-0.5 font-mono">{summaryData.total}</div>
            <span className="text-[10px] text-muted-foreground font-sans">WorkOrders in batch</span>
          </div>
          <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Ready to Process</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">{summaryData.safeToProcess}</div>
            <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-sans">{((summaryData.safeToProcess / summaryData.total) * 100).toFixed(0)}% clean tickets</span>
          </div>
          <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Action Required</span>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 font-mono">{summaryData.blockedOrActionRequired}</div>
            <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 font-sans">Appr / MR / Children</span>
          </div>
          <div className="p-3 rounded-2xl border border-rose-500/30 bg-rose-500/5">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Missing in SF</span>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5 font-mono">{summaryData.notReturned.length}</div>
            <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 font-sans">Unmatched tickets</span>
          </div>
        </div>

        {/* Tab Selector & Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 pt-3 pb-2">
          {/* Format Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={() => setActiveTab("teams")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0",
                activeTab === "teams"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Teams / Slack Markdown
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("email")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0",
                activeTab === "email"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Plain Text / Email
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("visual")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0",
                activeTab === "visual"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Visual Breakdown
            </button>
          </div>

          {/* Quick Copy Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(summaryData.teamsMarkdown, "Teams / Slack")}
              className="h-8 gap-1.5 text-xs font-bold border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg shadow-xs whitespace-nowrap shrink-0"
            >
              {copiedFormat === "Teams / Slack" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy Teams</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(summaryData.emailPlainText, "Email / Plain Text")}
              className="h-8 gap-1.5 text-xs font-bold border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 rounded-lg shadow-xs whitespace-nowrap shrink-0"
            >
              {copiedFormat === "Email / Plain Text" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy Email</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="h-8 gap-1.5 text-xs font-bold border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg shadow-xs whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>.txt</span>
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 pt-2">
          {activeTab === "teams" && (
            <div className="relative rounded-2xl border border-slate-200/70 dark:border-white/[0.08] bg-slate-950/80 p-4 font-mono text-xs leading-relaxed text-slate-200 shadow-inner overflow-auto max-h-[380px] whitespace-pre-wrap selection:bg-indigo-500/30">
              {summaryData.teamsMarkdown}
            </div>
          )}

          {activeTab === "email" && (
            <div className="relative rounded-2xl border border-slate-200/70 dark:border-white/[0.08] bg-slate-950/80 p-4 font-mono text-xs leading-relaxed text-slate-200 shadow-inner overflow-auto max-h-[380px] whitespace-pre-wrap selection:bg-indigo-500/30">
              {summaryData.emailPlainText}
            </div>
          )}

          {activeTab === "visual" && (
            <div className="space-y-4 max-h-[380px] overflow-auto pr-1">
              {/* Distribution Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Account Group */}
                <div className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Account Group</span>
                    <span className="text-[10px] font-mono text-slate-500">{summaryData.total} Total</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-sans">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">NAMO</span>
                      <span className="font-mono font-bold">{summaryData.namo} ({((summaryData.namo / summaryData.total) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-600 dark:text-sky-400">NON-NAMO</span>
                      <span className="font-mono font-bold">{summaryData.nonNamo} ({((summaryData.nonNamo / summaryData.total) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>

                {/* Hierarchy */}
                <div className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Hierarchy</span>
                    <span className="text-[10px] font-mono text-slate-500">{summaryData.total} Total</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-sans">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">Parents (Standalone)</span>
                      <span className="font-mono font-bold">{summaryData.parents} ({((summaryData.parents / summaryData.total) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-600 dark:text-purple-400">Bundled Child</span>
                      <span className="font-mono font-bold">{summaryData.children} ({((summaryData.children / summaryData.total) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                </div>

                {/* Operational Flags */}
                <div className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Operational Flags</span>
                    <span className="text-[10px] font-mono text-slate-500">{summaryData.approvals + summaryData.mr} Flags</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-sans">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-orange-600 dark:text-orange-400">Approval Requests</span>
                      <span className="font-mono font-bold">{summaryData.approvals}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-600 dark:text-rose-400">Material Requests (MR)</span>
                      <span className="font-mono font-bold">{summaryData.mr}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Directive Box */}
              <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  <Sparkles className="h-4 w-4" />
                  <span>Automated Shift Directives:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-sans list-disc list-inside">
                  <li>
                    <strong>Safe to Proceed:</strong> {summaryData.safeToProcess} clean WorkOrders can be processed without risk of cancellation rejection.
                  </li>
                  {summaryData.approvals > 0 && (
                    <li className="text-orange-600 dark:text-orange-300">
                      <strong>Approvals:</strong> {summaryData.approvals} WorkOrders have approval requests active — escalate to Team Lead.
                    </li>
                  )}
                  {summaryData.mr > 0 && (
                    <li className="text-rose-600 dark:text-rose-300">
                      <strong>Material Requests:</strong> {summaryData.mr} WorkOrders have active parts requests — confirm warehouse return.
                    </li>
                  )}
                  {summaryData.children > 0 && (
                    <li className="text-purple-600 dark:text-purple-300">
                      <strong>Bundled Children:</strong> {summaryData.children} child tickets must be processed via their parent WorkOrder.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border/70 dark:border-white/[0.08] flex items-center justify-between gap-3 bg-muted/20 dark:bg-white/[0.02]">
          <span className="text-[11px] text-muted-foreground font-mono">
            {summaryData.timestamp}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs font-bold rounded-lg">
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => handleCopy(activeTab === "teams" ? summaryData.teamsMarkdown : summaryData.emailPlainText, activeTab === "teams" ? "Teams / Slack" : "Email")}
              className="h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-1.5 shadow-sm"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Current View</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}



// =============================================================================
// CANCELLATION: EXECUTIVE SHIFT HANDOVER & ALL TICKETS AUDIT MODAL
// =============================================================================
function CancellationHandoverModal({
  isOpen,
  onClose,
  type,
  namoResult,
  nonNamoResult,
  ccoResult,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: "NAMO" | "NON NAMO" | "CCO";
  namoResult?: NamoAlgo2Result;
  nonNamoResult?: NonNamoAlgo3Result;
  ccoResult?: CcoAlgoResult;
}) {
  const [activeTab, setActiveTab] = React.useState<"tickets" | "teams" | "email">("tickets");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [copiedFormat, setCopiedFormat] = React.useState<string | null>(null);

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const isNamo = type === "NAMO";
  const isCco = type === "CCO";
  const result = isCco ? ccoResult : isNamo ? namoResult : nonNamoResult;

  const summaryData = React.useMemo(() => {
    if (!result || result.allRecords.length === 0) return null;

    const total = result.allRecords.length;
    const readyList = isCco
      ? (ccoResult?.ccoCancellationTickets || [])
      : isNamo
      ? (namoResult?.namoCancellationTickets || [])
      : (nonNamoResult?.nonNamoCancellationTickets || []);
    const approvalList = isCco
      ? (ccoResult?.approvalPendingTickets || [])
      : isNamo
      ? (namoResult?.approvalPendingTickets || [])
      : (nonNamoResult?.approvalPendingTickets || []);
    const parentList = isCco
      ? (ccoResult?.parentWorkOrderTickets || [])
      : isNamo
      ? (namoResult?.parentWorkOrderTickets || [])
      : (nonNamoResult?.parentWorkOrderTickets || []);
    const mrList = isCco
      ? (ccoResult?.mrCreatedTickets || [])
      : isNamo
      ? (namoResult?.mrCreatedTickets || [])
      : (nonNamoResult?.mrCreatedTickets || []);
    const groupMismatchList = isCco
      ? (ccoResult?.autoPmsTickets || [])
      : isNamo
      ? (namoResult?.nonNamoTickets || [])
      : (nonNamoResult?.namoTickets || []);
    const completedList = isCco
      ? (ccoResult?.completedOrCanceledTickets || [])
      : isNamo
      ? (namoResult?.completedOrCanceledTickets || [])
      : (nonNamoResult?.completedOrCanceledTickets || []);
    const canceledList = completedList.filter((t) => isStatusCanceled(t.status));
    const completedOnlyList = completedList.filter((t) => !isStatusCanceled(t.status));
    const unverifiedList = isCco
      ? []
      : isNamo
      ? (namoResult?.unclassifiedTickets || [])
      : (nonNamoResult?.unclassifiedTickets || []);
    const skippedList = isCco
      ? (ccoResult?.allSkippedTickets || [])
      : isNamo
      ? (namoResult?.allSkippedTickets || [])
      : (nonNamoResult?.allSkippedTickets || []);

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const timestamp = `${dateStr}, ${timeStr} IST`;

    // Teams / Slack Markdown Format
    const teamsMarkdown = [
      `*📋 ${type} CANCELLATION: EXECUTIVE SHIFT HANDOVER REPORT*`,
      `_Generated: ${timestamp} | Meghdoot Operations Playground_`,
      ``,
      `*📊 Executive Summary:*`,
      `• *Total WorkOrders Analyzed:* \`${total}\``,
      `• *Ready to Cancel (Clean Payload):* \`${readyList.length}\` (${((readyList.length / total) * 100).toFixed(1)}%)`,
      `• *Total Excluded / Segregated:* \`${skippedList.length}\` (${((skippedList.length / total) * 100).toFixed(1)}%)`,
      ``,
      `*⚡ Critical Segregation & Operational Flags:*`,
      `• *Approval Requests Pending (Locked in SF):* \`${approvalList.length}\``,
      `• *Material Requests (MR) Created:* \`${mrList.length}\``,
      `• *Parent-Linked WorkOrders (Child WOs):* \`${parentList.length}\``,
      isCco
        ? (groupMismatchList.length > 0 ? `• *Auto PMS Tickets (Skipped from CCO):* \`${groupMismatchList.length}\`` : null)
        : `• *Account Group Mismatch (${isNamo ? "NON-NAMO" : "NAMO"}):* \`${groupMismatchList.length}\``,
      completedOnlyList.length > 0 ? `• *Already Completed:* \`${completedOnlyList.length}\`` : null,
      canceledList.length > 0 ? `• *Already Canceled:* \`${canceledList.length}\`` : null,
      unverifiedList.length > 0 ? `• *Unverified / Blank Group:* \`${unverifiedList.length}\`` : null,
      ``,
      `*🎯 Operational Next Actions & Directives:*`,
      readyList.length > 0
        ? `> • *[EXECUTION]*: \`${readyList.length}\` clean WorkOrders are ready for cancellation upload.`
        : `> • *[EXECUTION]*: No clean tickets eligible for cancellation.`,
      approvalList.length > 0
        ? `> • *[APPROVALS]*: Escalate \`${approvalList.length}\` approval requests to Team Lead for sign-off.`
        : `> • *[APPROVALS]*: No pending approval blockers.`,
      mrList.length > 0
        ? `> • *[MATERIAL]*: Verify warehouse parts return before canceling \`${mrList.length}\` MR tickets.`
        : `> • *[MATERIAL]*: No material request blockers.`,
      parentList.length > 0
        ? `> • *[HIERARCHY]*: \`${parentList.length}\` parent tickets must be processed before child tickets.`
        : null,
      groupMismatchList.length > 0
        ? isCco
          ? `> • *[APPROVALS / ROUTING]*: \`${groupMismatchList.length}\` Auto PMS tickets require departmental approval (Suraj Sir - UCPG / Vishal Sir - CPSD) and must not be cancelled via CCO.`
          : `> • *[APPROVALS / ROUTING]*: \`${groupMismatchList.length}\` ${isNamo ? "NON-NAMO" : "NAMO"} tickets require ${isNamo ? "RM Approval" : "RM + CPSD/UCPG Approval"} and must not be cancelled.`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    // Email Plain Text Format
    const emailPlainText = [
      `================================================================================`,
      `📋 ${type} CANCELLATION: EXECUTIVE SHIFT HANDOVER REPORT`,
      `Generated: ${timestamp}`,
      `Scope    : Salesforce Non-PMS / Auto PMS WorkOrder Segregation & Cancellation Audit`,
      `Source   : Meghdoot Operations Playground`,
      `================================================================================`,
      ``,
      `1. EXECUTIVE OVERVIEW`,
      `--------------------------------------------------------------------------------`,
      `• Total WorkOrders Analyzed : ${total}`,
      `• Ready to Cancel (Clean)   : ${readyList.length} (${((readyList.length / total) * 100).toFixed(1)}%)`,
      `• Total Excluded WorkOrders : ${skippedList.length} (${((skippedList.length / total) * 100).toFixed(1)}%)`,
      ``,
      `2. OPERATIONAL SEGREGATION BREAKDOWN`,
      `--------------------------------------------------------------------------------`,
      `• Approval Pending          : ${approvalList.length}`,
      `• Material Request (MR)     : ${mrList.length}`,
      `• Parent-Linked Tickets     : ${parentList.length}`,
      isCco
        ? `• Auto PMS Tickets          : ${groupMismatchList.length} (Skipped from CCO - requires approval)`
        : `• Account Group Mismatch    : ${groupMismatchList.length} (${isNamo ? "NON-NAMO" : "NAMO"} Group - ${isNamo ? "Requires RM Approval" : "Requires RM + CPSD/UCPG Approval"})`,
      completedOnlyList.length > 0 ? `• Already Completed         : ${completedOnlyList.length}` : null,
      canceledList.length > 0 ? `• Already Canceled          : ${canceledList.length}` : null,
      `• Unverified / Blank Group  : ${unverifiedList.length}`,
      ``,
      `3. NEXT ACTION DIRECTIVES`,
      `--------------------------------------------------------------------------------`,
      `• Cancellation Payload : ${readyList.length} tickets can be submitted directly.`,
      approvalList.length > 0 ? `• Approvals Escalation : ${approvalList.length} tickets pending approval clearance.` : `• Approvals Escalation : Clean (0 pending).`,
      mrList.length > 0 ? `• Material Check       : ${mrList.length} tickets require warehouse clearance.` : `• Material Check       : Clean (0 MR).`,
      groupMismatchList.length > 0
        ? isCco
          ? `• Group Re-routing     : ${groupMismatchList.length} Auto PMS tickets routed to CPSD/UCPG approval.`
          : `• Group Re-routing     : ${groupMismatchList.length} tickets routed to ${isNamo ? "NON-NAMO" : "NAMO"} team (${isNamo ? "Requires RM Approval" : "Requires RM + CPSD/UCPG Approval"}).`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      total,
      readyList,
      approvalList,
      parentList,
      mrList,
      groupMismatchList,
      completedList,
      completedOnlyList,
      canceledList,
      unverifiedList,
      skippedList,
      timestamp,
      teamsMarkdown,
      emailPlainText,
    };
  }, [result, isNamo, isCco, type, namoResult, nonNamoResult, ccoResult]);

  // Combine and annotate all tickets for the All Tickets Explorer
  const allTicketsWithCategory = React.useMemo(() => {
    if (!summaryData || !result) return [];

    const readySet = new Set(summaryData.readyList.map((t) => t.ticket));
    const approvalSet = new Set(summaryData.approvalList.map((t) => t.ticket));
    const parentSet = new Set(summaryData.parentList.map((t) => t.ticket));
    const mrSet = new Set(summaryData.mrList.map((t) => t.ticket));
    const groupSet = new Set(summaryData.groupMismatchList.map((t) => t.ticket));
    const canceledSet = new Set(summaryData.canceledList.map((t) => t.ticket));
    const completedOnlySet = new Set(summaryData.completedOnlyList.map((t) => t.ticket));
    const unverifiedSet = new Set(summaryData.unverifiedList.map((t) => t.ticket));

    return result.allRecords.map((item) => {
      let category = "Excluded";
      let badgeColor = "rose";
      let reason = item.skipReason || "Excluded";

      if (readySet.has(item.ticket)) {
        category = "Ready to Cancel";
        badgeColor = "emerald";
        reason = "Eligible for Cancellation";
      } else if (approvalSet.has(item.ticket)) {
        category = "Approval Pending";
        badgeColor = "amber";
        reason = "Approval Pending";
      } else if (parentSet.has(item.ticket)) {
        category = "Parent Tickets";
        badgeColor = "purple";
        reason = "Parent WorkOrder (Linked to Child WOs)";
      } else if (mrSet.has(item.ticket)) {
        category = "MR Raised";
        badgeColor = "rose";
        reason = "Material Request (MR) Created";
      } else if (groupSet.has(item.ticket)) {
        category = isCco ? "Auto PMS (Excluded)" : isNamo ? "NON-NAMO Group" : "NAMO Group";
        badgeColor = "sky";
        reason = isCco
          ? "Auto PMS ticket (Excluded from CCO Cancellation - requires approval)"
          : `Account Group Mismatch (${item.accountGroupName || "Opposite Group"})`;
      } else if (canceledSet.has(item.ticket)) {
        category = "Canceled";
        badgeColor = "rose";
        reason = `Already Canceled in Salesforce`;
      } else if (completedOnlySet.has(item.ticket)) {
        category = "Completed";
        badgeColor = "slate";
        reason = `Already ${item.status || "Completed"} in Salesforce`;
      } else if (unverifiedSet.has(item.ticket)) {
        category = "Unverified";
        badgeColor = "slate";
        reason = "Unverified / Blank Account Group";
      }

      return {
        ticket: item.ticket,
        accountName: item.accountName || "—",
        accountGroup: item.accountGroupName || "—",
        status: item.status || "—",
        type: classifyTicketPrefix(item.ticket).type,
        category,
        badgeColor,
        reason,
      };
    });
  }, [summaryData, result, isNamo, isCco]);

  // Filtered tickets based on search query and category filter
  const filteredTickets = React.useMemo(() => {
    return allTicketsWithCategory.filter((row) => {
      if (selectedCategory !== "all") {
        if (selectedCategory === "ready" && row.category !== "Ready to Cancel") return false;
        if (selectedCategory === "approval" && row.category !== "Approval Pending") return false;
        if (selectedCategory === "parent" && row.category !== "Parent Tickets") return false;
        if (selectedCategory === "mr" && row.category !== "MR Raised") return false;
        if (selectedCategory === "group" && !row.category.includes("Group") && !row.category.includes("Auto PMS")) return false;
        if (selectedCategory === "canceled" && row.category !== "Canceled") return false;
        if (selectedCategory === "completed" && row.category !== "Completed") return false;
        if (selectedCategory === "unverified" && row.category !== "Unverified") return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          row.ticket.toLowerCase().includes(q) ||
          row.accountName.toLowerCase().includes(q) ||
          row.accountGroup.toLowerCase().includes(q) ||
          row.reason.toLowerCase().includes(q) ||
          row.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allTicketsWithCategory, selectedCategory, searchQuery]);

  if (!isOpen || !summaryData) return null;

  const handleCopy = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    toast.success(`Copied ${formatName} Handover Summary to clipboard!`);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleCopyFilteredTickets = () => {
    const tkts = filteredTickets.map((t) => t.ticket).filter(Boolean);
    if (tkts.length === 0) return;
    navigator.clipboard.writeText(tkts.join("\n"));
    toast.success(`Copied ${tkts.length} tickets to clipboard!`);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([summaryData.emailPlainText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_Cancellation_Handover_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded Handover Summary .txt file!");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-950 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/70 dark:border-white/[0.08] flex items-center justify-between gap-4 bg-muted/20 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                  Executive Shift Handover & Segregation Audit
                </h3>
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-300 border-blue-500/25 px-2 py-0.5">
                  {type} Live Audit
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Explore all parsed WorkOrders, operational flags, and instant shift reports ready for Team Leads & MS Teams.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl border border-border/70 dark:border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* KPI Mini-Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 p-4 sm:p-5 pb-2 border-b border-border/40 dark:border-white/[0.05] bg-muted/10 dark:bg-white/[0.01]">
          {/* Total */}
          <div className="p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02]">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Total Analyzed</span>
            <div className="text-lg font-black text-foreground mt-0.5 font-mono">{summaryData.total}</div>
            <span className="text-[9px] text-muted-foreground">WorkOrders parsed</span>
          </div>

          {/* Ready */}
          <div className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/5">
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-400">Ready to Cancel</span>
            <div className="text-lg font-black text-blue-400 mt-0.5 font-mono">{summaryData.readyList.length}</div>
            <span className="text-[9px] text-blue-400/70">Clean payload</span>
          </div>

          {/* Canceled */}
          <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Canceled</span>
            <div className="text-lg font-black text-slate-200 mt-0.5 font-mono">{summaryData.canceledList.length}</div>
            <span className="text-[9px] text-slate-400/70">Already in SF</span>
          </div>

          {/* MR Raised */}
          <div className="p-2.5 rounded-xl border border-blue-400/25 bg-blue-500/5">
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-300">MR Raised</span>
            <div className="text-lg font-black text-blue-300 mt-0.5 font-mono">{summaryData.mrList.length}</div>
            <span className="text-[9px] text-blue-300/70">Material Request</span>
          </div>

          {/* Approval */}
          <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Approval Pending</span>
            <div className="text-lg font-black text-slate-200 mt-0.5 font-mono">{summaryData.approvalList.length}</div>
            <span className="text-[9px] text-slate-400/70">Locked in SF</span>
          </div>

          {/* Parent */}
          <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Parent Tickets</span>
            <div className="text-lg font-black text-slate-200 mt-0.5 font-mono">{summaryData.parentList.length}</div>
            <span className="text-[9px] text-slate-400/70">Parent Linked</span>
          </div>

          {/* Group Mismatch / Auto PMS */}
          <div className="p-2.5 rounded-xl border border-blue-500/25 bg-blue-500/5">
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-300">
              {isCco ? "Auto PMS (Excluded)" : isNamo ? "NON-NAMO Group" : "NAMO Group"}
            </span>
            <div className="text-lg font-black text-blue-300 mt-0.5 font-mono">{summaryData.groupMismatchList.length}</div>
            <span className="text-[9px] text-blue-300/70">
              {isCco ? "Requires Approval" : "Account Mismatch"}
            </span>
          </div>

          {/* Completed (if any) */}
          {summaryData.completedOnlyList.length > 0 && (
            <div className="p-2.5 rounded-xl border border-slate-500/30 bg-slate-500/5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Completed</span>
              <div className="text-lg font-black text-slate-300 mt-0.5 font-mono">{summaryData.completedOnlyList.length}</div>
              <span className="text-[9px] text-muted-foreground">Already in SF</span>
            </div>
          )}
        </div>

        {/* Tab Selector & Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 pt-3 pb-2 border-b border-border/40 dark:border-white/[0.05]">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={() => setActiveTab("tickets")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0",
                activeTab === "tickets"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>All Tickets Explorer ({allTicketsWithCategory.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("teams")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0",
                activeTab === "teams"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span>Teams / Slack</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("email")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0",
                activeTab === "email"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span>Email Report</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {activeTab === "tickets" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyFilteredTickets}
                className="h-8 text-xs font-bold border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg gap-1.5 shadow-sm whitespace-nowrap shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Visible Tickets ({filteredTickets.length})</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleCopy(
                    activeTab === "teams" ? summaryData.teamsMarkdown : summaryData.emailPlainText,
                    activeTab === "teams" ? "Teams / Slack" : "Email"
                  )
                }
                className="h-8 text-xs font-bold border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg gap-1.5 shadow-sm whitespace-nowrap shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copiedFormat ? "Copied!" : `Copy ${activeTab === "teams" ? "Teams Markdown" : "Email Text"}`}</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTxt}
              className="h-8 text-xs font-bold rounded-lg gap-1.5 shadow-sm whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .txt</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                downloadExcludedInsightsExcel({
                  cancellationType: type,
                  namoResult,
                  nonNamoResult,
                  ccoResult,
                });
              }}
              className="h-8 text-xs font-bold rounded-lg gap-1.5 shadow-sm border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300"
              title="Download multi-sheet Excluded Tickets Excel (.xlsx)"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Download .xlsx</span>
            </Button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-hidden flex-1 flex flex-col min-h-0">
          {/* TAB 1: ALL TICKETS EXPLORER */}
          {activeTab === "tickets" && (
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              {/* Category Filter Chips & Search Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: "all", label: "All", count: summaryData.total },
                    { id: "ready", label: "Ready to Cancel", count: summaryData.readyList.length },
                    { id: "approval", label: "Approval Pending", count: summaryData.approvalList.length },
                    { id: "parent", label: "Parent Tickets", count: summaryData.parentList.length },
                    { id: "mr", label: "MR Raised", count: summaryData.mrList.length },
                    ...(isCco
                      ? [
                          { id: "group", label: "Auto PMS (Excluded)", count: summaryData.groupMismatchList.length },
                        ]
                      : [
                          { id: "group", label: isNamo ? "NON-NAMO Group" : "NAMO Group", count: summaryData.groupMismatchList.length },
                        ]),
                    ...(summaryData.canceledList.length > 0
                      ? [{ id: "canceled", label: "Canceled", count: summaryData.canceledList.length }]
                      : []),
                    ...(summaryData.completedOnlyList.length > 0
                      ? [{ id: "completed", label: "Completed", count: summaryData.completedOnlyList.length }]
                      : []),
                    ...(isCco ? [] : [{ id: "unverified", label: "Unverified", count: summaryData.unverifiedList.length }]),
                  ]
                    .filter((chip) => chip.id === "all" || chip.count > 0)
                    .map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setSelectedCategory(chip.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold transition-all border",
                          selectedCategory === chip.id
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.08]"
                        )}
                      >
                        {chip.label} <span className="font-mono text-[10px] opacity-80">({chip.count})</span>
                      </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64 shrink-0">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ticket, account, reason..."
                    className="w-full h-8 pl-8 pr-3 text-xs rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tickets Table */}
              <div className="flex-1 overflow-auto rounded-2xl border border-slate-200/70 dark:border-white/[0.08] bg-slate-950/60 shadow-inner max-h-[420px]">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-white/[0.08]">
                    <tr className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                      <th className="py-2.5 px-3">Ticket Number</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Account Name</th>
                      <th className="py-2.5 px-3">Account Group</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Segregation / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground font-sans">
                          No WorkOrders matching current filter or search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((row) => (
                        <tr key={row.ticket} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-2 px-3 font-bold text-slate-200">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full shrink-0",
                                  row.badgeColor === "emerald"
                                    ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                                    : "bg-slate-400 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                                )}
                              />
                              <span className="font-mono">{row.ticket}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={cn(
                                "font-bold text-xs font-sans",
                                row.type === "Auto PMS"
                                  ? "text-blue-300"
                                  : "text-slate-300"
                              )}
                            >
                              {row.type}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-sans text-slate-300 truncate max-w-[140px]" title={row.accountName}>
                            {row.accountName}
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-bold text-xs text-sky-400">
                              {row.accountGroup}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-sans text-slate-400 text-[11px]">
                            {row.status}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={cn(
                                "text-[11px] font-sans font-semibold",
                                row.badgeColor === "emerald"
                                  ? "text-blue-300"
                                  : "text-slate-400"
                              )}
                            >
                              {row.reason}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: TEAMS / SLACK SUMMARY */}
          {activeTab === "teams" && (
            <div className="relative rounded-2xl border border-slate-200/70 dark:border-white/[0.08] bg-slate-950/80 p-4 font-mono text-xs leading-relaxed text-slate-200 shadow-inner overflow-auto max-h-[420px] whitespace-pre-wrap selection:bg-indigo-500/30">
              {summaryData.teamsMarkdown}
            </div>
          )}

          {/* TAB 3: EMAIL REPORT */}
          {activeTab === "email" && (
            <div className="relative rounded-2xl border border-slate-200/70 dark:border-white/[0.08] bg-slate-950/80 p-4 font-mono text-xs leading-relaxed text-slate-200 shadow-inner overflow-auto max-h-[420px] whitespace-pre-wrap selection:bg-indigo-500/30">
              {summaryData.emailPlainText}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border/70 dark:border-white/[0.08] flex items-center justify-between gap-3 bg-muted/20 dark:bg-white/[0.02]">
          <span className="text-[11px] text-muted-foreground font-mono">
            {summaryData.timestamp}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs font-bold rounded-lg">
              Close
            </Button>
            {activeTab === "tickets" ? (
              <Button
                size="sm"
                onClick={handleCopyFilteredTickets}
                className="h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-1.5 shadow-sm"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Filtered Tickets ({filteredTickets.length})</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() =>
                  handleCopy(
                    activeTab === "teams" ? summaryData.teamsMarkdown : summaryData.emailPlainText,
                    activeTab === "teams" ? "Teams / Slack" : "Email"
                  )
                }
                className="h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-1.5 shadow-sm"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Current View</span>
              </Button>
            )}
          </div>
        </div>
      </div>
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



  const [cancellationInputMode, setCancellationInputMode] = React.useState<"manual" | "upload">(() => {



    if (typeof window !== "undefined") {



      const saved = localStorage.getItem("soql_input_mode_cancellation");



      if (saved === "manual" || saved === "upload") return saved;



    }



    return "manual";



  });



  const [assetTransferInputMode, setAssetTransferInputMode] = React.useState<"manual" | "upload">(() => {



    if (typeof window !== "undefined") {



      const saved = localStorage.getItem("soql_input_mode_asset_transfer");



      if (saved === "manual" || saved === "upload") return saved;



    }



    return "manual";



  });







  const changeCancellationInputMode = React.useCallback((mode: "manual" | "upload") => {



    setCancellationInputMode(mode);



    if (typeof window !== "undefined") {



      localStorage.setItem("soql_input_mode_cancellation", mode);



    }



  }, []);







  const changeAssetTransferInputMode = React.useCallback((mode: "manual" | "upload") => {



    setAssetTransferInputMode(mode);



    if (typeof window !== "undefined") {



      localStorage.setItem("soql_input_mode_asset_transfer", mode);



    }



  }, []);







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



  const [transferModeTab, setTransferModeTab] = React.useState<"email" | "post" | "debug">("email");



  interface PendingTransferException {



    componentId: string;



    newCid: string;



    status: "Draft" | "AMC";



    remark: string;



  }







  const [transferSuccessfulPairs, setTransferSuccessfulPairs] = React.useState<Array<{ componentId: string; newCid: string }>>([]);



  const [transferPendingExceptions, setTransferPendingExceptions] = React.useState<PendingTransferException[]>([]);



  const [customTransferEmail, setCustomTransferEmail] = React.useState<string | null>(null);



  const [customTransferPost, setCustomTransferPost] = React.useState<string | null>(null);



  const [transferListStyle, setTransferListStyle] = React.useState<"tabular" | "numbered" | "bullets">("tabular");







  const [childDetailsComponentInput, setChildDetailsComponentInput] = React.useState("");



  const [childDetailsSOQLResult, setChildDetailsSOQLResult] = React.useState("");



  const [childDetailsOutput, setChildDetailsOutput] = React.useState("");



  const [childDetailsTransformResult, setChildDetailsTransformResult] =



    React.useState<ChildDetailsParentTransformResult | null>(null);



  const [childDetailsBatchIndex, setChildDetailsBatchIndex] = React.useState(0);







  const [cancellationExecutionInput, setCancellationExecutionInput] = React.useState("");



  const [cancellationFailedInput, setCancellationFailedInput] = React.useState("");



  const [cancellationType, setCancellationType] = React.useState<"CCO" | "NAMO" | "NON NAMO" | "Account Check">("CCO");
  const [accountCheckFilter, setAccountCheckFilter] = React.useState<
    "all" | "namo" | "non-namo" | "parent" | "child" | "approval" | "mr" | "pms" | "non-pms"
  >("all");
  const [accountCheckSearch, setAccountCheckSearch] = React.useState("");



  const [batchSize, setBatchSize] = React.useState(400);



  const [cancellationStoredRows, setCancellationStoredRows] = React.useState<CancellationExecutionRow[]>([]);



  const [cancellationExecutionBatchIndex, setCancellationExecutionBatchIndex] = React.useState(0);



  const [showDiscrepancyModal, setShowDiscrepancyModal] = React.useState(false);
  const [showAccountCheckHandoverModal, setShowAccountCheckHandoverModal] = React.useState(false);
  const [showCancellationHandoverModal, setShowCancellationHandoverModal] = React.useState(false);
  const [step5EmailTab, setStep5EmailTab] = React.useState<"preview" | "text">("preview");







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

  // Step 1 animated typewriter placeholder for clean single-line instruction
  const step1TargetPlaceholder = React.useMemo(() => {
    if (isCancellation) {
      if (cancellationType === "NON NAMO") {
        return "Paste Auto PMS ticket numbers for NON PMS cancelation only";
      }
      if (cancellationType === "NAMO") {
        return "Paste Auto PMS ticket numbers for NAMO cancellation only";
      }
      if (cancellationType === "Account Check") {
        return "Paste all ticket numbers for Account Check (PMS & NON-PMS)";
      }
      return "Paste all ticket numbers for CCO cancellation";
    }
    if (activeTemplate?.category === "Asset") {
      return "Paste component IDs here...";
    }
    return "Paste ticket numbers here...";
  }, [isCancellation, cancellationType, activeTemplate?.category]);

  const [placeholderSubIndex, setPlaceholderSubIndex] = React.useState(0);
  const [placeholderIsDeleting, setPlaceholderIsDeleting] = React.useState(false);
  const [placeholderBlink, setPlaceholderBlink] = React.useState(true);

  // Blinking cursor toggle
  React.useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Reset typewriter when target text changes
  React.useEffect(() => {
    setPlaceholderSubIndex(0);
    setPlaceholderIsDeleting(false);
  }, [step1TargetPlaceholder]);

  // Typewriter typing & deleting loop
  React.useEffect(() => {
    if (placeholderSubIndex === step1TargetPlaceholder.length && !placeholderIsDeleting) {
      const timeout = setTimeout(() => {
        setPlaceholderIsDeleting(true);
      }, 4000); // Pause for 4 seconds after typing full text
      return () => clearTimeout(timeout);
    }

    if (placeholderSubIndex === 0 && placeholderIsDeleting) {
      setPlaceholderIsDeleting(false);
      const timeout = setTimeout(() => {
        setPlaceholderSubIndex(1);
      }, 400); // Brief pause before restarting typing
      return () => clearTimeout(timeout);
    }

    const timer = setTimeout(() => {
      setPlaceholderSubIndex((prev) => prev + (placeholderIsDeleting ? -1 : 1));
    }, placeholderIsDeleting ? 25 : 55);

    return () => clearTimeout(timer);
  }, [placeholderSubIndex, placeholderIsDeleting, step1TargetPlaceholder]);








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



    return input



      .split(/[\n\r,\t]+/)



      .map((ticket) => cleanTicket(ticket))



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







  const cancellationUniqueRequestedTickets = React.useMemo(



    () => Array.from(new Set(parsedTickets.map(cleanTicket).filter(Boolean))),



    [parsedTickets]



  );







  const ticketDuplicates = React.useMemo(() => {



    const counts = new Map<string, number>();



    parsedTickets.forEach((t) => {



      const k = cleanTicket(t);



      counts.set(k, (counts.get(k) || 0) + 1);



    });



    const dupes: string[] = [];



    counts.forEach((count, t) => {



      if (count > 1) dupes.push(t);



    });



    return dupes;



  }, [parsedTickets]);







  const inputBatchSize = batchSize;



  const inputBatchCount = parsedTickets.length > 0 ? Math.ceil(parsedTickets.length / inputBatchSize) : 0;



  const ticketStats = React.useMemo(() => getTicketStats(parsedTickets), [parsedTickets]);



  const assetPairs = React.useMemo(() => parseAssetTransferPairs(assetTransferInput), [assetTransferInput]);







  const activeTransferPairs = React.useMemo(() => {



    if (transferSuccessfulPairs.length > 0) return transferSuccessfulPairs;



    return assetPairs;



  }, [transferSuccessfulPairs, assetPairs]);







  const defaultTransferEmail = React.useMemo(() => {



    if (activeTransferPairs.length === 0 && transferPendingExceptions.length === 0) return "";



    const hasCompleted = activeTransferPairs.length > 0;



    const hasPending = transferPendingExceptions.length > 0;







    const lines: string[] = ["Hi Team,", ""];







    if (transferListStyle === "tabular") {



      if (hasCompleted && hasPending) {



        lines.push("Please find below the asset transfer status:");



        lines.push("");



        lines.push("1. Asset Transfer Completed");



        lines.push("");



        activeTransferPairs.forEach((pair) => {



          lines.push(`Component ID ${pair.componentId} has been successfully transferred to Customer ID ${pair.newCid}.`);



        });



        lines.push("");



        lines.push("Please find below the asset transfer status for the respective Component IDs:");



        lines.push("");



        lines.push(buildPendingAsciiTable(transferPendingExceptions));



        lines.push("");



        lines.push("Please take the necessary action for the pending cases accordingly.");



      } else if (hasPending && !hasCompleted) {



        lines.push("Please find below the asset transfer status for the respective Component IDs:");



        lines.push("");



        lines.push(buildPendingAsciiTable(transferPendingExceptions));



        lines.push("");



        lines.push("Please take the necessary action for the pending cases accordingly.");



      } else {



        lines.push("Please find below the asset transfer status:");



        lines.push("");



        lines.push("1. Asset Transfer Completed");



        lines.push("");



        activeTransferPairs.forEach((pair) => {



          lines.push(`Component ID ${pair.componentId} has been successfully transferred to Customer ID ${pair.newCid}.`);



        });



        lines.push("");



        lines.push("Please consider the above updates and take the necessary action accordingly.");



      }



      return lines.join("\n");



    }







    if (transferListStyle === "numbered") {



      lines.push("Please find below the asset transfer status:");



      lines.push("");



      let sectionNumber = 1;







      if (hasCompleted) {



        lines.push(`${sectionNumber}. Asset Transfer Completed`);



        lines.push("");



        activeTransferPairs.forEach((pair) => {



          lines.push(`Component ID ${pair.componentId} has been successfully transferred to Customer ID ${pair.newCid}.`);



        });



        lines.push("");



        sectionNumber++;



      }







      const draftItems = transferPendingExceptions.filter((e) => e.status === "Draft");



      if (draftItems.length > 0) {



        lines.push(`${sectionNumber}. Draft – Asset Registration Pending`);



        lines.push("");



        draftItems.forEach((item) => {



          lines.push(`Component ID ${item.componentId} – Kindly coordinate with the SSG Team to complete the asset registration before proceeding with the asset transfer.`);



        });



        lines.push("");



        sectionNumber++;



      }







      const amcItems = transferPendingExceptions.filter((e) => e.status === "AMC");



      if (amcItems.length > 0) {



        lines.push(`${sectionNumber}. AMC – Asset Transfer Pending`);



        lines.push("");



        amcItems.forEach((item) => {



          lines.push(`Component ID ${item.componentId} – Kindly coordinate with the CBO Team to complete the asset transfer.`);



        });



        lines.push("");



      }







      lines.push("Please consider the above updates and take the necessary action accordingly.");



      return lines.join("\n");



    }







    // Bullets format



    lines.push("Please find below the asset transfer status:");



    lines.push("");







    if (hasCompleted) {



      lines.push("• Asset Transfer Completed:");



      activeTransferPairs.forEach((pair) => {



        lines.push(`  - Component ID ${pair.componentId} has been successfully transferred to Customer ID ${pair.newCid}.`);



      });



      lines.push("");



    }







    const draftItems = transferPendingExceptions.filter((e) => e.status === "Draft");



    if (draftItems.length > 0) {



      lines.push("• Draft – Asset Registration Pending:");



      draftItems.forEach((item) => {



        lines.push(`  - Component ID ${item.componentId} – Kindly coordinate with the SSG Team to complete the asset registration before proceeding with the asset transfer.`);



      });



      lines.push("");



    }







    const amcItems = transferPendingExceptions.filter((e) => e.status === "AMC");



    if (amcItems.length > 0) {



      lines.push("• AMC – Asset Transfer Pending:");



      amcItems.forEach((item) => {



        lines.push(`  - Component ID ${item.componentId} – Kindly coordinate with the CBO Team to complete the asset transfer.`);



      });



      lines.push("");



    }







    lines.push("Please consider the above updates and take the necessary action accordingly.");



    return lines.join("\n");



  }, [activeTransferPairs, transferPendingExceptions, transferListStyle]);







  const defaultTransferPost = React.useMemo(() => {



    if (activeTransferPairs.length === 0 && transferPendingExceptions.length === 0) return "";



    const lines: string[] = ["Hi Team,", ""];



    const hasCompleted = activeTransferPairs.length > 0;



    const hasPending = transferPendingExceptions.length > 0;







    if (hasCompleted) {



      lines.push("Asset Transfer Completed:");



      activeTransferPairs.forEach((pair) => {



        lines.push(`- Component ID ${pair.componentId} transferred to Customer ID ${pair.newCid}`);



      });



      lines.push("");



    }







    if (hasPending) {



      lines.push("Pending Asset Cases:");



      lines.push(buildPendingAsciiTable(transferPendingExceptions));



      lines.push("");



      lines.push("Please take the necessary action for the pending cases accordingly.");



    } else {



      lines.push("Please consider the asset transfer activity completed.");



    }







    return lines.join("\n");



  }, [activeTransferPairs, transferPendingExceptions]);







  const transferEmailText = customTransferEmail !== null ? customTransferEmail : defaultTransferEmail;



  const transferPostText = customTransferPost !== null ? customTransferPost : defaultTransferPost;







  const handleCopyTransferEmail = () => {
    const hasCompleted = activeTransferPairs.length > 0;
    const hasPending = transferPendingExceptions.length > 0;

    let html = `<p>Hi Team,</p>`;
    if (transferListStyle === "tabular") {
      if (hasCompleted && hasPending) {
        html += `<p>Please find below the asset transfer status:</p>`;
        html += `<p><b>1. Asset Transfer Completed</b></p>`;
        html += `<p>${activeTransferPairs.map((p) => `Component ID <b>${p.componentId}</b> has been successfully transferred to Customer ID <b>${p.newCid}</b>.`).join("<br/>")}</p>`;
        html += `<p>Please find below the asset transfer status for the respective Component IDs:</p>`;
        html += buildPendingHtmlTable(transferPendingExceptions);
        html += `<p>Please take the necessary action for the pending cases accordingly.</p>`;
      } else if (hasPending && !hasCompleted) {
        html += `<p>Please find below the asset transfer status for the respective Component IDs:</p>`;
        html += buildPendingHtmlTable(transferPendingExceptions);
        html += `<p>Please take the necessary action for the pending cases accordingly.</p>`;
      } else {
        html += `<p>Please find below the asset transfer status:</p>`;
        html += `<p><b>1. Asset Transfer Completed</b></p>`;
        html += `<p>${activeTransferPairs.map((p) => `Component ID <b>${p.componentId}</b> has been successfully transferred to Customer ID <b>${p.newCid}</b>.`).join("<br/>")}</p>`;
        html += `<p>Please consider the above updates and take the necessary action accordingly.</p>`;
      }
    } else if (transferListStyle === "numbered") {
      html += `<p>Please find below the asset transfer status:</p>`;
      let sNum = 1;
      if (hasCompleted) {
        html += `<p><b>${sNum}. Asset Transfer Completed</b></p><ol style="margin: 8px 0; padding-left: 20px;">${activeTransferPairs.map((p) => `<li>Component ID <b>${p.componentId}</b> has been successfully transferred to Customer ID <b>${p.newCid}</b>.</li>`).join("")}</ol>`;
        sNum++;
      }
      const draftItems = transferPendingExceptions.filter((e) => e.status === "Draft");
      if (draftItems.length > 0) {
        html += `<p><b>${sNum}. Draft – Asset Registration Pending</b></p><ul style="margin: 8px 0; padding-left: 20px;">${draftItems.map((i) => `<li>Component ID <b>${i.componentId}</b> – Kindly coordinate with the SSG Team to complete the asset registration before proceeding with the asset transfer.</li>`).join("")}</ul>`;
        sNum++;
      }
      const amcItems = transferPendingExceptions.filter((e) => e.status === "AMC");
      if (amcItems.length > 0) {
        html += `<p><b>${sNum}. AMC – Asset Transfer Pending</b></p><ul style="margin: 8px 0; padding-left: 20px;">${amcItems.map((i) => `<li>Component ID <b>${i.componentId}</b> – Kindly coordinate with the CBO Team to complete the asset transfer.</li>`).join("")}</ul>`;
      }
      html += `<p>Please consider the above updates and take the necessary action accordingly.</p>`;
    } else {
      html += `<p>Please find below the asset transfer status:</p>`;
      if (hasCompleted) {
        html += `<p><b>• Asset Transfer Completed</b></p><ul style="margin: 8px 0; padding-left: 20px;">${activeTransferPairs.map((p) => `<li>Component ID <b>${p.componentId}</b> has been successfully transferred to Customer ID <b>${p.newCid}</b>.</li>`).join("")}</ul>`;
      }
      const draftItems = transferPendingExceptions.filter((e) => e.status === "Draft");
      if (draftItems.length > 0) {
        html += `<p><b>• Draft – Asset Registration Pending</b></p><ul style="margin: 8px 0; padding-left: 20px;">${draftItems.map((i) => `<li>Component ID <b>${i.componentId}</b> – Kindly coordinate with the SSG Team to complete the asset registration before proceeding with the asset transfer.</li>`).join("")}</ul>`;
      }
      const amcItems = transferPendingExceptions.filter((e) => e.status === "AMC");
      if (amcItems.length > 0) {
        html += `<p><b>• AMC – Asset Transfer Pending</b></p><ul style="margin: 8px 0; padding-left: 20px;">${amcItems.map((i) => `<li>Component ID <b>${i.componentId}</b> – Kindly coordinate with the CBO Team to complete the asset transfer.</li>`).join("")}</ul>`;
      }
      html += `<p>Please consider the above updates and take the necessary action accordingly.</p>`;
    }

    handleCopy(transferEmailText, html);
    toast.success("Asset transfer email copied to clipboard!");
  };

  const handleCopyTransferPost = () => {
    handleCopy(transferPostText);
    toast.success("Asset transfer post copied to clipboard!");
  };

  const handleCopyTransferTab = () => {
    if (transferModeTab === "email") {
      handleCopyTransferEmail();
    } else if (transferModeTab === "post") {
      handleCopyTransferPost();
    } else {
      handleCopy(transferDebug);
      toast.success("Transfer debug logs copied to clipboard!");
    }
  };

  const handleCopySubject = () => {



    handleCopy("Confirmation of Asset Transfer Completion");



    toast.success("Email subject copied to clipboard!");



  };



  const childDetailsComponentParse = React.useMemo(



    () => parseComponentIds(childDetailsComponentInput),



    [childDetailsComponentInput]



  );



  const childDetailsComponentIds = childDetailsComponentParse.componentIds;



    // ALGO 1: Centralized Ticket Classification, CCO Cancellation Filtering & Approval Logic
  const algo1Result = React.useMemo(() => {
    return processAlgo1TicketClassification(ticketsInput || parsedTickets);
  }, [ticketsInput, parsedTickets]);

  const allTicketsMaster = algo1Result.allTickets;
  const ccoCancellationTickets = algo1Result.ccoCancellationTickets;
  const autoPmsTickets = algo1Result.autoPmsTickets;

  // CCO: Non-PMS Cancellation Step 3 Classification & Segregation Logic
  const ccoAlgoResult = React.useMemo<CcoAlgoResult>(() => {
    if (cancellationType !== "CCO") {
      return {
        allTickets: [],
        ccoCancellationTickets: [],
        autoPmsTickets: [],
        parentWorkOrderTickets: [],
        completedOrCanceledTickets: [],
        canceledTickets: [],
        completedTickets: [],
        approvalPendingTickets: [],
        mrCreatedTickets: [],
        allRecords: [],
        allSkippedTickets: [],
        ccoMailOutputText: "",
        ccoMailOutputHtml: "",
        ccoPostOutputText: "",
        ccoPostOutputHtml: "",
        excludedSegmentText: "",
        excludedSegmentHtml: "",
      };
    }
    return processAlgo1CcoStep3Classification(cancellationExecutionInput);
  }, [cancellationType, cancellationExecutionInput]);

  // ALGO 2: NAMO Page Auto PMS Cancellation Filtering & Output Logic
  const namoAlgo2Result = React.useMemo<NamoAlgo2Result>(() => {
    if (cancellationType !== "NAMO") {
      return {
        allAutoPmsTickets: [],
        namoCancellationTickets: [],
        nonNamoTickets: [],
        parentWorkOrderTickets: [],
        completedOrCanceledTickets: [],
        canceledTickets: [],
        completedTickets: [],
        unclassifiedTickets: [],
        approvalPendingTickets: [],
        mrCreatedTickets: [],
        nonAutoPmsTickets: [],
        allRecords: [],
        allSkippedTickets: [],
        nonNamoMailSegmentText: "",
        nonNamoMailSegmentHtml: "",
        nonNamoPostSegmentText: "",
        nonNamoPostSegmentHtml: "",
        excludedSegmentText: "",
        excludedSegmentHtml: "",
        namoMailOutputText: "",
        namoMailOutputHtml: "",
        namoPostOutputText: "",
        namoPostOutputHtml: "",
      };
    }
    return processAlgo2NamoClassification(cancellationExecutionInput);
  }, [cancellationType, cancellationExecutionInput]);

  // ALGO 3: NON-NAMO Page Auto PMS Cancellation Filtering & Output Logic
  const nonNamoAlgo3Result = React.useMemo<NonNamoAlgo3Result>(() => {
    if (cancellationType !== "NON NAMO") {
      return {
        allAutoPmsTickets: [],
        nonNamoCancellationTickets: [],
        namoTickets: [],
        parentWorkOrderTickets: [],
        completedOrCanceledTickets: [],
        canceledTickets: [],
        completedTickets: [],
        unclassifiedTickets: [],
        approvalPendingTickets: [],
        mrCreatedTickets: [],
        nonAutoPmsTickets: [],
        allRecords: [],
        allSkippedTickets: [],
        namoMailSegmentText: "",
        namoMailSegmentHtml: "",
        namoPostSegmentText: "",
        namoPostSegmentHtml: "",
        excludedSegmentText: "",
        excludedSegmentHtml: "",
        nonNamoMailOutputText: "",
        nonNamoMailOutputHtml: "",
        nonNamoPostOutputText: "",
        nonNamoPostOutputHtml: "",
      };
    }
    return processAlgo3NonNamoClassification(cancellationExecutionInput);
  }, [cancellationType, cancellationExecutionInput]);

  // ALGO 4 / Account Check: Classification and Parser Result
  const accountCheckResult = React.useMemo<AccountCheckResult>(() => {
    if (cancellationType !== "Account Check" && cancellationType !== "NON NAMO" && cancellationType !== "NAMO") {
      return {
        totalCount: 0,
        allRows: [],
        namoCount: 0,
        nonNamoCount: 0,
        unclassifiedGroupCount: 0,
        parentCount: 0,
        childCount: 0,
        pmsCount: 0,
        nonPmsCount: 0,
        approvalSentCount: 0,
        mrCreatedCount: 0,
      };
    }
    return processAccountCheckClassification(cancellationExecutionInput);
  }, [cancellationType, cancellationExecutionInput]);

  const filteredAccountCheckRows = React.useMemo(() => {
    let rows = accountCheckResult.allRows;
    if (accountCheckFilter === "namo") {
      rows = rows.filter((r) => r.accountGroupCategory === "NAMO");
    } else if (accountCheckFilter === "non-namo") {
      rows = rows.filter((r) => r.accountGroupCategory === "NON-NAMO");
    } else if (accountCheckFilter === "parent") {
      rows = rows.filter((r) => r.isParent);
    } else if (accountCheckFilter === "child") {
      rows = rows.filter((r) => r.isChild);
    } else if (accountCheckFilter === "approval") {
      rows = rows.filter((r) => r.isApprovalSent);
    } else if (accountCheckFilter === "mr") {
      rows = rows.filter((r) => r.isMrCreated);
    } else if (accountCheckFilter === "pms") {
      rows = rows.filter((r) => r.isPms);
    } else if (accountCheckFilter === "non-pms") {
      rows = rows.filter((r) => !r.isPms);
    }

    if (accountCheckSearch.trim()) {
      const q = accountCheckSearch.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.ticket.toLowerCase().includes(q) ||
          r.accountGroup.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          (r.parentTicket && r.parentTicket.toLowerCase().includes(q)) ||
          (r.fgr && r.fgr.toLowerCase().includes(q))
      );
    }
    return rows;
  }, [accountCheckResult.allRows, accountCheckFilter, accountCheckSearch]);

  const handleDownloadAccountCheckOutput = React.useCallback(() => {
    if (accountCheckResult.allRows.length === 0) {
      toast.error("No account check records available to export");
      return;
    }
    const headers = [
      "Ticket Number",
      "Account Group Category",
      "Account Group",
      "Hierarchy",
      "Parent Ticket",
      "Approval Sent",
      "MR Created",
      "FGR Status",
      "PMS Type",
      "Status",
      "Salesforce Record ID",
    ];
    const rows = accountCheckResult.allRows.map((r) => [
      r.ticket || "",
      r.accountGroupCategory || "",
      r.accountGroup || "",
      r.isParent ? "Parent" : r.isChild ? "Child" : "Individual",
      r.parentTicket || r.parentId || "",
      r.isApprovalSent ? "Yes" : "No",
      r.isMrCreated ? "Yes" : "No",
      r.fgr || "",
      r.isPms ? "Auto PMS" : "Non-PMS",
      r.status || "",
      r.id || "",
    ]);
    const tsvContent = [headers.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n");
    downloadTextFile(`account-check-analysis-${Date.now()}.tsv`, tsvContent, "text/tab-separated-values;charset=utf-8;");
    toast.success(`Exported ${accountCheckResult.allRows.length} records to TSV!`);
  }, [accountCheckResult.allRows]);

  const copySegmentTickets = React.useCallback(
    (label: string, predicate: (row: AccountCheckRow) => boolean) => {
      const tkts = accountCheckResult.allRows
        .filter(predicate)
        .map((r) => r.ticket)
        .filter(Boolean)
        .join("\n");
      if (!tkts) {
        toast.error(`No ${label} tickets found to copy`);
        return;
      }
      navigator.clipboard.writeText(tkts);
      toast.success(
        `Copied ${accountCheckResult.allRows.filter(predicate).length} ${label} tickets!`
      );
    },
    [accountCheckResult.allRows]
  );

  const cancellationExecutionRows = React.useMemo<CancellationExecutionRow[]>(
    () => {
      if (cancellationType === "NAMO") {
        return namoAlgo2Result.namoCancellationTickets.map((item) => ({
          id: item.id || "",
          ticket: item.ticket,
          status: "Canceled",
        }));
      }
      if (cancellationType === "NON NAMO") {
        return nonNamoAlgo3Result.nonNamoCancellationTickets.map((item) => ({
          id: item.id || "",
          ticket: item.ticket,
          status: "Canceled",
        }));
      }
      if (cancellationType === "CCO") {
        return ccoAlgoResult.ccoCancellationTickets.map((item) => ({
          id: item.id || "",
          ticket: item.ticket,
          status: "Canceled",
        }));
      }
      return [];
    },
    [cancellationType, namoAlgo2Result.namoCancellationTickets, nonNamoAlgo3Result.nonNamoCancellationTickets, ccoAlgoResult.ccoCancellationTickets]
  );

  const cancellationPmsRows = React.useMemo<CancellationExecutionRow[]>(() => [], []);

  const cancellationNonARows = React.useMemo<CancellationExecutionRow[]>(() => [], []);

  const executableCancellationRows = React.useMemo<CancellationExecutionRow[]>(
    () => {
      if (cancellationType === "NAMO" || cancellationType === "NON NAMO" || cancellationType === "CCO") {
        return cancellationExecutionRows;
      }
      return [];
    },
    [cancellationType, cancellationExecutionRows]
  );

  const skippedCancellationRows = React.useMemo(
    () => cancellationExecutionRows.filter((row) => !SALESFORCE_ID_REGEX.test(row.id)),
    [cancellationExecutionRows]
  );

  const uniqueExecutableCancellationRows = React.useMemo(() => {
    const seen = new Set<string>();
    return executableCancellationRows.filter((row) => {
      const k = ((row.id && row.id.trim()) ? row.id.trim().toLowerCase() : "") || (row.ticket ? row.ticket.trim().toLowerCase() : "");
      if (!k) return false;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [executableCancellationRows]);

  const cancellationCanceledOutput = React.useMemo<string>(() => {
    if (cancellationType === "NAMO") {
      if (namoAlgo2Result.namoCancellationTickets.length === 0) return "";
      const rows = [buildTSVRow(["_", "Id", "Ticket_Number_Read_Only__c", "Status"])];
      for (const item of namoAlgo2Result.namoCancellationTickets) {
        rows.push(buildTSVRow(["[WorkOrder]", item.id || "", item.ticket, "Canceled"]));
      }
      return rows.join("\n");
    }
    if (cancellationType === "NON NAMO") {
      if (nonNamoAlgo3Result.nonNamoCancellationTickets.length === 0) return "";
      const rows = [buildTSVRow(["_", "Id", "Ticket_Number_Read_Only__c", "Status"])];
      for (const item of nonNamoAlgo3Result.nonNamoCancellationTickets) {
        rows.push(buildTSVRow(["[WorkOrder]", item.id || "", item.ticket, "Canceled"]));
      }
      return rows.join("\n");
    }
    if (cancellationType === "CCO") {
      if (ccoAlgoResult.ccoCancellationTickets.length === 0) return "";
      const rows = [buildTSVRow(["_", "Id", "Ticket_Number_Read_Only__c", "Status"])];
      for (const item of ccoAlgoResult.ccoCancellationTickets) {
        rows.push(buildTSVRow(["[WorkOrder]", item.id || "", item.ticket, "Canceled"]));
      }
      return rows.join("\n");
    }
    return "";
  }, [cancellationType, namoAlgo2Result.namoCancellationTickets, nonNamoAlgo3Result.nonNamoCancellationTickets, ccoAlgoResult.ccoCancellationTickets]);

  const cancellationStoredTicketKeys = React.useMemo(() => {
    const keys: string[] = [];
    if (cancellationType === "NAMO") {
      namoAlgo2Result.allRecords.forEach((r) => keys.push(cleanTicket(r.ticket)));
    } else if (cancellationType === "NON NAMO") {
      nonNamoAlgo3Result.allRecords.forEach((r) => keys.push(cleanTicket(r.ticket)));
    } else if (cancellationType === "CCO") {
      ccoAlgoResult.allRecords.forEach((r) => keys.push(cleanTicket(r.ticket)));
    } else {
      uniqueExecutableCancellationRows.forEach((r) => keys.push(cleanTicket(r.ticket)));
      cancellationPmsRows.forEach((r) => keys.push(cleanTicket(r.ticket)));
    }
    return new Set(keys.filter(Boolean));
  }, [cancellationType, namoAlgo2Result.allRecords, nonNamoAlgo3Result.allRecords, ccoAlgoResult.allRecords, uniqueExecutableCancellationRows, cancellationPmsRows]);

  const cancellationIdToTicketMap = React.useMemo(() => {
    const map = new Map<string, string>();
    const add = (id?: string | null, ticket?: string | null) => {
      if (!id || !ticket) return;
      const cleanId = id.trim();
      const cleanTkt = cleanTicket(ticket);
      if (!cleanId || !cleanTkt) return;
      map.set(cleanId.toLowerCase(), cleanTkt);
      map.set(cleanId, cleanTkt);
      if (cleanId.length === 18) {
        map.set(cleanId.substring(0, 15).toLowerCase(), cleanTkt);
        map.set(cleanId.substring(0, 15), cleanTkt);
      }
    };

    for (const row of cancellationExecutionRows) add(row.id, row.ticket);
    for (const rec of namoAlgo2Result.allRecords) add(rec.id, rec.ticket);
    for (const rec of nonNamoAlgo3Result.allRecords) add(rec.id, rec.ticket);
    for (const rec of ccoAlgoResult.allRecords) add(rec.id, rec.ticket);
    for (const row of accountCheckResult.allRows) add(row.id, row.ticket);
    for (const row of uniqueExecutableCancellationRows) add(row.id, row.ticket);

    return map;
  }, [
    cancellationExecutionRows,
    namoAlgo2Result.allRecords,
    nonNamoAlgo3Result.allRecords,
    ccoAlgoResult.allRecords,
    accountCheckResult.allRows,
    uniqueExecutableCancellationRows,
  ]);

  const parsedCancellationFailed = React.useMemo(() => {
    return parseCancellationFailedResults(cancellationFailedInput, cancellationIdToTicketMap);
  }, [cancellationFailedInput, cancellationIdToTicketMap]);







  const cancellationMissingTickets = React.useMemo(() => {



    return cancellationUniqueRequestedTickets.filter(



      (ticket) => !cancellationStoredTicketKeys.has(ticket)



    );



  }, [cancellationUniqueRequestedTickets, cancellationStoredTicketKeys]);







  const cancellationMatchedTicketCount = React.useMemo(() => {



    let matchedCount = 0;



    cancellationUniqueRequestedTickets.forEach((ticket) => {



      if (cancellationStoredTicketKeys.has(ticket)) matchedCount += 1;



    });



    return matchedCount;



  }, [cancellationUniqueRequestedTickets, cancellationStoredTicketKeys]);







  const cancellationUnexpectedResultCount = React.useMemo(() => {



    const reqSet = new Set(cancellationUniqueRequestedTickets);



    let unexpectedCount = 0;



    cancellationStoredTicketKeys.forEach((ticket) => {



      if (!reqSet.has(ticket)) unexpectedCount += 1;



    });



    return unexpectedCount;



  }, [cancellationUniqueRequestedTickets, cancellationStoredTicketKeys]);







  const cancellationRemainingTicketCount = cancellationMissingTickets.length;







  const discrepancyDiffItems = React.useMemo<DiscrepancyDiffItem[]>(() => {



    const sfRowMap = new Map<string, CancellationExecutionRow>();



    uniqueExecutableCancellationRows.forEach((r) => {



      const k = cleanTicket(r.ticket);



      if (k) sfRowMap.set(k, r);



    });



    cancellationPmsRows.forEach((r) => {



      const k = cleanTicket(r.ticket);



      if (k && !sfRowMap.has(k)) sfRowMap.set(k, r);



    });







    const step1TicketCounts = new Map<string, number>();



    parsedTickets.forEach((t) => {



      const k = cleanTicket(t);



      if (k) step1TicketCounts.set(k, (step1TicketCounts.get(k) || 0) + 1);



    });







    const items: DiscrepancyDiffItem[] = [];



    const processedKeys = new Set<string>();







    // 1. Process Step 1 requested tickets



    step1TicketCounts.forEach((count, ticket) => {



      processedKeys.add(ticket);



      const sfRow = sfRowMap.get(ticket);



      const isMatched = !!sfRow;



      const isDupe = count > 1;







      let diagnosis = "";



      if (isMatched) {
        diagnosis = isDupe
          ? `Matched (WorkOrder: ${sfRow.id}) · Pasted ${count}x in Step 1`
          : `Ready to cancel (WorkOrder: ${sfRow.id})`;
      } else {
        diagnosis = isDupe
          ? `Missing from SF · Duplicate ${count}x in Step 1`
          : `Missing from SF · Excluded by WHERE filter (Already Canceled, Completed, or Child WorkOrder)`;
      }

      items.push({



        ticket,



        step1Count: count,



        isRequested: true,



        isDuplicateInStep1: isDupe,



        salesforceRow: sfRow,



        status: isMatched ? "matched" : "missing",



        diagnosis,



      });



    });







    // 2. Process Unexpected SF rows that were NOT in Step 1



    sfRowMap.forEach((sfRow, ticket) => {



      if (!processedKeys.has(ticket)) {



        items.push({



          ticket,



          step1Count: 0,



          isRequested: false,



          isDuplicateInStep1: false,



          salesforceRow: sfRow,



          status: "unexpected",



          diagnosis: `Returned in Step 3 but was NOT requested in Step 1 (WorkOrder: ${sfRow.id})`,



        });



      }



    });







    return items;



  }, [parsedTickets, uniqueExecutableCancellationRows, cancellationPmsRows]);







  const cancellationResultBatchCount =



    uniqueExecutableCancellationRows.length > 0



      ? Math.ceil(uniqueExecutableCancellationRows.length / batchSize)



      : 0;







  const cancellationUpdateDebug = React.useMemo(() => {



    if (!cancellationExecutionRows.length) return "";







    const lines: string[] = [];



    lines.push(`Total parsed rows: ${cancellationExecutionRows.length}`);



    lines.push(`Ready for cancel execution: ${uniqueExecutableCancellationRows.length}`);



    if (cancellationType === "CCO") {



      lines.push(`PMS tickets (skipped from cancel): ${cancellationPmsRows.length}`);



    }



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



  }, [cancellationExecutionRows, uniqueExecutableCancellationRows, skippedCancellationRows, cancellationPmsRows, cancellationType]);







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



  const cancellationQueryBatches = React.useMemo<string[]>(() => {
    if (cancellationType === "CCO" && parsedTickets.length > 0) {
      // CCO is for NON-PMS tickets (prefixes like B, C, D, S, I, X, etc.)
      // Skip any PMS tickets starting with 'A'
      const ticketsToQuery = parsedTickets
        .map(cleanTicket)
        .filter((t) => Boolean(t) && !t.toUpperCase().startsWith("A"));
      if (ticketsToQuery.length === 0) return [];
      const batches: string[] = [];
      const size = Math.max(10, Math.min(2000, Number(batchSize) || 400));
      for (let i = 0; i < ticketsToQuery.length; i += size) {
        const slice = ticketsToQuery.slice(i, i + size);
        const formatted = slice.map((t) => `'${t}'`).join(",\n  ");
        batches.push(
          `SELECT Id, Ticket_Number_Read_Only__c, ParentWorkOrderId, ParentWorkOrder.Ticket_Number_Read_Only__c, Is_Approval_Sent__c, Is_MR_Created__c, Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n  ${formatted}\n)`
        );
      }
      return batches;
    }
    if (cancellationType === "NON NAMO" && parsedTickets.length > 0) {
      // Condition 1: Only PMS tickets starting with 'A' (skip non-A)
      const ticketsToQuery = parsedTickets
        .map(cleanTicket)
        .filter((t) => Boolean(t) && t.toUpperCase().startsWith("A"));
      if (ticketsToQuery.length === 0) return [];
      const batches: string[] = [];
      const size = Math.max(10, Math.min(2000, Number(batchSize) || 400));
      for (let i = 0; i < ticketsToQuery.length; i += size) {
        const slice = ticketsToQuery.slice(i, i + size);
        const formatted = slice.map((t) => `'${t}'`).join(",\n  ");
        batches.push(
          `SELECT Id, Ticket_Number_Read_Only__c, ParentWorkOrderId, ParentWorkOrder.Ticket_Number_Read_Only__c, Is_Approval_Sent__c, Is_MR_Created__c, Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n  ${formatted}\n)`
        );
      }
      return batches;
    }
    if (cancellationType === "Account Check" && parsedTickets.length > 0) {
      const ticketsToQuery = parsedTickets.map(cleanTicket).filter(Boolean);
      if (ticketsToQuery.length === 0) return [];
      const batches: string[] = [];
      const size = Math.max(10, Math.min(2000, Number(batchSize) || 400));
      for (let i = 0; i < ticketsToQuery.length; i += size) {
        const slice = ticketsToQuery.slice(i, i + size);
        const formatted = slice.map((t) => `'${t}'`).join(",\n  ");
        batches.push(
          `SELECT Id, Ticket_Number_Read_Only__c, ParentWorkOrderId, ParentWorkOrder.Ticket_Number_Read_Only__c, Is_Approval_Sent__c, Is_MR_Created__c, Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n  ${formatted}\n)`
        );
      }
      return batches;
    }
    if (cancellationType === "NAMO" && parsedTickets.length > 0) {
      // Condition 1: Only PMS tickets starting with 'A' (skip non-A)
      const ticketsToQuery = parsedTickets
        .map(cleanTicket)
        .filter((t) => Boolean(t) && t.toUpperCase().startsWith("A"));
      if (ticketsToQuery.length === 0) return [];
      const batches: string[] = [];
      const size = Math.max(10, Math.min(2000, Number(batchSize) || 400));
      for (let i = 0; i < ticketsToQuery.length; i += size) {
        const slice = ticketsToQuery.slice(i, i + size);
        const formatted = slice.map((t) => `'${t}'`).join(",\n  ");
        batches.push(
          `SELECT Id, Ticket_Number_Read_Only__c, ParentWorkOrderId, ParentWorkOrder.Ticket_Number_Read_Only__c, Is_Approval_Sent__c, Is_MR_Created__c, Account.Group__c, Account.Name, FGR_Approved_Reject_For_CRBF__c, AssetId, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n  ${formatted}\n)`
        );
      }
      return batches;
    }
    return [];
  }, [cancellationType, parsedTickets, batchSize]);

  const assetTransferComponentSOQL = React.useMemo(() => {



    if (assetPairs.length === 0) return "";



    const componentIds = assetPairs.map((pair) => pair.componentId);



    const formatted = formatTicketsForSOQL(componentIds);







    return `SELECT Component_Id__c, Id, status, Asset_Obligation__c, Account.Customer_ID__c, Record_Type__c, Parent.Id, Parent.Account.Id\nFROM Asset\nWHERE Component_Id__c IN (\n${formatted}\n)`;



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



    const successfulPairsList: Array<{ componentId: string; newCid: string }> = [];







    const pendingExceptionsList: PendingTransferException[] = [];







    for (const pair of assetPairs) {



      const assetRow = assetData[pair.componentId];



      if (!assetRow) {



        missingAssets.push(pair.componentId);



        debugLines.push(`❌ ${pair.componentId} → Asset not found in Component SOQL result`);



        continue;



      }







      const status = (assetRow.status || "").trim();



      const obligation = (assetRow.asset_obligation__c || assetRow.obligation || assetRow.asset_obligation || "").trim();







      const isDraft = status.toLowerCase() === "draft";



      const isAMC = obligation.toUpperCase() === "AMC" || obligation.toLowerCase().includes("amc") || status.toUpperCase() === "AMC";







      if (isDraft) {



        pendingExceptionsList.push({



          componentId: pair.componentId,



          newCid: pair.newCid,



          status: "Draft",



          remark: "Kindly coordinate with the SSG Team to complete the asset registration before proceeding with the asset transfer.",



        });



        debugLines.push(`⚠️ ${pair.componentId} → Skipped (Draft: Asset registration pending with SSG Team)`);



        continue;



      }







      if (isAMC) {



        pendingExceptionsList.push({



          componentId: pair.componentId,



          newCid: pair.newCid,



          status: "AMC",



          remark: "Kindly coordinate with the CBO Team to complete the asset transfer.",



        });



        debugLines.push(`⚠️ ${pair.componentId} → Skipped (AMC: Asset transfer pending with CBO Team)`);



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







        successfulPairsList.push(pair);



        debugLines.push(`✅ ${pair.componentId} → ${addedIds.join(" & ")} | CID ${pair.newCid} → ${accountId}`);



      } else {



        const assetId = assetRow.id;



        if (!assetId) {



          debugLines.push(`❌ ${pair.componentId} → No valid asset ID found`);



          continue;



        }



        rows.push(`"[Asset]","${assetId}","${accountId}"`);



        successfulPairsList.push(pair);



        debugLines.push(`✅ ${pair.componentId} → ${assetId} (Asset.Id) | CID ${pair.newCid} → ${accountId}`);



      }



    }







    setTransferSuccessfulPairs(successfulPairsList);



    setTransferPendingExceptions(pendingExceptionsList);



    setCustomTransferEmail(null);



    setCustomTransferPost(null);



    setTransferOutput(rows.length > 1 ? rows.join("\n") : "");



    setTransferDebug(debugLines.join("\n"));







    if (rows.length === 1 && pendingExceptionsList.length === 0) {



      toast.error(`No records generated. Missing: ${missingAssets.length} assets, ${missingCids.length} CIDs`);



    } else {



      const summaryMsg: string[] = [];



      if (rows.length > 1) summaryMsg.push(`${rows.length - 1} transfer rows`);



      if (pendingExceptionsList.length > 0) summaryMsg.push(`${pendingExceptionsList.length} pending exceptions (Draft/AMC)`);



      toast.success(`Processed: ${summaryMsg.join(", ")}`);



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



      const parsedRows = parseCancellationExecutionRows(rawResult, parsedTickets);



      const validRows = parsedRows.filter((row) => SALESFORCE_ID_REGEX.test(row.id));







      if (validRows.length === 0) {



        toast.error("No valid WorkOrder rows found in the pasted Salesforce result");



        return;



      }







      const nextMap = new Map<string, CancellationExecutionRow>();



      cancellationStoredRows.forEach((row) => {



        nextMap.set(row.id.toLowerCase(), row);



      });







      let addedRows = 0;



      let updatedRows = 0;







      for (const row of validRows) {



        const rowKey = row.id.toLowerCase();



        if (nextMap.has(rowKey)) {



          updatedRows += 1;



        } else {



          addedRows += 1;



        }



        nextMap.set(rowKey, row);



      }







      const nextRows = Array.from(nextMap.values());



      setCancellationStoredRows(nextRows);







      if (addedRows === 0 && updatedRows === 0) {



        toast.info("All pasted WorkOrder rows were already stored");



        return;



      }







      if (addedRows === 0 && updatedRows > 0) {



        toast.success(`Updated ${updatedRows} existing WorkOrder row${updatedRows === 1 ? "" : "s"}`);



      } else {



        toast.success(



          `Stored batch: added ${addedRows} row${addedRows === 1 ? "" : "s"}${



            updatedRows > 0 ? `, updated ${updatedRows}` : ""



          } (${nextRows.length} total stored)`



        );



      }



    },



    [cancellationStoredRows, parsedTickets]



  );







  const handleClearCancellationBatches = React.useCallback(() => {



    setCancellationExecutionInput("");



    setCancellationStoredRows([]);



    toast.info("Cleared Step 3 SOQL results and stored batches");



  }, []);







  const handleCopyMissingTickets = React.useCallback(() => {



    if (cancellationMissingTickets.length === 0) return;



    navigator.clipboard.writeText(cancellationMissingTickets.join("\n"));



    toast.success(`Copied ${cancellationMissingTickets.length} missing ticket${cancellationMissingTickets.length === 1 ? "" : "s"} to clipboard!`);



  }, [cancellationMissingTickets]);







  const handleGenerateMissingAuditQuery = React.useCallback(() => {



    if (cancellationMissingTickets.length === 0) return;



    const formatted = formatTicketsForSOQL(cancellationMissingTickets);



    const auditQuery = `SELECT Id, Ticket_Number_Read_Only__c, Status, ParentWorkOrderId\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n${formatted}\n)`;



    navigator.clipboard.writeText(auditQuery);



    toast.success(`Copied SOQL audit query for ${cancellationMissingTickets.length} missing tickets to clipboard!`);



  }, [cancellationMissingTickets, formatTicketsForSOQL]);







  const handleCancellationResultPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = event.clipboardData.getData("text");
    if (!pastedText.trim()) return;

    event.preventDefault();

    const target = event.currentTarget;
    const selectionStart = target.selectionStart;
    const selectionEnd = target.selectionEnd;

    setCancellationExecutionInput((prev) => {
      const cleanPrev = prev.trim();
      if (!cleanPrev) return pastedText;

      // If user selected all text (Ctrl+A), replace completely
      if (
        typeof selectionStart === "number" &&
        typeof selectionEnd === "number" &&
        selectionStart === 0 &&
        selectionEnd === target.value.length
      ) {
        return pastedText;
      }

      // If user selected a specific range, replace that selection
      if (
        typeof selectionStart === "number" &&
        typeof selectionEnd === "number" &&
        selectionStart !== selectionEnd
      ) {
        return prev.slice(0, selectionStart) + pastedText + prev.slice(selectionEnd);
      }

      // Otherwise, append the new batch (e.g. Batch 2, 3, 4) to existing batches
      return cleanPrev + "\n" + pastedText;
    });
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







      if (isAssetTransfer) {



        const pairs = parseAssetTransferPairs(textContent);



        const scannedLines = textContent.split(/\r\n|\n|\r/).length;



        if (pairs.length === 0) {



          toast.error("No valid Component ID and CID pairs were found in this file.");



          setUploadState("error");



          return;



        }



        const formattedPairs = pairs.map((p) => `${p.componentId}\t${p.newCid}`).join("\n");



        setAssetTransferInput(formattedPairs);



        setMissingCases([]);



        setUploadSummary({



          file: file.name,



          scannedLines, 



          total: pairs.length,



          unique: pairs.length,



          valid: pairs.length,



          missing: 0,



        });



        setUploadState("success");



        toast.success(`Loaded ${pairs.length} Component & CID pairs from ${file.name}`);



        return;



      }







      const extractedCaseIds = parseCaseIds(textContent);



      const extractedTickets = isCancellation ? parseTickets(textContent) : [];



      const extractedIds = Array.from(new Set([...extractedCaseIds, ...extractedTickets]));



      const scannedLines = textContent.split(/\r\n|\n|\r/).length;



      



      if (extractedIds.length === 0) {



        toast.error("No valid Salesforce Case IDs or Ticket Numbers were detected. Other text/data was ignored.");



        setUploadState("error");



        return;



      }







      if (!isCaseAssign) {



        setTicketsInput(extractedIds.join("\n"));



        setMissingCases([]);



        setUploadSummary({



          file: file.name,



          scannedLines, 



          total: extractedIds.length,



          unique: extractedIds.length,



          valid: extractedIds.length,



          missing: 0,



        });



        setUploadState("success");



        toast.success(`Loaded ${extractedIds.length} tickets from ${file.name}`);



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







  const handleRevertAssignment = () => {



    if (!ticketsInput.trim()) {



      toast.error("Paste one or more Case IDs first");



      return;



    }







    if (caseAssignmentRows.length === 0) {



      toast.error("No valid Case IDs found. Paste 15- or 18-character Salesforce Case IDs beginning with 500.");



      return;



    }







    const assignments = caseAssignmentRows.map(row => ({



      row,



      owner: { ownerId: "00GNy000009qbJFMAY" }



    }));







    const output = buildCaseAssignmentOutput(assignments);



    



    setCaseAssignOutput(output);



    setCaseAssignmentResult({



      output,



      assignedCount: caseAssignmentRows.length,



      unassignedCaseIds: [],



      ownerCount: 1,



      casesPerOwner: caseAssignmentRows.length,



    });



    



    toast.success(`Generated revert assignment for ${caseAssignmentRows.length} case${caseAssignmentRows.length === 1 ? "" : "s"}`);



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



    setTransferSuccessfulPairs([]);



    setTransferPendingExceptions([]);



    setCustomTransferEmail(null);



    setCustomTransferPost(null);



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







  const handleCopy = async (value: string, htmlContent?: string) => {



    if (!value.trim()) return;



    try {



      if (htmlContent && typeof ClipboardItem !== "undefined") {



        const textBlob = new Blob([value], { type: "text/plain" });



        const htmlBlob = new Blob([htmlContent], { type: "text/html" });



        await navigator.clipboard.write([



          new ClipboardItem({



            "text/plain": textBlob,



            "text/html": htmlBlob,



          }),



        ]);



        toast.success("Copied to clipboard");



        return;



      }



    } catch {



      // Fallback to writeText



    }



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



    setUploadState("idle");



    setUploadSummary(null);



    setMissingCases([]);



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



    <div className="workspace-page mx-auto w-full max-w-[1600px] space-y-4 pb-14 p-3 sm:p-5 lg:p-6">



      {/* ─── Compact Top Action Bar ───────────────────────────────────────────── */}



      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10 pt-1">



        <div className="flex items-center gap-2.5">



          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 shadow-xs">



            <Terminal className="h-4 w-4" />



          </div>



          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">



            SOQL Generator Presets



          </span>



        </div>







        <div className="flex items-center gap-2 self-end sm:self-auto">



          <Button 



            variant="outline" 



            size="sm" 



            onClick={handleClear} 



            className="gap-2 h-9 px-3.5 rounded-xl border-slate-200/80 dark:border-white/[0.1] hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 text-slate-600 dark:text-slate-300 font-bold transition-all bg-white/70 dark:bg-white/[0.04] backdrop-blur-md shadow-sm text-xs"



          >



            <Trash2 className="h-3.5 w-3.5" /> Clear All



          </Button>



          <Button



            size="sm"



            onClick={triggerGenerate}



            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold shadow-md shadow-sky-500/20 h-9 px-5 rounded-xl transition-all hover:-translate-y-0.5 gap-2 text-xs border border-sky-400/30"



          >



            <PlayCircle className="h-4 w-4 fill-white/20" /> Generate SOQL



          </Button>



        </div>



      </div>







      {showStats && !isAssetTransfer && !isCaseAssign && (



        <motion.div



          initial={{ opacity: 0, y: -4 }}



          animate={{ opacity: 1, y: 0 }}



          className="rounded-2xl border border-slate-200/80 dark:border-white/[0.12] bg-white/55 dark:bg-[#0b0c10]/45 backdrop-blur-2xl p-3 sm:p-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)]"



        >



          <div className="flex flex-wrap items-center gap-3">



            <div className="flex items-center gap-2.5 pr-3 border-r border-slate-200 dark:border-white/[0.08]">



              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Parsed</span>



              <span className="font-extrabold text-xs text-slate-900 dark:text-white">



                {ticketStats.total}



              </span>



            </div>







            {statEntries.map(([code, count]) => (



              <StatPill key={code} code={code} count={count} />



            ))}







            {ticketStats.unknown > 0 && (



              <div className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 dark:bg-[#06070a] dark:border-white/[0.08] px-3 py-1.5 shadow-xs">



                <span className="inline-block h-2 w-2 rounded-full bg-slate-400 ring-2 ring-white dark:ring-[#030305]" />



                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">



                  Other: <strong className="text-slate-900 dark:text-white font-bold tabular-nums ml-1">{ticketStats.unknown}</strong>



                </span>



              </div>



            )}



          </div>



        </motion.div>



      )}







      {/* Shortcuts */}



      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 mb-3 relative z-10">



          {(() => {



            const baseShortcuts = [



              {



                id: "19",



                name: "CANCELLATION REQUESTED",



                icon: "FileWarning",



                iconColor: "text-rose-500",



              },



              {



                id: "3",



                name: "ASSET TRANSFER",



                icon: "ArrowRightLeft",



                iconColor: "text-sky-500",



              },



              {



                id: "4",



                name: "CASE ASSIGN",



                icon: "Users",



                iconColor: "text-purple-500",



              },



              {



                id: "20",



                name: "CHILD TO PARENT UPDATED",



                icon: "CornerRightUp",



                iconColor: "text-indigo-500",



              },



              {



                id: "1",



                name: "UPDATE ACCEPTED & NONE",



                icon: "CheckCircle2",



                iconColor: "text-emerald-500",



              },



            ];



            



            const dynamicShortcuts = [...baseShortcuts];



            for (const favId of Array.from(favourites)) {



              if (!dynamicShortcuts.some(s => s.id === favId)) {



                const t = templates.find(temp => temp.id === favId);



                if (t) {



                  dynamicShortcuts.push({



                    id: t.id,



                    name: t.name.toUpperCase(),



                    icon: "Star",



                    iconColor: "text-amber-400",



                  });



                }



              }



            }



            return dynamicShortcuts;



          })().map((shortcut) => {



            const isActive = selectedTemplate === shortcut.id;



            return (



              <motion.button



                key={shortcut.id}



                onClick={() => handleTemplateChange(shortcut.id)}



                whileHover={{ scale: 1.025, y: -1 }}



                whileTap={{ scale: 0.95 }}



                className={cn(



                  "group p-2.5 rounded-xl flex items-center justify-center gap-2 border relative overflow-hidden cursor-pointer transition-all duration-200 min-w-0",



                  isActive 



                    ? "z-10 border-transparent text-white shadow-lg shadow-blue-500/30" 



                    : "z-0 border-slate-200/90 bg-gradient-to-b from-white via-slate-50/90 to-slate-100/70 hover:from-white hover:to-slate-100/90 hover:border-slate-300 dark:border-white/[0.08] dark:bg-gradient-to-b dark:from-white/[0.07] dark:via-white/[0.03] dark:to-transparent dark:hover:from-white/[0.12] dark:hover:via-white/[0.05] dark:hover:border-white/[0.18] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"



                )}



              >



                {isActive && (



                  <>



                    {/* Vibrant Ambient Glow Underneath */}



                    <motion.div



                      layoutId="activePresetGlow"



                      className="absolute -inset-1 rounded-xl bg-gradient-to-r from-sky-400/40 via-blue-600/35 to-blue-700/40 blur-md pointer-events-none opacity-60 dark:opacity-75 z-0"



                      transition={{ type: "spring", stiffness: 420, damping: 28 }}



                    />



                    {/* Active Solid Gradient Pill - Asset Transfer Blue */}



                    <motion.div



                      layoutId="activePresetIndicator"



                      className="absolute inset-0 rounded-xl z-0 pointer-events-none bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 shadow-md"



                      transition={{ type: "spring", stiffness: 420, damping: 28 }}



                    />



                    {/* Top Specular Rim */}



                    <motion.div



                      layoutId="activePresetRim"



                      className="absolute inset-x-3 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10"



                      transition={{ type: "spring", stiffness: 420, damping: 28 }}



                    />



                  </>



                )}



                



                <div className="relative z-10 flex items-center justify-center gap-2.5 min-w-0">



                  <motion.div



                    animate={isActive ? { scale: [1, 1.25, 1], rotate: [0, -8, 0] } : { scale: 1, rotate: 0 }}



                    transition={{ type: "spring", stiffness: 450, damping: 18 }}



                    className="shrink-0 flex items-center justify-center"



                  >



                    {shortcut.icon === "FileWarning" && <FileWarning className={cn("h-4.5 w-4.5 shrink-0 transition-colors", isActive ? "text-white" : shortcut.iconColor)} />}



                    {shortcut.icon === "ArrowRightLeft" && <ArrowRightLeft className={cn("h-4.5 w-4.5 shrink-0 transition-colors", isActive ? "text-white" : shortcut.iconColor)} />}



                    {shortcut.icon === "CalendarClock" && <CalendarClock className={cn("h-4.5 w-4.5 shrink-0 transition-colors", isActive ? "text-white" : shortcut.iconColor)} />}



                    {shortcut.icon === "Users" && <Users className={cn("h-4.5 w-4.5 shrink-0 transition-colors", isActive ? "text-white" : shortcut.iconColor)} />}



                    {shortcut.icon === "CornerRightUp" && <CornerRightUp className={cn("h-4.5 w-4.5 shrink-0 transition-colors", isActive ? "text-white" : shortcut.iconColor)} />}



                    {shortcut.icon === "CheckCircle2" && <CheckCircle2 className={cn("h-4.5 w-4.5 shrink-0 transition-colors", isActive ? "text-white" : shortcut.iconColor)} />}



                    {shortcut.icon === "Star" && <Star className={cn("h-4.5 w-4.5 shrink-0 transition-colors", isActive ? "text-white fill-white/20" : "text-amber-400 fill-amber-400/20")} />}



                  </motion.div>



                  <span className={cn(



                    "text-[10px] uppercase tracking-wider text-center leading-tight line-clamp-2 transition-colors duration-200",



                    isActive 



                      ? "text-white font-black drop-shadow-xs" 



                      : "text-slate-600 dark:text-slate-400 font-bold group-hover:text-slate-900 dark:group-hover:text-white"



                  )}>



                    {shortcut.name}



                  </span>



                </div>



              </motion.button>



            );



          })}



      </div>



      <div className="grid gap-5 grid-cols-1 xl:grid-cols-12 lg:gap-6">



        <motion.div



          initial={{ opacity: 0, x: -8 }}



          animate={{ opacity: 1, x: 0 }}



          transition={{ duration: 0.25 }}



          className="2xl:col-span-4 xl:col-span-4 space-y-4 min-w-0 flex flex-col h-full min-h-0"



        >



          {/* Obsidian Frosted Monolithic Glass Card */}



          <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.12] bg-white/50 dark:bg-[#0b0c10]/45 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.7)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.12)] overflow-hidden relative group transition-all duration-300">



            {/* Top Specular Rim */}



            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/25 to-transparent pointer-events-none" />



            



            {/* Ambient Glass Glow Orbs */}



            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-sky-500/10 dark:bg-sky-400/[0.08] blur-3xl pointer-events-none" />



            <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-indigo-500/10 dark:bg-indigo-400/[0.06] blur-3xl pointer-events-none" />







            {/* Seamless Glass Header - Inscribed directly on the glass surface without dividers */}



            <div className="p-4 sm:p-5 pb-2 relative z-10 flex items-center justify-between gap-3">



              <div className="flex items-center gap-2.5">



                <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />



                <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">



                  Query Template



                </h3>



              </div>



              <div className="flex items-center gap-1.5 shrink-0">



                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-900/[0.04] dark:bg-white/[0.06] border border-slate-900/[0.05] dark:border-white/[0.06]">



                  {defaultTemplateCount} Built-in



                </span>



                <span className="text-slate-300 dark:text-slate-700">•</span>



                <span className={cn(



                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/[0.04] dark:bg-white/[0.06] border border-slate-900/[0.05] dark:border-white/[0.06]",



                  libraryLoadState === "error" ? "text-rose-500 border-rose-500/20" : "text-slate-500 dark:text-slate-400"



                )}>



                  {libraryLoadState === "loading" ? "Loading..." : `${libraryTemplateCount} Saved`}



                </span>



              </div>



            </div>







            {/* Glass Body */}



            <div className="p-4 sm:p-5 pt-2 space-y-4 relative z-10">



              <div className="flex items-center gap-2 w-full">



                <div className="flex-1 min-w-0">



                  <TemplatePicker



                    templates={templates}



                    value={selectedTemplate}



                    onChange={handleTemplateChange}



                  />



                </div>



                <button



                  type="button"



                  onClick={() => toggleFav(selectedTemplate)}



                  className={cn(



                    "flex-shrink-0 flex items-center justify-center h-[46px] w-[46px] rounded-xl transition-all duration-300 backdrop-blur-md border",



                    activeTemplate?.source === "library"



                      ? activeTemplate.favourite



                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.25)]"



                        : "bg-white/40 dark:bg-white/[0.03] border-slate-900/[0.08] dark:border-white/[0.08] text-slate-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-white/70 dark:hover:bg-white/[0.06]"



                      : favourites.has(selectedTemplate)



                      ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.25)]"



                      : "bg-white/40 dark:bg-white/[0.03] border-slate-900/[0.08] dark:border-white/[0.08] text-slate-400 hover:text-amber-500 hover:border-amber-500/30 hover:bg-white/70 dark:hover:bg-white/[0.06]"



                  )}



                  aria-label={`Toggle favourite for ${activeTemplate?.name ?? ""}`}



                  title={activeTemplate?.favourite || favourites.has(selectedTemplate) ? "Remove Bookmark" : "Bookmark Template"}



                >



                  <Star



                    className={`h-[18px] w-[18px] transition-all duration-500 ease-out hover:scale-125 hover:-rotate-12 ${



                      activeTemplate?.source === "library"



                        ? activeTemplate.favourite



                          ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"



                          : "text-slate-400 hover:text-amber-500"



                        : favourites.has(selectedTemplate)



                        ? "fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"



                        : "text-slate-400 hover:text-amber-500"



                    }`}



                  />



                </button>



              </div>







              {isCancellation && (



                <div className="w-full pt-0.5">



                  <div className="grid grid-cols-4 gap-1 p-1.5 rounded-xl bg-slate-100/80 dark:bg-[#070a14]/70 border border-slate-200/80 dark:border-white/[0.10] backdrop-blur-xl shadow-inner relative">



                    {(["CCO", "NAMO", "NON NAMO", "Account Check"] as const).map((type) => {



                      const isSelected = cancellationType === type;



                      const label = type === "Account Check" ? "Insight" : type;



                      return (



                        <button



                          key={type}



                          type="button"



                          onClick={() => {



                            if (cancellationType !== type) {



                              setCancellationType(type);



                              setCancellationStoredRows([]);



                            }



                          }}



                          title={type === "Account Check" ? "Insight" : undefined}



                          className={cn(



                            "relative py-2 px-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 text-center flex items-center justify-center select-none z-10",



                            isSelected



                              ? "text-white"



                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/[0.06]"



                          )}



                        >



                          {isSelected && (



                            <motion.div



                              layoutId="activeCancellationTypeBadge"



                              transition={{ type: "spring", stiffness: 450, damping: 32 }}



                              className="absolute inset-0 bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 rounded-lg shadow-md z-[-1] border border-sky-300/40"



                              style={{



                                boxShadow: "0 4px 16px rgba(2, 132, 199, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.35)"



                              }}



                            />



                          )}



                          <span className="truncate relative z-10">{label}</span>



                        </button>



                      );



                    })}



                  </div>



                </div>



              )}



              



              {(isCancellation || isUpdateAcceptedAndNone) && (



                <div className="w-full pt-2 space-y-3">



                  {/* Subtle Glass Filament Divider */}



                  <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 dark:via-white/[0.08] to-transparent" />







                  <div className="flex items-center justify-between px-1">



                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">



                      <Database className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />



                      Batch Size Limit



                    </span>



                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 dark:bg-sky-400/15 border border-sky-500/25 dark:border-sky-400/30 shadow-[0_0_12px_rgba(56,189,248,0.15)]">



                      <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-300">{batchSize}</span>



                      <span className="text-[9px] font-bold uppercase tracking-wider text-sky-600/70 dark:text-sky-400/70">/ BLOCK</span>



                    </div>



                  </div>







                  <div className="px-1">



                    <input 



                      type="range" 



                      min="50" 



                      max="2000" 



                      step="50" 



                      value={batchSize}



                      onChange={(e) => setBatchSize(Number(e.target.value))}



                      className="w-full h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-full appearance-none cursor-pointer accent-sky-500 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/30"



                    />



                    <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 mt-2 px-0.5">



                      <span>50</span>



                      <span>2000</span>



                    </div>



                  </div>



                </div>



              )}



            </div>



          </div>















          <AnimatePresence mode="wait" initial={false}>



            {!isAssetTransfer ? (



              <motion.div



                key={`step1-${isCancellation ? "cancellation" : isCaseAssign ? "caseassign" : "standard"}`}



                variants={step1CardVariants}



                initial="hidden"



                animate="visible"



                exit="exit"



                className="flex flex-col flex-1 min-h-0 rounded-2xl border border-slate-200/80 dark:border-white/[0.12] bg-white/50 dark:bg-[#0b0c10]/45 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.7)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.12)] overflow-hidden relative group transition-all duration-300"



              >



              {/* Top Specular Rim */}



              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/25 to-transparent pointer-events-none" />







              {/* Massive Watermark Step 1 - identical to Step 2, 3, 4 */}



              <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">



                  STEP 1



                </span>



              </div>



              <div className="p-4 sm:p-5 pb-2 relative z-10 flex items-center justify-between gap-3 mt-6 md:mt-7">



                <div className="flex items-center gap-2.5">



                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8] mr-0.5 inline-block shrink-0" />



                  <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">



                    {isCaseAssign



                      ? "Upload or Paste Case IDs"



                      : isCancellation

                        ? (cancellationType === "NAMO"
                            ? "Paste Auto PMS Tickets for NAMO"
                            : cancellationType === "NON NAMO"
                            ? "Paste Auto PMS Tickets for NON-NAMO"
                            : cancellationType === "Account Check"
                            ? "Paste Tickets (PMS & NON-PMS) for Account Check"
                            : "Paste Tickets for CCO Cancellation")



                        : activeTemplate?.category === "Asset"



                          ? "Paste Component IDs"



                          : "Paste Ticket Numbers"}



                  </h3>



                </div>



              </div>







              <div className="p-4 sm:p-5 pt-2 space-y-4 flex-1 flex flex-col min-h-0 relative z-10">



                {isCaseAssign && (



                  <div className="flex flex-col space-y-4 flex-1 min-h-0 h-full">



                    <div 



                      tabIndex={0}



                      onDragOver={handleDragOver}



                      onDragEnter={handleDragEnter}



                      onDragLeave={handleDragLeave}



                      onDrop={handleFileUpload}



                      onPaste={(e) => {



                        const text = e.clipboardData.getData("text");



                        if (text && text.trim()) {



                          const extractedCaseIds = parseCaseIds(text);



                          const extractedTickets = isCancellation ? parseTickets(text) : [];



                          const ids = Array.from(new Set([...extractedCaseIds, ...extractedTickets]));



                          if (ids.length > 0) {



                            setTicketsInput(ids.join("\n"));



                            toast.success(`Pasted ${ids.length} ticket${ids.length === 1 ? "" : "s"} successfully!`);



                            setUploadState("success");



                            setUploadSummary({



                              file: "Clipboard Paste",



                              scannedLines: text.split(/\r\n|\n|\r/).length,



                              total: ids.length,



                              unique: ids.length,



                              valid: ids.length,



                              missing: 0,



                            });



                          }



                        }



                      }}



                      className={cn(



                        "relative flex flex-col flex-1 items-center justify-center rounded-2xl p-8 md:p-12 min-h-[280px] text-center transition-all duration-200 overflow-hidden w-full mx-auto group bg-transparent focus:outline-none",



                        uploadState === "reading" || uploadState === "scanning" || uploadState === "validating"



                          ? "bg-blue-50/50 dark:bg-blue-900/10"



                          : isDragging



                            ? "bg-[#0176d3]/10 scale-[1.02] shadow-sm"



                            : "hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"



                      )}



                    >



                      {/* Animated SVG Border */}



                      <svg className={cn(



                        "absolute inset-[1px] h-[calc(100%-2px)] w-[calc(100%-2px)] pointer-events-none rounded-2xl transition-all duration-300 z-10",



                        uploadState === "reading" || uploadState === "scanning" || uploadState === "validating"



                          ? "text-blue-400/80 animate-[dash_1s_linear_infinite]"



                          : isDragging



                            ? "text-sky-500 dark:text-sky-400 animate-[dash_0.5s_linear_infinite]"



                            : "text-slate-300/80 dark:text-slate-700 group-hover:text-sky-400 group-focus-within:text-sky-400"



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



                          rx="15"



                          ry="15"



                          stroke={isDragging ? "url(#shimmerGradient)" : "currentColor"}



                          strokeWidth="2.5"



                          strokeDasharray="10 10"



                          className="transition-all duration-300 group-hover:animate-[dash_1.2s_linear_infinite] group-focus-within:animate-[dash_1.2s_linear_infinite] group-hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.85)] group-focus-within:drop-shadow-[0_0_10px_rgba(56,189,248,0.85)]"



                        />



                      </svg>



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



                            "flex h-14 w-14 items-center justify-center rounded-full mb-4 shadow-sm z-10 transition-transform duration-200 group-hover:scale-105 pointer-events-none",



                            isDragging 



                              ? "bg-primary/10 ring-2 ring-primary/30" 



                              : "bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]"



                          )}>



                            <Upload className={cn("h-6 w-6 transition-colors", isDragging ? "text-primary" : "text-slate-500 dark:text-slate-300")} />



                          </div>



                          <p className={cn("text-base font-black z-10 transition-colors pointer-events-none text-slate-900 dark:text-white tracking-tight", isDragging && "text-primary")}>



                            {isDragging ? "Drop your file here!" : (isCancellation ? "Drag & Drop your Case ID or Ticket report here" : "Drag & Drop your Case ID report here")}



                          </p>



                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 mb-6 z-10 pointer-events-none">Supports CSV, XLSX, XLS, TXT</p>



                          <div className="z-10">



                            <input type="file" id="case-upload" className="sr-only" onChange={handleFileUpload} accept=".csv,.txt,.xlsx,.xls,.tsv" />



                            <label htmlFor="case-upload" className="cursor-pointer inline-flex items-center justify-center rounded-full bg-slate-900 text-white dark:bg-black/60 dark:text-white px-6 py-2.5 text-xs font-bold border border-slate-800 dark:border-white/[0.12] shadow-sm hover:bg-slate-800 dark:hover:bg-white/[0.1] hover:border-sky-500/40 transition-all duration-200">



                              Browse File



                            </label>



                          </div>



                        </>



                      )}



                    </div>







                    {uploadSummary && uploadState === "success" && (



                      <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10 p-4">



                        <div className="flex items-center justify-between gap-2 mb-3 border-b border-emerald-100 dark:border-emerald-800/30 pb-2">



                          <div className="flex items-center gap-2">



                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />



                            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Upload Complete</h4>



                          </div>



                          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => { setUploadState("idle"); setUploadSummary(null); setTicketsInput(""); }}>



                            <RotateCcw className="h-3 w-3 mr-1" /> Re-upload



                          </Button>



                        </div>



                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">



                          <div className="flex justify-between"><span className="text-muted-foreground font-medium">File</span><span className="font-bold truncate max-w-[120px]" title={uploadSummary.file}>{uploadSummary.file}</span></div>



                          <div className="flex justify-between"><span className="text-muted-foreground font-medium">Records Scanned</span><span className="font-bold">{uploadSummary.scannedLines.toLocaleString()}</span></div>



                          <div className="flex justify-between"><span className="text-muted-foreground font-medium">Case IDs / Tickets</span><span className="font-bold">{uploadSummary.total.toLocaleString()}</span></div>



                          <div className="flex justify-between"><span className="text-muted-foreground font-medium">Unique IDs</span><span className="font-bold">{uploadSummary.unique.toLocaleString()}</span></div>



                          <div className="flex justify-between"><span className="text-emerald-600 dark:text-emerald-400 font-bold">Valid</span><span className="font-bold text-emerald-600 dark:text-emerald-400">{uploadSummary.valid.toLocaleString()}</span></div>



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



                            <div className="max-h-24 overflow-y-auto rounded bg-white/60 dark:bg-black/40 p-2 text-[10px] font-mono text-muted-foreground">



                              {missingCases.slice(0, 50).join("\n")}



                              {missingCases.length > 50 && `\n...and ${missingCases.length - 50} more`}



                            </div>



                          </div>



                        )}



                        {isCancellation && (



                          <div className="mt-3 pt-2 border-t border-emerald-100/60 dark:border-emerald-800/20 flex justify-end">



                            <button



                              type="button"



                              onClick={() => changeCancellationInputMode("manual")}



                              className="text-xs text-sky-500 hover:text-sky-400 font-bold underline underline-offset-2 cursor-pointer flex items-center gap-1"



                            >



                              <Pencil className="w-3 h-3" />



                              Edit extracted tickets in Type/Paste view



                            </button>



                          </div>



                        )}



                      </div>



                    )}



                  </div>



                )}



                



                                {!isCaseAssign && (
                  <>
                    <div className="flex-1 flex flex-col space-y-2">
                      <div 



                        onDragOver={handleDragOver}



                        onDragEnter={handleDragEnter}



                        onDragLeave={handleDragLeave}



                        onDrop={handleFileUpload}



                        className="relative flex-1 flex flex-col group rounded-2xl overflow-hidden bg-transparent min-h-[320px]"



                      >



                      {/* Animated Moving SVG Dashed Border */}



                      <svg



                        className="absolute inset-[1px] h-[calc(100%-2px)] w-[calc(100%-2px)] pointer-events-none rounded-2xl transition-all duration-300 z-10 text-slate-300 dark:text-slate-600/90 group-hover:text-sky-400 group-focus-within:text-sky-400"



                        xmlns="http://www.w3.org/2000/svg"



                      >



                        <rect



                          width="100%"



                          height="100%"



                          fill="none"



                          rx="15"



                          ry="15"



                          stroke="currentColor"



                          strokeWidth="2.5"



                          strokeDasharray="10 10"



                          className="transition-all duration-300 group-hover:animate-[dash_1.2s_linear_infinite] group-focus-within:animate-[dash_1.2s_linear_infinite] group-hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.85)] group-focus-within:drop-shadow-[0_0_10px_rgba(56,189,248,0.85)]"



                        />



                      </svg>



                      {/* Animated Single-Line Typewriter Instruction Placeholder */}
                      {!ticketsInput && (
                        <div className="absolute top-4 left-4 right-4 pointer-events-none z-10 font-mono text-xs leading-relaxed select-none flex items-center">
                          <span className="font-light text-slate-400/80 dark:text-slate-400/70 tracking-normal transition-opacity duration-300">
                            {step1TargetPlaceholder.substring(0, placeholderSubIndex)}
                          </span>
                          <span
                            className={cn(
                              "inline-block w-[1.5px] h-3.5 bg-sky-400 dark:bg-sky-400 rounded-full ml-0.5 transition-opacity duration-300 ease-in-out",
                              placeholderBlink ? "opacity-100 shadow-[0_0_6px_rgba(56,189,248,0.7)]" : "opacity-0"
                            )}
                          />
                        </div>
                      )}

                      <Textarea
                        placeholder="" 



                        className="flex-1 font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y relative z-20 text-foreground caret-sky-400"



                        value={ticketsInput}



                        onChange={(event) => {



                          const value = event.target.value;



                          setTicketsInput(value);



                          setGeneratedAtLeastOnce(false);



                        }}



                      />



                    </div>



                      <p className="border-l-2 border-primary/50 py-1 pl-3 text-xs font-medium leading-relaxed text-muted-foreground">



                        {isCancellation ? (cancellationType === "NAMO" ? "Paste Auto PMS ('A' prefix) ticket numbers for NAMO Cancellation. Account Group Type (NAMO vs NON-NAMO) and Account Name will be classified in Step 3. Supports spaces, commas, tabs, or newlines." : cancellationType === "NON NAMO" ? "Paste Auto PMS ('A' prefix) ticket numbers for NON-NAMO Cancellation. Account Group Type (NON-NAMO vs NAMO) and Account Name will be classified in Step 3. Supports spaces, commas, tabs, or newlines." : cancellationType === "Account Check" ? "Put all tickets that can be PMS and NON PMS. Account Group Type and Account Name details will be verified for all ticket types. Supports spaces, commas, tabs, or newlines." : "Paste NON-PMS ticket numbers for CCO Cancellation. Auto PMS ('A' prefix) tickets are automatically skipped from CCO cancellation if present, but remain safely preserved in master records for approvals, Email Template, and Post outputs. Supports spaces, commas, tabs, or newlines.") : "Supports spaces, commas, tabs, or newlines. Drag & drop files directly here anytime."}



                      </p>



                    </div>

                    {/* ALGO 1: Step 1 Ticket Classification, CCO Filtering & Approval Validation */}
                    {isCancellation && cancellationType === "CCO" && parsedTickets.length > 0 && (
                      <div className="rounded-2xl border border-slate-200/90 dark:border-white/[0.1] bg-slate-50/80 dark:bg-black/30 p-4 space-y-3.5 shadow-sm">
                        {/* Header & Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-sky-500" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                              ALGO 1: Ticket Classification & CCO Filtering
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Master: {algo1Result.allTickets.length} tickets
                          </span>
                        </div>

                        {/* Classification Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {algo1Result.typeCounts.Breakdown > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              B: {algo1Result.typeCounts.Breakdown} Breakdown
                            </span>
                          )}
                          {algo1Result.typeCounts.Service > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                              S: {algo1Result.typeCounts.Service} Service
                            </span>
                          )}
                          {algo1Result.typeCounts.Commissioning > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              C: {algo1Result.typeCounts.Commissioning} Commissioning
                            </span>
                          )}
                          {algo1Result.typeCounts.Demo > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              D: {algo1Result.typeCounts.Demo} Demo
                            </span>
                          )}
                          {algo1Result.typeCounts["Stock Defective"] > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                              X: {algo1Result.typeCounts["Stock Defective"]} Stock Defective
                            </span>
                          )}
                          {algo1Result.typeCounts.Installation > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                              I: {algo1Result.typeCounts.Installation} Installation
                            </span>
                          )}
                          {algo1Result.typeCounts["Auto PMS"] > 0 && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              A: {algo1Result.typeCounts["Auto PMS"]} Auto PMS (Excluded from CCO)
                            </span>
                          )}
                          {algo1Result.typeCounts.Other > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                              Other: {algo1Result.typeCounts.Other}
                            </span>
                          )}
                        </div>

                        {/* CCO Status Summary */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] text-xs">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Eligible for CCO Cancellation: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{algo1Result.ccoCancellationTickets.length}</strong> tickets
                            </span>
                          </div>
                          {algo1Result.autoPmsTickets.length > 0 ? (
                            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span>{algo1Result.autoPmsTickets.length} Auto PMS ticket{algo1Result.autoPmsTickets.length === 1 ? '' : 's'} skipped from CCO</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>All tickets eligible for CCO cancellation</span>
                            </div>
                          )}
                        </div>

                        {/* Notice when ALL pasted tickets are Auto PMS */}
                        {algo1Result.ccoCancellationTickets.length === 0 && algo1Result.autoPmsTickets.length > 0 && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                            <div className="space-y-1">
                              <span className="font-bold text-[12px]">All pasted tickets are Auto PMS (&apos;A&apos; prefix)</span>
                              <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                                None of these {algo1Result.autoPmsTickets.length} ticket(s) are eligible for CCO cancellation. They have all been automatically skipped from CCO processing and routed for department approval below. All tickets remain preserved in master records.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Auto PMS Approval Segment */}
                        {algo1Result.autoPmsTickets.length > 0 && (
                          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 p-3 space-y-2.5 text-xs">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-extrabold text-xs">
                                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                                <span>Auto PMS Approval Required</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                className="h-6 px-2 text-[10px] font-bold border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-md gap-1"
                                onClick={() => {
                                  navigator.clipboard.writeText(algo1Result.approvalSegmentText);
                                  toast.success("Copied Auto PMS approval notice to clipboard!");
                                }}
                              >
                                <Copy className="h-3 w-3" /> Copy Notice
                              </Button>
                            </div>

                            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                              Note: The following Auto PMS ticket(s) cannot be processed for cancellation through CCO. They are preserved in the master collection (<strong className="font-mono text-slate-800 dark:text-slate-200">ALL_TICKETS</strong>) for Email and Post outputs:
                            </p>

                            <div className="flex flex-wrap gap-1 font-mono text-[10px] text-amber-700 dark:text-amber-300 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                              {algo1Result.autoPmsTickets.map((t) => (
                                <span key={t} className="px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/30 font-bold">
                                  {t}
                                </span>
                              ))}
                            </div>

                            {/* Department Approvals Mapping */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {algo1Result.ucpgTickets.length > 0 && (
                                <div className="p-2 rounded-lg bg-white/70 dark:bg-white/[0.04] border border-amber-500/20 space-y-1">
                                  <div className="flex items-center justify-between gap-1 text-[11px] font-black text-slate-800 dark:text-slate-200">
                                    <span>UCPG – Suraj Sir</span>
                                    <span className="text-[9px] text-slate-400 font-medium">(Dept 52, 43, 58, Blank)</span>
                                  </div>
                                  <div className="space-y-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                                    {algo1Result.ucpgTickets.map((item) => (
                                      <div key={`ucpg-${item.ticket}`} className="flex items-center justify-between">
                                        <span>• {item.ticket}</span>
                                        <span className="text-[9px] text-slate-400">
                                          {item.isBlankDept ? "Dept unavailable" : `Dept ${item.deptCode}`}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {algo1Result.cpsdTickets.length > 0 && (
                                <div className="p-2 rounded-lg bg-white/70 dark:bg-white/[0.04] border border-amber-500/20 space-y-1">
                                  <div className="flex items-center justify-between gap-1 text-[11px] font-black text-slate-800 dark:text-slate-200">
                                    <span>CPSD – Vishal Sir</span>
                                    <span className="text-[9px] text-slate-400 font-medium">(Other Depts, Blank)</span>
                                  </div>
                                  <div className="space-y-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                                    {algo1Result.cpsdTickets.map((item) => (
                                      <div key={`cpsd-${item.ticket}`} className="flex items-center justify-between">
                                        <span>• {item.ticket}</span>
                                        <span className="text-[9px] text-slate-400">
                                          {item.isBlankDept ? "Dept unavailable" : `Dept ${item.deptCode}`}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <p className="text-[10px] text-slate-500 italic">
                              * All {algo1Result.allTickets.length} original tickets remain preserved in master data for Email Template Output and Post Output.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200/80 dark:border-white/[0.08]">



                      <span className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">



                        {parsedTickets.length === 0 ? "No tickets" : `${parsedTickets.length} ticket${parsedTickets.length === 1 ? "" : "s"}`}



                      </span>



                      {ticketDuplicates.length > 0 && (



                        <span className="font-black uppercase tracking-widest text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20" title={`${ticketDuplicates.length} duplicate tickets in input`}>



                          {cancellationUniqueRequestedTickets.length} unique ({ticketDuplicates.length} dupe{ticketDuplicates.length === 1 ? "" : "s"})



                        </span>



                      )}



                      <span className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">



                        {inputBatchCount === 0 ? "0 batches" : `${inputBatchCount} batch${inputBatchCount === 1 ? "" : "es"}`}



                      </span>



                      <span className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">



                        Max {inputBatchSize} / block



                      </span>



                      <div className="flex-1" />



                      <Button variant="outline" size="sm" className="gap-2 h-10 px-4 rounded-xl text-xs hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all font-bold border-slate-900/[0.08] dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] cursor-pointer" onClick={handleClear}>



                        <Trash2 className="h-4 w-4" /> Clear



                      </Button>



                      <Button onClick={triggerGenerate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 h-10 px-5 rounded-xl text-xs shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 cursor-pointer">



                        <PlayCircle className="h-4 w-4 fill-primary-foreground/20" /> Generate



                      </Button>



                    </div>



                  </>



                )}



              </div>



            </motion.div>



          ) : (



              <motion.div



                key="step1-asset-transfer"



                variants={step1CardVariants}



                initial="hidden"



                animate="visible"



                exit="exit"



                className="flex flex-col flex-1 min-h-0 rounded-2xl border border-slate-200/80 dark:border-white/[0.12] bg-white/50 dark:bg-[#0b0c10]/45 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.7)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.12)] overflow-hidden relative group transition-all duration-300"



              >



                {/* Top Specular Rim */}



                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/25 to-transparent pointer-events-none" />







                {/* Massive Watermark Step 1 - identical to Step 2, 3, 4 */}



                <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                  <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">



                    STEP 1



                  </span>



                </div>



                <div className="p-4 sm:p-5 pb-2 relative z-10 flex flex-wrap items-center justify-between gap-2 mt-6 md:mt-7">



                  <div className="flex items-center gap-2.5 min-w-0">



                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8] mr-0.5 inline-block shrink-0" />



                    <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">



                      {assetTransferInputMode === "manual" ? "Asset Transfer Data" : "Upload Asset Transfer File"}



                    </h3>



                  </div>







                  <div className="flex items-center p-0.5 rounded-xl bg-slate-200/60 dark:bg-black/50 border border-slate-300/60 dark:border-white/[0.08] backdrop-blur-md relative shrink-0">



                    <button



                      type="button"



                      onClick={() => changeAssetTransferInputMode("manual")}



                      className={cn(



                        "relative z-10 flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0",



                        assetTransferInputMode === "manual"



                          ? "text-slate-900 dark:text-white"



                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"



                      )}



                    >



                      {assetTransferInputMode === "manual" && (



                        <motion.div



                          layoutId="assetTransferModeIndicator"



                          className="absolute inset-0 bg-white dark:bg-white/15 rounded-lg shadow-sm -z-10"



                          transition={{ type: "spring", stiffness: 450, damping: 32 }}



                        />



                      )}



                      <Pencil className="w-3.5 h-3.5 text-sky-400" />



                      <span>Type / Paste</span>



                    </button>



                    <button



                      type="button"



                      onClick={() => changeAssetTransferInputMode("upload")}



                      className={cn(



                        "relative z-10 flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0",



                        assetTransferInputMode === "upload"



                          ? "text-slate-900 dark:text-white"



                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"



                      )}



                    >



                      {assetTransferInputMode === "upload" && (



                        <motion.div



                          layoutId="assetTransferModeIndicator"



                          className="absolute inset-0 bg-white dark:bg-white/15 rounded-lg shadow-sm -z-10"



                          transition={{ type: "spring", stiffness: 450, damping: 32 }}



                        />



                      )}



                      <Upload className="w-3.5 h-3.5 text-sky-400" />



                      <span>Upload File</span>



                    </button>



                  </div>



                </div>







              <div className="p-4 sm:p-5 pt-2 space-y-4 flex-1 flex flex-col min-h-0 relative z-10">



                <AnimatePresence mode="wait" initial={false}>



                  {assetTransferInputMode === "upload" ? (



                    <motion.div



                      key="asset-transfer-upload"



                      initial={{ opacity: 0, y: 8 }}



                      animate={{ opacity: 1, y: 0 }}



                      exit={{ opacity: 0, y: -8 }}



                      transition={{ duration: 0.18 }}



                      className="flex flex-col space-y-4 flex-1 min-h-0 h-full"



                    >



                    <div 



                      tabIndex={0}



                      onDragOver={handleDragOver}



                      onDragEnter={handleDragEnter}



                      onDragLeave={handleDragLeave}



                      onDrop={handleFileUpload}



                      onPaste={(e) => {



                        const text = e.clipboardData.getData("text");



                        if (text && text.trim()) {



                          const pairs = parseAssetTransferPairs(text);



                          if (pairs.length > 0) {



                            setAssetTransferInput(pairs.map((p) => `${p.componentId}\t${p.newCid}`).join("\n"));



                            toast.success(`Pasted ${pairs.length} Component & CID pairs successfully!`);



                            setUploadState("success");



                            setUploadSummary({



                              file: "Clipboard Paste",



                              scannedLines: text.split(/\r\n|\n|\r/).length,



                              total: pairs.length,



                              unique: pairs.length,



                              valid: pairs.length,



                              missing: 0,



                            });



                          }



                        }



                      }}



                      className={cn(



                        "relative flex flex-col flex-1 items-center justify-center rounded-2xl p-8 md:p-12 min-h-[280px] text-center transition-all duration-200 overflow-hidden w-full mx-auto group bg-transparent focus:outline-none",



                        uploadState === "reading" || uploadState === "scanning"



                          ? "bg-blue-50/50 dark:bg-blue-900/10"



                          : isDragging



                            ? "bg-[#0176d3]/10 scale-[1.02] shadow-sm"



                            : "hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"



                      )}



                    >



                      {/* Animated SVG Border */}



                      <svg className={cn(



                        "absolute inset-[1px] h-[calc(100%-2px)] w-[calc(100%-2px)] pointer-events-none rounded-2xl transition-all duration-300 z-10",



                        uploadState === "reading" || uploadState === "scanning"



                          ? "text-blue-400/80 animate-[dash_1s_linear_infinite]"



                          : isDragging



                            ? "text-sky-500 dark:text-sky-400 animate-[dash_0.5s_linear_infinite]"



                            : "text-slate-300/80 dark:text-slate-700 group-hover:text-sky-400 group-focus-within:text-sky-400"



                      )} xmlns="http://www.w3.org/2000/svg">



                        <defs>



                          <linearGradient id="shimmerGradientAsset" x1="0%" y1="0%" x2="100%" y2="100%">



                            <stop offset="0%" stopColor="#0176d3" />



                            <stop offset="50%" stopColor="#8b5cf6" />



                            <stop offset="100%" stopColor="#0176d3" />



                          </linearGradient>



                        </defs>



                        <rect



                          width="100%"



                          height="100%"



                          fill="none"



                          rx="15"



                          ry="15"



                          stroke={isDragging ? "url(#shimmerGradientAsset)" : "currentColor"}



                          strokeWidth="2.5"



                          strokeDasharray="10 10"



                          className="transition-all duration-300 group-hover:animate-[dash_1.2s_linear_infinite] group-focus-within:animate-[dash_1.2s_linear_infinite] group-hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.85)] group-focus-within:drop-shadow-[0_0_10px_rgba(56,189,248,0.85)]"



                        />



                      </svg>



                      {isDragging && <div className="absolute inset-0 z-50 pointer-events-none" />}



                      



                      {uploadState === "reading" || uploadState === "scanning" ? (



                        <div className="flex flex-col items-center z-10 pointer-events-none">



                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 mb-3 animate-pulse">



                            <RotateCcw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />



                          </div>



                          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">



                            {uploadState === "reading" ? "Reading file..." : "Scanning Component & CID pairs..."}



                          </p>



                        </div>



                      ) : (



                        <>



                          <div className={cn(



                            "flex h-14 w-14 items-center justify-center rounded-full mb-4 shadow-sm z-10 transition-transform duration-200 group-hover:scale-105 pointer-events-none",



                            isDragging 



                              ? "bg-primary/10 ring-2 ring-primary/30" 



                              : "bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]"



                          )}>



                            <Upload className={cn("h-6 w-6 transition-colors", isDragging ? "text-primary" : "text-slate-500 dark:text-slate-300")} />



                          </div>



                          <p className={cn("text-base font-black z-10 transition-colors pointer-events-none text-slate-900 dark:text-white tracking-tight", isDragging && "text-primary")}>



                            {isDragging ? "Drop your file here!" : "Drag & Drop your Component & CID file here"}



                          </p>



                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 mb-6 z-10 pointer-events-none">Supports CSV, XLSX, XLS, TXT, TSV</p>



                          <div className="z-10">



                            <input type="file" id="asset-transfer-upload" className="sr-only" onChange={handleFileUpload} accept=".csv,.txt,.xlsx,.xls,.tsv" />



                            <label htmlFor="asset-transfer-upload" className="cursor-pointer inline-flex items-center justify-center rounded-full bg-slate-900 text-white dark:bg-black/60 dark:text-white px-6 py-2.5 text-xs font-bold border border-slate-800 dark:border-white/[0.12] shadow-sm hover:bg-slate-800 dark:hover:bg-white/[0.1] hover:border-sky-500/40 transition-all duration-200">



                              Browse File



                            </label>



                          </div>



                        </>



                      )}



                    </div>







                    {uploadSummary && uploadState === "success" && (



                      <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10 p-4">



                        <div className="flex items-center justify-between gap-2 mb-3 border-b border-emerald-100 dark:border-emerald-800/30 pb-2">



                          <div className="flex items-center gap-2">



                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />



                            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Upload Complete</h4>



                          </div>



                          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => { setUploadState("idle"); setUploadSummary(null); setAssetTransferInput(""); }}>



                            <RotateCcw className="h-3 w-3 mr-1" /> Re-upload



                          </Button>



                        </div>



                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">



                          <div className="flex justify-between"><span className="text-muted-foreground font-medium">File</span><span className="font-bold truncate max-w-[120px]" title={uploadSummary.file}>{uploadSummary.file}</span></div>



                          <div className="flex justify-between"><span className="text-muted-foreground font-medium">Records Scanned</span><span className="font-bold">{uploadSummary.scannedLines.toLocaleString()}</span></div>



                          <div className="flex justify-between"><span className="text-muted-foreground font-medium">Pairs Detected</span><span className="font-bold">{uploadSummary.total.toLocaleString()}</span></div>



                          <div className="flex justify-between"><span className="text-emerald-600 dark:text-emerald-400 font-bold">Valid Pairs</span><span className="font-bold text-emerald-600 dark:text-emerald-400">{uploadSummary.valid.toLocaleString()}</span></div>



                        </div>



                        <div className="mt-3 pt-2 border-t border-emerald-100/60 dark:border-emerald-800/20 flex justify-end">



                          <button



                            type="button"



                            onClick={() => changeAssetTransferInputMode("manual")}



                            className="text-xs text-sky-500 hover:text-sky-400 font-bold underline underline-offset-2 cursor-pointer flex items-center gap-1"



                          >



                            <Pencil className="w-3 h-3" />



                            Edit extracted pairs in Type/Paste view



                          </button>



                        </div>



                      </div>



                    )}



                  </motion.div>



                ) : (



                  <motion.div



                    key="asset-transfer-manual"



                    initial={{ opacity: 0, y: 8 }}



                    animate={{ opacity: 1, y: 0 }}



                    exit={{ opacity: 0, y: -8 }}



                    transition={{ duration: 0.18 }}



                    className="flex-1 flex flex-col space-y-2 min-h-0"



                  >



                    <label className="text-xs font-black text-slate-500 block uppercase tracking-widest pl-1">Component & New CID Pairs</label>



                    <div 



                      onDragOver={handleDragOver}



                      onDragEnter={handleDragEnter}



                      onDragLeave={handleDragLeave}



                      onDrop={handleFileUpload}



                      className="relative flex-1 flex flex-col group min-h-[220px] rounded-2xl overflow-hidden bg-transparent"



                    >



                      {/* Animated Moving SVG Dashed Border */}



                      <svg



                        className="absolute inset-[1px] h-[calc(100%-2px)] w-[calc(100%-2px)] pointer-events-none rounded-2xl transition-all duration-300 z-10 text-slate-300 dark:text-slate-600/90 group-hover:text-sky-400 group-focus-within:text-sky-400"



                        xmlns="http://www.w3.org/2000/svg"



                      >



                        <rect



                          width="100%"



                          height="100%"



                          fill="none"



                          rx="15"



                          ry="15"



                          stroke="currentColor"



                          strokeWidth="2.5"



                          strokeDasharray="10 10"



                          className="transition-all duration-300 group-hover:animate-[dash_1.2s_linear_infinite] group-focus-within:animate-[dash_1.2s_linear_infinite] group-hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.85)] group-focus-within:drop-shadow-[0_0_10px_rgba(56,189,248,0.85)]"



                        />



                      </svg>



                      <Textarea



                        placeholder={`COMPONENT        NEW CID



BSL34933847      CID-2025004



BSL29709797      CID-4206214



BSL22295338      CID-6074821`}



                        className="flex-1 min-h-[220px] font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y relative z-20 text-foreground"



                        value={assetTransferInput}



                        onChange={(event) => {



                          const value = event.target.value;



                          setAssetTransferInput(value);



                        }}



                      />



                    </div>



                    <p className="border-l-2 border-blue-400/40 py-1 pl-3 text-xs font-medium leading-relaxed text-muted-foreground flex items-center justify-between">



                      <span>Paste component ID and new CID pairs. Tab or space separated. You can also drag & drop files directly here.</span>



                      <button



                        type="button"



                        onClick={() => changeAssetTransferInputMode("upload")}



                        className="text-sky-500 hover:text-sky-400 font-bold ml-2 underline underline-offset-2 shrink-0 cursor-pointer"



                      >



                        Switch to Upload



                      </button>



                    </p>



                  </motion.div>



                )}



              </AnimatePresence>







                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200/80 dark:border-white/[0.08]">



                  <span className="font-black uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400">



                    {assetPairs.length} pair{assetPairs.length === 1 ? "" : "s"}



                  </span>



                  <div className="flex-1" />



                  <Button variant="outline" size="sm" className="gap-2 h-10 px-4 rounded-xl text-xs hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all font-bold border-slate-900/[0.08] dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] cursor-pointer" onClick={handleClear}>



                    <Trash2 className="h-4 w-4" /> Clear



                  </Button>



                  <Button onClick={triggerGenerate} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold gap-2 h-10 px-5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 cursor-pointer">



                    <PlayCircle className="h-4 w-4 fill-white/20" /> Generate Queries



                  </Button>



                </div>



              </div>



            </motion.div>



          )}



        </AnimatePresence>



        </motion.div>







        <div className="2xl:col-span-8 xl:col-span-8 min-w-0 flex flex-col h-full min-h-0 relative">



          <AnimatePresence mode="wait" initial={false}>



            {isTS && (



              <motion.div



                key="right-col-ts"



                variants={cardContainerVariants}



                initial="hidden"



                animate="visible"



                exit="exit"



                className="grid grid-cols-1 2xl:grid-cols-2 gap-6 h-full 2xl:relative 2xl:grid-rows-2 w-full"



              >



                <motion.div variants={cardItemVariants} className="h-[350px] 2xl:h-full min-h-[320px]">



                  <QueryPreviewCard



                    step="STEP 2"



                    title="TS (Ticket Status)"



                    subtitle="WorkOrder query preview"



                    batches={workOrderPreview}



                    batchIndex={tsBatchIndex}



                    setBatchIndex={setTsBatchIndex}



                    className="h-full"



                    onCopy={handleCopy}



                  />



                </motion.div>



                <motion.div variants={cardItemVariants} className="h-[350px] 2xl:h-full min-h-[320px]">



                  <PasteResultCard



                    step="PASTE"



                    title="Paste Ticket result"



                    subtitle="Transform Status to Accepted"



                    value={tsResultPaste}



                    onChange={setTsResultPaste}



                    transformedValue={transformStatus(tsResultPaste, "Accepted", "WorkOrder")}



                    className="h-full"



                    onCopy={handleCopy}



                  />



                </motion.div>



                <motion.div variants={cardItemVariants} className="h-[350px] 2xl:h-full min-h-[320px]">



                  <QueryPreviewCard



                    step="STEP 3"



                    title="SA (Service Appointment)"



                    subtitle="ServiceAppointment query preview"



                    batches={serviceAppointmentPreview}



                    batchIndex={saBatchIndex}



                    setBatchIndex={setSaBatchIndex}



                    className="h-full"



                    onCopy={handleCopy}



                  />



                </motion.div>



                <motion.div variants={cardItemVariants} className="h-[350px] 2xl:h-full min-h-[320px]">



                  <PasteResultCard



                    step="PASTE"



                    title="Paste Service Appointment result"



                    subtitle="Transform Status to None"



                    value={saResultPaste}



                    onChange={setSaResultPaste}



                    transformedValue={transformStatus(saResultPaste, "None", "ServiceAppointment")}



                    className="h-full"



                    onCopy={handleCopy}



                  />



                </motion.div>



              </motion.div>



            )}







            {isChildDetailsToParent && (



              <motion.div



                key="right-col-child-details"



                variants={cardContainerVariants}



                initial="hidden"



                animate="visible"



                exit="exit"



                className="grid grid-cols-1 2xl:grid-cols-2 gap-6 h-full 2xl:relative 2xl:grid-rows-2 w-full"



              >



                <motion.div variants={cardItemVariants} className="h-[350px] 2xl:h-full min-h-[320px]">



                  <QueryPreviewCard



                    step="STEP 2"



                    title={activeTemplate?.name ?? "Query Preview"}



                    subtitle={`${activeTemplate?.category ?? ""} query preview`}



                    batches={otherPreview}



                    batchIndex={otherBatchIndex}



                    setBatchIndex={setOtherBatchIndex}



                    className="h-full"



                    onCopy={handleCopy}



                  />



                </motion.div>



                



                <motion.div variants={cardItemVariants} className="h-[350px] 2xl:h-full min-h-[320px]">



                  <Card className="flex flex-col flex-1 h-full rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group transition-all duration-300">



                    <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                      <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">



                        STEP 3



                      </span>



                    </div>



                    <CardHeader className="pb-4 bg-transparent p-6 relative z-10 flex flex-row flex-wrap items-start justify-between gap-3">



                      <div className="flex-1 min-w-0">



                        <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Paste Salesforce Result</CardTitle>



                      </div>



                      <div className="flex flex-wrap items-center gap-3 mt-5 md:mt-6 shrink-0">



                        <Button



                          variant="outline"



                          size="sm"



                          className="h-8 px-3 gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md whitespace-nowrap shrink-0"



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



                </motion.div>







                <motion.div variants={cardItemVariants} className="h-[350px] 2xl:h-full min-h-[320px]">



                  <Card className="flex flex-col flex-1 h-full rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group transition-all duration-300">



                    <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                      <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">



                        STEP 4



                      </span>



                    </div>



                    <CardHeader className="pb-4 bg-transparent p-6 relative z-10 flex flex-row flex-wrap items-start justify-between gap-3">



                      <div className="flex-1 min-w-0">



                        <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">CHILD TO ASSET</CardTitle>



                      </div>



                      <div className="flex flex-wrap items-center gap-3 mt-5 md:mt-6 shrink-0">



                        {customChildDetailsProcessor.output && (



                          <Button



                            variant="outline"



                            size="sm"



                            className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm whitespace-nowrap shrink-0"



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



                </motion.div>



              



                <motion.div variants={cardItemVariants} className="h-[350px] 2xl:h-full min-h-[320px]">



                  <Card className="flex flex-col flex-1 h-full rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group transition-all duration-300">



                    <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                      <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">



                        DEBUG



                      </span>



                    </div>



                    <CardHeader className="pb-4 bg-transparent p-6 relative z-10">



                      <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground flex-1 flex flex-wrap items-center justify-between gap-2">



                        <span>Processing Status</span>



                        <div className="flex flex-wrap gap-2 text-xs shrink-0">



                          <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-md whitespace-nowrap">



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



                </motion.div>



              </motion.div>



            )}







            {isAssetTransfer && (



              <motion.div



                key="right-col-asset-transfer"



                variants={cardContainerVariants}



                initial="hidden"



                animate="visible"



                exit="exit"



                className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full"



              >



                <motion.div variants={cardItemVariants} className="h-full flex flex-col">



                  <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">



                    <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                      <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">



                        STEP 2



                      </span>



                    </div>



                      <CardHeader className="pb-3 bg-transparent p-6 relative z-10">
                        <div className="flex flex-wrap items-center justify-between gap-3 w-full mt-5 md:mt-6">
                          <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                            Asset SOQL Query
                          </CardTitle>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm shrink-0 whitespace-nowrap"
                            onClick={() => handleCopy(assetTransferComponentSOQL)}
                            disabled={!assetTransferComponentSOQL}
                          >
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                      </CardHeader>



                    <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">



                        <div className="flex flex-col overflow-hidden bg-transparent">



                        <SOQLHighlighter query={assetTransferComponentSOQL || "Paste component pairs to generate Asset SOQL"} className={`overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed max-h-[320px] min-h-[100px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 ${!assetTransferComponentSOQL ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-sky-200"}`} />



                      </div>



                    </CardContent>



                  </Card>



                </motion.div>







                {/* STEP 3 */}



                <motion.div variants={cardItemVariants} className="h-full flex flex-col">



                  <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">



                    <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                      <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">



                        STEP 3



                      </span>



                    </div>



                    <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">



                      <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-5 md:mt-6">



                        <div className="flex flex-col gap-1 w-full relative">



                          <CardTitle className="text-lg xl:text-xl font-black tracking-tight flex-1 leading-tight text-slate-800 dark:text-white">



                            Asset SOQL Result



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



"_"	"Component_Id__c"	"Id"	"Status"	"Asset_Obligation__c"	"Account.Customer_ID__c"	"Record_Type__c"	"Parent.Id"`}



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



                </motion.div>







                {/* STEP 4 */}



                <motion.div variants={cardItemVariants} className="h-full flex flex-col">



                  <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">



                    <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                      <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">



                        STEP 4



                      </span>



                    </div>



                      <CardHeader className="pb-3 bg-transparent p-6 relative z-10">



                        <div className="flex flex-wrap items-center justify-between gap-3 w-full mt-5 md:mt-6">



                            <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Account SOQL Query</CardTitle>



                              <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm shrink-0 whitespace-nowrap" onClick={() => handleCopy(assetTransferAccountSOQL)} disabled={!assetTransferAccountSOQL}>



                                <Copy className="h-3.5 w-3.5" /> Copy



                              </Button>



                      </div>



                    </CardHeader>



                    <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">



                        <div className="flex flex-col overflow-hidden bg-transparent">



                        <SOQLHighlighter query={assetTransferAccountSOQL || "Paste component pairs to generate Account SOQL"} className={`overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed max-h-[320px] min-h-[100px] selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 ${!assetTransferAccountSOQL ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-sky-200"}`} />



                      </div>



                    </CardContent>



                  </Card>



                </motion.div>







                {/* STEP 5 */}



                <motion.div variants={cardItemVariants} className="h-full flex flex-col">



                  <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">



                    <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                      <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">



                        STEP 5



                      </span>



                    </div>



                    <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">



                      <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-5 md:mt-6">



                        <div className="flex flex-col gap-1 w-full relative">



                          <div className="flex flex-wrap items-start justify-between gap-2 w-full">



                            <CardTitle className="text-lg xl:text-xl font-black tracking-tight leading-tight text-slate-800 dark:text-white">



                              Account SOQL Result



                            </CardTitle>



                            <Button className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold gap-2 h-8 px-4 rounded-lg text-[10px] shadow-md shadow-fuchsia-500/20 transition-all hover:-translate-y-0.5 shrink-0 whitespace-nowrap" onClick={handleProcessTransfer} disabled={!assetSOQLResult || !accountSOQLResult}>



                              <ArrowRightLeft className="h-3 w-3" /> Process



                            </Button>



                          </div>



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



                </motion.div>







                {/* STEP 6 */}



                {transferOutput && (



                  <motion.div variants={cardItemVariants} className="h-full flex flex-col">



                    <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">



                      <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                        <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">



                          RESULT



                        </span>



                      </div>



                      <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                        <div className="flex flex-col gap-3 w-full mt-5 md:mt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-tight text-slate-800 dark:text-white">
                                Transfer Result
                              </CardTitle>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                Processed Transfer Data
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-white/[0.08] w-full">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 px-2 gap-1.5 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-xs cursor-pointer justify-center"
                              onClick={() => {
                                handleCopy(transferOutput);
                                toast.success("Transfer CSV copied to clipboard!");
                              }}
                              title="Copy Processed Transfer CSV"
                            >
                              <Copy className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">Copy CSV</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 px-2 gap-1.5 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-xs text-blue-600 dark:text-blue-400 cursor-pointer justify-center"
                              onClick={handleCopyTransferEmail}
                              title="Copy Formatted Email (with table)"
                            >
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">Copy Mail</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 px-2 gap-1.5 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-xs text-emerald-600 dark:text-emerald-400 cursor-pointer justify-center"
                              onClick={handleCopyTransferPost}
                              title="Copy Chatter / Case Post"
                            >
                              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">Copy Post</span>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>



                      <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">



                        <div className="flex flex-col overflow-hidden bg-transparent">



                        <SOQLHighlighter query={transferOutput} className="overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 max-h-[320px] min-h-[100px] selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100" />



                        </div>



                      </CardContent>



                    </Card>



                  </motion.div>



                )}







                {/* STEP 7: Dispatch & Debug (Email, Post & Debug Switcher) */}



                {transferDebug && (



                  <motion.div variants={cardItemVariants} className="h-full flex flex-col">



                    <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">



                      <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                        <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent uppercase">



                          {transferModeTab === "email" ? "EMAIL" : transferModeTab === "post" ? "POST" : "DEBUG"}



                        </span>



                      </div>



                      <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">



                        <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-5 md:mt-6">



                          <div className="flex flex-col gap-2 w-full relative">



                            {/* Top row: Switcher + Copy Button */}



                            <div className="flex items-center justify-between gap-2 flex-wrap">



                              {/* Pill Switch for Email, Post, Debug */}



                              <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-black/60 border border-slate-300/80 dark:border-white/[0.1] shadow-inner">



                                <button



                                  type="button"



                                  onClick={() => setTransferModeTab("email")}



                                  className={cn(



                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",



                                    transferModeTab === "email"



                                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25"



                                      : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-white/60 dark:hover:bg-white/[0.06]"



                                  )}



                                >



                                  <Mail className="h-3.5 w-3.5" />



                                  <span>Email</span>



                                </button>



                                <button



                                  type="button"



                                  onClick={() => setTransferModeTab("post")}



                                  className={cn(



                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",



                                    transferModeTab === "post"



                                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/25"



                                      : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-white/60 dark:hover:bg-white/[0.06]"



                                  )}



                                >



                                  <MessageSquare className="h-3.5 w-3.5" />



                                  <span>Post</span>



                                </button>



                                <button



                                  type="button"



                                  onClick={() => setTransferModeTab("debug")}



                                  className={cn(



                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",



                                    transferModeTab === "debug"



                                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm shadow-amber-500/25"



                                      : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-white/60 dark:hover:bg-white/[0.06]"



                                  )}



                                >



                                  <Terminal className="h-3.5 w-3.5" />



                                  <span>Debug</span>



                                </button>



                              </div>







                              <Button



                                variant="outline"



                                size="sm"



                                className={cn(



                                  "h-8 gap-2 text-xs font-bold transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm cursor-pointer",



                                  transferModeTab === "email"



                                    ? "hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 text-blue-600 dark:text-blue-400"



                                    : transferModeTab === "post"



                                    ? "hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"



                                    : "hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 text-amber-600 dark:text-amber-400"



                                )}



                                onClick={handleCopyTransferTab}



                              >



                                <Copy className="h-3.5 w-3.5" />



                                <span>



                                  {transferModeTab === "email"



                                    ? "Copy Email"



                                    : transferModeTab === "post"



                                    ? "Copy Post"



                                    : "Copy Debug"}



                                </span>



                              </Button>



                            </div>







                            {/* Card Title & Subtitle */}



                            <div className="mt-1">



                              <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white">



                                {transferModeTab === "email" ? (



                                  <>Transfer<br />Email Dispatch</>



                                ) : transferModeTab === "post" ? (



                                  <>Transfer<br />Chatter & Case Post</>



                                ) : (



                                  <>Transfer<br />Debug Info</>



                                )}



                              </CardTitle>



                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">



                                {transferModeTab === "email"



                                  ? "Formatted Notification for Customer / Team"



                                  : transferModeTab === "post"



                                  ? "Salesforce Case / Chatter Feed Update"



                                  : "Processing Logs & ID Mappings"}



                              </p>



                            </div>



                          </div>



                        </div>



                      </CardHeader>







                      <CardContent className="p-4 md:p-5 pt-1 flex-1 flex flex-col min-h-0 relative z-10 gap-3">



                        {/* 1. EMAIL TAB */}



                        {transferModeTab === "email" && (



                          <div className="flex-1 flex flex-col min-h-0 gap-3">



                            {/* Subject Preview Bar */}



                            <div className="flex items-center justify-between gap-2 p-2 px-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-500/30 text-xs shadow-2xs">



                              <div className="flex items-center gap-2 min-w-0">



                                <span className="font-extrabold text-blue-600 dark:text-blue-400 text-[10px] uppercase tracking-wider shrink-0">



                                  Subject:



                                </span>



                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate select-all text-xs">



                                  Confirmation of Asset Transfer Completion



                                </span>



                              </div>



                              <div className="flex items-center gap-1.5 shrink-0">



                                <Button



                                  variant="ghost"



                                  size="sm"



                                  className="h-6 px-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 gap-1 rounded-md cursor-pointer"



                                  onClick={handleCopySubject}



                                  title="Copy Subject Line"



                                >



                                  <Copy className="h-3 w-3" /> Copy Subject



                                </Button>



                                <a



                                  href={`mailto:?subject=${encodeURIComponent("Confirmation of Asset Transfer Completion")}&body=${encodeURIComponent(transferEmailText)}`}



                                  className="h-6 px-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-md inline-flex items-center gap-1 transition-colors"



                                  title="Open in default email app"



                                >



                                  <ExternalLink className="h-3 w-3" /> Mail App



                                </a>



                              </div>



                            </div>







                            {/* Email Body */}



                            <div className="flex-1 min-h-[140px] flex flex-col relative">



                              <textarea



                                value={transferEmailText}



                                onChange={(e) => setCustomTransferEmail(e.target.value)}



                                className="w-full flex-1 min-h-[150px] p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-black/30 font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none select-text shadow-inner"



                                placeholder="Generated email will appear here..."



                              />



                            </div>







                            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-1 flex-wrap">



                              <div className="flex items-center gap-1.5">



                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Format:</span>



                                <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-200/80 dark:bg-black/50 border border-slate-300/80 dark:border-white/[0.1]">



                                  <button



                                    type="button"



                                    onClick={() => {



                                      setTransferListStyle("tabular");



                                      setCustomTransferEmail(null);



                                      setCustomTransferPost(null);



                                    }}



                                    className={cn(



                                      "px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer",



                                      transferListStyle === "tabular"



                                        ? "bg-blue-600 text-white shadow-xs"



                                        : "text-slate-600 dark:text-slate-400 hover:text-foreground"



                                    )}



                                  >



                                    ⊞ Tabular



                                  </button>



                                  <button



                                    type="button"



                                    onClick={() => {



                                      setTransferListStyle("numbered");



                                      setCustomTransferEmail(null);



                                      setCustomTransferPost(null);



                                    }}



                                    className={cn(



                                      "px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer",



                                      transferListStyle === "numbered"



                                        ? "bg-blue-600 text-white shadow-xs"



                                        : "text-slate-600 dark:text-slate-400 hover:text-foreground"



                                    )}



                                  >



                                    1. Numbered



                                  </button>



                                  <button



                                    type="button"



                                    onClick={() => {



                                      setTransferListStyle("bullets");



                                      setCustomTransferEmail(null);



                                      setCustomTransferPost(null);



                                    }}



                                    className={cn(



                                      "px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer",



                                      transferListStyle === "bullets"



                                        ? "bg-blue-600 text-white shadow-xs"



                                        : "text-slate-600 dark:text-slate-400 hover:text-foreground"



                                    )}



                                  >



                                    • Bullets



                                  </button>



                                </div>



                              </div>







                              <div className="flex items-center gap-2">



                                <span className="font-medium">



                                  {activeTransferPairs.length > 0 ? `${activeTransferPairs.length} Transferred` : ""}



                                  {activeTransferPairs.length > 0 && transferPendingExceptions.length > 0 ? ", " : ""}



                                  {transferPendingExceptions.length > 0 ? `${transferPendingExceptions.length} Pending (Draft/AMC)` : ""}



                                  {activeTransferPairs.length === 0 && transferPendingExceptions.length === 0 ? "0 Components" : ""}



                                </span>



                                {customTransferEmail !== null && (



                                  <button



                                    type="button"



                                    onClick={() => setCustomTransferEmail(null)}



                                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[10px] cursor-pointer"



                                  >



                                    Reset Default



                                  </button>



                                )}



                              </div>



                            </div>



                          </div>



                        )}







                        {/* 2. POST TAB */}



                        {transferModeTab === "post" && (



                          <div className="flex-1 flex flex-col min-h-0 gap-3">



                            <div className="flex items-center justify-between gap-2 p-2 px-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-500/30 text-xs shadow-2xs">



                              <div className="flex items-center gap-2 min-w-0">



                                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider shrink-0">



                                  Channel:



                                </span>



                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate select-all text-xs">



                                  Salesforce Chatter / Case Comments



                                </span>



                              </div>



                              <div className="inline-flex items-center p-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">



                                <button



                                  type="button"



                                  onClick={() => {



                                    setTransferListStyle("bullets");



                                    setCustomTransferEmail(null);



                                    setCustomTransferPost(null);



                                  }}



                                  className={cn(



                                    "px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer",



                                    transferListStyle === "bullets"



                                      ? "bg-emerald-600 text-white shadow-xs"



                                      : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"



                                  )}



                                >



                                  • Bullets



                                </button>



                                <button



                                  type="button"



                                  onClick={() => {



                                    setTransferListStyle("numbered");



                                    setCustomTransferEmail(null);



                                    setCustomTransferPost(null);



                                  }}



                                  className={cn(



                                    "px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer",



                                    transferListStyle === "numbered"



                                      ? "bg-emerald-600 text-white shadow-xs"



                                      : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"



                                  )}



                                >



                                  1. Numbered



                                </button>



                              </div>



                            </div>







                            {/* Post Body */}



                            <div className="flex-1 min-h-[140px] flex flex-col relative">



                              <textarea



                                value={transferPostText}



                                onChange={(e) => setCustomTransferPost(e.target.value)}



                                className="w-full flex-1 min-h-[150px] p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-black/30 font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none select-text shadow-inner"



                                placeholder="Generated post will appear here..."



                              />



                            </div>







                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">



                              <span className="font-medium">



                                {activeTransferPairs.length} Component{activeTransferPairs.length === 1 ? "" : "s"} in Feed Post



                              </span>



                              {customTransferPost !== null && (



                                <button



                                  type="button"



                                  onClick={() => setCustomTransferPost(null)}



                                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-[10px] cursor-pointer"



                                >



                                  Reset Default



                                </button>



                              )}



                            </div>



                          </div>



                        )}







                        {/* 3. DEBUG TAB */}



                        {transferModeTab === "debug" && (



                          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-transparent">



                            <SOQLHighlighter



                              query={transferDebug}



                              className="overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed text-slate-800 dark:text-amber-200 max-h-[320px] min-h-[100px] selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-100"



                            />



                          </div>



                        )}



                      </CardContent>



                    </Card>



                  </motion.div>



                )}



              </motion.div>



            )}







          {isCancellation && (



            <motion.div



              key="right-col-cancellation"



              variants={cardContainerVariants}



              initial="hidden"



              animate="visible"



              exit="exit"



              className="grid grid-cols-1 2xl:grid-cols-2 gap-6 w-full"



            >



              <motion.div variants={cardItemVariants} className="h-full flex flex-col">



                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] h-full flex flex-col transition-all duration-300 group relative">



                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                    <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">



                      STEP 2



                    </span>



                  </div>



                  <CardHeader className="pb-3 bg-transparent p-6 relative z-10">
                      <div className="flex items-center justify-between gap-3 mt-5 md:mt-6 flex-wrap w-full">
                        <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                          {cancellationType === "Account Check" ? "Account Check SOQL Batches" : "Cancellation SOQL Batches"}
                        </CardTitle>

                        <div className="flex items-center gap-2.5">
                          <span className="font-black uppercase tracking-widest whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">
                            {cancellationQueryBatches.length} BATCH{cancellationQueryBatches.length === 1 ? "" : "ES"}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 text-xs font-bold hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
                            onClick={() => {
                              const batchText = cancellationQueryBatches[cancellationExecutionBatchIndex];
                              if (batchText) {
                                handleCopy(batchText);
                              } else if (cancellationType === "CCO") {
                                handleCopy("SELECT Id, Ticket_Number_Read_Only__c, ParentWorkOrderId, ParentWorkOrder.Ticket_Number_Read_Only__c, Is_Approval_Sent__c, Is_MR_Created__c, Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n  // Paste NON-PMS tickets in Step 1 to populate batches\n)");
                              } else if (cancellationType === "NON NAMO") {
                                handleCopy("SELECT Id, Ticket_Number_Read_Only__c, ParentWorkOrderId, ParentWorkOrder.Ticket_Number_Read_Only__c, Is_Approval_Sent__c, Is_MR_Created__c, Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n  // Paste PMS ('A') tickets in Step 1 to populate batches\n)");
                              } else if (cancellationType === "Account Check") {
                                handleCopy("SELECT Id, Ticket_Number_Read_Only__c, ParentWorkOrderId, ParentWorkOrder.Ticket_Number_Read_Only__c, Is_Approval_Sent__c, Is_MR_Created__c, Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n  // Paste tickets in Step 1 to populate batches\n)");
                              } else if (cancellationType === "NAMO") {
                                handleCopy("SELECT Id, Ticket_Number_Read_Only__c, ParentWorkOrderId, ParentWorkOrder.Ticket_Number_Read_Only__c, Is_Approval_Sent__c, Is_MR_Created__c, Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n  // Paste PMS ('A') tickets in Step 1 to populate batches\n)");
                              }
                            }}
                            disabled={!cancellationQueryBatches.length && cancellationType !== "Account Check" && cancellationType !== "NON NAMO" && cancellationType !== "NAMO" && cancellationType !== "CCO"}
                          >
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                      </div>
                    </CardHeader>



                  <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">



                    <div className="flex flex-col overflow-hidden bg-transparent">



                    <SOQLHighlighter query={cancellationQueryBatches[cancellationExecutionBatchIndex] || (cancellationType === "NON NAMO" || cancellationType === "NAMO" ? "SELECT Id, Ticket_Number_Read_Only__c, ParentWorkOrderId, ParentWorkOrder.Ticket_Number_Read_Only__c, Is_Approval_Sent__c, Is_MR_Created__c, Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n  // Paste PMS ('A') tickets in Step 1 to populate batches\n)" : cancellationType === "CCO" ? "SELECT Id, Ticket_Number_Read_Only__c, ParentWorkOrderId, ParentWorkOrder.Ticket_Number_Read_Only__c, Is_Approval_Sent__c, Is_MR_Created__c, Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n  // Paste NON-PMS tickets in Step 1 to populate batches\n)" : cancellationType === "Account Check" ? "SELECT Id, Ticket_Number_Read_Only__c, ParentWorkOrderId, ParentWorkOrder.Ticket_Number_Read_Only__c, Is_Approval_Sent__c, Is_MR_Created__c, Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n  // Paste tickets in Step 1 to populate batches\n)" : "// Query will appear here after defining Step 2 algorithm")} className={cn("overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed selection:bg-rose-500/20 selection:text-rose-900 dark:selection:text-rose-100 text-slate-800 dark:text-sky-200", "max-h-[320px] min-h-[100px]")} />



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



              </motion.div>







              <motion.div variants={cardItemVariants} className="h-full flex flex-col">



                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">



            <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



              <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">



                STEP 3



              </span>



            </div>



                  <CardHeader className="pb-4 bg-transparent p-6 relative z-10">



                    <div className="flex items-center justify-between gap-4 flex-wrap">



                      <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                        {cancellationType === "Account Check" ? "Account Check SOQL Results" : "Paste SOQL Result Batch"}
                      </CardTitle>



                      <div className="flex items-center gap-2 mt-5 md:mt-6">



                        <span className="font-black uppercase tracking-widest whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">



                          {cancellationResultBatchCount} BATCH{cancellationResultBatchCount === 1 ? "" : "ES"}



                        </span>



                        <Button



                          variant="outline"



                          size="sm"



                          className="h-7 px-2.5 text-[10px] font-bold border-sky-400/30 hover:border-sky-400 bg-sky-500/10 text-sky-600 dark:text-sky-300 rounded-lg shadow-sm gap-1"



                          onClick={() => setShowDiscrepancyModal(true)}



                          disabled={parsedTickets.length === 0 && uniqueExecutableCancellationRows.length === 0}



                          title="Open Discrepancy Audit Diff Viewer"



                        >



                          <GitCompare className="h-3 w-3" /> Audit Diff



                        </Button>



                        {(cancellationExecutionInput || cancellationStoredRows.length > 0) && (



                          <Button



                            variant="ghost"



                            size="sm"



                            className="h-7 px-2 text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors gap-1"



                            onClick={handleClearCancellationBatches}



                            title="Clear all parsed results and stored batches"



                          >



                            <Trash2 className="h-3 w-3" /> Clear



                          </Button>



                        )}



                      </div>



                    </div>



                  </CardHeader>







                  <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 gap-4 relative z-10">



                    <Textarea



                      placeholder={`Paste Salesforce SOQL result here...\n"_"   "Id"   "Ticket_Number_Read_Only__c"   "ParentWorkOrderId"   "ParentWorkOrder"   "Is_Approval_Sent__c"   "Is_MR_Created__c"   "Account"   "Account.Group__c"   "FGR_Approved_Reject_For_CRBF__c"   "AssetId"   "Status"   "ParentWorkOrder.Ticket_Number_Read_Only__c"\n"[WorkOrder]"   "0WONy000008eHgfOAE"   "B25031925463529"   ""   ""   "false"   "false"   "[Account]"   "CCO"   ""   "02iNy00000CYGmbIAH"   "Accepted"   ""\n"[WorkOrder]"   "0WONy000004JcKLOA0"   "A23020209204"   ""   ""   "false"   "false"   "[Account]"   "NAMO"   ""   "02iNy00000CYGmbIAH"   "In Progress"   ""\n"[WorkOrder]"   "0WONy000003qBSCOA2"   "A23090340026"   "0WONy00000MkzWsOAJ"   "[WorkOrder]"   "false"   "false"   "[Account]"   "NON NAMO"   ""   "02iNy00000CjSmNIAV"   "Bundled"   "BLK25113030694566"`}



                      className="flex-1 font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y min-h-[220px]"



                      value={cancellationExecutionInput}



                      onPaste={handleCancellationResultPaste}



                      onChange={(event) => handleCancellationResultInputChange(event.target.value)}



                    />

                    {/* Cancellation Parsed Status Bar */}
                    {((cancellationType === "NAMO" && namoAlgo2Result.allRecords.length > 0) ||
                      (cancellationType === "NON NAMO" && nonNamoAlgo3Result.allRecords.length > 0) ||
                      (cancellationType === "CCO" && ccoAlgoResult.allRecords.length > 0) ||
                      (cancellationType === "Account Check" && accountCheckResult.totalCount > 0)) && (
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-xs text-sky-900 dark:text-sky-200 shadow-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="font-bold">
                            Successfully parsed{" "}
                            {cancellationType === "NAMO"
                              ? namoAlgo2Result.allRecords.length
                              : cancellationType === "NON NAMO"
                              ? nonNamoAlgo3Result.allRecords.length
                              : cancellationType === "CCO"
                              ? ccoAlgoResult.allRecords.length
                              : accountCheckResult.totalCount}{" "}
                            WorkOrders from SOQL results
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-300">
                          See Multiple Insights in the card below ↓
                        </span>
                      </div>
                    )}

                        {/* Missing Tickets Reconciliation Banner */}



                    {cancellationMissingTickets.length > 0 && uniqueExecutableCancellationRows.length > 0 && (



                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-700 dark:text-amber-300 shadow-sm">



                        <div className="flex items-center gap-2 min-w-0">



                          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />



                          <span className="font-semibold text-[11px] leading-tight">



                            <strong>{cancellationMissingTickets.length} ticket{cancellationMissingTickets.length === 1 ? "" : "s"}</strong> not returned by Salesforce (already Canceled, Completed, or Child WorkOrders).



                          </span>



                        </div>



                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">



                          <Button



                            variant="outline"



                            size="sm"



                            onClick={() => setShowDiscrepancyModal(true)}



                            className="h-7 px-2.5 text-[11px] font-bold border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 rounded-lg shrink-0 gap-1.5"



                            title="Open side-by-side reconciliation diff viewer"



                          >



                            <GitCompare className="h-3 w-3" /> View Diff



                          </Button>



                          <Button



                            variant="outline"



                            size="sm"



                            onClick={handleCopyMissingTickets}



                            className="h-7 px-2.5 text-[11px] font-bold border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 rounded-lg shrink-0 gap-1.5"



                            title="Copy list of tickets that were not found in Salesforce result"



                          >



                            <Copy className="h-3 w-3" /> Copy {cancellationMissingTickets.length} Missing



                          </Button>



                          <Button



                            variant="outline"



                            size="sm"



                            onClick={handleGenerateMissingAuditQuery}



                            className="h-7 px-2.5 text-[11px] font-bold border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 rounded-lg shrink-0 gap-1.5"



                            title="Copy audit SOQL query to check why these tickets weren't returned"



                          >



                            Audit SOQL



                          </Button>



                        </div>



                      </div>



                    )}







                    {cancellationType !== "NON NAMO" && cancellationType !== "NAMO" && cancellationType !== "CCO" && (
                      <div className="flex flex-wrap items-center gap-2.5 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <span>Pasted: {parsedTickets.length}{ticketDuplicates.length > 0 ? ` (${cancellationUniqueRequestedTickets.length} unique)` : ""}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span>Parsed: {cancellationExecutionRows.length}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span>Ready to cancel: {uniqueExecutableCancellationRows.length}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span>Matched: {cancellationMatchedTicketCount}</span>
                        {cancellationMissingTickets.length > 0 && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className="text-amber-500 font-extrabold">Missing from SF: {cancellationMissingTickets.length}</span>
                          </>
                        )}
                        {cancellationUnexpectedResultCount > 0 && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span>Outside: {cancellationUnexpectedResultCount}</span>
                          </>
                        )}
                      </div>
                    )}



                  </CardContent>



                </Card>



              </motion.div>

              {/* CCO, NAMO & NON-NAMO: FULL-WIDTH MASTER MULTIPLE INSIGHTS CARD */}
              {(cancellationType === "NAMO" || cancellationType === "NON NAMO" || cancellationType === "CCO") && (
                <motion.div variants={cardItemVariants} className="col-span-full h-full flex flex-col">
                  <Card className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                    {/* INSIGHTS Ambient Watermark */}
                    <div className="absolute top-1 left-3 md:top-2 md:left-4 pointer-events-none select-none z-0 overflow-hidden opacity-70">
                      <span className="whitespace-nowrap text-[28px] md:text-[34px] lg:text-[40px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/40 dark:to-white/8 bg-clip-text text-transparent">
                        INSIGHTS
                      </span>
                    </div>

                    <CardHeader className="pb-2 bg-transparent p-3.5 sm:p-4 relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mt-3 md:mt-4 w-full">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <CardTitle className="text-sm md:text-base font-black tracking-tight leading-tight text-foreground">
                            {cancellationType === "NAMO" ? "NAMO Operational Insights & Segregation" : cancellationType === "NON NAMO" ? "NON-NAMO Operational Insights & Segregation" : "CCO Operational Insights & Segregation"}
                          </CardTitle>
                          {(() => {
                            const total = cancellationType === "NAMO" ? namoAlgo2Result.allRecords.length : cancellationType === "NON NAMO" ? nonNamoAlgo3Result.allRecords.length : ccoAlgoResult.allRecords.length;
                            return total > 0 ? (
                              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25 px-2 py-0.5">
                                {total} Analyzed WorkOrders
                              </Badge>
                            ) : null;
                          })()}
                        </div>

                        {/* Top Actions */}
                        {(() => {
                          const readyList = cancellationType === "NAMO" ? namoAlgo2Result.namoCancellationTickets : cancellationType === "NON NAMO" ? nonNamoAlgo3Result.nonNamoCancellationTickets : ccoAlgoResult.ccoCancellationTickets;
                          const skippedList = cancellationType === "NAMO" ? namoAlgo2Result.allSkippedTickets : cancellationType === "NON NAMO" ? nonNamoAlgo3Result.allSkippedTickets : ccoAlgoResult.allSkippedTickets;
                          return (
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-bold border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg shadow-sm whitespace-nowrap shrink-0"
                                onClick={() => setShowCancellationHandoverModal(true)}
                                title="Open Executive Shift Handover & Segregation Audit"
                              >
                                <FileText className="h-3.5 w-3.5" /> Handover Report
                              </Button>
                              {readyList.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs font-bold border-blue-400/40 bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-200 rounded-lg shadow-sm whitespace-nowrap shrink-0"
                                  onClick={() => {
                                    const tkts = readyList.map((t) => t.ticket).filter(Boolean);
                                    navigator.clipboard.writeText(tkts.join("\n"));
                                    toast.success(`Copied ${tkts.length} Ready to Cancel tickets!`);
                                  }}
                                >
                                  <Copy className="h-3.5 w-3.5" /> Copy Ready ({readyList.length})
                                </Button>
                              )}
                              {skippedList.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs font-bold border-slate-300/60 dark:border-white/15 bg-slate-100/70 dark:bg-white/[0.05] hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg shadow-sm whitespace-nowrap shrink-0"
                                  onClick={() => {
                                    const tkts = skippedList.map((t) => t.ticket).filter(Boolean);
                                    navigator.clipboard.writeText(tkts.join("\n"));
                                    toast.success(`Copied all ${tkts.length} excluded tickets!`);
                                  }}
                                >
                                  <Copy className="h-3.5 w-3.5" /> Copy All Excluded ({skippedList.length})
                                </Button>
                              )}
                              {skippedList.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs font-bold border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg shadow-sm whitespace-nowrap shrink-0"
                                  onClick={() => {
                                    downloadExcludedInsightsExcel({
                                      cancellationType,
                                      ccoResult: ccoAlgoResult,
                                      namoResult: namoAlgo2Result,
                                      nonNamoResult: nonNamoAlgo3Result,
                                    });
                                  }}
                                  title="Download Multi-Sheet Excluded Tickets Excel (.xlsx)"
                                >
                                  <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Excluded Sheet ({skippedList.length})
                                </Button>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </CardHeader>

                    <CardContent className="p-3.5 sm:p-4 pt-1 space-y-3 relative z-10">
                      {(() => {
                        const isNamo = cancellationType === "NAMO";
                        const isCco = cancellationType === "CCO";
                        const total = isCco ? ccoAlgoResult.allRecords.length : isNamo ? namoAlgo2Result.allRecords.length : nonNamoAlgo3Result.allRecords.length;
                        const readyList = isCco ? ccoAlgoResult.ccoCancellationTickets : isNamo ? namoAlgo2Result.namoCancellationTickets : nonNamoAlgo3Result.nonNamoCancellationTickets;
                        const skippedList = isCco ? ccoAlgoResult.allSkippedTickets : isNamo ? namoAlgo2Result.allSkippedTickets : nonNamoAlgo3Result.allSkippedTickets;
                        const groupMismatchList = isCco ? ccoAlgoResult.autoPmsTickets : isNamo ? namoAlgo2Result.nonNamoTickets : nonNamoAlgo3Result.namoTickets;
                        const parentList = isCco ? ccoAlgoResult.parentWorkOrderTickets : isNamo ? namoAlgo2Result.parentWorkOrderTickets : nonNamoAlgo3Result.parentWorkOrderTickets;
                        const completedList = isCco ? ccoAlgoResult.completedOrCanceledTickets : isNamo ? namoAlgo2Result.completedOrCanceledTickets : nonNamoAlgo3Result.completedOrCanceledTickets;
                        const canceledOnlyList = isCco
                          ? (ccoAlgoResult.canceledTickets || completedList.filter((t) => isStatusCanceled(t.status)))
                          : isNamo
                          ? (namoAlgo2Result.canceledTickets || completedList.filter((t) => isStatusCanceled(t.status)))
                          : (nonNamoAlgo3Result.canceledTickets || completedList.filter((t) => isStatusCanceled(t.status)));
                        const completedOnlyList = isCco
                          ? (ccoAlgoResult.completedTickets || completedList.filter((t) => !isStatusCanceled(t.status)))
                          : isNamo
                          ? (namoAlgo2Result.completedTickets || completedList.filter((t) => !isStatusCanceled(t.status)))
                          : (nonNamoAlgo3Result.completedTickets || completedList.filter((t) => !isStatusCanceled(t.status)));
                        const unverifiedList = isCco ? [] : isNamo ? namoAlgo2Result.unclassifiedTickets : nonNamoAlgo3Result.unclassifiedTickets;
                        const nonPmsList = isCco ? [] : isNamo ? namoAlgo2Result.nonAutoPmsTickets : nonNamoAlgo3Result.nonAutoPmsTickets;
                        const approvalPendingList = isCco ? ccoAlgoResult.approvalPendingTickets : isNamo ? namoAlgo2Result.approvalPendingTickets : nonNamoAlgo3Result.approvalPendingTickets;
                        const mrCreatedList = isCco ? ccoAlgoResult.mrCreatedTickets : isNamo ? namoAlgo2Result.mrCreatedTickets : nonNamoAlgo3Result.mrCreatedTickets;

                        if (total === 0) {
                          return (
                            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200/80 dark:border-white/[0.08] bg-slate-50/40 dark:bg-black/15">
                              <Sparkles className="h-8 w-8 text-sky-400 mb-3 opacity-80 animate-pulse" />
                              <h4 className="text-sm font-bold text-foreground">
                                No SOQL Results Parsed Yet
                              </h4>
                              <p className="text-xs text-muted-foreground max-w-md mt-1 leading-relaxed">
                                Paste your Salesforce SOQL query results into the card above to view multiple operational insights, segregation metrics, and the excluded workorders breakdown.
                              </p>
                            </div>
                          );
                        }

                        return (
                          <>
                            {/* KPI Metrics Grid with 1-click Copy: 5 Compact Cards (No Category Icons) */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                              {/* 1. Ready to Cancel */}
                              <div
                                onClick={() => {
                                  const tkts = readyList.map((t) => t.ticket).filter(Boolean);
                                  if (tkts.length === 0) return;
                                  navigator.clipboard.writeText(tkts.join("\n"));
                                  toast.success(`Copied ${tkts.length} Ready tickets!`);
                                }}
                                className="relative rounded-xl border border-blue-500/30 bg-blue-500/[0.08] p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:border-blue-400/50 hover:bg-blue-500/15 hover:shadow-[0_4px_16px_rgba(59,130,246,0.15)] group select-none active:scale-[0.98]"
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 dark:text-blue-300 leading-none truncate">
                                    Ready to Cancel
                                  </span>
                                  <span className="inline-flex h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] shrink-0" />
                                </div>
                                <div className="flex items-baseline justify-between mt-2 gap-1">
                                  <div className="flex items-baseline gap-1 min-w-0">
                                    <span className="text-xl font-black font-mono tracking-tight text-slate-900 dark:text-blue-100 leading-none">
                                      {readyList.length.toLocaleString()}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">WOs</span>
                                    <span className="text-[9px] font-mono font-bold text-slate-400/70 ml-1">
                                      {total > 0 ? ((readyList.length / total) * 100).toFixed(0) : "0"}%
                                    </span>
                                  </div>
                                  <button
                                    disabled={readyList.length === 0}
                                    className="h-6 w-6 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 hover:bg-blue-500/30 transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const tkts = readyList.map((t) => t.ticket).filter(Boolean);
                                      if (tkts.length === 0) return;
                                      navigator.clipboard.writeText(tkts.join("\n"));
                                      toast.success(`Copied ${tkts.length} Ready tickets!`);
                                    }}
                                    title="Copy Ready to Cancel tickets"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* 2. Approval Pending */}
                              <div
                                onClick={() => {
                                  const tkts = approvalPendingList.map((t) => t.ticket).filter(Boolean);
                                  if (tkts.length === 0) return;
                                  navigator.clipboard.writeText(tkts.join("\n"));
                                  toast.success(`Copied ${tkts.length} Approval Pending tickets!`);
                                }}
                                className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_4px_16px_rgba(255,255,255,0.05)] group select-none active:scale-[0.98]"
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 leading-none truncate">
                                    Approval Pending
                                  </span>
                                  <span className="inline-flex h-2 w-2 rounded-full bg-slate-400 dark:bg-white/70 shadow-[0_0_6px_rgba(255,255,255,0.4)] shrink-0" />
                                </div>
                                <div className="flex items-baseline justify-between mt-2 gap-1">
                                  <div className="flex items-baseline gap-1 min-w-0">
                                    <span className="text-xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
                                      {approvalPendingList.length.toLocaleString()}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">WOs</span>
                                    <span className="text-[9px] font-mono font-bold text-slate-400/70 ml-1">
                                      {total > 0 ? ((approvalPendingList.length / total) * 100).toFixed(0) : "0"}%
                                    </span>
                                  </div>
                                  <button
                                    disabled={approvalPendingList.length === 0}
                                    className="h-6 w-6 rounded-md bg-white/10 border border-white/15 flex items-center justify-center text-slate-200 hover:bg-white/20 transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const tkts = approvalPendingList.map((t) => t.ticket).filter(Boolean);
                                      if (tkts.length === 0) return;
                                      navigator.clipboard.writeText(tkts.join("\n"));
                                      toast.success(`Copied ${tkts.length} Approval Pending tickets!`);
                                    }}
                                    title="Copy Approval Pending tickets"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* 3. Parent Tickets */}
                              <div
                                onClick={() => {
                                  const tkts = parentList.map((t) => t.ticket).filter(Boolean);
                                  if (tkts.length === 0) return;
                                  navigator.clipboard.writeText(tkts.join("\n"));
                                  toast.success(`Copied ${tkts.length} Parent Linked tickets!`);
                                }}
                                className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_4px_16px_rgba(255,255,255,0.05)] group select-none active:scale-[0.98]"
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 leading-none truncate">
                                    Parent Tickets
                                  </span>
                                  <span className="inline-flex h-2 w-2 rounded-full bg-slate-400 dark:bg-white/70 shadow-[0_0_6px_rgba(255,255,255,0.4)] shrink-0" />
                                </div>
                                <div className="flex items-baseline justify-between mt-2 gap-1">
                                  <div className="flex items-baseline gap-1 min-w-0">
                                    <span className="text-xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
                                      {parentList.length.toLocaleString()}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">WOs</span>
                                    <span className="text-[9px] font-mono font-bold text-slate-400/70 ml-1">
                                      {total > 0 ? ((parentList.length / total) * 100).toFixed(0) : "0"}%
                                    </span>
                                  </div>
                                  <button
                                    disabled={parentList.length === 0}
                                    className="h-6 w-6 rounded-md bg-white/10 border border-white/15 flex items-center justify-center text-slate-200 hover:bg-white/20 transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const tkts = parentList.map((t) => t.ticket).filter(Boolean);
                                      if (tkts.length === 0) return;
                                      navigator.clipboard.writeText(tkts.join("\n"));
                                      toast.success(`Copied ${tkts.length} Parent Linked tickets!`);
                                    }}
                                    title="Copy Parent Linked tickets"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* 4. MR Raised */}
                              <div
                                onClick={() => {
                                  const tkts = mrCreatedList.map((t) => t.ticket).filter(Boolean);
                                  if (tkts.length === 0) return;
                                  navigator.clipboard.writeText(tkts.join("\n"));
                                  toast.success(`Copied ${tkts.length} MR Raised tickets!`);
                                }}
                                className="relative rounded-xl border border-blue-400/25 bg-blue-500/[0.05] p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:border-blue-400/40 hover:bg-blue-500/10 hover:shadow-[0_4px_16px_rgba(59,130,246,0.1)] group select-none active:scale-[0.98]"
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-sky-300 leading-none truncate">
                                    MR Raised
                                  </span>
                                  <span className="inline-flex h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)] shrink-0" />
                                </div>
                                <div className="flex items-baseline justify-between mt-2 gap-1">
                                  <div className="flex items-baseline gap-1 min-w-0">
                                    <span className="text-xl font-black font-mono tracking-tight text-slate-900 dark:text-sky-100 leading-none">
                                      {mrCreatedList.length.toLocaleString()}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">WOs</span>
                                    <span className="text-[9px] font-mono font-bold text-slate-400/70 ml-1">
                                      {total > 0 ? ((mrCreatedList.length / total) * 100).toFixed(0) : "0"}%
                                    </span>
                                  </div>
                                  <button
                                    disabled={mrCreatedList.length === 0}
                                    className="h-6 w-6 rounded-md bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-300 hover:bg-blue-500/25 transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const tkts = mrCreatedList.map((t) => t.ticket).filter(Boolean);
                                      if (tkts.length === 0) return;
                                      navigator.clipboard.writeText(tkts.join("\n"));
                                      toast.success(`Copied ${tkts.length} MR Raised tickets!`);
                                    }}
                                    title="Copy MR Raised tickets"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* 5. NAMO GROUP / NON-NAMO GROUP */}
                              <div
                                onClick={() => {
                                  const tkts = groupMismatchList.map((t) => t.ticket).filter(Boolean);
                                  if (tkts.length === 0) return;
                                  navigator.clipboard.writeText(tkts.join("\n"));
                                  toast.success(`Copied ${tkts.length} tickets!`);
                                }}
                                className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_4px_16px_rgba(255,255,255,0.05)] group select-none active:scale-[0.98]"
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 leading-none truncate">
                                    {isCco ? "AUTO PMS (EXCLUDED)" : isNamo ? "NON-NAMO GROUP" : "NAMO GROUP"}
                                  </span>
                                  <span className="inline-flex h-2 w-2 rounded-full bg-slate-400 dark:bg-white/70 shadow-[0_0_6px_rgba(255,255,255,0.4)] shrink-0" />
                                </div>
                                <div className="flex items-baseline justify-between mt-2 gap-1">
                                  <div className="flex items-baseline gap-1 min-w-0">
                                    <span className="text-xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
                                      {groupMismatchList.length.toLocaleString()}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">WOs</span>
                                    <span className="text-[9px] font-mono font-bold text-slate-400/70 ml-1">
                                      {total > 0 ? ((groupMismatchList.length / total) * 100).toFixed(0) : "0"}%
                                    </span>
                                  </div>
                                  <button
                                    disabled={groupMismatchList.length === 0}
                                    className="h-6 w-6 rounded-md bg-white/10 border border-white/15 flex items-center justify-center text-slate-200 hover:bg-white/20 transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const tkts = groupMismatchList.map((t) => t.ticket).filter(Boolean);
                                      if (tkts.length === 0) return;
                                      navigator.clipboard.writeText(tkts.join("\n"));
                                      toast.success(`Copied ${tkts.length} tickets!`);
                                    }}
                                    title={isCco ? "Copy Auto PMS tickets" : isNamo ? "Copy Non-Namo tickets" : "Copy NAMO tickets"}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Additional 1-Click Copy Category Badges: NON PMS / Auto PMS, Completed, Unverified */}
                            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                              {/* NON PMS (for NAMO/NON NAMO) or Auto PMS (for CCO) Badge */}
                              {isCco ? (
                                <div
                                  onClick={() => {
                                    const tkts = groupMismatchList.map((t) => t.ticket).filter(Boolean);
                                    if (tkts.length === 0) return;
                                    navigator.clipboard.writeText(tkts.join("\n"));
                                    toast.success(`Copied ${tkts.length} Auto PMS tickets!`);
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold select-none transition-all duration-200",
                                    groupMismatchList.length > 0
                                      ? "border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 cursor-pointer active:scale-95 shadow-xs"
                                      : "border-slate-200/50 dark:border-white/10 opacity-40 cursor-not-allowed text-muted-foreground"
                                  )}
                                  title={groupMismatchList.length > 0 ? "Click to copy Auto PMS tickets" : "No Auto PMS tickets"}
                                >
                                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", groupMismatchList.length > 0 ? "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" : "bg-slate-400")} />
                                  <span>Auto PMS: <strong>{groupMismatchList.length}</strong></span>
                                  <Copy className="h-3 w-3 opacity-70 ml-0.5" />
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    if (nonPmsList.length === 0) return;
                                    navigator.clipboard.writeText(nonPmsList.join("\n"));
                                    toast.success(`Copied ${nonPmsList.length} NON PMS tickets!`);
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold select-none transition-all duration-200",
                                    nonPmsList.length > 0
                                      ? "border-white/20 bg-white/10 text-white hover:bg-white/15 cursor-pointer active:scale-95 shadow-xs"
                                      : "border-slate-200/50 dark:border-white/10 opacity-40 cursor-not-allowed text-muted-foreground"
                                  )}
                                  title={nonPmsList.length > 0 ? "Click to copy NON PMS tickets" : "No NON PMS tickets"}
                                >
                                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", nonPmsList.length > 0 ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]" : "bg-slate-400")} />
                                  <span>NON PMS: <strong>{nonPmsList.length}</strong></span>
                                  <Copy className="h-3 w-3 opacity-70 ml-0.5" />
                                </div>
                              )}

                              {/* Completed Badge */}
                              <div
                                onClick={() => {
                                  const tkts = completedOnlyList.map((t) => t.ticket).filter(Boolean);
                                  if (tkts.length === 0) return;
                                  navigator.clipboard.writeText(tkts.join("\n"));
                                  toast.success(`Copied ${tkts.length} Completed tickets!`);
                                }}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold select-none transition-all duration-200",
                                  completedOnlyList.length > 0
                                    ? "border-white/20 bg-white/10 text-white hover:bg-white/15 cursor-pointer active:scale-95 shadow-xs"
                                    : "border-slate-200/50 dark:border-white/10 opacity-40 cursor-not-allowed text-muted-foreground"
                                )}
                                title={completedOnlyList.length > 0 ? "Click to copy Already Completed tickets" : "No Already Completed tickets"}
                              >
                                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", completedOnlyList.length > 0 ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]" : "bg-slate-400")} />
                                <span>Completed: <strong>{completedOnlyList.length}</strong></span>
                                <Copy className="h-3 w-3 opacity-70 ml-0.5" />
                              </div>

                              {/* Canceled Badge */}
                              <div
                                onClick={() => {
                                  const tkts = canceledOnlyList.map((t) => t.ticket).filter(Boolean);
                                  if (tkts.length === 0) return;
                                  navigator.clipboard.writeText(tkts.join("\n"));
                                  toast.success(`Copied ${tkts.length} Canceled tickets!`);
                                }}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold select-none transition-all duration-200",
                                  canceledOnlyList.length > 0
                                    ? "border-white/20 bg-white/10 text-white hover:bg-white/15 cursor-pointer active:scale-95 shadow-xs"
                                    : "border-slate-200/50 dark:border-white/10 opacity-40 cursor-not-allowed text-muted-foreground"
                                )}
                                title={canceledOnlyList.length > 0 ? "Click to copy Already Canceled tickets" : "No Already Canceled tickets"}
                              >
                                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", canceledOnlyList.length > 0 ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" : "bg-slate-400")} />
                                <span>Canceled: <strong>{canceledOnlyList.length}</strong></span>
                                <Copy className="h-3 w-3 opacity-70 ml-0.5" />
                              </div>

                              {/* Unverified / Blank Group Badge */}
                              <div
                                onClick={() => {
                                  const tkts = unverifiedList.map((t) => t.ticket).filter(Boolean);
                                  if (tkts.length === 0) return;
                                  navigator.clipboard.writeText(tkts.join("\n"));
                                  toast.success(`Copied ${tkts.length} Unverified tickets!`);
                                }}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold select-none transition-all duration-200",
                                  unverifiedList.length > 0
                                    ? "border-white/20 bg-white/10 text-white hover:bg-white/15 cursor-pointer active:scale-95 shadow-xs"
                                    : "border-slate-200/50 dark:border-white/10 opacity-40 cursor-not-allowed text-muted-foreground"
                                )}
                                title={unverifiedList.length > 0 ? "Click to copy Unverified tickets" : "No Unverified tickets"}
                              >
                                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", unverifiedList.length > 0 ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]" : "bg-slate-400")} />
                                <span>Unverified: <strong>{unverifiedList.length}</strong></span>
                                <Copy className="h-3 w-3 opacity-70 ml-0.5" />
                              </div>
                            </div>

                            {/* Full Segregation Audit & Handover Report Banner */}
                            <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-blue-500/[0.05] border border-blue-500/20 text-xs gap-2.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="h-6 w-6 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                                  <FileText className="h-3 w-3" />
                                </div>
                                <span className="text-[11px] font-semibold text-muted-foreground truncate">Explore all {total} WorkOrders — Segregation Audit & Handover</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-[10px] font-bold border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg gap-1 shadow-xs shrink-0"
                                onClick={() => setShowCancellationHandoverModal(true)}
                              >
                                <FileText className="h-3 w-3" />
                                <span>Open Report →</span>
                              </Button>
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {/* ACCOUNT CHECK: STEP 4 MASTER OPERATIONAL INSIGHTS CARD */}
              {cancellationType === "Account Check" && (
                <motion.div variants={cardItemVariants} className="col-span-full h-full flex flex-col">
                  <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                    {/* INSIGHT TABLE Ambient Watermark */}
                    <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                      <span className="whitespace-nowrap text-[36px] md:text-[46px] lg:text-[54px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                        INSIGHT TABLE
                      </span>
                    </div>

                    <CardHeader className="pb-3 bg-transparent p-5 sm:p-6 relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 md:mt-7 w-full">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                            Operational Insights & Classification
                          </CardTitle>
                          {accountCheckResult.totalCount > 0 && (
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25 px-2 py-0.5">
                              {accountCheckResult.totalCount} Analyzed
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {accountCheckResult.totalCount > 0 && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-bold border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-lg shadow-sm"
                                onClick={() => setShowAccountCheckHandoverModal(true)}
                                title="Open Executive Shift Handover & Escalation Summary"
                              >
                                <FileText className="h-3.5 w-3.5" /> Handover Report
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-bold border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 rounded-lg shadow-sm"
                                onClick={() => {
                                  const allTkts = accountCheckResult.allRows.map((r) => r.ticket).filter(Boolean).join("\n");
                                  navigator.clipboard.writeText(allTkts);
                                  toast.success(`Copied all ${accountCheckResult.allRows.length} tickets!`);
                                }}
                              >
                                <Copy className="h-3.5 w-3.5" /> Copy All ({accountCheckResult.totalCount})
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-bold border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg shadow-sm"
                                onClick={handleDownloadAccountCheckOutput}
                              >
                                <Download className="h-3.5 w-3.5" /> TSV
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 sm:p-6 pt-2 flex-1 flex flex-col min-h-0 gap-4 relative z-10">
                      {accountCheckResult.totalCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200/80 dark:border-white/[0.08] bg-white/20 dark:bg-white/[0.01]">
                          <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 mb-3 shadow-inner">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <h4 className="text-sm font-bold text-foreground">
                            Awaiting SOQL Results
                          </h4>
                          <p className="text-xs text-muted-foreground max-w-md mt-1 leading-relaxed">
                            Paste your Salesforce SOQL query results into Step 3 to analyze WorkOrders across Account Group (NAMO vs NON-NAMO), Hierarchy (Parent vs Bundled Child), Approvals, MR, and Lifecycle Status.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Quick Operational Metrics & Copy Bar - Clean, Compact, Zero Truncation */}
                          <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md shadow-xs">
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                              {/* 1. Group */}
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] shrink-0" />
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
                                  Group:
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={accountCheckResult.namoCount === 0}
                                  onClick={() => copySegmentTickets("NAMO", (r) => r.accountGroupCategory === "NAMO")}
                                  className="h-7 px-2.5 text-xs font-bold gap-1.5 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 rounded-lg disabled:opacity-40"
                                  title="Click to copy NAMO tickets"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>NAMO ({accountCheckResult.namoCount})</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={accountCheckResult.nonNamoCount === 0}
                                  onClick={() => copySegmentTickets("NON-NAMO", (r) => r.accountGroupCategory === "NON-NAMO")}
                                  className="h-7 px-2.5 text-xs font-bold gap-1.5 text-slate-300 hover:bg-white/10 hover:text-white rounded-lg disabled:opacity-40"
                                  title="Click to copy NON-NAMO tickets"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>NON-NAMO ({accountCheckResult.nonNamoCount})</span>
                                </Button>
                              </div>

                              <div className="hidden lg:block h-4 w-px bg-slate-200 dark:bg-white/10" />

                              {/* 2. Hierarchy */}
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
                                  Hierarchy:
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={accountCheckResult.parentCount === 0}
                                  onClick={() => copySegmentTickets("Parent", (r) => r.isParent)}
                                  className="h-7 px-2.5 text-xs font-bold gap-1.5 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200 rounded-lg disabled:opacity-40"
                                  title="Click to copy Parent tickets"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>Parents ({accountCheckResult.parentCount})</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={accountCheckResult.childCount === 0}
                                  onClick={() => copySegmentTickets("Child", (r) => r.isChild)}
                                  className="h-7 px-2.5 text-xs font-bold gap-1.5 text-slate-300 hover:bg-white/10 hover:text-white rounded-lg disabled:opacity-40"
                                  title="Click to copy Child tickets"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>Child ({accountCheckResult.childCount})</span>
                                </Button>
                              </div>

                              <div className="hidden lg:block h-4 w-px bg-slate-200 dark:bg-white/10" />

                              {/* 3. Flags */}
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] shrink-0" />
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
                                  Flags:
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={accountCheckResult.approvalSentCount === 0}
                                  onClick={() => copySegmentTickets("Approval Request", (r) => r.isApprovalSent)}
                                  className="h-7 px-2.5 text-xs font-bold gap-1.5 text-slate-300 hover:bg-white/10 hover:text-white rounded-lg disabled:opacity-40"
                                  title="Click to copy Approval Request tickets"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>Approval Request ({accountCheckResult.approvalSentCount})</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={accountCheckResult.mrCreatedCount === 0}
                                  onClick={() => copySegmentTickets("MR Created", (r) => r.isMrCreated)}
                                  className="h-7 px-2.5 text-xs font-bold gap-1.5 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200 rounded-lg disabled:opacity-40"
                                  title="Click to copy MR Created tickets"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>MR ({accountCheckResult.mrCreatedCount})</span>
                                </Button>
                              </div>

                              <div className="hidden lg:block h-4 w-px bg-slate-200 dark:bg-white/10" />

                              {/* 4. Type */}
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
                                  Type:
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={accountCheckResult.pmsCount === 0}
                                  onClick={() => copySegmentTickets("Auto PMS", (r) => r.isPms)}
                                  className="h-7 px-2.5 text-xs font-bold gap-1.5 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 rounded-lg disabled:opacity-40"
                                  title="Click to copy Auto PMS tickets"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>Auto PMS ({accountCheckResult.pmsCount})</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={accountCheckResult.nonPmsCount === 0}
                                  onClick={() => copySegmentTickets("Non-PMS", (r) => !r.isPms)}
                                  className="h-7 px-2.5 text-xs font-bold gap-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-500/10 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg disabled:opacity-40"
                                  title="Click to copy Non-PMS tickets"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>Non-PMS ({accountCheckResult.nonPmsCount})</span>
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Filter Pills + Search Toolbar */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1">
                            <div className="flex items-center gap-1 flex-wrap">
                              {[
                                { id: "all", label: "All", count: accountCheckResult.totalCount },
                                { id: "namo", label: "NAMO", count: accountCheckResult.namoCount },
                                { id: "non-namo", label: "NON-NAMO", count: accountCheckResult.nonNamoCount },
                                { id: "parent", label: "Parents", count: accountCheckResult.parentCount },
                                { id: "child", label: "Child", count: accountCheckResult.childCount },
                                { id: "approval", label: "Approval Request", count: accountCheckResult.approvalSentCount },
                                { id: "mr", label: "MR Created", count: accountCheckResult.mrCreatedCount },
                                { id: "pms", label: "Auto PMS", count: accountCheckResult.pmsCount },
                                { id: "non-pms", label: "Non-PMS", count: accountCheckResult.nonPmsCount },
                              ].map((tab) => (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setAccountCheckFilter(tab.id as any)}
                                  className={cn(
                                    "px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1 whitespace-nowrap shrink-0",
                                    accountCheckFilter === tab.id
                                      ? "bg-sky-500 text-white shadow-sm"
                                      : "bg-slate-100/80 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                  )}
                                >
                                  {tab.label}
                                  <span className={cn(
                                    "px-1 py-0.5 rounded text-[9px] font-mono",
                                    accountCheckFilter === tab.id ? "bg-white/20 text-white" : "bg-black/10 dark:bg-white/10"
                                  )}>
                                    {tab.count}
                                  </span>
                                </button>
                              ))}
                            </div>

                            <div className="relative sm:w-56">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search ticket, group..."
                                value={accountCheckSearch}
                                onChange={(e) => setAccountCheckSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200/80 dark:border-white/[0.1] bg-white/60 dark:bg-black/30 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                              />
                            </div>
                          </div>

                          {/* Unified Master Interactive Table - Pure Printed-on-Glass Aesthetic */}
                          <div className="overflow-hidden">
                            <div className="max-h-[420px] overflow-auto">
                              <table className="w-full text-left text-xs font-mono border-collapse">
                                <thead className="sticky top-0 bg-slate-100/70 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200/50 dark:border-white/[0.08] text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 z-10">
                                  <tr>
                                    <th className="py-2.5 px-3">Ticket Number</th>
                                    <th className="py-2.5 px-3">Account Group</th>
                                    <th className="py-2.5 px-3">Hierarchy</th>
                                    <th className="py-2.5 px-3">Approvals & MR</th>
                                    <th className="py-2.5 px-3">PMS Type</th>
                                    <th className="py-2.5 px-3">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/40 dark:divide-white/[0.05]">
                                  {filteredAccountCheckRows.length === 0 ? (
                                    <tr>
                                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-sans">
                                        No matching WorkOrders found.
                                      </td>
                                    </tr>
                                  ) : (
                                    filteredAccountCheckRows.map((row, idx) => (
                                      <tr
                                        key={`acct-row-${row.ticket || row.id}-${idx}`}
                                        className="hover:bg-white/[0.03] transition-colors group/row"
                                      >
                                        <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(row.ticket);
                                              toast.success(`Copied ticket: ${row.ticket}`);
                                            }}
                                            className="flex items-center gap-1.5 hover:text-sky-400 transition-colors group-hover/row:underline text-left"
                                            title="Click to copy ticket"
                                          >
                                            <span
                                              className={cn(
                                                "h-1.5 w-1.5 rounded-full shrink-0",
                                                row.accountGroupCategory === "NAMO"
                                                  ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                                                  : "bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]"
                                              )}
                                            />
                                            <span className="font-mono tracking-tight text-slate-800 dark:text-slate-200 font-bold">{row.ticket || "—"}</span>
                                            <Copy className="h-3 w-3 opacity-0 group-hover/row:opacity-60 transition-opacity text-slate-400 ml-0.5" />
                                          </button>
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                              className={cn(
                                                "text-xs font-bold uppercase tracking-wider",
                                                row.accountGroupCategory === "NAMO"
                                                  ? "text-emerald-500 dark:text-emerald-400"
                                                  : row.accountGroupCategory === "NON-NAMO"
                                                  ? "text-sky-500 dark:text-sky-400"
                                                  : "text-slate-400"
                                              )}
                                            >
                                              {row.accountGroupCategory}
                                            </span>
                                            {row.accountGroup && (
                                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]" title={row.accountGroup}>
                                                {row.accountGroup}
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-3">
                                          {row.isChild ? (
                                            <button
                                              type="button"
                                              className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-colors text-left"
                                              onClick={() => {
                                                if (row.parentTicket) {
                                                  navigator.clipboard.writeText(row.parentTicket);
                                                  toast.success(`Copied parent ticket: ${row.parentTicket}`);
                                                }
                                              }}
                                              title={`Click to copy parent ticket: ${row.parentTicket || row.parentId}`}
                                            >
                                              <span className="text-purple-400/80">↳</span>
                                              <span>{row.parentTicket || (row.parentId ? `...${row.parentId.slice(-8)}` : "Child")}</span>
                                            </button>
                                          ) : (
                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                              Parent
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <div className="flex items-center gap-2 flex-wrap text-xs">
                                            {row.isApprovalSent && (
                                              <span className="font-bold text-orange-600 dark:text-orange-400">
                                                Approval Request
                                              </span>
                                            )}
                                            {row.isMrCreated && (
                                              <span className="font-bold text-rose-600 dark:text-rose-400">
                                                MR Created
                                              </span>
                                            )}
                                            {row.fgr && (
                                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                                FGR: {row.fgr}
                                              </span>
                                            )}
                                            {!row.isApprovalSent && !row.isMrCreated && !row.fgr && (
                                              <span className="text-slate-400 text-xs">—</span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span
                                            className={cn(
                                              "text-xs font-bold uppercase tracking-wider",
                                              row.isPms
                                                ? "text-amber-600 dark:text-amber-400"
                                                : "text-slate-500 dark:text-slate-400"
                                            )}
                                          >
                                            {row.isPms ? "Auto PMS" : "Non-PMS"}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span
                                            className={cn(
                                              "text-xs font-bold inline-flex items-center gap-1.5",
                                              row.status === "In Progress"
                                                ? "text-blue-600 dark:text-blue-400"
                                                : row.status === "Bundled"
                                                ? "text-purple-600 dark:text-purple-400"
                                                : row.status === "On Hold"
                                                ? "text-amber-600 dark:text-amber-400"
                                                : row.status === "Canceled"
                                                ? "text-rose-600 dark:text-rose-400"
                                                : "text-slate-600 dark:text-slate-400"
                                            )}
                                          >
                                            <span
                                              className={cn(
                                                "h-1.5 w-1.5 rounded-full shrink-0",
                                                row.status === "In Progress"
                                                  ? "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]"
                                                  : row.status === "Bundled"
                                                  ? "bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.8)]"
                                                  : row.status === "On Hold"
                                                  ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                                                  : row.status === "Canceled"
                                                  ? "bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)]"
                                                  : "bg-slate-400"
                                              )}
                                            />
                                            {row.status || "—"}
                                          </span>
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

                            {
              cancellationType !== "Account Check" && (
                <>
<motion.div variants={cardItemVariants} className="h-full flex flex-col 2xl:col-span-1">



                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">



          <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



            <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">



              STEP 4



            </span>



          </div>



                  <CardHeader className="pb-4 bg-transparent p-6 relative z-10">



                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5 md:mt-6 w-full">



                      <div className="flex flex-wrap items-center gap-3">



                        <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">



                          All Records



                        </CardTitle>



                        <Button



                          variant="outline"



                          size="sm"



                          className="h-7 px-2.5 text-[11px] font-bold border-sky-400/30 hover:border-sky-400 bg-sky-500/10 text-sky-600 dark:text-sky-300 rounded-lg shadow-sm gap-1 whitespace-nowrap shrink-0"



                          onClick={() => setShowDiscrepancyModal(true)}



                          disabled={parsedTickets.length === 0 && uniqueExecutableCancellationRows.length === 0}



                          title="Open Discrepancy Audit Diff Viewer"



                        >



                          <GitCompare className="h-3 w-3" /> Audit Diff



                        </Button>



                      </div>



                      <div className="flex items-center gap-2 flex-wrap">



                        {cancellationMissingTickets.length > 0 && (



                          <Button



                            variant="outline"



                            size="sm"



                            className="h-8 gap-1.5 text-xs font-bold border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 rounded-lg shadow-sm"



                            onClick={handleCopyMissingTickets}



                            title="Copy list of tickets that were requested in Step 1 but not returned by Salesforce"



                          >



                            <Copy className="h-3.5 w-3.5" /> Copy Missing ({cancellationMissingTickets.length})



                          </Button>



                        )}



                        <Button



                          variant="outline"



                          size="sm"



                          className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"



                          onClick={() => handleCopy(cancellationCanceledOutput)}



                          disabled={uniqueExecutableCancellationRows.length === 0}



                        >



                          <Copy className="h-3.5 w-3.5" /> Copy All ({uniqueExecutableCancellationRows.length})



                        </Button>



                        <Button



                          variant="outline"



                          size="sm"



                          className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"



                          onClick={handleDownloadCancellationOutput}



                          disabled={uniqueExecutableCancellationRows.length === 0}



                        >



                          <Download className="h-3.5 w-3.5" /> TSV



                        </Button>



                      </div>



                    </div>



                  </CardHeader>



                  <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 gap-4 relative z-10">



                    <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">



                      <span>Pasted: {parsedTickets.length}{ticketDuplicates.length > 0 ? ` (${cancellationUniqueRequestedTickets.length} unique)` : ""}</span>



                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />



                      <span>Ready Rows: {uniqueExecutableCancellationRows.length}</span>



                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Status: --</span>



                      {cancellationMissingTickets.length > 0 && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span className="text-amber-500 font-extrabold">{cancellationMissingTickets.length} not returned by SF</span>
                        </>
                      )}

                    </div>

                    <div className="rounded-xl bg-transparent text-foreground flex flex-col min-h-0 flex-1 overflow-hidden border-transparent shadow-none">
                      <SOQLHighlighter query={cancellationCanceledOutput || `"_"   "Id"   "Ticket_Number_Read_Only__c"   "Status"\n// Output will be generated here based on your custom algorithm`} className="overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed text-slate-800 dark:text-sky-200 min-h-[180px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100" />



                    </div>



                  </CardContent>



                </Card>



              </motion.div>







              <motion.div variants={cardItemVariants} className="h-full flex flex-col 2xl:col-span-1">



                <Card className="overflow-hidden rounded-3xl border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl h-full flex flex-col transition-all duration-300 group relative">



          <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



            <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">



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



                      <span className="font-black uppercase tracking-widest mt-1 shrink-0 text-[10px] text-muted-foreground">OPTIONAL</span>



                    </div>



                  </CardHeader>



                  <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 gap-4 relative z-10">



                    <Textarea



                      placeholder={`Paste Salesforce SOQL result of FAILED tickets here...\n"_"   "Id"   "Ticket_Number_Read_Only__c"   "Status"\n"[WorkOrder]"   "0WONy000008eHgfOAE"   "B25031925463529"   "Cancellation Requested"`}



                      className="flex-1 min-h-[180px] font-mono text-xs leading-relaxed rounded-2xl border border-border/70 dark:border-white/[0.08] bg-surface-recessed/60 dark:bg-black/25 p-4 resize-y text-foreground backdrop-blur-sm"



                      value={cancellationFailedInput}



                      onChange={(event) => setCancellationFailedInput(event.target.value)}
                    />

                    </CardContent>

                </Card>

              </motion.div>

              {(() => {
                const cancellationTotalTickets =
                  cancellationType === "CCO"
                    ? (ccoAlgoResult.allRecords.length || parsedTickets.length || cancellationExecutionRows.length)
                    : (cancellationType === "NAMO"
                        ? (namoAlgo2Result.allRecords.length || parsedTickets.length || cancellationExecutionRows.length)
                        : (cancellationType === "NON NAMO"
                            ? (nonNamoAlgo3Result.allRecords.length || parsedTickets.length || cancellationExecutionRows.length)
                            : (parsedTickets.length || cancellationExecutionRows.length)));
                let ccoApprovalExtra = "";
                if (cancellationType === "CCO" && algo1Result.approvalSegmentText) {
                  ccoApprovalExtra = `\n\n${algo1Result.approvalSegmentText}`;
                }

                const step5Outputs = buildCancellationStep5Output({
                  cancellationType,
                  totalTickets: cancellationTotalTickets,
                  executableCount: uniqueExecutableCancellationRows.length,
                  parsedFailed: parsedCancellationFailed,
                  ccoApprovalExtra,
                  namoResult: namoAlgo2Result,
                  nonNamoResult: nonNamoAlgo3Result,
                  accountCheckResult: accountCheckResult.totalCount > 0 ? accountCheckResult : undefined,
                  ccoResult: ccoAlgoResult,
                });

                const {
                  mailText: mailTemplateText,
                  mailHtml: mailHtmlText,
                  postText: postTemplateText,
                  postHtml: postHtmlText,
                } = step5Outputs;

                const step5ExcludedList =
                  cancellationType === "CCO"
                    ? (ccoAlgoResult.allSkippedTickets || [])
                    : cancellationType === "NAMO"
                    ? (namoAlgo2Result.allSkippedTickets || [])
                    : (nonNamoAlgo3Result.allSkippedTickets || []);
                const totalStep5Excluded =
                  step5ExcludedList.length +
                  (parsedCancellationFailed?.allFailedTickets?.length || 0);

                const handleDownloadStep5Excel = () => {
                  downloadExcludedInsightsExcel({
                    cancellationType,
                    ccoResult: ccoAlgoResult,
                    namoResult: namoAlgo2Result,
                    nonNamoResult: nonNamoAlgo3Result,
                    parsedFailed: parsedCancellationFailed,
                  });
                };

                return (



                  <>

                    {/* Common Excluded Tickets Insights Sheet Action Banner for Email and Post */}
                    <motion.div variants={cardItemVariants} className="col-span-full">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:px-5 rounded-2xl border border-blue-500/30 bg-blue-500/[0.06] backdrop-blur-md">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                            <FileSpreadsheet className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-black text-foreground">
                                Excluded Tickets Insights Sheet (.xlsx)
                              </h4>
                              {totalStep5Excluded > 20 && (
                                <Badge className="bg-blue-600/20 text-blue-300 border-blue-400/40 text-[10px] font-black uppercase tracking-wider">
                                  High Volume ({totalStep5Excluded} &gt; 20)
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-[10px] font-bold border-blue-500/25 text-blue-400">
                                {totalStep5Excluded} Excluded
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                              Multi-page Excel workbook with separate sheets for MR RAISED, Approval Pending, {cancellationType === "NAMO" ? "NON Namo tickets Found" : cancellationType === "NON NAMO" ? "NAMO tickets Found" : "Auto PMS (Excluded)"}, Child WorkOrders, and All Excluded. Common sheet for Email attachment & Teams Post.
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={handleDownloadStep5Excel}
                          disabled={totalStep5Excluded === 0}
                          size="sm"
                          className="h-8 sm:h-9 px-4 text-xs font-bold gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 rounded-xl whitespace-nowrap cursor-pointer shrink-0"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>Download Excluded Sheet (.xlsx)</span>
                        </Button>
                      </div>
                    </motion.div>

                    <motion.div variants={cardItemVariants} className="h-full flex flex-col">



                      <Card className="overflow-hidden rounded-3xl border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl h-full flex flex-col transition-all duration-300 group relative">



            <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



              <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">



                FOR EMAIL



              </span>



            </div>



  <CardHeader className="pb-4 bg-transparent p-6 relative z-10">



  <div className="flex flex-wrap items-center justify-between gap-3 mt-6 md:mt-7 w-full">



  <div className="flex items-center gap-3 min-w-0">



  <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground whitespace-nowrap">Email Template Output</CardTitle>



                            </div>



                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <div className="inline-flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setStep5EmailTab("preview")}
                                  className={cn(
                                    "px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0",
                                    step5EmailTab === "preview"
                                      ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs"
                                      : "text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  HTML Preview
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStep5EmailTab("text")}
                                  className={cn(
                                    "px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0",
                                    step5EmailTab === "text"
                                      ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs"
                                      : "text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  Plain Text
                                </button>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-bold border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                                onClick={handleDownloadStep5Excel}
                                disabled={totalStep5Excluded === 0}
                                title="Download Multi-Sheet Excluded Tickets Excel (.xlsx) for Email Attachment"
                              >
                                <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Sheet (.xlsx)</span>
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-primary/10 hover:text-primary transition-all border-border/80 dark:border-white/[0.08] bg-card/80 dark:bg-[#06070a]/80 rounded-lg shadow-sm cursor-pointer whitespace-nowrap shrink-0" onClick={() => handleCopy(mailTemplateText, mailHtmlText)} disabled={!mailTemplateText}>



                                <Copy className="h-3.5 w-3.5" /> Copy



                              </Button>
                            </div>



                          </div>



                        </CardHeader>



                        <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">

                          <div className="rounded-xl bg-transparent text-foreground flex flex-col min-h-0 flex-1 overflow-hidden border-transparent shadow-none">

                            {step5EmailTab === "preview" && mailHtmlText ? (
                              <div className="overflow-auto p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white text-slate-850 dark:bg-slate-900/90 dark:text-slate-100 min-h-[160px] max-h-[360px] shadow-inner select-text">
                                <div dangerouslySetInnerHTML={{ __html: mailHtmlText }} />
                              </div>
                            ) : (
                              <SOQLHighlighter query={mailTemplateText || "// Email template output will appear here after defining your custom algorithm"} className="overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 min-h-[160px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100" />
                            )}

                          </div>

                        </CardContent>



                      </Card>



                    </motion.div>







                    <motion.div variants={cardItemVariants} className="h-full flex flex-col">



                      <Card className="overflow-hidden rounded-3xl border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl h-full flex flex-col transition-all duration-300 group relative">



                          {/* WATERMARK */}



                          <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                            <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">



                              FOR POST



                            </span>



                          </div>



                          <CardHeader className="pb-4 bg-transparent p-6 relative z-10">



                          <div className="flex flex-wrap items-center justify-between gap-3 mt-6 md:mt-7 w-full">



                            <div className="flex items-center gap-3 min-w-0">



                              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground whitespace-nowrap">Post Template Output</CardTitle>



                            </div>



                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-bold border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                                onClick={handleDownloadStep5Excel}
                                disabled={totalStep5Excluded === 0}
                                title="Download Multi-Sheet Excluded Tickets Excel (.xlsx) for Teams Post"
                              >
                                <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Sheet (.xlsx)</span>
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-primary/10 hover:text-primary transition-all border-border/80 dark:border-white/[0.08] bg-card/80 dark:bg-[#06070a]/80 rounded-lg shadow-sm cursor-pointer whitespace-nowrap shrink-0" onClick={() => handleCopy(postTemplateText, postHtmlText)} disabled={!postTemplateText}>



                                <Copy className="h-3.5 w-3.5" /> Copy



                              </Button>
                            </div>



                          </div>



                        </CardHeader>



                        <CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10">



                          <div className="rounded-xl bg-transparent text-foreground flex flex-col min-h-0 flex-1 overflow-hidden border-transparent shadow-none">



                      <SOQLHighlighter query={postTemplateText || "// Post template output will appear here after defining your custom algorithm"} className="overflow-auto whitespace-pre-wrap break-words p-0 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 min-h-[160px] max-h-[320px] selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-100" />



                          </div>



                        </CardContent>



                      </Card>



                    </motion.div>



                  </>



                );



              })()}







              {cancellationUpdateDebug && (



                <motion.div variants={cardItemVariants} className="h-full flex flex-col xl:col-span-2">



                  <Card className="overflow-hidden rounded-3xl border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl h-full flex flex-col transition-all duration-300 group relative">



                    <CardHeader className="pb-4 bg-transparent p-6 relative z-10">



                      <div className="flex flex-wrap items-center justify-between gap-3">



                        <div className="flex items-center gap-3 min-w-0">



                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-500/10 text-muted-foreground shadow-inner">



                            <Filter className="h-5 w-5" />



                          </div>



                          <CardTitle className="text-base font-black tracking-tight text-foreground">Cancellation Execution Summary</CardTitle>



                        </div>



                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-surface-elevated transition-all border-border/80 dark:border-white/[0.08] bg-card/80 dark:bg-[#06070a]/80 rounded-lg shadow-sm shrink-0 whitespace-nowrap" onClick={() => handleCopy(cancellationUpdateDebug)}>



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



                </motion.div>



              )}



                            </>
              )}



            </motion.div>



          )}







          {isCaseAssign && (



            <motion.div



              key="right-col-case-assign"



              variants={cardContainerVariants}



              initial="hidden"



              animate="visible"



              exit="exit"



              className="space-y-6 w-full flex flex-col h-full min-h-0"



            >



              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch w-full flex-1 min-h-0">



                {/* === COLUMN 1: WORKBENCH === */}



              <div className="space-y-4 flex flex-col h-full min-h-0">



                {/* Assignment Mode & Quick Execute Control Box */}



                <motion.div variants={cardItemVariants}>



                  <Card className="overflow-hidden rounded-3xl border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col transition-all duration-300 relative group">



                                    {/* Massive Watermark Step 2 */}



                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                    <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">



                      STEP 2



                    </span>



                  </div>







                  <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">



                    <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-5 md:mt-6">



                      <div className="flex flex-col gap-1 w-full relative">



                        <div className="flex flex-wrap items-start justify-between gap-2 w-full">



                          <CardTitle className="text-lg xl:text-xl font-black tracking-tight leading-tight text-foreground">



                            Assignment Mode &amp; Execution



                          </CardTitle>



                          <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20 shadow-sm shrink-0 whitespace-nowrap">Randomized</span>



                        </div>



                        <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">



                          <span>{caseAssignmentRows.length} valid IDs</span>



                          <span className="h-1 w-1 rounded-full bg-border/80 dark:bg-white/[0.1]" />



                          <span>Open status</span>



                          <span className="h-1 w-1 rounded-full bg-border/80 dark:bg-white/[0.1]" />



                          <span className={caseOwnerLoadState === "error" ? "text-rose-500" : ""}>



                            {caseOwnerLoadState === "loading" ? "Roster syncing" : caseOwnerLoadState === "error" ? "Roster offline" : activeCaseOwners.length + " active owners"}



                          </span>



                        </div>



                      </div>



                    </div>



                  </CardHeader>



                    <CardContent className="p-5 space-y-4 relative z-10">



                      <div className="grid grid-cols-3 gap-2 bg-muted/60 dark:bg-[#06070a] p-1.5 rounded-xl border border-border/70 dark:border-white/[0.08] shadow-inner">



                        <Button size="sm" variant={caseAssignMode === "equal" ? "primary" : "ghost"} onClick={() => setCaseAssignMode("equal")} className={cn("text-xs h-9 font-bold rounded-lg transition-all", caseAssignMode === "equal" ? "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20" : "text-muted-foreground hover:text-purple-600")}>



                          Equally



                        </Button>



                        <Button size="sm" variant={caseAssignMode === "owner-wise" ? "primary" : "ghost"} onClick={() => setCaseAssignMode("owner-wise")} className={cn("text-xs h-9 font-bold rounded-lg transition-all", caseAssignMode === "owner-wise" ? "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20" : "text-muted-foreground hover:text-purple-600")}>



                          Owner Wise



                        </Button>



                        <Button size="sm" variant={caseAssignMode === "quantity-wise" ? "primary" : "ghost"} onClick={() => setCaseAssignMode("quantity-wise")} className={cn("text-xs h-9 font-bold rounded-lg transition-all", caseAssignMode === "quantity-wise" ? "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20" : "text-muted-foreground hover:text-purple-600")}>



                          Qty Wise



                        </Button>



                      </div>







                      {/* Mode Specific Compact Configurations */}



                      {caseAssignMode === "equal" && (



                        <div className="p-4 rounded-2xl bg-surface-recessed/60 dark:bg-[#06070a] border border-border/70 dark:border-white/[0.08] text-xs font-semibold text-muted-foreground flex items-start gap-3 shadow-inner">



                          <CheckCircle2 className="h-4.5 w-4.5 text-purple-500 shrink-0 mt-0.5" />



                          <span className="leading-relaxed">



                            Prioritizes oldest cases first based on opened date, then gives every active owner exactly {activeCaseOwners.length ? Math.floor(caseAssignmentRows.length / activeCaseOwners.length) : 0} case{activeCaseOwners.length && Math.floor(caseAssignmentRows.length / activeCaseOwners.length) === 1 ? "" : "s"}. {activeCaseOwners.length ? caseAssignmentRows.length % activeCaseOwners.length : caseAssignmentRows.length} remainder case{(activeCaseOwners.length ? caseAssignmentRows.length % activeCaseOwners.length : caseAssignmentRows.length) === 1 ? " is" : "s are"} left unassigned.



                          </span>



                        </div>



                      )}







                      {caseAssignMode === "owner-wise" && (



                        <div className="p-4 rounded-2xl bg-surface-recessed/60 dark:bg-[#06070a] border border-border/70 dark:border-white/[0.08] space-y-3 shadow-inner">



                          <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">



                            <span>Target Owners</span>



                            <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md">{selectedOwnerIds.length} selected</span>



                          </div>



                          <p className="text-[11px] leading-relaxed font-medium text-muted-foreground">



                            Selected owners receive an equal whole-number share. Any remainders are distributed 1-by-1 to ensure no cases are unassigned.



                          </p>



                          <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1">



                            {activeCaseOwners.map((owner) => {



                              const checked = selectedOwnerIds.includes(owner.ownerId);



                              return (



                                <label key={owner.id} className={cn("flex items-center gap-2.5 rounded-xl border p-2 cursor-pointer transition-all", checked ? "bg-purple-500/10 border-purple-500/30 shadow-sm" : "bg-card dark:bg-[#0b0c10] border-border/70 dark:border-white/[0.08] hover:border-purple-500/30")}>



                                  <input



                                    type="checkbox"



                                    checked={checked}



                                    onChange={(event) => {



                                      setSelectedOwnerIds((prev) => {



                                        if (event.target.checked) return [...prev, owner.ownerId];



                                        return prev.filter((id) => id !== owner.ownerId);



                                      });



                                    }}



                                    className="rounded text-purple-600 focus:ring-purple-500"



                                  />



                                  <span className={cn("text-xs font-bold truncate", checked ? "text-purple-700 dark:text-purple-300" : "text-foreground")}>{owner.name}</span>



                                </label>



                              );



                            })}



                          </div>



                        </div>



                      )}







                      {caseAssignMode === "quantity-wise" && (



                        <div className="p-4 rounded-2xl bg-surface-recessed/60 dark:bg-[#06070a] border border-border/70 dark:border-white/[0.08] space-y-3 shadow-inner">



                          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">



                            <span>Set Quantities</span>



                            <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md">Total: {quantitySelectedTotal} / {caseAssignmentRows.length}</span>



                          </div>



                          <p className="text-[11px] leading-relaxed font-medium text-muted-foreground">



                            Set any whole-number quantity per owner. Older cases are assigned first; any unallocated new IDs remain unassigned.



                          </p>



                          <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto pr-1">



                            {quantityOwnerConfigs.map((owner, index) => (



                              <div key={owner.id} className={cn("flex items-center justify-between gap-3 rounded-xl border p-2 transition-all", owner.selected ? "bg-purple-500/10 border-purple-500/30 shadow-sm" : "bg-card dark:bg-[#0b0c10] border-border/70 dark:border-white/[0.08]")}>



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



                                    className="rounded text-purple-600 focus:ring-purple-500"



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



                                  className="w-16 h-7 rounded-lg border border-border/70 dark:border-white/[0.08] bg-card dark:bg-[#06070a] px-2 text-xs text-center font-mono font-bold disabled:opacity-40 outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 shadow-inner text-foreground"



                                />



                              </div>



                            ))}



                          </div>



                        </div>



                      )}







                      {/* Quick Execution Action Bar */}



                      <div className="pt-4 flex items-center justify-between gap-3 flex-wrap">



                        <div className="flex items-center gap-3 flex-[2] min-w-[280px]">



                          <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs gap-2 h-10 px-4 sm:px-5 flex-1 whitespace-nowrap shadow-md shadow-purple-500/20 rounded-xl transition-all hover:-translate-y-0.5" onClick={handleRunCaseAssignment}>



                            <CheckCircle2 className="h-4.5 w-4.5" /> Generate Assignment



                          </Button>



                          <Button size="sm" className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs gap-2 h-10 px-4 sm:px-5 shadow-md shadow-rose-500/20 rounded-xl transition-all hover:-translate-y-0.5" onClick={handleRevertAssignment}>



                            <RotateCcw className="h-4.5 w-4.5" /> Revert



                          </Button>



                        </div>



                        <div className="flex items-center gap-3 ml-auto">



                          <Button variant="outline" size="sm" className="h-10 px-3 sm:px-4 text-xs gap-2 font-bold rounded-xl border-border/80 dark:border-white/[0.08] bg-card/80 dark:bg-[#06070a]/80 hover:bg-surface-elevated shadow-sm" onClick={() => handleCopy(caseAssignOutput)} disabled={!caseAssignOutput} title="Copy result">



                            <Copy className="h-4 w-4 text-muted-foreground" /> <span className="hidden sm:inline">Copy</span>



                          </Button>



                          <Button variant="outline" size="sm" className="h-10 px-3 sm:px-4 text-xs gap-2 font-bold rounded-xl border-border/80 dark:border-white/[0.08] bg-card/80 dark:bg-[#06070a]/80 hover:bg-surface-elevated shadow-sm" onClick={handleDownloadCaseAssignment} disabled={!caseAssignOutput} title="Download CSV">



                            <Download className="h-4 w-4 text-muted-foreground" /> <span className="hidden sm:inline">CSV</span>



                          </Button>



                        </div>



                      </div>



                    </CardContent>



                  </Card>



                </motion.div>







                {/* 2. Paste Manually (Case Assign Mode) */}



                <motion.div variants={cardItemVariants} className="flex flex-col flex-1 min-h-0">



                  <Card className="overflow-hidden rounded-3xl border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col flex-1 min-h-0 transition-all duration-300 relative group">



                    {/* Massive Watermark */}



                    <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                      <span className="text-[25px] md:text-[35px] lg:text-[45px] leading-[0.9] font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent flex flex-col">



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



                          className="flex-1 font-mono text-xs leading-relaxed rounded-2xl border border-border/70 dark:border-white/[0.08] bg-surface-recessed/60 dark:bg-[#06070a] p-4 resize-none min-h-[100px] text-foreground"



                          value={ticketsInput}



                          onChange={(event) => {



                            setTicketsInput(event.target.value);



                            setGeneratedAtLeastOnce(false);



                          }}



                        />



                        <p className="border-l-2 border-primary/50 py-1 pl-3 text-[11px] font-medium leading-relaxed text-muted-foreground">



                          Paste raw text, spreadsheet rows, or CSV. Only valid 15- or 18-character Case IDs beginning with 500 are extracted.



                        </p>



                      </div>



                      



                      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60 dark:border-white/[0.08]">



                        <span className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">



                          {parsedCaseIds.length === 0 ? "No case ids" : `${parsedCaseIds.length} case id${parsedCaseIds.length === 1 ? "" : "s"}`}



                        </span>



                        <span className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">



                          Open by default



                        </span>



                        <div className="flex-1" />



                        <Button variant="outline" size="sm" className="gap-2 h-10 px-4 rounded-xl text-xs hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all font-bold border-border/80 dark:border-white/[0.08] bg-card/80 dark:bg-[#06070a]/80" onClick={handleClear}>



                          <Trash2 className="h-4 w-4" /> Clear



                        </Button>



                      </div>



                    </CardContent>



                  </Card>



                </motion.div>



              </div>







              {/* === COLUMN 2: RESULTS === */}



              <div className="space-y-4 flex flex-col h-full min-h-0">



                {/* 1. Assignment Output Box */}



                <motion.div variants={cardItemVariants} className="shrink-0">



                  <Card className="overflow-hidden rounded-3xl border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col transition-all duration-300 relative group shrink-0">



                                    {/* Massive Watermark Step 3 */}



                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                    <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">



                      STEP 3



                    </span>



                  </div>







                  <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">



                    <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-5 md:mt-6">



                      <div className="flex flex-col gap-1 w-full relative">



                        <div className="flex flex-wrap items-start justify-between gap-3 w-full">



                          <CardTitle className="text-lg xl:text-xl font-black tracking-tight leading-tight text-foreground">



                            Final Assignment Output



                          </CardTitle>



                          <div className="flex flex-wrap items-center gap-2 shrink-0">



                            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-border/80 dark:border-white/[0.08] bg-card/80 dark:bg-[#06070a]/80 rounded-lg shadow-sm whitespace-nowrap shrink-0" onClick={() => handleCopy(caseAssignOutput)} disabled={!caseAssignOutput}>



                              <Copy className="h-3.5 w-3.5" /> Copy



                            </Button>



                            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-border/80 dark:border-white/[0.08] bg-card/80 dark:bg-[#06070a]/80 rounded-lg shadow-sm whitespace-nowrap shrink-0" onClick={handleDownloadCaseAssignment} disabled={!caseAssignOutput}>



                              <Download className="h-3.5 w-3.5" /> CSV



                            </Button>



                          </div>



                        </div>



                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">



                          Ready for Data Loader



                        </p>



                        {caseAssignmentResult && (



                          <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">



                              <span>{caseAssignmentResult.assignedCount} assigned</span>



                              <span className="h-1 w-1 rounded-full bg-border/80 dark:bg-white/[0.1]" />



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



              </motion.div>







            {/* === COLUMN 3: ROSTER === */}



              {/* Owner Roster Box */}



              <motion.div variants={cardItemVariants} className="flex flex-col flex-1 min-h-0">



                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/20 shadow-none backdrop-blur-xl dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)] flex flex-col transition-all duration-300 relative group flex-1 min-h-0">



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



                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 bg-muted/60 dark:bg-[#06070a] p-1 rounded-xl border border-border/70 dark:border-white/[0.08] shadow-inner shrink-0">



                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 gap-0 font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" onClick={refreshCaseOwners} disabled={caseOwnerAction !== null} title="Refresh DB">



                          <RotateCcw className="h-3.5 w-3.5" />



                        </Button>



                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 gap-0 font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" onClick={handleExportOwners} title="Export JSON">



                          <Download className="h-3.5 w-3.5" />



                        </Button>



                        <label className="inline-flex cursor-pointer group">



                          <input type="file" accept="application/json" className="hidden" onChange={handleImportOwners} disabled={caseOwnerAction !== null} />



                          <span className="flex items-center justify-center h-7 w-7 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 rounded-lg transition-colors" title="Import JSON">



                            <Upload className="h-3.5 w-3.5" />



                          </span>



                        </label>



                        <div className="h-4 w-px bg-border/80 dark:bg-white/[0.1] mx-0.5" />



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



                          className="w-full h-10 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card dark:bg-[#06070a] px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-inner transition-all text-foreground"



                        />



                        <input



                          type="text"



                          placeholder="005Ny00000..."



                          value={ownerForm.ownerId}



                          onChange={(event) => setOwnerForm((prev) => ({ ...prev, ownerId: event.target.value }))}



                          disabled={caseOwnerAction !== null}



                          className="w-full h-10 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card dark:bg-[#06070a] px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-inner transition-all text-foreground"



                        />



                        <Button size="sm" className="h-10 px-4 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md shadow-primary/20 transition-all" onClick={handleAddOrUpdateOwner} disabled={caseOwnerAction !== null}>



                          {editingOwnerRecordId ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}



                          {editingOwnerRecordId ? "Save" : "Add"}



                        </Button>



                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 rounded-xl border-border/80 dark:border-white/[0.08] transition-all shadow-sm" onClick={clearCaseOwnerForm} disabled={caseOwnerAction !== null} title="Clear inputs">



                          <Trash2 className="h-4 w-4" />



                        </Button>



                      </div>







                      {/* Scrollable High-Density Roster Panel */}



                      <div className="flex-1 relative min-h-[200px] w-full">



                        <div className="absolute inset-0 overflow-y-auto no-scrollbar space-y-2 pr-1 pb-4">



                        {caseOwnerLoadState === "loading" && (



                          <div className="p-8 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border/70 dark:border-white/[0.08] rounded-2xl bg-surface-recessed/40 dark:bg-white/[0.02]">



                            <RotateCcw className="h-6 w-6 animate-spin mb-3 text-primary" />



                            <span className="text-xs font-black uppercase tracking-widest">Syncing roster...</span>



                          </div>



                        )}



                        {caseOwnerLoadState !== "loading" && caseOwners.length === 0 && (



                          <div className="p-8 text-center border border-dashed border-border/70 dark:border-white/[0.08] rounded-2xl bg-surface-recessed/40 dark:bg-white/[0.02]">



                            <Users className="h-8 w-8 mx-auto text-muted-foreground/60 mb-3" />



                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No employees saved</p>



                          </div>



                        )}



                        {caseOwners.map((owner) => (



                          <div key={owner.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card/60 dark:bg-[#0b0c10]/60 hover:bg-card dark:hover:bg-[#12141a] hover:border-primary/30 hover:shadow-md transition-all group shadow-inner">



                            <div className="flex items-center gap-3 min-w-0 flex-1">



                              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shadow-inner", owner.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted dark:bg-[#06070a] text-muted-foreground")}>



                                <span className={cn("h-2 w-2 rounded-full", owner.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/50")} />



                              </div>



                              <div className="flex flex-col">



                                <span className="text-xs font-black text-foreground whitespace-normal break-words">{owner.name}</span>



                                <span className="text-[10px] font-mono text-muted-foreground break-all">{owner.ownerId}</span>



                              </div>



                            </div>



                            <div className="flex items-center gap-1.5 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">



                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" onClick={() => handleEditOwner(owner)} title="Edit Employee"><Pencil className="h-4 w-4" /></Button>



                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted dark:hover:bg-white/10 rounded-lg transition-colors" onClick={() => handleToggleOwnerStatus(owner.id)} title={owner.isActive ? "Disable Employee" : "Enable Employee"}><Power className={cn("h-4 w-4", owner.isActive ? "text-emerald-500" : "text-amber-500")} /></Button>



                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors" onClick={() => handleDeleteOwner(owner.id)} title="Delete Employee"><UserMinus className="h-4 w-4" /></Button>



                            </div>



                          </div>



                        ))}



                      </div>



                      </div>



                    </CardContent>



                  </Card>



                </motion.div>



              </div>



            </div>







            {/* Round Robin UI Cards (Only shown after generation) */}



            {caseAssignmentResult && (caseAssignMode === "equal" || caseAssignMode === "owner-wise") && (



              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 items-start w-full">



                <motion.div variants={cardItemVariants}>



                  <Card className="overflow-hidden rounded-3xl border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col transition-all duration-300 relative group">



                    <CardHeader className="pb-4 bg-transparent p-5 relative z-10">



                      <div className="flex items-center gap-3">



                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-inner">



                          <RefreshCw className="h-4.5 w-4.5" />



                        </div>



                        <div>



                          <CardTitle className="text-sm font-black tracking-tight text-foreground">Round Robin Status</CardTitle>



                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Current Batch</p>



                        </div>



                      </div>



                    </CardHeader>



                    <CardContent className="p-5 space-y-4 relative z-10 text-xs">



                      <div className="grid grid-cols-2 gap-2">



                        <div className="bg-muted/50 dark:bg-white/[0.03] border border-border/50 dark:border-white/[0.06] p-2 rounded-lg">



                          <span className="text-[10px] uppercase font-bold text-muted-foreground">{caseAssignMode === "owner-wise" ? "Selected Owners" : "Active Owners"}</span>



                          <div className="font-black text-sm text-foreground">{caseAssignMode === "owner-wise" ? selectedOwnerObjects.length : activeCaseOwners.length}</div>



                        </div>



                        <div className="bg-muted/50 dark:bg-white/[0.03] border border-border/50 dark:border-white/[0.06] p-2 rounded-lg">



                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Base Cases / Owner</span>



                          <div className="font-black text-sm text-foreground">{caseAssignmentResult.casesPerOwner}</div>



                        </div>



                        <div className="bg-muted/50 dark:bg-white/[0.03] border border-border/50 dark:border-white/[0.06] p-2 rounded-lg">



                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Extra Cases</span>



                          <div className="font-black text-sm text-foreground">{caseAssignmentResult.remainder}</div>



                        </div>



                        <div className="bg-muted/50 dark:bg-white/[0.03] border border-border/50 dark:border-white/[0.06] p-2 rounded-lg">



                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Assigned</span>



                          <div className="font-black text-sm text-foreground">{caseAssignmentResult.assignedCount}</div>



                        </div>



                      </div>



                      <div className="space-y-1">



                        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground border-b border-border/60 dark:border-white/[0.08] pb-1">



                          <span>Starting Owner</span>



                          <span className="text-foreground font-black">{caseAssignmentResult.startOwner?.name}</span>



                        </div>



                        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground border-b border-border/60 dark:border-white/[0.08] pb-1">



                          <span>Next Start</span>



                          <span className="text-foreground font-black">{caseAssignmentResult.nextStartOwner?.name}</span>



                        </div>



                        {caseAssignmentResult.extraOwners && caseAssignmentResult.extraOwners.length > 0 && (



                          <div className="pt-2">



                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Extra Case Owners:</span>



                            <div className="flex flex-wrap gap-1 mt-1 text-[10px] font-black text-muted-foreground">



                                {caseAssignmentResult.extraOwners.map(o => o.name).join(', ')}



                              </div>



                          </div>



                        )}



                      </div>



                    </CardContent>



                  </Card>



                </motion.div>







                <motion.div variants={cardItemVariants}>



                  <Card className="overflow-hidden rounded-3xl border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col transition-all duration-300 relative group">



                    <CardHeader className="pb-4 bg-transparent p-5 relative z-10">



                      <div className="flex items-center gap-3">



                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">



                          <History className="h-4.5 w-4.5" />



                        </div>



                        <div>



                          <CardTitle className="text-sm font-black tracking-tight text-foreground">Round Robin History</CardTitle>



                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Recent Batches</p>



                        </div>



                      </div>



                    </CardHeader>



                    <CardContent className="p-0 relative z-10 text-xs">



                      <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-3 px-5 pb-5">



                        {roundRobinHistory.length === 0 && <div className="text-muted-foreground text-center py-4 text-[10px] font-bold uppercase tracking-widest">No history yet</div>}



                        {roundRobinHistory.map((entry, idx) => (



                          <div key={idx} className="border-b border-border/60 dark:border-white/[0.06] pb-3 last:border-0 last:pb-0">



                            <div className="flex justify-between items-center mb-1">



                              <span className="font-black text-foreground">Batch #{entry.batchId}</span>



                              <span className="text-[10px] font-bold text-muted-foreground">{entry.totalCases} cases</span>



                            </div>



                            <div className="text-[10px] space-y-1">



                              <div className="flex gap-2">



                                <span className="font-bold text-muted-foreground uppercase w-10">Extra:</span>



                                <span className="text-foreground truncate flex-1">{entry.extraOwners.map(o => o.name).join(", ") || "None"}</span>



                              </div>



                              <div className="flex gap-2">



                                <span className="font-bold text-muted-foreground uppercase w-10">Next:</span>



                                <span className="text-foreground font-medium">{entry.nextStartOwner?.name || "N/A"}</span>



                              </div>



                            </div>



                          </div>



                        ))}



                      </div>



                    </CardContent>



                  </Card>



                </motion.div>







                <motion.div variants={cardItemVariants}>



                  <Card className="overflow-hidden rounded-3xl border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col transition-all duration-300 relative group">



                    <CardHeader className="pb-4 bg-transparent p-5 relative z-10">



                      <div className="flex items-center gap-3">



                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">



                          <BarChart3 className="h-4.5 w-4.5" />



                        </div>



                        <div>



                          <CardTitle className="text-sm font-black tracking-tight text-foreground">Cumulative Load</CardTitle>



                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Fairness Tracker</p>



                        </div>



                      </div>



                    </CardHeader>



                    <CardContent className="p-0 relative z-10 text-xs">



                      <div className="px-5 pb-2 grid grid-cols-2 gap-2 border-b border-border/60 dark:border-white/[0.06] mb-2">



                        {(() => {



                          const loads = activeCaseOwners.map(o => (cumulativeLoad[o.ownerId] || { total: 0 }).total);



                          const max = loads.length ? Math.max(...loads) : 0;



                          const min = loads.length ? Math.min(...loads) : 0;



                          const diff = max - min;



                          return (



                            <>



                              <div className="text-[10px] uppercase font-bold text-muted-foreground text-center bg-muted/50 dark:bg-white/[0.03] border border-border/50 dark:border-white/[0.06] rounded-lg p-1.5"><span className="block text-muted-foreground/60 text-[8px]">Spread</span>{diff} cases</div>



                              <div className="text-[10px] uppercase font-bold text-muted-foreground text-center bg-muted/50 dark:bg-white/[0.03] border border-border/50 dark:border-white/[0.06] rounded-lg p-1.5"><span className="block text-muted-foreground/60 text-[8px]">Max Load</span>{max} cases</div>



                            </>



                          );



                        })()}



                      </div>



                      <div className="max-h-[170px] overflow-y-auto no-scrollbar px-5 pb-5">



                        <table className="w-full text-left">



                          <thead>



                            <tr className="text-[9px] font-black uppercase text-muted-foreground border-b border-border/60 dark:border-white/[0.08]">



                              <th className="pb-1.5">Owner</th>



                              <th className="pb-1.5 text-right">Total</th>



                              <th className="pb-1.5 text-right">Extra</th>



                            </tr>



                          </thead>



                          <tbody className="divide-y divide-border/60 dark:divide-white/[0.06]">



                            {activeCaseOwners.map(owner => {



                              const load = cumulativeLoad[owner.ownerId] || { total: 0, extra: 0 };



                              return (



                                <tr key={owner.id} className="text-[11px] group">



                                  <td className="py-1.5 font-medium truncate max-w-[100px] text-foreground/90 group-hover:text-foreground">{owner.name}</td>



                                  <td className="py-1.5 text-right font-black tabular-nums text-foreground">{load.total}</td>



                                  <td className="py-1.5 text-right font-mono text-[10px] text-muted-foreground">{load.extra}</td>



                                </tr>



                              );



                            })}



                          </tbody>



                        </table>



                      </div>



                    </CardContent>



                  </Card>



                </motion.div>



                



                <motion.div variants={cardItemVariants}>



                  <Card className="flex flex-col flex-1 min-h-[320px] h-[350px] 2xl:h-full rounded-3xl border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl overflow-hidden relative group transition-all duration-300">



                    <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">



                      <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">



                        DEBUG



                      </span>



                    </div>



                    <CardHeader className="pb-4 bg-transparent p-6 relative z-10">



                      <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground flex-1 flex flex-wrap items-center justify-between gap-2">



                        <span>Processing Status</span>



                        <div className="flex flex-wrap gap-2 text-xs shrink-0">



                          <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-md whitespace-nowrap">



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



                </motion.div>



              </div>



            )}



            



              </motion.div>



            )}











            {!isTS && !isSA && !isAssetTransfer && !isChildDetailsToParent && !isCancellation && !isCaseAssign && (



              <motion.div



                key={`right-col-default-${selectedTemplate}`}



                variants={cardContainerVariants}



                initial="hidden"



                animate="visible"



                exit="exit"



                className="w-full"



              >



                <motion.div variants={cardItemVariants} className="w-full">



                  <QueryPreviewCard



                    title={activeTemplate?.name ?? "Query Preview"}



                    subtitle={`${activeTemplate?.category ?? ""} query preview`}



                    batches={otherPreview}



                    batchIndex={otherBatchIndex}



                    setBatchIndex={setOtherBatchIndex}



                    onCopy={handleCopy}



                  />



                </motion.div>



              </motion.div>



            )}



          </AnimatePresence>



        </div>



      </div>







      <DiscrepancyAuditDiffModal



        isOpen={showDiscrepancyModal}



        onClose={() => setShowDiscrepancyModal(false)}



        items={discrepancyDiffItems}



        missingTickets={cancellationMissingTickets}



        onCopyMissing={handleCopyMissingTickets}



        onAuditQuery={handleGenerateMissingAuditQuery}



      />

      <AccountCheckHandoverModal
        isOpen={showAccountCheckHandoverModal}
        onClose={() => setShowAccountCheckHandoverModal(false)}
        result={accountCheckResult}
      />

      <CancellationHandoverModal
        isOpen={showCancellationHandoverModal}
        onClose={() => setShowCancellationHandoverModal(false)}
        type={cancellationType === "NAMO" ? "NAMO" : cancellationType === "NON NAMO" ? "NON NAMO" : "CCO"}
        namoResult={namoAlgo2Result}
        nonNamoResult={nonNamoAlgo3Result}
        ccoResult={ccoAlgoResult}
      />



    </div>



  );



}



