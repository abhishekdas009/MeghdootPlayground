import sys

with open('page_original.tsx', 'r', encoding='utf-16') as f:
    orig = f.read()

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    curr = f.read()

print(f"Original length: {len(orig)}, Current length: {len(curr)}")
