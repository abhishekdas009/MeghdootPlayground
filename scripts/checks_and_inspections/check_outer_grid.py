import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "2xl:col-span-9 xl:col-span-8" in line:
        for j in range(i-2, i+5):
            print(f"Line {j}: {lines[j].strip()}")
        break
