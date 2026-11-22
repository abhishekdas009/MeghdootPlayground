import { BLUE_STAR_LOGO_BASE64 } from "./branding";

/**
 * Standard corporate email header with greeting on the left and Blue Star logo
 * aligned to the top-right on the exact same horizontal level.
 * Uses 100% table layout for complete cross-client compatibility (Outlook Word engine, Gmail, Apple Mail, Webmail).
 */
export function renderEmailHeader(greetingText: string = "Dear Team,"): string {
  return `<table style="width: 100%; max-width: 650px; border-collapse: collapse; border: 0; margin-bottom: 14px;" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="vertical-align: middle; text-align: left; padding: 0;" align="left">
        <p style="margin: 0; font-family: Calibri, Arial, sans-serif; font-size: 14px; font-weight: bold; color: inherit;">${greetingText}</p>
      </td>
      <td style="vertical-align: middle; text-align: right; padding: 0;" align="right">
        <img src="${BLUE_STAR_LOGO_BASE64}" alt="Blue Star" style="height: 34px; width: auto; max-width: 180px; display: inline-block; vertical-align: middle;" border="0" />
      </td>
    </tr>
  </table>`;
}

/**
 * ALGO 1 – Ticket Classification, CCO Cancellation Filtering & Approval Logic
 *
 * Centralized ticket classification and filtering for all pasted ticket numbers.
 * Identifies ticket types based on starting character, restricts CCO cancellation to
 * eligible tickets (B, S, C, D, X, I), excludes Auto PMS (A) tickets from CCO cancellation
 * while retaining all tickets in the master collection (ALL_TICKETS), and generates
 * department-based approval segments for Auto PMS tickets.
 */

export type TicketType =
  | "Breakdown" // B
  | "Service" // S
  | "Commissioning" // C
  | "Auto PMS" // A
  | "Demo" // D
  | "Stock Defective" // X
  | "Installation" // I
  | "Other";

export interface ClassifiedTicket {
  ticket: string;
  prefix: string;
  type: TicketType;
  isEligibleForCCO: boolean;
  departmentCode?: string;
  approvalsRequired: ("Suraj Sir" | "Vishal Sir")[];
}

export interface TicketClassificationResult {
  allTickets: string[]; // Master collection (retains ALL tickets including A)
  ccoCancellationTickets: string[]; // Eligible for CCO cancellation (B, C, S, D, X, I, and other non-A)
  autoPmsTickets: string[]; // Auto PMS tickets (A)
  classifiedItems: ClassifiedTicket[];
  typeCounts: Record<TicketType, number>;
  ucpgTickets: { ticket: string; isBlankDept: boolean; deptCode?: string }[];
  cpsdTickets: { ticket: string; isBlankDept: boolean; deptCode?: string }[];
  blankDeptTickets: string[];
  approvalSegmentText: string;
}

export const UCPG_DEPARTMENT_CODES = ["52", "43", "58"];

/**
 * Identify ticket type based on first character
 */
export function classifyTicketPrefix(ticket: string): { prefix: string; type: TicketType; isEligibleForCCO: boolean } {
  const clean = ticket.trim().toUpperCase();
  const prefix = clean.charAt(0);

  switch (prefix) {
    case "B":
      return { prefix: "B", type: "Breakdown", isEligibleForCCO: true };
    case "S":
      return { prefix: "S", type: "Service", isEligibleForCCO: true };
    case "C":
      return { prefix: "C", type: "Commissioning", isEligibleForCCO: true };
    case "A":
      return { prefix: "A", type: "Auto PMS", isEligibleForCCO: false };
    case "D":
      return { prefix: "D", type: "Demo", isEligibleForCCO: true };
    case "X":
      return { prefix: "X", type: "Stock Defective", isEligibleForCCO: true };
    case "I":
      return { prefix: "I", type: "Installation", isEligibleForCCO: true };
    default:
      return { prefix: prefix || "?", type: "Other", isEligibleForCCO: prefix !== "A" };
  }
}

/**
 * Determine approval requirement for Auto PMS tickets based on department code.
 * - UCPG (52, 43, 58) -> Suraj Sir
 * - All other departments (CPSD) -> Vishal Sir
 * - Blank / Null / Unavailable -> Both Suraj Sir and Vishal Sir
 */
export function getAutoPMSApproval(departmentCode?: string | null): ("Suraj Sir" | "Vishal Sir")[] {
  if (
    departmentCode === null ||
    departmentCode === undefined ||
    String(departmentCode).trim() === ""
  ) {
    return ["Suraj Sir", "Vishal Sir"];
  }

  const deptTrimmed = String(departmentCode).trim().toUpperCase();
  if (UCPG_DEPARTMENT_CODES.includes(deptTrimmed) || deptTrimmed === "UCPG") {
    return ["Suraj Sir"];
  }

  return ["Vishal Sir"];
}

/**
 * Detects if a string or error message contains Salesforce ENTITY_IS_LOCKED error.
 * e.g. "ENTITY_IS_LOCKED: This record is locked. If you need to edit it, contact your admin. []"
 */
export function isEntityLockedError(val?: string | null): boolean {
  if (!val) return false;
  const lower = String(val).toLowerCase();
  return (
    lower.includes("entity_is_locked") ||
    lower.includes("this record is locked") ||
    lower.includes("record is locked") ||
    lower.includes("record locked") ||
    lower.includes("approval pending") ||
    lower.includes("approval sent") ||
    lower.includes("approval send") ||
    lower.includes("approval_sent") ||
    lower.includes("approval_send") ||
    lower.includes("is_approval_sent") ||
    lower.includes("is_approval_send")
  );
}

/**
 * Clean a ticket token (remove quotes, brackets, spaces, uppercase)
 */
export function cleanTicketToken(token?: string | null): string {
  if (!token) return "";
  if (isEntityLockedError(token)) return "";
  return String(token)
    .replace(/[\u200B-\u200D\uFEFF\u00A0\s]+/g, "")
    .replace(/^['"“‘\[\(<]+|['"”’\]\)>;,.]+$/g, "")
    .trim()
    .toUpperCase();
}

/**
 * Extracts tickets and optional inline department codes from raw input text or tokens.
 * Handles:
 * "A123456 52"
 * "A123456, 52"
 * "A123456\t52"
 * "B12345\nA23456"
 */
export function extractTicketsAndDepartments(input: string | string[]): {
  ticket: string;
  deptCode?: string;
}[] {
  const results: { ticket: string; deptCode?: string }[] = [];
  const lines = Array.isArray(input) ? input : input.split(/[\r\n]+/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Split line tokens by tab, comma, or spaces
    const parts = trimmed.split(/[\t, ]+/).filter(Boolean);
    if (parts.length === 0) continue;

    const rawTkt = parts[0];
    if (!rawTkt) continue;
    const cleanTkt = cleanTicketToken(rawTkt);
    if (!cleanTkt) continue;

    let deptCode: string | undefined = undefined;
    if (parts.length > 1 && parts[1]) {
      const candidateDept = parts[1].trim();
      // If it looks like a department code or identifier (numeric or short word)
      if (/^\d{1,5}$/.test(candidateDept) || /^(UCPG|CPSD)$/i.test(candidateDept)) {
        deptCode = candidateDept;
      }
    }

    results.push({ ticket: cleanTkt, deptCode });
  }

  return results;
}

/**
 * Centralized ticket classification and filtering function (ALGO 1)
 *
 * @param input Raw text from textarea or array of ticket tokens
 * @param externalDeptMap Optional explicit Map of ticket to departmentCode
 */
export function processAlgo1TicketClassification(
  input: string | string[],
  externalDeptMap?: Map<string, string>
): TicketClassificationResult {
  const extracted = extractTicketsAndDepartments(input);

  const allTickets: string[] = [];
  const ccoCancellationTickets: string[] = [];
  const autoPmsTickets: string[] = [];
  const classifiedItems: ClassifiedTicket[] = [];

  const typeCounts: Record<TicketType, number> = {
    Breakdown: 0,
    Service: 0,
    Commissioning: 0,
    "Auto PMS": 0,
    Demo: 0,
    "Stock Defective": 0,
    Installation: 0,
    Other: 0,
  };

  const ucpgTickets: { ticket: string; isBlankDept: boolean; deptCode?: string }[] = [];
  const cpsdTickets: { ticket: string; isBlankDept: boolean; deptCode?: string }[] = [];
  const blankDeptTickets: string[] = [];

  const seenTickets = new Set<string>();

  for (const item of extracted) {
    const cleanTkt = item.ticket;
    if (seenTickets.has(cleanTkt)) continue;
    seenTickets.add(cleanTkt);

    // Rule 1 & Rule 6: ALL_TICKETS retains EVERY ticket pasted
    allTickets.push(cleanTkt);

    const { prefix, type, isEligibleForCCO } = classifyTicketPrefix(cleanTkt);
    typeCounts[type] = (typeCounts[type] || 0) + 1;

    // Determine department code: check external dept map first, then inline deptCode
    const deptCode = externalDeptMap?.get(cleanTkt) ?? item.deptCode;
    const isBlankDept = !deptCode || deptCode.trim() === "";

    if (prefix === "A") {
      // Auto PMS Ticket: Excluded from CCO cancellation
      autoPmsTickets.push(cleanTkt);
      const approvals = getAutoPMSApproval(deptCode);

      if (isBlankDept) {
        blankDeptTickets.push(cleanTkt);
        // Important: A blank department ticket must appear under both approval sections
        ucpgTickets.push({ ticket: cleanTkt, isBlankDept: true });
        cpsdTickets.push({ ticket: cleanTkt, isBlankDept: true });
      } else if (UCPG_DEPARTMENT_CODES.includes(deptCode.trim()) || deptCode.trim().toUpperCase() === "UCPG") {
        ucpgTickets.push({ ticket: cleanTkt, isBlankDept: false, deptCode: deptCode.trim() });
      } else {
        cpsdTickets.push({ ticket: cleanTkt, isBlankDept: false, deptCode: deptCode.trim() });
      }

      classifiedItems.push({
        ticket: cleanTkt,
        prefix,
        type,
        isEligibleForCCO: false,
        departmentCode: deptCode,
        approvalsRequired: approvals,
      });
    } else {
      // Rule 3: Send only B, C, S, D, X, I (and other non-A) tickets to CCO cancellation
      ccoCancellationTickets.push(cleanTkt);

      classifiedItems.push({
        ticket: cleanTkt,
        prefix,
        type,
        isEligibleForCCO: isEligibleForCCO,
        departmentCode: deptCode,
        approvalsRequired: [],
      });
    }
  }

  // Generate the formatted approval notice statement
  let approvalSegmentText = "";
  if (autoPmsTickets.length > 0) {
    const lines: string[] = [];
    lines.push("Note: The following Auto PMS ticket(s) cannot be processed for cancellation through the CCO page:");
    lines.push(autoPmsTickets.join(", "));
    lines.push("");
    lines.push("In order to cancel the following Auto PMS tickets, the respective approvals are required:\n");

    if (ucpgTickets.length > 0) {
      lines.push("UCPG – Suraj Sir's Approval");
      for (const item of ucpgTickets) {
        lines.push(`- ${item.ticket}${item.isBlankDept ? " (Department unavailable)" : ` (Dept: ${item.deptCode})`}`);
      }
      lines.push("");
    }

    if (cpsdTickets.length > 0) {
      lines.push("CPSD – Vishal Sir's Approval");
      for (const item of cpsdTickets) {
        lines.push(`- ${item.ticket}${item.isBlankDept ? " (Department unavailable)" : ` (Dept: ${item.deptCode})`}`);
      }
      lines.push("");
    }

    approvalSegmentText = lines.join("\n").trim();
  }

  return {
    allTickets,
    ccoCancellationTickets,
    autoPmsTickets,
    classifiedItems,
    typeCounts,
    ucpgTickets,
    cpsdTickets,
    blankDeptTickets,
    approvalSegmentText,
  };
}

// =============================================================================
// ALGO 2 – NAMO Page Auto PMS Cancellation Filtering & Output Logic
// =============================================================================

export type NamoAccountGroupCategory = "NAMO" | "NON-NAMO" | "UNCLASSIFIED";

export interface NamoTicketItem {
  ticket: string; // Complete ticket number (e.g. A123456)
  id?: string; // Salesforce Id (e.g. 0WONy000008eHgfOAE)
  accountGroupName: string; // Raw or normalized Account Group Name (e.g. "NAMO", "NON NAMO")
  accountGroupCategory: NamoAccountGroupCategory;
  accountName: string; // Account/Customer Name (e.g. "ABC Enterprises")
  isEligibleForCancellation: boolean;
  status?: string;
  fgr?: string;
  isAutoPms: boolean;
  parentWorkOrderId?: string;
  parentTicket?: string;
  isChild?: boolean;
  skipReason?: string;
  isApprovalSent?: boolean;
  isMrCreated?: boolean;
  isLocked?: boolean;
}

export interface NamoAlgo2Result {
  allAutoPmsTickets: string[]; // Collection A: ALL_AUTO_PMS_TICKETS
  namoCancellationTickets: NamoTicketItem[]; // Collection B: NAMO_CANCELLATION_TICKETS (eligible for cancellation)
  nonNamoTickets: NamoTicketItem[]; // Collection C: NON_NAMO_TICKETS (excluded from cancellation - Condition 2)
  parentWorkOrderTickets: NamoTicketItem[]; // Excluded: ParentWorkOrderId is present (Condition 3)
  completedOrCanceledTickets: NamoTicketItem[]; // Excluded: Status is in ('Completed','Canceled') (Condition 3)
  unclassifiedTickets: NamoTicketItem[]; // Blank / Unknown Account Group Type (unverified)
  approvalPendingTickets: NamoTicketItem[]; // Excluded: Approval Pending / Locked in Salesforce
  mrCreatedTickets: NamoTicketItem[]; // Excluded: MR Raised / Material Request Created
  nonAutoPmsTickets: string[]; // Any tickets not starting with A (Condition 1)
  allRecords: NamoTicketItem[];
  allSkippedTickets: NamoTicketItem[]; // Combined list of all excluded/skipped tickets with reasons
  nonNamoMailSegmentText: string;
  nonNamoMailSegmentHtml: string;
  nonNamoPostSegmentText: string;
  nonNamoPostSegmentHtml: string;
  excludedSegmentText: string;
  excludedSegmentHtml: string;
  namoMailOutputText: string;
  namoMailOutputHtml: string;
  namoPostOutputText: string;
  namoPostOutputHtml: string;
}

/**
 * Classify Account Group Type into NAMO, NON-NAMO, or UNCLASSIFIED
 * Rule 2 & 6:
 * - NAMO = Eligible
 * - NON-NAMO = Excluded
 * - Blank / Unknown = Do not process until verified (UNCLASSIFIED)
 */
export function sanitizeAccountName(val?: string | null): string {
  if (!val) return "—";
  const trimmed = String(val).trim();
  const lower = trimmed.toLowerCase();
  if (
    lower === "false" ||
    lower === "true" ||
    lower === "null" ||
    lower === "undefined" ||
    lower === "-" ||
    lower === "—" ||
    lower === "_" ||
    lower === "n/a" ||
    lower === "na" ||
    lower === "[account]" ||
    lower === "account" ||
    SF_ID_REGEX.test(trimmed)
  ) {
    return "—";
  }
  return trimmed;
}

export function classifyNamoAccountGroup(rawGroup?: string | null): {
  category: NamoAccountGroupCategory;
  normalizedGroup: string;
} {
  if (!rawGroup) {
    return { category: "UNCLASSIFIED", normalizedGroup: "Blank / Unknown" };
  }
  const clean = String(rawGroup)
    .replace(/['"\s\u00A0\u200B\uFEFF[\]]+/g, " ")
    .trim();
  if (!clean) {
    return { category: "UNCLASSIFIED", normalizedGroup: "Blank / Unknown" };
  }
  const upper = clean.toUpperCase();

  // Explicit dummy / empty representations in Salesforce exports
  if (
    upper === "NULL" ||
    upper === "UNDEFINED" ||
    upper === "N/A" ||
    upper === "NA" ||
    upper === "-" ||
    upper === "—" ||
    upper === "–" ||
    upper === "_" ||
    upper === "[ACCOUNT]" ||
    upper === "ACCOUNT" ||
    upper === "BLANK" ||
    upper === "UNKNOWN" ||
    upper === "NONE" ||
    upper === "FALSE" ||
    upper === "TRUE" ||
    SF_ID_REGEX.test(clean.replace(/['"\s]/g, ""))
  ) {
    return { category: "UNCLASSIFIED", normalizedGroup: "Blank / Unknown" };
  }

  // 1. Explicit NON-NAMO check (must check NON-NAMO before plain NAMO)
  if (
    upper === "NON-NAMO" ||
    upper === "NON NAMO" ||
    upper === "NON_NAMO" ||
    upper === "NONNAMO" ||
    upper.includes("NON-NAMO") ||
    upper.includes("NON NAMO") ||
    upper.includes("NON_NAMO") ||
    upper.includes("NONNAMO") ||
    upper.startsWith("NON ") ||
    upper.startsWith("NON-") ||
    upper.startsWith("NON_")
  ) {
    return { category: "NON-NAMO", normalizedGroup: "NON-NAMO" };
  }

  // 2. Explicit NAMO check (any group with NAMO that does NOT contain NON)
  if (upper === "NAMO" || upper.includes("NAMO")) {
    return { category: "NAMO", normalizedGroup: "NAMO" };
  }

  // 3. Other explicit account groups (e.g. "CPSD", "ENTERPRISE", "RETAIL", "GOVERNMENT")
  return { category: "NON-NAMO", normalizedGroup: clean };
}

/**
 * Smart heuristic to check if a Parent WorkOrder is present.
 * Inspects both ParentWorkOrderId and ParentTicket (e.g. BLK... ticket).
 * Correctly distinguishes null/empty/dummy representations in Salesforce exports.
 */
export function isParentWorkOrderPresent(
  parentWorkOrderId?: string | null,
  parentTicket?: string | null
): { hasParent: boolean; parentIdentifier?: string } {
  // Check parent ticket first (e.g. BLK25113030694566 or another parent ticket number)
  if (parentTicket && String(parentTicket).trim()) {
    const rawTicket = String(parentTicket).trim();
    // A ticket cannot have spaces and must contain digits
    if (!/\s/.test(rawTicket) && /\d/.test(rawTicket)) {
      const ptClean = cleanTicketToken(rawTicket);
      if (
        ptClean &&
        ptClean !== "NULL" &&
        ptClean !== "UNDEFINED" &&
        ptClean !== "NONE" &&
        ptClean !== "NA" &&
        ptClean !== "-" &&
        ptClean !== "—" &&
        ptClean !== "[WORKORDER]" &&
        ptClean !== "WORKORDER" &&
        ptClean.length >= 4 &&
        !ptClean.toUpperCase().startsWith("02I")
      ) {
        return { hasParent: true, parentIdentifier: ptClean };
      }
    }
  }

  // Check parentWorkOrderId (e.g. 0WONy00000MkzWsOAJ)
  if (parentWorkOrderId && String(parentWorkOrderId).trim()) {
    const raw = String(parentWorkOrderId)
      .replace(/['"\s\u00A0\u200B\uFEFF[\]]+/g, "")
      .trim();
    const lower = raw.toLowerCase();
    if (
      raw &&
      lower !== "null" &&
      lower !== "undefined" &&
      lower !== "none" &&
      lower !== "na" &&
      lower !== "n/a" &&
      lower !== "-" &&
      lower !== "—" &&
      lower !== "–" &&
      lower !== "_" &&
      lower !== "workorder" &&
      lower !== "[workorder]" &&
      lower !== "false" &&
      lower !== "true" &&
      lower !== "000000000000000aaa" &&
      raw.length >= 5 &&
      /\d/.test(raw) &&
      !raw.toUpperCase().startsWith("02I")
    ) {
      return { hasParent: true, parentIdentifier: raw };
    }
  }

  return { hasParent: false };
}

/**
 * Smart heuristic to check if WorkOrder Status is Completed, Canceled, or Closed.
 * Note: 'Cancellation Requested' is an active/cancelable status and returns false!
 */
export function isStatusCompletedOrCanceled(status?: string | null): {
  isCompletedOrCanceled: boolean;
  cleanStatus: string;
} {
  if (!status) return { isCompletedOrCanceled: false, cleanStatus: "" };
  const clean = String(status).trim();
  const lower = clean.toLowerCase();

  // If status is 'Cancellation Requested' or 'Cancel Requested', it MUST be processed for cancellation!
  if (lower.includes("cancellation requested") || lower.includes("cancel requested")) {
    return { isCompletedOrCanceled: false, cleanStatus: clean };
  }

  const isTerminal =
    lower === "completed" ||
    lower === "canceled" ||
    lower === "cancelled" ||
    lower === "closed" ||
    lower === "auto-completed" ||
    lower === "auto completed" ||
    lower === "resolved";

  return { isCompletedOrCanceled: isTerminal, cleanStatus: clean };
}

function cleanCell(cell?: string | null): string {
  return String(cell ?? "")
    .replace(/^['"\s\u00A0\u200B\uFEFF]+|['"\s\u00A0\u200B\uFEFF]+$/g, "")
    .trim();
}

const SF_ID_REGEX = /^[A-Za-z0-9]{15}(?:[A-Za-z0-9]{3})?$/;

/**
 * ALGO 2: Process Step 3 input for NAMO cancellation page
 * Handles TSV (Salesforce Dev Console result), Markdown tables, CSV, or line-delimited input.
 * Strictly enforces:
 * - Condition 1: Only Auto PMS tickets starting with 'A' (Non-A tickets like B, C, I, X, D, S are skipped)
 * - Condition 2: Group must be strictly NAMO (NON-NAMO and Blank/Unknown are excluded)
 * - Condition 3: ParentWorkOrderId must be null (Child work orders with parent present are excluded)
 * - Condition 3: Status must NOT be Completed or Canceled (terminal statuses are excluded)
 */
export function processAlgo2NamoClassification(
  input: string,
  fallbackTickets: string[] = []
): NamoAlgo2Result {
  if (!input || !input.trim()) {
    return {
      allAutoPmsTickets: [],
      namoCancellationTickets: [],
      nonNamoTickets: [],
      parentWorkOrderTickets: [],
      completedOrCanceledTickets: [],
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

  const lines = input.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
  let ticketCol = -1;
  let groupCol = -1;
  let accountNameCol = -1;
  let idCol = -1;
  let statusCol = -1;
  let fgrCol = -1;
  let parentWorkOrderIdCol = -1;
  let parentTicketCol = -1;
  let isApprovalCol = -1;
  let isMrCol = -1;

  const records: NamoTicketItem[] = [];
  const seenTickets = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Check if markdown table divider line (|---|---|)
    if (/^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(line)) {
      continue;
    }

    let rawTokens: string[] = [];
    if (line.includes("\t")) {
      rawTokens = line.split("\t").map(cleanCell);
    } else if (line.includes("|")) {
      rawTokens = line
        .split("|")
        .map(cleanCell)
        .filter((tok, idx, arr) => {
          // Filter edge empty tokens from leading/trailing pipe
          if ((idx === 0 || idx === arr.length - 1) && !tok) return false;
          return true;
        });
    } else if (line.includes('","') || (line.startsWith('"') && line.includes(','))) {
      rawTokens = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cleanCell);
    } else {
      rawTokens = line.split(/[\t,]+/).map(cleanCell).filter(Boolean);
    }

    const lowerTokens = rawTokens.map((t) => t.toLowerCase().replace(/[^a-z0-9_.]/g, ""));

    // Check if header row (must not contain live ticket numbers or record IDs)
    const hasDataRecord = lowerTokens.some(
      (t) =>
        /^[a-z]\d{6,}$/i.test(t) ||
        /^0wo[a-z0-9]{12,15}$/i.test(t) ||
        /^02i[a-z0-9]{12,15}$/i.test(t)
    );

    const isHeader =
      !hasDataRecord &&
      lowerTokens.some(
        (t) =>
          t === "ticket_number_read_only__c" ||
          t === "parentworkorderid" ||
          t === "parentworkorder" ||
          t === "is_approval_sent__c" ||
          t === "is_mr_created__c" ||
          t === "account.group__c" ||
          t.includes("fgr") ||
          t === "status" ||
          t === "workorder.status" ||
          t === "ticket" ||
          t === "casenumber"
      );

    if (isHeader && ticketCol === -1) {
      lowerTokens.forEach((token, idx) => {
        if (
          token.includes("parentworkorder.ticket") ||
          (token.includes("parent") && (token.includes("ticket") || token.includes("casenumber") || token.includes("number")))
        ) {
          parentTicketCol = idx;
        } else if (
          token === "parentworkorderid" ||
          (token.includes("parent") && (token.includes("id") || token.includes("workorder"))) &&
          !token.includes("ticket")
        ) {
          parentWorkOrderIdCol = idx;
        } else if (
          token === "ticket_number_read_only__c" ||
          ((token.includes("ticket") || token.includes("casenumber") || token === "number") && !token.includes("parent"))
        ) {
          if (ticketCol === -1 || token === "ticket_number_read_only__c") {
            ticketCol = idx;
          }
        } else if (token.includes("group") || token === "account.group__c") {
          groupCol = idx;
        } else if (token.includes("fgr") || token.includes("crbf")) {
          fgrCol = idx;
        } else if (
          (token.includes("account") || token.includes("customer")) &&
          !token.includes("group") &&
          !token.includes("id")
        ) {
          accountNameCol = idx;
        } else if (
          token === "id" ||
          (token.endsWith(".id") && !token.includes("parent")) ||
          token === "workorderid"
        ) {
          if (idCol === -1) idCol = idx;
        } else if (
          (token === "status" || token === "workorder.status" || token === "status__c") &&
          !token.includes("fgr") &&
          !token.includes("crbf") &&
          !token.includes("approval")
        ) {
          statusCol = idx;
        } else if (
          token === "is_approval_sent__c" ||
          token === "is_approval_send_c" ||
          token === "is_approval_sent" ||
          token === "is_approval_send" ||
          token.includes("approval_sent") ||
          token.includes("approval_send") ||
          token.includes("is_approval")
        ) {
          isApprovalCol = idx;
        } else if (
          token === "is_mr_created__c" ||
          token === "is_mr_created" ||
          token.includes("mr_created") ||
          token.includes("is_mr")
        ) {
          isMrCol = idx;
        }
      });
      continue;
    }

    let ticket = "";
    let rawGroup = "";
    let accountName = "";
    let sfId = "";
    let status = "";
    let fgr = "";
    let parentWorkOrderId = "";
    let parentTicket = "";
    let isApprovalSent = false;
    let isMrCreated = false;

    if (ticketCol !== -1 && rawTokens[ticketCol]) {
      ticket = cleanTicketToken(rawTokens[ticketCol]);
      if (groupCol !== -1 && rawTokens[groupCol]) rawGroup = rawTokens[groupCol] || "";
      if (accountNameCol !== -1 && rawTokens[accountNameCol]) accountName = rawTokens[accountNameCol] || "";
      if (idCol !== -1 && rawTokens[idCol]) sfId = rawTokens[idCol] || "";
      if (fgrCol !== -1 && rawTokens[fgrCol]) fgr = rawTokens[fgrCol] || "";
      if (statusCol !== -1 && rawTokens[statusCol]) status = rawTokens[statusCol] || "";
      if (parentWorkOrderIdCol !== -1 && rawTokens[parentWorkOrderIdCol]) parentWorkOrderId = rawTokens[parentWorkOrderIdCol] || "";
      if (parentTicketCol !== -1 && rawTokens[parentTicketCol]) parentTicket = rawTokens[parentTicketCol] || "";
      if (isApprovalCol !== -1 && rawTokens[isApprovalCol]) {
        const v = (rawTokens[isApprovalCol] || "").toLowerCase().trim();
        isApprovalSent = v === "true" || v === "1" || v === "yes";
      }
      if (isMrCol !== -1 && rawTokens[isMrCol]) {
        const v = (rawTokens[isMrCol] || "").toLowerCase().trim();
        isMrCreated = v === "true" || v === "1" || v === "yes";
      }
    } else {
      // Headerless fallback
      // 1. Detect Asset ID (02i...) index if present in rawTokens
      let assetIdx = -1;
      for (let idx = 0; idx < rawTokens.length; idx++) {
        const rawTok = rawTokens[idx] || "";
        const cleanId = rawTok.replace(/['"]/g, "").trim();
        if (cleanId.toUpperCase().startsWith("02I") && SF_ID_REGEX.test(cleanId)) {
          assetIdx = idx;
          break;
        }
      }

      // In standard SOQL: ..., Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status, ParentWorkOrder...
      // The token directly after AssetId is the WorkOrder Status!
      // The token directly before AssetId is FGR_Approved_Reject_For_CRBF__c!
      if (assetIdx !== -1) {
        if (assetIdx + 1 < rawTokens.length) {
          const candStatus = (rawTokens[assetIdx + 1] || "").trim();
          if (candStatus && !candStatus.toUpperCase().startsWith("02I") && !candStatus.toUpperCase().startsWith("0WO")) {
            status = candStatus;
          }
        }
        if (assetIdx - 1 >= 0) {
          fgr = (rawTokens[assetIdx - 1] || "").trim();
        }
      }

      for (let tIdx = 0; tIdx < rawTokens.length; tIdx++) {
        // Skip tokens already consumed by AssetId, FGR, or Status from AssetId position
        if (assetIdx !== -1 && (tIdx === assetIdx || tIdx === assetIdx - 1 || tIdx === assetIdx + 1)) {
          continue;
        }

        const token = rawTokens[tIdx] || "";
        const ct = cleanTicketToken(token);
        const upper = token.trim().toUpperCase();

        // 1. Ticket Token Detection (must not contain spaces, must contain digits)
        const hasSpaces = /\s/.test(token.trim());
        const hasDigits = /\d/.test(token);

        if (
          !hasSpaces &&
          hasDigits &&
          (/^[A-Za-z]\d{6,}$/i.test(ct) ||
            /^BLK\d+$/i.test(ct) ||
            (/^[A-Za-z0-9_-]{7,}$/.test(ct) && !SF_ID_REGEX.test(ct)))
        ) {
          if (!ticket) {
            ticket = ct;
          } else if (!parentTicket) {
            parentTicket = ct;
          }
        } else if (!hasSpaces && hasDigits && upper.startsWith("BLK") && upper.length >= 5) {
          if (!ticket) {
            ticket = ct;
          } else {
            parentTicket = ct;
          }
        } else if (SF_ID_REGEX.test(token.replace(/['"]/g, "").trim())) {
          const cleanId = token.replace(/['"]/g, "").trim();
          const cleanIdUpper = cleanId.toUpperCase();
          if (cleanIdUpper.startsWith("02I")) {
            // Asset ID (02i...) - ignore for WorkOrder ID and ParentWorkOrderId
            continue;
          } else if (cleanIdUpper.startsWith("0WO")) {
            if (!sfId) {
              sfId = cleanId;
            } else if (!parentWorkOrderId) {
              parentWorkOrderId = cleanId;
            }
          } else {
            if (!sfId) {
              sfId = cleanId;
            } else if (!parentWorkOrderId) {
              parentWorkOrderId = cleanId;
            }
          }
        } else {
          if (
            upper === "NAMO" ||
            upper === "NON NAMO" ||
            upper === "NON-NAMO" ||
            upper === "NONNAMO" ||
            upper.startsWith("NAMO") ||
            upper.startsWith("NON ") ||
            upper.startsWith("NON-") ||
            upper.startsWith("NON_")
          ) {
            if (!rawGroup) rawGroup = token.trim();
          } else if (
            upper === "ACCEPTED" ||
            upper === "CANCELED" ||
            upper === "CANCELLED" ||
            upper === "COMPLETED" ||
            upper === "CLOSED" ||
            upper === "OPEN" ||
            upper === "NEW" ||
            upper === "IN PROGRESS" ||
            upper === "ON HOLD" ||
            upper === "PENDING" ||
            upper === "BUNDLED" ||
            upper === "CANCELLATION REQUESTED" ||
            upper === "CANCEL REQUESTED" ||
            upper === "AUTO-COMPLETED" ||
            upper === "AUTO COMPLETED" ||
            upper === "RESOLVED"
          ) {
            if (!status) status = token.trim();
          } else if (
            upper !== "FALSE" &&
            upper !== "TRUE" &&
            upper !== "NULL" &&
            upper !== "UNDEFINED" &&
            upper !== "[WORKORDER]" &&
            upper !== "_" &&
            upper !== "-" &&
            upper !== "—" &&
            upper !== "–" &&
            upper !== "WORKORDER" &&
            upper !== "N/A" &&
            upper !== "NA" &&
            upper !== "NONE" &&
            !SF_ID_REGEX.test(token.trim().replace(/['"]/g, "")) &&
            !/^[A-Z0-9]{8,}$/i.test(token.trim())
          ) {
            if (!accountName && token.trim().length > 1) {
              accountName = token.trim();
            }
          }
        }
      }

      // Space-separated line fallback: "A123456 NAMO ABC Enterprises"
      if (!ticket && line.trim()) {
        const spaceParts = line.trim().split(/\s+/);
        for (let sp = 0; sp < spaceParts.length; sp++) {
          const part = spaceParts[sp];
          const ct = cleanTicketToken(part);
          if (/^[A-Za-z]\d{6,}$/i.test(ct) || ct.length >= 7) {
            ticket = ct;
            const remaining = spaceParts.slice(sp + 1);
            if (remaining.length > 0 && remaining[0]) {
              const r0 = remaining[0].toUpperCase();
              if (r0 === "NAMO" || r0 === "NON" || r0.startsWith("NON-") || r0.startsWith("NON_")) {
                if (r0 === "NON" && remaining.length > 1 && remaining[1]?.toUpperCase() === "NAMO") {
                  rawGroup = "NON-NAMO";
                  accountName = remaining.slice(2).join(" ");
                } else {
                  rawGroup = remaining[0];
                  accountName = remaining.slice(1).join(" ");
                }
              } else {
                accountName = remaining.join(" ");
              }
            }
            break;
          }
        }
      }
    }

    if (!ticket) continue;
    if (seenTickets.has(ticket)) continue;
    seenTickets.add(ticket);

    // Smart heuristic check for Parent WorkOrder (checks parentWorkOrderId and parentTicket, handling dummy nulls)
    const parentCheck = isParentWorkOrderPresent(parentWorkOrderId, parentTicket);

    // Smart heuristic check for Status (checks completed, canceled, closed, etc., while preserving cancellation requested)
    const statusCheck = isStatusCompletedOrCanceled(status);

    // Condition 1: Must be PMS ticket starting with 'A'
    const isAutoPms = ticket.toUpperCase().startsWith("A");

    // Condition 2: Group classification (NAMO vs NON-NAMO vs UNCLASSIFIED)
    const { category, normalizedGroup } = classifyNamoAccountGroup(rawGroup);

    // Determine eligibility and skip reason for NAMO cancellation
    let isEligible = false;
    let skipReason: string | undefined = undefined;

    const isLocked =
      isEntityLockedError(status) ||
      isEntityLockedError(line) ||
      rawTokens.some(isEntityLockedError) ||
      isApprovalSent;

    if (isLocked || isApprovalSent) {
      isEligible = false;
      skipReason = "Approval Pending";
    } else if (isMrCreated) {
      isEligible = false;
      skipReason = "MR Raised (Material Request Created / Is_MR_Created is true)";
    } else if (!isAutoPms) {
      // Condition 1: Skip non-A tickets (B, C, I, X, D, S, etc.)
      isEligible = false;
      skipReason = `Non-PMS ticket (Starts with '${ticket.charAt(0) || "?"}' instead of 'A')`;
    } else if (category === "NON-NAMO") {
      // Condition 2: Start with A but group is NON-NAMO -> Skip (page is strictly for NAMO cancellations)
      isEligible = false;
      skipReason = "NON-NAMO Group (Excluded from NAMO cancellation - Requires RM Approval)";
    } else if (category === "UNCLASSIFIED") {
      // Blank / Unknown group -> Hold for verification (never default to NAMO)
      isEligible = false;
      skipReason = "Blank / Unknown Account Group (Unverified)";
    } else if (parentCheck.hasParent) {
      // Condition 3: ParentWorkOrderId or Parent Ticket is present -> Skip even if group is NAMO
      isEligible = false;
      skipReason = `Parent WorkOrder present (${parentCheck.parentIdentifier || parentWorkOrderId || parentTicket})`;
    } else if (statusCheck.isCompletedOrCanceled) {
      // Condition 3: Status is Completed, Canceled, Closed -> Skip
      isEligible = false;
      skipReason = `Status is '${statusCheck.cleanStatus}' (Already Completed/Canceled)`;
    } else {
      // All conditions satisfied: Starts with A, NAMO, ParentWorkOrderId is null, Status active
      isEligible = true;
    }

    // Zero-Tolerance Safety Guard for NAMO:
    // Under no circumstances allow cancellation if any condition fails!
    if (
      !isAutoPms ||
      category !== "NAMO" ||
      parentCheck.hasParent ||
      statusCheck.isCompletedOrCanceled ||
      isLocked ||
      isApprovalSent ||
      isMrCreated
    ) {
      isEligible = false;
    }

    records.push({
      ticket,
      id: sfId || undefined,
      accountGroupName: rawGroup.trim() || normalizedGroup,
      accountGroupCategory: category,
      accountName: sanitizeAccountName(accountName),
      status: status || undefined,
      fgr: fgr || undefined,
      parentWorkOrderId: parentCheck.hasParent ? (parentCheck.parentIdentifier || parentWorkOrderId || undefined) : undefined,
      parentTicket: parentTicket || undefined,
      isChild: parentCheck.hasParent,
      isEligibleForCancellation: isEligible,
      isAutoPms,
      skipReason,
      isApprovalSent: isApprovalSent || isLocked,
      isMrCreated,
      isLocked,
    });
  }

  // Handle any fallback tickets from Step 1 that weren't in Step 3
  if (fallbackTickets.length > 0) {
    for (const fTkt of fallbackTickets) {
      const clean = cleanTicketToken(fTkt);
      if (!clean || seenTickets.has(clean)) continue;
      seenTickets.add(clean);
      const isAutoPms = clean.toUpperCase().startsWith("A");
      records.push({
        ticket: clean,
        accountGroupName: "Blank / Unknown",
        accountGroupCategory: "UNCLASSIFIED",
        accountName: "—",
        parentWorkOrderId: undefined,
        parentTicket: undefined,
        isChild: false,
        status: "Not Returned",
        isEligibleForCancellation: false,
        isAutoPms,
        skipReason: isAutoPms ? "Not Returned by SF" : `Non-PMS ticket (Starts with '${clean.charAt(0) || "?"}' instead of 'A')`,
      });
    }
  }

  // Collections per NAMO specifications
  const allAutoPmsTickets = records.filter((r) => r.isAutoPms).map((r) => r.ticket);
  const namoCancellationTickets = records.filter((r) => r.isEligibleForCancellation);
  const nonNamoTickets = records.filter((r) => r.isAutoPms && r.accountGroupCategory === "NON-NAMO");
  const parentWorkOrderTickets = records.filter(
    (r) => r.isAutoPms && r.accountGroupCategory === "NAMO" && r.isChild
  );
  const completedOrCanceledTickets = records.filter(
    (r) =>
      r.isAutoPms &&
      r.accountGroupCategory === "NAMO" &&
      !r.isChild &&
      (r.skipReason?.includes("Completed/Canceled") ?? false)
  );
  const unclassifiedTickets = records.filter((r) => r.isAutoPms && r.accountGroupCategory === "UNCLASSIFIED");
  const approvalPendingTickets = records.filter(
    (r) => r.isApprovalSent || r.isLocked || (r.skipReason && r.skipReason.includes("Approval Pending"))
  );
  const mrCreatedTickets = records.filter(
    (r) => r.isMrCreated || (r.skipReason && r.skipReason.includes("MR Raised"))
  );
  const nonAutoPmsTickets = records.filter((r) => !r.isAutoPms).map((r) => r.ticket);
  const allSkippedTickets = records.filter((r) => !r.isEligibleForCancellation);

  // Generate NON-NAMO output segments for Mail and Post (backwards compatibility)
  let nonNamoMailSegmentText = "";
  let nonNamoMailSegmentHtml = "";
  let nonNamoPostSegmentText = "";
  let nonNamoPostSegmentHtml = "";

  if (nonNamoTickets.length > 0 || unclassifiedTickets.length > 0) {
    const lines: string[] = [];
    lines.push("NON-NAMO PMS Cancellation – Approval Requirement\n");
    lines.push("Cancellation of NON-NAMO PMS tickets requires the following mandatory approval:\n");
    lines.push("• RM Approval\n");
    lines.push(`The ${nonNamoTickets.length} NON-NAMO PMS tickets will remain pending until the required approval is obtained:\n`);
    lines.push(nonNamoTickets.map((t) => t.ticket).join(", "));
    if (unclassifiedTickets.length > 0) {
      lines.push(`\nUnverified / Blank Group Tickets (${unclassifiedTickets.length}):\n${unclassifiedTickets.map((t) => t.ticket).join(", ")}`);
    }
    nonNamoMailSegmentText = lines.join("\n");

    const nonNamoTktsStr = nonNamoTickets.map((t) => t.ticket).join(", ");
    const unclassifiedTktsStr = unclassifiedTickets.map((t) => t.ticket).join(", ");
    nonNamoMailSegmentHtml = `<p style="font-weight: bold; font-size: 14px; margin-top: 18px; margin-bottom: 6px;">NON-NAMO PMS Cancellation – Approval Requirement</p>
  <p>Cancellation of NON-NAMO PMS tickets requires the following mandatory approval:</p>
  <ul style="margin-top: 4px; margin-bottom: 8px;">
    <li>RM Approval</li>
  </ul>
  <p>The <strong>${nonNamoTickets.length} NON-NAMO PMS tickets</strong> will remain pending until the required approval is obtained:</p>
  <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #854d0e; line-height: 1.6; max-width: 650px; word-break: break-word;">${nonNamoTktsStr}</div>${unclassifiedTickets.length > 0 ? `<p style="margin-top: 8px;">Unverified / Blank Group Tickets (<strong>${unclassifiedTickets.length}</strong>):</p><div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #475569; word-break: break-word;">${unclassifiedTktsStr}</div>` : ""}`;

    const postLines: string[] = [];
    postLines.push("━━━━━━━━━━━━━━━━━━━━\n**NON-NAMO PMS – APPROVAL REQUIREMENT**\n");
    postLines.push("NON-NAMO PMS ticket cancellation requires the following mandatory approval:\n");
    postLines.push("• RM Approval\n");
    postLines.push(`The ${nonNamoTickets.length} NON-NAMO PMS tickets will remain pending until the required approval is obtained:\n${nonNamoTktsStr}`);
    if (unclassifiedTickets.length > 0) {
      postLines.push(`\nUnverified / Blank Group Tickets (${unclassifiedTickets.length}):\n${unclassifiedTktsStr}`);
    }
    nonNamoPostSegmentText = postLines.join("\n");
    nonNamoPostSegmentHtml = `<hr/><p><strong>NON-NAMO PMS – APPROVAL REQUIREMENT</strong></p><p>NON-NAMO PMS ticket cancellation requires the following mandatory approval:</p><p>• RM Approval</p><p>The ${nonNamoTickets.length} NON-NAMO PMS tickets will remain pending until the required approval is obtained:</p><div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #854d0e; line-height: 1.5; margin-bottom: 8px;">${nonNamoTktsStr}</div>${unclassifiedTickets.length > 0 ? `<p>Unverified / Blank Group Tickets (<strong>${unclassifiedTickets.length}</strong>):</p><div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #475569; margin-bottom: 8px;">${unclassifiedTktsStr}</div>` : ""}`;
  }

  // Generate Comprehensive Excluded Segment
  let excludedSegmentText = "";
  let excludedSegmentHtml = "";

  if (allSkippedTickets.length > 0) {
    const lines: string[] = [];
    lines.push("Excluded Tickets – Excluded from NAMO Cancellation\n");
    lines.push("| Ticket Number | Reason | Group | Parent WorkOrder | Status |");
    lines.push("|---|---|---|---|---|");
    for (const r of allSkippedTickets) {
      lines.push(
        `| ${r.ticket} | ${r.skipReason || "Excluded"} | ${r.accountGroupName || "—"} | ${r.parentWorkOrderId || r.parentTicket || "—"} | ${r.status || "—"} |`
      );
    }
    excludedSegmentText = lines.join("\n");

    const htmlRows = allSkippedTickets
      .map(
        (r) =>
          `<tr><td style="padding:6px 10px;border:1px solid #cbd5e1;font-family:monospace;font-weight:bold;">${r.ticket}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;color:#b91c1c;font-weight:600;">${r.skipReason || "Excluded"}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;">${r.accountGroupName || "—"}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;font-family:monospace;">${r.parentWorkOrderId || r.parentTicket || "—"}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;">${r.status || "—"}</td></tr>`
      )
      .join("");

    excludedSegmentHtml = `<p><b>Excluded Tickets – Excluded from NAMO Cancellation</b></p><table style="border-collapse:collapse;width:100%;max-width:700px;font-family:sans-serif;font-size:12px;" border="1" cellpadding="6"><thead><tr style="background:#f1f5f9;text-align:left;"><th style="padding:6px 10px;border:1px solid #cbd5e1;">Ticket Number</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Reason</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Group</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Parent WorkOrder</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Status</th></tr></thead><tbody>${htmlRows}</tbody></table>`;
  }

  // Full templates
  const total = allAutoPmsTickets.length;
  const eligibleCount = namoCancellationTickets.length;
  const totalExcluded = allSkippedTickets.length;

  let namoMailOutputText = "";
  let namoMailOutputHtml = "";
  let namoPostOutputText = "";
  let namoPostOutputHtml = "";

  if (records.length > 0) {
    if (totalExcluded === 0) {
      namoMailOutputText = `Dear,\nCancellation has been done successfully for NAMO tickets.\n\nTotal Auto PMS Tickets: ${total}\nCancelled (NAMO): ${eligibleCount}`;
      namoMailOutputHtml = `<p>Dear,</p><p>Cancellation has been done successfully for NAMO tickets.</p><br><p>Total Auto PMS Tickets: ${total}<br>Cancelled (NAMO): ${eligibleCount}</p>`;
      namoPostOutputText = `@taguser \nCancellation has been done successfully for NAMO tickets.\n\nTotal Auto PMS Tickets: ${total}\nCancelled (NAMO): ${eligibleCount}`;
      namoPostOutputHtml = `<p>@taguser </p><p>Cancellation has been done successfully for NAMO tickets.</p><br><p>Total Auto PMS Tickets: ${total}<br>Cancelled (NAMO): ${eligibleCount}</p>`;
    } else {
      const breakdownLines: string[] = [];
      if (nonAutoPmsTickets.length > 0) {
        breakdownLines.push(`• Total Non-PMS Tickets: ${nonAutoPmsTickets.length}`);
      }
      if (nonNamoTickets.length > 0) {
        breakdownLines.push(`• Skipped NON-NAMO Group Tickets (Condition 2): ${nonNamoTickets.length}`);
      }
      if (parentWorkOrderTickets.length > 0) {
        breakdownLines.push(`• Skipped Child WorkOrders with Parent Present (Condition 3): ${parentWorkOrderTickets.length}`);
      }
      if (completedOrCanceledTickets.length > 0) {
        breakdownLines.push(`• Skipped Completed/Canceled Status (Condition 3): ${completedOrCanceledTickets.length}`);
      }
      if (unclassifiedTickets.length > 0) {
        breakdownLines.push(`• Skipped Unclassified / Blank Group: ${unclassifiedTickets.length}`);
      }
      const approvalPendingRecordsInStep3 = records.filter(
        (r) => r.isApprovalSent || r.isLocked || r.skipReason?.includes("Approval Pending")
      );
      if (approvalPendingRecordsInStep3.length > 0) {
        breakdownLines.push(`• Skipped Approval Pending: ${approvalPendingRecordsInStep3.length}`);
      }

      const summaryText = `Cancellation has been processed for NAMO tickets.\n\nTotal Auto PMS Tickets: ${total}\nCancelled (NAMO): ${eligibleCount}\nTotal Excluded: ${totalExcluded}\n${breakdownLines.join("\n")}`;
      const summaryHtml = `<p>Cancellation has been processed for NAMO tickets.</p><p>Total Auto PMS Tickets: ${total}<br>Cancelled (NAMO): ${eligibleCount}<br>Total Excluded: ${totalExcluded}<br>${breakdownLines.join("<br>")}</p>`;

      namoMailOutputText = `Dear,\n${summaryText}\n\n${excludedSegmentText || nonNamoMailSegmentText}`;
      namoMailOutputHtml = `<p>Dear,</p>${summaryHtml}<br>${excludedSegmentHtml || nonNamoMailSegmentHtml}`;
      namoPostOutputText = `@taguser \n${summaryText}\n\n${nonNamoPostSegmentText || excludedSegmentText}`;
      namoPostOutputHtml = `<p>@taguser </p>${summaryHtml}<br>${nonNamoPostSegmentHtml || excludedSegmentHtml}`;
    }
  }

  return {
    allAutoPmsTickets,
    namoCancellationTickets,
    nonNamoTickets,
    parentWorkOrderTickets,
    completedOrCanceledTickets,
    unclassifiedTickets,
    approvalPendingTickets,
    mrCreatedTickets,
    nonAutoPmsTickets,
    allRecords: records,
    allSkippedTickets,
    nonNamoMailSegmentText,
    nonNamoMailSegmentHtml,
    nonNamoPostSegmentText,
    nonNamoPostSegmentHtml,
    excludedSegmentText,
    excludedSegmentHtml,
    namoMailOutputText,
    namoMailOutputHtml,
    namoPostOutputText,
    namoPostOutputHtml,
  };
}

// =============================================================================
// ALGO 3 – NON-NAMO Page Auto PMS Cancellation Filtering & Output Logic
// =============================================================================

export interface NonNamoTicketItem {
  ticket: string; // Complete ticket number (e.g. A123456)
  id?: string; // Salesforce Id (e.g. 0WONy000008eHgfOAE)
  accountGroupName: string; // Raw or normalized Account Group Name (e.g. "NON-NAMO", "NAMO")
  accountGroupCategory: NamoAccountGroupCategory;
  accountName: string; // Account/Customer Name (e.g. "ABC Enterprises")
  isEligibleForCancellation: boolean;
  status?: string;
  fgr?: string;
  isAutoPms: boolean;
  parentWorkOrderId?: string;
  parentTicket?: string;
  isChild?: boolean;
  skipReason?: string;
  isApprovalSent?: boolean;
  isMrCreated?: boolean;
  isLocked?: boolean;
}

export interface NonNamoAlgo3Result {
  allAutoPmsTickets: string[]; // Collection A: ALL_AUTO_PMS_TICKETS
  nonNamoCancellationTickets: NonNamoTicketItem[]; // Collection B: NON_NAMO_CANCELLATION_TICKETS (eligible for NON-NAMO cancellation)
  namoTickets: NonNamoTicketItem[]; // Collection C: NAMO_TICKETS (excluded: starts with A but Group is NAMO - Condition 2)
  parentWorkOrderTickets: NonNamoTicketItem[]; // Excluded: ParentWorkOrderId is present (Condition 3)
  completedOrCanceledTickets: NonNamoTicketItem[]; // Excluded: Status is in ('Completed','Canceled') (Condition 3)
  unclassifiedTickets: NonNamoTicketItem[]; // Blank / Unknown Account Group Type (unverified)
  approvalPendingTickets: NonNamoTicketItem[]; // Excluded: Approval Pending / Locked in Salesforce
  mrCreatedTickets: NonNamoTicketItem[]; // Excluded: MR Raised / Material Request Created
  nonAutoPmsTickets: string[]; // Any tickets not starting with A (Condition 1)
  allRecords: NonNamoTicketItem[];
  allSkippedTickets: NonNamoTicketItem[]; // Combined list of all excluded/skipped tickets with reasons
  namoMailSegmentText: string;
  namoMailSegmentHtml: string;
  namoPostSegmentText: string;
  namoPostSegmentHtml: string;
  excludedSegmentText: string;
  excludedSegmentHtml: string;
  nonNamoMailOutputText: string;
  nonNamoMailOutputHtml: string;
  nonNamoPostOutputText: string;
  nonNamoPostOutputHtml: string;
}

/**
 * ALGO 3: Process Step 3 input for NON-NAMO cancellation page
 * Exact reverse of NAMO:
 * - NON-NAMO tickets are ELIGIBLE for cancellation
 * - NAMO tickets are EXCLUDED from cancellation (retained for Mail and Post outputs)
 * - Blank / Unknown tickets are unclassified (held for verification)
 */
export function processAlgo3NonNamoClassification(
  input: string,
  fallbackTickets: string[] = []
): NonNamoAlgo3Result {
  if (!input || !input.trim()) {
    return {
      allAutoPmsTickets: [],
      nonNamoCancellationTickets: [],
      namoTickets: [],
      parentWorkOrderTickets: [],
      completedOrCanceledTickets: [],
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

  const lines = input.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
  let ticketCol = -1;
  let groupCol = -1;
  let accountNameCol = -1;
  let idCol = -1;
  let statusCol = -1;
  let fgrCol = -1;
  let parentWorkOrderIdCol = -1;
  let parentTicketCol = -1;
  let isApprovalCol = -1;
  let isMrCol = -1;

  const records: NonNamoTicketItem[] = [];
  const seenTickets = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Check if markdown table divider line (|---|---|)
    if (/^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(line)) {
      continue;
    }

    let rawTokens: string[] = [];
    if (line.includes("\t")) {
      rawTokens = line.split("\t").map(cleanCell);
    } else if (line.includes("|")) {
      rawTokens = line
        .split("|")
        .map(cleanCell)
        .filter((tok, idx, arr) => {
          if ((idx === 0 || idx === arr.length - 1) && !tok) return false;
          return true;
        });
    } else if (line.includes('","') || (line.startsWith('"') && line.includes(','))) {
      rawTokens = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cleanCell);
    } else {
      rawTokens = line.split(/[\t,]+/).map(cleanCell).filter(Boolean);
    }

    const lowerTokens = rawTokens.map((t) => t.toLowerCase().replace(/[^a-z0-9_.]/g, ""));

    // Check if header row (must not contain live ticket numbers or record IDs)
    const hasDataRecord = lowerTokens.some(
      (t) =>
        /^[a-z]\d{6,}$/i.test(t) ||
        /^0wo[a-z0-9]{12,15}$/i.test(t) ||
        /^02i[a-z0-9]{12,15}$/i.test(t)
    );

    const isHeader =
      !hasDataRecord &&
      lowerTokens.some(
        (t) =>
          t === "ticket_number_read_only__c" ||
          t === "parentworkorderid" ||
          t === "parentworkorder" ||
          t === "is_approval_sent__c" ||
          t === "is_mr_created__c" ||
          t === "account.group__c" ||
          t.includes("fgr") ||
          t === "status" ||
          t === "workorder.status" ||
          t === "ticket" ||
          t === "casenumber"
      );

    if (isHeader && ticketCol === -1) {
      lowerTokens.forEach((token, idx) => {
        if (
          token.includes("parentworkorder.ticket") ||
          (token.includes("ticket") && token.includes("parent"))
        ) {
          parentTicketCol = idx;
        } else if (
          token === "parentworkorderid" ||
          (token.includes("parent") && (token.includes("id") || token.includes("workorder"))) &&
          !token.includes("ticket")
        ) {
          parentWorkOrderIdCol = idx;
        } else if (
          token === "ticket_number_read_only__c" ||
          ((token.includes("ticket") || token.includes("casenumber") || token === "number") && !token.includes("parent"))
        ) {
          if (ticketCol === -1 || token === "ticket_number_read_only__c") {
            ticketCol = idx;
          }
        } else if (token.includes("group") || token === "account.group__c") {
          groupCol = idx;
        } else if (token.includes("fgr") || token.includes("crbf")) {
          fgrCol = idx;
        } else if (
          (token.includes("account") || token.includes("customer")) &&
          !token.includes("group") &&
          !token.includes("id")
        ) {
          accountNameCol = idx;
        } else if (
          token === "id" ||
          (token.endsWith(".id") && !token.includes("parent")) ||
          token === "workorderid"
        ) {
          if (idCol === -1) idCol = idx;
        } else if (
          (token === "status" || token === "workorder.status" || token === "status__c") &&
          !token.includes("fgr") &&
          !token.includes("crbf") &&
          !token.includes("approval")
        ) {
          statusCol = idx;
        } else if (
          token === "is_approval_sent__c" ||
          token === "is_approval_send_c" ||
          token === "is_approval_sent" ||
          token === "is_approval_send" ||
          token.includes("approval_sent") ||
          token.includes("approval_send") ||
          token.includes("is_approval")
        ) {
          isApprovalCol = idx;
        } else if (
          token === "is_mr_created__c" ||
          token === "is_mr_created" ||
          token.includes("mr_created") ||
          token.includes("is_mr")
        ) {
          isMrCol = idx;
        }
      });
      continue;
    }

    let ticket = "";
    let rawGroup = "";
    let accountName = "";
    let sfId = "";
    let status = "";
    let fgr = "";
    let parentWorkOrderId = "";
    let parentTicket = "";
    let isApprovalSent = false;
    let isMrCreated = false;

    if (ticketCol !== -1 && rawTokens[ticketCol]) {
      ticket = cleanTicketToken(rawTokens[ticketCol]);
      if (groupCol !== -1 && rawTokens[groupCol]) rawGroup = rawTokens[groupCol] || "";
      if (accountNameCol !== -1 && rawTokens[accountNameCol]) accountName = rawTokens[accountNameCol] || "";
      if (idCol !== -1 && rawTokens[idCol]) sfId = rawTokens[idCol] || "";
      if (fgrCol !== -1 && rawTokens[fgrCol]) fgr = rawTokens[fgrCol] || "";
      if (statusCol !== -1 && rawTokens[statusCol]) status = rawTokens[statusCol] || "";
      if (parentWorkOrderIdCol !== -1 && rawTokens[parentWorkOrderIdCol]) parentWorkOrderId = rawTokens[parentWorkOrderIdCol] || "";
      if (parentTicketCol !== -1 && rawTokens[parentTicketCol]) parentTicket = rawTokens[parentTicketCol] || "";
      if (isApprovalCol !== -1 && rawTokens[isApprovalCol]) {
        const v = (rawTokens[isApprovalCol] || "").toLowerCase().trim();
        isApprovalSent = v === "true" || v === "1" || v === "yes";
      }
      if (isMrCol !== -1 && rawTokens[isMrCol]) {
        const v = (rawTokens[isMrCol] || "").toLowerCase().trim();
        isMrCreated = v === "true" || v === "1" || v === "yes";
      }
    } else {
      // Headerless fallback
      // 1. Detect Asset ID (02i...) index if present in rawTokens
      let assetIdx = -1;
      for (let idx = 0; idx < rawTokens.length; idx++) {
        const rawTok = rawTokens[idx] || "";
        const cleanId = rawTok.replace(/['"]/g, "").trim();
        if (cleanId.toUpperCase().startsWith("02I") && SF_ID_REGEX.test(cleanId)) {
          assetIdx = idx;
          break;
        }
      }

      // In standard SOQL: ..., Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status, ParentWorkOrder...
      // The token directly after AssetId is the WorkOrder Status!
      // The token directly before AssetId is FGR_Approved_Reject_For_CRBF__c!
      if (assetIdx !== -1) {
        if (assetIdx + 1 < rawTokens.length) {
          const candStatus = (rawTokens[assetIdx + 1] || "").trim();
          if (candStatus && !candStatus.toUpperCase().startsWith("02I") && !candStatus.toUpperCase().startsWith("0WO")) {
            status = candStatus;
          }
        }
        if (assetIdx - 1 >= 0) {
          fgr = (rawTokens[assetIdx - 1] || "").trim();
        }
      }

      for (let tIdx = 0; tIdx < rawTokens.length; tIdx++) {
        // Skip tokens already consumed by AssetId, FGR, or Status from AssetId position
        if (assetIdx !== -1 && (tIdx === assetIdx || tIdx === assetIdx - 1 || tIdx === assetIdx + 1)) {
          continue;
        }

        const token = rawTokens[tIdx] || "";
        const ct = cleanTicketToken(token);
        const upper = token.trim().toUpperCase();

        // 1. Ticket Token Detection (must not contain spaces, must contain digits)
        const hasSpaces = /\s/.test(token.trim());
        const hasDigits = /\d/.test(token);

        if (
          !hasSpaces &&
          hasDigits &&
          (/^[A-Za-z]\d{6,}$/i.test(ct) ||
            /^BLK\d+$/i.test(ct) ||
            (/^[A-Za-z0-9_-]{7,}$/.test(ct) && !SF_ID_REGEX.test(ct)))
        ) {
          if (!ticket) {
            ticket = ct;
          } else if (!parentTicket) {
            parentTicket = ct;
          }
        } else if (!hasSpaces && hasDigits && upper.startsWith("BLK") && upper.length >= 5) {
          if (!ticket) {
            ticket = ct;
          } else {
            parentTicket = ct;
          }
        } else if (SF_ID_REGEX.test(token.replace(/['"]/g, "").trim())) {
          const cleanId = token.replace(/['"]/g, "").trim();
          const cleanIdUpper = cleanId.toUpperCase();
          if (cleanIdUpper.startsWith("02I")) {
            // Asset ID (02i...) - ignore for WorkOrder ID and ParentWorkOrderId
            continue;
          } else if (cleanIdUpper.startsWith("0WO")) {
            if (!sfId) {
              sfId = cleanId;
            } else if (!parentWorkOrderId) {
              parentWorkOrderId = cleanId;
            }
          } else {
            if (!sfId) {
              sfId = cleanId;
            } else if (!parentWorkOrderId) {
              parentWorkOrderId = cleanId;
            }
          }
        } else {
          if (
            upper === "NAMO" ||
            upper === "NON NAMO" ||
            upper === "NON-NAMO" ||
            upper === "NONNAMO" ||
            upper.startsWith("NAMO") ||
            upper.startsWith("NON ") ||
            upper.startsWith("NON-") ||
            upper.startsWith("NON_")
          ) {
            if (!rawGroup) rawGroup = token.trim();
          } else if (
            upper === "ACCEPTED" ||
            upper === "CANCELED" ||
            upper === "CANCELLED" ||
            upper === "COMPLETED" ||
            upper === "CLOSED" ||
            upper === "OPEN" ||
            upper === "NEW" ||
            upper === "IN PROGRESS" ||
            upper === "ON HOLD" ||
            upper === "PENDING" ||
            upper === "BUNDLED" ||
            upper === "CANCELLATION REQUESTED" ||
            upper === "CANCEL REQUESTED" ||
            upper === "AUTO-COMPLETED" ||
            upper === "AUTO COMPLETED" ||
            upper === "RESOLVED"
          ) {
            if (!status) status = token.trim();
          } else if (
            upper !== "FALSE" &&
            upper !== "TRUE" &&
            upper !== "NULL" &&
            upper !== "UNDEFINED" &&
            upper !== "[WORKORDER]" &&
            upper !== "_" &&
            upper !== "-" &&
            upper !== "—" &&
            upper !== "–" &&
            upper !== "WORKORDER" &&
            upper !== "N/A" &&
            upper !== "NA" &&
            upper !== "NONE" &&
            !SF_ID_REGEX.test(token.trim().replace(/['"]/g, "")) &&
            !/^[A-Z0-9]{8,}$/i.test(token.trim())
          ) {
            if (!accountName && token.trim().length > 1) {
              accountName = token.trim();
            }
          }
        }
      }

      // Space-separated line fallback
      if (!ticket && line.trim()) {
        const spaceParts = line.trim().split(/\s+/);
        for (let sp = 0; sp < spaceParts.length; sp++) {
          const part = spaceParts[sp];
          const ct = cleanTicketToken(part);
          if (/^[A-Za-z]\d{6,}$/i.test(ct) || ct.length >= 7) {
            ticket = ct;
            const remaining = spaceParts.slice(sp + 1);
            if (remaining.length > 0 && remaining[0]) {
              const r0 = remaining[0].toUpperCase();
              if (r0 === "NAMO" || r0 === "NON" || r0.startsWith("NON-") || r0.startsWith("NON_")) {
                if (r0 === "NON" && remaining.length > 1 && remaining[1]?.toUpperCase() === "NAMO") {
                  rawGroup = "NON-NAMO";
                  accountName = remaining.slice(2).join(" ");
                } else {
                  rawGroup = remaining[0];
                  accountName = remaining.slice(1).join(" ");
                }
              } else {
                accountName = remaining.join(" ");
              }
            }
            break;
          }
        }
      }
    }

    if (!ticket) continue;
    if (seenTickets.has(ticket)) continue;
    seenTickets.add(ticket);

    // Smart heuristic check for Parent WorkOrder (checks parentWorkOrderId and parentTicket, handling dummy nulls)
    const parentCheck = isParentWorkOrderPresent(parentWorkOrderId, parentTicket);

    // Smart heuristic check for Status (checks completed, canceled, closed, etc., while preserving cancellation requested)
    const statusCheck = isStatusCompletedOrCanceled(status);

    // Condition 1: Must be PMS ticket starting with 'A'
    const isAutoPms = ticket.toUpperCase().startsWith("A");

    // Condition 2: Group classification
    const { category, normalizedGroup } = classifyNamoAccountGroup(rawGroup);

    // Determine eligibility and skip reason
    let isEligible = false;
    let skipReason: string | undefined = undefined;

    const isLocked =
      isEntityLockedError(status) ||
      isEntityLockedError(line) ||
      rawTokens.some(isEntityLockedError) ||
      isApprovalSent;

    if (isLocked || isApprovalSent) {
      isEligible = false;
      skipReason = "Approval Pending";
    } else if (isMrCreated) {
      isEligible = false;
      skipReason = "MR Raised (Material Request Created / Is_MR_Created is true)";
    } else if (!isAutoPms) {
      // Condition 1: Skip non-A tickets (B, C, I, X, D, S, etc.)
      isEligible = false;
      skipReason = `Non-PMS ticket (Starts with '${ticket.charAt(0) || "?"}' instead of 'A')`;
    } else if (category === "NAMO") {
      // Condition 2: Start with A but group is NAMO -> Skip
      isEligible = false;
      skipReason = "NAMO Group (Excluded from NON-NAMO cancellation)";
    } else if (category === "UNCLASSIFIED") {
      // Blank / Unknown group -> Hold for verification (never default to NON-NAMO)
      isEligible = false;
      skipReason = "Blank / Unknown Account Group (Unverified)";
    } else if (parentCheck.hasParent) {
      // Condition 3: ParentWorkOrderId or Parent Ticket is present -> Skip even if group is NON-NAMO
      isEligible = false;
      skipReason = `Parent WorkOrder present (${parentCheck.parentIdentifier || parentWorkOrderId || parentTicket})`;
    } else if (statusCheck.isCompletedOrCanceled) {
      // Condition 3: Status is Completed, Canceled, Closed -> Skip
      isEligible = false;
      skipReason = `Status is '${statusCheck.cleanStatus}' (Already Completed/Canceled)`;
    } else {
      // All conditions satisfied: Starts with A, NON-NAMO, ParentWorkOrderId is null, Status active
      isEligible = true;
    }

    // Zero-Tolerance Safety Guard: Under no circumstances allow cancellation if any condition fails
    if (
      !isAutoPms ||
      category !== "NON-NAMO" ||
      parentCheck.hasParent ||
      statusCheck.isCompletedOrCanceled ||
      isLocked ||
      isApprovalSent ||
      isMrCreated
    ) {
      isEligible = false;
    }

    records.push({
      ticket,
      id: sfId || undefined,
      accountGroupName: rawGroup.trim() || normalizedGroup,
      accountGroupCategory: category,
      accountName: sanitizeAccountName(accountName),
      status: status || undefined,
      fgr: fgr || undefined,
      parentWorkOrderId: parentCheck.hasParent ? (parentCheck.parentIdentifier || parentWorkOrderId || undefined) : undefined,
      parentTicket: parentTicket || undefined,
      isChild: parentCheck.hasParent,
      isEligibleForCancellation: isEligible,
      isAutoPms,
      skipReason,
      isApprovalSent: isApprovalSent || isLocked,
      isMrCreated,
      isLocked,
    });
  }

  // Handle any fallback tickets from Step 1 that weren't in Step 3
  if (fallbackTickets.length > 0) {
    for (const fTkt of fallbackTickets) {
      const clean = cleanTicketToken(fTkt);
      if (!clean || seenTickets.has(clean)) continue;
      seenTickets.add(clean);
      const isAutoPms = clean.startsWith("A");
      records.push({
        ticket: clean,
        accountGroupName: "Blank / Unknown",
        accountGroupCategory: "UNCLASSIFIED",
        accountName: "—",
        parentWorkOrderId: undefined,
        parentTicket: undefined,
        isChild: false,
        status: "Not Returned",
        isEligibleForCancellation: false,
        isAutoPms,
        skipReason: isAutoPms ? "Not Returned by SF" : `Non-PMS ticket (Starts with '${clean.charAt(0) || "?"}' instead of 'A')`,
      });
    }
  }

  // Collections per NON-NAMO specifications
  const allAutoPmsTickets = records.filter((r) => r.isAutoPms).map((r) => r.ticket);
  const nonNamoCancellationTickets = records.filter((r) => r.isEligibleForCancellation);
  const namoTickets = records.filter((r) => r.isAutoPms && r.accountGroupCategory === "NAMO");
  const parentWorkOrderTickets = records.filter(
    (r) => r.isAutoPms && r.accountGroupCategory === "NON-NAMO" && r.isChild
  );
  const completedOrCanceledTickets = records.filter(
    (r) =>
      r.isAutoPms &&
      r.accountGroupCategory === "NON-NAMO" &&
      !r.isChild &&
      (r.skipReason?.includes("Completed/Canceled") ?? false)
  );
  const unclassifiedTickets = records.filter((r) => r.isAutoPms && r.accountGroupCategory === "UNCLASSIFIED");
  const approvalPendingTickets = records.filter(
    (r) => r.isApprovalSent || r.isLocked || (r.skipReason && r.skipReason.includes("Approval Pending"))
  );
  const mrCreatedTickets = records.filter(
    (r) => r.isMrCreated || (r.skipReason && r.skipReason.includes("MR Raised"))
  );
  const nonAutoPmsTickets = records.filter((r) => !r.isAutoPms).map((r) => r.ticket);
  const allSkippedTickets = records.filter((r) => !r.isEligibleForCancellation);

  // Generate NAMO output segments for backwards compatibility
  let namoMailSegmentText = "";
  let namoMailSegmentHtml = "";
  let namoPostSegmentText = "";
  let namoPostSegmentHtml = "";

  if (namoTickets.length > 0) {
    const lines: string[] = [];
    lines.push("NAMO Tickets – Excluded from NON-NAMO Cancellation\n");
    lines.push("| Ticket Number | Account Name | Account Group Type |");
    lines.push("|---|---|---|");
    for (const r of namoTickets) {
      lines.push(`| ${r.ticket} | ${r.accountName} | ${r.accountGroupName || "NAMO"} |`);
    }
    namoMailSegmentText = lines.join("\n");

    const htmlRows = namoTickets
      .map(
        (r) =>
          `<tr><td style="padding:6px 10px;border:1px solid #cbd5e1;font-family:monospace;">${r.ticket}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;">${r.accountName}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;font-weight:bold;color:#2563eb;">${r.accountGroupName || "NAMO"}</td></tr>`
      )
      .join("");

    namoMailSegmentHtml = `<p><b>NAMO Tickets – Excluded from NON-NAMO Cancellation</b></p><table style="border-collapse:collapse;width:100%;max-width:600px;font-family:sans-serif;font-size:12px;" border="1" cellpadding="6"><thead><tr style="background:#f1f5f9;text-align:left;"><th style="padding:6px 10px;border:1px solid #cbd5e1;">Ticket Number</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Account Name</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Account Group Type</th></tr></thead><tbody>${htmlRows}</tbody></table>`;

    const postLines: string[] = [];
    postLines.push("NAMO Tickets – Excluded from NON-NAMO Cancellation:");
    for (const r of namoTickets) {
      postLines.push(`• ${r.ticket} | ${r.accountName} | ${r.accountGroupName || "NAMO"}`);
    }
    namoPostSegmentText = postLines.join("\n");
    namoPostSegmentHtml = `<p><b>NAMO Tickets – Excluded from NON-NAMO Cancellation:</b><br>${postLines
      .slice(1)
      .join("<br>")}</p>`;
  }

  // Generate Comprehensive Excluded Segment
  let excludedSegmentText = "";
  let excludedSegmentHtml = "";

  if (allSkippedTickets.length > 0) {
    const lines: string[] = [];
    lines.push("Excluded Tickets – Excluded from NON-NAMO Cancellation\n");
    lines.push("| Ticket Number | Reason | Group | Parent WorkOrder | Status |");
    lines.push("|---|---|---|---|---|");
    for (const r of allSkippedTickets) {
      lines.push(
        `| ${r.ticket} | ${r.skipReason || "Excluded"} | ${r.accountGroupName || "—"} | ${r.parentWorkOrderId || r.parentTicket || "—"} | ${r.status || "—"} |`
      );
    }
    excludedSegmentText = lines.join("\n");

    const htmlRows = allSkippedTickets
      .map(
        (r) =>
          `<tr><td style="padding:6px 10px;border:1px solid #cbd5e1;font-family:monospace;font-weight:bold;">${r.ticket}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;color:#b91c1c;font-weight:600;">${r.skipReason || "Excluded"}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;">${r.accountGroupName || "—"}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;font-family:monospace;">${r.parentWorkOrderId || r.parentTicket || "—"}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;">${r.status || "—"}</td></tr>`
      )
      .join("");

    excludedSegmentHtml = `<p><b>Excluded Tickets – Excluded from NON-NAMO Cancellation</b></p><table style="border-collapse:collapse;width:100%;max-width:700px;font-family:sans-serif;font-size:12px;" border="1" cellpadding="6"><thead><tr style="background:#f1f5f9;text-align:left;"><th style="padding:6px 10px;border:1px solid #cbd5e1;">Ticket Number</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Reason</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Group</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Parent WorkOrder</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Status</th></tr></thead><tbody>${htmlRows}</tbody></table>`;
  }

  // Full templates
  const total = allAutoPmsTickets.length;
  const eligibleCount = nonNamoCancellationTickets.length;
  const totalExcluded = allSkippedTickets.length;

  let nonNamoMailOutputText = "";
  let nonNamoMailOutputHtml = "";
  let nonNamoPostOutputText = "";
  let nonNamoPostOutputHtml = "";

  if (records.length > 0) {
    if (totalExcluded === 0) {
      nonNamoMailOutputText = `Dear,\nCancellation has been done successfully for NON-NAMO tickets.\n\nTotal Auto PMS Tickets: ${total}\nCancelled (NON-NAMO): ${eligibleCount}`;
      nonNamoMailOutputHtml = `<p>Dear,</p><p>Cancellation has been done successfully for NON-NAMO tickets.</p><br><p>Total Auto PMS Tickets: ${total}<br>Cancelled (NON-NAMO): ${eligibleCount}</p>`;
      nonNamoPostOutputText = `@taguser \nCancellation has been done successfully for NON-NAMO tickets.\n\nTotal Auto PMS Tickets: ${total}\nCancelled (NON-NAMO): ${eligibleCount}`;
      nonNamoPostOutputHtml = `<p>@taguser </p><p>Cancellation has been done successfully for NON-NAMO tickets.</p><br><p>Total Auto PMS Tickets: ${total}<br>Cancelled (NON-NAMO): ${eligibleCount}</p>`;
    } else {
      const breakdownLines: string[] = [];
      if (nonAutoPmsTickets.length > 0) {
        breakdownLines.push(`• Total Non-PMS Tickets: ${nonAutoPmsTickets.length}`);
      }
      if (namoTickets.length > 0) {
        breakdownLines.push(`• Skipped NAMO Group Tickets (Condition 2): ${namoTickets.length}`);
      }
      if (parentWorkOrderTickets.length > 0) {
        breakdownLines.push(`• Skipped Child WorkOrders with Parent Present (Condition 3): ${parentWorkOrderTickets.length}`);
      }
      if (completedOrCanceledTickets.length > 0) {
        breakdownLines.push(`• Skipped Completed/Canceled Status (Condition 3): ${completedOrCanceledTickets.length}`);
      }
      if (unclassifiedTickets.length > 0) {
        breakdownLines.push(`• Skipped Unclassified / Blank Group: ${unclassifiedTickets.length}`);
      }
      const approvalPendingRecordsInStep3 = records.filter(
        (r) => r.isApprovalSent || r.isLocked || r.skipReason?.includes("Approval Pending")
      );
      if (approvalPendingRecordsInStep3.length > 0) {
        breakdownLines.push(`• Skipped Approval Pending: ${approvalPendingRecordsInStep3.length}`);
      }

      const summaryText = `Cancellation has been processed for NON-NAMO tickets.\n\nTotal Auto PMS Tickets: ${total}\nCancelled (NON-NAMO): ${eligibleCount}\nTotal Excluded: ${totalExcluded}\n${breakdownLines.join("\n")}`;
      const summaryHtml = `<p>Cancellation has been processed for NON-NAMO tickets.</p><p>Total Auto PMS Tickets: ${total}<br>Cancelled (NON-NAMO): ${eligibleCount}<br>Total Excluded: ${totalExcluded}<br>${breakdownLines.join("<br>")}</p>`;

      nonNamoMailOutputText = `Dear,\n${summaryText}\n\n${excludedSegmentText || namoMailSegmentText}`;
      nonNamoMailOutputHtml = `<p>Dear,</p>${summaryHtml}<br>${excludedSegmentHtml || namoMailSegmentHtml}`;
      nonNamoPostOutputText = `@taguser \n${summaryText}\n\n${namoPostSegmentText || excludedSegmentText}`;
      nonNamoPostOutputHtml = `<p>@taguser </p>${summaryHtml}<br>${namoPostSegmentHtml || excludedSegmentHtml}`;
    }
  }

  return {
    allAutoPmsTickets,
    nonNamoCancellationTickets,
    namoTickets,
    parentWorkOrderTickets,
    completedOrCanceledTickets,
    unclassifiedTickets,
    approvalPendingTickets,
    mrCreatedTickets,
    nonAutoPmsTickets,
    allRecords: records,
    allSkippedTickets,
    namoMailSegmentText,
    namoMailSegmentHtml,
    namoPostSegmentText,
    namoPostSegmentHtml,
    excludedSegmentText,
    excludedSegmentHtml,
    nonNamoMailOutputText,
    nonNamoMailOutputHtml,
    nonNamoPostOutputText,
    nonNamoPostOutputHtml,
  };
}

// =============================================================================
// CCO CANCELLATION: NON-PMS Step 3 Classification & Segregation Logic
// =============================================================================

export interface CcoTicketItem {
  ticket: string; // Complete ticket number (e.g. B25031925463529)
  id?: string; // Salesforce Id (e.g. 0WONy000008eHgfOAE)
  accountGroupName?: string; // Raw or normalized Account Group Name (e.g. "CCO")
  accountGroupCategory?: NamoAccountGroupCategory;
  accountName?: string; // Account/Customer Name
  isEligibleForCancellation: boolean;
  status?: string;
  fgr?: string;
  isAutoPms: boolean;
  parentWorkOrderId?: string;
  parentTicket?: string;
  isChild?: boolean;
  skipReason?: string;
  isApprovalSent?: boolean;
  isMrCreated?: boolean;
  isLocked?: boolean;
}

export interface CcoAlgoResult {
  allTickets: string[]; // Master list of tickets
  ccoCancellationTickets: CcoTicketItem[]; // Eligible for CCO cancellation (Non-PMS, active, no parent, no lock, no MR)
  autoPmsTickets: CcoTicketItem[]; // Excluded: Starts with 'A' (Auto PMS)
  parentWorkOrderTickets: CcoTicketItem[]; // Excluded: ParentWorkOrderId is present (Child WOs)
  completedOrCanceledTickets: CcoTicketItem[]; // Excluded: Status in Completed / Canceled / Closed
  approvalPendingTickets: CcoTicketItem[]; // Excluded: Approval Pending / Locked in Salesforce
  mrCreatedTickets: CcoTicketItem[]; // Excluded: Material Request Created
  allRecords: CcoTicketItem[]; // All parsed records
  allSkippedTickets: CcoTicketItem[]; // All skipped / excluded records
  ccoMailOutputText: string;
  ccoMailOutputHtml: string;
  ccoPostOutputText: string;
  ccoPostOutputHtml: string;
  excludedSegmentText: string;
  excludedSegmentHtml: string;
}

/**
 * CCO CANCELLATION: Process Step 3 input for CCO cancellation page
 * Query:
 * SELECT Id, Ticket_Number_Read_Only__c, ParentWorkOrderId, ParentWorkOrder.Ticket_Number_Read_Only__c, Is_Approval_Sent__c, Is_MR_Created__c, Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status
 * FROM WorkOrder
 * WHERE Ticket_Number_Read_Only__c IN (...)
 *
 * Rules:
 * - CCO is for NON-PMS tickets (prefixes like B, C, D, S, I, X, etc.)
 * - Auto PMS tickets (starting with 'A') are excluded from CCO cancellation
 * - Child work orders with ParentWorkOrderId present are excluded
 * - Terminal statuses (Completed, Canceled, Closed) are excluded
 * - Approval pending / locked records (ENTITY_IS_LOCKED or Is_Approval_Sent__c) are excluded
 * - Material requests (Is_MR_Created__c) are excluded
 */
export function processAlgo1CcoStep3Classification(
  input: string,
  fallbackTickets: string[] = []
): CcoAlgoResult {
  if (!input || !input.trim()) {
    return {
      allTickets: [],
      ccoCancellationTickets: [],
      autoPmsTickets: [],
      parentWorkOrderTickets: [],
      completedOrCanceledTickets: [],
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

  const lines = input.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
  let ticketCol = -1;
  let groupCol = -1;
  let accountNameCol = -1;
  let idCol = -1;
  let statusCol = -1;
  let fgrCol = -1;
  let parentWorkOrderIdCol = -1;
  let parentTicketCol = -1;
  let isApprovalCol = -1;
  let isMrCol = -1;

  const records: CcoTicketItem[] = [];
  const seenTickets = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Check if markdown table divider line (|---|---|)
    if (/^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(line)) {
      continue;
    }

    let rawTokens: string[] = [];
    if (line.includes("\t")) {
      rawTokens = line.split("\t").map(cleanCell);
    } else if (line.includes("|")) {
      rawTokens = line
        .split("|")
        .map(cleanCell)
        .filter((tok, idx, arr) => {
          if ((idx === 0 || idx === arr.length - 1) && !tok) return false;
          return true;
        });
    } else if (line.includes('","') || (line.startsWith('"') && line.includes(','))) {
      rawTokens = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cleanCell);
    } else {
      rawTokens = line.split(/[\t,]+/).map(cleanCell).filter(Boolean);
    }

    const lowerTokens = rawTokens.map((t) => t.toLowerCase().replace(/[^a-z0-9_.]/g, ""));

    // Check if header row
    const hasDataRecord = lowerTokens.some(
      (t) =>
        /^[a-z]\d{6,}$/i.test(t) ||
        /^0wo[a-z0-9]{12,15}$/i.test(t) ||
        /^02i[a-z0-9]{12,15}$/i.test(t)
    );

    const isHeader =
      !hasDataRecord &&
      lowerTokens.some(
        (t) =>
          t === "ticket_number_read_only__c" ||
          t === "parentworkorderid" ||
          t === "parentworkorder" ||
          t === "is_approval_sent__c" ||
          t === "is_mr_created__c" ||
          t === "account.group__c" ||
          t.includes("fgr") ||
          t === "status" ||
          t === "workorder.status" ||
          t === "ticket" ||
          t === "casenumber"
      );

    if (isHeader && ticketCol === -1) {
      lowerTokens.forEach((token, idx) => {
        if (
          token.includes("parentworkorder.ticket") ||
          (token.includes("parent") && (token.includes("ticket") || token.includes("casenumber") || token.includes("number")))
        ) {
          parentTicketCol = idx;
        } else if (
          token === "parentworkorderid" ||
          ((token.includes("parent") && (token.includes("id") || token.includes("workorder"))) && !token.includes("ticket"))
        ) {
          parentWorkOrderIdCol = idx;
        } else if (
          token === "ticket_number_read_only__c" ||
          ((token.includes("ticket") || token.includes("casenumber") || token === "number") && !token.includes("parent"))
        ) {
          if (ticketCol === -1 || token === "ticket_number_read_only__c") {
            ticketCol = idx;
          }
        } else if (token.includes("group") || token === "account.group__c") {
          groupCol = idx;
        } else if (token.includes("fgr") || token.includes("crbf")) {
          fgrCol = idx;
        } else if (
          (token.includes("account") || token.includes("customer")) &&
          !token.includes("group") &&
          !token.includes("id")
        ) {
          accountNameCol = idx;
        } else if (
          token === "id" ||
          (token.endsWith(".id") && !token.includes("parent")) ||
          token === "workorderid"
        ) {
          if (idCol === -1) idCol = idx;
        } else if (
          (token === "status" || token === "workorder.status" || token === "status__c") &&
          !token.includes("fgr") &&
          !token.includes("crbf") &&
          !token.includes("approval")
        ) {
          statusCol = idx;
        } else if (
          token === "is_approval_sent__c" ||
          token === "is_approval_send_c" ||
          token === "is_approval_sent" ||
          token === "is_approval_send" ||
          token.includes("approval_sent") ||
          token.includes("approval_send") ||
          token.includes("is_approval")
        ) {
          isApprovalCol = idx;
        } else if (
          token === "is_mr_created__c" ||
          token === "is_mr_created" ||
          token.includes("mr_created") ||
          token.includes("is_mr")
        ) {
          isMrCol = idx;
        }
      });
      continue;
    }

    let ticket = "";
    let rawGroup = "";
    let accountName = "";
    let sfId = "";
    let status = "";
    let fgr = "";
    let parentWorkOrderId = "";
    let parentTicket = "";
    let isApprovalSent = false;
    let isMrCreated = false;

    if (ticketCol !== -1 && rawTokens[ticketCol]) {
      ticket = cleanTicketToken(rawTokens[ticketCol]);
      if (groupCol !== -1 && rawTokens[groupCol]) rawGroup = rawTokens[groupCol] || "";
      if (accountNameCol !== -1 && rawTokens[accountNameCol]) accountName = rawTokens[accountNameCol] || "";
      if (idCol !== -1 && rawTokens[idCol]) sfId = rawTokens[idCol] || "";
      if (fgrCol !== -1 && rawTokens[fgrCol]) fgr = rawTokens[fgrCol] || "";
      if (statusCol !== -1 && rawTokens[statusCol]) status = rawTokens[statusCol] || "";
      if (parentWorkOrderIdCol !== -1 && rawTokens[parentWorkOrderIdCol]) parentWorkOrderId = rawTokens[parentWorkOrderIdCol] || "";
      if (parentTicketCol !== -1 && rawTokens[parentTicketCol]) parentTicket = rawTokens[parentTicketCol] || "";
      if (isApprovalCol !== -1 && rawTokens[isApprovalCol]) {
        const v = (rawTokens[isApprovalCol] || "").toLowerCase().trim();
        isApprovalSent = v === "true" || v === "1" || v === "yes";
      }
      if (isMrCol !== -1 && rawTokens[isMrCol]) {
        const v = (rawTokens[isMrCol] || "").toLowerCase().trim();
        isMrCreated = v === "true" || v === "1" || v === "yes";
      }
    } else {
      // Headerless fallback
      let assetIdx = -1;
      for (let idx = 0; idx < rawTokens.length; idx++) {
        const rawTok = rawTokens[idx] || "";
        const cleanId = rawTok.replace(/['"]/g, "").trim();
        if (cleanId.toUpperCase().startsWith("02I") && SF_ID_REGEX.test(cleanId)) {
          assetIdx = idx;
          break;
        }
      }

      if (assetIdx !== -1) {
        if (assetIdx + 1 < rawTokens.length) {
          const candStatus = (rawTokens[assetIdx + 1] || "").trim();
          if (candStatus && !candStatus.toUpperCase().startsWith("02I") && !candStatus.toUpperCase().startsWith("0WO")) {
            status = candStatus;
          }
        }
        if (assetIdx - 1 >= 0) {
          fgr = (rawTokens[assetIdx - 1] || "").trim();
        }
      }

      for (let tIdx = 0; tIdx < rawTokens.length; tIdx++) {
        if (assetIdx !== -1 && (tIdx === assetIdx || tIdx === assetIdx - 1 || tIdx === assetIdx + 1)) {
          continue;
        }

        const token = rawTokens[tIdx] || "";
        const ct = cleanTicketToken(token);
        const upper = token.trim().toUpperCase();

        const hasSpaces = /\s/.test(token.trim());
        const hasDigits = /\d/.test(token);

        if (
          !hasSpaces &&
          hasDigits &&
          (/^[A-Za-z]\d{6,}$/i.test(ct) ||
            /^BLK\d+$/i.test(ct) ||
            (/^[A-Za-z0-9_-]{7,}$/.test(ct) && !SF_ID_REGEX.test(ct)))
        ) {
          if (!ticket) {
            ticket = ct;
          } else if (!parentTicket) {
            parentTicket = ct;
          }
        } else if (!hasSpaces && hasDigits && upper.startsWith("BLK") && upper.length >= 5) {
          if (!ticket) {
            ticket = ct;
          } else {
            parentTicket = ct;
          }
        } else if (SF_ID_REGEX.test(token.replace(/['"]/g, "").trim())) {
          const cleanId = token.replace(/['"]/g, "").trim();
          const cleanIdUpper = cleanId.toUpperCase();
          if (cleanIdUpper.startsWith("02I")) {
            continue;
          } else if (cleanIdUpper.startsWith("0WO")) {
            if (!sfId) {
              sfId = cleanId;
            } else if (!parentWorkOrderId) {
              parentWorkOrderId = cleanId;
            }
          } else {
            if (!sfId) {
              sfId = cleanId;
            } else if (!parentWorkOrderId) {
              parentWorkOrderId = cleanId;
            }
          }
        } else {
          if (
            upper === "CCO" ||
            upper === "NAMO" ||
            upper === "NON NAMO" ||
            upper === "NON-NAMO" ||
            upper === "NONNAMO"
          ) {
            if (!rawGroup) rawGroup = token.trim();
          } else if (
            upper === "ACCEPTED" ||
            upper === "CANCELED" ||
            upper === "CANCELLED" ||
            upper === "COMPLETED" ||
            upper === "CLOSED" ||
            upper === "OPEN" ||
            upper === "NEW" ||
            upper === "IN PROGRESS" ||
            upper === "ON HOLD" ||
            upper === "PENDING" ||
            upper === "BUNDLED" ||
            upper === "CANCELLATION REQUESTED" ||
            upper === "CANCEL REQUESTED" ||
            upper === "AUTO-COMPLETED" ||
            upper === "AUTO COMPLETED" ||
            upper === "RESOLVED"
          ) {
            if (!status) status = token.trim();
          } else if (
            upper !== "FALSE" &&
            upper !== "TRUE" &&
            upper !== "NULL" &&
            upper !== "UNDEFINED" &&
            upper !== "[WORKORDER]" &&
            upper !== "_" &&
            upper !== "-" &&
            upper !== "—" &&
            upper !== "–" &&
            upper !== "WORKORDER" &&
            upper !== "N/A" &&
            upper !== "NA" &&
            upper !== "NONE" &&
            !SF_ID_REGEX.test(token.trim().replace(/['"]/g, "")) &&
            !/^[A-Z0-9]{8,}$/i.test(token.trim())
          ) {
            if (!accountName && token.trim().length > 1) {
              accountName = token.trim();
            }
          }
        }
      }

      if (!ticket && line.trim()) {
        const spaceParts = line.trim().split(/\s+/);
        for (let sp = 0; sp < spaceParts.length; sp++) {
          const part = spaceParts[sp];
          const ct = cleanTicketToken(part);
          if (/^[A-Za-z]\d{6,}$/i.test(ct) || ct.length >= 7) {
            ticket = ct;
            break;
          }
        }
      }
    }

    if (!ticket) continue;
    if (seenTickets.has(ticket)) continue;
    seenTickets.add(ticket);

    const parentCheck = isParentWorkOrderPresent(parentWorkOrderId, parentTicket);
    const statusCheck = isStatusCompletedOrCanceled(status);
    const isAutoPms = ticket.toUpperCase().startsWith("A");

    let isEligible = false;
    let skipReason: string | undefined = undefined;

    const isLocked =
      isEntityLockedError(status) ||
      isEntityLockedError(line) ||
      rawTokens.some(isEntityLockedError) ||
      isApprovalSent;

    if (isAutoPms) {
      isEligible = false;
      skipReason = "Auto PMS ticket (Excluded from CCO Cancellation - requires approval)";
    } else if (isLocked || isApprovalSent) {
      isEligible = false;
      skipReason = "Approval Pending (Record Locked in Salesforce)";
    } else if (isMrCreated) {
      isEligible = false;
      skipReason = "MR Raised (Material Request Created / Is_MR_Created is true)";
    } else if (parentCheck.hasParent) {
      isEligible = false;
      skipReason = `Parent WorkOrder present (${parentCheck.parentIdentifier || parentWorkOrderId || parentTicket})`;
    } else if (statusCheck.isCompletedOrCanceled) {
      isEligible = false;
      skipReason = `Status is '${statusCheck.cleanStatus}' (Already Completed/Canceled)`;
    } else {
      isEligible = true;
    }

    if (
      isAutoPms ||
      parentCheck.hasParent ||
      statusCheck.isCompletedOrCanceled ||
      isLocked ||
      isApprovalSent ||
      isMrCreated
    ) {
      isEligible = false;
    }

    const { category } = classifyNamoAccountGroup(rawGroup);

    records.push({
      ticket,
      id: sfId || undefined,
      accountGroupName: rawGroup.trim() || "CCO",
      accountGroupCategory: category,
      accountName: sanitizeAccountName(accountName),
      status: status || undefined,
      fgr: fgr || undefined,
      parentWorkOrderId: parentCheck.hasParent ? (parentCheck.parentIdentifier || parentWorkOrderId || undefined) : undefined,
      parentTicket: parentTicket || undefined,
      isChild: parentCheck.hasParent,
      isEligibleForCancellation: isEligible,
      isAutoPms,
      skipReason,
      isApprovalSent,
      isMrCreated,
      isLocked,
    });
  }

  // Also include fallback tickets if any were pasted in Step 1 but not returned by SOQL
  if (fallbackTickets && fallbackTickets.length > 0) {
    for (const rawT of fallbackTickets) {
      const ct = cleanTicketToken(rawT);
      if (!ct) continue;
      if (!seenTickets.has(ct)) {
        seenTickets.add(ct);
        const isAutoPms = ct.toUpperCase().startsWith("A");
        records.push({
          ticket: ct,
          isEligibleForCancellation: false,
          isAutoPms,
          skipReason: isAutoPms
            ? "Auto PMS ticket (Excluded from CCO Cancellation - requires approval)"
            : "Ticket not returned in Salesforce SOQL results (Not Found / Outside Scope)",
        });
      }
    }
  }

  const ccoCancellationTickets = records.filter((r) => r.isEligibleForCancellation);
  const autoPmsTickets = records.filter((r) => r.isAutoPms);
  const parentWorkOrderTickets = records.filter((r) => !r.isEligibleForCancellation && r.isChild);
  const completedOrCanceledTickets = records.filter(
    (r) => !r.isEligibleForCancellation && isStatusCompletedOrCanceled(r.status).isCompletedOrCanceled
  );
  const approvalPendingTickets = records.filter(
    (r) => !r.isEligibleForCancellation && (r.isApprovalSent || r.isLocked || r.skipReason?.includes("Approval Pending"))
  );
  const mrCreatedTickets = records.filter((r) => !r.isEligibleForCancellation && r.isMrCreated);
  const allSkippedTickets = records.filter((r) => !r.isEligibleForCancellation);
  const allTickets = Array.from(new Set(records.map((r) => r.ticket)));

  // Output formatting
  const total = records.length;
  const totalReady = ccoCancellationTickets.length;
  const totalExcluded = allSkippedTickets.length;

  let excludedSegmentText = "";
  let excludedSegmentHtml = "";

  if (allSkippedTickets.length > 0) {
    const lines: string[] = [];
    lines.push("Excluded Tickets – Excluded from CCO Cancellation\n");
    lines.push("| Ticket Number | Reason | Group | Parent WorkOrder | Status |");
    lines.push("|---|---|---|---|---|");
    for (const r of allSkippedTickets) {
      lines.push(
        `| ${r.ticket} | ${r.skipReason || "Excluded"} | ${r.accountGroupName || "—"} | ${r.parentWorkOrderId || r.parentTicket || "—"} | ${r.status || "—"} |`
      );
    }
    excludedSegmentText = lines.join("\n");

    const htmlRows = allSkippedTickets
      .map(
        (r) =>
          `<tr><td style="padding:6px 10px;border:1px solid #cbd5e1;font-family:monospace;font-weight:bold;">${r.ticket}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;color:#b91c1c;font-weight:600;">${r.skipReason || "Excluded"}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;">${r.accountGroupName || "—"}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;font-family:monospace;">${r.parentWorkOrderId || r.parentTicket || "—"}</td><td style="padding:6px 10px;border:1px solid #cbd5e1;">${r.status || "—"}</td></tr>`
      )
      .join("");

    excludedSegmentHtml = `<p><b>Excluded Tickets – Excluded from CCO Cancellation</b></p><table style="border-collapse:collapse;width:100%;max-width:700px;font-family:sans-serif;font-size:12px;" border="1" cellpadding="6"><thead><tr style="background:#f1f5f9;text-align:left;"><th style="padding:6px 10px;border:1px solid #cbd5e1;">Ticket Number</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Reason</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Group</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Parent WorkOrder</th><th style="padding:6px 10px;border:1px solid #cbd5e1;">Status</th></tr></thead><tbody>${htmlRows}</tbody></table>`;
  }

  let ccoMailOutputText = "";
  let ccoMailOutputHtml = "";
  let ccoPostOutputText = "";
  let ccoPostOutputHtml = "";

  if (records.length > 0) {
    if (totalExcluded === 0) {
      ccoMailOutputText = `Dear,\nCancellation has been done successfully.\n\nTotal Tickets: ${total}`;
      ccoMailOutputHtml = `<div style="font-family: Calibri, Arial, sans-serif; font-size: 13px; line-height: 1.5;">${renderEmailHeader("Dear Team,")}<p style="margin-top: 0; margin-bottom: 12px;">Cancellation has been done successfully.</p><p style="margin-top: 0; margin-bottom: 12px;">Total Tickets: ${total}</p></div>`;
      ccoPostOutputText = `@taguser \nCancellation has been done successfully.\n\nTotal Tickets: ${total}`;
      ccoPostOutputHtml = `<p>@taguser </p><p>Cancellation has been done successfully.</p><br><p>Total Tickets: ${total}</p>`;
    } else {
      const breakdownLines: string[] = [];
      if (autoPmsTickets.length > 0) {
        breakdownLines.push(`• Skipped Auto PMS Tickets: ${autoPmsTickets.length}`);
      }
      if (parentWorkOrderTickets.length > 0) {
        breakdownLines.push(`• Skipped Child WorkOrders with Parent Present: ${parentWorkOrderTickets.length}`);
      }
      if (completedOrCanceledTickets.length > 0) {
        breakdownLines.push(`• Skipped Completed/Canceled Status: ${completedOrCanceledTickets.length}`);
      }
      if (mrCreatedTickets.length > 0) {
        breakdownLines.push(`• Skipped Material Request (MR) Created: ${mrCreatedTickets.length}`);
      }
      if (approvalPendingTickets.length > 0) {
        breakdownLines.push(`• Skipped Approval Pending: ${approvalPendingTickets.length}`);
      }

      const summaryText = `Cancellation has been processed for CCO tickets.\n\nTotal Tickets: ${total}\nCancelled (CCO): ${totalReady}\n${approvalPendingTickets.length > 0 ? `Approval Pending: ${approvalPendingTickets.length}\n` : ""}Total Excluded: ${totalExcluded}\n${breakdownLines.join("\n")}`;
      const summaryHtml = `<p>Cancellation has been processed for CCO tickets.</p><p>Total Tickets: ${total}<br>Cancelled (CCO): ${totalReady}<br>${approvalPendingTickets.length > 0 ? `Approval Pending: ${approvalPendingTickets.length}<br>` : ""}Total Excluded: ${totalExcluded}<br>${breakdownLines.join("<br>")}</p>`;

      let lockedDetailsText = "";
      let lockedDetailsHtml = "";
      if (approvalPendingTickets.length > 0) {
        lockedDetailsText = `\n\nApproval Pending:\nApproval is pending against the following ticket(s):\n${approvalPendingTickets.map((t) => `• ${t.ticket}`).join("\n")}`;
        lockedDetailsHtml = `<br><p><b>Approval Pending:</b><br>Approval is pending against the following ticket(s):<br>${approvalPendingTickets.map((t) => `• ${t.ticket}`).join("<br>")}</p>`;
      }

      let autoPmsDetailsText = "";
      let autoPmsDetailsHtml = "";
      if (autoPmsTickets.length > 0) {
        autoPmsDetailsText = `\n\nAuto PMS Tickets (Requires Approval):\nThe following Auto PMS ticket(s) cannot be cancelled under CCO without department approval (Suraj Sir - UCPG / Vishal Sir - CPSD):\n${autoPmsTickets.map((t) => `• ${t.ticket}`).join("\n")}`;
        autoPmsDetailsHtml = `<br><p><b>Auto PMS Tickets (Requires Approval):</b><br>The following Auto PMS ticket(s) cannot be cancelled under CCO without department approval (Suraj Sir - UCPG / Vishal Sir - CPSD):<br>${autoPmsTickets.map((t) => `• ${t.ticket}`).join("<br>")}</p>`;
      }

      let mrCreatedDetailsText = "";
      let mrCreatedDetailsHtml = "";
      if (mrCreatedTickets.length > 0) {
        mrCreatedDetailsText = `\n\nMaterial Request (MR) Created:\nThe following ticket(s) have an active Material Request created and cannot be cancelled:\n${mrCreatedTickets.map((t) => `• ${t.ticket}`).join("\n")}`;
        mrCreatedDetailsHtml = `<br><p><b>Material Request (MR) Created:</b><br>The following ticket(s) have an active Material Request created and cannot be cancelled:<br>${mrCreatedTickets.map((t) => `• ${t.ticket}`).join("<br>")}</p>`;
      }

      let parentDetailsText = "";
      let parentDetailsHtml = "";
      if (parentWorkOrderTickets.length > 0) {
        parentDetailsText = `\n\nChild WorkOrders (Parent Present):\nThe following ticket(s) have a parent work order present and cannot be cancelled:\n${parentWorkOrderTickets.map((t) => `• ${t.ticket}${t.parentWorkOrderId || t.parentTicket ? ` (Parent: ${t.parentTicket || t.parentWorkOrderId})` : ""}`).join("\n")}`;
        parentDetailsHtml = `<br><p><b>Child WorkOrders (Parent Present):</b><br>The following ticket(s) have a parent work order present and cannot be cancelled:<br>${parentWorkOrderTickets.map((t) => `• ${t.ticket}${t.parentWorkOrderId || t.parentTicket ? ` (Parent: ${t.parentTicket || t.parentWorkOrderId})` : ""}`).join("<br>")}</p>`;
      }

      let completedDetailsText = "";
      let completedDetailsHtml = "";
      if (completedOrCanceledTickets.length > 0) {
        completedDetailsText = `\n\nAlready Completed / Canceled:\nThe following ticket(s) are already completed or canceled:\n${completedOrCanceledTickets.map((t) => `• ${t.ticket}${t.status ? ` (Status: ${t.status})` : ""}`).join("\n")}`;
        completedDetailsHtml = `<br><p><b>Already Completed / Canceled:</b><br>The following ticket(s) are already completed or canceled:<br>${completedOrCanceledTickets.map((t) => `• ${t.ticket}${t.status ? ` (Status: ${t.status})` : ""}`).join("<br>")}</p>`;
      }

      const detailSectionsText = `${lockedDetailsText}${autoPmsDetailsText}${mrCreatedDetailsText}${parentDetailsText}${completedDetailsText}`;
      const detailSectionsHtml = `${lockedDetailsHtml}${autoPmsDetailsHtml}${mrCreatedDetailsHtml}${parentDetailsHtml}${completedDetailsHtml}`;

      const tableText = excludedSegmentText ? `\n\n${excludedSegmentText}` : "";
      const tableHtml = excludedSegmentHtml ? `<br>${excludedSegmentHtml}` : "";

      ccoMailOutputText = `Dear,\n${summaryText}${detailSectionsText}${tableText}`;
      ccoMailOutputHtml = `<div style="font-family: Calibri, Arial, sans-serif; font-size: 13px; line-height: 1.5;">${renderEmailHeader("Dear Team,")}${summaryHtml}${detailSectionsHtml}${tableHtml}</div>`;
      ccoPostOutputText = `@taguser \n${summaryText}${detailSectionsText}${tableText}`;
      ccoPostOutputHtml = `<p>@taguser </p>${summaryHtml}${detailSectionsHtml}${tableHtml}`;
    }
  }

  return {
    allTickets,
    ccoCancellationTickets,
    autoPmsTickets,
    parentWorkOrderTickets,
    completedOrCanceledTickets,
    approvalPendingTickets,
    mrCreatedTickets,
    allRecords: records,
    allSkippedTickets,
    ccoMailOutputText,
    ccoMailOutputHtml,
    ccoPostOutputText,
    ccoPostOutputHtml,
    excludedSegmentText,
    excludedSegmentHtml,
  };
}
// =============================================================================

export interface AccountCheckRow {
  id: string;
  ticket: string;
  parentId: string;
  parentTicket: string;
  isApprovalSent: boolean;
  isMrCreated: boolean;
  isLocked?: boolean;
  accountGroup: string;
  accountGroupCategory: "NAMO" | "NON-NAMO" | "UNCLASSIFIED";
  fgr: string;
  assetId: string;
  status: string;
  isParent: boolean;
  isChild: boolean;
  isPms: boolean;
}

export interface AccountCheckResult {
  totalCount: number;
  allRows: AccountCheckRow[];
  namoCount: number;
  nonNamoCount: number;
  unclassifiedGroupCount: number;
  parentCount: number;
  childCount: number;
  pmsCount: number;
  nonPmsCount: number;
  approvalSentCount: number;
  mrCreatedCount: number;
}

function parseDelimitedLine(line: string): string[] {
  if (line.includes("\t")) {
    return line.split("\t").map(cleanCell);
  }
  if (line.includes("|")) {
    return line
      .split("|")
      .map(cleanCell)
      .filter((tok, idx, arr) => {
        if ((idx === 0 || idx === arr.length - 1) && !tok) return false;
        return true;
      });
  }
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(cleanCell(cur));
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cleanCell(cur));
  return result;
}

/**
 * Account Check: Parse Salesforce SOQL Result Batch containing WorkOrder details
 * Columns: Id, Ticket_Number_Read_Only__c, ParentWorkOrderId, ParentWorkOrder.Ticket_Number_Read_Only__c,
 *          Is_Approval_Sent__c, Is_MR_Created__c, Account.Group__c, FGR_Approved_Reject_For_CRBF__c, AssetId, Status
 */
export function processAccountCheckClassification(
  input: string,
  fallbackTickets: string[] = []
): AccountCheckResult {
  if (!input || !input.trim()) {
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

  const lines = input.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
  let idCol = -1;
  let ticketCol = -1;
  let parentIdCol = -1;
  let parentTicketCol = -1;
  let isApprovalCol = -1;
  let isMrCol = -1;
  let groupCol = -1;
  let fgrCol = -1;
  let assetIdCol = -1;
  let statusCol = -1;

  const records: AccountCheckRow[] = [];
  const seenTickets = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    if (/^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(line)) continue;
    const tokens = parseDelimitedLine(line);
    const lowerTokens = tokens.map((t) => (t || "").toLowerCase().replace(/[^a-z0-9_.]/g, ""));

    const hasDataRecord = lowerTokens.some(
      (t) =>
        /^[a-z]\d{6,}$/i.test(t) ||
        /^0wo[a-z0-9]{12,15}$/i.test(t) ||
        /^02i[a-z0-9]{12,15}$/i.test(t)
    );

    const isHeader =
      !hasDataRecord &&
      lowerTokens.some(
        (t) =>
          t === "ticket_number_read_only__c" ||
          t === "parentworkorderid" ||
          t === "parentworkorder" ||
          t === "is_approval_sent__c" ||
          t === "is_mr_created__c" ||
          t === "account.group__c" ||
          t.includes("fgr") ||
          t === "status" ||
          t === "workorder.status" ||
          t === "ticket" ||
          t === "casenumber" ||
          t.includes("approval")
      );

    if (isHeader && ticketCol === -1) {
      lowerTokens.forEach((tok, idx) => {
        if (!tok) return;
        if (tok === "id" || tok === "workorderid") {
          idCol = idx;
        } else if (
          tok.includes("parentworkorder.ticket") ||
          (tok.includes("ticket") && tok.includes("parent"))
        ) {
          parentTicketCol = idx;
        } else if (
          tok === "ticket_number_read_only__c" ||
          (tok.includes("ticket") && !tok.includes("parent"))
        ) {
          ticketCol = idx;
        } else if (
          tok === "parentworkorderid" ||
          (tok.includes("parent") && tok.includes("id"))
        ) {
          parentIdCol = idx;
        } else if (
          tok.includes("approval_sent") ||
          tok.includes("approval_send") ||
          tok.includes("is_approval")
        ) {
          isApprovalCol = idx;
        } else if (tok.includes("mr_created")) {
          isMrCol = idx;
        } else if (
          tok.includes("account.group") ||
          tok === "group__c" ||
          tok === "group"
        ) {
          groupCol = idx;
        } else if (tok.includes("fgr_approved_reject") || tok.includes("fgr")) {
          fgrCol = idx;
        } else if (tok === "assetid") {
          assetIdCol = idx;
        } else if (
          (tok === "status" || tok === "workorder.status" || tok === "status__c") &&
          !tok.includes("fgr") &&
          !tok.includes("crbf") &&
          !tok.includes("approval")
        ) {
          statusCol = idx;
        }
      });
      continue;
    }

    if (tokens.length < 2) continue;

    let id = "";
    let ticket = "";
    let parentId = "";
    let parentTicket = "";
    let isApprovalSent = false;
    let isMrCreated = false;
    let accountGroup = "";
    let fgr = "";
    let assetId = "";
    let status = "";

    if (ticketCol !== -1 || idCol !== -1) {
      id = idCol !== -1 ? (tokens[idCol] || "") : "";
      ticket = ticketCol !== -1 ? cleanTicketToken(tokens[ticketCol] || "") : "";
      parentId = parentIdCol !== -1 ? (tokens[parentIdCol] || "") : "";
      parentTicket = parentTicketCol !== -1 ? cleanTicketToken(tokens[parentTicketCol] || "") : "";
      isApprovalSent =
        isApprovalCol !== -1 ? (tokens[isApprovalCol] || "").toLowerCase() === "true" : false;
      isMrCreated =
        isMrCol !== -1 ? (tokens[isMrCol] || "").toLowerCase() === "true" : false;
      accountGroup = groupCol !== -1 ? (tokens[groupCol] || "") : "";
      fgr = fgrCol !== -1 ? (tokens[fgrCol] || "") : "";
      assetId = assetIdCol !== -1 ? (tokens[assetIdCol] || "") : "";
      status = statusCol !== -1 ? (tokens[statusCol] || "") : "";
    } else {
      // Headerless fallback
      let assetIdx = -1;
      for (let idx = 0; idx < tokens.length; idx++) {
        const cleanId = (tokens[idx] || "").replace(/['"]/g, "").trim();
        if (cleanId.toUpperCase().startsWith("02I") && SF_ID_REGEX.test(cleanId)) {
          assetIdx = idx;
          assetId = cleanId;
          break;
        }
      }
      if (assetIdx !== -1) {
        if (assetIdx + 1 < tokens.length) {
          const cand = (tokens[assetIdx + 1] || "").trim();
          if (cand && !cand.toUpperCase().startsWith("02I") && !cand.toUpperCase().startsWith("0WO")) {
            status = cand;
          }
        }
        if (assetIdx - 1 >= 0) {
          fgr = (tokens[assetIdx - 1] || "").trim();
        }
      }
      for (let tIdx = 0; tIdx < tokens.length; tIdx++) {
        if (assetIdx !== -1 && (tIdx === assetIdx || tIdx === assetIdx - 1 || tIdx === assetIdx + 1)) {
          continue;
        }
        const tok = tokens[tIdx] || "";
        const ct = cleanTicketToken(tok);
        const upper = tok.trim().toUpperCase();

        if (
          !/\s/.test(tok.trim()) &&
          /\d/.test(tok) &&
          (/^[A-Za-z]\d{6,}$/i.test(ct) || /^BLK\d+$/i.test(ct) || (/^[A-Za-z0-9_-]{7,}$/.test(ct) && !SF_ID_REGEX.test(ct)))
        ) {
          if (!ticket && !upper.startsWith("BLK")) {
            ticket = ct;
          } else if (upper.startsWith("BLK") || !parentTicket) {
            parentTicket = ct;
          }
        } else if (SF_ID_REGEX.test(tok.replace(/['"]/g, "").trim())) {
          const cleanId = tok.replace(/['"]/g, "").trim();
          if (cleanId.toUpperCase().startsWith("0WO")) {
            if (!id) id = cleanId;
            else if (!parentId) parentId = cleanId;
          }
        } else if (upper.includes("NAMO")) {
          accountGroup = tok.trim();
        } else if (
          !status &&
          (upper === "ACCEPTED" ||
            upper === "COMPLETED" ||
            upper === "CANCELED" ||
            upper === "IN PROGRESS" ||
            upper === "ON HOLD" ||
            upper === "OPEN")
        ) {
          status = tok.trim();
        }
      }
    }

    if (!ticket && !id) continue;

    const key = ticket || id;
    if (seenTickets.has(key)) continue;
    seenTickets.add(key);

    const groupUpper = (accountGroup || "").toUpperCase().trim();
    let accountGroupCategory: "NAMO" | "NON-NAMO" | "UNCLASSIFIED" = "UNCLASSIFIED";
    if (groupUpper.includes("NON") && groupUpper.includes("NAMO")) {
      accountGroupCategory = "NON-NAMO";
    } else if (groupUpper.includes("NAMO")) {
      accountGroupCategory = "NAMO";
    }

    const isChild = Boolean(
      (parentId && parentId.trim() !== "" && parentId.trim() !== "null" && parentId.trim() !== "-") ||
      (parentTicket && parentTicket.trim() !== "" && parentTicket.trim() !== "null" && parentTicket.trim() !== "-")
    );
    const isParent = !isChild;
    const isPms = ticket ? ticket.toUpperCase().startsWith("A") : false;

    records.push({
      id,
      ticket,
      parentId,
      parentTicket,
      isApprovalSent,
      isMrCreated,
      isLocked: isApprovalSent || isEntityLockedError(status),
      accountGroup: accountGroup || "Blank / Unknown",
      accountGroupCategory,
      fgr,
      assetId,
      status: status || "—",
      isParent,
      isChild,
      isPms,
    });
  }

  // Handle fallback tickets from Step 1 that were not returned in Step 3
  if (fallbackTickets.length > 0) {
    for (const ft of fallbackTickets) {
      const clean = cleanTicketToken(ft);
      if (!clean || seenTickets.has(clean)) continue;
      seenTickets.add(clean);
      records.push({
        id: "",
        ticket: clean,
        parentId: "",
        parentTicket: "",
        isApprovalSent: false,
        isMrCreated: false,
        isLocked: false,
        accountGroup: "Not Returned by SF",
        accountGroupCategory: "UNCLASSIFIED",
        fgr: "",
        assetId: "",
        status: "Not Returned",
        isParent: true,
        isChild: false,
        isPms: clean.toUpperCase().startsWith("A"),
      });
    }
  }

  const namoCount = records.filter((r) => r.accountGroupCategory === "NAMO").length;
  const nonNamoCount = records.filter((r) => r.accountGroupCategory === "NON-NAMO").length;
  const unclassifiedGroupCount = records.filter(
    (r) => r.accountGroupCategory === "UNCLASSIFIED"
  ).length;
  const parentCount = records.filter((r) => r.isParent).length;
  const childCount = records.filter((r) => r.isChild).length;
  const pmsCount = records.filter((r) => r.isPms).length;
  const nonPmsCount = records.filter((r) => !r.isPms).length;
  const approvalSentCount = records.filter((r) => r.isApprovalSent).length;
  const mrCreatedCount = records.filter((r) => r.isMrCreated).length;

  return {
    totalCount: records.length,
    allRows: records,
    namoCount,
    nonNamoCount,
    unclassifiedGroupCount,
    parentCount,
    childCount,
    pmsCount,
    nonPmsCount,
    approvalSentCount,
    mrCreatedCount,
  };
}

// =============================================================================
// FAILED RESULTS PARSER: Step 4 Input Parser & Approval Pending / Locked Record Handler
// =============================================================================

export interface ParsedFailedResult {
  allFailedTickets: string[]; // Combined list of all failed/locked tickets
  lockedTickets: string[]; // Tickets where record lock occurred (ENTITY_IS_LOCKED -> Approval Pending)
  otherFailedTickets: string[]; // Tickets failed due to other errors/exceptions
  rawEntries: {
    ticket: string;
    id?: string;
    isLocked: boolean;
    rawError?: string;
  }[];
}

const FAILED_TICKET_FALLBACK_REGEX = /(?:^|[^A-Za-z0-9])([BISXCAD]\d{6,})(?![A-Za-z0-9])/gi;

/**
 * Parses Step 4 input containing failed cancellation results from Workbench CSV,
 * DataLoader result files, Dev Console, or manual paste.
 * Maps Salesforce IDs (0WONy...) back to Ticket Numbers via idToTicketMap.
 * Categorizes ENTITY_IS_LOCKED records as Approval Pending tickets.
 */
export function parseCancellationFailedResults(
  input: string,
  idToTicketMap?: Map<string, string> | Record<string, string>
): ParsedFailedResult {
  if (!input || !input.trim()) {
    return {
      allFailedTickets: [],
      lockedTickets: [],
      otherFailedTickets: [],
      rawEntries: [],
    };
  }

  const lookupTicketById = (idStr?: string | null): string | undefined => {
    if (!idStr) return undefined;
    const clean = idStr.trim();
    if (!idToTicketMap) return undefined;

    if (idToTicketMap instanceof Map) {
      return (
        idToTicketMap.get(clean) ||
        idToTicketMap.get(clean.toLowerCase()) ||
        (clean.length >= 15 ? idToTicketMap.get(clean.substring(0, 15)) : undefined) ||
        (clean.length >= 15 ? idToTicketMap.get(clean.substring(0, 15).toLowerCase()) : undefined)
      );
    } else {
      return (
        idToTicketMap[clean] ||
        idToTicketMap[clean.toLowerCase()] ||
        (clean.length >= 15 ? idToTicketMap[clean.substring(0, 15)] : undefined) ||
        (clean.length >= 15 ? idToTicketMap[clean.substring(0, 15).toLowerCase()] : undefined)
      );
    }
  };

  const lines = input.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
  const rawEntries: { ticket: string; id?: string; isLocked: boolean; rawError?: string }[] = [];
  const seenTickets = new Set<string>();
  const lockedTickets: string[] = [];
  const otherFailedTickets: string[] = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    if (!line) continue;
    const tokens = parseDelimitedLine(line);
    if (tokens.length === 0) continue;

    // Check if line is header (data row starting with a valid Salesforce ID is never a header)
    const firstTokClean = (tokens[0] || "").replace(/['"\s]/g, "");
    const lowerTokens = tokens.map((t) => t.toLowerCase().trim());
    const isHeader =
      !SF_ID_REGEX.test(firstTokClean) &&
      lineIdx <= 1 &&
      lowerTokens.some(
        (t) =>
          t === "id" ||
          t.endsWith(".id") ||
          t === "workorderid" ||
          t === "success" ||
          t === "error" ||
          t === "status" ||
          t === "ticket_number_read_only__c" ||
          t === "ticket" ||
          t === "ticket number"
      );
    if (isHeader) continue;

    // Check if row indicates explicit success (e.g. Workbench CSV "true")
    const isExplicitSuccess = tokens.some((t) => t.trim().toLowerCase() === "true");
    const hasErrorToken = tokens.some((t) => isEntityLockedError(t) || /error|exception|fail/i.test(t));
    if (isExplicitSuccess && !hasErrorToken && !isEntityLockedError(line)) {
      continue;
    }

    let detectedId = "";
    let detectedTicket = "";
    let isLocked = isEntityLockedError(line);
    let rawError = "";

    // Multiline error detection (e.g. ticket on line N, error on line N+1)
    if (!isLocked && lineIdx + 1 < lines.length) {
      const nextLine = lines[lineIdx + 1];
      if (nextLine && isEntityLockedError(nextLine)) {
        isLocked = true;
        rawError = nextLine.trim();
      }
    }

    for (const tok of tokens) {
      if (isEntityLockedError(tok)) {
        isLocked = true;
        rawError = tok.trim();
      }

      const cleanId = tok.replace(/['"\s]/g, "").trim();
      if (SF_ID_REGEX.test(cleanId) && !cleanId.toUpperCase().startsWith("02I")) {
        detectedId = cleanId;
      }

      const ct = cleanTicketToken(tok);
      if (
        ct &&
        !isEntityLockedError(tok) &&
        !tok.includes(" ") &&
        /\d/.test(ct) &&
        !SF_ID_REGEX.test(cleanId) &&
        !/^0WO/i.test(ct) &&
        !/^02I/i.test(ct) &&
        ct.length >= 6
      ) {
        detectedTicket = ct;
      }
    }

    // If ticket was not extracted from individual token, extract via regex from line
    if (!detectedTicket) {
      const lineTicketMatches = line.match(/(?:^|[^A-Za-z0-9])([A-Za-z]\d{6,})(?![A-Za-z0-9])/g);
      if (lineTicketMatches) {
        for (const m of lineTicketMatches) {
          const ct = cleanTicketToken(m);
          if (ct && !SF_ID_REGEX.test(ct) && !/^0WO/i.test(ct) && !/^02I/i.test(ct)) {
            detectedTicket = ct;
            break;
          }
        }
      }
    }
    if (!detectedId) {
      const lineIdMatch = line.match(/(?:^|[^A-Za-z0-9])(0WO[A-Za-z0-9]{12,15})(?![A-Za-z0-9])/i);
      if (lineIdMatch && lineIdMatch[1]) {
        detectedId = lineIdMatch[1].trim();
      }
    }

    // Resolve ticket via idToTicketMap if needed
    if (!detectedTicket && detectedId) {
      const resolved = lookupTicketById(detectedId);
      if (resolved) {
        detectedTicket = resolved;
      }
    }

    const finalTicket = detectedTicket || detectedId;
    if (!finalTicket) continue;

    if (!seenTickets.has(finalTicket)) {
      seenTickets.add(finalTicket);
      if (isLocked) {
        lockedTickets.push(finalTicket);
      } else {
        otherFailedTickets.push(finalTicket);
      }
      rawEntries.push({
        ticket: finalTicket,
        id: detectedId || undefined,
        isLocked,
        rawError: rawError || undefined,
      });
    }
  }

  // Fallback: If no structured tickets were parsed, run regex extraction
  if (seenTickets.size === 0) {
    const isEntireInputLocked = isEntityLockedError(input);
    const matches = input.match(FAILED_TICKET_FALLBACK_REGEX) || [];
    for (const m of matches) {
      const ct = cleanTicketToken(m);
      if (ct && !seenTickets.has(ct)) {
        seenTickets.add(ct);
        if (isEntireInputLocked) {
          lockedTickets.push(ct);
        } else {
          otherFailedTickets.push(ct);
        }
        rawEntries.push({ ticket: ct, isLocked: isEntireInputLocked });
      }
    }
  }

  // Cross-check: If entire input contains ENTITY_IS_LOCKED and lockedTickets is empty but otherFailedTickets has items,
  // classify them all as lockedTickets (Approval Pending)
  if (lockedTickets.length === 0 && isEntityLockedError(input) && otherFailedTickets.length > 0) {
    while (otherFailedTickets.length > 0) {
      const t = otherFailedTickets.shift()!;
      lockedTickets.push(t);
    }
  }

  const allFailedTickets = [...lockedTickets, ...otherFailedTickets];

  return {
    allFailedTickets,
    lockedTickets,
    otherFailedTickets,
    rawEntries,
  };
}

// =============================================================================
// NON-NAMO EXECUTION SUMMARY: Email & Post Output Generator
// =============================================================================

export interface NonNamoExecutionSummaryOutput {
  mailText: string;
  mailHtml: string;
  postText: string;
  postHtml: string;
}

export function buildNonNamoExecutionSummary(
  accountCheckResult: AccountCheckResult,
  failedTickets: string[] = [],
  lockedTickets: string[] = []
): NonNamoExecutionSummaryOutput {
  if (!accountCheckResult || accountCheckResult.totalCount === 0) {
    return {
      mailText: "",
      mailHtml: "",
      postText: "",
      postHtml: "",
    };
  }

  const allRows = accountCheckResult.allRows || [];
  const totalTickets = accountCheckResult.totalCount;

  // 1. Condition 1: Non-PMS Tickets (Starts with Non-'A' e.g. B, C, I, X, etc.)
  const nonPmsRows = allRows.filter((r) => !r.isPms);
  const nonPmsCount = nonPmsRows.length;
  const nonPmsTickets = nonPmsRows.map((r) => r.ticket).filter(Boolean);

  // 2. PMS Tickets ('A' series)
  const pmsRows = allRows.filter((r) => r.isPms);
  const totalPms = pmsRows.length;

  // 3. Condition 2: NAMO vs NON-NAMO PMS tickets
  const namoRows = pmsRows.filter((r) => r.accountGroupCategory === "NAMO");
  const nonNamoRows = pmsRows.filter((r) => r.accountGroupCategory === "NON-NAMO");
  const totalNamo = namoRows.length;
  const totalNonNamo = nonNamoRows.length;
  const pendingNamo = totalNamo;
  const namoTickets = namoRows.map((r) => r.ticket).filter(Boolean);

  // 4. Record Locked tickets:
  // Combines:
  // a) ENTITY_IS_LOCKED / locked tickets pasted in Step 5 execution
  // b) isLocked or isEntityLockedError from rows
  const cleanedLockedTickets = Array.from(
    new Set((lockedTickets || []).map(cleanTicketToken).filter(Boolean))
  );
  const lockedRowTickets = allRows
    .filter(
      (r) =>
        r.isLocked ||
        isEntityLockedError(r.status) ||
        r.status?.toLowerCase().includes("locked")
    )
    .map((r) => r.ticket)
    .filter(Boolean);

  const recordLockedTickets = Array.from(
    new Set([...cleanedLockedTickets, ...lockedRowTickets])
  );
  const recordLockedCount = recordLockedTickets.length;

  // 5. Approval Pending tickets (Is_Approval_Sent__c is true / status contains approval, excluding ones already counted as record-locked):
  const approvalSentTickets = allRows
    .filter(
      (r) =>
        (r.isApprovalSent || r.status?.toLowerCase().includes("approval")) &&
        !recordLockedTickets.includes(r.ticket)
    )
    .map((r) => r.ticket)
    .filter(Boolean);
  const approvalSentCount = approvalSentTickets.length;

  // 6. Failed Non-NAMO PMS tickets (excludes any ticket in recordLockedTickets or approvalSentTickets):
  let cleanedFailedTickets = Array.from(
    new Set((failedTickets || []).map(cleanTicketToken).filter(Boolean))
  ).filter((t) => !recordLockedTickets.includes(t) && !approvalSentTickets.includes(t));

  for (const t of [...cleanedFailedTickets]) {
    const row = allRows.find(
      (r) => r.ticket === t || (r.id && r.id === t) || (r.ticket && cleanTicketToken(r.ticket) === t)
    );
    if (row) {
      if (
        row.isLocked ||
        isEntityLockedError(row.status) ||
        row.status?.toLowerCase().includes("locked")
      ) {
        if (!recordLockedTickets.includes(t)) {
          recordLockedTickets.push(t);
        }
        cleanedFailedTickets = cleanedFailedTickets.filter((item) => item !== t);
      } else if (row.isApprovalSent || row.status?.toLowerCase().includes("approval")) {
        if (!approvalSentTickets.includes(t)) {
          approvalSentTickets.push(t);
        }
        cleanedFailedTickets = cleanedFailedTickets.filter((item) => item !== t);
      }
    }
  }

  const failedCount = cleanedFailedTickets.length;

  // 7. MR Raised
  const mrRaisedRows = allRows.filter((r) => r.isMrCreated);
  const mrRaisedCount = mrRaisedRows.length;
  const mrRaisedTickets = mrRaisedRows.map((r) => r.ticket).filter(Boolean);

  // 8. Condition 3: Parent Ticket Present / Linked (BLK/Parent tickets)
  const parentLinkedRows = allRows.filter(
    (r) =>
      r.isChild ||
      Boolean(
        (r.parentTicket && r.parentTicket !== "—" && r.parentTicket.toLowerCase() !== "null") ||
        (r.parentId && r.parentId !== "—" && r.parentId.toLowerCase() !== "null")
      )
  );
  const parentTicketCount = parentLinkedRows.length;

  // 9. Condition 3: Already Completed Tickets (Strictly WorkOrder Status = 'Completed', never FGR)
  const completedRows = allRows.filter((r) => {
    const hasParent =
      r.isChild ||
      Boolean(
        (r.parentTicket && r.parentTicket !== "—" && r.parentTicket.toLowerCase() !== "null") ||
        (r.parentId && r.parentId !== "—" && r.parentId.toLowerCase() !== "null")
      );
    if (hasParent) return false;
    const s = (r.status || "").toLowerCase().trim();
    return s === "completed";
  });
  const completedCount = completedRows.length;
  const completedTickets = completedRows.map((r) => r.ticket).filter(Boolean);

  // Uncancelled Non-NAMO tickets calculation
  const uncancelledNonNamoSet = new Set<string>();
  for (const r of nonNamoRows) {
    const t = r.ticket;
    const isLocked = recordLockedTickets.includes(t);
    const isApproval = approvalSentTickets.includes(t);
    const isFailed = cleanedFailedTickets.includes(t);
    const isMr = r.isMrCreated;
    const hasParent =
      r.isChild ||
      Boolean(
        (r.parentTicket && r.parentTicket !== "—" && r.parentTicket.toLowerCase() !== "null") ||
        (r.parentId && r.parentId !== "—" && r.parentId.toLowerCase() !== "null")
      );
    const isCompleted = (r.status || "").toLowerCase().trim() === "completed";

    if (isLocked || isApproval || isFailed || isMr || hasParent || isCompleted) {
      uncancelledNonNamoSet.add(t);
    }
  }
  for (const t of cleanedFailedTickets) {
    uncancelledNonNamoSet.add(t);
  }
  for (const t of recordLockedTickets) {
    const r = allRows.find((row) => row.ticket === t);
    if (!r || r.accountGroupCategory === "NON-NAMO") {
      uncancelledNonNamoSet.add(t);
    }
  }

  const successfullyCancelled = Math.max(0, totalNonNamo - uncancelledNonNamoSet.size);

  // 10. Filter Active Exception Categories (Only show if count > 0)
  interface ActiveException {
    title: string;
    mailTextBody: string;
    mailHtmlBody: string;
    postTextBody: string;
    postHtmlBody: string;
  }

  const activeExceptions: ActiveException[] = [];

  if (nonPmsCount > 0) {
    activeExceptions.push({
      title: `Non-PMS Tickets (Total: ${nonPmsCount})`,
      mailTextBody: nonPmsTickets.join(", "),
      mailHtmlBody: `<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #991b1b; line-height: 1.6; max-width: 650px; word-break: break-word;">${nonPmsTickets.join(", ")}</div>`,
      postTextBody: nonPmsTickets.join(", "),
      postHtmlBody: `<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #991b1b; line-height: 1.5; margin-bottom: 8px;">${nonPmsTickets.join(", ")}</div>`,
    });
  }

  if (recordLockedCount > 0) {
    activeExceptions.push({
      title: `Approval Pending (Record Locked) Tickets (Total: ${recordLockedCount})`,
      mailTextBody: `The following ticket(s) are locked in Salesforce:\n${recordLockedTickets.join(", ")}`,
      mailHtmlBody: `<p style="margin: 4px 0 6px 0; font-size: 12px; color: #b45309;">The following ticket(s) are locked in Salesforce:</p><div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #92400e; line-height: 1.6; max-width: 650px; word-break: break-word;">${recordLockedTickets.join(", ")}</div>`,
      postTextBody: `The following ticket(s) are locked in Salesforce:\n${recordLockedTickets.join(", ")}`,
      postHtmlBody: `<p style="margin: 4px 0 6px 0; font-size: 12px; color: #b45309;">The following ticket(s) are locked in Salesforce:</p><div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #92400e; line-height: 1.5; margin-bottom: 8px;">${recordLockedTickets.join(", ")}</div>`,
    });
  }

  if (approvalSentCount > 0) {
    activeExceptions.push({
      title: `Approval Pending Tickets (Total: ${approvalSentCount})`,
      mailTextBody: `Approval is pending against the following ticket(s):\n${approvalSentTickets.join(", ")}`,
      mailHtmlBody: `<p style="margin: 4px 0 6px 0; font-size: 12px; color: #b45309;">Approval is pending against the following ticket(s):</p><div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #92400e; line-height: 1.6; max-width: 650px; word-break: break-word;">${approvalSentTickets.join(", ")}</div>`,
      postTextBody: `Approval is pending against the following ticket(s):\n${approvalSentTickets.join(", ")}`,
      postHtmlBody: `<p style="margin: 4px 0 6px 0; font-size: 12px; color: #b45309;">Approval is pending against the following ticket(s):</p><div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #92400e; line-height: 1.5; margin-bottom: 8px;">${approvalSentTickets.join(", ")}</div>`,
    });
  }

  if (failedCount > 0) {
    activeExceptions.push({
      title: `Failed Non-NAMO PMS Tickets (Total: ${failedCount})`,
      mailTextBody: cleanedFailedTickets.join(", "),
      mailHtmlBody: `<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #991b1b; line-height: 1.6; max-width: 650px; word-break: break-word;">${cleanedFailedTickets.join(", ")}</div>`,
      postTextBody: cleanedFailedTickets.join(", "),
      postHtmlBody: `<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #991b1b; line-height: 1.5; margin-bottom: 8px;">${cleanedFailedTickets.join(", ")}</div>`,
    });
  }

  if (mrRaisedCount > 0) {
    activeExceptions.push({
      title: `MR Raised Tickets (Total: ${mrRaisedCount})`,
      mailTextBody: mrRaisedTickets.join(", "),
      mailHtmlBody: `<div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #5b21b6; line-height: 1.6; max-width: 650px; word-break: break-word;">${mrRaisedTickets.join(", ")}</div>`,
      postTextBody: mrRaisedTickets.join(", "),
      postHtmlBody: `<div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #5b21b6; line-height: 1.5; margin-bottom: 8px;">${mrRaisedTickets.join(", ")}</div>`,
    });
  }

  if (parentTicketCount > 0) {
    activeExceptions.push({
      title: `Parent / BLK Ticket Linked (Total: ${parentTicketCount})`,
      mailTextBody: `| # | PMS Ticket | Linked BLK / Parent Ticket |\n|---|---|---|\n${parentLinkedRows.map((r, idx) => `| ${idx + 1} | ${r.ticket} | ${r.parentTicket || r.parentId || "—"} |`).join("\n")}`,
      mailHtmlBody: `<table style="border-collapse: collapse; width: 100%; max-width: 650px; font-size: 12px; margin-top: 4px; border: 1px solid #cbd5e1;"><thead><tr style="background-color: #f1f5f9; text-align: left;"><th style="padding: 4px 8px; border: 1px solid #cbd5e1;">#</th><th style="padding: 4px 8px; border: 1px solid #cbd5e1;">PMS Ticket</th><th style="padding: 4px 8px; border: 1px solid #cbd5e1;">Linked BLK / Parent Ticket</th></tr></thead><tbody>${parentLinkedRows.map((r, idx) => `<tr><td style="padding: 4px 8px; border: 1px solid #cbd5e1;">${idx + 1}</td><td style="padding: 4px 8px; border: 1px solid #cbd5e1; font-family: Consolas, monospace;">${r.ticket}</td><td style="padding: 4px 8px; border: 1px solid #cbd5e1; font-family: Consolas, monospace;">${r.parentTicket || r.parentId || "—"}</td></tr>`).join("")}</tbody></table>`,
      postTextBody: parentLinkedRows
        .map(
          (r, idx) =>
            `${idx + 1}. PMS Ticket: ${r.ticket}\n   ↳ Linked BLK/Parent Ticket: ${r.parentTicket || r.parentId || "—"}`
        )
        .join("\n\n"),
      postHtmlBody: parentLinkedRows
        .map(
          (r, idx) =>
            `<p style="margin: 4px 0 6px 0;">${idx + 1}. PMS Ticket: <strong>${r.ticket}</strong><br/>&nbsp;&nbsp;&nbsp;↳ Linked BLK/Parent Ticket: <strong>${r.parentTicket || r.parentId || "—"}</strong></p>`
        )
        .join(""),
    });
  }

  if (completedCount > 0) {
    activeExceptions.push({
      title: `Already Completed Tickets (Total: ${completedCount})`,
      mailTextBody: completedTickets.join(", "),
      mailHtmlBody: `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #475569; line-height: 1.6; max-width: 650px; word-break: break-word;">${completedTickets.join(", ")}</div>`,
      postTextBody: completedTickets.join(", "),
      postHtmlBody: `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 8px;">${completedTickets.join(", ")}</div>`,
    });
  }

  // 1. Plain Text Email Table Rows (Only include categories with count > 0)
  const mailTextTableRows: string[] = [];
  if (nonPmsCount > 0) mailTextTableRows.push(`| Total Non-PMS Tickets | ${nonPmsCount} |`);
  if (totalNamo > 0) mailTextTableRows.push(`| • Total NAMO PMS Tickets | ${totalNamo} |`);
  if (totalNonNamo > 0) mailTextTableRows.push(`| • Total Non-NAMO PMS Tickets | ${totalNonNamo} |`);
  if (successfullyCancelled > 0) mailTextTableRows.push(`| Successfully Cancelled (Non-NAMO) | ${successfullyCancelled} |`);
  if (recordLockedCount > 0) mailTextTableRows.push(`| Approval Pending (Record Locked) | ${recordLockedCount} |`);
  if (approvalSentCount > 0) mailTextTableRows.push(`| Approval Pending | ${approvalSentCount} |`);
  if (failedCount > 0) mailTextTableRows.push(`| Failed – Non-NAMO Tickets | ${failedCount} |`);
  if (mrRaisedCount > 0) mailTextTableRows.push(`| MR Raised | ${mrRaisedCount} |`);
  if (parentTicketCount > 0) mailTextTableRows.push(`| Parent Ticket Present | ${parentTicketCount} |`);
  if (completedCount > 0) mailTextTableRows.push(`| Already Completed | ${completedCount} |`);
  mailTextTableRows.push(`| Total Tickets Processed | ${totalTickets} |`);

  const mailTextTable = `| Ticket Category / Status | Ticket Count |\n|---|---:|\n${mailTextTableRows.join("\n")}`;

  // 2. HTML Email Table Rows (Only include categories with count > 0)
  const mailHtmlTableRows: string[] = [];
  if (nonPmsCount > 0) {
    mailHtmlTableRows.push(`<tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1;">Total Non-PMS Tickets</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right;">${nonPmsCount}</td></tr>`);
  }
  if (totalNamo > 0) {
    mailHtmlTableRows.push(`<tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1; padding-left: 20px;">• Total NAMO PMS Tickets</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${totalNamo}</td></tr>`);
  }
  if (totalNonNamo > 0) {
    mailHtmlTableRows.push(`<tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1; padding-left: 20px;">• Total Non-NAMO PMS Tickets</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${totalNonNamo}</td></tr>`);
  }
  if (successfullyCancelled > 0) {
    mailHtmlTableRows.push(`<tr style="background-color: #f0fdf4;"><td style="padding: 6px 12px; border: 1px solid #cbd5e1; color: #15803d; font-weight: 600;">Successfully Cancelled (Non-NAMO)</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #15803d;">${successfullyCancelled}</td></tr>`);
  }
  if (recordLockedCount > 0) {
    mailHtmlTableRows.push(`<tr style="background-color: #fffbeb;"><td style="padding: 6px 12px; border: 1px solid #cbd5e1; color: #b45309; font-weight: 600;">Approval Pending (Record Locked)</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #b45309;">${recordLockedCount}</td></tr>`);
  }
  if (approvalSentCount > 0) {
    mailHtmlTableRows.push(`<tr style="background-color: #fffbeb;"><td style="padding: 6px 12px; border: 1px solid #cbd5e1; color: #b45309; font-weight: 600;">Approval Pending</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #b45309;">${approvalSentCount}</td></tr>`);
  }
  if (failedCount > 0) {
    mailHtmlTableRows.push(`<tr style="background-color: #fef2f2;"><td style="padding: 6px 12px; border: 1px solid #cbd5e1; color: #b91c1c; font-weight: 600;">Failed – Non-NAMO Tickets</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #b91c1c;">${failedCount}</td></tr>`);
  }
  if (mrRaisedCount > 0) {
    mailHtmlTableRows.push(`<tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1;">MR Raised</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${mrRaisedCount}</td></tr>`);
  }
  if (parentTicketCount > 0) {
    mailHtmlTableRows.push(`<tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1;">Parent Ticket Present</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${parentTicketCount}</td></tr>`);
  }
  if (completedCount > 0) {
    mailHtmlTableRows.push(`<tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1;">Already Completed</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${completedCount}</td></tr>`);
  }
  mailHtmlTableRows.push(`<tr style="background-color: #f8fafc; font-weight: bold;"><td style="padding: 7px 12px; border: 1px solid #cbd5e1;">Total Tickets Processed</td><td style="padding: 7px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${totalTickets}</td></tr>`);

  // 3. Post Summary Rows (Only include categories with count > 0)
  const postTextSummaryRows: string[] = [];
  if (nonPmsCount > 0) postTextSummaryRows.push(`• Total Non-PMS Tickets: **${nonPmsCount}**`);
  if (totalNamo > 0) postTextSummaryRows.push(`• Total NAMO PMS Tickets: **${totalNamo}**`);
  if (totalNonNamo > 0) postTextSummaryRows.push(`• Total Non-NAMO PMS Tickets: **${totalNonNamo}**`);
  if (successfullyCancelled > 0) postTextSummaryRows.push(`• Successfully Cancelled (Non-NAMO): **${successfullyCancelled}**`);
  if (recordLockedCount > 0) postTextSummaryRows.push(`• Approval Pending (Record Locked): **${recordLockedCount}**`);
  if (approvalSentCount > 0) postTextSummaryRows.push(`• Approval Pending: **${approvalSentCount}**`);
  if (failedCount > 0) postTextSummaryRows.push(`• Failed – Non-NAMO Tickets: **${failedCount}**`);
  if (mrRaisedCount > 0) postTextSummaryRows.push(`• MR Raised: **${mrRaisedCount}**`);
  if (parentTicketCount > 0) postTextSummaryRows.push(`• Parent Ticket Present: **${parentTicketCount}**`);
  if (completedCount > 0) postTextSummaryRows.push(`• Already Completed: **${completedCount}**`);
  postTextSummaryRows.push(`• Total Tickets Processed: **${totalTickets}**`);

  const postHtmlSummaryRows: string[] = [];
  if (nonPmsCount > 0) postHtmlSummaryRows.push(`• Total Non-PMS Tickets: <strong>${nonPmsCount}</strong>`);
  if (totalNamo > 0) postHtmlSummaryRows.push(`• Total NAMO PMS Tickets: <strong>${totalNamo}</strong>`);
  if (totalNonNamo > 0) postHtmlSummaryRows.push(`• Total Non-NAMO PMS Tickets: <strong>${totalNonNamo}</strong>`);
  if (successfullyCancelled > 0) postHtmlSummaryRows.push(`• Successfully Cancelled (Non-NAMO): <strong>${successfullyCancelled}</strong>`);
  if (recordLockedCount > 0) postHtmlSummaryRows.push(`• Approval Pending (Record Locked): <strong>${recordLockedCount}</strong>`);
  if (approvalSentCount > 0) postHtmlSummaryRows.push(`• Approval Pending: <strong>${approvalSentCount}</strong>`);
  if (failedCount > 0) postHtmlSummaryRows.push(`• Failed – Non-NAMO Tickets: <strong>${failedCount}</strong>`);
  if (mrRaisedCount > 0) postHtmlSummaryRows.push(`• MR Raised: <strong>${mrRaisedCount}</strong>`);
  if (parentTicketCount > 0) postHtmlSummaryRows.push(`• Parent Ticket Present: <strong>${parentTicketCount}</strong>`);
  if (completedCount > 0) postHtmlSummaryRows.push(`• Already Completed: <strong>${completedCount}</strong>`);
  postHtmlSummaryRows.push(`• Total Tickets Processed: <strong>${totalTickets}</strong>`);

  // Optional Section 2: NAMO PMS Approval Requirement (Only show if NAMO tickets exist)
  let namoApprovalMailText = "";
  let namoApprovalMailHtml = "";
  let namoApprovalPostText = "";
  let namoApprovalPostHtml = "";

  if (totalNamo > 0) {
    namoApprovalMailText = `\n\n2. NAMO PMS Cancellation – Approval Requirement\n\nCancellation of NAMO PMS tickets requires the following mandatory approvals:\n\n• RM Approval\n• Approval from either Vishal Sir (CPSD) or Suraj Sir (UCPG)\n\nThe ${pendingNamo} NAMO PMS tickets will remain pending until the required approvals are obtained:\n${namoTickets.join(", ")}`;

    namoApprovalMailHtml = `\n  <p style="font-weight: bold; font-size: 14px; margin-top: 18px; margin-bottom: 6px;">2. NAMO PMS Cancellation – Approval Requirement</p>
  <p>Cancellation of NAMO PMS tickets requires the following mandatory approvals:</p>
  <ul style="margin-top: 4px; margin-bottom: 8px;">
    <li>RM Approval</li>
    <li>Approval from either Vishal Sir (CPSD) or Suraj Sir (UCPG)</li>
  </ul>
  <p>The <strong>${pendingNamo} NAMO PMS tickets</strong> will remain pending until the required approvals are obtained:</p>
  <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #854d0e; line-height: 1.6; max-width: 650px; word-break: break-word;">${namoTickets.join(", ")}</div>`;

    namoApprovalPostText = `\n\n━━━━━━━━━━━━━━━━━━━━\n**2. NAMO PMS – APPROVAL REQUIREMENT**\n\nNAMO PMS ticket cancellation requires the following mandatory approvals:\n\n• RM Approval\n• Approval from either Vishal Sir (CPSD) or Suraj Sir (UCPG)\n\nThe ${pendingNamo} NAMO PMS tickets will remain pending until the required approvals are obtained:\n${namoTickets.join(", ")}`;

    namoApprovalPostHtml = `\n<hr/>\n<p><strong>2. NAMO PMS – APPROVAL REQUIREMENT</strong></p>\n<p>NAMO PMS ticket cancellation requires the following mandatory approvals:</p>\n<p>• RM Approval<br/>• Approval from either Vishal Sir (CPSD) or Suraj Sir (UCPG)</p>\n<p>The ${pendingNamo} NAMO PMS tickets will remain pending until the required approvals are obtained:</p>\n<div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #854d0e; line-height: 1.5; margin-bottom: 8px;">${namoTickets.join(", ")}</div>`;
  }

  // Section 3 (or 2): Ticket-wise Cancellation Exceptions (Only show categories with count > 0)
  const exceptionsSectionNum = totalNamo > 0 ? 3 : 2;

  let exceptionsMailText = "";
  let exceptionsMailHtml = "";
  let exceptionsPostText = "";
  let exceptionsPostHtml = "";

  if (activeExceptions.length > 0) {
    exceptionsMailText = `\n\n${exceptionsSectionNum}. Ticket-wise Cancellation Exceptions\n\n` +
      activeExceptions
        .map((item, idx) => `${String.fromCharCode(65 + idx)}. ${item.title}\n${item.mailTextBody}`)
        .join("\n\n");

    exceptionsMailHtml = `\n  <p style="font-weight: bold; font-size: 14px; margin-top: 18px; margin-bottom: 6px;">${exceptionsSectionNum}. Ticket-wise Cancellation Exceptions</p>` +
      activeExceptions
        .map(
          (item, idx) =>
            `\n  <p style="font-weight: bold; margin-top: 12px; margin-bottom: 6px;">${String.fromCharCode(65 + idx)}. ${item.title}</p>\n  ${item.mailHtmlBody}`
        )
        .join("");

    exceptionsPostText = `\n\n━━━━━━━━━━━━━━━━━━━━\n**${exceptionsSectionNum}. TICKET-WISE EXCEPTION DETAILS**\n\n` +
      activeExceptions
        .map((item, idx) => `**${String.fromCharCode(65 + idx)}. ${item.title}**\n${item.postTextBody}`)
        .join("\n\n");

    exceptionsPostHtml = `\n<hr/>\n<p><strong>${exceptionsSectionNum}. TICKET-WISE EXCEPTION DETAILS</strong></p>` +
      activeExceptions
        .map((item, idx) => `\n<p><strong>${String.fromCharCode(65 + idx)}. ${item.title}</strong></p>\n${item.postHtmlBody}`)
        .join("");
  }

  // 1. Plain Text Email
  const mailText = `Dear Team,

This is to inform you that the PMS ticket cancellation process has been executed for a total of ${totalTickets} tickets.

1. PMS Ticket Cancellation Summary

${mailTextTable}${namoApprovalMailText}${exceptionsMailText}`;

  // 2. HTML Email
  const mailHtml = `<div style="font-family: Calibri, Arial, sans-serif; font-size: 13px; line-height: 1.5;">
  ${renderEmailHeader("Dear Team,")}
  <p style="margin-top: 0; margin-bottom: 12px;">This is to inform you that the PMS ticket cancellation process has been executed for a total of <strong>${totalTickets} tickets</strong>.</p>
  
  <p style="font-weight: bold; font-size: 14px; margin-top: 18px; margin-bottom: 6px;">1. PMS Ticket Cancellation Summary</p>
  <table style="border-collapse: collapse; width: 100%; max-width: 650px; font-size: 13px; border: 1px solid #cbd5e1;">
    <thead>
      <tr style="background-color: #f1f5f9; text-align: left;">
        <th style="padding: 6px 12px; border: 1px solid #cbd5e1;">Ticket Category / Status</th>
        <th style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right;">Ticket Count</th>
      </tr>
    </thead>
    <tbody>
      ${mailHtmlTableRows.join("\n      ")}
    </tbody>
  </table>${namoApprovalMailHtml}${exceptionsMailHtml}

</div>`;

  // 3. Post Text (Slack / Teams / Chatter text - NO table markup)
  const postText = `📢 **PMS TICKET CANCELLATION – EXECUTION SUMMARY**

The PMS ticket cancellation process has been executed for a total of **${totalTickets} tickets**.

━━━━━━━━━━━━━━━━━━━━
**1. PMS TICKET CANCELLATION SUMMARY**

${postTextSummaryRows.join("\n")}${namoApprovalPostText}${exceptionsPostText}
`;

  // 4. Post HTML (NO table tags for Salesforce Chatter compatibility)
  const postHtml = `<p><strong>PMS TICKET CANCELLATION – EXECUTION SUMMARY</strong></p>
<p>The PMS ticket cancellation process has been executed for a total of <strong>${totalTickets} tickets</strong>.</p>
<hr/>
<p><strong>1. PMS TICKET CANCELLATION SUMMARY</strong></p>
<p>
${postHtmlSummaryRows.join("<br/>\n")}
</p>${namoApprovalPostHtml}${exceptionsPostHtml}
`;;;

  return {
    mailText,
    mailHtml,
    postText,
    postHtml,
  };
}

export interface NamoExecutionSummaryOutput {
  mailText: string;
  mailHtml: string;
  postText: string;
  postHtml: string;
}

export function buildNamoExecutionSummary(
  accountCheckResult: AccountCheckResult,
  failedTickets: string[] = [],
  lockedTickets: string[] = []
): NamoExecutionSummaryOutput {
  if (!accountCheckResult || accountCheckResult.totalCount === 0) {
    return {
      mailText: "",
      mailHtml: "",
      postText: "",
      postHtml: "",
    };
  }

  const allRows = accountCheckResult.allRows || [];
  const totalTickets = accountCheckResult.totalCount;

  // 1. Condition 1: Non-PMS Tickets (Starts with Non-'A' e.g. B, C, I, X, etc.)
  const nonPmsRows = allRows.filter((r) => !r.isPms);
  const nonPmsCount = nonPmsRows.length;
  const nonPmsTickets = nonPmsRows.map((r) => r.ticket).filter(Boolean);

  // 2. PMS Tickets ('A' series)
  const pmsRows = allRows.filter((r) => r.isPms);
  const totalPms = pmsRows.length;

  // 3. Condition 2: NAMO vs NON-NAMO PMS tickets
  const namoRows = pmsRows.filter((r) => r.accountGroupCategory === "NAMO");
  const nonNamoRows = pmsRows.filter((r) => r.accountGroupCategory === "NON-NAMO");
  const totalNamo = namoRows.length;
  const totalNonNamo = nonNamoRows.length;
  const pendingNonNamo = totalNonNamo;
  const nonNamoTickets = nonNamoRows.map((r) => r.ticket).filter(Boolean);

  // 4. Record Locked tickets:
  // Combines:
  // a) ENTITY_IS_LOCKED / locked tickets pasted in Step 5 execution
  // b) isLocked or isEntityLockedError from rows
  const cleanedLockedTickets = Array.from(
    new Set((lockedTickets || []).map(cleanTicketToken).filter(Boolean))
  );
  const lockedRowTickets = allRows
    .filter(
      (r) =>
        r.isLocked ||
        isEntityLockedError(r.status) ||
        r.status?.toLowerCase().includes("locked")
    )
    .map((r) => r.ticket)
    .filter(Boolean);

  const recordLockedTickets = Array.from(
    new Set([...cleanedLockedTickets, ...lockedRowTickets])
  );
  const recordLockedCount = recordLockedTickets.length;

  // 5. Approval Pending tickets (Is_Approval_Sent__c is true / status contains approval, excluding ones already counted as record-locked):
  const approvalSentTickets = allRows
    .filter(
      (r) =>
        (r.isApprovalSent || r.status?.toLowerCase().includes("approval")) &&
        !recordLockedTickets.includes(r.ticket)
    )
    .map((r) => r.ticket)
    .filter(Boolean);
  const approvalSentCount = approvalSentTickets.length;

  // 6. Failed NAMO PMS tickets (excludes any ticket in recordLockedTickets or approvalSentTickets):
  let cleanedFailedTickets = Array.from(
    new Set((failedTickets || []).map(cleanTicketToken).filter(Boolean))
  ).filter((t) => !recordLockedTickets.includes(t) && !approvalSentTickets.includes(t));

  for (const t of [...cleanedFailedTickets]) {
    const row = allRows.find(
      (r) => r.ticket === t || (r.id && r.id === t) || (r.ticket && cleanTicketToken(r.ticket) === t)
    );
    if (row) {
      if (
        row.isLocked ||
        isEntityLockedError(row.status) ||
        row.status?.toLowerCase().includes("locked")
      ) {
        if (!recordLockedTickets.includes(t)) {
          recordLockedTickets.push(t);
        }
        cleanedFailedTickets = cleanedFailedTickets.filter((item) => item !== t);
      } else if (row.isApprovalSent || row.status?.toLowerCase().includes("approval")) {
        if (!approvalSentTickets.includes(t)) {
          approvalSentTickets.push(t);
        }
        cleanedFailedTickets = cleanedFailedTickets.filter((item) => item !== t);
      }
    }
  }

  const failedCount = cleanedFailedTickets.length;

  // 7. MR Raised
  const mrRaisedRows = allRows.filter((r) => r.isMrCreated);
  const mrRaisedCount = mrRaisedRows.length;
  const mrRaisedTickets = mrRaisedRows.map((r) => r.ticket).filter(Boolean);

  // 8. Condition 3: Parent Ticket Present / Linked (BLK/Parent tickets)
  const parentLinkedRows = allRows.filter(
    (r) =>
      r.isChild ||
      Boolean(
        (r.parentTicket && r.parentTicket !== "—" && r.parentTicket.toLowerCase() !== "null") ||
        (r.parentId && r.parentId !== "—" && r.parentId.toLowerCase() !== "null")
      )
  );
  const parentTicketCount = parentLinkedRows.length;

  // 9. Condition 3: Already Completed Tickets (Strictly WorkOrder Status = 'Completed', never FGR)
  const completedRows = allRows.filter((r) => {
    const hasParent =
      r.isChild ||
      Boolean(
        (r.parentTicket && r.parentTicket !== "—" && r.parentTicket.toLowerCase() !== "null") ||
        (r.parentId && r.parentId !== "—" && r.parentId.toLowerCase() !== "null")
      );
    if (hasParent) return false;
    const s = (r.status || "").toLowerCase().trim();
    return s === "completed";
  });
  const completedCount = completedRows.length;
  const completedTickets = completedRows.map((r) => r.ticket).filter(Boolean);

  // Uncancelled NAMO tickets calculation (NAMO mode: only NAMO tickets are eligible to cancel)
  const uncancelledNamoSet = new Set<string>();
  for (const r of namoRows) {
    const t = r.ticket;
    const isLocked = recordLockedTickets.includes(t);
    const isApproval = approvalSentTickets.includes(t);
    const isFailed = cleanedFailedTickets.includes(t);
    const isMr = r.isMrCreated;
    const hasParent =
      r.isChild ||
      Boolean(
        (r.parentTicket && r.parentTicket !== "—" && r.parentTicket.toLowerCase() !== "null") ||
        (r.parentId && r.parentId !== "—" && r.parentId.toLowerCase() !== "null")
      );
    const isCompleted = (r.status || "").toLowerCase().trim() === "completed";

    if (isLocked || isApproval || isFailed || isMr || hasParent || isCompleted) {
      uncancelledNamoSet.add(t);
    }
  }
  for (const t of cleanedFailedTickets) {
    uncancelledNamoSet.add(t);
  }
  for (const t of recordLockedTickets) {
    const r = allRows.find((row) => row.ticket === t);
    if (!r || r.accountGroupCategory === "NAMO") {
      uncancelledNamoSet.add(t);
    }
  }

  const successfullyCancelled = Math.max(0, totalNamo - uncancelledNamoSet.size);

  // 10. Filter Active Exception Categories (Only show if count > 0)
  interface ActiveException {
    title: string;
    mailTextBody: string;
    mailHtmlBody: string;
    postTextBody: string;
    postHtmlBody: string;
  }

  const activeExceptions: ActiveException[] = [];

  if (nonPmsCount > 0) {
    activeExceptions.push({
      title: `Non-PMS Tickets (Total: ${nonPmsCount})`,
      mailTextBody: nonPmsTickets.join(", "),
      mailHtmlBody: `<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #991b1b; line-height: 1.6; max-width: 650px; word-break: break-word;">${nonPmsTickets.join(", ")}</div>`,
      postTextBody: nonPmsTickets.join(", "),
      postHtmlBody: `<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #991b1b; line-height: 1.5; margin-bottom: 8px;">${nonPmsTickets.join(", ")}</div>`,
    });
  }

  if (recordLockedCount > 0) {
    activeExceptions.push({
      title: `Approval Pending (Record Locked) Tickets (Total: ${recordLockedCount})`,
      mailTextBody: `The following ticket(s) are locked in Salesforce:\n${recordLockedTickets.join(", ")}`,
      mailHtmlBody: `<p style="margin: 4px 0 6px 0; font-size: 12px; color: #b45309;">The following ticket(s) are locked in Salesforce:</p><div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #92400e; line-height: 1.6; max-width: 650px; word-break: break-word;">${recordLockedTickets.join(", ")}</div>`,
      postTextBody: `The following ticket(s) are locked in Salesforce:\n${recordLockedTickets.join(", ")}`,
      postHtmlBody: `<p style="margin: 4px 0 6px 0; font-size: 12px; color: #b45309;">The following ticket(s) are locked in Salesforce:</p><div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #92400e; line-height: 1.5; margin-bottom: 8px;">${recordLockedTickets.join(", ")}</div>`,
    });
  }

  if (approvalSentCount > 0) {
    activeExceptions.push({
      title: `Approval Pending Tickets (Total: ${approvalSentCount})`,
      mailTextBody: `Approval is pending against the following ticket(s):\n${approvalSentTickets.join(", ")}`,
      mailHtmlBody: `<p style="margin: 4px 0 6px 0; font-size: 12px; color: #b45309;">Approval is pending against the following ticket(s):</p><div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #92400e; line-height: 1.6; max-width: 650px; word-break: break-word;">${approvalSentTickets.join(", ")}</div>`,
      postTextBody: `Approval is pending against the following ticket(s):\n${approvalSentTickets.join(", ")}`,
      postHtmlBody: `<p style="margin: 4px 0 6px 0; font-size: 12px; color: #b45309;">Approval is pending against the following ticket(s):</p><div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #92400e; line-height: 1.5; margin-bottom: 8px;">${approvalSentTickets.join(", ")}</div>`,
    });
  }

  if (failedCount > 0) {
    activeExceptions.push({
      title: `Failed NAMO PMS Tickets (Total: ${failedCount})`,
      mailTextBody: cleanedFailedTickets.join(", "),
      mailHtmlBody: `<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #991b1b; line-height: 1.6; max-width: 650px; word-break: break-word;">${cleanedFailedTickets.join(", ")}</div>`,
      postTextBody: cleanedFailedTickets.join(", "),
      postHtmlBody: `<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #991b1b; line-height: 1.5; margin-bottom: 8px;">${cleanedFailedTickets.join(", ")}</div>`,
    });
  }

  if (mrRaisedCount > 0) {
    activeExceptions.push({
      title: `MR Raised Tickets (Total: ${mrRaisedCount})`,
      mailTextBody: mrRaisedTickets.join(", "),
      mailHtmlBody: `<div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #5b21b6; line-height: 1.6; max-width: 650px; word-break: break-word;">${mrRaisedTickets.join(", ")}</div>`,
      postTextBody: mrRaisedTickets.join(", "),
      postHtmlBody: `<div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #5b21b6; line-height: 1.5; margin-bottom: 8px;">${mrRaisedTickets.join(", ")}</div>`,
    });
  }

  if (parentTicketCount > 0) {
    activeExceptions.push({
      title: `Parent / BLK Ticket Linked (Total: ${parentTicketCount})`,
      mailTextBody: `| # | PMS Ticket | Linked BLK / Parent Ticket |\n|---|---|---|\n${parentLinkedRows.map((r, idx) => `| ${idx + 1} | ${r.ticket} | ${r.parentTicket || r.parentId || "—"} |`).join("\n")}`,
      mailHtmlBody: `<table style="border-collapse: collapse; width: 100%; max-width: 650px; font-size: 12px; margin-top: 4px; border: 1px solid #cbd5e1;"><thead><tr style="background-color: #f1f5f9; text-align: left;"><th style="padding: 4px 8px; border: 1px solid #cbd5e1;">#</th><th style="padding: 4px 8px; border: 1px solid #cbd5e1;">PMS Ticket</th><th style="padding: 4px 8px; border: 1px solid #cbd5e1;">Linked BLK / Parent Ticket</th></tr></thead><tbody>${parentLinkedRows.map((r, idx) => `<tr><td style="padding: 4px 8px; border: 1px solid #cbd5e1;">${idx + 1}</td><td style="padding: 4px 8px; border: 1px solid #cbd5e1; font-family: Consolas, monospace;">${r.ticket}</td><td style="padding: 4px 8px; border: 1px solid #cbd5e1; font-family: Consolas, monospace;">${r.parentTicket || r.parentId || "—"}</td></tr>`).join("")}</tbody></table>`,
      postTextBody: parentLinkedRows
        .map(
          (r, idx) =>
            `${idx + 1}. PMS Ticket: ${r.ticket}\n   ↳ Linked BLK/Parent Ticket: ${r.parentTicket || r.parentId || "—"}`
        )
        .join("\n\n"),
      postHtmlBody: parentLinkedRows
        .map(
          (r, idx) =>
            `<p style="margin: 4px 0 6px 0;">${idx + 1}. PMS Ticket: <strong>${r.ticket}</strong><br/>&nbsp;&nbsp;&nbsp;↳ Linked BLK/Parent Ticket: <strong>${r.parentTicket || r.parentId || "—"}</strong></p>`
        )
        .join(""),
    });
  }

  if (completedCount > 0) {
    activeExceptions.push({
      title: `Already Completed Tickets (Total: ${completedCount})`,
      mailTextBody: completedTickets.join(", "),
      mailHtmlBody: `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #475569; line-height: 1.6; max-width: 650px; word-break: break-word;">${completedTickets.join(", ")}</div>`,
      postTextBody: completedTickets.join(", "),
      postHtmlBody: `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 8px;">${completedTickets.join(", ")}</div>`,
    });
  }

  // 1. Plain Text Email Table Rows (Only include categories with count > 0)
  const mailTextTableRows: string[] = [];
  if (nonPmsCount > 0) mailTextTableRows.push(`| Total Non-PMS Tickets | ${nonPmsCount} |`);
  if (totalNamo > 0) mailTextTableRows.push(`| • Total NAMO PMS Tickets | ${totalNamo} |`);
  if (totalNonNamo > 0) mailTextTableRows.push(`| • Total Non-NAMO PMS Tickets | ${totalNonNamo} |`);
  if (successfullyCancelled > 0) mailTextTableRows.push(`| Successfully Cancelled (NAMO) | ${successfullyCancelled} |`);
  if (recordLockedCount > 0) mailTextTableRows.push(`| Approval Pending (Record Locked) | ${recordLockedCount} |`);
  if (approvalSentCount > 0) mailTextTableRows.push(`| Approval Pending | ${approvalSentCount} |`);
  if (failedCount > 0) mailTextTableRows.push(`| Failed – NAMO Tickets | ${failedCount} |`);
  if (mrRaisedCount > 0) mailTextTableRows.push(`| MR Raised | ${mrRaisedCount} |`);
  if (parentTicketCount > 0) mailTextTableRows.push(`| Parent Ticket Present | ${parentTicketCount} |`);
  if (completedCount > 0) mailTextTableRows.push(`| Already Completed | ${completedCount} |`);
  mailTextTableRows.push(`| Total Tickets Processed | ${totalTickets} |`);

  const mailTextTable = `| Ticket Category / Status | Ticket Count |\n|---|---:|\n${mailTextTableRows.join("\n")}`;

  // 2. HTML Email Table Rows (Only include categories with count > 0)
  const mailHtmlTableRows: string[] = [];
  if (nonPmsCount > 0) {
    mailHtmlTableRows.push(`<tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1;">Total Non-PMS Tickets</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right;">${nonPmsCount}</td></tr>`);
  }
  if (totalNamo > 0) {
    mailHtmlTableRows.push(`<tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1; padding-left: 20px;">• Total NAMO PMS Tickets</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${totalNamo}</td></tr>`);
  }
  if (totalNonNamo > 0) {
    mailHtmlTableRows.push(`<tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1; padding-left: 20px;">• Total Non-NAMO PMS Tickets</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${totalNonNamo}</td></tr>`);
  }
  if (successfullyCancelled > 0) {
    mailHtmlTableRows.push(`<tr style="background-color: #f0fdf4;"><td style="padding: 6px 12px; border: 1px solid #cbd5e1; color: #15803d; font-weight: 600;">Successfully Cancelled (NAMO)</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #15803d;">${successfullyCancelled}</td></tr>`);
  }
  if (recordLockedCount > 0) {
    mailHtmlTableRows.push(`<tr style="background-color: #fffbeb;"><td style="padding: 6px 12px; border: 1px solid #cbd5e1; color: #b45309; font-weight: 600;">Approval Pending (Record Locked)</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #b45309;">${recordLockedCount}</td></tr>`);
  }
  if (approvalSentCount > 0) {
    mailHtmlTableRows.push(`<tr style="background-color: #fffbeb;"><td style="padding: 6px 12px; border: 1px solid #cbd5e1; color: #b45309; font-weight: 600;">Approval Pending</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #b45309;">${approvalSentCount}</td></tr>`);
  }
  if (failedCount > 0) {
    mailHtmlTableRows.push(`<tr style="background-color: #fef2f2;"><td style="padding: 6px 12px; border: 1px solid #cbd5e1; color: #b91c1c; font-weight: 600;">Failed – NAMO Tickets</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #b91c1c;">${failedCount}</td></tr>`);
  }
  if (mrRaisedCount > 0) {
    mailHtmlTableRows.push(`<tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1;">MR Raised</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${mrRaisedCount}</td></tr>`);
  }
  if (parentTicketCount > 0) {
    mailHtmlTableRows.push(`<tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1;">Parent Ticket Present</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${parentTicketCount}</td></tr>`);
  }
  if (completedCount > 0) {
    mailHtmlTableRows.push(`<tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1;">Already Completed</td><td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${completedCount}</td></tr>`);
  }
  mailHtmlTableRows.push(`<tr style="background-color: #f8fafc; font-weight: bold;"><td style="padding: 7px 12px; border: 1px solid #cbd5e1;">Total Tickets Processed</td><td style="padding: 7px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${totalTickets}</td></tr>`);

  // 3. Post Summary Rows (Only include categories with count > 0)
  const postTextSummaryRows: string[] = [];
  if (nonPmsCount > 0) postTextSummaryRows.push(`• Total Non-PMS Tickets: **${nonPmsCount}**`);
  if (totalNamo > 0) postTextSummaryRows.push(`• Total NAMO PMS Tickets: **${totalNamo}**`);
  if (totalNonNamo > 0) postTextSummaryRows.push(`• Total Non-NAMO PMS Tickets: **${totalNonNamo}**`);
  if (successfullyCancelled > 0) postTextSummaryRows.push(`• Successfully Cancelled (NAMO): **${successfullyCancelled}**`);
  if (recordLockedCount > 0) postTextSummaryRows.push(`• Approval Pending (Record Locked): **${recordLockedCount}**`);
  if (approvalSentCount > 0) postTextSummaryRows.push(`• Approval Pending: **${approvalSentCount}**`);
  if (failedCount > 0) postTextSummaryRows.push(`• Failed – NAMO Tickets: **${failedCount}**`);
  if (mrRaisedCount > 0) postTextSummaryRows.push(`• MR Raised: **${mrRaisedCount}**`);
  if (parentTicketCount > 0) postTextSummaryRows.push(`• Parent Ticket Present: **${parentTicketCount}**`);
  if (completedCount > 0) postTextSummaryRows.push(`• Already Completed: **${completedCount}**`);
  postTextSummaryRows.push(`• Total Tickets Processed: **${totalTickets}**`);

  const postHtmlSummaryRows: string[] = [];
  if (nonPmsCount > 0) postHtmlSummaryRows.push(`• Total Non-PMS Tickets: <strong>${nonPmsCount}</strong>`);
  if (totalNamo > 0) postHtmlSummaryRows.push(`• Total NAMO PMS Tickets: <strong>${totalNamo}</strong>`);
  if (totalNonNamo > 0) postHtmlSummaryRows.push(`• Total Non-NAMO PMS Tickets: <strong>${totalNonNamo}</strong>`);
  if (successfullyCancelled > 0) postHtmlSummaryRows.push(`• Successfully Cancelled (NAMO): <strong>${successfullyCancelled}</strong>`);
  if (recordLockedCount > 0) postHtmlSummaryRows.push(`• Approval Pending (Record Locked): <strong>${recordLockedCount}</strong>`);
  if (approvalSentCount > 0) postHtmlSummaryRows.push(`• Approval Pending: <strong>${approvalSentCount}</strong>`);
  if (failedCount > 0) postHtmlSummaryRows.push(`• Failed – NAMO Tickets: <strong>${failedCount}</strong>`);
  if (mrRaisedCount > 0) postHtmlSummaryRows.push(`• MR Raised: <strong>${mrRaisedCount}</strong>`);
  if (parentTicketCount > 0) postHtmlSummaryRows.push(`• Parent Ticket Present: <strong>${parentTicketCount}</strong>`);
  if (completedCount > 0) postHtmlSummaryRows.push(`• Already Completed: <strong>${completedCount}</strong>`);
  postHtmlSummaryRows.push(`• Total Tickets Processed: <strong>${totalTickets}</strong>`);

  // Optional Section 2: NON-NAMO PMS Approval Requirement (Only show if NON-NAMO tickets exist)
  let nonNamoApprovalMailText = "";
  let nonNamoApprovalMailHtml = "";
  let nonNamoApprovalPostText = "";
  let nonNamoApprovalPostHtml = "";

  if (totalNonNamo > 0) {
    nonNamoApprovalMailText = `\n\n2. NON-NAMO PMS Cancellation – Approval Requirement\n\nCancellation of NON-NAMO PMS tickets requires the following mandatory approval:\n\n• RM Approval\n\nThe ${pendingNonNamo} NON-NAMO PMS tickets will remain pending until the required approval is obtained:\n${nonNamoTickets.join(", ")}`;

    nonNamoApprovalMailHtml = `\n  <p style="font-weight: bold; font-size: 14px; margin-top: 18px; margin-bottom: 6px;">2. NON-NAMO PMS Cancellation – Approval Requirement</p>
  <p>Cancellation of NON-NAMO PMS tickets requires the following mandatory approval:</p>
  <ul style="margin-top: 4px; margin-bottom: 8px;">
    <li>RM Approval</li>
  </ul>
  <p>The <strong>${pendingNonNamo} NON-NAMO PMS tickets</strong> will remain pending until the required approval is obtained:</p>
  <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 4px; padding: 8px 12px; font-family: Consolas, 'Courier New', monospace; font-size: 12px; color: #854d0e; line-height: 1.6; max-width: 650px; word-break: break-word;">${nonNamoTickets.join(", ")}</div>`;

    nonNamoApprovalPostText = `\n\n━━━━━━━━━━━━━━━━━━━━\n**2. NON-NAMO PMS – APPROVAL REQUIREMENT**\n\nNON-NAMO PMS ticket cancellation requires the following mandatory approval:\n\n• RM Approval\n\nThe ${pendingNonNamo} NON-NAMO PMS tickets will remain pending until the required approval is obtained:\n${nonNamoTickets.join(", ")}`;

    nonNamoApprovalPostHtml = `\n<hr/>\n<p><strong>2. NON-NAMO PMS – APPROVAL REQUIREMENT</strong></p>\n<p>NON-NAMO PMS ticket cancellation requires the following mandatory approval:</p>\n<p>• RM Approval</p>\n<p>The ${pendingNonNamo} NON-NAMO PMS tickets will remain pending until the required approval is obtained:</p>\n<div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 4px; padding: 6px 10px; font-family: monospace; font-size: 12px; color: #854d0e; line-height: 1.5; margin-bottom: 8px;">${nonNamoTickets.join(", ")}</div>`;
  }

  // Section 3 (or 2): Ticket-wise Cancellation Exceptions (Only show categories with count > 0)
  const exceptionsSectionNum = totalNonNamo > 0 ? 3 : 2;

  let exceptionsMailText = "";
  let exceptionsMailHtml = "";
  let exceptionsPostText = "";
  let exceptionsPostHtml = "";

  if (activeExceptions.length > 0) {
    exceptionsMailText = `\n\n${exceptionsSectionNum}. Ticket-wise Cancellation Exceptions\n\n` +
      activeExceptions
        .map((item, idx) => `${String.fromCharCode(65 + idx)}. ${item.title}\n${item.mailTextBody}`)
        .join("\n\n");

    exceptionsMailHtml = `\n  <p style="font-weight: bold; font-size: 14px; margin-top: 18px; margin-bottom: 6px;">${exceptionsSectionNum}. Ticket-wise Cancellation Exceptions</p>` +
      activeExceptions
        .map(
          (item, idx) =>
            `\n  <p style="font-weight: bold; margin-top: 12px; margin-bottom: 6px;">${String.fromCharCode(65 + idx)}. ${item.title}</p>\n  ${item.mailHtmlBody}`
        )
        .join("");

    exceptionsPostText = `\n\n━━━━━━━━━━━━━━━━━━━━\n**${exceptionsSectionNum}. TICKET-WISE EXCEPTION DETAILS**\n\n` +
      activeExceptions
        .map((item, idx) => `**${String.fromCharCode(65 + idx)}. ${item.title}**\n${item.postTextBody}`)
        .join("\n\n");

    exceptionsPostHtml = `\n<hr/>\n<p><strong>${exceptionsSectionNum}. TICKET-WISE EXCEPTION DETAILS</strong></p>` +
      activeExceptions
        .map((item, idx) => `\n<p><strong>${String.fromCharCode(65 + idx)}. ${item.title}</strong></p>\n${item.postHtmlBody}`)
        .join("");
  }

  // 1. Plain Text Email
  const mailText = `Dear Team,

This is to inform you that the PMS ticket cancellation process has been executed for a total of ${totalTickets} tickets.

1. PMS Ticket Cancellation Summary

${mailTextTable}${nonNamoApprovalMailText}${exceptionsMailText}`;

  // 2. HTML Email
  const mailHtml = `<div style="font-family: Calibri, Arial, sans-serif; font-size: 13px; line-height: 1.5;">
  ${renderEmailHeader("Dear Team,")}
  <p style="margin-top: 0; margin-bottom: 12px;">This is to inform you that the PMS ticket cancellation process has been executed for a total of <strong>${totalTickets} tickets</strong>.</p>
  
  <p style="font-weight: bold; font-size: 14px; margin-top: 18px; margin-bottom: 6px;">1. PMS Ticket Cancellation Summary</p>
  <table style="border-collapse: collapse; width: 100%; max-width: 650px; font-size: 13px; border: 1px solid #cbd5e1;">
    <thead>
      <tr style="background-color: #f1f5f9; text-align: left;">
        <th style="padding: 6px 12px; border: 1px solid #cbd5e1;">Ticket Category / Status</th>
        <th style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right;">Ticket Count</th>
      </tr>
    </thead>
    <tbody>
      ${mailHtmlTableRows.join("\n      ")}
    </tbody>
  </table>${nonNamoApprovalMailHtml}${exceptionsMailHtml}

</div>`;

  // 3. Post Text (Slack / Teams / Chatter text - NO table markup)
  const postText = `📢 **PMS TICKET CANCELLATION – EXECUTION SUMMARY**

The PMS ticket cancellation process has been executed for a total of **${totalTickets} tickets**.

━━━━━━━━━━━━━━━━━━━━
**1. PMS TICKET CANCELLATION SUMMARY**

${postTextSummaryRows.join("\n")}${nonNamoApprovalPostText}${exceptionsPostText}
`;

  // 4. Post HTML (NO table tags for Salesforce Chatter compatibility)
  const postHtml = `<p><strong>PMS TICKET CANCELLATION – EXECUTION SUMMARY</strong></p>
<p>The PMS ticket cancellation process has been executed for a total of <strong>${totalTickets} tickets</strong>.</p>
<hr/>
<p><strong>1. PMS TICKET CANCELLATION SUMMARY</strong></p>
<p>
${postHtmlSummaryRows.join("<br/>\n")}
</p>${nonNamoApprovalPostHtml}${exceptionsPostHtml}
`;

  return {
    mailText,
    mailHtml,
    postText,
    postHtml,
  };
}

export interface Step5OutputOptions {
  cancellationType: string;
  totalTickets: number;
  executableCount: number;
  parsedFailed: ParsedFailedResult;
  ccoApprovalExtra?: string;
  namoResult?: NamoAlgo2Result;
  nonNamoResult?: NonNamoAlgo3Result;
  accountCheckResult?: AccountCheckResult;
  ccoResult?: CcoAlgoResult;
}

export interface Step5OutputResult {
  mailText: string;
  mailHtml: string;
  postText: string;
  postHtml: string;
}

export function buildCancellationStep5Output(options: Step5OutputOptions): Step5OutputResult {
  const {
    cancellationType,
    totalTickets,
    executableCount,
    parsedFailed,
    ccoApprovalExtra = "",
    namoResult,
    nonNamoResult,
    accountCheckResult,
    ccoResult,
  } = options;

  const { lockedTickets, otherFailedTickets, allFailedTickets } = parsedFailed;

  // Cross-reference records if otherFailedTickets contains tickets whose approval was sent or record was locked
  const recordsToCheck: (NonNamoTicketItem | NamoTicketItem | CcoTicketItem)[] =
    ccoResult?.allRecords || nonNamoResult?.allRecords || namoResult?.allRecords || [];
  if (recordsToCheck.length > 0) {
    for (let i = otherFailedTickets.length - 1; i >= 0; i--) {
      const t = otherFailedTickets[i];
      if (!t) continue;
      const rec = recordsToCheck.find(
        (r) => r.ticket === t || (r.id && r.id === t)
      );
      if (rec && (rec.isApprovalSent || rec.isLocked || rec.skipReason?.includes("Approval Pending"))) {
        if (!lockedTickets.includes(t)) {
          lockedTickets.push(t);
        }
        otherFailedTickets.splice(i, 1);
      }
    }
  }

  const otherFailedCount = otherFailedTickets.length;
  const totalFailedCount = allFailedTickets.length;
  const baseExecutable =
    typeof executableCount === "number" && !isNaN(executableCount)
      ? executableCount
      : ccoResult?.ccoCancellationTickets.length ??
        nonNamoResult?.nonNamoCancellationTickets.length ??
        namoResult?.namoCancellationTickets.length ??
        totalTickets;
  const successCount = Math.max(0, baseExecutable - totalFailedCount);

  // 1. NON NAMO Cancellation Mode
  if (cancellationType === "NON NAMO") {
    let acResult = accountCheckResult;
    if (!acResult || acResult.totalCount === 0) {
      if (nonNamoResult && nonNamoResult.allRecords.length > 0) {
        acResult = {
          totalCount: nonNamoResult.allRecords.length,
          allRows: nonNamoResult.allRecords.map((r: NonNamoTicketItem) => ({
            ticket: r.ticket,
            id: r.id || "",
            accountGroup: r.accountGroupName || "",
            accountGroupName: r.accountGroupName || "",
            accountGroupCategory: r.accountGroupCategory,
            accountName: r.accountName || "",
            status: r.status || "",
            fgr: r.fgr || "",
            assetId: "",
            parentId: r.parentWorkOrderId || "",
            parentTicket: r.parentTicket || "",
            isParent: false,
            isChild: Boolean(r.isChild),
            isPms: r.isAutoPms,
            isApprovalSent: Boolean(r.isApprovalSent),
            isMrCreated: Boolean(r.isMrCreated),
            isLocked: r.isLocked,
          })),
          namoCount: nonNamoResult.namoTickets.length,
          nonNamoCount: nonNamoResult.allRecords.filter(
            (r: NonNamoTicketItem) => r.accountGroupCategory === "NON-NAMO"
          ).length,
          unclassifiedGroupCount: nonNamoResult.unclassifiedTickets.length,
          parentCount: nonNamoResult.parentWorkOrderTickets.length,
          childCount: nonNamoResult.parentWorkOrderTickets.length,
          pmsCount: nonNamoResult.allAutoPmsTickets.length,
          nonPmsCount: nonNamoResult.nonAutoPmsTickets.length,
          approvalSentCount: nonNamoResult.approvalPendingTickets.length,
          mrCreatedCount: nonNamoResult.mrCreatedTickets.length,
        };
      }
    }
    if (acResult && acResult.totalCount > 0) {
      return buildNonNamoExecutionSummary(acResult, otherFailedTickets, lockedTickets);
    }
  }

  // 2. NAMO Cancellation Mode
  if (cancellationType === "NAMO") {
    let acResult = accountCheckResult;
    if (!acResult || acResult.totalCount === 0) {
      if (namoResult && namoResult.allRecords.length > 0) {
        acResult = {
          totalCount: namoResult.allRecords.length,
          allRows: namoResult.allRecords.map((r: NamoTicketItem) => ({
            ticket: r.ticket,
            id: r.id || "",
            accountGroup: r.accountGroupName || "",
            accountGroupName: r.accountGroupName || "",
            accountGroupCategory: r.accountGroupCategory,
            accountName: r.accountName || "",
            status: r.status || "",
            fgr: r.fgr || "",
            assetId: "",
            parentId: r.parentWorkOrderId || "",
            parentTicket: r.parentTicket || "",
            isParent: false,
            isChild: Boolean(r.isChild),
            isPms: r.isAutoPms,
            isApprovalSent: Boolean(r.isApprovalSent),
            isMrCreated: Boolean(r.isMrCreated),
            isLocked: r.isLocked,
          })),
          namoCount: namoResult.namoCancellationTickets.length,
          nonNamoCount: namoResult.nonNamoTickets.length,
          unclassifiedGroupCount: namoResult.unclassifiedTickets.length,
          parentCount: namoResult.parentWorkOrderTickets.length,
          childCount: namoResult.parentWorkOrderTickets.length,
          pmsCount: namoResult.allAutoPmsTickets.length,
          nonPmsCount: namoResult.nonAutoPmsTickets.length,
          approvalSentCount: namoResult.approvalPendingTickets.length,
          mrCreatedCount: namoResult.mrCreatedTickets.length,
        };
      }
    }
    if (acResult && acResult.totalCount > 0) {
      return buildNamoExecutionSummary(acResult, otherFailedTickets, lockedTickets);
    }
  }

  // 3. NON NAMO Cancellation Mode (without Account Check)
  if (
    cancellationType === "NON NAMO" &&
    nonNamoResult &&
    (nonNamoResult.allRecords.length > 0 || nonNamoResult.allAutoPmsTickets.length > 0)
  ) {
    // Unified Approval Pending: Step 3 (Is_Approval_Sent / isLocked) + Step 5 (ENTITY_IS_LOCKED / lockedTickets)
    const unifiedApprovalPending = Array.from(
      new Set([
        ...nonNamoResult.approvalPendingTickets.map((t: NonNamoTicketItem) => t.ticket).filter(Boolean),
        ...lockedTickets,
      ])
    );
    const cleanOtherFailedTickets = otherFailedTickets.filter(
      (t: string) => !unifiedApprovalPending.includes(t)
    );
    const unifiedApprovalPendingCount = unifiedApprovalPending.length;
    const cleanOtherFailedCount = cleanOtherFailedTickets.length;

    if (totalFailedCount === 0) {
      return {
        mailText: nonNamoResult.nonNamoMailOutputText,
        mailHtml: nonNamoResult.nonNamoMailOutputHtml,
        postText: nonNamoResult.nonNamoPostOutputText,
        postHtml: nonNamoResult.nonNamoPostOutputHtml,
      };
    }

    const totalAuto = nonNamoResult.allAutoPmsTickets.length;
    const totalExcluded = nonNamoResult.allSkippedTickets.length;
    const breakdownLines: string[] = [];
    if (nonNamoResult.nonAutoPmsTickets.length > 0) {
      breakdownLines.push(`• Total Non-PMS Tickets: ${nonNamoResult.nonAutoPmsTickets.length}`);
    }
    if (nonNamoResult.namoTickets.length > 0) {
      breakdownLines.push(`• Skipped NAMO Group Tickets (Condition 2): ${nonNamoResult.namoTickets.length}`);
    }
    if (nonNamoResult.parentWorkOrderTickets.length > 0) {
      breakdownLines.push(`• Skipped Child WorkOrders with Parent Present (Condition 3): ${nonNamoResult.parentWorkOrderTickets.length}`);
    }
    if (nonNamoResult.completedOrCanceledTickets.length > 0) {
      breakdownLines.push(`• Skipped Completed/Canceled Status (Condition 3): ${nonNamoResult.completedOrCanceledTickets.length}`);
    }
    if (nonNamoResult.unclassifiedTickets.length > 0) {
      breakdownLines.push(`• Skipped Unclassified / Blank Group: ${nonNamoResult.unclassifiedTickets.length}`);
    }
    if (unifiedApprovalPendingCount > 0) {
      breakdownLines.push(`• Approval Pending: ${unifiedApprovalPendingCount}`);
    }
    if (cleanOtherFailedCount > 0) {
      breakdownLines.push(`• Failed NON-NAMO Tickets: ${cleanOtherFailedCount}`);
    }

    const summaryText = `Cancellation has been processed for NON-NAMO tickets.\n\nTotal Auto PMS Tickets: ${totalAuto}\nCancelled (NON-NAMO): ${successCount}\n${unifiedApprovalPendingCount > 0 ? `Approval Pending: ${unifiedApprovalPendingCount}\n` : ""}${cleanOtherFailedCount > 0 ? `Failed NON-NAMO Tickets: ${cleanOtherFailedCount}\n` : ""}Total Excluded: ${totalExcluded}\n${breakdownLines.join("\n")}`;

    const summaryHtml = `<p>Cancellation has been processed for NON-NAMO tickets.</p><p>Total Auto PMS Tickets: ${totalAuto}<br>Cancelled (NON-NAMO): ${successCount}<br>${unifiedApprovalPendingCount > 0 ? `Approval Pending: ${unifiedApprovalPendingCount}<br>` : ""}${cleanOtherFailedCount > 0 ? `Failed NON-NAMO Tickets: ${cleanOtherFailedCount}<br>` : ""}Total Excluded: ${totalExcluded}<br>${breakdownLines.join("<br>")}</p>`;

    let lockedDetailsText = "";
    let lockedDetailsHtml = "";
    if (unifiedApprovalPendingCount > 0) {
      lockedDetailsText = `\n\nApproval Pending:\nApproval is pending against the following ticket(s):\n${unifiedApprovalPending.map((t: string) => `• ${t}`).join("\n")}`;
      lockedDetailsHtml = `<br><p><b>Approval Pending:</b><br>Approval is pending against the following ticket(s):<br>${unifiedApprovalPending.map((t: string) => `• ${t}`).join("<br>")}</p>`;
    }

    let otherFailedDetailsText = "";
    let otherFailedDetailsHtml = "";
    if (cleanOtherFailedCount > 0) {
      otherFailedDetailsText = `\n\nFailed Tickets:\n${cleanOtherFailedTickets.map((t: string) => `• ${t}`).join("\n")}`;
      otherFailedDetailsHtml = `<br><p><b>Failed Tickets:</b><br>${cleanOtherFailedTickets.map((t: string) => `• ${t}`).join("<br>")}</p>`;
    }

    const mailText = `Dear,\n${summaryText}${lockedDetailsText}${otherFailedDetailsText}\n\n${nonNamoResult.excludedSegmentText || nonNamoResult.namoMailSegmentText}`;
    const mailHtml = `<p>Dear,</p>${summaryHtml}${lockedDetailsHtml}${otherFailedDetailsHtml}<br>${nonNamoResult.excludedSegmentHtml || nonNamoResult.namoMailSegmentHtml}`;
    const postText = `@taguser \n${summaryText}${lockedDetailsText}${otherFailedDetailsText}\n\n${nonNamoResult.namoPostSegmentText || nonNamoResult.excludedSegmentText}`;
    const postHtml = `<p>@taguser </p>${summaryHtml}${lockedDetailsHtml}${otherFailedDetailsHtml}<br>${nonNamoResult.namoPostSegmentHtml || nonNamoResult.excludedSegmentHtml}`;

    return { mailText, mailHtml, postText, postHtml };
  }

  // 3.5 CCO Cancellation Mode (with rich CCO classification result)
  if (
    cancellationType === "CCO" &&
    ccoResult &&
    (ccoResult.allRecords.length > 0 || ccoResult.allTickets.length > 0)
  ) {
    const unifiedApprovalPending = Array.from(
      new Set([
        ...ccoResult.approvalPendingTickets.map((t: CcoTicketItem) => t.ticket).filter(Boolean),
        ...lockedTickets,
      ])
    );
    const cleanOtherFailedTickets = otherFailedTickets.filter(
      (t: string) => !unifiedApprovalPending.includes(t)
    );
    const unifiedApprovalPendingCount = unifiedApprovalPending.length;
    const cleanOtherFailedCount = cleanOtherFailedTickets.length;
    const totalCco =
      ccoResult.allRecords.length > 0
        ? ccoResult.allRecords.length
        : totalTickets || (ccoResult.allTickets.length ?? 0);

    if (totalFailedCount === 0 && unifiedApprovalPendingCount === 0) {
      if (ccoResult.allSkippedTickets.length === 0) {
        const mailText = `Dear,\nCancellation has been done successfully.\n\nTotal Tickets: ${totalCco}${ccoApprovalExtra ? `\n\n${ccoApprovalExtra}` : ""}`;
        const postText = `@taguser \nCancellation has been done successfully.\n\nTotal Tickets: ${totalCco}${ccoApprovalExtra ? `\n\n${ccoApprovalExtra}` : ""}`;
        const mailHtml = `<div style="font-family: Calibri, Arial, sans-serif; font-size: 13px; line-height: 1.5;">${renderEmailHeader("Dear Team,")}<p style="margin-top: 0; margin-bottom: 12px;">Cancellation has been done successfully.</p><p style="margin-top: 0; margin-bottom: 12px;">Total Tickets: ${totalCco}</p>${ccoApprovalExtra ? `<p style="margin-top: 0; margin-bottom: 12px;"><b>${ccoApprovalExtra.replace(/\n/g, "<br>")}</b></p>` : ""}</div>`;
        const postHtml = `<p>@taguser </p><p>Cancellation has been done successfully.</p><br><p>Total Tickets: ${totalCco}</p>${ccoApprovalExtra ? `<br><p><b>${ccoApprovalExtra.replace(/\n/g, "<br>")}</b></p>` : ""}`;
        return { mailText, mailHtml, postText, postHtml };
      }
      return {
        mailText: `${ccoResult.ccoMailOutputText}${ccoApprovalExtra ? `\n\n${ccoApprovalExtra}` : ""}`,
        mailHtml: `${ccoResult.ccoMailOutputHtml}${ccoApprovalExtra ? `<br><p><b>${ccoApprovalExtra.replace(/\n/g, "<br>")}</b></p>` : ""}`,
        postText: `${ccoResult.ccoPostOutputText}${ccoApprovalExtra ? `\n\n${ccoApprovalExtra}` : ""}`,
        postHtml: `${ccoResult.ccoPostOutputHtml}${ccoApprovalExtra ? `<br><p><b>${ccoApprovalExtra.replace(/\n/g, "<br>")}</b></p>` : ""}`,
      };
    }

    const totalExcluded = ccoResult.allSkippedTickets.length;
    const breakdownLines: string[] = [];
    if (ccoResult.autoPmsTickets.length > 0) {
      breakdownLines.push(`• Skipped Auto PMS Tickets: ${ccoResult.autoPmsTickets.length}`);
    }
    if (ccoResult.parentWorkOrderTickets.length > 0) {
      breakdownLines.push(`• Skipped Child WorkOrders with Parent Present: ${ccoResult.parentWorkOrderTickets.length}`);
    }
    if (ccoResult.completedOrCanceledTickets.length > 0) {
      breakdownLines.push(`• Skipped Completed/Canceled Status: ${ccoResult.completedOrCanceledTickets.length}`);
    }
    if (ccoResult.mrCreatedTickets && ccoResult.mrCreatedTickets.length > 0) {
      breakdownLines.push(`• Skipped Material Request (MR) Created: ${ccoResult.mrCreatedTickets.length}`);
    }
    if (unifiedApprovalPendingCount > 0) {
      breakdownLines.push(`• Skipped Approval Pending: ${unifiedApprovalPendingCount}`);
    }
    if (cleanOtherFailedCount > 0) {
      breakdownLines.push(`• Failed CCO Tickets: ${cleanOtherFailedCount}`);
    }

    const summaryText = `Cancellation has been processed for CCO tickets.\n\nTotal Tickets: ${totalCco}\nCancelled (CCO): ${successCount}\n${unifiedApprovalPendingCount > 0 ? `Approval Pending: ${unifiedApprovalPendingCount}\n` : ""}${cleanOtherFailedCount > 0 ? `Failed CCO Tickets: ${cleanOtherFailedCount}\n` : ""}Total Excluded: ${totalExcluded}\n${breakdownLines.join("\n")}`;

    const summaryHtml = `<p>Cancellation has been processed for CCO tickets.</p><p>Total Tickets: ${totalCco}<br>Cancelled (CCO): ${successCount}<br>${unifiedApprovalPendingCount > 0 ? `Approval Pending: ${unifiedApprovalPendingCount}<br>` : ""}${cleanOtherFailedCount > 0 ? `Failed CCO Tickets: ${cleanOtherFailedCount}<br>` : ""}Total Excluded: ${totalExcluded}<br>${breakdownLines.join("<br>")}</p>`;

    let lockedDetailsText = "";
    let lockedDetailsHtml = "";
    if (unifiedApprovalPendingCount > 0) {
      lockedDetailsText = `\n\nApproval Pending:\nApproval is pending against the following ticket(s):\n${unifiedApprovalPending.map((t: string) => `• ${t}`).join("\n")}`;
      lockedDetailsHtml = `<br><p><b>Approval Pending:</b><br>Approval is pending against the following ticket(s):<br>${unifiedApprovalPending.map((t: string) => `• ${t}`).join("<br>")}</p>`;
    }

    let otherFailedDetailsText = "";
    let otherFailedDetailsHtml = "";
    if (cleanOtherFailedCount > 0) {
      otherFailedDetailsText = `\n\nFailed Tickets:\n${cleanOtherFailedTickets.map((t: string) => `• ${t}`).join("\n")}`;
      otherFailedDetailsHtml = `<br><p><b>Failed Tickets:</b><br>${cleanOtherFailedTickets.map((t: string) => `• ${t}`).join("<br>")}</p>`;
    }

    let autoPmsDetailsText = "";
    let autoPmsDetailsHtml = "";
    if (ccoResult.autoPmsTickets.length > 0) {
      autoPmsDetailsText = `\n\nAuto PMS Tickets (Requires Approval):\nThe following Auto PMS ticket(s) cannot be cancelled under CCO without department approval (Suraj Sir - UCPG / Vishal Sir - CPSD):\n${ccoResult.autoPmsTickets.map((t: CcoTicketItem) => `• ${t.ticket}`).join("\n")}`;
      autoPmsDetailsHtml = `<br><p><b>Auto PMS Tickets (Requires Approval):</b><br>The following Auto PMS ticket(s) cannot be cancelled under CCO without department approval (Suraj Sir - UCPG / Vishal Sir - CPSD):<br>${ccoResult.autoPmsTickets.map((t: CcoTicketItem) => `• ${t.ticket}`).join("<br>")}</p>`;
    }

    let mrCreatedDetailsText = "";
    let mrCreatedDetailsHtml = "";
    if (ccoResult.mrCreatedTickets && ccoResult.mrCreatedTickets.length > 0) {
      mrCreatedDetailsText = `\n\nMaterial Request (MR) Created:\nThe following ticket(s) have an active Material Request created and cannot be cancelled:\n${ccoResult.mrCreatedTickets.map((t: CcoTicketItem) => `• ${t.ticket}`).join("\n")}`;
      mrCreatedDetailsHtml = `<br><p><b>Material Request (MR) Created:</b><br>The following ticket(s) have an active Material Request created and cannot be cancelled:<br>${ccoResult.mrCreatedTickets.map((t: CcoTicketItem) => `• ${t.ticket}`).join("<br>")}</p>`;
    }

    let parentDetailsText = "";
    let parentDetailsHtml = "";
    if (ccoResult.parentWorkOrderTickets.length > 0) {
      parentDetailsText = `\n\nChild WorkOrders (Parent Present):\nThe following ticket(s) have a parent work order present and cannot be cancelled:\n${ccoResult.parentWorkOrderTickets.map((t: CcoTicketItem) => `• ${t.ticket}${t.parentWorkOrderId || t.parentTicket ? ` (Parent: ${t.parentTicket || t.parentWorkOrderId})` : ""}`).join("\n")}`;
      parentDetailsHtml = `<br><p><b>Child WorkOrders (Parent Present):</b><br>The following ticket(s) have a parent work order present and cannot be cancelled:<br>${ccoResult.parentWorkOrderTickets.map((t: CcoTicketItem) => `• ${t.ticket}${t.parentWorkOrderId || t.parentTicket ? ` (Parent: ${t.parentTicket || t.parentWorkOrderId})` : ""}`).join("<br>")}</p>`;
    }

    let completedDetailsText = "";
    let completedDetailsHtml = "";
    if (ccoResult.completedOrCanceledTickets.length > 0) {
      completedDetailsText = `\n\nAlready Completed / Canceled:\nThe following ticket(s) are already completed or canceled:\n${ccoResult.completedOrCanceledTickets.map((t: CcoTicketItem) => `• ${t.ticket}${t.status ? ` (Status: ${t.status})` : ""}`).join("\n")}`;
      completedDetailsHtml = `<br><p><b>Already Completed / Canceled:</b><br>The following ticket(s) are already completed or canceled:<br>${ccoResult.completedOrCanceledTickets.map((t: CcoTicketItem) => `• ${t.ticket}${t.status ? ` (Status: ${t.status})` : ""}`).join("<br>")}</p>`;
    }

    const detailSectionsText = `${lockedDetailsText}${otherFailedDetailsText}${autoPmsDetailsText}${mrCreatedDetailsText}${parentDetailsText}${completedDetailsText}`;
    const detailSectionsHtml = `${lockedDetailsHtml}${otherFailedDetailsHtml}${autoPmsDetailsHtml}${mrCreatedDetailsHtml}${parentDetailsHtml}${completedDetailsHtml}`;

    const tableText = ccoResult.excludedSegmentText ? `\n\n${ccoResult.excludedSegmentText}` : "";
    const tableHtml = ccoResult.excludedSegmentHtml ? `<br>${ccoResult.excludedSegmentHtml}` : "";

    const approvalExtraBlock = ccoApprovalExtra ? `\n\n${ccoApprovalExtra}` : "";
    const approvalExtraHtmlBlock = ccoApprovalExtra ? `<br><p><b>${ccoApprovalExtra.replace(/\n/g, "<br>")}</b></p>` : "";

    const mailText = `Dear,\n${summaryText}${detailSectionsText}${tableText}${approvalExtraBlock}`;
    const mailHtml = `<div style="font-family: Calibri, Arial, sans-serif; font-size: 13px; line-height: 1.5;">${renderEmailHeader("Dear Team,")}${summaryHtml}${detailSectionsHtml}${tableHtml}${approvalExtraHtmlBlock}</div>`;
    const postText = `@taguser \n${summaryText}${detailSectionsText}${tableText}${approvalExtraBlock}`;
    const postHtml = `<p>@taguser </p>${summaryHtml}${detailSectionsHtml}${tableHtml}${approvalExtraHtmlBlock}`;

    return { mailText, mailHtml, postText, postHtml };
  }

  // 4. CCO / Default Mode
  if (totalFailedCount === 0) {
    const mailText = `Dear,\nCancellation has been done successfully.\n\nTotal Tickets: ${totalTickets}${ccoApprovalExtra}`;
    const postText = `@taguser \nCancellation has been done successfully.\n\nTotal Tickets: ${totalTickets}${ccoApprovalExtra}`;
    const mailHtml = `<div style="font-family: Calibri, Arial, sans-serif; font-size: 13px; line-height: 1.5;">${renderEmailHeader("Dear Team,")}<p style="margin-top: 0; margin-bottom: 12px;">Cancellation has been done successfully.</p><p style="margin-top: 0; margin-bottom: 12px;">Total Tickets: ${totalTickets}</p>${ccoApprovalExtra ? `<p style="margin-top: 0; margin-bottom: 12px;"><b>${ccoApprovalExtra.replace(/\n/g, "<br>")}</b></p>` : ""}</div>`;
    const postHtml = `<p>@taguser </p><p>Cancellation has been done successfully.</p><br><p>Total Tickets: ${totalTickets}</p>${ccoApprovalExtra ? `<br><p><b>${ccoApprovalExtra.replace(/\n/g, "<br>")}</b></p>` : ""}`;
    return { mailText, mailHtml, postText, postHtml };
  }

  let bodyText = `Cancellation has been processed.\nTotal Tickets: ${totalTickets}\nCancelled Tickets: ${successCount}`;
  let bodyHtml = `<p>Cancellation has been processed.<br>Total Tickets: ${totalTickets}<br>Cancelled Tickets: ${successCount}</p>`;

  if (lockedTickets.length > 0) {
    bodyText += `\n\nApproval Pending:\nApproval is pending against the following ticket(s):\n${lockedTickets.map((t: string) => `• ${t}`).join("\n")}`;
    bodyHtml += `<p><b>Approval Pending:</b><br>Approval is pending against the following ticket(s):<br>${lockedTickets.map((t: string) => `• ${t}`).join("<br>")}</p>`;
  }

  if (otherFailedCount > 0) {
    bodyText += `\n\nFailed Tickets:\n${otherFailedTickets.map((t: string) => `• ${t}`).join("\n")}`;
    bodyHtml += `<p><b>Failed Tickets:</b><br>${otherFailedTickets.map((t: string) => `• ${t}`).join("<br>")}</p>`;
  }

  if (ccoApprovalExtra) {
    bodyText += ccoApprovalExtra;
    bodyHtml += `<br><p><b>${ccoApprovalExtra.replace(/\n/g, "<br>")}</b></p>`;
  }

  return {
    mailText: `Dear,\n${bodyText}`,
    postText: `@taguser \n${bodyText}`,
    mailHtml: `<div style="font-family: Calibri, Arial, sans-serif; font-size: 13px; line-height: 1.5;">${renderEmailHeader("Dear Team,")}${bodyHtml}</div>`,
    postHtml: `<p>@taguser </p>${bodyHtml}`,
  };
}
