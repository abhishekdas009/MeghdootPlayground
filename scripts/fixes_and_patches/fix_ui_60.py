import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Step 2: Component SOQL Query
comp_pattern = r'(<CardTitle className="text-base font-black tracking-tight text-foreground">Component SOQL Query</CardTitle>)'
# wait, I need to insert the watermark BEFORE the CardHeader. It's safer to match the exact CardHeader string for each one.

comp_target = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none\s*backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group\s*relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">\s*<div className="flex items-center justify-between gap-3">\s*<div className="flex items-center gap-3">\s*<span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-\[0_0_8px_rgba\(59,130,246,0\.5\)\]" />\s*<CardTitle className="text-base font-black tracking-tight text-foreground">Component SOQL Query</CardTitle>)'

comp_watermark = r'''\1
                  {/* WATERMARK */}
                  <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100">
                    <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent">
                      STEP 2
                    </span>
                  </div>
                  \2'''
content = re.sub(comp_target, comp_watermark, content)


# Step 3: Account SOQL Query
acc_target = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none\s*backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group\s*relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">\s*<div className="flex items-center justify-between gap-3">\s*<div className="flex items-center gap-3">\s*<span className="h-2.5 w-2.5 rounded-full bg-emerald-500\s*shadow-\[0_0_8px_rgba\(16,185,129,0\.5\)\]" />\s*<CardTitle className="text-base font-black tracking-tight text-foreground">Account SOQL Query</CardTitle>)'

acc_watermark = r'''\1
                  {/* WATERMARK */}
                  <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100">
                    <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent">
                      STEP 3
                    </span>
                  </div>
                  \2'''
content = re.sub(acc_target, acc_watermark, content)


# Step 4: Transfer Output
trans_target = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none\s*backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col xl:col-span-2 transition-all\s*duration-300 group relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">\s*<div className="flex items-center justify-between gap-3">\s*<div className="flex items-center gap-3">\s*<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10\s*text-emerald-600 dark:text-emerald-400 shadow-inner">\s*<FileSpreadsheet className="h-5 w-5" />\s*</div>\s*<CardTitle className="text-base font-black tracking-tight text-foreground">Transfer Output\s*\(Excel Ready\)</CardTitle>)'

trans_watermark = r'''\1
                  {/* WATERMARK */}
                  <div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0 opacity-100">
                    <span className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent">
                      STEP 4
                    </span>
                  </div>
                  \2'''
content = re.sub(trans_target, trans_watermark, content)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added STEP 2, 3, 4 watermarks to Asset Transfer flow")
