import re

file_path = r'e:\MeghdootPlayground\frontend\app\soql-generator\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement = '''    setCancellationStoredRows([]);
    setProductResultInput("");
    setProductOutput('"Id"\\t"RecordType.Id"\\n');
    setProductStoredCount(0);'''

content = content.replace('    setCancellationStoredRows([]);', replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched handleClear')
