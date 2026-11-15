import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('Asset SOQL Result')
if idx != -1:
    print(orig[idx-1500:idx+500])
