import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6 items-stretch w-full">'
replacement = '<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start w-full">'
content = content.replace(target, replacement)

pattern = r'</Card>\s*</div>\s*/\* === COLUMN 3: ROSTER === \*/\s*<div className="space-y-4 flex flex-col h-full min-h-0">'
replacement_col = '</Card>\n\n              {/* === MERGED COLUMN 3: ROSTER === */}'
content = re.sub(pattern, replacement_col, content)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success: Restructured columns.")
