import * as xlsx from "xlsx";
import { SALESFORCE_TICKET_REGEX, CASE_ID_REGEX } from "../../lib/parsers";



self.onmessage = async (event: MessageEvent) => {
  try {
    const { buffer, name, mode } = event.data;

    let rows: any[][] = [];
    let textContent = "";

    // Parse the file depending on the format
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const workbook = xlsx.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error("Excel file has no sheets.");
      }
      const sheet = workbook.Sheets[firstSheetName];
      if (!sheet) {
        throw new Error("Empty sheet.");
      }
      rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    } else {
      const decoder = new TextDecoder();
      textContent = decoder.decode(buffer);
      rows = textContent.split("\n").map(r => r.split(","));
    }

    // Process depending on the requested mode
    if (mode === "case-assignment") {
      const keywords = [
        "pms cancellation",
        "ticket cancellation",
        "dop change",
        "warranty update",
        "policy update",
        "sap mr",
        "otp",
        "feedback",
        "asset transfer",
        "transfer",
        "promotional",
        "product"
      ];
      const caseIds: string[] = [];

      if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        let headerRowIdx = -1;
        let caseIdIdx = -1;
        let subjectIdx = -1;
        let descIdx = -1;

        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const row = rows[i] as any[];
          if (!row) continue;
          
          let cId = -1, subId = -1, desId = -1;
          for (let j = 0; j < row.length; j++) {
            const val = String(row[j] || "").toLowerCase().trim();
            if (val === "case id" || val === "case number" || val === "caseid") cId = j;
            else if (val === "subject") subId = j;
            else if (val === "description") desId = j;
          }
          if (cId !== -1) {
            headerRowIdx = i;
            caseIdIdx = cId;
            subjectIdx = subId;
            descIdx = desId;
            break;
          }
        }

        if (headerRowIdx !== -1) {
          for (let i = headerRowIdx + 1; i < rows.length; i++) {
            const row = rows[i] as any[];
            if (!row) continue;
            
            const caseIdRaw = String(row[caseIdIdx] || "").trim();
            const match = caseIdRaw.match(/(500[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?)/);
            if (!match) continue;
            const caseId = match[1];

            const subject = subjectIdx !== -1 ? String(row[subjectIdx] || "").toLowerCase() : "";
            const description = descIdx !== -1 ? String(row[descIdx] || "").toLowerCase() : "";
            const combined = subject + " " + description;

            const matchedKeyword = keywords.find(k => combined.includes(k));
            if (matchedKeyword) {
              caseIds.push(caseId + "|" + matchedKeyword);
            } else {
              if (caseId) caseIds.push(caseId);
            }
          }
        } else {
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i] as any[];
            if (!row) continue;
            const rowText = row.map(cell => String(cell || "")).join(" ").toLowerCase();
            const matchedKeyword = keywords.find(k => rowText.includes(k));
            const matches = Array.from(rowText.matchAll(CASE_ID_REGEX));
            for (const m of matches) {
              if (matchedKeyword) {
                caseIds.push(m[1] + "|" + matchedKeyword);
              } else {
                caseIds.push(m[1]!);
              }
            }
          }
        }
      } else {
        const lines = textContent.split("\n");
        for (const line of lines) {
          const lowerLine = line.toLowerCase();
          const matchedKeyword = keywords.find(k => lowerLine.includes(k));
          const matches = Array.from(line.matchAll(CASE_ID_REGEX)).map((m) => m[1]);
          if (matchedKeyword) {
            caseIds.push(...matches.map(m => m + "|" + matchedKeyword));
          } else {
            caseIds.push(...matches.filter((m): m is string => !!m));
          }
        }
      }

      if (caseIds.length > 0) {
        self.postMessage({ success: true, result: Array.from(new Set(caseIds)) });
      } else {
        throw new Error("No valid Case IDs found in the file.");
      }
    } else if (mode === "tickets") {
      if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        // Always use column F (index 5) for ticket numbers
        let ticketColumnIndex = 5;

        const tickets: string[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] as any[];
          if (row && row[ticketColumnIndex]) {
            tickets.push(String(row[ticketColumnIndex]));
          }
        }
        textContent = tickets.join("\n");
      }

      const foundIds = Array.from(textContent.matchAll(SALESFORCE_TICKET_REGEX)).map((m) => m[1]);
      if (foundIds.length > 0) {
        self.postMessage({ success: true, result: Array.from(new Set(foundIds)) });
      } else {
        throw new Error("No valid ticket numbers found in the file.");
      }
    } else if (mode === "cancellation") {
      const colLetterToIndex = (letter: string) => {
        let idx = 0;
        for (let i = 0; i < letter.length; i++) {
          idx = idx * 26 + (letter.toUpperCase().charCodeAt(i) - 64);
        }
        return idx - 1;
      };

      const tColIndex = colLetterToIndex("F");
      const rColIndex = colLetterToIndex("BF");

      const validTickets: string[] = [];
      const skippedTickets: string[] = [];
      let skipped = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;
        const ticket = String(row[tColIndex] || "").trim();
        const remark = String(row[rColIndex] || "").trim();

        if (ticket) {
          if (!remark) {
            skippedTickets.push(ticket);
            skipped++;
            continue;
          }
          validTickets.push(ticket);
        }
      }

      if (validTickets.length === 0) {
        throw new Error("No valid tickets found with remarks.");
      }

      self.postMessage({ success: true, result: { validTickets, skipped, skippedTickets } });
    }
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message || "Failed to process file." });
  }
};
