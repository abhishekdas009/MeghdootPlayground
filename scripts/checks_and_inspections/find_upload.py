import os
import re

filepath = 'frontend/app/warranty-finder/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'const handleUpload =.*?catch\s*\([^)]*\)\s*\{.*?\}', content, re.DOTALL)
if m:
    print(m.group(0))
else:
    print("Could not find handleUpload")
