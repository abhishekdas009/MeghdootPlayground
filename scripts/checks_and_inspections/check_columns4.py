import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Or Paste Manually" in line:
        for j in range(i-50, i+10):
            print(f"Line {j}: {lines[j].strip()}")
        break
