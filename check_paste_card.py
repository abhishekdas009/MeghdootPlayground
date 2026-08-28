import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "2. Paste Manually (Case Assign Mode)" in line:
        for j in range(i, i+3):
            print(f"Line {j}: {lines[j].strip()}")
        break
