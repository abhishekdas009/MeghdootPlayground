import * as xlsx from "xlsx";
import {
  CcoAlgoResult,
  NamoAlgo2Result,
  NonNamoAlgo3Result,
  ParsedFailedResult,
  classifyTicketPrefix,
  isStatusCanceled,
  getAutoPMSApproval,
} from "./cancellation-algo";

export interface ExcludedTicketRow {
  ticket: string;
  category: string;
  reason: string;
  accountGroup: string;
  accountName: string;
  status: string;
  parentWorkOrder: string;
  ticketType: string;
  approver?: string;
  sfId?: string;
}

export interface BuildExcludedWorkbookOptions {
  cancellationType: "CCO" | "NAMO" | "NON NAMO" | "Account Check" | string;
  ccoResult?: CcoAlgoResult;
  namoResult?: NamoAlgo2Result;
  nonNamoResult?: NonNamoAlgo3Result;
  parsedFailed?: ParsedFailedResult;
  externalDeptMap?: Map<string, string>;
}

export interface ExcludedWorkbookResult {
  workbook: xlsx.WorkBook;
  filename: string;
  totalExcludedCount: number;
  categoryCounts: Record<string, number>;
  sheetNames: string[];
}

/**
 * Builds a multi-sheet Excel workbook for all excluded WorkOrders.
 * Includes separate tabs for MR RAISED, Approval Pending, NON Namo tickets Found (for NAMO),
 * Auto PMS (for CCO), Child WorkOrders, Already Canceled, etc.
 */
export function buildExcludedInsightsWorkbook(
  options: BuildExcludedWorkbookOptions
): ExcludedWorkbookResult {
  const {
    cancellationType,
    ccoResult,
    namoResult,
    nonNamoResult,
    parsedFailed,
    externalDeptMap,
  } = options;

  const isNamo = cancellationType === "NAMO";
  const isNonNamo = cancellationType === "NON NAMO";
  const isCco = cancellationType === "CCO";

  const allExcludedRows: ExcludedTicketRow[] = [];
  const seenTickets = new Set<string>();

  // Helper to add row ensuring no duplicates
  const addRow = (row: ExcludedTicketRow) => {
    if (!row.ticket || seenTickets.has(row.ticket)) return;
    seenTickets.add(row.ticket);
    allExcludedRows.push(row);
  };

  // 1. Collect records from CCO result
  if (isCco && ccoResult) {
    // MR Raised
    ccoResult.mrCreatedTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "MR Raised",
        reason: "Material Request (MR) Created / Is_MR_Created is true",
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Approval Pending
    ccoResult.approvalPendingTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Approval Pending",
        reason: "Approval is pending in Salesforce / Record locked",
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        approver: "Department Approval Pending",
        sfId: t.id,
      });
    });

    // Auto PMS
    ccoResult.autoPmsTickets?.forEach((t) => {
      const dept = externalDeptMap?.get(t.ticket);
      const approverList = getAutoPMSApproval(dept);
      addRow({
        ticket: t.ticket,
        category: "Auto PMS (Excluded)",
        reason: "Auto PMS ticket excluded from CCO — requires department approval",
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: "Auto PMS",
        approver: approverList.join(" / "),
        sfId: t.id,
      });
    });

    // Child WorkOrders
    ccoResult.parentWorkOrderTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Child WorkOrders",
        reason: `Child WorkOrder present (Parent: ${t.parentTicket || t.parentWorkOrderId || "Linked"})`,
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Already Canceled
    const canceledList =
      ccoResult.canceledTickets ||
      ccoResult.completedOrCanceledTickets?.filter((t) => isStatusCanceled(t.status)) ||
      [];
    canceledList.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Already Canceled",
        reason: "Already Canceled in Salesforce",
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "Canceled",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Completed
    const completedList =
      ccoResult.completedTickets ||
      ccoResult.completedOrCanceledTickets?.filter((t) => !isStatusCanceled(t.status)) ||
      [];
    completedList.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Completed",
        reason: `Already ${t.status || "Completed"} in Salesforce`,
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "Completed",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Catch-all from allSkippedTickets
    ccoResult.allSkippedTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: t.skipReason || "Excluded",
        reason: t.skipReason || "Excluded from CCO Cancellation",
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });
  }

  // 2. Collect records from NAMO result
  if (isNamo && namoResult) {
    // MR Raised
    namoResult.mrCreatedTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "MR Raised",
        reason: "Material Request (MR) Created / Is_MR_Created is true",
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Approval Pending
    namoResult.approvalPendingTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Approval Pending",
        reason: "Approval is pending in Salesforce / Record locked",
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        approver: "Department Approval Pending",
        sfId: t.id,
      });
    });

    // NON-NAMO group tickets found (User asked: "for NAMO page sheet name NON Namo tickets Found")
    namoResult.nonNamoTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "NON Namo tickets Found",
        reason: "Account Group is NON-NAMO — requires RM Approval before cancellation",
        accountGroup: t.accountGroupName || "NON NAMO",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        approver: "RM Approval Required",
        sfId: t.id,
      });
    });

    // Child WorkOrders
    namoResult.parentWorkOrderTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Child WorkOrders",
        reason: `Child WorkOrder present (Parent: ${t.parentTicket || t.parentWorkOrderId || "Linked"})`,
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Already Canceled
    const canceledList =
      namoResult.canceledTickets ||
      namoResult.completedOrCanceledTickets?.filter((t) => isStatusCanceled(t.status)) ||
      [];
    canceledList.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Already Canceled",
        reason: "Already Canceled in Salesforce",
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "Canceled",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Completed
    const completedList =
      namoResult.completedTickets ||
      namoResult.completedOrCanceledTickets?.filter((t) => !isStatusCanceled(t.status)) ||
      [];
    completedList.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Completed",
        reason: `Already ${t.status || "Completed"} in Salesforce`,
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "Completed",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Unverified
    namoResult.unclassifiedTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Unverified Group",
        reason: "Blank or Unknown Account Group — do not process until verified",
        accountGroup: t.accountGroupName || "Blank / Unknown",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Non-PMS tickets
    namoResult.nonAutoPmsTickets?.forEach((tkt) => {
      addRow({
        ticket: tkt,
        category: "Non-PMS Excluded",
        reason: "Does not start with 'A' (Excluded from NAMO PMS Cancellation)",
        accountGroup: "—",
        accountName: "—",
        status: "—",
        parentWorkOrder: "—",
        ticketType: classifyTicketPrefix(tkt).type,
      });
    });

    // Catch-all
    namoResult.allSkippedTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: t.skipReason || "Excluded",
        reason: t.skipReason || "Excluded from NAMO Cancellation",
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });
  }

  // 3. Collect records from NON-NAMO result
  if (isNonNamo && nonNamoResult) {
    // MR Raised
    nonNamoResult.mrCreatedTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "MR Raised",
        reason: "Material Request (MR) Created / Is_MR_Created is true",
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Approval Pending
    nonNamoResult.approvalPendingTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Approval Pending",
        reason: "Approval is pending in Salesforce / Record locked",
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        approver: "Department Approval Pending",
        sfId: t.id,
      });
    });

    // NAMO group tickets found in NON-NAMO
    nonNamoResult.namoTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "NAMO tickets Found",
        reason: "Account Group is NAMO — cannot be processed under NON-NAMO cancellation",
        accountGroup: t.accountGroupName || "NAMO",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Child WorkOrders
    nonNamoResult.parentWorkOrderTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Child WorkOrders",
        reason: `Child WorkOrder present (Parent: ${t.parentTicket || t.parentWorkOrderId || "Linked"})`,
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Already Canceled
    const canceledList =
      nonNamoResult.canceledTickets ||
      nonNamoResult.completedOrCanceledTickets?.filter((t) => isStatusCanceled(t.status)) ||
      [];
    canceledList.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Already Canceled",
        reason: "Already Canceled in Salesforce",
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "Canceled",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Completed
    const completedList =
      nonNamoResult.completedTickets ||
      nonNamoResult.completedOrCanceledTickets?.filter((t) => !isStatusCanceled(t.status)) ||
      [];
    completedList.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Completed",
        reason: `Already ${t.status || "Completed"} in Salesforce`,
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "Completed",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Unverified
    nonNamoResult.unclassifiedTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: "Unverified Group",
        reason: "Blank or Unknown Account Group — do not process until verified",
        accountGroup: t.accountGroupName || "Blank / Unknown",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });

    // Non-PMS
    nonNamoResult.nonAutoPmsTickets?.forEach((tkt) => {
      addRow({
        ticket: tkt,
        category: "Non-PMS Excluded",
        reason: "Does not start with 'A' (Excluded from NON-NAMO PMS Cancellation)",
        accountGroup: "—",
        accountName: "—",
        status: "—",
        parentWorkOrder: "—",
        ticketType: classifyTicketPrefix(tkt).type,
      });
    });

    // Catch-all
    nonNamoResult.allSkippedTickets?.forEach((t) => {
      addRow({
        ticket: t.ticket,
        category: t.skipReason || "Excluded",
        reason: t.skipReason || "Excluded from NON-NAMO Cancellation",
        accountGroup: t.accountGroupName || "—",
        accountName: t.accountName || "—",
        status: t.status || "—",
        parentWorkOrder: t.parentTicket || t.parentWorkOrderId || "—",
        ticketType: classifyTicketPrefix(t.ticket).type,
        sfId: t.id,
      });
    });
  }

  // 4. Incorporate Step 5 parsed failures if present
  if (parsedFailed) {
    parsedFailed.lockedTickets?.forEach((tkt) => {
      if (!seenTickets.has(tkt)) {
        addRow({
          ticket: tkt,
          category: "Approval Pending",
          reason: "ENTITY_IS_LOCKED / Approval pending during Step 5 execution",
          accountGroup: "—",
          accountName: "—",
          status: "Locked",
          parentWorkOrder: "—",
          ticketType: classifyTicketPrefix(tkt).type,
          approver: "Department Approval Pending",
        });
      }
    });

    parsedFailed.otherFailedTickets?.forEach((tkt) => {
      if (!seenTickets.has(tkt)) {
        addRow({
          ticket: tkt,
          category: "Step 5 Failed Tickets",
          reason: "Failed during Step 5 execution in Salesforce",
          accountGroup: "—",
          accountName: "—",
          status: "Failed",
          parentWorkOrder: "—",
          ticketType: classifyTicketPrefix(tkt).type,
        });
      }
    });
  }

  // Calculate category counts
  const categoryCounts: Record<string, number> = {};
  allExcludedRows.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });

  const wb = xlsx.utils.book_new();
  const sheetNames: string[] = [];

  // ===========================================================================
  // SHEET 1: Master "All Excluded"
  // ===========================================================================
  const masterHeaders = [
    "Ticket Number",
    "Category",
    "Reason",
    "Account Group",
    "Account Name",
    "Salesforce Status",
    "Parent WorkOrder",
    "Ticket Type",
    "Required Approver",
  ];

  const masterRows = allExcludedRows.map((r) => [
    r.ticket,
    r.category,
    r.reason,
    r.accountGroup,
    r.accountName,
    r.status,
    r.parentWorkOrder,
    r.ticketType,
    r.approver || "—",
  ]);

  const wsMaster = xlsx.utils.aoa_to_sheet([masterHeaders, ...masterRows]);
  wsMaster["!cols"] = [
    { wch: 18 }, // Ticket Number
    { wch: 24 }, // Category
    { wch: 42 }, // Reason
    { wch: 18 }, // Account Group
    { wch: 28 }, // Account Name
    { wch: 18 }, // Status
    { wch: 22 }, // Parent WorkOrder
    { wch: 14 }, // Ticket Type
    { wch: 26 }, // Required Approver
  ];

  xlsx.utils.book_append_sheet(wb, wsMaster, "All Excluded");
  sheetNames.push("All Excluded");

  // ===========================================================================
  // SHEET 2: "MR RAISED" (if any)
  // ===========================================================================
  const mrRows = allExcludedRows.filter((r) => r.category === "MR Raised");
  if (mrRows.length > 0) {
    const mrHeaders = [
      "Ticket Number",
      "Reason",
      "Salesforce Status",
      "Account Group",
      "Account Name",
      "Parent WorkOrder",
    ];
    const mrData = mrRows.map((r) => [
      r.ticket,
      r.reason,
      r.status,
      r.accountGroup,
      r.accountName,
      r.parentWorkOrder,
    ]);
    const wsMr = xlsx.utils.aoa_to_sheet([mrHeaders, ...mrData]);
    wsMr["!cols"] = [
      { wch: 18 },
      { wch: 42 },
      { wch: 18 },
      { wch: 18 },
      { wch: 28 },
      { wch: 22 },
    ];
    xlsx.utils.book_append_sheet(wb, wsMr, "MR RAISED");
    sheetNames.push("MR RAISED");
  }

  // ===========================================================================
  // SHEET 3: "Approval Pending" (if any)
  // ===========================================================================
  const approvalRows = allExcludedRows.filter(
    (r) => r.category === "Approval Pending"
  );
  if (approvalRows.length > 0) {
    const appHeaders = [
      "Ticket Number",
      "Required Approver / Dept",
      "Salesforce Status",
      "Account Group",
      "Account Name",
      "Parent WorkOrder",
      "Reason",
    ];
    const appData = approvalRows.map((r) => [
      r.ticket,
      r.approver || "Department Approval Pending",
      r.status,
      r.accountGroup,
      r.accountName,
      r.parentWorkOrder,
      r.reason,
    ]);
    const wsApp = xlsx.utils.aoa_to_sheet([appHeaders, ...appData]);
    wsApp["!cols"] = [
      { wch: 18 },
      { wch: 26 },
      { wch: 18 },
      { wch: 18 },
      { wch: 28 },
      { wch: 22 },
      { wch: 40 },
    ];
    xlsx.utils.book_append_sheet(wb, wsApp, "Approval Pending");
    sheetNames.push("Approval Pending");
  }

  // ===========================================================================
  // SHEET 4: Account Group Segregation Tab (Mode Specific)
  // - For NAMO: "NON Namo tickets Found" (per user prompt)
  // - For NON-NAMO: "NAMO tickets Found"
  // - For CCO: "Auto PMS (Excluded)"
  // ===========================================================================
  if (isNamo) {
    const nonNamoFoundRows = allExcludedRows.filter(
      (r) => r.category === "NON Namo tickets Found" || r.accountGroup === "NON NAMO"
    );
    if (nonNamoFoundRows.length > 0) {
      const nnHeaders = [
        "Ticket Number",
        "Account Group",
        "Account Name",
        "Salesforce Status",
        "Reason",
      ];
      const nnData = nonNamoFoundRows.map((r) => [
        r.ticket,
        r.accountGroup,
        r.accountName,
        r.status,
        r.reason,
      ]);
      const wsNn = xlsx.utils.aoa_to_sheet([nnHeaders, ...nnData]);
      wsNn["!cols"] = [
        { wch: 18 },
        { wch: 18 },
        { wch: 28 },
        { wch: 18 },
        { wch: 42 },
      ];
      xlsx.utils.book_append_sheet(wb, wsNn, "NON Namo tickets Found");
      sheetNames.push("NON Namo tickets Found");
    }
  } else if (isNonNamo) {
    const namoFoundRows = allExcludedRows.filter(
      (r) => r.category === "NAMO tickets Found" || r.accountGroup === "NAMO"
    );
    if (namoFoundRows.length > 0) {
      const nfHeaders = [
        "Ticket Number",
        "Account Group",
        "Account Name",
        "Salesforce Status",
        "Reason",
      ];
      const nfData = namoFoundRows.map((r) => [
        r.ticket,
        r.accountGroup,
        r.accountName,
        r.status,
        r.reason,
      ]);
      const wsNf = xlsx.utils.aoa_to_sheet([nfHeaders, ...nfData]);
      wsNf["!cols"] = [
        { wch: 18 },
        { wch: 18 },
        { wch: 28 },
        { wch: 18 },
        { wch: 42 },
      ];
      xlsx.utils.book_append_sheet(wb, wsNf, "NAMO tickets Found");
      sheetNames.push("NAMO tickets Found");
    }
  } else if (isCco) {
    const autoPmsRows = allExcludedRows.filter(
      (r) => r.category === "Auto PMS (Excluded)" || r.ticketType === "Auto PMS"
    );
    if (autoPmsRows.length > 0) {
      const pmsHeaders = [
        "Ticket Number",
        "Required Approver",
        "Salesforce Status",
        "Account Group",
        "Account Name",
        "Reason",
      ];
      const pmsData = autoPmsRows.map((r) => [
        r.ticket,
        r.approver || "Suraj Sir / Vishal Sir",
        r.status,
        r.accountGroup,
        r.accountName,
        r.reason,
      ]);
      const wsPms = xlsx.utils.aoa_to_sheet([pmsHeaders, ...pmsData]);
      wsPms["!cols"] = [
        { wch: 18 },
        { wch: 26 },
        { wch: 18 },
        { wch: 18 },
        { wch: 28 },
        { wch: 42 },
      ];
      xlsx.utils.book_append_sheet(wb, wsPms, "Auto PMS (Excluded)");
      sheetNames.push("Auto PMS (Excluded)");
    }
  }

  // ===========================================================================
  // SHEET 5: "Child WorkOrders" (if any)
  // ===========================================================================
  const childRows = allExcludedRows.filter(
    (r) => r.category === "Child WorkOrders"
  );
  if (childRows.length > 0) {
    const chHeaders = [
      "Ticket Number",
      "Parent WorkOrder / Ticket",
      "Salesforce Status",
      "Account Group",
      "Account Name",
      "Reason",
    ];
    const chData = childRows.map((r) => [
      r.ticket,
      r.parentWorkOrder,
      r.status,
      r.accountGroup,
      r.accountName,
      r.reason,
    ]);
    const wsCh = xlsx.utils.aoa_to_sheet([chHeaders, ...chData]);
    wsCh["!cols"] = [
      { wch: 18 },
      { wch: 24 },
      { wch: 18 },
      { wch: 18 },
      { wch: 28 },
      { wch: 40 },
    ];
    xlsx.utils.book_append_sheet(wb, wsCh, "Child WorkOrders");
    sheetNames.push("Child WorkOrders");
  }

  // ===========================================================================
  // SHEET 6: "Already Canceled" (if any)
  // ===========================================================================
  const canceledRows = allExcludedRows.filter(
    (r) => r.category === "Already Canceled"
  );
  if (canceledRows.length > 0) {
    const canHeaders = [
      "Ticket Number",
      "Salesforce Status",
      "Account Group",
      "Account Name",
      "Reason",
    ];
    const canData = canceledRows.map((r) => [
      r.ticket,
      r.status,
      r.accountGroup,
      r.accountName,
      r.reason,
    ]);
    const wsCan = xlsx.utils.aoa_to_sheet([canHeaders, ...canData]);
    wsCan["!cols"] = [
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 28 },
      { wch: 35 },
    ];
    xlsx.utils.book_append_sheet(wb, wsCan, "Already Canceled");
    sheetNames.push("Already Canceled");
  }

  // ===========================================================================
  // SHEET 7: "Completed" (if any)
  // ===========================================================================
  const completedRows = allExcludedRows.filter(
    (r) => r.category === "Completed"
  );
  if (completedRows.length > 0) {
    const compHeaders = [
      "Ticket Number",
      "Salesforce Status",
      "Account Group",
      "Account Name",
      "Reason",
    ];
    const compData = completedRows.map((r) => [
      r.ticket,
      r.status,
      r.accountGroup,
      r.accountName,
      r.reason,
    ]);
    const wsComp = xlsx.utils.aoa_to_sheet([compHeaders, ...compData]);
    wsComp["!cols"] = [
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 28 },
      { wch: 35 },
    ];
    xlsx.utils.book_append_sheet(wb, wsComp, "Completed");
    sheetNames.push("Completed");
  }

  const prefix = cancellationType.replace(/\s+/g, "_");
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${prefix}_Excluded_Insights_${dateStr}.xlsx`;

  return {
    workbook: wb,
    filename,
    totalExcludedCount: allExcludedRows.length,
    categoryCounts,
    sheetNames,
  };
}

/**
 * Triggers instant browser download of the multi-sheet Excluded Insights Excel workbook.
 */
export function downloadExcludedInsightsExcel(
  options: BuildExcludedWorkbookOptions
): ExcludedWorkbookResult | null {
  const result = buildExcludedInsightsWorkbook(options);
  if (result.totalExcludedCount === 0) {
    return null;
  }
  xlsx.writeFile(result.workbook, result.filename);
  return result;
}
