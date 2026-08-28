import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''<Card className="rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden group">
              <CardHeader className="pb-4 bg-transparent relative z-10 p-6">'''

replacement = '''<Card className="rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group">
              {/* WATERMARK */}
              <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100">
                <span className="whitespace-nowrap text-[35px] md:text-[45px] lg:text-[55px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                  QUERY SELECTION
                </span>
              </div>
              <CardHeader className="pb-4 bg-transparent relative z-10 p-6">'''

# wait, the class name in the file has line breaks!
