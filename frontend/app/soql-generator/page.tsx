"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { dashboardStore } from "@/lib/dashboard-store";
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
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  soql: string;
  favourite: boolean;
  type?: "normal" | "asset-transfer";
}

interface AssetTransferPair {
  componentId: string;
  newCid: string;
}

const defaultTemplates: Template[] = [
  {
    id: "1",
    name: "TS (Ticket Status)",
    category: "WorkOrder",
    soql: `SELECT Id, Status, ParentWorkOrderId
FROM WorkOrder
WHERE Ticket_Number_Read_Only__c IN (
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
    id: "13",
    name: "Cancellation Tickets",
    category: "WorkOrder",
    soql: `SELECT id,Ticket_Number_Read_Only__c,Status
FROM WorkOrder
WHERE status != 'Completed' AND Ticket_Number_Read_Only__c IN (
{{tickets}}
)`,
    favourite: false,
  },
  {
    id: "14",
    name: "Case Cancellation",
    category: "WorkOrder",
    soql: `SELECT id, Status, CaseId, case.status, case.Cancellation_Reason__c, Cancellation_Reason__c
FROM WorkOrder
WHERE status != 'Completed' AND Ticket_Number_Read_Only__c IN (
{{tickets}}
)`,
    favourite: false,
  },
  {
    id: "2",
    name: "SA (Service Appointment)",
    category: "ServiceAppointment",
    soql: `SELECT Id, Status
FROM ServiceAppointment
WHERE Ticket_Numbers__c IN (
{{tickets}}
)`,
    favourite: false,
  },
  {
    id: "4",
    name: "OP (Case Details)",
    category: "Case",
    soql: `SELECT Id,
       Status,
       Sub_Status__c,
       Sub_Type_Complextiy__c,
       Sub_Type__c
FROM Case
WHERE Id IN (
{{tickets}}
)`,
    favourite: false,
  },
  {
    id: "5",
    name: "TC (Technician Check)",
    category: "ServiceAppointment",
    soql: `SELECT Id,
       Work_Order__c,
       FSSK__FSK_Assigned_Service_Resource__c,
       FSSK__FSK_Assigned_Service_Resource__r.Name
FROM ServiceAppointment
WHERE Ticket_Numbers__c IN (
{{tickets}}
)`,
    favourite: false,
  },
  {
    id: "6",
    name: "TSC (Ticket Status Count)",
    category: "WorkOrder",
    soql: `SELECT Status,
       COUNT(Id)
FROM WorkOrder
WHERE Ticket_Number_Read_Only__c IN (
{{tickets}}
)
GROUP BY Status
ORDER BY COUNT(Id) DESC`,
    favourite: false,
  },
  {
    id: "7",
    name: "PO (Payout / Product Information)",
    category: "WorkOrder",
    soql: `SELECT Id,
       ParentWorkOrderId,
       Status,
       Payout__c,
       Asset.Product_Sub_Family__r.Code__c
FROM WorkOrder
WHERE Ticket_Number_Read_Only__c IN (
{{tickets}}
)`,
    favourite: false,
  },
  {
    id: "8",
    name: "TS (Open Tickets Only)",
    category: "WorkOrder",
    soql: `SELECT Id, Status
FROM WorkOrder
WHERE Ticket_Number_Read_Only__c IN (
{{tickets}}
)
AND Status NOT IN ('Completed','Canceled','Bundled')`,
    favourite: false,
  },
  {
    id: "9",
    name: "Account ID Fetch",
    category: "Account",
    soql: `SELECT Customer_ID__c,Id
FROM Account
WHERE Customer_ID__c IN (
{{tickets}}
)`,
    favourite: false,
  },
  {
    id: "10",
    name: "Technician Assessment Link",
    category: "Contact",
    soql: `SELECT Name, Assessment_Link__c
FROM Contact
WHERE Technician_Number__c IN (
{{tickets}}
)`,
    favourite: false,
  },
  {
    id: "11",
    name: "Asset by Department",
    category: "Asset",
    soql: `SELECT Id, Component_Id__c, Account.Name, RecordType.Name, Account.Id, Account.Group__c, Account.Customer_ID__c, Account.SAP_Customer_Id__c
FROM Asset
WHERE Service_Department_L__c = 'a3cNy0000001IStIAM' AND Account_Group__c = 'NON NAMO'`,
    favourite: false,
  },
  {
    id: "12",
    name: "Asset ID Fetch",
    category: "Asset",
    soql: `SELECT Component_Id__c, Id, Account.Customer_ID__c, Record_Type__c, parent.id, Parent.Account.id
FROM Asset
WHERE Component_Id__c IN (
{{tickets}}
)`,
    favourite: false,
  },
  {
    id: "15",
    name: "Child Details to Parent",
    category: "Asset",
    soql: `SELECT Parent.Id, Model_Number__c, Product_Family__c, Product_Sub_Family__c, Product2Id
FROM Asset
WHERE Parent.Component_Id__c IN (
{{tickets}}
)`,
    favourite: false,
  },
  {
    id: "16",
    name: "Deactivate Comment",
    category: "User",
    soql: `SELECT Deactivation_Comment__c
FROM User
WHERE CommunityNickname IN (
{{tickets}}
)`,
    favourite: false,
  },
  {
    id: "17",
    name: "Due Date Fix",
    category: "ServiceAppointment",
    soql: `SELECT Id, Status, IsBundleMember, IsManuallyBundled, RelatedBundleId, Work_Order__r.Status, DueDate, SchedEndTime, SchedStartTime
FROM ServiceAppointment
WHERE Ticket_Numbers__c IN (
{{tickets}}
) AND Work_Order__r.status != 'Completed'`,
    favourite: false,
  },
  {
    id: "18",
    name: "Service Appointment",
    category: "ServiceAppointment",
    soql: `SELECT Id, Status
FROM ServiceAppointment
WHERE Ticket_Numbers__c IN (
{{tickets}}
)`,
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

const EMAIL_TEMPLATE = `Hello,
You service ticket status has been updated to Accepted. Kindly check and revert.
Regards`;

const POST_TEMPLATE = `@tag_user You service ticket status has been updated to Accepted. Kindly check and revert.`;

const TICKET_REGEX = /[BISXCAD]\d{14,}/g;

interface TicketStats {
  total: number;
  breakdown: Record<string, number>;
  unknown: number;
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
  const lines = input.split(/[\r\n]+/).filter((l) => l.trim());
  const failed: string[] = [];
  const hasFailedLines = lines.some((l) => l.toLowerCase().includes("failed"));
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes("Ticket_Number_Read_Only__c") || trimmed.includes("__Status") || trimmed.includes("_Id") || trimmed.includes("_Errors")) continue;
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

function StatPill({ code, count }: { code: string; count: number }) {
  const info = CATEGORY_MAP[code];
  if (!info) return null;
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 shadow-sm">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${info.color}`} />
      <span className="text-xs font-medium text-foreground">{info.label}: {count}</span>
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
    <Card className="overflow-hidden border-border/70 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{batches.length} batch{batches.length === 1 ? "" : "es"}</Badge>
            <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => onCopy(batches.join("\n\n"))}>
              <Copy className="h-4 w-4" /> Copy All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col">
        {batches.length > 0 && (
          <div className="rounded-lg border border-border/70 bg-muted/20 flex flex-col min-h-0 flex-1">
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Batch {batchIndex + 1} / {batches.length}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={batchIndex <= 0} onClick={() => setBatchIndex((i) => Math.max(0, i - 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={batchIndex >= batches.length - 1} onClick={() => setBatchIndex((i) => Math.min(batches.length - 1, i + 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => onCopy(currentBatch)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <pre className="overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-xs leading-6 text-foreground min-h-0 max-h-[320px]">{currentBatch}</pre>
          </div>
        )}
        {batches.length === 0 && (
          <div className="flex-1 flex items-center justify-center rounded-lg border border-border/70 bg-muted/20 p-6">
            <p className="text-sm text-muted-foreground text-center">Paste tickets to generate query preview</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function parseAssetTransferPairs(input: string): AssetTransferPair[] {
  if (!input.trim()) return [];
  const lines = input.split(/[\r\n]+/).filter((l) => l.trim());
  const pairs: AssetTransferPair[] = [];

  // Only requirement: New CID must start with "CID" (case-insensitive). Component ID can be any format.
  const CID_REGEX = /CID-?\d+/i;

  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    // Skip header rows like "COMPONENT  NEW CID" or "COMPONENT  CID"
    if (lower.includes("component") && (lower.includes("new cid") || lower.includes("cid"))) continue;

    const parts = trimmed.split(/[\s,\t]+/).filter(Boolean);

    if (parts.length >= 2) {
      const componentId = parts[0]!.trim();
      const newCid = parts[1]!.trim();
      if (componentId && newCid && /^CID/i.test(newCid)) {
        pairs.push({ componentId, newCid });
      }
    } else {
      // Fallback: single blob line with no clean delimiter between component and CID
      const cidMatch = trimmed.match(CID_REGEX);
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
        i++;
      }
    } else if ((char === "," || char === "\t") && !inQuotes) {
      values.push(current);
      current = "";
      i++;
    } else {
      current += char;
      i++;
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
  const lines = input.split(/[\r\n]+/).filter((l) => l.trim());
  const rows: Array<Record<string, string>> = [];
  let headers: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const values = parseCSVLine(trimmed);

    if (values.length === 0) continue;

    const firstVal = cleanValue(values[0]!);

    if (firstVal === "_" || firstVal === "" || firstVal.toLowerCase() === "component" || firstVal.toLowerCase() === "id") {
      headers = values.map(cleanHeader);
      continue;
    }

    if (headers.length === 0) continue;

    const row: Record<string, string> = {};
    for (let i = 0; i < values.length; i++) {
      const rawValue = values[i];
      if (rawValue === undefined) continue;
      const cleanVal = cleanValue(rawValue);
      const header = headers[i];
      if (header) {
        row[header] = cleanVal;
      }
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
    if (componentId) {
      result[componentId] = row;
    }
  }
  return result;
}

function parseAccountResult(input: string): Record<string, string> {
  const rows = parseSOQLResult(input);
  const result: Record<string, string> = {};

  for (const row of rows) {
    const cid = row.customer_id__c || row.customerid__c || row.customer_id;
    const id = row.id;
    if (cid && id) {
      result[cid] = id;
    }
  }
  return result;
}

export default function SOQLGeneratorPage() {
  const [templates] = React.useState<Template[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>("1");
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

  const savedTicketsRef = React.useRef("");

  const activeTemplate = templates.find((t) => t.id === selectedTemplate);
  const isTS = selectedTemplate === "1";
  const isSA = selectedTemplate === "2";
  const isAssetTransfer = selectedTemplate === "3";
  const isCancellation = selectedTemplate === "13" || selectedTemplate === "14";

  const parseTickets = (input: string): string[] => {
    if (!input.trim()) return [];
    const cleaned = input.replace(/'/g, "").replace(/,/g, " ").replace(/[\t\r\n]+/g, " ");
    return cleaned.split(/\s+/).map((t) => t.trim()).filter((t) => t.length > 0);
  };

  const formatTicketsForSOQL = (tickets: string[]): string => {
    if (tickets.length === 0) return "";
    return tickets.map((t) => `    '${t}'`).join(",\n");
  };

  const parsedTickets = React.useMemo(() => parseTickets(ticketsInput), [ticketsInput]);
  const batchSize = 450;
  const batchCount = parsedTickets.length > 0 ? Math.ceil(parsedTickets.length / batchSize) : 0;
  const ticketStats = React.useMemo(() => getTicketStats(parsedTickets), [parsedTickets]);
  const failedTickets = React.useMemo(() => parseFailedTickets(excelInput), [excelInput]);

  const assetPairs = React.useMemo(() => parseAssetTransferPairs(assetTransferInput), [assetTransferInput]);

  const cancellationBody = React.useMemo(() => {
    const total = parsedTickets.length;
    if (total === 0) return "";
    let msg = "Cancellation has been done successfully for this slot.";
    if (failedTickets.length > 0) {
      msg += "\n\nExcept ST:\n" + failedTickets.join("\n");
    }
    msg += `\n\nTotal Tickets Count : ${total}`;
    return msg;
  }, [parsedTickets, failedTickets]);

  const cancellationEmail = React.useMemo(() => {
    if (!cancellationBody) return "";
    return `Hello,\n${cancellationBody}\n\nRegards`;
  }, [cancellationBody]);

  const cancellationPost = React.useMemo(() => {
    if (!cancellationBody) return "";
    return `@_tag_user ${cancellationBody}`;
  }, [cancellationBody]);

  const buildPreviewBatches = React.useCallback(
    (templateId: string) => {
      const template = templates.find((item) => item.id === templateId);
      if (!template) return [];
      if (parsedTickets.length === 0) {
        return [`${template.soql.replace("{{tickets}}", "")}`];
      }
      const batches: string[] = [];
      for (let index = 0; index < parsedTickets.length; index += batchSize) {
        const chunk = parsedTickets.slice(index, index + batchSize);
        const formatted = formatTicketsForSOQL(chunk);
        const query = template.soql.replace("{{tickets}}", formatted);
        batches.push(query);
      }
      return batches;
    },
    [batchCount, parsedTickets, templates]
  );

  const workOrderPreview = React.useMemo(() => buildPreviewBatches("1"), [buildPreviewBatches]);
  const serviceAppointmentPreview = React.useMemo(() => buildPreviewBatches("2"), [buildPreviewBatches]);
  const otherPreview = React.useMemo(() => buildPreviewBatches(selectedTemplate), [buildPreviewBatches, selectedTemplate]);

  const assetTransferComponentSOQL = React.useMemo(() => {
    if (assetPairs.length === 0) return "";
    const componentIds = assetPairs.map((p) => p.componentId);
    const formatted = formatTicketsForSOQL(componentIds);
    return `SELECT Component_Id__c, Id, Account.Customer_ID__c, Record_Type__c, Parent.Id, Parent.Account.Id
FROM Asset
WHERE Component_Id__c IN (
${formatted}
)`;
  }, [assetPairs]);

  const assetTransferAccountSOQL = React.useMemo(() => {
    if (assetPairs.length === 0) return "";
    const cids = [...new Set(assetPairs.map((p) => p.newCid))];
    const formatted = formatTicketsForSOQL(cids);
    return `SELECT Customer_ID__c, Id
FROM Account
WHERE Customer_ID__c IN (
${formatted}
)`;
  }, [assetPairs]);

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

    const output = rows.join("\n");
    const debug = debugLines.join("\n");

    setTransferOutput(output);
    setTransferDebug(debug);

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
    const blob = new Blob([transferOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asset-transfer-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transfer CSV downloaded");
  };

  React.useEffect(() => {
    setTsBatchIndex(0);
    setSaBatchIndex(0);
    setOtherBatchIndex(0);
  }, [ticketsInput]);

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
    setSelectedTemplate(value);
    if (value === "1" && savedTicketsRef.current.trim()) {
      setTicketsInput(savedTicketsRef.current);
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
  };

  const toggleFav = (id: string) => {
    const template = templates.find((t) => t.id === id);
    const isAdding = !favourites.has(id);
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (isAdding && template) {
      dashboardStore.recordFavourite(template.name);
    } else {
      dashboardStore.removeFavourite();
    }
  };

  const triggerGenerate = () => {
    if (parsedTickets.length === 0) {
      toast.error("Paste at least one ticket number");
      return;
    }
    if (!generatedAtLeastOnce) {
      setGeneratedAtLeastOnce(true);
      dashboardStore.recordSOQL(activeTemplate?.name ?? "Unknown", parsedTickets.length);
    }
    toast.success(`Generated SOQL for ${parsedTickets.length} tickets`);
  };

  const showStats = parsedTickets.length > 0;
  const statEntries = Object.entries(ticketStats.breakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">SOQL Generator</h1>
        <p className="text-sm text-muted-foreground">Paste tickets, pick a template, generate production-ready SOQL</p>
      </div>

      {showStats && !isAssetTransfer && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-border">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <Badge variant="secondary" className="text-xs">{ticketStats.total}</Badge>
            </div>
            {statEntries.map(([code, count]) => (
              <StatPill key={code} code={code} count={count} />
            ))}
            {ticketStats.unknown > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 shadow-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-400" />
                <span className="text-xs font-medium text-foreground">Other: {ticketStats.unknown}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN */}
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Template</CardTitle>
                <Badge variant="outline" className="text-[10px]">{templates.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 p-3 pt-0">
              <div className="relative">
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full appearance-none rounded-md border border-border bg-card px-3 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">{activeTemplate?.category}</span>
                <button type="button" onClick={() => toggleFav(selectedTemplate)} className="shrink-0" aria-label={`Toggle favourite for ${activeTemplate?.name ?? ""}`}>
                  <Star className={`h-4 w-4 ${favourites.has(selectedTemplate) ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          {showStats && !isAssetTransfer && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3 pt-0">
                {statEntries.map(([code, count]) => {
                  const info = CATEGORY_MAP[code];
                  const pct = Math.round((count / ticketStats.total) * 100);
                  return (
                    <div key={code} className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${info?.color ?? "bg-gray-400"}`} />
                      <span className="text-xs text-muted-foreground w-28">{info?.label ?? code}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${info?.color ?? "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-foreground w-10 text-right">{count}</span>
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
                {ticketStats.unknown > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
                    <span className="text-xs text-muted-foreground w-28">Other</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-gray-400" style={{ width: `${Math.round((ticketStats.unknown / ticketStats.total) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-foreground w-10 text-right">{ticketStats.unknown}</span>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round((ticketStats.unknown / ticketStats.total) * 100)}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Normal ticket input card */}
          {!isAssetTransfer && (
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{activeTemplate?.name ?? "Select a template"}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{activeTemplate?.category}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Ticket Numbers</label>
                  <Textarea
                    placeholder={`Paste ticket numbers here...
A26060134750678
A26060134750476
A26060134750619`}
                    className="flex-1 min-h-[320px] font-mono text-sm"
                    value={ticketsInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTicketsInput(val);
                      setGeneratedAtLeastOnce(false);
                      if (selectedTemplate !== "1" && val.trim()) {
                        savedTicketsRef.current = "";
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Supports spaces, commas, tabs, or newlines. Values are automatically chunked into 500-value batches for Salesforce-safe SOQL.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{parsedTickets.length === 0 ? "No tickets" : `${parsedTickets.length} ticket${parsedTickets.length === 1 ? "" : "s"}`}</Badge>
                  <Badge variant="outline" className="text-[10px]">{batchCount === 0 ? "0 batches" : `${batchCount} batch${batchCount === 1 ? "" : "es"}`}</Badge>
                  <Badge variant="outline" className="text-[10px]">Max 450 values / block</Badge>
                  <div className="flex-1" />
                  <Button variant="outline" className="gap-1" onClick={handleClear}>
                    <Trash2 className="h-4 w-4" /> Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Asset Transfer Input Card */}
          {isAssetTransfer && (
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Asset Transfer</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Component ID → New CID</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Component & New CID</label>
                  <Textarea
                    placeholder={`COMPONENT        NEW CID
BSL34933847      CID-2025004
BSL29709797      CID-4206214
BSL22295338      CID-6074821`}
                    className="flex-1 min-h-[200px] font-mono text-sm"
                    value={assetTransferInput}
                    onChange={(e) => setAssetTransferInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Paste component ID and new CID pairs. Tab or space separated. One pair per line.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{assetPairs.length} pair{assetPairs.length === 1 ? "" : "s"}</Badge>
                  <div className="flex-1" />
                  <Button variant="outline" className="gap-1" onClick={handleClear}>
                    <Trash2 className="h-4 w-4" /> Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* RIGHT COLUMN */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.25 }} className="lg:col-span-9 grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* TS selected */}
          {isTS && (
            <>
              <QueryPreviewCard title="TS (Ticket Status)" subtitle="WorkOrder query preview" batches={workOrderPreview} batchIndex={tsBatchIndex} setBatchIndex={setTsBatchIndex} onCopy={handleCopy} />
              <QueryPreviewCard title="SA (Service Appointment)" subtitle="ServiceAppointment query preview" batches={serviceAppointmentPreview} batchIndex={saBatchIndex} setBatchIndex={setSaBatchIndex} onCopy={handleCopy} />
              <Card className="overflow-hidden border-border/70 shadow-sm h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><CardTitle className="text-base">Email</CardTitle></div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => handleCopy(EMAIL_TEMPLATE)}><Copy className="h-4 w-4" /> Copy</Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                  <pre className="overflow-auto whitespace-pre-wrap break-words p-3 rounded-lg border border-border/70 bg-muted/20 font-mono text-xs leading-6 text-foreground max-h-[220px] min-h-0">{EMAIL_TEMPLATE}</pre>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-border/70 shadow-sm h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /><CardTitle className="text-base">Post</CardTitle></div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => handleCopy(POST_TEMPLATE)}><Copy className="h-4 w-4" /> Copy</Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                  <pre className="overflow-auto whitespace-pre-wrap break-words p-3 rounded-lg border border-border/70 bg-muted/20 font-mono text-xs leading-6 text-foreground max-h-[220px] min-h-0">{POST_TEMPLATE}</pre>
                </CardContent>
              </Card>
            </>
          )}

          {/* SA selected */}
          {isSA && (
            <QueryPreviewCard title="SA (Service Appointment)" subtitle="ServiceAppointment query preview" batches={serviceAppointmentPreview} batchIndex={saBatchIndex} setBatchIndex={setSaBatchIndex} onCopy={handleCopy} />
          )}

          {/* Asset Transfer selected */}
          {isAssetTransfer && (
            <>
              <Card className="overflow-hidden border-border/70 shadow-sm h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2"><ArrowRightLeft className="h-4 w-4 text-primary" /><CardTitle className="text-base">Component SOQL</CardTitle></div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => handleCopy(assetTransferComponentSOQL)} disabled={!assetTransferComponentSOQL}><Copy className="h-4 w-4" /> Copy</Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                  <pre className="overflow-auto whitespace-pre-wrap break-words p-3 rounded-lg border border-border/70 bg-muted/20 font-mono text-xs leading-6 text-foreground max-h-[320px] min-h-0">{assetTransferComponentSOQL || "Paste component pairs to generate Component SOQL"}</pre>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-border/70 shadow-sm h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2"><ArrowRightLeft className="h-4 w-4 text-primary" /><CardTitle className="text-base">Account SOQL</CardTitle></div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => handleCopy(assetTransferAccountSOQL)} disabled={!assetTransferAccountSOQL}><Copy className="h-4 w-4" /> Copy</Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                  <pre className="overflow-auto whitespace-pre-wrap break-words p-3 rounded-lg border border-border/70 bg-muted/20 font-mono text-xs leading-6 text-foreground max-h-[320px] min-h-0">{assetTransferAccountSOQL || "Paste component pairs to generate Account SOQL"}</pre>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-border/70 shadow-sm h-full flex flex-col xl:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">SOQL Results Processing</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Paste results from both SOQL queries to generate transfer file</p>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col min-h-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-foreground mb-1.5">Asset SOQL Result</label>
                      <Textarea
                        placeholder={`Paste Asset SOQL result here...
"_"\t"Component_Id__c"\t"Id"\t"Account"\t"Account.Customer_ID__c"\t"Record_Type__c"\t"Parent"\t"Parent.Id"\t"Parent.Account"\t"Parent.Account.Id"
"[Asset]"\t"BSL22295338"\t"02iNy00000h4ZkwIAE"\t"[Account]"\t"CID-6959279"\t"Component"\t"[Asset]"\t"02iNy00000h4RaYIAU"\t"[Account]"\t"001Ny00001bDRvuIAG"`}
                        className="flex-1 min-h-[160px] font-mono text-xs"
                        value={assetSOQLResult}
                        onChange={(e) => setAssetSOQLResult(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-foreground mb-1.5">Account SOQL Result</label>
                      <Textarea
                        placeholder={`Paste Account SOQL result here...
"_"\t"Customer_ID__c"\t"Id"
"[Account]"\t"CID-6074821"\t"001Ny000016UZXTIA4"
"[Account]"\t"CID-7414665"\t"001Ny00001g1bBKIAY"`}
                        className="flex-1 min-h-[160px] font-mono text-xs"
                        value={accountSOQLResult}
                        onChange={(e) => setAccountSOQLResult(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button className="gap-1" onClick={handleProcessTransfer} disabled={!assetSOQLResult || !accountSOQLResult}>
                      <ArrowRightLeft className="h-4 w-4" /> Process Transfer
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={handleDownloadTransfer} disabled={!transferOutput}>
                      <Download className="h-4 w-4" /> Download CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {transferOutput && (
                <Card className="overflow-hidden border-border/70 shadow-sm h-full flex flex-col xl:col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">Transfer Output (Excel Ready)</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => handleCopy(transferOutput)}><Copy className="h-4 w-4" /> Copy</Button>
                        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={handleDownloadTransfer}><Download className="h-4 w-4" /> Download</Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">If Record Type = Component, Parent.Id is used as transfer target</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col min-h-0">
                    <pre className="overflow-auto whitespace-pre-wrap break-words p-3 rounded-lg border border-border/70 bg-muted/20 font-mono text-xs leading-6 text-foreground max-h-[320px] min-h-0">{transferOutput}</pre>
                  </CardContent>
                </Card>
              )}

              {transferDebug && (
                <Card className="overflow-hidden border-border/70 shadow-sm h-full flex flex-col xl:col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /><CardTitle className="text-base">Transfer Debug Log</CardTitle></div>
                      <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => handleCopy(transferDebug)}><Copy className="h-4 w-4" /> Copy</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Shows which pairs matched or were skipped</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col min-h-0">
                    <pre className="overflow-auto whitespace-pre-wrap break-words p-3 rounded-lg border border-border/70 bg-muted/20 font-mono text-xs leading-6 text-foreground max-h-[240px] min-h-0">{transferDebug}</pre>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Cancellation selected */}
          {isCancellation && (
            <>
              <QueryPreviewCard title={activeTemplate?.name ?? "Query Preview"} subtitle={`${activeTemplate?.category ?? ""} query preview`} batches={otherPreview} batchIndex={otherBatchIndex} setBatchIndex={setOtherBatchIndex} onCopy={handleCopy} />
              <Card className="overflow-hidden border-border/70 shadow-sm h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Paste Excel / Data Loader Output</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Failed tickets will be extracted automatically</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                  <Textarea
                    placeholder={`Paste Excel / Data Loader output here...
"Id","Ticket_Number_Read_Only__c","Status"
"0WONy000008eHgfOAE","B25031925463529","Cancellation Requested"`}
                    className="flex-1 min-h-[180px] font-mono text-xs"
                    value={excelInput}
                    onChange={(e) => setExcelInput(e.target.value)}
                  />
                  {failedTickets.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-[10px]">{failedTickets.length} failed ticket{failedTickets.length === 1 ? "" : "s"} extracted</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-border/70 shadow-sm h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><CardTitle className="text-base">Email</CardTitle></div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => handleCopy(cancellationEmail)}><Copy className="h-4 w-4" /> Copy</Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                  <pre className="overflow-auto whitespace-pre-wrap break-words p-3 rounded-lg border border-border/70 bg-muted/20 font-mono text-xs leading-6 text-foreground max-h-[220px] min-h-0">{cancellationEmail || "Paste tickets to generate cancellation email"}</pre>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-border/70 shadow-sm h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /><CardTitle className="text-base">Post</CardTitle></div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => handleCopy(cancellationPost)}><Copy className="h-4 w-4" /> Copy</Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                  <pre className="overflow-auto whitespace-pre-wrap break-words p-3 rounded-lg border border-border/70 bg-muted/20 font-mono text-xs leading-6 text-foreground max-h-[220px] min-h-0">{cancellationPost || "Paste tickets to generate cancellation post"}</pre>
                </CardContent>
              </Card>
            </>
          )}

          {/* Other templates */}
          {!isTS && !isSA && !isAssetTransfer && !isCancellation && (
            <QueryPreviewCard title={activeTemplate?.name ?? "Query Preview"} subtitle={`${activeTemplate?.category ?? ""} query preview`} batches={otherPreview} batchIndex={otherBatchIndex} setBatchIndex={setOtherBatchIndex} onCopy={handleCopy} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
