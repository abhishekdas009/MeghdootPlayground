import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace rounded-2xl to rounded-3xl in QueryPreviewCard
idx = content.find('function QueryPreviewCard(')
if idx != -1:
    end_idx = content.find('function TemplatePicker(', idx)
    if end_idx != -1:
        part = content[idx:end_idx]
        part = part.replace('rounded-2xl', 'rounded-3xl', 1)
        content = content[:idx] + part + content[end_idx:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Restored rounded-3xl for QueryPreviewCard")
