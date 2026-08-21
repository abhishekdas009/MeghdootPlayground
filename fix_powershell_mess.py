import io
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. childDetailsCurrentSOQLBatch
text = re.sub(
    r'className=\{h-\[155px\] overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-\[11px\] leading-relaxed selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 \}',
    r'className={`h-[155px] overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[11px] leading-relaxed selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 ${!childDetailsCurrentSOQLBatch ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-sky-200"}`}',
    text
)

# 2. transferOutput
text = re.sub(
    r'className=\{overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed max-h-\[320px\] min-h-0 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 \}',
    r'className={`overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed max-h-[320px] min-h-0 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 ${!transferOutput ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-emerald-200"}`}',
    text
)

# 3. mailTemplateText & postTemplateText (they share the same broken class name)
text = re.sub(
    r'className=\{overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed min-h-\[160px\] max-h-\[320px\] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 \}',
    r'className={`overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed min-h-[160px] max-h-[320px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 ${cancellationTotalTickets === 0 ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-slate-200"}`}',
    text
)

# 4. caseAssignOutput
text = re.sub(
    r'className=\{absolute inset-0 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 \}',
    r'className={`absolute inset-0 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 ${!caseAssignOutput ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-emerald-200"}`}',
    text
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Done fixing!')
