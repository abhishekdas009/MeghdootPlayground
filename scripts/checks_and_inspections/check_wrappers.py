import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "isTS && (" in line:
        print("isTS: ", lines[i+1].strip())
    if "isAssetTransfer && (" in line:
        print("isAssetTransfer: ", lines[i+1].strip())
    if "isCancellation && (" in line:
        print("isCancellation: ", lines[i+1].strip())
    if "isCaseAssign && (" in line:
        print("isCaseAssign: ", lines[i+1].strip())
