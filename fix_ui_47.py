import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the badges div
badges_pattern = r'<div className="flex items-center gap-2 shrink-0">\s*<Badge className="text-\[10px\].*?>\s*\{defaultTemplateCount\} Built-in\s*</Badge>\s*<Badge className=\{cn\("text-\[10px\].*?>\s*\{libraryLoadState === "loading" \? "Loading\.\.\." : \$\{libraryTemplateCount\} Saved\}\s*</Badge>\s*</div>'

content = re.sub(badges_pattern, '', content, flags=re.DOTALL)

# 2. Push title down
wrapper_pattern = r'<div className="flex flex-col gap-4">'
wrapper_replacement = r'<div className="flex flex-col pt-8">'
content = content.replace('<div className="flex flex-col gap-4">', '<div className="flex flex-col pt-8">')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed badges and pushed title down")
