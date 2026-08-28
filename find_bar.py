import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if "BATCH {batchIndex + 1} / {batches.length}" in line:
        start_idx = i - 4
        break

if start_idx != -1:
    print("".join(lines[start_idx:start_idx+40]))
