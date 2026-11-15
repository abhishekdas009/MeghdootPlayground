import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the subtitles
content = re.sub(r'<p className="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mt-1">\s*Status not completed, 500 tickets per query\s*</p>', '', content)
content = re.sub(r'<p className="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mt-1">\s*Each paste is stored and converted to Canceled\s*</p>', '', content)
content = re.sub(r'<p className="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mt-1">\s*Copy table when done\s*</p>', '', content)
content = re.sub(r'<p className="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mt-1">\s*Paste failed tickets to generate stats\s*</p>', '', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed subtitles")
