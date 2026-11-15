import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('<CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">')
idx = content.find('<CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">', idx + 1)
print(repr(content[idx:idx+1500]))
