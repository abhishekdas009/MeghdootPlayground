import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's just use regex to remove the inner div that contains the pill, up to the </span> that ends it.
pattern = r'<div className="flex items-center gap-4">\s*<div className="flex items-center gap-2 shrink-0 rounded-full border border-slate-500/20 bg-slate-500/10 p-1 pr-3">\s*<div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-\[11px\] font-black text-white shadow-sm">\s*\d\s*</div>\s*<span className="text-\[10px\] font-black tracking-widest text-slate-600 dark:text-slate-400 uppercase">STEP \d</span>\s*</div>'

content = re.sub(pattern, '<div className="flex items-center gap-4">', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed step pills using regex")
