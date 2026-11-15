import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Paste Your Tickets" in line:
        for j in range(i-20, i+20):
            print(f"Line {j}: {lines[j].strip()}")
        break
