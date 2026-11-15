import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_pos = 'absolute -top-6 left-4 md:-top-8 md:left-6 pointer-events-none select-none z-0 opacity-100'
new_pos = 'absolute -top-8 left-4 md:-top-12 md:left-6 pointer-events-none select-none z-0 opacity-100'

content = content.replace(old_pos, new_pos)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Moved watermark up more")
