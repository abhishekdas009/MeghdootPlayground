import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'Cancellation' in line and 'SOQL' in line:
        print(f"{i}: {line.strip()}")
