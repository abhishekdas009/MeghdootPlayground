with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

import re

page = re.sub(
    r'className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 min-h-\[160px\] max-h-\[320px\] selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-100"',
    r'className={`overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed min-h-[160px] max-h-[320px] selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-100 ${cancellationTotalTickets === 0 ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-slate-200"}`}',
    page
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)

print("Fixed postTemplateText")
