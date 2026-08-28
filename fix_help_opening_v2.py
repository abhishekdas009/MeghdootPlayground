import sys
import re

file = "frontend/app/help/page.tsx"
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the opening tag for the hero banner
content = re.sub(r'<motion\.div\s+initial=\{\{\s*opacity:\s*0,\s*y:\s*-20\s*\}\}\s+animate=\{\{\s*opacity:\s*1,\s*y:\s*0\s*\}\}\s+transition=\{\{\s*duration:\s*0\.5\s*\}\}\s+className="relative flex flex-col gap-6 overflow-hidden rounded-3xl p-8"\s*>', '<HoverTiltCard\n        initial={{ opacity: 0, y: -20 }}\n        animate={{ opacity: 1, y: 0 }}\n        transition={{ duration: 0.5 }}\n        className="relative flex flex-col gap-6 overflow-hidden rounded-3xl p-8"\n      >', content)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
