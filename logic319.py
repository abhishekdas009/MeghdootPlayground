with open("frontend/components/ui/soql-highlighter.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("Prism.languages.sql,", "Prism.languages.sql!,")

with open("frontend/components/ui/soql-highlighter.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added non-null assertion.")
