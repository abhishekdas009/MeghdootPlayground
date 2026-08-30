with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

old_classes = 'isActive \n                  ? "border-indigo-400 bg-white/80 dark:bg-indigo-900/40 dark:border-indigo-500/50 shadow-[0_4px_20px_rgba(99,102,241,0.2)] -translate-y-0.5 ring-2 ring-indigo-500/20" \n                  : "hover:shadow-md hover:-translate-y-0.5 border-white/20 bg-white/40 dark:bg-slate-900/40 dark:border-white/10 dark:hover:bg-slate-800/60"'

new_classes = 'isActive \n                  ? "bg-white/60 dark:bg-white/[0.15] border-white/80 dark:border-white/30 shadow-[0_8px_32px_rgba(31,38,135,0.15)] scale-[1.02] -translate-y-0.5" \n                  : "hover:shadow-md hover:-translate-y-0.5 border-white/20 bg-white/40 dark:bg-slate-900/40 dark:border-white/10 dark:hover:bg-slate-800/60"'

# Fix text color
old_text = 'isActive ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300"'
new_text = 'isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"'

if old_text in content and old_classes in content:
    content = content.replace(old_classes, new_classes)
    content = content.replace(old_text, new_text)
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success 59")
else:
    print("Failed to replace")
