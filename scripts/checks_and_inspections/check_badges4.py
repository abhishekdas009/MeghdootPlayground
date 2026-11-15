import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "unassignedCaseIds.length" in line and "<Badge" in line:
        start = i - 3
        for j in range(start, i+8):
            print(f"Line {j}: {lines[j].strip()}")
        break
