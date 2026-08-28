import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "1. Assignment Output Box" in line:
        # found the start of column 2 content
        # trace upwards to find the column wrapper
        for j in range(i-5, i+5):
            print(f"Line {j}: {lines[j].strip()}")
        break
