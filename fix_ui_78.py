import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '<CardHeader className="pb-4 bg-transparent p-6 relative z-10">' in line:
        print(f"Match at line {i}: {line.strip()}")
        # print 5 lines around it
        for j in range(max(0, i-5), min(len(lines), i+6)):
            print(f"  {j}: {lines[j].strip()}")
        print("-" * 40)
