import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

lines = page.splitlines()
print("\n".join(lines[3500:3515]))
