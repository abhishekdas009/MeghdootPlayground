import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('Paste SOQL Result Batch')
if idx != -1:
    print(orig[idx-200:idx+300])
