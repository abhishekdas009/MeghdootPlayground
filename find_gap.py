import sys

with open('page_original.tsx', 'r', encoding='utf-16') as f:
    orig = f.read()

idx = orig.find('Component SOQL Query')
if idx != -1:
    print(orig[max(0, idx-500):idx+1000])
else:
    print("Not found")
