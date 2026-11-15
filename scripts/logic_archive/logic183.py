with open("frontend/components/ui/animated-title.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Fix getRandomAnimation
content = content.replace('return types[Math.floor(Math.random() * types.length)];', 'return types[Math.floor(Math.random() * types.length)] || types[0];')

with open("frontend/components/ui/animated-title.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed anim undefined error")
