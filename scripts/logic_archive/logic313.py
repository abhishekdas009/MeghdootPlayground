with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("`}`}`} />", "`} />")
content = content.replace('"`}`} />', '"} />')

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed syntax errors.")
