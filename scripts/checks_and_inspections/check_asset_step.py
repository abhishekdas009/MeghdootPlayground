import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Asset SOQL<br />Result" in line:
        for j in range(i-20, i):
            if "STEP" in lines[j]:
                print(f"Line {j}: {lines[j].strip()}")
