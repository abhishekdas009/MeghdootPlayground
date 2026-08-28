import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Asset SOQL<br />Result" in line:
        for j in range(i-6, i):
            if "mt-2 md:mt-3" in lines[j]:
                lines[j] = lines[j].replace("mt-2 md:mt-3", "mt-4 md:mt-5")
                print("Success: set margin to mt-4 md:mt-5")
        break

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
