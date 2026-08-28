import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_watermark = '''<span className="text-[25px] md:text-[35px] lg:text-[45px] leading-[0.9] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent flex flex-col">'''

new_watermark = '''<span className="text-[35px] md:text-[45px] lg:text-[55px] leading-[0.9] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent flex flex-col">'''

content = content.replace(old_watermark, new_watermark)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Increased watermark size")
