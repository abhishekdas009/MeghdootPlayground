import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('Asset SOQL<br />Result')
if idx != -1:
    print("Found Asset SOQL<br />Result")
    # let's see what precedes it
    print(orig[idx-500:idx])
else:
    print("Not found Asset")
