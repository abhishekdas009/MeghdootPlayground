import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_badge1 = 'Badge className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 whitespace-nowrap text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm uppercase tracking-widest"'
new_badge1 = 'Badge className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full whitespace-nowrap text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm uppercase tracking-widest"'

old_badge2 = 'Badge className={cn("text-[10px] font-black px-3 py-1 whitespace-nowrap shadow-sm uppercase tracking-widest border", libraryLoadState === "error" ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20")}'
new_badge2 = 'Badge className={cn("text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap shadow-sm uppercase tracking-widest border", libraryLoadState === "error" ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20")}'

content = content.replace(old_badge1, new_badge1)
content = content.replace(old_badge2, new_badge2)

# Also update the badges in the other cards!
old_b3 = 'Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm self-start"'
new_b3 = 'Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm self-start"'
content = content.replace(old_b3, new_b3)

old_b4 = 'Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm mt-1 shrink-0"'
new_b4 = 'Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm mt-1 shrink-0"'
content = content.replace(old_b4, new_b4)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated badge rounding")
