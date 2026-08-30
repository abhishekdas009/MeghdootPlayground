with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Update Copy button in QueryPreviewCard (MagneticButton)
old_copy_qpc = 'className="h-8 px-3 gap-2 text-xs font-bold bg-blue-500/10 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/40 rounded-lg shadow-sm"'
new_copy_qpc = 'className="h-8 px-3 gap-2 text-xs font-bold bg-blue-50 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/40 rounded-lg shadow-sm backdrop-blur-md"'
content = content.replace(old_copy_qpc, new_copy_qpc)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated QueryPreviewCard buttons")
