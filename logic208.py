with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()
import re
# Find anything resembling an svg animated border
match = re.search(r'<div className="relative isolate[\s\S]*?<svg[\s\S]*?</svg>', content)
if match:
    print(match.group(0))
else:
    print("Not found")
