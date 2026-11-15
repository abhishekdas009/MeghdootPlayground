import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Step 2
pattern_step2 = r'<div className="flex items-center gap-3">\s*<div className="flex flex-col gap-2.5">\s*<div className="flex items-center gap-1.5 rounded bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1">\s*<div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-\[11px\] font-black text-white shadow-sm">\s*2\s*</div>\s*<span className="text-\[10px\] font-black tracking-widest text-slate-600 dark:text-slate-400 uppercase">STEP 2</span>\s*</div>\s*<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">\s*(.*?)\s*</CardTitle>'

new_step2 = r'''<div className="flex items-center gap-4">\n                              <div className="flex items-center gap-2.5 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/60 pr-3 p-1 backdrop-blur-md shadow-sm shrink-0">\n                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-white text-[11px] font-black shadow-inner">\n                                  2\n                                </div>\n                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mr-1">\n                                  STEP 2\n                                </span>\n                              </div>\n                              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">\n                                \1\n                              </CardTitle>'''
content = re.sub(pattern_step2, new_step2, content, flags=re.DOTALL)

# Step 3
pattern_step3 = r'<div className="flex items-center gap-3">\s*<div className="flex flex-col gap-2.5">\s*<div className="flex items-center gap-1.5 rounded bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1">\s*<div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-\[11px\] font-black text-white shadow-sm">\s*3\s*</div>\s*<span className="text-\[10px\] font-black tracking-widest text-slate-600 dark:text-slate-400 uppercase">STEP 3</span>\s*</div>\s*<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">\s*(.*?)\s*</CardTitle>'

new_step3 = r'''<div className="flex items-center gap-4">\n                              <div className="flex items-center gap-2.5 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/60 pr-3 p-1 backdrop-blur-md shadow-sm shrink-0">\n                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-white text-[11px] font-black shadow-inner">\n                                  3\n                                </div>\n                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mr-1">\n                                  STEP 3\n                                </span>\n                              </div>\n                              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">\n                                \1\n                              </CardTitle>'''
content = re.sub(pattern_step3, new_step3, content, flags=re.DOTALL)


# Step 4
pattern_step4 = r'<div className="flex items-center gap-3">\s*<div className="flex flex-col gap-2.5">\s*<div className="flex items-center gap-1.5 rounded bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1">\s*<div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-\[11px\] font-black text-white shadow-sm">\s*4\s*</div>\s*<span className="text-\[10px\] font-black tracking-widest text-slate-600 dark:text-slate-400 uppercase">STEP 4</span>\s*</div>\s*<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">\s*(.*?)\s*</CardTitle>'

new_step4 = r'''<div className="flex items-center gap-4">\n                              <div className="flex items-center gap-2.5 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/60 pr-3 p-1 backdrop-blur-md shadow-sm shrink-0">\n                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-white text-[11px] font-black shadow-inner">\n                                  4\n                                </div>\n                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mr-1">\n                                  STEP 4\n                                </span>\n                              </div>\n                              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">\n                                \1\n                              </CardTitle>'''
content = re.sub(pattern_step4, new_step4, content, flags=re.DOTALL)

# Step 5
pattern_step5 = r'<div className="flex items-center gap-3">\s*<div className="flex flex-col gap-2.5">\s*<div className="flex items-center gap-1.5 rounded bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1">\s*<div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-\[11px\] font-black text-white shadow-sm">\s*5\s*</div>\s*<span className="text-\[10px\] font-black tracking-widest text-slate-600 dark:text-slate-400 uppercase">STEP 5</span>\s*</div>\s*<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">\s*(.*?)\s*</CardTitle>'

new_step5 = r'''<div className="flex items-center gap-4">\n                              <div className="flex items-center gap-2.5 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/60 pr-3 p-1 backdrop-blur-md shadow-sm shrink-0">\n                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-white text-[11px] font-black shadow-inner">\n                                  5\n                                </div>\n                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mr-1">\n                                  STEP 5\n                                </span>\n                              </div>\n                              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">\n                                \1\n                              </CardTitle>'''
content = re.sub(pattern_step5, new_step5, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated all tiny badges to the glass format")
