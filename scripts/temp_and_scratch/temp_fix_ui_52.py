import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Reduce FOR POST watermark size
post_pattern = r'<span className="text-\[35px\] md:text-\[45px\] lg:text-\[55px\] leading-\[0\.9\] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent flex flex-col">\s*<span>FOR</span>\s*<span>POST</span>\s*</span>'

post_replacement = r'''<span className="text-[25px] md:text-[35px] lg:text-[45px] leading-[0.9] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent flex flex-col">
                            <span>FOR</span>
                            <span>POST</span>
                          </span>'''

content = re.sub(post_pattern, post_replacement, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Reduced FOR POST watermark size")
