import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_title = 'text-[28px] md:text-[34px] font-black tracking-tighter leading-[1.05] text-foreground'
new_title = 'text-2xl md:text-[28px] font-black tracking-tighter leading-tight text-foreground'

content = content.replace(old_title, new_title)

# Also update Step 1 which is slightly different
old_s1 = 'text-[28px] md:text-[34px] font-black tracking-tighter leading-[1.05] flex-1'
new_s1 = 'text-2xl md:text-[28px] font-black tracking-tighter leading-tight flex-1'

content = content.replace(old_s1, new_s1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CardTitle sizes")
