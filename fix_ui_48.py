import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

def remove_pill(num):
    old_pill = f'''<div className="flex items-center gap-2 shrink-0 rounded-full border border-slate-500/20 bg-slate-500/10 p-1 pr-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-[11px] font-black text-white shadow-sm">
                                  {num}
                                </div>
                                <span className="text-[10px] font-black tracking-widest text-slate-600 dark:text-slate-400 uppercase">STEP {num}</span>
                              </div>'''
    return content.replace(old_pill, '')

for i in range(2, 6):
    content = remove_pill(i)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed step pills")
