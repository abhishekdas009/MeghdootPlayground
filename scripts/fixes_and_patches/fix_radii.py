import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('rounded-3xl', 'rounded-2xl')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Standardized border radius to rounded-2xl")
