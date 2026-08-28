import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('function QueryPreviewCard')
if start_idx != -1:
    idx = content.find('<CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">', start_idx)
    print(repr(content[idx:idx+1500]))
