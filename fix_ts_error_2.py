with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "const line = lines[i];\n    if (!line.trim()) continue;", 
    "const line = lines[i];\n    if (!line || !line.trim()) continue;"
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
