import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'\{isCaseAssign && \(\s*<div className="flex flex-col space-y-4">'
replacement = '{isCaseAssign && (\n                      <div className="flex flex-col space-y-4 flex-1 min-h-0 h-full">'

content, count = re.subn(pattern, replacement, content)
if count > 0:
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Regex replaced")
else:
    print("Failed")
