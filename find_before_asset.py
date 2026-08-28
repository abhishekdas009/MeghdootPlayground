import sys

with open('page_original.tsx', 'r', encoding='utf-16') as f:
    orig = f.read()

idx = orig.find('Asset SOQL Result')
if idx != -1:
    print(orig[max(0, idx-3000):idx-2000])
