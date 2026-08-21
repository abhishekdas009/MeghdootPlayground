import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make CardContent flex-1
text = text.replace(
    '<CardContent className="p-5 relative z-10">\n                    <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">',
    '<CardContent className="p-5 relative z-10 flex-1 flex flex-col min-h-[220px]">\n                    <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">'
)

# Remove hardcoded h-[140px] max-h-[140px]
text = text.replace(
    '<pre className="overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 h-[140px] max-h-[140px] no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">',
    '<pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 min-h-[140px] no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">'
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Results height fixed!')
