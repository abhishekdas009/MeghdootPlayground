import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('type?: "normal" | "asset-transfer" | "child-details-to-parent";', 'type?: "normal" | "asset-transfer" | "child-details-to-parent" | "product-record-type-update";')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed type error")
