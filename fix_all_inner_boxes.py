import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Child details inner box
content = content.replace(
    'className="overflow-hidden rounded-xl border border-slate-200/60 bg-slate-50/60 shadow-inner dark:border-slate-700/60 dark:bg-slate-900/50"',
    'className="overflow-hidden rounded-xl border-transparent bg-transparent shadow-none"'
)

# Child details inner box header
content = content.replace(
    'className="flex items-center justify-between gap-2 border-b border-slate-200/60 px-3 py-2 dark:border-slate-700/60"',
    'className="flex items-center justify-between gap-2 border-b-transparent bg-transparent px-3 py-2"'
)

# Cancellation inner box header
content = content.replace(
    'className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2.5"',
    'className="flex items-center justify-between border-b-transparent bg-transparent px-4 py-2.5"'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated all inner boxes to transparent")
