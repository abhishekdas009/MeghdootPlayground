import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# For Email
email_pattern = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none\s*backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group\s*relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">\s*<div className="flex items-center justify-between gap-3">\s*<div className="flex items-center gap-3">\s*<CardTitle className="mt-2 md:mt-3 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Email Template Output</CardTitle>)'

email_replacement = r'''\1
                          {/* WATERMARK */}
                          <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                            <span className="whitespace-nowrap text-[35px] md:text-[45px] lg:text-[55px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent flex flex-col">
                              <span>FOR</span>
                              <span>EMAIL</span>
                            </span>
                          </div>
                          \2'''

content = re.sub(email_pattern, email_replacement, content)

# Wait, in the actual file, the Email Template Output has an icon too! Let's check the grep output for Email Template Output.
