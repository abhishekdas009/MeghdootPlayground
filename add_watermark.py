import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'(<Card className="[^"]*flex flex-col flex-1 min-h-0[^"]*">)\s*(<CardHeader className="pb-4 bg-transparent p-5 relative z-10">)\s*(<div className="flex items-center gap-3 w-full">)\s*(<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">)\s*(<Terminal className="h-4\.5 w-4\.5" />)\s*(</div>)\s*(<CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Or Paste Manually</CardTitle>)'

replacement = r'''\1
                  {/* Massive Watermark */}
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:scale-105 group-hover:opacity-100 origin-left">
                    <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">
                      ADD MANUALLY
                    </span>
                  </div>

                  \2
                    <div className="flex items-center gap-3 w-full mt-6 md:mt-8">
                      \4
                        \5
                      \6
                      \7'''

content, count = re.subn(pattern, replacement, content)

if count > 0:
    print(f"Success! Replaced {count} times.")
else:
    print("Failed to replace.")

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

