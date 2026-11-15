with open("frontend/components/ui/soql-highlighter.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("query: string;", "query?: string;")

with open("frontend/components/ui/soql-highlighter.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed soql-highlighter types")
