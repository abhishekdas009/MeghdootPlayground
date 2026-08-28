import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# For Post
post_pattern = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none\s*backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group\s*relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">\s*<div className="flex items-center justify-between gap-3">\s*<div className="flex items-center gap-3">\s*<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10\s*text-indigo-600 dark:text-indigo-400 shadow-inner">\s*<MessageSquare className="h-5 w-5" />\s*</div>\s*<CardTitle className="text-base font-black tracking-tight text-foreground">Post Template Output</CardTitle>)'

post_replacement = r'''\1
                        {/* WATERMARK */}
                        <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                          <span className="text-[35px] md:text-[45px] lg:text-[55px] leading-[0.9] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent flex flex-col">
                            <span>FOR</span>
                            <span>POST</span>
                          </span>
                        </div>
                        \2'''

content = re.sub(post_pattern, post_replacement, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added FOR POST watermark")
