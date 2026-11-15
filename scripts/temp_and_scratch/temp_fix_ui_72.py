import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all occurrences of the STEP gradient with the standard gradient
content = content.replace('from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent', 'from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated STEP gradient colors")
