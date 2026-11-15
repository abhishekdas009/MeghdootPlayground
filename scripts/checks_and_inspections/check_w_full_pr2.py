import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "mt-6 md:mt-8" in line and "w-full pr-2" in line:
        print(f"Line {i}: {lines[i].strip()}")
        # print the title it belongs to
        for j in range(i, min(len(lines), i+15)):
            if "CardTitle" in lines[j]:
                print(f"  Title: {lines[j].strip()}")
                if "<br />" in lines[j+1]:
                    print(f"  Title line 2: {lines[j+1].strip()}")
                break
