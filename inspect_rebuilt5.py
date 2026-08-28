import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('Cancellation<br />SOQL Batches')
if idx != -1:
    print(orig[idx+1500:idx+3500])
