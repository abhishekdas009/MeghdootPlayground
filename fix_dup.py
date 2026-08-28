import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('const CANCELLATION_BATCH_SIZE = 400;\nconst CANCELLATION_BATCH_SIZE = 400;', 'const CANCELLATION_BATCH_SIZE = 400;')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed duplicate CANCELLATION_BATCH_SIZE")
