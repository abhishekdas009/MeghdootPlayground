import fs from "fs";
import path from "path";
import { prisma } from "./prisma";

export interface StoredQuery {
  id: string;
  label: string;
  category: string;
  tags: string[];
  description: string;
  soql: string;
  favourite: boolean;
  usageCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const DEFAULT_SFDC_QUERIES: Omit<StoredQuery, "createdAt" | "updatedAt">[] = [
  {
    id: "sfdc-1",
    label: "TS (Ticket Status)",
    category: "WorkOrder",
    tags: ["tracking", "status"],
    description: "Fetch current WorkOrder Status and ParentWorkOrderId for ticket tracking.",
    soql: "SELECT Id, Status, ParentWorkOrderId\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)",
    favourite: true,
    usageCount: 0,
  },
  {
    id: "sfdc-2",
    label: "Asset Transfer",
    category: "Asset",
    tags: ["transfer", "hardware"],
    description: "Retrieve hardware asset details, account ownership, and installation status for transfer verification.",
    soql: "SELECT Id, Name, SerialNumber, AccountId, Status, InstallDate\nFROM Asset\nWHERE SerialNumber IN (\n{{tickets}}\n)",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-3",
    label: "CANCELLATION TICKETS",
    category: "WorkOrder",
    tags: ["cancellation", "open-tickets"],
    description: "Retrieve open, non-completed WorkOrders to prepare tickets for cancellation.",
    soql: "SELECT Id, Ticket_Number_Read_Only__c, Status\nFROM WorkOrder\nWHERE Status != 'Completed' AND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-4",
    label: "Cancellation Requested",
    category: "WorkOrder",
    tags: ["cancellation", "status"],
    description: "Filter WorkOrders where Status is currently marked as 'Cancellation Requested'.",
    soql: "SELECT Id, Ticket_Number_Read_Only__c, Is_Material_Consumed__c, Is_Approval_Sent__c, Status\nFROM WorkOrder\nWHERE ParentWorkOrderId = null and Status not in ('Completed','Canceled') AND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-5",
    label: "Case Cancellation",
    category: "WorkOrder",
    tags: ["cancellation", "case"],
    description: "Query parent Case status and cancellation reason fields for open work orders.",
    soql: "SELECT Id, Status, CaseId, Case.Status, Case.Cancellation_Reason__c, Cancellation_Reason__c\nFROM WorkOrder\nWHERE Status != 'Completed' AND Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-6",
    label: "SA (Service Appointment)",
    category: "ServiceAppointment",
    tags: ["appointment", "scheduling"],
    description: "Get Service Appointment ID and scheduling status for given ticket numbers.",
    soql: "SELECT Id, Status\nFROM ServiceAppointment\nWHERE Ticket_Numbers__c IN (\n{{tickets}}\n)",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-7",
    label: "Case Assign",
    category: "Case",
    tags: ["assignment", "routing"],
    description: "Retrieve Case Status and OwnerId to facilitate ticket reassignment workflows.",
    soql: "SELECT Id,Status,OwnerId\nFROM Case\nWHERE Id IN (\n{{tickets}}\n)",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-8",
    label: "TC (Technician Check)",
    category: "ServiceAppointment",
    tags: ["technician", "resource"],
    description: "Check assigned service resource (technician) details and parent work order relationships.",
    soql: "SELECT Id,\n       Work_Order__c,\n       FSSK__FSK_Assigned_Service_Resource__c,\n       FSSK__FSK_Assigned_Service_Resource__r.Name\nFROM ServiceAppointment\nWHERE Ticket_Numbers__c IN (\n{{tickets}}\n)",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-9",
    label: "TSC (Ticket Status Count)",
    category: "WorkOrder",
    tags: ["aggregation", "counts"],
    description: "Aggregate and count WorkOrders grouped by status, ordered by frequency.",
    soql: "SELECT Status,\n       COUNT(Id)\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)\nGROUP BY Status\nORDER BY COUNT(Id) DESC",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-10",
    label: "PO (Payout / Product Information)",
    category: "WorkOrder",
    tags: ["payout", "product"],
    description: "Fetch payout status and product sub-family codes for parent work orders.",
    soql: "SELECT Id,\n       ParentWorkOrderId,\n       Status,\n       Payout__c,\n       Asset.Product_Sub_Family__r.Code__c\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-11",
    label: "TS (Open Tickets Only)",
    category: "WorkOrder",
    tags: ["open-tickets", "status"],
    description: "Retrieve active tickets excluding Completed, Canceled, or Bundled statuses.",
    soql: "SELECT Id, Status\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n{{tickets}}\n)\nAND Status NOT IN ('Completed','Canceled','Bundled')",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-12",
    label: "Account ID Fetch",
    category: "Account",
    tags: ["account", "lookup"],
    description: "Lookup internal Account Id mapping using external Customer ID.",
    soql: "SELECT Customer_ID__c, Id\nFROM Account\nWHERE Customer_ID__c IN (\n{{tickets}}\n)",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-13",
    label: "Technician Assessment Link",
    category: "Contact",
    tags: ["contact", "technician"],
    description: "Retrieve technician contact names and assessment questionnaire URLs.",
    soql: "SELECT Name, Assessment_Link__c\nFROM Contact\nWHERE Technician_Number__c IN (\n{{tickets}}\n)",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-14",
    label: "Asset by Department",
    category: "Asset",
    tags: ["department", "assets"],
    description: "Query assets belonging to specific service department queues and NON NAMO accounts.",
    soql: "SELECT Id, Component_Id__c, Account.Name, RecordType.Name, Account.Id, Account.Group__c, Account.Customer_ID__c, Account.SAP_Customer_Id__c\nFROM Asset\nWHERE Service_Department_L__c = 'a3cNy0000001IStIAM' AND Account_Group__c = 'NON NAMO'",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-15",
    label: "Asset ID Fetch",
    category: "Asset",
    tags: ["asset", "lookup"],
    description: "Lookup Component Id, record type, and parent account relationships for hardware assets.",
    soql: "SELECT Component_Id__c, Id, Account.Customer_ID__c, Record_Type__c, Parent.Id, Parent.Account.Id\nFROM Asset\nWHERE Component_Id__c IN (\n{{tickets}}\n)",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-16",
    label: "Child Details to Parent",
    category: "Asset",
    tags: ["hierarchy", "parent-child"],
    description: "Retrieve parent asset ID, model numbers, and product families from child components.",
    soql: "SELECT Parent.Id, Model_Number__c, Product_Family__c, Product_Sub_Family__c, Product2Id\nFROM Asset\nWHERE Parent.Component_Id__c IN (\n{{tickets}}\n)",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-17",
    label: "Deactivate Comment",
    category: "User",
    tags: ["user", "admin"],
    description: "Retrieve user deactivation comments for community user nicknames.",
    soql: "SELECT Deactivation_Comment__c\nFROM User\nWHERE CommunityNickname IN (\n{{tickets}}\n)",
    favourite: false,
    usageCount: 0,
  },
  {
    id: "sfdc-18",
    label: "Due Date Fix",
    category: "ServiceAppointment",
    tags: ["appointment", "dates"],
    description: "Check appointment due dates, scheduled times, and bundle statuses for open work orders.",
    soql: "SELECT Id, Status, IsBundleMember, IsManuallyBundled, RelatedBundleId, Work_Order__r.Status, DueDate, SchedEndTime, SchedStartTime\nFROM ServiceAppointment\nWHERE Ticket_Numbers__c IN (\n{{tickets}}\n) AND Work_Order__r.Status != 'Completed'",
    favourite: false,
    usageCount: 0,
  },
];

function getStoreFilePath(): string {
  const dir = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, "soql-library.json");
}

export function getLocalQueries(): StoredQuery[] {
  try {
    const filePath = getStoreFilePath();
    if (!fs.existsSync(filePath)) {
      const now = new Date().toISOString();
      const initial: StoredQuery[] = DEFAULT_SFDC_QUERIES.map((q) => ({
        ...q,
        createdAt: now,
        updatedAt: now,
      }));
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const now = new Date().toISOString();
    const initial: StoredQuery[] = DEFAULT_SFDC_QUERIES.map((q) => ({
      ...q,
      createdAt: now,
      updatedAt: now,
    }));
    fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  } catch (err) {
    console.warn("Failed reading local queries file, returning defaults:", err);
    const now = new Date().toISOString();
    return DEFAULT_SFDC_QUERIES.map((q) => ({
      ...q,
      createdAt: now,
      updatedAt: now,
    }));
  }
}

function saveLocalQueries(queries: StoredQuery[]): void {
  try {
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(queries, null, 2), "utf8");
  } catch (err) {
    console.error("Failed saving local queries:", err);
  }
}

export function createLocalQuery(data: {
  label: string;
  category: string;
  tags?: string[];
  description?: string;
  soql: string;
  favourite?: boolean;
}): StoredQuery {
  const list = getLocalQueries();
  const now = new Date().toISOString();
  const newQuery: StoredQuery = {
    id: `query_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: data.label,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags : [],
    description: data.description || "",
    soql: data.soql,
    favourite: Boolean(data.favourite),
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(newQuery);
  saveLocalQueries(list);
  return newQuery;
}

export function updateLocalQuery(
  id: string,
  data: Partial<StoredQuery>
): StoredQuery | null {
  const list = getLocalQueries();
  const idx = list.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  const current = list[idx];
  if (!current) return null;
  const updated: StoredQuery = {
    ...current,
    ...data,
    id: current.id,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;
  saveLocalQueries(list);
  return updated;
}

export function deleteLocalQuery(id: string): StoredQuery | null {
  const list = getLocalQueries();
  const idx = list.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  const deleted = list[idx];
  if (!deleted) return null;
  list.splice(idx, 1);
  saveLocalQueries(list);
  return deleted;
}

export function recordLocalQueryUsage(id: string): StoredQuery | null {
  const list = getLocalQueries();
  const item = list.find((q) => q.id === id);
  if (!item) return null;
  item.usageCount = (item.usageCount || 0) + 1;
  item.updatedAt = new Date().toISOString();
  saveLocalQueries(list);
  return item;
}

export function bulkCategorizeLocal(ids: string[], category: string): number {
  const list = getLocalQueries();
  const idSet = new Set(ids);
  let count = 0;
  for (const item of list) {
    if (idSet.has(item.id)) {
      item.category = category;
      item.updatedAt = new Date().toISOString();
      count++;
    }
  }
  if (count > 0) saveLocalQueries(list);
  return count;
}

export function bulkDeleteLocal(ids: string[]): number {
  const list = getLocalQueries();
  const idSet = new Set(ids);
  const remaining = list.filter((q) => !idSet.has(q.id));
  const count = list.length - remaining.length;
  if (count > 0) saveLocalQueries(remaining);
  return count;
}

/**
 * Universal query retrieval:
 * Checks PostgreSQL through Prisma. If PostgreSQL is offline/unreachable or table is empty,
 * seamlessly falls back to persistent local storage with all 18 default Salesforce queries.
 */
export async function getStoredQueries(): Promise<StoredQuery[]> {
  try {
    const records = await prisma.sOQLLibrary.findMany({
      orderBy: [{ favourite: "desc" }, { updatedAt: "desc" }, { label: "asc" }],
    });
    if (records && records.length > 0) {
      return records;
    }
    // Database is connected but empty -> seed default queries
    try {
      const now = new Date();
      await prisma.sOQLLibrary.createMany({
        data: DEFAULT_SFDC_QUERIES.map((q) => ({
          label: q.label,
          category: q.category,
          tags: q.tags,
          description: q.description,
          soql: q.soql,
          favourite: q.favourite,
          usageCount: q.usageCount,
          createdAt: now,
          updatedAt: now,
        })),
      });
      return await prisma.sOQLLibrary.findMany({
        orderBy: [{ favourite: "desc" }, { updatedAt: "desc" }, { label: "asc" }],
      });
    } catch {
      return getLocalQueries();
    }
  } catch {
    // Database connection refused or offline
    return getLocalQueries();
  }
}

export async function createStoredQuery(data: {
  label: string;
  category: string;
  tags?: string[];
  description?: string;
  soql: string;
  favourite?: boolean;
}): Promise<StoredQuery> {
  try {
    return await prisma.sOQLLibrary.create({
      data: {
        label: data.label,
        category: data.category,
        tags: data.tags || [],
        description: data.description || "",
        soql: data.soql,
        favourite: Boolean(data.favourite),
      },
    });
  } catch {
    return createLocalQuery(data);
  }
}

export async function updateStoredQuery(
  id: string,
  data: Partial<StoredQuery>
): Promise<StoredQuery | null> {
  try {
    const { id: _ignoredId, ...updateData } = data;
    return await prisma.sOQLLibrary.update({
      where: { id },
      data: updateData as any,
    });
  } catch {
    return updateLocalQuery(id, data);
  }
}

export async function deleteStoredQuery(id: string): Promise<StoredQuery | null> {
  try {
    return await prisma.sOQLLibrary.delete({
      where: { id },
    });
  } catch {
    return deleteLocalQuery(id);
  }
}

export async function recordStoredQueryUsage(id: string): Promise<StoredQuery | null> {
  try {
    return await prisma.sOQLLibrary.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
      },
    });
  } catch {
    return recordLocalQueryUsage(id);
  }
}

export async function bulkCategorizeStoredQueries(
  ids: string[],
  category: string
): Promise<number> {
  try {
    const res = await prisma.sOQLLibrary.updateMany({
      where: { id: { in: ids } },
      data: { category },
    });
    return res.count;
  } catch {
    return bulkCategorizeLocal(ids, category);
  }
}

export async function bulkDeleteStoredQueries(ids: string[]): Promise<number> {
  try {
    const res = await prisma.sOQLLibrary.deleteMany({
      where: { id: { in: ids } },
    });
    return res.count;
  } catch {
    return bulkDeleteLocal(ids);
  }
}
