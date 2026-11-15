import sys

with open('page_original.tsx', 'r', encoding='utf-16') as f:
    orig = f.read()

idx = orig.find('Asset SOQL Result')
if idx != -1:
    print("Found Asset SOQL Result!")
else:
    print("Not found Asset SOQL Result!")
