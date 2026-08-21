import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

old_card_pattern = r'dark:backdrop-blur-md dark:border-white/\[0.08\] dark:bg-white/\[0.03\]'
new_card_pattern = r'dark:backdrop-blur-sm dark:border-white/[0.1] dark:bg-white/[0.02]'

page = re.sub(old_card_pattern, new_card_pattern, page)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)

print("Updated translucent cards to be more transparent")
