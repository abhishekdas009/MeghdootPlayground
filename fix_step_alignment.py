import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_div = 'absolute top-0 left-2 md:-top-1 md:left-4 pointer-events-none select-none z-0 overflow-hidden opacity-100'
new_div = 'absolute top-2 left-2 md:top-2 md:left-4 pointer-events-none select-none z-0 opacity-100'

old_span = 'leading-[0.8] font-black tracking-tighter'
new_span = 'leading-none font-black tracking-tighter'

content = content.replace(old_div, new_div)
content = content.replace(old_span, new_span)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated STEP alignment")
