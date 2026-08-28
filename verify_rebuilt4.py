import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('Asset SOQL Result')
if idx != -1:
    print("Asset SOQL Result found in page_rebuilt")
else:
    print("Not found")

idx2 = orig.find('Account SOQL Result')
if idx2 != -1:
    print("Account SOQL Result found in page_rebuilt")
else:
    print("Not found")
