with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

old_str = '<div className="flex flex-wrap items-center gap-3">'
new_str = '<div className="flex flex-wrap items-center gap-3 mt-5 md:mt-6">'

content = content.replace(old_str, new_str)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 94")
