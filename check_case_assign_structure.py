import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = -1
for i, line in enumerate(lines):
    if "isCaseAssign &&" in line and "<div className=\"space-y-6 w-full\">" in lines[i+1]:
        start = i - 0
        break

if start != -1:
    print("".join(lines[start:start+40]))
