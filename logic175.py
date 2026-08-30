with open("frontend/components/layout/header.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add the import for AnimatedTitle
if "AnimatedTitle" not in content:
    content = content.replace('import Image from "next/image";', 'import Image from "next/image";\nimport { AnimatedTitle } from "@/components/ui/animated-title";')

# Replace the Meghdoot Playground text with AnimatedTitle
pattern_text = r'<div className="flex flex-col leading-none pr-4">\s*<span className="text-lg font-extrabold tracking-tight text-foreground">\s*Meghdoot\s*</span>\s*<span className="hidden sm:inline text-\[11px\] font-extrabold tracking-\[0\.15em\] text-muted-foreground/90 uppercase">\s*Playground\s*</span>\s*</div>'
replacement_text = r"""<div className="flex flex-col leading-none pr-4">
                <AnimatedTitle text="Meghdoot" className="text-lg font-extrabold tracking-tight text-foreground" />
                <span className="hidden sm:inline text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground/90 uppercase">
                  Playground
                </span>
              </div>"""

content = re.sub(pattern_text, replacement_text, content, flags=re.DOTALL)

with open("frontend/components/layout/header.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated header.tsx")
