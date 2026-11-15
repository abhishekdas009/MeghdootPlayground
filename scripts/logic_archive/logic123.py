with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Update Clear button in PasteResultCard
old_clear = 'className="h-8 px-3 gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 shadow-sm"'
new_clear = 'className="h-8 px-3 gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"'
content = content.replace(old_clear, new_clear)

# Update Copy button in PasteResultCard (MagneticButton)
old_copy = 'className="h-8 px-3 gap-2 text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg shadow-sm"'
new_copy = 'className="h-8 px-3 gap-2 text-xs font-bold bg-emerald-50 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg shadow-sm backdrop-blur-md"'
content = content.replace(old_copy, new_copy)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated button backgrounds for legibility")
