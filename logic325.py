with open("frontend/components/ui/soql-highlighter.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("highlighted || query", "highlighted || query || \"\"")

with open("frontend/components/ui/soql-highlighter.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed dangerouslySetInnerHTML undefined issue")
