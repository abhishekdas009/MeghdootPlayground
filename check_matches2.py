import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

i = content.find('onClick={() => onCopy(currentBatch)}')
print(repr(content[i:i+600]))
