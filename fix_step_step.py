with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
content = re.sub(
    r'STEP \{step\}',
    '{step}',
    content
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
