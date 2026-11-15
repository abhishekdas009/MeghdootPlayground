import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace textarea background in Paste SOQL Result Batch
content = content.replace(
    'className="flex-1 min-h-[220px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-none p-4 resize-y"',
    'className="flex-1 min-h-[220px] font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y"'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Paste SOQL Result Batch textarea to transparent")
