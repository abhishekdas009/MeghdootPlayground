import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "QUERY" in line and "SELECTION" in lines[min(len(lines)-1, i+4)]:
        for j in range(i-2, i+6):
            print(f"Line {j}: {lines[j].strip()}")
        break
