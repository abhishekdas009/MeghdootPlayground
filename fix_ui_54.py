import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10\s*text-indigo-600 dark:text-indigo-400 shadow-inner">\s*<MessageSquare className="h-5 w-5" />\s*</div>\s*<CardTitle className="text-base font-black tracking-tight text-foreground">Post Template Output</CardTitle>'

replacement = r'<CardTitle className="mt-2 md:mt-3 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Post Template Output</CardTitle>'

content = re.sub(pattern, replacement, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed icon and updated title size")
