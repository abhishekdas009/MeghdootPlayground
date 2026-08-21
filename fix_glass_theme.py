import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

# Replace any remaining opaque dark backgrounds inside elements
page = re.sub(r'dark:bg-slate-900/([0-9]+)', r'dark:bg-white/[0.03] dark:border-white/[0.05]', page)
page = re.sub(r'dark:bg-slate-950/([0-9]+)', r'dark:bg-black/40', page)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)

print("Updated inner glass theme")
