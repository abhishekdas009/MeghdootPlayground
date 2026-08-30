with open("frontend/app/api/warranty-finder/search/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Old logic:
"""
    const candidateConditions = await prisma.warrantyCondition.findMany({
      where: {
        OR: [
          { models: { contains: normalizedModel, mode: 'insensitive' } },
          { models: { contains: strippedModel, mode: 'insensitive' } },
        ]
      },
      orderBy: {
        sourceRow: 'asc' // maintain insertion order / original order
      }
    });
"""

# New logic:
pattern = r'const candidateConditions = await prisma\.warrantyCondition\.findMany\(\{\s*where:\s*\{\s*OR:\s*\[\s*\{\s*models:\s*\{\s*contains:\s*normalizedModel,\s*mode:\s*\'insensitive\'\s*\}\s*\},\s*\{\s*models:\s*\{\s*contains:\s*strippedModel,\s*mode:\s*\'insensitive\'\s*\}\s*\},\s*\]\s*\},\s*orderBy:\s*\{\s*sourceRow:\s*\'asc\'\s*// maintain insertion order / original order\s*\}\s*\}\);'

new_query = """const candidateConditions = await prisma.warrantyCondition.findMany({
      where: {
        modelAliases: {
          hasSome: [normalizedModel, strippedModel].filter(Boolean)
        }
      },
      orderBy: {
        sourceRow: 'asc'
      }
    });"""

content = re.sub(pattern, new_query, content, flags=re.DOTALL)

with open("frontend/app/api/warranty-finder/search/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated search/route.ts candidate query")
