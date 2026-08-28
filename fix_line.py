import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Roster offline" in line and "active owners" in line:
        lines[i] = line.replace(' active owners', '${activeCaseOwners.length} active owners')
        break

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Success")
