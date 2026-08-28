import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update existing watermarks to be huge
old_watermark_class = 'whitespace-nowrap text-[70px] md:text-[90px] lg:text-[110px] leading-none font-black tracking-tighter'
new_watermark_class = 'whitespace-nowrap text-[90px] md:text-[130px] lg:text-[150px] leading-none font-black tracking-tighter'
content = content.replace(old_watermark_class, new_watermark_class)

old_watermark_pos = 'absolute top-2 left-2 md:top-2 md:left-4 pointer-events-none select-none z-0 opacity-100'
new_watermark_pos = 'absolute top-0 left-2 md:top-0 md:left-4 pointer-events-none select-none z-0 opacity-100'
content = content.replace(old_watermark_pos, new_watermark_pos)

# 2. Update existing CardTitles to be massive
old_title_class = 'text-xl md:text-2xl font-black tracking-tight leading-tight'
new_title_class = 'text-[28px] md:text-[34px] font-black tracking-tighter leading-[1.05]'
content = content.replace(old_title_class, new_title_class)

# Write back intermediate
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated watermarks and title classes")
