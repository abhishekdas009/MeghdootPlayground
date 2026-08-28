import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Component SOQL Query" in line or "Account SOQL Query" in line:
        for j in range(i-2, i+2):
            print(f"Line {j}: {lines[j].strip()}")
        print("-" * 20)
