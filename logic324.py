with open("frontend/components/ui/soql-highlighter.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("Prism.highlight(query,", "Prism.highlight(query || \"\",")

with open("frontend/components/ui/soql-highlighter.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added null check in Prism.highlight")
