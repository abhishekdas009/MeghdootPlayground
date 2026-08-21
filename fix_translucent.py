import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

# Make cards more translucent by reducing blur in dark mode and adjusting bg
old_card_pattern = r'backdrop-blur-xl dark:border-white/\[0.08\] dark:bg-white/\[0.01\]'
new_card_pattern = r'backdrop-blur-xl dark:backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.03]'

page = re.sub(old_card_pattern, new_card_pattern, page)

# Adjust inner pre blocks
page = page.replace("dark:bg-black/40", "dark:bg-black/20")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)

print("Updated translucent cards")
