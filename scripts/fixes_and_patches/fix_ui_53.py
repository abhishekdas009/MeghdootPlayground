import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make FOR POST one line
post_pattern = r'<span className="text-\[25px\] md:text-\[35px\] lg:text-\[45px\] leading-\[0\.9\] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent flex flex-col">\s*<span>FOR</span>\s*<span>POST</span>\s*</span>'

post_replacement = r'''<span className="whitespace-nowrap text-[25px] md:text-[35px] lg:text-[45px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                            FOR POST
                          </span>'''

content = re.sub(post_pattern, post_replacement, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Made FOR POST one line")
