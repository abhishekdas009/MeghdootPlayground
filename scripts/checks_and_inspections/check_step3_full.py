import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Final Assignment<br />Output" in line:
        for j in range(i-15, i+2):
            print(f"Line {j}: {lines[j].strip()}")
        break
