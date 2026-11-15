import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Reverse size change
old_title = 'text-2xl md:text-[28px] font-black tracking-tighter leading-tight text-foreground'
new_title = 'text-lg md:text-xl font-black tracking-tight leading-tight text-foreground'
content = content.replace(new_title, old_title)

old_s1 = 'text-2xl md:text-[28px] font-black tracking-tighter leading-tight flex-1'
new_s1 = 'text-lg md:text-xl font-black tracking-tight leading-tight flex-1'
content = content.replace(new_s1, old_s1)

# Reverse single line change
content = content.replace('"Paste Your Tickets"', '<><span className="block">Paste Your</span><span className="block">Tickets</span></>')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Undid one line titles and sizes")
