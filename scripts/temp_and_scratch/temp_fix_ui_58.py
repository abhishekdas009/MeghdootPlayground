import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<span className="whitespace-nowrap text-\[35px\] md:text-\[45px\] lg:text-\[55px\] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent">'

replacement = r'<span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent">'

content = re.sub(pattern, replacement, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Increased STEP 1-5 watermark sizes slightly")
