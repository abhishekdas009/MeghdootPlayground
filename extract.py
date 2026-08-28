import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('function QueryPreviewCard')
idx = content.find('<CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">', start_idx)
end_idx = content.find('<div className="relative flex-1 min-h-0">', idx)
print(repr(content[idx:end_idx + len('<div className="relative flex-1 min-h-0">')]))
