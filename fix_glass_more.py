import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_str = 'className="max-h-[350px] z-[100] rounded-2xl border border-white/40 bg-white/45 p-1.5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"'
new_str = 'className="max-h-[350px] z-[100] rounded-2xl border border-slate-200/50 bg-white/30 p-1.5 backdrop-blur-3xl dark:border-white/10 dark:bg-slate-950/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"'

text = text.replace(old_str, new_str)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Done')
