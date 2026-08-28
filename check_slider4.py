import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

idx = page.find('Cancellation SOQL Batches')
print(page[idx+6500:idx+7500])
