import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove blue dot for Component SOQL Query
content = re.sub(r'<div className="flex items-center gap-3">\s*<span className="h-2\.5 w-2\.5 rounded-full bg-blue-500 shadow-\[0_0_8px_rgba\(59,130,246,0\.5\)\]" />\s*<CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Component SOQL Query</CardTitle>\s*</div>', r'<div className="flex items-center gap-3">\n                        <CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Component SOQL Query</CardTitle>\n                      </div>', content)

# Remove emerald dot for Account SOQL Query
content = re.sub(r'<div className="flex items-center gap-3">\s*<span className="h-2\.5 w-2\.5 rounded-full bg-emerald-500\s*shadow-\[0_0_8px_rgba\(16,185,129,0\.5\)\]" />\s*<CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Account SOQL Query</CardTitle>\s*</div>', r'<div className="flex items-center gap-3">\n                        <CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Account SOQL Query</CardTitle>\n                      </div>', content)

# Remove FileSpreadsheet icon for Transfer Output
content = re.sub(r'<div className="flex items-center gap-3">\s*<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10\s*text-emerald-600 dark:text-emerald-400 shadow-inner">\s*<FileSpreadsheet className="h-5 w-5" />\s*</div>\s*<CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Transfer Output \(Excel Ready\)</CardTitle>\s*</div>', r'<div className="flex items-center gap-3">\n                        <CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Transfer Output (Excel Ready)</CardTitle>\n                      </div>', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed icons from Asset Transfer flow")
