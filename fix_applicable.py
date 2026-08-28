with open("frontend/app/warranty-finder/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"',
    'className="shrink-0 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"'
)

with open("frontend/app/warranty-finder/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
