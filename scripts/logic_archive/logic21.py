import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix CardContent in QueryPreviewCard and others
content = content.replace(
    'CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10"',
    'CardContent className="p-6 pt-5 flex-1 flex flex-col min-h-0 relative z-10"'
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 21")
