with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'className="rounded-full border border-slate-200/70 bg-slate-100/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400"',
    'className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400"'
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
