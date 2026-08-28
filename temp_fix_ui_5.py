import os

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_watermark_class = 'whitespace-nowrap text-[90px] md:text-[130px] lg:text-[150px] leading-none font-black tracking-tighter'
new_watermark_class = 'whitespace-nowrap text-[70px] md:text-[90px] lg:text-[100px] leading-none font-black tracking-tighter'

content = content.replace(old_watermark_class, new_watermark_class)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated watermark size")
