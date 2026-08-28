import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "w-full col-span-1 2xl:col-span-2 xl:col-span-2 flex flex-col" in line:
        for j in range(i-1, i+5):
            print(f"Line {j}: {lines[j].strip()}")
        break
