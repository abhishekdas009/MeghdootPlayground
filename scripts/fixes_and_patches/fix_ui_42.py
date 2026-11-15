import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Reduce watermark size
old_wm_class = r'whitespace-nowrap text-\[45px\] md:text-\[55px\] lg:text-\[65px\] leading-none font-black tracking-tighter bg-gradient-to-b'
new_wm_class = r'whitespace-nowrap text-[35px] md:text-[45px] lg:text-[55px] leading-none font-black tracking-tighter bg-gradient-to-b'
content = re.sub(old_wm_class, new_wm_class, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Reduced watermark size")
