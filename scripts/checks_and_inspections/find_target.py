import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "key={shortcut.id}" in line and "onClick" in lines[i+1]:
        start = i - 1
        end = i + 10
        print("--- TARGET ---")
        for j in range(start, end):
            print(lines[j], end='')
        print("--- END TARGET ---")
        break
