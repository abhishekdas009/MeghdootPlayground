with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

import re

old_code = '    <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 group relative h-[calc(100vh-120px)] min-h-[500px]">'

new_code = '    <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 group relative h-[500px] xl:h-[calc(100vh-120px)] min-h-[500px]">'

if old_code in page:
    page = page.replace(old_code, new_code)
    print("Replaced QueryPreviewCard successfully")
else:
    print("Could not find QueryPreviewCard old code!")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
