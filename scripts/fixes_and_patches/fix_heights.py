import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_class = '"2xl:grid-rows-2 2xl:h-[calc(100vh-120px)]"'
new_class = '"2xl:grid-rows-2 h-full"'

content = content.replace(old_class, new_class)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
