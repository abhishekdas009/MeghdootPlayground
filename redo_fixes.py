import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('const SOQL_BATCH_SIZE = 400;', 'const SOQL_BATCH_SIZE = 400;\nconst CANCELLATION_BATCH_SIZE = 400;')
content = content.replace('type?: "normal" | "asset-transfer" | "child-details-to-parent";', 'type?: "normal" | "asset-transfer" | "child-details-to-parent" | "product-record-type-update";')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Re-applied build fixes")
