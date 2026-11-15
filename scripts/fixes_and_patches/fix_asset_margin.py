import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Asset SOQL<br />Result" in line:
        for j in range(i-6, i):
            if "mt-6 md:mt-8" in lines[j]:
                lines[j] = lines[j].replace("mt-6 md:mt-8", "mt-2 md:mt-3")
                print("Success: reduced margin on Asset SOQL Result")
        break

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
