import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the small label for Email Template Output
pattern_email_label = r'<div className="flex items-center justify-between border-b-transparent bg-transparent px-4 py-2.5">\s*<span className="text-\[10px\] font-mono font-black tracking-widest text-slate-400 uppercase">\s*EMAIL FORMAT\s*</span>\s*</div>'
content = re.sub(pattern_email_label, '', content)

# Remove the small label for Chatter Post Template
pattern_post_label = r'<div className="flex items-center justify-between border-b-transparent bg-transparent px-4 py-2.5">\s*<span className="text-\[10px\] font-mono font-black tracking-widest text-slate-400 uppercase">\s*CHATTER POST FORMAT\s*</span>\s*</div>'
content = re.sub(pattern_post_label, '', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed labels")
