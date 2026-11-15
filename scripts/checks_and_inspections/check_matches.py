import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

idxs = []
idx = 0
while True:
    idx = content.find('onClick={() => onCopy(currentBatch)}', idx)
    if idx == -1: break
    idxs.append(idx)
    idx += 1

for i in idxs:
    print(f"Match at {i}:")
    print(repr(content[i:i+300]))
