import sys

file = "frontend/app/formula-generator/page.tsx"
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

import_stmt = 'import { HoverTiltCard } from "@/components/ui/hover-tilt-card";\n'
content = content.replace('import { cn } from "@/lib/utils";', 'import { cn } from "@/lib/utils";\n' + import_stmt)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
