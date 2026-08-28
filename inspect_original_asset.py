import sys

with open('page_original.tsx', 'r', encoding='utf-16') as f:
    orig = f.read()

idx = orig.find('isAssetTransfer && (')
if idx != -1:
    print(orig[idx:idx+2500])
