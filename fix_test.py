import sys
with open('frontend/test.ts', 'r', encoding='utf-8') as f:
    code = f.read()
code = code.replace('prisma.()', 'prisma.()')
with open('frontend/test.ts', 'w', encoding='utf-8') as f:
    f.write(code)
