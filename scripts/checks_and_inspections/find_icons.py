import io
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

icons = re.findall(r'return <([A-Z][a-zA-Z]*) className="h-4 w-4"', text)
print(list(set(icons)))
