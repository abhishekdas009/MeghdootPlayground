import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

occurrences = []
for i, line in enumerate(lines):
    if "{isCaseAssign && (" in line:
        occurrences.append(i)

if len(occurrences) > 1:
    start = occurrences[-1]
    
    # Just print all lines containing "=== COLUMN"
    for i in range(start, min(start + 500, len(lines))):
        if "=== COLUMN" in lines[i]:
            print(f"Line {i}: {lines[i].strip()}")
