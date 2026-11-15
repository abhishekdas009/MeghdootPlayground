import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const toggleFav =" in line:
        for j in range(i+24, i+40):
            print(f"Line {j}: {lines[j].strip()}")
        break
