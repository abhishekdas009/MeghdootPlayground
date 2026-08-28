import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

print('Target matched' in content)
print('Pasted: ' in content)
