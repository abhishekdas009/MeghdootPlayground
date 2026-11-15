import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('onClick={() => onCopy(currentBatch)}')
idx = content.find('<Copy className="h-3 w-3" /> Copy', idx)
print(repr(content[idx:idx+500]))
