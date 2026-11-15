import sys

file = "frontend/app/help/page.tsx"
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import if missing
if 'HoverTiltCard' not in content:
    content = content.replace('import { cn } from "@/lib/utils";', 'import { cn } from "@/lib/utils";\nimport { HoverTiltCard } from "@/components/ui/hover-tilt-card";')

# Replace the corrupted closing tag block
# `initial={{ opacity: </HoverTiltCard>le: 0.98 }}` -> `initial={{ opacity: 0, y: 20, scale: 0.98 }}`
content = content.replace('initial={{ opacity: </HoverTiltCard>le: 0.98 }}', 'initial={{ opacity: 0, y: 20, scale: 0.98 }}')

# Replace the opening <motion.div className="page-hero..."
content = content.replace('<motion.div\n        initial={{ opacity: 0, y: -20 }}\n        animate={{ opacity: 1, y: 0 }}\n        transition={{ duration: 0.5 }}\n        className="page-hero relative flex flex-col gap-6 overflow-hidden rounded-3xl p-8"\n      >', '<HoverTiltCard\n        initial={{ opacity: 0, y: -20 }}\n        animate={{ opacity: 1, y: 0 }}\n        transition={{ duration: 0.5 }}\n        className="relative flex flex-col gap-6 overflow-hidden rounded-3xl p-8"\n      >')

# Replace the closing </motion.div>
content = content.replace('      </motion.div>\n\n      <motion.section', '      </HoverTiltCard>\n\n      <motion.section')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
