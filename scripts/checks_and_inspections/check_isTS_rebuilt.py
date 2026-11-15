import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('isTS && (')
if idx != -1:
    print(orig[idx:idx+1500])
