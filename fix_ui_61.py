import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace text-base with mt-4 md:mt-5 text-lg md:text-xl for these specific titles
content = content.replace('<CardTitle className="text-base font-black tracking-tight text-foreground">Component SOQL Query</CardTitle>', '<CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Component SOQL Query</CardTitle>')
content = content.replace('<CardTitle className="text-base font-black tracking-tight text-foreground">Account SOQL Query</CardTitle>', '<CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Account SOQL Query</CardTitle>')
content = content.replace('<CardTitle className="text-base font-black tracking-tight text-foreground">Transfer Output\n(Excel Ready)</CardTitle>', '<CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Transfer Output (Excel Ready)</CardTitle>')

# wait, I'll use regex for transfer output to handle newline
content = re.sub(r'<CardTitle className="text-base font-black tracking-tight text-foreground">Transfer Output\s*\(Excel Ready\)</CardTitle>', r'<CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Transfer Output (Excel Ready)</CardTitle>', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated card titles in Asset Transfer")
