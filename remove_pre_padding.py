import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace p-5 with p-0 in pre tags
content = re.sub(r'(<pre[^>]*\b)p-5(\b[^>]*>)', r'\1p-0\2', content)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
