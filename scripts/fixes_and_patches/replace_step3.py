with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Find the Paste SOQL Result Batch Card
pattern = r'(<span className="whitespace-nowrap text-\[40px\] md:text-\[50px\] lg:text-\[60px\] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/50 dark:to-white/10 bg-clip-text text-transparent">\s*FOR EMAIL\s*</span>\s*</div>\s*<CardHeader className="pb-4 bg-transparent p-6 relative z-10">\s*<div className="flex items-center justify-between gap-4">\s*<CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">\s*Paste SOQL Result Batch\s*</CardTitle>)'

match = re.search(pattern, content)
if match:
    old_str = match.group(0)
    new_str = old_str.replace("FOR EMAIL", "STEP 3")
    content = content[:match.start()] + new_str + content[match.end():]
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
else:
    print("Not found")
