import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''                  {/* Massive Watermark */}
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                    <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                      ADD MANUALLY
                    </span>
                  </div>'''
                  
replacement = '''                  {/* Massive Watermark */}
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                    <span className="text-[25px] md:text-[35px] lg:text-[45px] leading-[0.9] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent flex flex-col">
                      <span>ADD</span>
                      <span>MANUALLY</span>
                    </span>
                  </div>'''

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Updated ADD MANUALLY to double line")
else:
    print("Failed to find exact target. Attempting regex...")
    pattern = r'\{\/\* Massive Watermark \*\/\}.*?ADD MANUALLY\s*</span>\s*</div>'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        content = content[:match.start()] + replacement + content[match.end():]
        with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success via regex")
    else:
        print("Failed regex too")
