with open("frontend/prisma/schema.prisma", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add modelAliases String[] @default([]) before createdAt
pattern = r'(models\s+String\?\s+@map\("Modals__c"\)\s+@db\.Text\s*\n)(\s*createdAt)'
new_text = r'\1  modelAliases     String[]  @default([])\n\2'

content = re.sub(pattern, new_text, content)

# Add @@index([modelAliases], type: Gin)
# Wait, Prisma standard is @@index([modelAliases], type: Gin) for Postgres.
# Wait, Prisma 5+ supports `@@index([modelAliases])` but for GIN it requires `type: Gin` 
# Let's just add @@index([modelAliases]) if we can't use type: Gin.
# Let's check Prisma version in package.json
