import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('isChildDetailsToParent && (')
print(f"isChildDetailsToParent at {idx}")
