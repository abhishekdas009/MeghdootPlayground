import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix CardContent in PasteResultCard
content = content.replace(
    'CardContent className="p-4 pt-0 flex-1 flex flex-col gap-4 relative z-10 overflow-hidden"',
    'CardContent className="p-4 pt-0 flex-1 flex flex-col min-h-0 gap-4 relative z-10 overflow-hidden"'
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success 23")
