import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "isCaseAssign && (" in line:
        for j in range(i-10, i):
            print(f"Line {j}: {lines[j].strip()}")
        break
