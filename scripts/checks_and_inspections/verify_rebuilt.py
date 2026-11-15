import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('Asset SOQL Result')
if idx != -1:
    print("Found Asset SOQL Result!")
else:
    print("Not found Asset SOQL Result!")

idx2 = orig.find('Cancellation SOQL Batches')
if idx2 != -1:
    print("Found Cancellation SOQL Batches!")
else:
    print("Not found Cancellation SOQL Batches!")
