const fs = require('fs');

let workerContent = fs.readFileSync('app/workers/fileParser.worker.ts', 'utf-8');

workerContent = workerContent.replace(
  'if (mode === "case-assignment") {',
  'if (mode === "case-assignment" || mode === "tickets") {'
);

const oldCancellationLogic = `    } else if (mode === "cancellation") {
      const headerRow = rows[0] || [];
      let tColIndex = -1;
      let rColIndex = -1;

      for (let i = 0; i < headerRow.length; i++) {
        const header = String(headerRow[i] || "").trim().toLowerCase();
        if (header === "ticket number" || header === "ticket_number_read_only__c") {
          tColIndex = i;
        } else if (tColIndex === -1 && (header.includes("ticket") || header.includes("case"))) {
          tColIndex = i;
        }

        if (header === "remark" || header === "remarks" || header === "remarks / comments") {
          rColIndex = i;
        } else if (rColIndex === -1 && (header.includes("remark") || header.includes("comment"))) {
          rColIndex = i;
        }
      }`;

const newCancellationLogic = `    } else if (mode === "cancellation") {
      let tColIndex = -1;
      let rColIndex = -1;
      let headerRowIndex = 0;

      // Search the first 20 rows to find the headers dynamically
      for (let r = 0; r < Math.min(20, rows.length); r++) {
        const row = rows[r] || [];
        let tempTCol = -1;
        let tempRCol = -1;
        
        for (let i = 0; i < row.length; i++) {
          const header = String(row[i] || "").trim().toLowerCase();
          if (header === "ticket number" || header === "ticket_number_read_only__c" || header.includes("ticket") || header.includes("case")) {
            if (tempTCol === -1) tempTCol = i;
          }
          if (header === "remark" || header === "remarks" || header === "remarks / comments" || header.includes("remark") || header.includes("comment")) {
            if (tempRCol === -1) tempRCol = i;
          }
        }
        
        // If we found both columns or at least the ticket column, we assume this is the header row
        if (tempTCol !== -1 && tempRCol !== -1) {
          tColIndex = tempTCol;
          rColIndex = tempRCol;
          headerRowIndex = r;
          break;
        } else if (tempTCol !== -1 && tColIndex === -1) {
          // Fallback if only ticket column is found initially
          tColIndex = tempTCol;
          headerRowIndex = r;
        }
      }`;

workerContent = workerContent.replace(oldCancellationLogic, newCancellationLogic);

workerContent = workerContent.replace(
  'for (let i = 1; i < rows.length; i++) {',
  'for (let i = headerRowIndex + 1; i < rows.length; i++) {'
);

fs.writeFileSync('app/workers/fileParser.worker.ts', workerContent);
console.log('Worker updated.');

// Now fix page.tsx to always render drag-and-drop
let pageContent = fs.readFileSync('app/soql-generator/page.tsx', 'utf-8');

pageContent = pageContent.replace(
  '{(isCaseAssign || isCancellation) && (',
  '{true && ('
);

pageContent = pageContent.replace(
  '{!(isCaseAssign || isCancellation) && (',
  '{!isCancellation && (' // Only hide it for cancellation now, or show it for all? Wait, Textarea is hidden for CaseAssign before... wait. 
);

fs.writeFileSync('scratch/apply_fixes.js_pageContent', pageContent);

// Wait, I will use a separate Node script to modify page.tsx more carefully
