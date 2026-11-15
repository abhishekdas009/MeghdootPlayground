import sys

with open('page_original.tsx', 'r', encoding='utf-16') as f:
    orig = f.read()

idx = orig.find('Account SOQL Query')
if idx != -1:
    print("Found!")
else:
    print("Not found")
