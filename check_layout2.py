import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(3790, 4200):
    if "=== RIGHT COLUMN" in lines[i] or "=== COLUMN" in lines[i] or "Owner Master Roster" in lines[i] or "Final Assignment Output" in lines[i]:
        print(f"Line {i}: {lines[i].strip()}")
