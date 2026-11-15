with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Change PASTE HERE to PASTE
content, count = re.subn(r'step="PASTE HERE"', 'step="PASTE"', content)
print(f"Replaced PASTE HERE {count} times.")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
