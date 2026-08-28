import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Owner Management (" in line:
        for j in range(i-10, i+2):
            if "<Card className=" in lines[j]:
                print(f"Line {j}: {lines[j].strip()}")
        break
