import sys

file = "frontend/app/warranty-finder/page.tsx"
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

import_stmt = '\nimport { TranslucentDatePicker } from "@/components/ui/translucent-date-picker";\n'
content = content.replace('"use client";', '"use client";' + import_stmt)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
