import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('Cancellation')
if idx != -1:
    print("Found Cancellation!")
else:
    print("Not found Cancellation!")
