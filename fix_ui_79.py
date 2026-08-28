import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if 'isCancellation && (' in line:
        start_idx = i
        break

for j in range(start_idx, min(start_idx + 150, len(lines))):
    print(lines[j].rstrip('\n'))
