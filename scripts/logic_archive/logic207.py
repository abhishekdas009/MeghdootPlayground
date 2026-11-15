with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()
import re
match = re.search(r'<div className="relative isolate flex-1.*?</svg>', content, re.DOTALL)
if match:
    print(match.group(0))
else:
    print("Not found")
