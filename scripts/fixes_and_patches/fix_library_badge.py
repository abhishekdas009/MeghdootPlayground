import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<Badge className=\{cn\("text-\[10px\] font-black px-3 py-1 rounded-full whitespace-nowrap shadow-sm uppercase tracking-widest border", libraryLoadState === "error" \? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"\)\}>'
replacement = '<span className={cn("text-[10px] font-black uppercase tracking-widest", libraryLoadState === "error" ? "text-rose-500" : "text-slate-500 dark:text-slate-400")}>'

content = re.sub(pattern, replacement, content, flags=re.DOTALL)
content = content.replace('</Badge>', '</span>')
content = content.replace('<Badge', '<span')

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
