with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
# Change STEP 3 to PASTE HERE
content = re.sub(
    r'step="STEP 3"',
    'step="PASTE HERE"',
    content
)
# Change STEP 5 to PASTE HERE
content = re.sub(
    r'step="STEP 5"',
    'step="PASTE HERE"',
    content
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
