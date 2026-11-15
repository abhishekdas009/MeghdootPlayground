import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

def replace_step(num):
    old_pill = f'''<div className="flex items-center gap-2 shrink-0 rounded-full border border-slate-500/20 bg-slate-500/10 p-1 pr-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-[11px] font-black text-white shadow-sm">
                                  {num}
                                </div>
                                <span className="text-[10px] font-black tracking-widest text-slate-600 dark:text-slate-400 uppercase">STEP {num}</span>
                              </div>'''
    
    new_pill = f'''<div className="flex items-center gap-2.5 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/60 pr-3 p-1 backdrop-blur-md shadow-sm shrink-0">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-white text-[11px] font-black shadow-inner">
                                  {num}
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mr-1">
                                  STEP {num}
                                </span>
                              </div>'''
    
    return content.replace(old_pill, new_pill)

for i in range(2, 6):
    content = replace_step(i)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated pills for 2, 3, 4, 5")
