const fs = require('fs');

let pageContent = fs.readFileSync('app/soql-generator/page.tsx', 'utf-8');

// 1. Remove `(isCaseAssign || isCancellation) &&` so it always shows the drag and drop area
pageContent = pageContent.replace(
  '{(isCaseAssign || isCancellation) && (',
  '{true && ('
);

// 2. Hide Textarea only for Cancellation (Wait, earlier we had `!isCaseAssign && (`)
// The text area should probably be visible for standard tickets, but maybe not for case assign or cancellation.
// For now, let's keep the text area visibility as it was: `{!(isCaseAssign || isCancellation) && (`
// If it was already `!(isCaseAssign || isCancellation) &&`, we leave it.

// 3. Rewrite `handleFileUpload` to use the Web Worker
const oldHandleFileUpload = `  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
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
            textContent += xlsx.utils.sheet_to_csv(sheet) + "\\n";
          }
        });
      } else {
        textContent = await file.text();
      }

      setUploadState("scanning");
      // Use existing parseCaseIds logic
      const extractedIds = parseCaseIds(textContent);
      const scannedLines = textContent.split(/\\r\\n|\\n|\\r/).length;
      
      if (extractedIds.length === 0) {
        debouncedToast("No valid Salesforce Case IDs were detected. Other text/data was ignored.", "error");
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
          debouncedToast("Unable to validate Case records. Please try again.", "error");
          setUploadState("error");
          return;
        }
      }
      
      if (validCases.length === 0) {
        debouncedToast("No matching Salesforce Case records were found.", "error");
        setUploadState("error");
        setMissingCases(missingCaseIds);
        return;
      }
      
      setTicketsInput(validCases.join("\\n"));
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
      
    } catch (error) {
      console.error(error);
      debouncedToast("Failed to parse the file. Ensure it's correctly formatted.", "error");
      setUploadState("error");
    }
  };`;


const newHandleFileUpload = `  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
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

    setUploadState("scanning");
    
    try {
      const buffer = await file.arrayBuffer();
      
      // Instantiate the Web Worker for file parsing
      const worker = new Worker(new URL("../../workers/fileParser.worker.ts", import.meta.url));
      const mode = isCancellation ? "cancellation" : (isCaseAssign ? "case-assignment" : "tickets");
      
      worker.onmessage = async (e) => {
        const { success, result, error } = e.data;
        if (!success) {
           debouncedToast(error || "Failed to process file", "error");
           setUploadState("error");
           worker.terminate();
           return;
        }

        if (mode === "cancellation") {
           const { validTickets, skipped } = result;
           setTicketsInput(validTickets.join("\\n"));
           setUploadSummary({
             file: file!.name,
             scannedLines: validTickets.length + skipped,
             total: validTickets.length,
             unique: validTickets.length,
             valid: validTickets.length,
             missing: skipped
           });
           setUploadState("success");
           setAutoRunPending(true);
           worker.terminate();
           return;
        }
        
        // For case-assignment and standard tickets
        const extractedIds = result;
        const scannedLines = extractedIds.length;
        
        if (extractedIds.length === 0) {
          debouncedToast("No valid tickets were detected. Other text/data was ignored.", "error");
          setUploadState("error");
          worker.terminate();
          return;
        }
        
        if (isCaseAssign) {
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
              debouncedToast("Unable to validate Case records. Please try again.", "error");
              setUploadState("error");
              worker.terminate();
              return;
            }
          }
          
          if (validCases.length === 0) {
            debouncedToast("No matching Salesforce Case records were found.", "error");
            setUploadState("error");
            setMissingCases(missingCaseIds);
            worker.terminate();
            return;
          }
          
          setTicketsInput(validCases.join("\\n"));
          setMissingCases(missingCaseIds);
          setUploadSummary({
            file: file!.name,
            scannedLines, 
            total: extractedIds.length,
            unique: validCases.length + missingCaseIds.length,
            valid: validCases.length,
            missing: missingCaseIds.length,
          });
        } else {
          // Standard tickets
          setTicketsInput(extractedIds.join("\\n"));
          setUploadSummary({
            file: file!.name,
            scannedLines,
            total: extractedIds.length,
            unique: extractedIds.length,
            valid: extractedIds.length,
            missing: 0,
          });
        }
        
        setUploadState("success");
        setAutoRunPending(true);
        worker.terminate();
      };
      
      worker.onerror = (err) => {
        debouncedToast("Worker error occurred during file parsing.", "error");
        setUploadState("error");
        worker.terminate();
      };

      // Send the buffer to the worker
      worker.postMessage({ buffer, name: file.name, mode }, [buffer]);
      
    } catch (error) {
      console.error(error);
      debouncedToast("Failed to initiate file parsing.", "error");
      setUploadState("error");
    }
  };`;

// Wait, I need to check if there are other differences, like string literals... Let's just do an index-based replacement.
const startIdx = pageContent.indexOf('const handleFileUpload = async');
const endIdx = pageContent.indexOf('};', pageContent.indexOf('setUploadState("error");', startIdx)) + 2;

if (startIdx !== -1 && endIdx !== -1) {
  const toReplace = pageContent.substring(startIdx, endIdx + 1); // +1 to capture newline if needed
  // I will replace it using JS replace since it might not be a perfect match with oldHandleFileUpload
  
  // Actually, I'll use index based replacement
  pageContent = pageContent.slice(0, startIdx) + newHandleFileUpload + pageContent.slice(endIdx);
  
  // Ensure we didn't wipe anything extra. Wait, 'setUploadState("error");\n    }\n  };' is what ends it.
  fs.writeFileSync('app/soql-generator/page.tsx', pageContent);
  console.log('Successfully updated handleFileUpload and Drag & Drop!');
} else {
  console.log('Could not find handleFileUpload');
}

// I should also make sure `import * as xlsx from "xlsx";` can be removed if not used anywhere else, but it's okay for now.
