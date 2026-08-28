import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "isCaseAssign &&" in line and "space-y-6" in lines[i+1]:
        for j in range(i, i+15):
            print(f"Line {j}: {lines[j].strip()}")
        break
