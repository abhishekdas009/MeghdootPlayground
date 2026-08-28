with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "const hasQuotes = oldVal.startsWith('\"') && oldVal.endsWith('\"');", 
    "const hasQuotes = (oldVal || '').startsWith('\"') && (oldVal || '').endsWith('\"');"
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
