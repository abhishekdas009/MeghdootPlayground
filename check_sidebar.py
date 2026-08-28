import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "STEP 1" in line and "Upload or Paste Case IDs" in line:
        for j in range(i-10, i):
            print(f"Line {j}: {lines[j].strip()}")
        break
