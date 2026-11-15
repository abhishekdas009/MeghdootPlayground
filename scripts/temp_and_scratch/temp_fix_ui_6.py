import os

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_pos = 'absolute top-0 left-2 md:top-0 md:left-4 pointer-events-none select-none z-0 opacity-100'
new_pos = 'absolute top-0 right-0 md:top-0 md:right-2 pointer-events-none select-none z-0 opacity-100'

content = content.replace(old_pos, new_pos)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated watermark alignment")
