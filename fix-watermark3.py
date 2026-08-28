import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

def get_watermark(step_num):
    return f'''        <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
          <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
            STEP {step_num}
          </span>
        </div>'''

# 1. Step 1
pattern1 = r'(<Card className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative">)'
content, count = re.subn(pattern1, r'\1\n' + get_watermark(1) + r'\n\2', content)
if count > 0: print("Updated step 1")

# 2. Step 2
pattern2 = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">)\s*(<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">)\s*(<div className="flex gap-4 items-start">)\s*(<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-inner mt-1">)'
content, count = re.subn(pattern2, r'\1\n' + get_watermark(2) + r'\n\2\n\3\n\4\n\5', content)
if count > 0: print("Updated step 2")

# 3. Step 3
pattern3 = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">)\s*(<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">)\s*(<div className="flex items-center gap-4">)\s*(<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">)'
content, count = re.subn(pattern3, r'\1\n' + get_watermark(3) + r'\n\2\n\3\n\4\n\5', content)
if count > 0: print("Updated step 3")

# 4. Step 4
pattern4 = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col 2xl:col-span-1 transition-all duration-300 group relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">)\s*(<div className="flex items-center gap-4">)\s*(<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">)'
content, count = re.subn(pattern4, r'\1\n' + get_watermark(4) + r'\n\2\n\3\n\4', content)
if count > 0: print("Updated step 4")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
