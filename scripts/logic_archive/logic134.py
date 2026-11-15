with open("frontend/app/api/warranty-finder/upload/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re

# We need to add modelAliases: cond.modelAliases
pattern = r'(branches:\s*cond\.branches,\s*\n\s*)(models:\s*cond\.models)'
new_text = r'\1\2,\n          modelAliases: cond.modelAliases'

content = re.sub(pattern, new_text, content)

with open("frontend/app/api/warranty-finder/upload/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated upload/route.ts")
