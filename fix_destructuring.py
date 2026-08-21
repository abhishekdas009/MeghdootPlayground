with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

page = page.replace(
    "  onCopy,\n}: {",
    "  onCopy,\n  isExample,\n}: {"
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)

print("Fixed destructuring")
