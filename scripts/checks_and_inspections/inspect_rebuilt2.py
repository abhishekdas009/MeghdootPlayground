import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('Component SOQL Query')
if idx != -1:
    print("Found Component SOQL Query!")
else:
    print("Not found Component SOQL Query!")

idx = orig.find('Asset SOQL Result')
if idx != -1:
    print("Found Asset SOQL Result!")
else:
    print("Not found Asset SOQL Result!")
