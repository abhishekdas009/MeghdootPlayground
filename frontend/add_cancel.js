const fs = require('fs');

const filePath = 'app/soql-generator/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const stateVars = `
  const [cancellationUploadState, setCancellationUploadState] = React.useState<"idle" | "reading" | "scanning" | "error">("idle");
  const [cancellationIsDragging, setCancellationIsDragging] = React.useState(false);
  const [cancellationUploadSummary, setCancellationUploadSummary] = React.useState<{ file: string; total: number; valid: number; skipped: number; } | null>(null);
`;

content = content.replace(
    'const [cancellationExecutionBatchIndex, setCancellationExecutionBatchIndex] = React.useState(0);',
    'const [cancellationExecutionBatchIndex, setCancellationExecutionBatchIndex] = React.useState(0);' + stateVars
);

const handler = `
  const cancellationDragCounterRef = React.useRef(0);

  const handleCancellationDragEnter = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    cancellationDragCounterRef.current += 1;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setCancellationIsDragging(true);
    }
  }, []);

  const handleCancellationDragLeave = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    cancellationDragCounterRef.current -= 1;
    if (cancellationDragCounterRef.current === 0) {
      setCancellationIsDragging(false);
    }
  }, []);

  const handleCancellationDragOver = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleCancellationFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    cancellationDragCounterRef.current = 0;
    setCancellationIsDragging(false);
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
      setCancellationUploadState("error");
      return;
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls") && !name.endsWith(".csv")) {
      toast.error("Unsupported file type. Please upload XLSX, XLS, or CSV.");
      setCancellationUploadState("error");
      return;
    }

    setCancellationUploadState("reading");
    
    try {
      const buffer = await file.arrayBuffer();
      let rows: any[][] = [];
      
      if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        const workbook = xlsx.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      } else {
        const textContent = await file.text();
        rows = textContent.split(/\\r\\n|\\n|\\r/).map(line => line.split(','));
      }

      if (!rows || rows.length === 0) {
        toast.error("File is empty.");
        setCancellationUploadState("error");
        return;
      }

      setCancellationUploadState("scanning");
      
      const headerRow = rows[0] || [];
      let tColIndex = -1;
      let rColIndex = -1;
      
      for (let i = 0; i < headerRow.length; i++) {
        const header = String(headerRow[i] || "").toLowerCase();
        if (header.includes("ticket") || header.includes("case")) tColIndex = i;
        if (header.includes("remark") || header.includes("comment")) rColIndex = i;
      }
      
      const colLetterToIndex = (letter: string) => {
        let idx = 0;
        for (let i = 0; i < letter.length; i++) {
          idx = idx * 26 + (letter.toUpperCase().charCodeAt(i) - 64);
        }
        return idx - 1;
      };
      
      // Fallbacks
      if (tColIndex === -1) tColIndex = colLetterToIndex("F");
      if (rColIndex === -1) rColIndex = colLetterToIndex("BF");
      
      const validTickets: string[] = [];
      let skipped = 0;
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;
        const ticket = String(row[tColIndex] || "").trim();
        const remarks = String(row[rColIndex] || "").trim();
        
        if (ticket) {
          if (remarks) {
            const t = ticket.toUpperCase();
            if (!validTickets.includes(t)) {
              validTickets.push(t);
            }
          } else {
            skipped++;
          }
        }
      }
      
      if (validTickets.length === 0) {
        toast.error("No tickets found with remarks.");
        setCancellationUploadState("error");
        return;
      }
      
      setTicketsInput(validTickets.join("\\n"));
      setCancellationExecutionInput(validTickets.map(t => t + "\\t\\t\\tCancellation Requested").join("\\n"));
      setCancellationUploadState("idle");
      setCancellationUploadSummary({
        file: file.name,
        total: rows.length - 1,
        valid: validTickets.length,
        skipped,
      });
      toast.success(\`Found \${validTickets.length} tickets with remarks. (\${skipped} skipped)\`);
    } catch (e) {
      toast.error("Failed to parse file.");
      setCancellationUploadState("error");
    }
  };
`;

content = content.replace(
    'const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {',
    handler + '\n  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {'
);


const uiCode = `
                {isCancellation && (
                  <div className="flex flex-col space-y-4">
                    <div 
                      onDragOver={handleCancellationDragOver}
                      onDragEnter={handleCancellationDragEnter}
                      onDragLeave={handleCancellationDragLeave}
                      onDrop={handleCancellationFileUpload}
                      className={cn(
                        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 min-h-[200px] text-center transition-all duration-200 overflow-hidden w-full mx-auto",
                        cancellationUploadState === "reading" || cancellationUploadState === "scanning"
                          ? "border-rose-400/50 bg-rose-50/50 dark:bg-rose-900/10" 
                          : cancellationIsDragging 
                            ? "border-rose-500 bg-rose-500/10 scale-[1.02] shadow-sm"
                            : "border-slate-300 dark:border-slate-700 hover:border-rose-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      )}
                    >
                      {cancellationIsDragging && <div className="absolute inset-0 z-50 pointer-events-none" />}
                      
                      {cancellationUploadState === "reading" || cancellationUploadState === "scanning" ? (
                        <div className="flex flex-col items-center z-10 pointer-events-none">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50 mb-3 animate-pulse">
                            <RotateCcw className="h-5 w-5 text-rose-600 dark:text-rose-400 animate-spin" />
                          </div>
                          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                            {cancellationUploadState === "reading" ? "Reading file..." : "Scanning for Tickets..."}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full mb-4 shadow-sm z-10 transition-colors pointer-events-none",
                            cancellationIsDragging 
                              ? "bg-rose-100 dark:bg-rose-900/50 ring-2 ring-rose-300 dark:ring-rose-700" 
                              : "bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700"
                          )}>
                            <Upload className={cn("h-6 w-6 transition-colors", cancellationIsDragging ? "text-rose-600 dark:text-rose-400" : "text-slate-500")} />
                          </div>
                          
                          <div className="space-y-1.5 z-10 pointer-events-none">
                            <p className="text-base font-bold text-foreground">
                              Drag & drop your file here
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Supports XLSX, XLS, and CSV files
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                              Fetches Column F (Ticket) and Column BF (Remarks) dynamically.
                            </p>
                          </div>
                        </>
                      )}

                      <input
                        type="file"
                        id="cancellation-file-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        accept=".csv,.txt,.xlsx,.xls,.tsv"
                        onChange={handleCancellationFileUpload}
                        disabled={cancellationUploadState === "reading" || cancellationUploadState === "scanning"}
                        title="Upload file"
                      />
                    </div>
                    
                    {cancellationUploadSummary && (
                      <div className="flex items-center justify-between rounded-xl bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-green-800 dark:text-green-300">{cancellationUploadSummary.file}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {cancellationUploadSummary.valid} tickets valid with remarks · {cancellationUploadSummary.skipped} skipped
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative flex items-center">
                      <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                      <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or paste manually</span>
                      <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                  </div>
                )}
`;

content = content.replace(
    '{isCaseAssign && (',
    uiCode + '{isCaseAssign && ('
);

const dynamicEmail = '{isCancellation && uniqueExecutableCancellationRows.length > 0 ? `Hello,\\nYour service ticket status has been updated to Accepted for the following ${uniqueExecutableCancellationRows.length} tickets:\\n${uniqueExecutableCancellationRows.map(r => r.ticket).join(\'\\n\')}\\nKindly check and revert.` : EMAIL_TEMPLATE}';

const dynamicPost = '{isCancellation && uniqueExecutableCancellationRows.length > 0 ? `@tag_user Your service ticket status has been updated to Accepted for the following ${uniqueExecutableCancellationRows.length} tickets:\\n${uniqueExecutableCancellationRows.map(r => r.ticket).join(\', \')}.\\nKindly check and revert.` : POST_TEMPLATE}';

content = content.replace(
    '{EMAIL_TEMPLATE}',
    dynamicEmail
);
content = content.replace(
    '{POST_TEMPLATE}',
    dynamicPost
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Success');
