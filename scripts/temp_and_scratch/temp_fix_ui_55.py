import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<div className="flex items-center gap-3 shrink-0">\s*<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10\s*text-blue-600 dark:text-blue-400 shadow-inner">\s*<FileSpreadsheet className="h-5 w-5" />\s*</div>\s*<CardTitle className="text-base font-black tracking-tight whitespace-nowrap">Query Template</CardTitle>\s*</div>'

replacement = r'''<div className="flex items-center gap-3 shrink-0">
                      <CardTitle className="mt-2 md:mt-3 text-lg md:text-xl font-black tracking-tight leading-tight whitespace-nowrap">Query Template</CardTitle>
                    </div>'''

content = re.sub(pattern, replacement, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed FileSpreadsheet icon and updated title size")
