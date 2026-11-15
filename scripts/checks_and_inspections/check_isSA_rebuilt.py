import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('isSA && (')
if idx != -1:
    print("Found isSA")
else:
    print("Not found isSA")
