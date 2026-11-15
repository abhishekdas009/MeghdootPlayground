import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the plain dark mode styling with the enhanced crease/shadow styling
old_style = "dark:border-white/10 dark:bg-slate-950/45"
new_style = "dark:border-white/[0.1] dark:bg-white/[0.02] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)]"

content = content.replace(old_style, new_style)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Standardized card border creases (shadows) for all cards")
