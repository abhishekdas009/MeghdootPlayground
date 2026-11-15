import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('Cancellation<br />SOQL Batches')
if idx != -1:
    print("Found Cancellation<br />SOQL Batches!")
else:
    print("Not found")
