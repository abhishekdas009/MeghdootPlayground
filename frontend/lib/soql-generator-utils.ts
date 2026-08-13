import {
  SALESFORCE_ID_REGEX,
  CHILD_DETAILS_COMPONENT_ID_HEADERS,
  CHILD_DETAILS_PARENT_ACCOUNT_ID_HEADERS,
  parseSOQLResultWithHeaders,
  parseSOQLResult,
  getRowValue,
  hasAnyHeader,
  getSalesforceRecordKey,
  buildCSVRow,
  buildTSVRow
} from './parsers';

export interface Template {
  id: string;
  name: string;
  category: string;
  soql: string;
  favourite: boolean;
  type?: "normal" | "asset-transfer" | "child-details-to-parent";
  source?: "default" | "library";
  usageCount?: number;
}

export interface ChildDetailsParentTransformResult {
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

export interface CancellationExecutionRow {
  id: string;
  ticket: string;
  status: string;
}

export interface CaseAssignmentRow {
  id: string;
  status: "Open";
}

export interface CaseAssignmentResult {
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

export interface CaseOwner {
  id: string;
  name: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoundRobinHistoryEntry {
  batchId: number;
  totalCases: number;
  baseCases: number;
  extraCases: number;
  extraOwners: CaseOwner[];
  startOwner: CaseOwner | null;
  nextStartOwner: CaseOwner | null;
  timestamp: string;
}

export interface CumulativeLoadMap {
  [ownerId: string]: { total: number; extra: number };
}

export interface QuantityOwnerConfig {
  id: string;
  name: string;
  ownerId: string;
  selected: boolean;
  quantity: string;
}

export type CaseAssignMode = "equal" | "owner-wise" | "quantity-wise";

export const CHILD_DETAILS_PARENT_TARGET_RECORD_TYPE_ID = "012Ny0000003SvrIAE";
export const CANCELLATION_QUERY_TEMPLATE = `SELECT Id, Ticket_Number_Read_Only__c, Status
FROM WorkOrder
WHERE Status != 'Completed' AND Ticket_Number_Read_Only__c IN (
{{tickets}}
)`;
export const CANCELLATION_BATCH_SIZE = 400;

export const defaultTemplates: Template[] = [
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

export const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  B: { label: "Breakdown", color: "bg-red-500" },
  I: { label: "Installation", color: "bg-blue-500" },
  S: { label: "Regular Service", color: "bg-green-500" },
  X: { label: "Stock Defective", color: "bg-orange-500" },
  C: { label: "Commissioning", color: "bg-purple-500" },
  A: { label: "AutoPMS", color: "bg-teal-500" },
  D: { label: "Demo", color: "bg-pink-500" },
};

export const EMAIL_TEMPLATE = `Hello,\nYour service ticket status has been updated to Accepted. Kindly check and revert.\n`;

export const POST_TEMPLATE = `@tag_user Your service ticket status has been updated to Accepted. Kindly check and revert.`;

export const SOQL_BATCH_SIZE = 400;

export interface TicketStats {
  total: number;
  breakdown: Record<string, number>;
  unknown: number;
}

export function createOwnerId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `owner-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getDefaultCaseOwners(): CaseOwner[] {
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

export function isValidOwnerRecord(value: unknown): value is CaseOwner {
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

export function buildQuantityConfig(owners: CaseOwner[]): QuantityOwnerConfig[] {
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

export async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string" && body.error.trim()) return body.error;
  } catch {
    // Ignore JSON parsing errors and use a generic message below.
  }

  return "Request failed";
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
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

export function getTicketStats(tickets: string[]): TicketStats {
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









export function escapeSOQLString(value: string): string {
  return value.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

export function formatSOQLValues(values: string[]): string {
  return values.map((val) => `'${escapeSOQLString(val.trim())}'`).join(",\n");
}

export function buildChildDetailsParentSOQL(componentIds: string[]): string {
  if (componentIds.length === 0) return "";
  return `SELECT Id, Component_Id__c, Parent.AccountId, ParentId, RecordTypeId
FROM Asset
WHERE Component_Id__c IN (
${formatSOQLValues(componentIds)}
)`;
}







export function transformChildDetailsToParent(
  sourceSOQLResult: string,
  requestedComponentIds: string[]
): ChildDetailsParentTransformResult {
  const result: ChildDetailsParentTransformResult = {
    output: "",
    sourceRows: 0,
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
    missingHeaders: [],
  };

  if (!sourceSOQLResult.trim() || requestedComponentIds.length === 0) {
    return result;
  }

  const { headers, rows } = parseSOQLResultWithHeaders(sourceSOQLResult);
  result.sourceRows = rows.length;

  if (
    !hasAnyHeader(headers, CHILD_DETAILS_COMPONENT_ID_HEADERS) ||
    !hasAnyHeader(headers, ["id"]) ||
    !hasAnyHeader(headers, CHILD_DETAILS_PARENT_ACCOUNT_ID_HEADERS)
  ) {
    result.missingHeaders = headers;
    return result;
  }

  const outputRows = [
    buildCSVRow([
      "RecordTypeId",
      "AssetId",
      "Street",
      "City",
      "State",
      "PostalCode",
      "Country",
      "AccountId",
    ]),
  ];

  const requestedComponents = new Map<string, string>();
  for (const cid of requestedComponentIds) {
    requestedComponents.set(cid.toLowerCase(), cid);
  }

  const returnedComponentKeys = new Set<string>();
  const candidateByAsset = new Map<
    string,
    { assetId: string; parentAccountId: string; componentId: string }
  >();
  const conflictingAssetKeys = new Set<string>();

  for (const row of rows) {
    const rawComponentId = getRowValue(row, CHILD_DETAILS_COMPONENT_ID_HEADERS);
    const rawAssetId = row.id ?? "";
    const rawParentAccountId = getRowValue(row, CHILD_DETAILS_PARENT_ACCOUNT_ID_HEADERS);

    if (!rawComponentId) {
      result.missingComponentIdRows += 1;
      continue;
    }

    if (!rawAssetId) {
      result.missingAssetIdRows += 1;
      continue;
    }

    if (!rawParentAccountId) {
      result.missingParentAccountIdRows += 1;
      continue;
    }

    if (!SALESFORCE_ID_REGEX.test(rawAssetId)) {
      result.invalidAssetIdRows += 1;
      continue;
    }

    if (!SALESFORCE_ID_REGEX.test(rawParentAccountId)) {
      result.invalidParentAccountIdRows += 1;
      continue;
    }

    const componentKey = rawComponentId.toLowerCase();
    const isRequested = requestedComponents.has(componentKey);
    const resolvedComponentId = isRequested
      ? requestedComponents.get(componentKey)!
      : rawComponentId;
    returnedComponentKeys.add(componentKey);

    if (!isRequested) {
      result.unexpectedComponentRows += 1;
      continue;
    }

    const assetKey = getSalesforceRecordKey(rawAssetId);
    const candidate = {
      assetId: rawAssetId,
      parentAccountId: rawParentAccountId,
      componentId: resolvedComponentId,
    };

    if (candidateByAsset.has(assetKey)) {
      const existing = candidateByAsset.get(assetKey)!;
      if (existing.parentAccountId !== candidate.parentAccountId) {
        conflictingAssetKeys.add(assetKey);
      }
      result.duplicateRows += 1;
      continue;
    }

    candidateByAsset.set(assetKey, candidate);
  }

  for (const [assetKey, candidate] of candidateByAsset.entries()) {
    if (!conflictingAssetKeys.has(assetKey)) {
      outputRows.push(
        buildCSVRow([
          CHILD_DETAILS_PARENT_TARGET_RECORD_TYPE_ID,
          candidate.assetId,
          "",
          "",
          "",
          "",
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



export function parseCancellationExecutionRows(input: string): CancellationExecutionRow[] {
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

export function buildCancellationCanceledOutput(rows: CancellationExecutionRow[]): string {
  const outputRows = [buildTSVRow(["_", "Id", "Ticket_Number_Read_Only__c", "Status"])];

  for (const row of rows) {
    outputRows.push(buildTSVRow(["[WorkOrder]", row.id, row.ticket, "Canceled"]));
  }

  return outputRows.join("\n");
}

export function buildCaseAssignmentRows(caseIds: string[]): CaseAssignmentRow[] {
  return caseIds.map((id) => ({ id, status: "Open" }));
}

export function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export function downloadTextFile(filename: string, content: string, type = "text/plain;charset=utf-8;") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildCaseAssignmentOutput(assignments: Array<{ row: CaseAssignmentRow; owner: Pick<CaseOwner, "ownerId"> }>) {
  const outputLines: string[] = ['"_","Id","Status","OwnerId"'];

  assignments.forEach(({ row, owner }) => {
    outputLines.push(`"[Case]","${row.id}","${row.status}","${owner.ownerId}"`);
  });

  return outputLines.join("\n");
}

export function getSecureRandomIndex(maxExclusive: number): number {
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

export function shuffleItems<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = getSecureRandomIndex(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!];
  }

  return shuffled;
}

export function buildBalancedAssignments(
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

export function buildQuantityWiseAssignments(
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
