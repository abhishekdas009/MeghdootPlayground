import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

asset_titles = ["Component SOQL", "Asset SOQL", "Account SOQL", "Final Results"]

for i, line in enumerate(lines):
    if any(title in line for title in asset_titles) and "<CardTitle" in lines[i]:
        for j in range(i-6, i+2):
            print(f"Line {j}: {lines[j].strip()}")
        print("-" * 20)
