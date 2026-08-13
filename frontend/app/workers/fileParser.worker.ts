import * as xlsx from "xlsx";
import { SALESFORCE_TICKET_REGEX } from "../../lib/parsers";



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
    if (mode === "case-assignment" || mode === "tickets") {
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
