import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

pattern_step1 = r'\{!isCaseAssign && !isCancellation && \(\s*<Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-\[10px\] font-black uppercase tracking-widest px-3 py-1\.5 shadow-sm flex items-center gap-1\.5">\s*<span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-\[10px\] text-white shadow-inner">1</span>\s*Step 1\s*</Badge>\s*\)\}'

content = re.sub(pattern_step1, '', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed step 1 pill")
