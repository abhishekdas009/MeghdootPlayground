import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('className={lex-1 min-h-[100px] w-full resize-none border-0 bg-transparent p-5 font-mono text-xs focus-visible:ring-0', 'className={lex-1 min-h-[100px] w-full resize-none border-0 bg-transparent p-0 font-mono text-xs focus-visible:ring-0')

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
