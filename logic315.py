import re
with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix className={`...`}`} />
content = re.sub(r'className=\{`([^`]+)`\}`\}\} />', r'className={`\1`} />', content)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Regex fixed syntax errors.")
