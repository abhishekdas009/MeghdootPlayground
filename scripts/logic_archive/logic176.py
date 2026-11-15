with open("frontend/components/layout/header.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Replace Playground with AnimatedTitle
pattern_text2 = r'<span className="hidden sm:inline text-\[11px\] font-extrabold tracking-\[0\.15em\] text-muted-foreground/90 uppercase">\s*Playground\s*</span>'
replacement_text2 = r"""<AnimatedTitle text="Playground" className="hidden sm:inline text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground/90 uppercase" />"""

content = re.sub(pattern_text2, replacement_text2, content, flags=re.DOTALL)

with open("frontend/components/layout/header.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated Playground in header")
