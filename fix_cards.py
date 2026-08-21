import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

# Replace main card classes
# From: dark:border-white/10 dark:bg-slate-950/45
# To: dark:border-white/[0.08] dark:bg-white/[0.02] dark:shadow-[0_0_40px_-10px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.02)]

old_card_pattern = r'dark:border-white/10 dark:bg-slate-950/45'
new_card_pattern = r'dark:border-white/[0.08] dark:bg-white/[0.01] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.15),inset_0_0_20px_rgba(255,255,255,0.03)]'

page = re.sub(old_card_pattern, new_card_pattern, page)

# There are also some elements like dark:bg-black/20 inside the cards.
# Replacing them with dark:bg-black/40 dark:shadow-inner for depth.
page = page.replace("dark:bg-black/20", "dark:bg-black/40 dark:border dark:border-white/[0.05]")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)

print("Updated cards")
