import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(4277, 3000, -1):
    if "<motion.div" in lines[i]:
        print(f"Found motion.div at line {i}: {lines[i].strip()}")
        print("".join(lines[i:i+5]))
        break
