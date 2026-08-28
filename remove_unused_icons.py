import sys
import re

with open('frontend/components/layout/header.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'\bSun,\s*', '', content)
content = re.sub(r'\bMoon,\s*', '', content)

with open('frontend/components/layout/header.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
