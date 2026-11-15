import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

occurrences = []
for i, line in enumerate(lines):
    if "{isCaseAssign && (" in line:
        occurrences.append(i)

if len(occurrences) > 1:
    start = occurrences[-1]
    print("".join(lines[start:start+25]))
