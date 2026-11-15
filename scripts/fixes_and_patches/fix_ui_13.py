import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_size = 'whitespace-nowrap text-[70px] md:text-[80px] lg:text-[90px] leading-none font-black tracking-tighter'
new_size = 'whitespace-nowrap text-[55px] md:text-[65px] lg:text-[75px] leading-none font-black tracking-tighter'

content = content.replace(old_size, new_size)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated watermark size")
