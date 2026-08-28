import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target1 = '''<Card className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative">'''
replacement1 = '''<Card className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group transition-all duration-300">'''

if target1 in content:
    content = content.replace(target1, replacement1)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Added group class to Card!")
else:
    print("Failed: Target not found.")
