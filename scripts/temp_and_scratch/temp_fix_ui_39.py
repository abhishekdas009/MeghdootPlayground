import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# REVERSE fix_ui_20.py (Watermark move to -top-8)
old_pos = 'absolute -top-6 left-4 md:-top-8 md:left-6 pointer-events-none select-none z-0 opacity-100'
new_pos = 'absolute -top-2 left-4 md:-top-4 md:left-6 pointer-events-none select-none z-0 opacity-100'

content = content.replace(old_pos, new_pos)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Undid watermark move")
