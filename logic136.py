with open("frontend/app/api/warranty-finder/search/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Remove the matchesWarrantyModel function entirely
content = re.sub(r'function matchesWarrantyModel.*?\n}\n\n', '', content, flags=re.DOTALL)

# Remove the check in the for loop
content = re.sub(r'\s*if \(\!matchesWarrantyModel\(normalizedModel, strippedModel, cond\)\) \{\s*continue;\s*\}', '', content)

with open("frontend/app/api/warranty-finder/search/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Removed matchesWarrantyModel from search/route.ts")
