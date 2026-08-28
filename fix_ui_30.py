import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Watermarks
# Current watermarks are: bsolute -top-8 left-4 md:-top-12 md:left-6 pointer-events-none select-none z-0 opacity-100
# and whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent

old_wm_pos = r'absolute -top-8 left-4 md:-top-12 md:left-6 pointer-events-none select-none z-0 opacity-100'
new_wm_pos = r'absolute top-0 left-0 right-0 flex justify-center pointer-events-none select-none z-0 opacity-100'
content = re.sub(old_wm_pos, new_wm_pos, content)

old_wm_class = r'whitespace-nowrap text-\[45px\] md:text-\[55px\] lg:text-\[65px\] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent'
new_wm_class = r'whitespace-nowrap text-[80px] md:text-[110px] lg:text-[130px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent opacity-80'
content = re.sub(old_wm_class, new_wm_class, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated watermarks")
