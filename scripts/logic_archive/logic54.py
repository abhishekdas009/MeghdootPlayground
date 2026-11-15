with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Remove the save logic
content = re.sub(
    r'if\s*\(\s*selectedTemplate\s*===\s*"1"\s*&&\s*ticketsInput\.trim\(\)\s*\)\s*\{\s*savedTicketsRef\.current\s*=\s*ticketsInput;\s*\}',
    '',
    content
)

# Remove the restore logic
content = re.sub(
    r'if\s*\(\s*value\s*===\s*"1"\s*&&\s*savedTicketsRef\.current\.trim\(\)\s*\)\s*\{\s*setTicketsInput\(savedTicketsRef\.current\);\s*\}',
    '',
    content
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Success 54")
