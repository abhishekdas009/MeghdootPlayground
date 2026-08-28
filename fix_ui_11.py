import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# FOR EMAIL/POST size fix
old_huge = 'whitespace-nowrap text-[90px] md:text-[130px] lg:text-[150px] leading-none font-black tracking-tighter'
new_huge = 'whitespace-nowrap text-[70px] md:text-[80px] lg:text-[90px] leading-none font-black tracking-tighter'
content = content.replace(old_huge, new_huge)

old_pos = 'absolute top-0 left-2 md:top-0 md:left-4 pointer-events-none select-none z-0 opacity-100'
new_pos = 'absolute top-4 left-4 md:top-6 md:left-6 pointer-events-none select-none z-0 opacity-100'
content = content.replace(old_pos, new_pos)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Email/Post watermarks")
