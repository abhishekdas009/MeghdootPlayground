import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = -1
for i, line in enumerate(lines):
    if "isCaseAssign &&" in line:
        start = i

if start != -1:
    print("".join(lines[start:start+100]))
