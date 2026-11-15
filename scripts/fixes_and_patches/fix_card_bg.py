import os

filepath = 'frontend/app/ticket-formatter/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Card backgrounds
content = content.replace('bg-white/40 dark:bg-slate-950/40', 'bg-white/5 dark:bg-white/5')
content = content.replace('bg-white/20 dark:bg-slate-900/20', 'bg-white/10 dark:bg-white/10')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Card backgrounds to be pure glass (white/5)")
