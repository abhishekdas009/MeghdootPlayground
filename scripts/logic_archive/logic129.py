with open("frontend/prisma/schema.prisma", "r", encoding="utf-8") as f:
    content = f.read()

import re
match = re.search(r'model WarrantyCondition \{.*?(?=\nmodel|\Z)', content, re.DOTALL)
if match:
    print(match.group(0))
else:
    print("Not found")
