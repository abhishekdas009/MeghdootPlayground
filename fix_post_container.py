import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''<div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                          <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                            FOR POST
                          </span>
                        </div>'''

replacement = '''<div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100">
                          <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                            FOR POST
                          </span>
                        </div>'''

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Replaced FOR POST container.")
else:
    print("Failed: Container not found.")
