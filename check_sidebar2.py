import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "2xl:col-span-3 xl:col-span-4" in line:
        print(f"Sidebar motion.div: {lines[i].strip()}")
        break
