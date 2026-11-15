import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

occurrences = []
for i, line in enumerate(lines):
    if "isCaseAssign && (" in line:
        occurrences.append(i)

if len(occurrences) > 1:
    i = occurrences[-1]
    for j in range(i-20, i+5):
        print(f"Line {j}: {lines[j].strip()}")
