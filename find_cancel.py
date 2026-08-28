import sys

with open('page_original.tsx', 'r', encoding='utf-16') as f:
    orig = f.read()

idx = orig.find('Cancellation SOQL Batches')
if idx != -1:
    print("Found Cancellation SOQL Batches!")
else:
    print("Not found Cancellation SOQL Batches!")
