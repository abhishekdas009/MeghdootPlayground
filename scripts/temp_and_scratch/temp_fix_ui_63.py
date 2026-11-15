import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<div className="flex items-center gap-4 relative z-10">\s*<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">\s*<ArrowRightLeft className="h-5 w-5" />\s*</div>\s*<div>\s*<CardTitle className="text-base font-black tracking-tight">Asset Transfer Data</CardTitle>\s*<p className="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mt-1">.*?</p>\s*</div>\s*</div>'

replacement = r'''<div className="flex items-center gap-3 relative z-10">
                    <CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Asset Transfer Data</CardTitle>
                  </div>'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Asset Transfer Data card header")
