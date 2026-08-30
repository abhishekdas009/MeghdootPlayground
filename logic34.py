import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Revert the h-[380px] back to h-full so they stretch to fill the grid rows symmetrically
content = content.replace(
    'className="h-[350px] 2xl:h-[380px] min-h-[320px]"',
    'className="h-[350px] 2xl:h-full min-h-[320px]"'
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 34")
