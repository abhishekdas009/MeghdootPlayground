import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "=== COLUMN 3: ROSTER ===" in line:
        for j in range(i-6, i+3):
            print(f"Line {j}: {repr(lines[j])}")
        break
