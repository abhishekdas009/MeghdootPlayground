import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(4260, 4290):
    print(f"Line {i}: {lines[i].strip()}")
