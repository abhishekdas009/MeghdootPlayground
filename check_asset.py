import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

idx = page.find('isAssetTransfer && (')
idx2 = page.find('isCancellation && (')
print(page[idx:idx+150])
