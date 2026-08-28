import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace border-transparent bg-slate-100/40 dark:bg-black/20
content = content.replace('border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-blue-500/40 focus-visible:border-blue-500', 'border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent')
content = content.replace('border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-fuchsia-500/40 focus-visible:border-fuchsia-500', 'border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent')
content = content.replace('border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-amber-500/40 focus-visible:border-amber-500', 'border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent')

# Replace the child details ones
content = content.replace('border border-transparent bg-slate-100/40 p-3 font-mono text-xs leading-relaxed shadow-none focus-visible:border-blue-500 focus-visible:ring-blue-500/40 dark:bg-black/20', 'border-transparent bg-transparent p-3 font-mono text-xs leading-relaxed shadow-none focus-visible:border-transparent focus-visible:ring-0')
content = content.replace('border border-transparent bg-slate-100/40 p-3 font-mono text-[11px] leading-relaxed shadow-none focus-visible:border-indigo-500 focus-visible:ring-indigo-500/40 dark:bg-black/20', 'border-transparent bg-transparent p-3 font-mono text-[11px] leading-relaxed shadow-none focus-visible:border-transparent focus-visible:ring-0')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated all text areas to be transparent")
