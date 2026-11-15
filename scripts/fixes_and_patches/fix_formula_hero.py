import sys

file = "frontend/app/formula-generator/page.tsx"
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

import_stmt = 'import { HoverTiltCard } from "@/components/ui/hover-tilt-card";\n'
content = content.replace('import { Sparkles', import_stmt + 'import { Sparkles')

# We can see the opening div: <div className="page-hero relative flex flex-col gap-4 overflow-hidden rounded-3xl p-8">
# And the closing div is immediately before <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
content = content.replace('<div className="page-hero relative flex flex-col gap-4 overflow-hidden rounded-3xl p-8">', '<HoverTiltCard className="relative flex flex-col gap-4 overflow-hidden rounded-3xl p-8">')

# Replace the closing div 
# Let's use re.sub for the closing div
import re
content = re.sub(r'</div>\s*<div className="grid gap-6 lg:grid-cols-12 lg:gap-8">', r'</HoverTiltCard>\n\n      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">', content)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
