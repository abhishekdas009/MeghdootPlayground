import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make them one line properly
content = re.sub(r'<span className="block">(.*?)</span>\s*<span className="block">(.*?)</span>', r'\1 \2', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated all block spans to single line")
