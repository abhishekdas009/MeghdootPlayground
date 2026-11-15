import sys

with open('frontend/components/layout/header.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'role="switch"' in line:
        start = i - 2
        for j in range(start, start+70):
            if '</button>' in lines[j]:
                print(f"End at line {j}")
                break
        break
