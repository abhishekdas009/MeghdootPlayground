import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('isTS && (')
idx2 = orig.find('isAssetTransfer &&', idx)
print(f"isTS at {idx}, second isAssetTransfer at {idx2}")

if idx2 != -1:
    print(orig[idx2:idx2+500])
