import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(4180, 4280):
    if "</motion.div>" in lines[i] or "<motion.div" in lines[i]:
        print(f"Line {i}: {lines[i].strip()}")
