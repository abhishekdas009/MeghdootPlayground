import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "=== COLUMN 2: RESULTS ===" in line:
        for j in range(i+30, i+60):
            print(f"Line {j}: {lines[j].strip()}")
        break
