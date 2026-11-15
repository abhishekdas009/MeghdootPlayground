import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Owner Management (" in line:
        for j in range(i-12, i):
            print(f"Line {j}: {repr(lines[j])}")
        break
