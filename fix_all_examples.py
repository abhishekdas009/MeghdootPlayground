import re

# 1. Fix json-viewer.tsx
with open("frontend/components/ui/json-viewer.tsx", "r", encoding="utf-8") as f:
    jv_text = f.read()

jv_text = jv_text.replace("text-slate-800 dark:text-sky-200", "text-inherit")
with open("frontend/components/ui/json-viewer.tsx", "w", encoding="utf-8") as f:
    f.write(jv_text)

# 2. Fix page.tsx
with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

# Add isExample to QueryPreviewCard props
page = page.replace(
    "  onCopy: (value: string) => void;\n}) {",
    "  onCopy: (value: string) => void;\n  isExample?: boolean;\n}) {"
)

# Pass isExample to JsonViewer
page = page.replace(
    """            <JsonViewer 
              data={currentBatch} 
              className="p-5 min-h-[180px] max-h-[320px] bg-transparent dark:bg-transparent border-0 shadow-none rounded-none" 
            />""",
    """            <JsonViewer 
              data={currentBatch} 
              className={cn("p-5 min-h-[180px] max-h-[320px] bg-transparent dark:bg-transparent border-0 shadow-none rounded-none", isExample ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-sky-200")} 
            />"""
)

# Update QueryPreviewCard invocations to pass isExample={parsedTickets.length === 0}
# There are 3 invocations. We can just inject it.
page = re.sub(
    r'(<QueryPreviewCard[^>]+batches=\{([a-zA-Z0-9_]+Preview)\})',
    r'\1 isExample={parsedTickets.length === 0}',
    page
)

# Fix cancellationQueryBatches preview
page = re.sub(
    r'className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-rose-200 min-h-0 max-h-\[320px\] selection:bg-rose-500/20 selection:text-rose-900 dark:selection:text-rose-100"',
    r'className={`overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed min-h-0 max-h-[320px] selection:bg-rose-500/20 selection:text-rose-900 dark:selection:text-rose-100 ${parsedTickets.length === 0 ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-rose-200"}`}',
    page
)

# Fix assetTransferComponentSOQL preview
page = re.sub(
    r'className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-sky-200 max-h-\[320px\] min-h-0 selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100"',
    r'className={`overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed max-h-[320px] min-h-0 selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 ${!assetTransferComponentSOQL ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-sky-200"}`}',
    page
)

# Fix assetTransferAccountSOQL preview
page = re.sub(
    r'className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-sky-200 max-h-\[320px\] min-h-0 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100"',
    r'className={`overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed max-h-[320px] min-h-0 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 ${!assetTransferAccountSOQL ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-sky-200"}`}',
    page
)

# Fix cancellationCanceledOutput preview
page = re.sub(
    r'className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-sky-200 min-h-\[180px\] max-h-\[320px\] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100"',
    r'className={`overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed min-h-[180px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 ${uniqueExecutableCancellationRows.length === 0 ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-sky-200"}`}',
    page
)


with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)

print("Done massive replace")
