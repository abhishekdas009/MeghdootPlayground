import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'(<div className="flex items-center justify-between gap-3 flex-wrap">)\s*(<div className="flex items-center gap-3 shrink-0">)\s*(<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">)\s*(<FileSpreadsheet className="h-5 w-5" />)\s*(</div>)\s*(<CardTitle className="text-base font-black tracking-tight whitespace-nowrap">Select what to perform</CardTitle>)\s*(</div>)\s*(<div className="flex items-center gap-2 shrink-0">)'

new_pattern = r'<div className="flex flex-col gap-4">\n                  \2\n                    \3\n                      \4\n                    \5\n                    <CardTitle className="text-base font-black tracking-tight whitespace-nowrap">Query Template</CardTitle>\n                  \7\n                  \8'

content, count = re.subn(pattern, new_pattern, content)
print(f"Updated: {count}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
