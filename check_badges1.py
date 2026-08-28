import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Pasted tickets:" in line and "parsedTickets.length" in line:
        start = i - 2
        for j in range(start, i+15):
            print(f"Line {j}: {lines[j].strip()}")
        break
