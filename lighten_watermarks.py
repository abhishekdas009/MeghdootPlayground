import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = 'bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent'
replacement = 'bg-gradient-to-b from-slate-400/20 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent'

content = content.replace(target, replacement)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
