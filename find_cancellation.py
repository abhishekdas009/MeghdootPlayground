import sys

with open('page_original.tsx', 'r', encoding='utf-16') as f:
    orig = f.read()

idx = orig.find('isCancellation &&')
if idx != -1:
    print(orig[max(0, idx):idx+1000])
