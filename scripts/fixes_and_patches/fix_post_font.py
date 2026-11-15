import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''<span className="whitespace-nowrap text-[25px] md:text-[35px] lg:text-[45px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                            FOR POST
                          </span>'''

replacement = '''<span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                            FOR POST
                          </span>'''

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Replaced FOR POST styling.")
else:
    print("Failed: Target not found.")
