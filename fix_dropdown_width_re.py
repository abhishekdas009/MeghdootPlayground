import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(
    r"width:\s*menuPosition\.width,",
    "minWidth: menuPosition.width, maxWidth: 'calc(100vw - 24px)', width: 'max-content',",
    content
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
