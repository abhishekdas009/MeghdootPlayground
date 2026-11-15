import sys

file = "frontend/app/help/page.tsx"
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import { cn } from "@/lib/utils";', 'import { cn } from "@/lib/utils";\nimport { HoverTiltCard } from "@/components/ui/hover-tilt-card";')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
