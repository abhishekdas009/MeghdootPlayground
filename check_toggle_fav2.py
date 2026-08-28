import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const toggleFav =" in line:
        for j in range(i, i+25):
            print(f"Line {j}: {lines[j].strip()}")
        break
