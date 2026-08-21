import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace QueryPreviewCard Card wrapper to have explicit viewport height
text = text.replace(
    '<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 group relative h-full">',
    '<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 group relative h-[calc(100vh-120px)] min-h-[500px]">'
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('QueryPreviewCard fixed!')
