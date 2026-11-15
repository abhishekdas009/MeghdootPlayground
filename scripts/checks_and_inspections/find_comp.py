import sys

with open('page_original.tsx', 'r', encoding='utf-16') as f:
    orig = f.read()

idx = orig.find('Component')
idx2 = orig.find('Component SOQL Query')
print(f"Component found at {idx}, Component SOQL Query found at {idx2}")

idx3 = orig.find('Asset SOQL')
print(f"Asset SOQL found at {idx3}")
