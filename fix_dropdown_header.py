import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the dropdown header
pattern = r'<div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-3 py-2\.5 dark:border-slate-700/70">.*?</div>'
content = re.sub(pattern, '', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed dropdown header")
