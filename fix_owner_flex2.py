import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Owner Management (" in line:
        for j in range(i-12, i):
            if "shrink-0" in lines[j] and "<Card className=" in lines[j]:
                lines[j] = lines[j].replace("shrink-0", "flex-1 min-h-0")
                print("Success")
        break

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

