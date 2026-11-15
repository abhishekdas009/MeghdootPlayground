import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "CANCELLATION EXCEPTION" in line and "FileWarning" in line:
        for j in range(i-2, i+6):
            print(f"Line {j}: {lines[j].strip()}")
        break
