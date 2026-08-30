with open("frontend/prisma/schema.prisma", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add modelAliases String[] @default([]) before createdAt
pattern = r'(models\s+String\?\s+@map\("Modals__c"\)\s+@db\.Text\s*\n)(\s*createdAt)'
new_text = r'\1  modelAliases     String[]  @default([])\n\2'
content = re.sub(pattern, new_text, content)

with open("frontend/prisma/schema.prisma", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated schema.prisma")
