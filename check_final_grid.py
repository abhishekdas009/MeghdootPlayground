import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "isCaseAssign &&" in line and "w-full col-span-1" in lines[i+1]:
        for j in range(i, i+10):
            print(f"Line {j}: {lines[j].strip()}")
        break
