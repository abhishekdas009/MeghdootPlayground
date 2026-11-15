import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Or Paste Manually</CardTitle>" in line:
        for j in range(i-6, i+2):
            print(f"Line {j}: {lines[j].strip()}")
        break
