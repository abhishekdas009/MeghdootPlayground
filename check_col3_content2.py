import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "=== COLUMN 3: ROSTER ===" in line:
        for j in range(i+60, i+100):
            print(f"Line {j}: {lines[j].strip()}")
        break
